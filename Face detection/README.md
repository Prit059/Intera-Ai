# Interview Face & Hand Detection System

Real-time interview analysis using MediaPipe face mesh + hand landmark detection.
Scores candidate **Confidence (C)** and **Engagement (E)** live via webcam.

---

## Features

### Face Detection & Mesh
- 478-point 3D face mesh via MediaPipe FaceLandmarker (Tasks API)
- Futuristic holographic wireframe overlay with scanning wave animation
- Particle effects and glowing landmark rendering
- Corner bracket bounding box around detected face

### Confidence Score (C) — 0 to 100
Computed every frame from 4 weighted signals:

| Signal | Weight | How it works |
|---|---|---|
| Eye Openness (EAR) | 35% | Vertical/horizontal eye landmark ratio — wider = more alert |
| Gaze Direction | 30% | Iris position relative to eye corners — forward gaze = high score |
| Head Posture | 20% | 3D pitch/yaw angle — neutral forward position scores highest |
| Hand Behavior | 15% | Hand near face = −15 penalty (nervous behavior) |

### Engagement Score (E) — 0 to 100
Computed every frame from 4 weighted signals:

| Signal | Weight | How it works |
|---|---|---|
| Mouth Activity | 30% | Rolling average mouth aspect ratio — some movement = engaged |
| Head Movement | 25% | Moderate nodding = 100, frozen = 30, excessive = 40 |
| Blink Rate | 25% | 10–25 blinks/min = 100, too few or too many = 50 |
| Hand Movement | 20% | Calm hands = 85, excessive rapid movement = −20 penalty |

### Hand Gesture Tracking
- Detects up to 2 hands simultaneously via MediaPipe HandLandmarker
- Recognizes gestures: Fist, Open Palm, Pointing, Peace/Victory, Thumbs Up, Rock On, Three, Four
- Motion trail drawing with fade effect per hand (color-coded)
- Fidget detection — counts rapid movements and hand-near-face events

### Multi-Face Warning System
- Detects if more than 1 face appears on camera
- 3-level escalating alert: Warning → Alert → Critical
- Flashing border overlay with violation counter
- All events timestamped and logged

### Head Movement Analysis
- Tracks pitch and yaw changes frame-to-frame
- Flags excessive head movement (>20° change per frame)
- Feeds into both confidence and engagement scoring

### Eye & Gaze Analysis
- Eye Aspect Ratio (EAR) for blink detection
- Gaze direction score (0–1) based on iris landmark geometry
- Poor eye contact detection (gaze < 0.4 threshold)
- Blink rate calculated per 30-frame window

### Session Report (Excel)
Saved automatically on exit with 3 sheets:
- **Evaluation** — per-category scores and recommendations
- **Summary** — overall confidence, engagement, violation counts
- **Frames** — raw per-frame data (EAR, gaze, mouth ratio, head pose, hand data)

---

## Scoring Assessment

| Overall Score | Assessment |
|---|---|
| 75–100 | Excellent — Ready for Interview |
| 60–74 | Good — Well Prepared |
| 45–59 | Acceptable — Needs Some Improvement |
| 0–44 | Needs Work — Practice More |

---

## Controls

| Key | Action |
|---|---|
| `ESC` | Exit and save report |
| `C` | Clear hand drawing trail |
| `D` | Toggle trail drawing on/off |

---

## Models Used
- `face_landmarker.task` — MediaPipe FaceLandmarker (478 landmarks + blendshapes)
- `hand_landmarker.task` — MediaPipe HandLandmarker (21 landmarks per hand, auto-downloaded)

## Dependencies
```
mediapipe >= 0.10.30
opencv-python
numpy
pandas
openpyxl
```
