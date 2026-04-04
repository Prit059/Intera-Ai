# Neural AI Interview Monitor 🚀

A high-fidelity AI-powered interview monitoring and analysis platform. This project combines real-time computer vision with conversational AI to provide deep insights into candidate behavior and performance.

## 🌟 Key Features

- **Live AI Interviewer**: Powered by Vapi AI for a seamless, voice-driven conversation.
- **Neural Telemetry Overlay**: Real-time face tracking and gesture detection using MediaPipe.
- **Dynamic Executive Summary**: Post-interview analysis that synchronizes behavioral data with conversational intelligence.
- **Advanced Dashboard**: Visual performance reports with high-fidelity charts and personalized feedback.

---

## 🔬 Behavioral Metrics & Calculation Factors

The system tracks several "Neural Metrics" to evaluate professional presence. Below is the technical breakdown of how these are calculated:

### 1. Gaze Accuracy (Eye Stability)
This metric measures how consistently the user maintains eye contact with the camera.

- **Calculation Factor**: **EAR (Eye Aspect Ratio)**.
- **Technical Logic**:
    - The system identifies 6 specific landmarks around each eye.
    - EAR is calculated as: `(||P2 - P6|| + ||P3 - P5||) / (2 * ||P1 - P4||)`.
    - An EAR value > `0.22` is considered "Active Eye Contact."
- **Score Calculation**: The percentage of "Total Session Ticks" where Active Eye Contact was detected.

### 2. Kinesic Sync (Head Stability)
This metric evaluates posture and physical composure during the interview.

- **Calculation Factor**: **Nose Tip Coordinate Delta**.
- **Technical Logic**:
    - The system tracks the $(x, y)$ position of the nose tip (Landmark 1) every frame.
    - **Movement Trigger**: If the distance between the current and previous nose position exceeds `0.005` normalized units, a "Kinesic Tick" is recorded.
- **Score Calculation**: `Max(0, 100 - (Total_Movement_Ticks * 3))`. Frequent jerky movements or excessive leaning will lower this score.

### 3. Neural Focus (Engagement Meter)
A hybrid metric that combines biological signals with environmental distractions.

- **Calculation Factors**:
    - **Blink Rate**: Optimized for a natural range (10-20 blinks/min). 
    - **Localized Distractions**: Hands near face detection and face-loss events.
- **Score Calculation**: 
    - `Blink Score (40%)` + `Distraction Score (60%)`.
    - Distraction Score = `100 - (Hand_Near_Face * 5) - (Face_Lost * 10)`.

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Tailwind CSS (Custom Neural Theme), Lucide Icons.
- **Computer Vision**: MediaPipe (FaceMesh & Hands).
- **Conversational AI**: Vapi Web SDK.
- **Backend**: Node.js, Express.
- **Analytics**: Recharts (High-fidelity data visualization).

---

## 🚀 Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
node server.js
```
*Port 5000 must be available.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Open http://localhost:5173 (or follow Vite terminal output) to begin your session.*

---

## 🛡️ Security & Privacy
- All computer vision processing happens **client-side** via WebAssembly (WASM).
- No video feeds are stored on the server; only normalized behavioral tick counts are synced for the final report.

---
> [!NOTE]
> For the best results, ensure your room is well-lit and your camera is at eye level.
