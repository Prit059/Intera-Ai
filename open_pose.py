import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import urllib.request
import os
import time
import json
from collections import deque
from datetime import datetime
import math
import glob
import re
import argparse
import sys

# ── Parse CLI arguments ──
_parser = argparse.ArgumentParser()
_parser.add_argument('--headless', action='store_true',
                     help='Run without OpenCV display window (backend mode)')
_args, _ = _parser.parse_known_args()
HEADLESS = _args.headless

try:
    import pandas as pd
except Exception:
    pd = None

# ──────────────────────────────────────────────────────────────
# HAND GESTURE TRACKER - Draws trails and detects gestures
# ──────────────────────────────────────────────────────────────
class HandGestureTracker:
    """Tracks hands using MediaPipe Hands, draws motion trails, detects gestures"""

    # MediaPipe hand connection pairs (landmark indices) for skeleton drawing
    HAND_CONNECTIONS = [
        (0,1),(1,2),(2,3),(3,4),        # thumb
        (0,5),(5,6),(6,7),(7,8),        # index
        (0,9),(9,10),(10,11),(11,12),   # middle
        (0,13),(13,14),(14,15),(15,16), # ring
        (0,17),(17,18),(18,19),(19,20), # pinky
        (5,9),(9,13),(13,17),           # palm
    ]
    _HAND_MODEL_URL = (
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/"
        "hand_landmarker/float16/1/hand_landmarker.task"
    )
    _HAND_MODEL_PATH = "hand_landmarker.task"

    def __init__(self, max_trail_length=80, trail_fade=True):
        # Download hand model if not present
        if not os.path.exists(self._HAND_MODEL_PATH):
            print(f"[HandTracker] Downloading hand landmarker model...")
            urllib.request.urlretrieve(self._HAND_MODEL_URL, self._HAND_MODEL_PATH)
            print(f"[HandTracker] Model saved to {self._HAND_MODEL_PATH}")

        # New Tasks API for hand landmark detection
        base_options = python.BaseOptions(model_asset_path=self._HAND_MODEL_PATH)
        options = vision.HandLandmarkerOptions(
            base_options=base_options,
            running_mode=vision.RunningMode.VIDEO,
            num_hands=2,
            min_hand_detection_confidence=0.5,
            min_hand_presence_confidence=0.5,
            min_tracking_confidence=0.4,
        )
        self.hands = vision.HandLandmarker.create_from_options(options)
        self._frame_timestamp_ms = 0

        # Trail storage per hand (index 0 = first hand, 1 = second)
        self.trails = {0: deque(maxlen=max_trail_length),
                       1: deque(maxlen=max_trail_length)}
        self.trail_fade = trail_fade
        self.max_trail_length = max_trail_length

        # Gesture history
        self.gesture_history = {0: deque(maxlen=30), 1: deque(maxlen=30)}
        self.prev_positions = {0: None, 1: None}
        self.movement_speeds = {0: deque(maxlen=20), 1: deque(maxlen=20)}

        # Drawing canvas (persistent lines)
        self.canvas = None
        self.drawing_mode = True  # Toggle drawing trails on/off

        # Gesture labels
        self.current_gestures = {0: "Unknown", 1: "Unknown"}

        # Hand detection results cache
        self.last_hand_results = None
        self.hand_landmarks_list = []
        self.hand_count = 0

        # Fidget / nervous counters
        self.fidget_count = 0
        self.rapid_movement_count = 0
        self.hand_near_face_frames = 0

        # Colors for each hand trail
        self.trail_colors = {
            0: [(0, 255, 200), (0, 200, 255), (100, 255, 100)],  # Cyan-ish
            1: [(255, 150, 0), (255, 200, 50), (200, 100, 255)]  # Orange-ish
        }

    def _init_canvas(self, h, w):
        if self.canvas is None or self.canvas.shape[:2] != (h, w):
            self.canvas = np.zeros((h, w, 3), dtype=np.uint8)

    def detect_hands(self, frame_rgb):
        """Run MediaPipe Hands detection using Tasks API"""
        self._frame_timestamp_ms += 33  # ~30fps
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
        result = self.hands.detect_for_video(mp_image, self._frame_timestamp_ms)
        self.last_hand_results = result
        self.hand_landmarks_list = []
        self.hand_count = 0

        if result and result.hand_landmarks:
            # Wrap each hand's landmarks in a simple object with a .landmark list
            # so the rest of the code works unchanged
            class _LandmarkList:
                def __init__(self, lms):
                    self.landmark = lms
            self.hand_landmarks_list = [_LandmarkList(lms) for lms in result.hand_landmarks]
            self.hand_count = len(self.hand_landmarks_list)

        return self.hand_count

    def get_fingertip_positions(self, hand_landmarks, w, h):
        """Get positions of all 5 fingertips"""
        tips = {}
        tip_ids = {
            'thumb': 4, 'index': 8, 'middle': 12,
            'ring': 16, 'pinky': 20
        }
        for name, idx in tip_ids.items():
            lm = hand_landmarks.landmark[idx]
            tips[name] = (int(lm.x * w), int(lm.y * h))
        return tips

    def get_wrist_position(self, hand_landmarks, w, h):
        """Get wrist position"""
        lm = hand_landmarks.landmark[0]
        return (int(lm.x * w), int(lm.y * h))

    def get_palm_center(self, hand_landmarks, w, h):
        """Get approximate palm center"""
        # Average of wrist(0), index_mcp(5), middle_mcp(9), ring_mcp(13), pinky_mcp(17)
        indices = [0, 5, 9, 13, 17]
        cx = int(np.mean([hand_landmarks.landmark[i].x for i in indices]) * w)
        cy = int(np.mean([hand_landmarks.landmark[i].y for i in indices]) * h)
        return (cx, cy)

    def classify_gesture(self, hand_landmarks, w, h):
        """Classify hand gesture based on finger positions"""
        tips = self.get_fingertip_positions(hand_landmarks, w, h)
        wrist = self.get_wrist_position(hand_landmarks, w, h)

        # Get MCP (base) joints for comparison
        mcp_ids = {'index': 5, 'middle': 9, 'ring': 13, 'pinky': 17}
        pip_ids = {'index': 6, 'middle': 10, 'ring': 14, 'pinky': 18}

        fingers_up = []

        # Thumb: compare x position relative to thumb IP joint
        thumb_tip = hand_landmarks.landmark[4]
        thumb_ip = hand_landmarks.landmark[3]
        thumb_mcp = hand_landmarks.landmark[2]
        # Use x-distance for thumb (works for both left/right hand)
        if abs(thumb_tip.x - thumb_mcp.x) > abs(thumb_ip.x - thumb_mcp.x):
            fingers_up.append(True)
        else:
            fingers_up.append(False)

        # Other fingers: tip y < pip y means finger is up
        for finger in ['index', 'middle', 'ring', 'pinky']:
            tip_y = hand_landmarks.landmark[
                {'index': 8, 'middle': 12, 'ring': 16, 'pinky': 20}[finger]
            ].y
            pip_y = hand_landmarks.landmark[pip_ids[finger]].y
            fingers_up.append(tip_y < pip_y)

        count_up = sum(fingers_up)

        # Gesture classification
        if count_up == 0:
            return "Fist", fingers_up, count_up
        elif count_up == 5:
            return "Open Palm", fingers_up, count_up
        elif fingers_up == [False, True, False, False, False]:
            return "Pointing", fingers_up, count_up
        elif fingers_up == [False, True, True, False, False]:
            return "Peace/Victory", fingers_up, count_up
        elif fingers_up == [True, False, False, False, False]:
            return "Thumbs Up", fingers_up, count_up
        elif fingers_up == [True, True, False, False, True]:
            return "Rock On", fingers_up, count_up
        elif fingers_up == [False, True, True, True, False]:
            return "Three", fingers_up, count_up
        elif fingers_up == [False, True, True, True, True]:
            return "Four", fingers_up, count_up
        else:
            return f"Custom ({count_up} up)", fingers_up, count_up

    def calculate_hand_movement(self, hand_idx, current_pos):
        """Calculate movement speed for a hand"""
        speed = 0
        if self.prev_positions[hand_idx] is not None:
            dx = current_pos[0] - self.prev_positions[hand_idx][0]
            dy = current_pos[1] - self.prev_positions[hand_idx][1]
            speed = math.sqrt(dx * dx + dy * dy)
            self.movement_speeds[hand_idx].append(speed)

            if speed > 40:
                self.rapid_movement_count += 1

        self.prev_positions[hand_idx] = current_pos
        return speed

    def check_hand_near_face(self, palm_center, face_center, face_width):
        """Check if hand is near face region"""
        if face_center is None or face_width is None:
            return False
        dist = math.sqrt(
            (palm_center[0] - face_center[0]) ** 2 +
            (palm_center[1] - face_center[1]) ** 2
        )
        threshold = face_width * 0.8
        return dist < threshold

    def update_trail(self, hand_idx, index_tip_pos):
        """Add point to trail for drawing"""
        self.trails[hand_idx].append(index_tip_pos)

    def draw_hand_skeleton(self, frame, hand_landmarks, hand_idx):
        """Draw MediaPipe hand skeleton with custom styling"""
        h, w, _ = frame.shape

        # Custom connection drawing
        connections = self.HAND_CONNECTIONS
        for connection in connections:
            start_idx, end_idx = connection
            start = hand_landmarks.landmark[start_idx]
            end = hand_landmarks.landmark[end_idx]

            x1, y1 = int(start.x * w), int(start.y * h)
            x2, y2 = int(end.x * w), int(end.y * h)

            if 0 <= x1 < w and 0 <= y1 < h and 0 <= x2 < w and 0 <= y2 < h:
                color = self.trail_colors[hand_idx % 2][0]
                cv2.line(frame, (x1, y1), (x2, y2), color, 2, cv2.LINE_AA)

        # Draw landmarks as dots
        for i, lm in enumerate(hand_landmarks.landmark):
            x, y = int(lm.x * w), int(lm.y * h)
            if 0 <= x < w and 0 <= y < h:
                # Fingertips get bigger dots
                if i in [4, 8, 12, 16, 20]:
                    cv2.circle(frame, (x, y), 6,
                               self.trail_colors[hand_idx % 2][1], -1)
                    cv2.circle(frame, (x, y), 3, (255, 255, 255), -1)
                else:
                    cv2.circle(frame, (x, y), 3,
                               self.trail_colors[hand_idx % 2][2], -1)

    def draw_trails(self, frame):
        """Draw motion trails for all tracked hands"""
        h, w, _ = frame.shape
        self._init_canvas(h, w)

        for hand_idx in range(2):
            trail = self.trails[hand_idx]
            if len(trail) < 2:
                continue

            colors = self.trail_colors[hand_idx % 2]
            trail_list = list(trail)

            for i in range(1, len(trail_list)):
                if trail_list[i - 1] is None or trail_list[i] is None:
                    continue

                # Fade effect - older points are thinner and dimmer
                if self.trail_fade:
                    alpha = i / len(trail_list)
                    thickness = max(1, int(alpha * 4))
                    color_intensity = alpha
                else:
                    thickness = 2
                    color_intensity = 1.0

                color = tuple(int(c * color_intensity) for c in colors[0])
                pt1 = trail_list[i - 1]
                pt2 = trail_list[i]

                # Bounds check
                if (0 <= pt1[0] < w and 0 <= pt1[1] < h and
                        0 <= pt2[0] < w and 0 <= pt2[1] < h):
                    cv2.line(frame, pt1, pt2, color, thickness, cv2.LINE_AA)

                    # Also draw on persistent canvas
                    if self.drawing_mode:
                        cv2.line(self.canvas, pt1, pt2, color, max(1, thickness - 1),
                                 cv2.LINE_AA)

        # Blend persistent canvas onto frame
        if self.drawing_mode and self.canvas is not None:
            # Fade canvas slightly each frame for trail decay
            self.canvas = (self.canvas * 0.97).astype(np.uint8)
            mask = self.canvas.astype(np.float32) / 255.0
            frame_float = frame.astype(np.float32)
            blended = frame_float + self.canvas.astype(np.float32) * 0.4
            np.clip(blended, 0, 255, out=blended)
            frame[:] = blended.astype(np.uint8)

    def draw_gesture_label(self, frame, hand_landmarks, hand_idx, gesture_name, w, h):
        """Draw gesture label near the hand"""
        wrist = self.get_wrist_position(hand_landmarks, w, h)
        label_pos = (wrist[0] - 40, wrist[1] + 30)

        # Background rectangle
        text_size = cv2.getTextSize(gesture_name, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
        bg_x1 = label_pos[0] - 5
        bg_y1 = label_pos[1] - text_size[1] - 5
        bg_x2 = label_pos[0] + text_size[0] + 5
        bg_y2 = label_pos[1] + 5

        bg_x1 = max(0, bg_x1)
        bg_y1 = max(0, bg_y1)
        bg_x2 = min(w, bg_x2)
        bg_y2 = min(h, bg_y2)

        overlay = frame.copy()
        cv2.rectangle(overlay, (bg_x1, bg_y1), (bg_x2, bg_y2), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)

        color = self.trail_colors[hand_idx % 2][0]
        cv2.putText(frame, gesture_name, label_pos,
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2, cv2.LINE_AA)

    def process_frame(self, frame, frame_rgb, face_center=None, face_width=None):
        """
        Full hand processing pipeline for one frame.
        Returns: hand_count, hand_info_list, is_any_near_face, is_excessive_movement
        """
        h, w, _ = frame.shape
        num_hands = self.detect_hands(frame_rgb)

        is_any_near_face = False
        is_excessive_movement = False
        hand_info_list = []

        if num_hands > 0:
            for idx, hand_lm in enumerate(self.hand_landmarks_list):
                if idx > 1:
                    break  # max 2 hands

                # Positions
                tips = self.get_fingertip_positions(hand_lm, w, h)
                palm = self.get_palm_center(hand_lm, w, h)
                index_tip = tips['index']

                # Gesture
                gesture_name, fingers_up, count_up = self.classify_gesture(
                    hand_lm, w, h)
                self.current_gestures[idx] = gesture_name

                # Movement
                speed = self.calculate_hand_movement(idx, palm)

                # Trail
                self.update_trail(idx, index_tip)

                # Near face check
                near_face = self.check_hand_near_face(palm, face_center, face_width)
                if near_face:
                    is_any_near_face = True
                    self.hand_near_face_frames += 1

                # Excessive movement check
                if len(self.movement_speeds[idx]) > 5:
                    avg_speed = np.mean(list(self.movement_speeds[idx])[-10:])
                    if avg_speed > 25:
                        is_excessive_movement = True
                        self.fidget_count += 1

                # Draw skeleton
                self.draw_hand_skeleton(frame, hand_lm, idx)

                # Draw gesture label
                self.draw_gesture_label(frame, hand_lm, idx, gesture_name, w, h)

                hand_info_list.append({
                    'index': idx,
                    'gesture': gesture_name,
                    'fingers_up': fingers_up,
                    'count_up': count_up,
                    'palm_center': palm,
                    'speed': speed,
                    'near_face': near_face,
                })
        else:
            # Clear trails gradually when no hands detected
            for idx in range(2):
                if len(self.trails[idx]) > 0:
                    self.trails[idx].popleft() if len(self.trails[idx]) > 0 else None
                self.prev_positions[idx] = None

        # Draw trails
        self.draw_trails(frame)

        return num_hands, hand_info_list, is_any_near_face, is_excessive_movement

    def clear_canvas(self):
        """Clear the drawing canvas"""
        if self.canvas is not None:
            self.canvas[:] = 0

    def release(self):
        self.hands.close()


# ──────────────────────────────────────────────────────────────
# MULTI-FACE DETECTOR - Persistent warning system
# ──────────────────────────────────────────────────────────────
class MultiFaceWarningSystem:
    """Manages multi-face detection warnings with persistent display"""

    def __init__(self, warning_cooldown_frames=90, alert_duration_frames=60):
        self.multi_face_detected = False
        self.multi_face_count = 0
        self.warning_timer = 0
        self.alert_duration = alert_duration_frames
        self.cooldown = warning_cooldown_frames
        self.total_multi_face_events = 0
        self.multi_face_timestamps = []
        self.warning_flash_counter = 0
        self.consecutive_multi_face = 0
        self.violation_level = 0  # 0=none, 1=warning, 2=alert, 3=critical

    def update(self, num_faces, frame_counter):
        """Update multi-face state"""
        if num_faces > 1:
            self.multi_face_detected = True
            self.multi_face_count = num_faces
            self.warning_timer = self.alert_duration
            self.consecutive_multi_face += 1
            self.total_multi_face_events += 1
            self.multi_face_timestamps.append(frame_counter)

            # Escalate violation level
            if self.consecutive_multi_face > 90:  # ~3 seconds
                self.violation_level = 3
            elif self.consecutive_multi_face > 30:  # ~1 second
                self.violation_level = 2
            else:
                self.violation_level = 1
        else:
            self.consecutive_multi_face = 0
            if self.warning_timer > 0:
                self.warning_timer -= 1
            else:
                self.multi_face_detected = False
                self.violation_level = 0

        self.warning_flash_counter += 1

    def draw_warning(self, frame, w, h):
        """Draw multi-face warning overlay"""
        if not self.multi_face_detected and self.warning_timer <= 0:
            return

        flash = (self.warning_flash_counter % 20) < 12

        if self.violation_level >= 3:
            # CRITICAL - Red flashing border
            border_color = (0, 0, 255) if flash else (0, 0, 180)
            border_thickness = 8
            cv2.rectangle(frame, (0, 0), (w - 1, h - 1), border_color, border_thickness)

            # Large center warning
            overlay = frame.copy()
            cv2.rectangle(overlay, (w // 2 - 350, h // 2 - 100),
                          (w // 2 + 350, h // 2 + 100), (0, 0, 0), -1)
            cv2.addWeighted(overlay, 0.8, frame, 0.2, 0, frame)

            cv2.putText(frame, "CRITICAL: MULTIPLE FACES",
                        (w // 2 - 300, h // 2 - 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.3, (0, 0, 255), 3)
            cv2.putText(frame, f"DETECTED {self.multi_face_count} FACES - VIOLATION!",
                        (w // 2 - 300, h // 2 + 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
            cv2.putText(frame, "Only ONE person should be on camera!",
                        (w // 2 - 280, h // 2 + 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 100, 255), 2)
            cv2.putText(frame, "This will be flagged in the report.",
                        (w // 2 - 250, h // 2 + 80),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (100, 100, 255), 2)

        elif self.violation_level >= 2:
            # ALERT - Orange border
            border_color = (0, 140, 255) if flash else (0, 100, 200)
            cv2.rectangle(frame, (0, 0), (w - 1, h - 1), border_color, 5)

            overlay = frame.copy()
            cv2.rectangle(overlay, (w // 2 - 320, h // 2 - 80),
                          (w // 2 + 320, h // 2 + 80), (0, 0, 0), -1)
            cv2.addWeighted(overlay, 0.75, frame, 0.25, 0, frame)

            cv2.putText(frame, "ALERT: ANOTHER FACE DETECTED",
                        (w // 2 - 280, h // 2 - 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 140, 255), 3)
            cv2.putText(frame, f"{self.multi_face_count} faces on camera - Only 1 allowed!",
                        (w // 2 - 280, h // 2 + 15),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 165, 255), 2)
            cv2.putText(frame, "Please ensure only you are visible.",
                        (w // 2 - 230, h // 2 + 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 200, 200), 2)

        elif self.violation_level >= 1:
            # WARNING - Yellow indicator
            overlay = frame.copy()
            cv2.rectangle(overlay, (w // 2 - 280, 10),
                          (w // 2 + 280, 70), (0, 0, 0), -1)
            cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)

            warn_color = (0, 255, 255) if flash else (0, 200, 200)
            cv2.putText(frame, f"WARNING: {self.multi_face_count} faces detected!",
                        (w // 2 - 250, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, warn_color, 2)

        elif self.warning_timer > 0:
            # Fading warning after faces disappear
            alpha = self.warning_timer / self.alert_duration
            warn_text = "Multiple face event recorded"
            cv2.putText(frame, warn_text, (w // 2 - 200, 35),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7,
                        (0, int(200 * alpha), int(255 * alpha)), 2)

    def get_summary(self):
        return {
            'total_events': self.total_multi_face_events,
            'timestamps': self.multi_face_timestamps.copy(),
            'max_violation_level': self.violation_level,
        }


# ──────────────────────────────────────────────────────────────
# FUTURISTIC FACE VISUALIZER (kept from original, minor tweaks)
# ──────────────────────────────────────────────────────────────
class FuturisticFaceVisualizer:
    """Renders futuristic face scanning visualization with particle effects"""

    def __init__(self):
        self.animation_frame = 0
        self.particles = []
        self.scan_wave_position = 0

    def draw_holographic_grid(self, frame, x_min, y_min, x_max, y_max, alpha=0.01):
        overlay = frame.copy()
        grid_spacing = 20
        for x in range(x_min, x_max, grid_spacing):
            cv2.line(overlay, (x, y_min), (x, y_max), (0, 255, 100), 1)
        for y in range(y_min, y_max, grid_spacing):
            cv2.line(overlay, (x_min, y), (x_max, y), (0, 255, 100), 1)
        cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)

    def draw_glowing_landmark(self, frame, x, y, confidence, frame_count,
                              color=(0, 255, 100)):
        pulse = 3 + 2.5 * (1 + math.sin(frame_count * 0.1)) / 2.0
        brightness_factor = 0.7 + 0.3 * (1 + math.cos(frame_count * 0.08)) / 2.0
        glow_color = tuple(int(c * brightness_factor) for c in color)
        glow_radius = int(pulse * 1.8)
        overlay = frame.copy()
        cv2.circle(overlay, (x, y), glow_radius, glow_color, -1)
        cv2.addWeighted(overlay, 0.05, frame, 0.95, 0, frame)
        cv2.circle(frame, (x, y), int(pulse * 0.5), glow_color, -1)
        cv2.circle(frame, (x, y), max(1, int(pulse * 0.15)), (255, 255, 255), -1)

    def draw_facial_wireframe(self, frame, landmarks, w, h, frame_count):
        connections = [
            (33, 133), (33, 159), (159, 145), (145, 133),
            (263, 362), (263, 386), (386, 374), (374, 362),
            (70, 63), (63, 105), (105, 66), (66, 107),
            (300, 293), (293, 334), (334, 296), (296, 336),
            (1, 4), (4, 5), (5, 195), (195, 4),
            (61, 146), (146, 91), (91, 181), (181, 61),
            (10, 338), (338, 297), (297, 273), (273, 152),
            (152, 58), (58, 172), (172, 10),
        ]
        wave_effect = (1 + math.sin(frame_count * 0.15)) / 2.0
        color = (int(200 * wave_effect), 255, int(150 - 50 * wave_effect))
        for start_idx, end_idx in connections:
            try:
                start = landmarks[start_idx]
                end = landmarks[end_idx]
                x1, y1 = int(start.x * w), int(start.y * h)
                x2, y2 = int(end.x * w), int(end.y * h)
                overlay = frame.copy()
                cv2.line(overlay, (x1, y1), (x2, y2), color, 1)
                cv2.addWeighted(overlay, 0.12, frame, 0.88, 0, frame)
            except:
                pass

    def draw_scanning_wave(self, frame, landmarks, w, h,
                           x_min, y_min, x_max, y_max, frame_count):
        wave_position = (frame_count % 300) / 300.0
        wave_x = x_min + (x_max - x_min) * wave_position
        wave_color = (0, 255, 200)
        cv2.line(frame, (int(wave_x), y_min), (int(wave_x), y_max), wave_color, 3)
        overlay = frame.copy()
        wave_width = 30
        cv2.rectangle(overlay, (int(wave_x - wave_width), y_min),
                      (int(wave_x + wave_width), y_max), wave_color, -1)
        cv2.addWeighted(overlay, 0.03, frame, 0.97, 0, frame)

    def update_particles(self, landmarks, w, h):
        if self.animation_frame % 5 == 0 and len(self.particles) < 100:
            random_idx = np.random.randint(0, len(landmarks))
            landmark = landmarks[random_idx]
            x, y = int(landmark.x * w), int(landmark.y * h)
            angle = np.random.uniform(0, 2 * math.pi)
            speed = np.random.uniform(1, 3)
            self.particles.append({
                'x': x, 'y': y,
                'vx': speed * math.cos(angle),
                'vy': speed * math.sin(angle),
                'life': 255, 'age': 0
            })
        new_particles = []
        for p in self.particles:
            p['x'] += p['vx']
            p['y'] += p['vy']
            p['age'] += 1
            p['life'] = max(0, 255 - p['age'] * 5)
            if p['life'] > 0:
                new_particles.append(p)
        self.particles = new_particles

    def draw_particles(self, frame):
        for p in self.particles:
            if p['life'] > 0:
                alpha = p['life'] / 255.0
                overlay = frame.copy()
                color = (0, int(255 * alpha), int(200 * alpha))
                cv2.circle(overlay, (int(p['x']), int(p['y'])), 1, color, -1)
                cv2.addWeighted(overlay, alpha * 0.2, frame, 1 - alpha * 0.2, 0, frame)

    def get_adaptive_color(self, confidence, engagement, frame_count):
        combined_score = (confidence + engagement) / 2
        hue_shift = math.sin(frame_count * 0.02) * 0.2
        if combined_score >= 75:
            return (150, 255, 100) if hue_shift > 0 else (0, 255, 100)
        elif combined_score >= 60:
            return (0, 255, 120)
        elif combined_score >= 45:
            return (100, 220, 100)
        elif combined_score >= 30:
            return (150, 180, 50)
        else:
            return (0, 165, 255)

    def draw_futuristic_face_mesh(self, frame, landmarks, w, h,
                                  confidence, engagement, face_region):
        x_min, y_min, x_max, y_max = face_region
        self.animation_frame += 1
        mesh_color = self.get_adaptive_color(confidence, engagement,
                                             self.animation_frame)
        self.draw_holographic_grid(frame, x_min, y_min, x_max, y_max)
        self.draw_facial_wireframe(frame, landmarks, w, h, self.animation_frame)

        key_landmarks = [
            10, 152, 58, 172, 33, 133, 159, 145,
            263, 362, 386, 374, 1, 4, 5, 195,
            61, 146, 91, 181, 70, 63, 105, 66, 107,
            300, 293, 334, 296, 336, 468, 473
        ]
        for idx in key_landmarks:
            try:
                landmark = landmarks[idx]
                x, y = int(landmark.x * w), int(landmark.y * h)
                if 0 <= x < w and 0 <= y < h:
                    self.draw_glowing_landmark(frame, x, y, 0.9,
                                               self.animation_frame,
                                               color=mesh_color)
            except:
                pass

        self.draw_scanning_wave(frame, landmarks, w, h,
                                x_min, y_min, x_max, y_max,
                                self.animation_frame)
        self.update_particles(landmarks, w, h)
        self.draw_particles(frame)

        border_color = mesh_color
        corner_size = 30
        corners = [
            ((x_min, y_min), (x_min + corner_size, y_min),
             (x_min, y_min + corner_size)),
            ((x_max, y_min), (x_max - corner_size, y_min),
             (x_max, y_min + corner_size)),
            ((x_min, y_max), (x_min + corner_size, y_max),
             (x_min, y_max - corner_size)),
            ((x_max, y_max), (x_max - corner_size, y_max),
             (x_max, y_max - corner_size)),
        ]
        for corner, p1, p2 in corners:
            cv2.line(frame, corner, p1, border_color, 3)
            cv2.line(frame, corner, p2, border_color, 3)


# ──────────────────────────────────────────────────────────────
# ADVANCED INTERVIEW DETECTOR (enhanced with real hand data)
# ──────────────────────────────────────────────────────────────
class AdvancedInterviewDetector:
    def __init__(self):
        self.session_start = datetime.now()
        self.metrics_log = []
        self.frame_count = 0

        self.blink_count = 0
        self.prev_eye_closed = False
        self.eye_history = deque(maxlen=30)
        self.mouth_history = deque(maxlen=30)
        self.head_history = deque(maxlen=30)
        self.blendshape_history = deque(maxlen=30)
        self.head_movement_history = deque(maxlen=30)
        self.prev_head_pose = None
        self.excessive_head_movement_count = 0
        self.poor_eye_contact_count = 0
        self.gaze_history = deque(maxlen=30)
        self.prev_gaze = None
        self.gaze_shift_count = 0
        self.face_off_center_count = 0
        self.offcenter_history = deque(maxlen=30)

        self.hand_visibility_history = deque(maxlen=30)
        self.hand_movement_history = deque(maxlen=30)
        self.left_hand_prev_pos = None
        self.right_hand_prev_pos = None
        self.excessive_hand_movement_count = 0
        self.hand_near_face_count = 0
        self.nervous_hand_behavior_count = 0
        self.hand_confidence_scores = deque(maxlen=30)

    def log_metrics(self, confidence, engagement, eye_ratio, mouth_ratio,
                    head_pose, blink_rate):
        current_time = (datetime.now() - self.session_start).total_seconds()
        if (len(self.metrics_log) == 0 or
                current_time - self.metrics_log[-1]['timestamp'] >= 10):
            self.metrics_log.append({
                'timestamp': current_time,
                'confidence': confidence,
                'engagement': engagement,
                'eye_ratio': eye_ratio,
                'mouth_ratio': mouth_ratio,
                'head_pose': head_pose,
                'blink_rate': blink_rate,
                'frame': self.frame_count
            })

    def get_eye_aspect_ratio(self, landmarks):
        try:
            left_eye_top = np.array([landmarks[159].x, landmarks[159].y])
            left_eye_bottom = np.array([landmarks[145].x, landmarks[145].y])
            left_eye_left = np.array([landmarks[33].x, landmarks[33].y])
            left_eye_right = np.array([landmarks[133].x, landmarks[133].y])

            right_eye_top = np.array([landmarks[386].x, landmarks[386].y])
            right_eye_bottom = np.array([landmarks[374].x, landmarks[374].y])
            right_eye_left = np.array([landmarks[263].x, landmarks[263].y])
            right_eye_right = np.array([landmarks[362].x, landmarks[362].y])

            left_v = np.linalg.norm(left_eye_top - left_eye_bottom)
            left_h = np.linalg.norm(left_eye_left - left_eye_right)
            left_ratio = left_v / (left_h + 0.001) if left_h > 0 else 0.3

            right_v = np.linalg.norm(right_eye_top - right_eye_bottom)
            right_h = np.linalg.norm(right_eye_left - right_eye_right)
            right_ratio = right_v / (right_h + 0.001) if right_h > 0 else 0.3

            avg_ratio = (left_ratio + right_ratio) / 2.0
            return min(1.0, max(0, avg_ratio))
        except:
            return 0.4

    def get_gaze_direction(self, landmarks):
        try:
            left_iris = np.array([landmarks[468].x, landmarks[468].y])
            right_iris = np.array([landmarks[473].x, landmarks[473].y])

            left_eye_left = np.array([landmarks[33].x, landmarks[33].y])
            left_eye_right = np.array([landmarks[133].x, landmarks[133].y])
            right_eye_left = np.array([landmarks[263].x, landmarks[263].y])
            right_eye_right = np.array([landmarks[362].x, landmarks[362].y])

            left_gaze = ((left_iris[0] - left_eye_left[0]) /
                         (left_eye_right[0] - left_eye_left[0] + 0.001))
            right_gaze = ((right_iris[0] - right_eye_left[0]) /
                          (right_eye_right[0] - right_eye_left[0] + 0.001))

            left_center_dev = abs(left_gaze - 0.5) * 2
            right_center_dev = abs(right_gaze - 0.5) * 2

            gaze_score = max(0, 1.0 - min(1.0,
                                           (left_center_dev + right_center_dev) / 2.0))
            return gaze_score
        except:
            return 0.5

    def get_mouth_ratio(self, landmarks):
        try:
            mouth_top = np.array([landmarks[13].x, landmarks[13].y])
            mouth_bottom = np.array([landmarks[14].x, landmarks[14].y])
            mouth_left = np.array([landmarks[61].x, landmarks[61].y])
            mouth_right = np.array([landmarks[291].x, landmarks[291].y])

            vertical = np.linalg.norm(mouth_top - mouth_bottom)
            horizontal = np.linalg.norm(mouth_left - mouth_right)
            ratio = vertical / (horizontal + 0.001)
            return min(1.0, max(0, ratio))
        except:
            return 0.1

    def get_head_pose(self, landmarks):
        try:
            nose = np.array([landmarks[1].x, landmarks[1].y, landmarks[1].z])
            left_eye = np.array([landmarks[33].x, landmarks[33].y,
                                 landmarks[33].z])
            right_eye = np.array([landmarks[263].x, landmarks[263].y,
                                  landmarks[263].z])
            chin = np.array([landmarks[152].x, landmarks[152].y,
                             landmarks[152].z])

            eye_center = (left_eye + right_eye) / 2
            vertical_vec = chin - eye_center
            horizontal_vec = right_eye - left_eye

            pitch = abs(np.arctan2(vertical_vec[1],
                                   np.linalg.norm(vertical_vec[:2])))
            yaw = abs(np.arctan2(horizontal_vec[0], horizontal_vec[2]))

            total_deviation = min(1.0, (pitch + yaw) / 1.5)
            return total_deviation
        except:
            return 0.3

    def detect_head_movement(self, landmarks):
        try:
            left_eye = np.array([landmarks[33].x, landmarks[33].y,
                                 landmarks[33].z])
            right_eye = np.array([landmarks[263].x, landmarks[263].y,
                                  landmarks[263].z])
            chin = np.array([landmarks[152].x, landmarks[152].y,
                             landmarks[152].z])

            eye_center = (left_eye + right_eye) / 2
            vertical_vec = chin - eye_center
            horizontal_vec = right_eye - left_eye

            pitch = np.arctan2(vertical_vec[1],
                               np.linalg.norm(vertical_vec[:2]))
            yaw = np.arctan2(horizontal_vec[0], horizontal_vec[2])

            pitch_deg = abs(np.degrees(pitch))
            yaw_deg = abs(np.degrees(yaw))
            current_pose = (pitch_deg, yaw_deg)

            is_excessive = False
            if self.prev_head_pose is not None:
                pitch_change = abs(current_pose[0] - self.prev_head_pose[0])
                yaw_change = abs(current_pose[1] - self.prev_head_pose[1])
                if pitch_change > 20 or yaw_change > 20:
                    is_excessive = True
                    self.excessive_head_movement_count += 1

            self.prev_head_pose = current_pose
            self.head_movement_history.append(is_excessive)
            return is_excessive
        except:
            return False

    def detect_poor_eye_contact(self, gaze_score):
        try:
            poor_contact = gaze_score < 0.4
            if poor_contact:
                self.poor_eye_contact_count += 1
            self.gaze_history.append(gaze_score)
            return poor_contact
        except:
            return False

    def calculate_confidence_with_hand_analysis(self, eye_ratio, gaze_direction,
                                                head_pose, hand_confidence,
                                                hand_near_face):
        eye_openness_score = max(0, min(100, (eye_ratio - 0.20) / 0.30 * 100))
        gaze_score = gaze_direction * 100
        head_posture_score = max(0, 100 - (head_pose * 100))

        hand_posture_penalty = 15 if hand_near_face else 0
        hand_posture_score = max(0, hand_confidence - hand_posture_penalty)

        confidence = int((
                eye_openness_score * 0.35 +
                gaze_score * 0.30 +
                head_posture_score * 0.20 +
                hand_posture_score * 0.15
        ))
        return max(0, min(100, confidence))

    def calculate_metrics(self, landmarks, blendshapes=None,
                          frame_width=640, frame_height=480,
                          hand_near_face=False,
                          excessive_hand_movement=False,
                          hand_confidence=85):
        """Calculate Confidence and Engagement scores"""
        eye_ratio = self.get_eye_aspect_ratio(landmarks)
        mouth_ratio = self.get_mouth_ratio(landmarks)
        head_pose = self.get_head_pose(landmarks)
        gaze_direction = self.get_gaze_direction(landmarks)

        # Blink detection
        if eye_ratio < 0.18:
            if not self.prev_eye_closed:
                self.blink_count += 1
            self.prev_eye_closed = True
        else:
            self.prev_eye_closed = False

        # Gaze shifts
        gaze_shifted = False
        try:
            if (self.prev_gaze is not None and
                    abs(gaze_direction - self.prev_gaze) > 0.25):
                self.gaze_shift_count += 1
                gaze_shifted = True
        except:
            pass
        self.prev_gaze = gaze_direction

        excessive_head_movement = self.detect_head_movement(landmarks)
        poor_eye_contact = self.detect_poor_eye_contact(gaze_direction)

        # Track hand-related counters
        if hand_near_face:
            self.hand_near_face_count += 1
        if excessive_hand_movement:
            self.excessive_hand_movement_count += 1
            self.nervous_hand_behavior_count += 1

        self.hand_confidence_scores.append(hand_confidence)
        self.hand_visibility_history.append(True)
        self.hand_movement_history.append(excessive_hand_movement)

        confidence = self.calculate_confidence_with_hand_analysis(
            eye_ratio, gaze_direction, head_pose,
            hand_confidence, hand_near_face
        )

        # Engagement
        avg_mouth = (np.mean(list(self.mouth_history))
                     if len(self.mouth_history) > 5 else 0.05)
        mouth_engagement = min(100, max(0, (avg_mouth - 0.02) / 0.15 * 100))

        avg_head = (np.mean(list(self.head_history))
                    if len(self.head_history) > 5 else 0.1)
        if avg_head < 0.05:
            head_engagement = 30
        elif avg_head > 0.4:
            head_engagement = 40
        else:
            head_engagement = 100

        hand_movement_penalty = 20 if excessive_hand_movement else 0
        hand_engagement = max(30, 85 - hand_movement_penalty)

        blink_rate = ((self.blink_count / max(1, self.frame_count / 30))
                      if self.frame_count > 0 else 0)
        if blink_rate < 10:
            blink_engagement = 50
        elif blink_rate > 25:
            blink_engagement = 50
        else:
            blink_engagement = 100

        engagement = int((
                mouth_engagement * 0.30 +
                head_engagement * 0.25 +
                blink_engagement * 0.25 +
                hand_engagement * 0.20
        ))
        engagement = max(0, min(100, engagement))

        self.log_metrics(confidence, engagement, eye_ratio, mouth_ratio,
                         head_pose, blink_rate)
        self.mouth_history.append(mouth_ratio)
        self.head_history.append(head_pose)

        return (
            confidence, engagement,
            excessive_head_movement, poor_eye_contact,
            excessive_hand_movement, hand_near_face,
            gaze_direction, eye_ratio, mouth_ratio,
            blink_rate, gaze_shifted,
        )

    def get_color(self, confidence, engagement):
        combined = (confidence + engagement) / 2
        if combined >= 75:
            return (0, 255, 0)
        elif combined >= 60:
            return (0, 215, 0)
        elif combined >= 45:
            return (0, 255, 255)
        elif combined >= 30:
            return (0, 165, 255)
        else:
            return (0, 0, 255)


# ──────────────────────────────────────────────────────────────
# HAND STATUS PANEL - Shows hand detection info on screen
# ──────────────────────────────────────────────────────────────
def draw_hand_status_panel(frame, hand_count, hand_info_list,
                           is_near_face, is_excessive, w, h):
    """Draw hand detection status panel"""
    panel_x = 10
    panel_y = h - 180
    panel_w = 250
    panel_h = 170

    overlay = frame.copy()
    cv2.rectangle(overlay, (panel_x, panel_y),
                  (panel_x + panel_w, panel_y + panel_h),
                  (20, 20, 20), -1)
    cv2.addWeighted(overlay, 0.3, frame, 0.7, 0, frame)

    cv2.rectangle(frame, (panel_x, panel_y),
                  (panel_x + panel_w, panel_y + panel_h),
                  (0, 255, 200), 1)

    y_offset = panel_y + 20
    cv2.putText(frame, f"HANDS: {hand_count} detected",
                (panel_x + 10, y_offset),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 200), 1)

    for info in hand_info_list:
        y_offset += 22
        gesture = info['gesture']
        speed = info['speed']
        color = (0, 255, 150) if speed < 20 else (0, 165, 255)
        cv2.putText(frame, f"  Hand {info['index']}: {gesture}",
                    (panel_x + 10, y_offset),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, color, 1)
        y_offset += 18
        cv2.putText(frame, f"    Speed: {speed:.0f}px/f",
                    (panel_x + 10, y_offset),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.4, (180, 180, 180), 1)

    if is_near_face:
        y_offset += 22
        cv2.putText(frame, "  ! HAND NEAR FACE",
                    (panel_x + 10, y_offset),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 2)

    if is_excessive:
        y_offset += 22
        cv2.putText(frame, "  ! EXCESSIVE MOVEMENT",
                    (panel_x + 10, y_offset),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 100, 255), 2)


# ══════════════════════════════════════════════════════════════
#                    MAIN APPLICATION
# ══════════════════════════════════════════════════════════════

# Download face landmarker model
model_path = 'face_landmarker.task'
if not os.path.exists(model_path):
    print("Downloading face landmarker model...")
    url = ("https://storage.googleapis.com/mediapipe-models/"
           "face_landmarker/face_landmarker/float16/1/face_landmarker.task")
    urllib.request.urlretrieve(url, model_path)
    print("Model downloaded successfully!")

# Setup camera
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("ERROR: Cannot open camera!")
    exit()

cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
session_name = f"interview_session_{timestamp}"

BaseOptions = mp.tasks.BaseOptions
FaceLandmarker = vision.FaceLandmarker
FaceLandmarkerOptions = vision.FaceLandmarkerOptions
VisionRunningMode = vision.RunningMode

# IMPORTANT: Set max_num_faces > 1 for multi-face detection
options = FaceLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=model_path),
    running_mode=VisionRunningMode.VIDEO,
    num_faces=4,  # Detect up to 4 faces for warning system
    min_face_detection_confidence=0.4,
    min_face_presence_confidence=0.4,
    min_tracking_confidence=0.4,
    output_face_blendshapes=True,
)

# Initialize all components
detector = AdvancedInterviewDetector()
visualizer = FuturisticFaceVisualizer()
hand_tracker = HandGestureTracker(max_trail_length=80, trail_fade=True)
multi_face_warning = MultiFaceWarningSystem(
    warning_cooldown_frames=90, alert_duration_frames=60
)

print("\n" + "=" * 80)
print("INTERVIEW FACE & HAND DETECTION SYSTEM (ENHANCED)")
print("=" * 80)
if not HEADLESS:
    print("Features:")
    print("  - Face mesh with futuristic visualization")
    print("  - MULTI-FACE detection with escalating warnings")
    print("  - REAL hand tracking with MediaPipe Hands")
    print("  - Hand gesture recognition (Fist, Open Palm, Peace, etc.)")
    print("  - Hand motion trail drawing")
    print("  - Hand-near-face detection")
    print("  - Fidget / nervous behavior detection")
    print("\nColor Guide:")
    print("  GREEN  = High Confidence / Good Engagement")
    print("  YELLOW = Medium Confidence")
    print("  ORANGE = Moderate Nervousness")
    print("  RED    = Low Confidence / High Nervousness")
    print("\nControls:")
    print("  ESC = Exit")
    print("  'c' = Clear hand drawing trails")
    print("  'd' = Toggle drawing mode on/off")
else:
    print("[OpenPose] Running in HEADLESS mode (no display window)")
print("=" * 80 + "\n")

frame_counter = 0
conf_history = deque(maxlen=30)
nerv_history = deque(maxlen=30)
frame_records = []

with FaceLandmarker.create_from_options(options) as landmarker:
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        h, w, c = frame.shape

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

        frame_counter += 1
        detector.frame_count = frame_counter
        timestamp_ms = frame_counter

        detection_result = landmarker.detect_for_video(mp_image, timestamp_ms)

        num_faces = (len(detection_result.face_landmarks)
                     if detection_result.face_landmarks else 0)

        # ── Update multi-face warning system ──
        multi_face_warning.update(num_faces, frame_counter)

        # ── Variables for face center (used by hand tracker) ──
        face_center = None
        face_width_px = None

        if num_faces > 1:
            # Multiple faces detected - show warning
            multi_face_warning.draw_warning(frame, w, h)

            # Still draw face meshes for all detected faces (in red)
            for face_idx, face_landmarks in enumerate(
                    detection_result.face_landmarks):
                for lm in face_landmarks:
                    x, y = int(lm.x * w), int(lm.y * h)
                    if 0 <= x < w and 0 <= y < h:
                        cv2.circle(frame, (x, y), 1, (0, 0, 255), -1)

            print(f"WARNING: {num_faces} faces detected at frame {frame_counter}")

            frame_records.append({
                'frame': frame_counter,
                'timestamp': datetime.now().isoformat(),
                'num_faces': num_faces,
                'confidence': None,
                'engagement': None,
                'eye_ratio': None,
                'gaze_direction': None,
                'gaze_shifted': None,
                'head_pose': None,
                'blink_rate': None,
                'hand_near_face': None,
                'hand_count': 0,
                'hand_gesture': None,
            })

        elif num_faces == 1:
            landmarks = detection_result.face_landmarks[0]
            blendshapes = (detection_result.face_blendshapes[0]
                           if detection_result.face_blendshapes else None)

            # Compute face center and width for hand-near-face check
            try:
                nose_x = int(landmarks[1].x * w)
                nose_y = int(landmarks[1].y * h)
                left_face = int(landmarks[234].x * w)
                right_face = int(landmarks[454].x * w)
                face_center = (nose_x, nose_y)
                face_width_px = abs(right_face - left_face)
            except:
                face_center = (w // 2, h // 2)
                face_width_px = w // 4

            # ── Hand tracking with MediaPipe Hands ──
            (hand_count, hand_info_list, hand_near_face_real,
             excessive_hand_movement_real) = hand_tracker.process_frame(
                frame, rgb_frame, face_center, face_width_px
            )

            # Hand confidence based on real detection
            hand_confidence = 85
            if hand_near_face_real:
                hand_confidence = max(30, hand_confidence - 30)
            if excessive_hand_movement_real:
                hand_confidence = max(20, hand_confidence - 40)

            # ── Face metrics calculation ──
            (confidence, engagement,
             excessive_head_movement, poor_eye_contact,
             excessive_hand_movement, hand_near_face,
             gaze_direction, eye_ratio, mouth_ratio,
             blink_rate, gaze_shifted) = detector.calculate_metrics(
                landmarks, blendshapes, w, h,
                hand_near_face=hand_near_face_real,
                excessive_hand_movement=excessive_hand_movement_real,
                hand_confidence=hand_confidence
            )

            conf_history.append(confidence)
            nerv_history.append(engagement)

            # Off-center detection
            offcenter = False
            try:
                dx = abs((nose_x - (w / 2)) / float(w))
                dy = abs((nose_y - (h / 2)) / float(h))
                offcenter = dx > 0.15 or dy > 0.15
                if offcenter:
                    detector.face_off_center_count += 1
                detector.offcenter_history.append(offcenter)
            except:
                pass

            head_pose = detector.get_head_pose(landmarks)

            # Record frame data
            hand_gesture_str = None
            if hand_info_list:
                hand_gesture_str = "; ".join(
                    [f"H{i['index']}:{i['gesture']}" for i in hand_info_list])

            frame_records.append({
                'frame': frame_counter,
                'timestamp': datetime.now().isoformat(),
                'num_faces': 1,
                'confidence': confidence,
                'engagement': engagement,
                'eye_ratio': eye_ratio,
                'gaze_direction': gaze_direction,
                'gaze_shifted': gaze_shifted,
                'gaze_shift_count': detector.gaze_shift_count,
                'head_pose': head_pose,
                'head_movement_excessive': bool(excessive_head_movement),
                'hand_near_face': bool(hand_near_face_real),
                'excessive_hand_movement': bool(excessive_hand_movement_real),
                'hand_count': hand_count,
                'hand_gesture': hand_gesture_str,
                'mouth_ratio': mouth_ratio,
                'blink_rate': blink_rate,
                'offcenter': offcenter,
                'face_off_center_count': detector.face_off_center_count,
            })

            color = detector.get_color(confidence, engagement)

            # ── Draw face mesh visualization ──
            face_coords = []
            for landmark in landmarks:
                x = int(landmark.x * w)
                y = int(landmark.y * h)
                if 0 <= x < w and 0 <= y < h:
                    face_coords.append([x, y])

            if len(face_coords) > 10:
                face_coords = np.array(face_coords)
                x_min = max(0, int(np.min(face_coords[:, 0])) - 20)
                x_max = min(w, int(np.max(face_coords[:, 0])) + 20)
                y_min = max(0, int(np.min(face_coords[:, 1])) - 20)
                y_max = min(h, int(np.max(face_coords[:, 1])) + 20)

                face_region = (x_min, y_min, x_max, y_max)
                visualizer.draw_futuristic_face_mesh(
                    frame, landmarks, w, h,
                    confidence, engagement, face_region
                )

            avg_conf = (np.mean(list(conf_history))
                        if len(conf_history) > 0 else confidence)
            avg_eng = (np.mean(list(nerv_history))
                       if len(nerv_history) > 0 else engagement)

            # ── Feedback warnings ──
            feedback_y = 50
            if eye_ratio < 0.15:
                cv2.putText(frame, "Eyes not detected - Open your eyes",
                            (20, 90),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 3)

            if excessive_head_movement:
                cv2.putText(frame, "Keep head steady - stay focused",
                            (20, feedback_y),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

            if poor_eye_contact:
                eye_y = feedback_y + (40 if excessive_head_movement else 0)
                cv2.putText(frame, "Maintain eye contact",
                            (20, eye_y),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 165, 255), 2)

            if excessive_hand_movement_real:
                cv2.putText(frame, "Keep hands steady",
                            (20, 130),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 100, 200), 2)

            if hand_near_face_real:
                cv2.putText(frame, "Don't touch face",
                            (20, 160),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (100, 100, 200), 2)

            # ── Draw hand status panel ──
            draw_hand_status_panel(frame, hand_count, hand_info_list,
                                   hand_near_face_real,
                                   excessive_hand_movement_real, w, h)

            # ── Score panel ──
            panel_width = 220
            panel_height = 100
            panel_x = max(10, w - panel_width - 20)
            panel_y = max(10, h - panel_height - 20)

            overlay = frame.copy()
            cv2.rectangle(overlay, (panel_x, panel_y),
                          (panel_x + panel_width, panel_y + panel_height),
                          (20, 20, 20), -1)
            cv2.addWeighted(overlay, 0.2, frame, 0.8, 0, frame)
            cv2.rectangle(frame, (panel_x, panel_y),
                          (panel_x + panel_width, panel_y + panel_height),
                          color, 2)

            cv2.putText(frame, "SCORE", (panel_x + 10, panel_y + 25),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 2)
            cv2.putText(frame, f"C: {int(avg_conf)}",
                        (panel_x + 10, panel_y + 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            cv2.putText(frame, f"E: {int(avg_eng)}",
                        (panel_x + 10, panel_y + 70),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

            # Also draw any lingering multi-face warning
            multi_face_warning.draw_warning(frame, w, h)

        else:
            # No face detected
            cv2.putText(frame, "NO FACE DETECTED",
                        (w // 2 - 200, h // 2 - 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 3)
            cv2.putText(frame, "Position face in frame",
                        (w // 2 - 150, h // 2 + 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)

            # Still process hands even without face
            (hand_count, hand_info_list, _, _) = hand_tracker.process_frame(
                frame, rgb_frame
            )
            if hand_count > 0:
                draw_hand_status_panel(frame, hand_count, hand_info_list,
                                       False, False, w, h)

            frame_records.append({
                'frame': frame_counter,
                'timestamp': datetime.now().isoformat(),
                'num_faces': 0,
                'confidence': None,
                'engagement': None,
                'eye_ratio': None,
                'gaze_direction': None,
                'gaze_shifted': None,
                'head_pose': None,
                'blink_rate': None,
                'hand_near_face': None,
                'hand_count': hand_count,
                'hand_gesture': None,
            })

        # ── Display ──
        if not HEADLESS:
            cv2.namedWindow("Interview Detection System", cv2.WINDOW_NORMAL)
            cv2.setWindowProperty("Interview Detection System",
                                  cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)
            cv2.imshow("Interview Detection System", frame)

        key = cv2.waitKey(1) & 0xFF if not HEADLESS else (0xFF & 0xFF)
        if key == 27:  # ESC
            break
        elif key == ord('c'):
            hand_tracker.clear_canvas()
            print("Drawing canvas cleared!")
        elif key == ord('d'):
            hand_tracker.drawing_mode = not hand_tracker.drawing_mode
            print(f"Drawing mode: {'ON' if hand_tracker.drawing_mode else 'OFF'}")

# ── Cleanup ──
cap.release()
hand_tracker.release()
if not HEADLESS:
    cv2.destroyAllWindows()

# ══════════════════════════════════════════════════════════════
#                 SAVE SESSION DATA
# ══════════════════════════════════════════════════════════════

data_file = f"{session_name}.json"
with open(data_file, 'w') as f:
    json.dump(detector.metrics_log, f, indent=2)

# Export to Excel
if pd is None:
    print("pandas not available - install 'pandas' and 'openpyxl' for Excel export")
else:
    files = glob.glob('session_*.xlsx')
    nums = []
    for f_name in files:
        m = re.search(r"session_(\d+)\.xlsx$", f_name)
        if m:
            try:
                nums.append(int(m.group(1)))
            except:
                pass
    session_num = max(nums) + 1 if nums else 1
    excel_file = f"session_{session_num:03d}.xlsx"

    try:
        df = pd.DataFrame(frame_records)

        final_conf = (np.mean(list(conf_history))
                      if len(conf_history) > 0 else None)
        final_eng = (np.mean(list(nerv_history))
                     if len(nerv_history) > 0 else None)
        overall = None
        grade = None
        assessment = None
        if final_conf is not None and final_eng is not None:
            overall = (final_conf + final_eng) / 2
            if overall >= 75:
                grade, assessment = 'A', 'EXCELLENT - Ready for Interview!'
            elif overall >= 60:
                grade, assessment = 'B', 'GOOD - Well Prepared'
            elif overall >= 45:
                grade, assessment = 'C', 'ACCEPTABLE - Needs Some Improvement'
            else:
                grade, assessment = 'D', 'NEEDS WORK - Practice More'

        # Multi-face summary
        mf_summary = multi_face_warning.get_summary()

        summary = {
            'session': session_name,
            'final_confidence': final_conf,
            'final_engagement': final_eng,
            'overall': overall,
            'grade': grade,
            'assessment': assessment,
            'total_frames': frame_counter,
            'recorded_rows': len(frame_records),
            'multi_face_events': mf_summary['total_events'],
            'hand_fidget_count': hand_tracker.fidget_count,
            'hand_near_face_frames': hand_tracker.hand_near_face_frames,
            'rapid_hand_movements': hand_tracker.rapid_movement_count,
        }

        # Build evaluation remarks
        evaluation_remarks = []
        df_frames = pd.DataFrame(frame_records)
        valid_frames = df_frames[df_frames['num_faces'] == 1].copy()
        total_valid = len(valid_frames)

        evaluation_remarks.append({
            'category': 'OVERALL GRADE',
            'evaluation': f"Grade: {grade} | Score: {overall:.1f}/100"
                          if overall else "N/A"
        })
        evaluation_remarks.append({
            'category': 'ASSESSMENT',
            'evaluation': assessment if assessment else "N/A"
        })

        # Multi-face violation report
        if mf_summary['total_events'] > 0:
            mf_remark = (f"VIOLATION: {mf_summary['total_events']} multi-face "
                         f"events detected. Interview integrity may be "
                         f"compromised.")
            evaluation_remarks.append({
                'category': 'MULTI-FACE VIOLATIONS',
                'evaluation': mf_remark
            })

        # Confidence
        if final_conf is not None:
            if final_conf >= 80:
                conf_remark = "Excellent confidence - Strong eye contact, steady posture."
            elif final_conf >= 65:
                conf_remark = "Good confidence - Generally good with minor improvements."
            elif final_conf >= 50:
                conf_remark = "Moderate confidence - Eye contact and posture need work."
            else:
                conf_remark = "Low confidence - Poor eye contact, excessive nervousness."
            evaluation_remarks.append({
                'category': 'CONFIDENCE ANALYSIS',
                'evaluation': f"Score: {final_conf:.1f}/100 - {conf_remark}"
            })

        # Engagement
        if final_eng is not None:
            if final_eng >= 75:
                eng_remark = "Excellent engagement - Alert and responsive."
            elif final_eng >= 60:
                eng_remark = "Good engagement - Generally attentive."
            elif final_eng >= 45:
                eng_remark = "Acceptable engagement - Could be more animated."
            else:
                eng_remark = "Low engagement - Appears disinterested."
            evaluation_remarks.append({
                'category': 'ENGAGEMENT ANALYSIS',
                'evaluation': f"Score: {final_eng:.1f}/100 - {eng_remark}"
            })

        # Hand gesture analysis
        hand_remark = (f"Fidget events: {hand_tracker.fidget_count} | "
                       f"Hand-near-face frames: {hand_tracker.hand_near_face_frames} | "
                       f"Rapid movements: {hand_tracker.rapid_movement_count}. ")
        if hand_tracker.fidget_count < 5:
            hand_remark += "Excellent hand control."
        elif hand_tracker.fidget_count < 20:
            hand_remark += "Moderate fidgeting detected; work on steadiness."
        else:
            hand_remark += "High fidgeting - practice keeping hands composed."
        evaluation_remarks.append({
            'category': 'HAND GESTURE ANALYSIS',
            'evaluation': hand_remark
        })

        # Eye contact / gaze
        if total_valid > 0 and 'gaze_direction' in valid_frames.columns:
            avg_gaze = valid_frames['gaze_direction'].mean()
            poor_gaze_pct = ((valid_frames['gaze_direction'] < 0.4).sum()
                             / total_valid * 100)
            eye_remark = (f"Gaze focus: {avg_gaze * 100:.1f}% | "
                          f"Poor contact: {poor_gaze_pct:.1f}%. ")
            if avg_gaze >= 0.75:
                eye_remark += "Strong and consistent eye contact."
            elif avg_gaze >= 0.60:
                eye_remark += "Generally good with minor lapses."
            else:
                eye_remark += "Significant improvement needed."
            evaluation_remarks.append({
                'category': 'EYE CONTACT',
                'evaluation': eye_remark
            })

        # Head stability
        if total_valid > 0 and 'head_movement_excessive' in valid_frames.columns:
            excessive_head_pct = (valid_frames['head_movement_excessive'].sum()
                                  / total_valid * 100)
            head_remark = f"Excessive movement: {excessive_head_pct:.1f}%. "
            if excessive_head_pct < 5:
                head_remark += "Excellent head stability."
            elif excessive_head_pct < 15:
                head_remark += "Mostly steady."
            else:
                head_remark += "Too much head movement; maintain composure."
            evaluation_remarks.append({
                'category': 'HEAD STABILITY',
                'evaluation': head_remark
            })

        # Recommendations
        recommendations = []
        if mf_summary['total_events'] > 0:
            recommendations.append(
                "Ensure only you are visible on camera during the interview.")
        if hand_tracker.fidget_count > 10:
            recommendations.append(
                "Practice keeping hands still and composed.")
        if hand_tracker.hand_near_face_frames > 20:
            recommendations.append(
                "Avoid touching or bringing hands near your face.")
        if total_valid > 0 and 'gaze_direction' in valid_frames.columns:
            if valid_frames['gaze_direction'].mean() < 0.6:
                recommendations.append(
                    "Focus on maintaining direct eye contact with the camera.")
        if not recommendations:
            recommendations.append(
                "Excellent performance! Maintain this composure.")

        evaluation_remarks.append({
            'category': 'RECOMMENDATIONS',
            'evaluation': ' | '.join(recommendations)
        })

        eval_df = pd.DataFrame(evaluation_remarks)
        summary_df = pd.DataFrame([summary])

        try:
            with pd.ExcelWriter(excel_file, engine='openpyxl') as writer:
                eval_df.to_excel(writer, sheet_name='Evaluation', index=False)
                summary_df.to_excel(writer, sheet_name='Summary', index=False)
                df.to_excel(writer, sheet_name='Frames', index=False)
        except Exception:
            eval_df.to_excel(excel_file, sheet_name='Evaluation', index=False)

        print(f"Excel saved to: {excel_file}")
    except Exception as e:
        print("Failed to save Excel:", e)

# ── Final Console Report ──
print("\n" + "=" * 80)
print("INTERVIEW DETECTION SESSION COMPLETE")
print("=" * 80)
print(f"Total Frames Analyzed: {frame_counter}")
print(f"Duration: {frame_counter / 30:.1f} seconds")

if multi_face_warning.total_multi_face_events > 0:
    print(f"\n!! MULTI-FACE VIOLATIONS: {multi_face_warning.total_multi_face_events} events")

print(f"\nHand Analysis:")
print(f"  Fidget events: {hand_tracker.fidget_count}")
print(f"  Hand-near-face frames: {hand_tracker.hand_near_face_frames}")
print(f"  Rapid movements: {hand_tracker.rapid_movement_count}")

if len(conf_history) > 0:
    final_conf = np.mean(list(conf_history))
    final_eng = np.mean(list(nerv_history))

    print(f"\nFINAL RESULTS:")
    print(f"   Confidence Score: {int(final_conf)}/100")
    print(f"   Engagement Score: {int(final_eng)}/100")

    overall = (final_conf + final_eng) / 2
    if overall >= 75:
        print("\n  ASSESSMENT: EXCELLENT - Ready for Interview!")
    elif overall >= 60:
        print("\n  ASSESSMENT: GOOD - Well Prepared")
    elif overall >= 45:
        print("\n  ASSESSMENT: ACCEPTABLE - Needs Some Improvement")
    else:
        print("\n  ASSESSMENT: NEEDS WORK - Practice More")

print(f"\nData saved to: {data_file}")
print("=" * 80)