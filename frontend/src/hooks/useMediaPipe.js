import { useEffect, useRef, useState } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

const FACEMESH_VERSION = "0.4.1633559619";
const HANDS_VERSION   = "0.4.1675469240";

// Head-turn threshold: nose X deviation from centre (0–1 normalised)
const HEAD_TURN_THRESHOLD = 0.12;

export const useMediaPipe = (videoRef, canvasRef) => {
  const [metrics, setMetrics] = useState({
    eyeContact:    false,
    headMovement:  false,
    headTurn:      false,   // true when face turned left/right
    handMovement:  false,
    facePresent:   false,
    faceCount:     0,
    blinkDetected: false,
    confidence:    0,
    engagement:    0,
    mouthRatio:    0,
  });

  const prevFacePos    = useRef(null);
  const blinkCooldown  = useRef(0);
  const headTurnFrames = useRef(0); // consecutive frames with head turned

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const faceMesh = new FaceMesh({
      locateFile: (f) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@${FACEMESH_VERSION}/${f}`,
    });
    faceMesh.setOptions({
      maxNumFaces: 4,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    const hands = new Hands({
      locateFile: (f) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${HANDS_VERSION}/${f}`,
    });
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    const canvasCtx = canvasRef.current.getContext('2d');

    const calculateEAR = (pts) => {
      const v1 = Math.hypot(pts[1].x - pts[5].x, pts[1].y - pts[5].y);
      const v2 = Math.hypot(pts[2].x - pts[4].x, pts[2].y - pts[4].y);
      const h  = Math.hypot(pts[0].x - pts[3].x, pts[0].y - pts[3].y);
      return (v1 + v2) / (2.0 * h);
    };

    const getMouthRatio = (lm) => {
      const dV = Math.hypot(lm[13].x - lm[14].x, lm[13].y - lm[14].y);
      const dH = Math.hypot(lm[61].x - lm[291].x, lm[61].y - lm[291].y);
      return dV / (dH + 0.001);
    };

    // Draw a clean bounding box around a face (no dots)
    const drawFaceBox = (lm, w, h, color, lineWidth = 2) => {
      let minX = 1, maxX = 0, minY = 1, maxY = 0;
      lm.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });
      const x = minX * w - 10, y = minY * h - 10;
      const bw = (maxX - minX) * w + 20, bh = (maxY - minY) * h + 20;
      const r = 12;
      canvasCtx.strokeStyle = color;
      canvasCtx.lineWidth = lineWidth;
      canvasCtx.beginPath();
      canvasCtx.moveTo(x + r, y);
      canvasCtx.lineTo(x + bw - r, y);
      canvasCtx.quadraticCurveTo(x + bw, y, x + bw, y + r);
      canvasCtx.lineTo(x + bw, y + bh - r);
      canvasCtx.quadraticCurveTo(x + bw, y + bh, x + bw - r, y + bh);
      canvasCtx.lineTo(x + r, y + bh);
      canvasCtx.quadraticCurveTo(x, y + bh, x, y + bh - r);
      canvasCtx.lineTo(x, y + r);
      canvasCtx.quadraticCurveTo(x, y, x + r, y);
      canvasCtx.closePath();
      canvasCtx.stroke();
    };

    const onResults = (results) => {
      if (!canvasRef.current) return;
      const { width: W, height: H } = canvasRef.current;
      canvasCtx.clearRect(0, 0, W, H);

      const detectedFaces = results.multiFaceLandmarks?.length ?? 0;
      let facePresent    = detectedFaces > 0;
      let eyeContact     = false;
      let headMoving     = false;
      let headTurned     = false;
      let blinkDetected  = false;
      let confidence     = 0;
      let engagement     = 0;
      let mouthRatio     = 0;

      if (detectedFaces > 1) {
        // Draw red boxes around ALL extra faces
        results.multiFaceLandmarks.forEach((lm, idx) => {
          drawFaceBox(lm, W, H,
            idx === 0 ? 'rgba(16,185,129,0.7)' : 'rgba(239,68,68,0.9)',
            idx === 0 ? 2 : 3
          );
        });
      }

      if (facePresent) {
        const lm = results.multiFaceLandmarks[0];

        // ── Bounding box for primary face (green) ──
        if (detectedFaces === 1) {
          drawFaceBox(lm, W, H, 'rgba(16,185,129,0.6)', 2);
        }

        // ── EAR blink ──
        const leftEAR  = calculateEAR([lm[33], lm[160], lm[158], lm[133], lm[153], lm[144]]);
        const rightEAR = calculateEAR([lm[362], lm[385], lm[387], lm[263], lm[373], lm[380]]);
        const avgEAR   = (leftEAR + rightEAR) / 2;
        mouthRatio     = getMouthRatio(lm);

        if (avgEAR < 0.22 && blinkCooldown.current === 0) {
          blinkDetected = true;
          blinkCooldown.current = 15;
        }
        if (blinkCooldown.current > 0) blinkCooldown.current--;
        eyeContact = avgEAR > 0.22;

        // ── Head movement (nose position delta) ──
        const nose = lm[1];
        if (prevFacePos.current) {
          const dx = Math.abs(nose.x - prevFacePos.current.x);
          const dy = Math.abs(nose.y - prevFacePos.current.y);
          if (dx > 0.005 || dy > 0.005) headMoving = true;
        }
        prevFacePos.current = nose;

        // ── Head turn detection (nose X deviation from centre) ──
        // nose.x is normalised 0–1; centre = 0.5
        const noseDeviation = Math.abs(nose.x - 0.5);
        if (noseDeviation > HEAD_TURN_THRESHOLD) {
          headTurnFrames.current += 1;
        } else {
          headTurnFrames.current = Math.max(0, headTurnFrames.current - 1);
        }
        // Require 8 consecutive frames to avoid false positives
        headTurned = headTurnFrames.current >= 8;

        // ── Scoring ──
        let conf = 60;
        if (eyeContact)  conf += 20;
        if (!headMoving) conf += 20; else conf -= 15;
        if (headTurned)  conf -= 10;
        confidence = Math.max(0, Math.min(100, conf));

        let eng = 40;
        if (mouthRatio > 0.06) eng += 45;
        if (avgEAR > 0.2)      eng += 15;
        engagement = Math.max(0, Math.min(100, eng));
      }

      setMetrics(prev => ({
        ...prev,
        facePresent,
        faceCount:    detectedFaces,
        eyeContact,
        headMovement: headMoving,
        headTurn:     headTurned,
        blinkDetected,
        confidence,
        engagement,
        mouthRatio,
      }));
    };

    const onHandResults = (results) => {
      const handMovement = !!(results.multiHandLandmarks?.length > 0);
      setMetrics(prev => ({ ...prev, handMovement }));
    };

    faceMesh.onResults(onResults);
    hands.onResults(onHandResults);

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await faceMesh.send({ image: videoRef.current });
        await hands.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });
    camera.start();

    return () => {
      camera.stop();
      faceMesh.close();
      hands.close();
    };
  }, [videoRef, canvasRef]);

  return metrics;
};
