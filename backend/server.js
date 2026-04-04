require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { spawn } = require('child_process');
const path = require('path');
const Session = require('./models/Session');
const multer = require('multer');
const pdfParse = require('pdf-parse');

// Configure multer to store uploaded files in memory
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_interview_db';

// Track running open_pose.py processes per session
const openPoseProcesses = {};

app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log('[Backend] Connected to MongoDB'))
    .catch(err => console.error('[Backend] MongoDB connection error:', err));

// Upload Resume Endpoint
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded. Please ensure the field name is "resume".' });
        }

        const data = await pdfParse(req.file.buffer);
        let cleanText = data.text;
        cleanText = cleanText.replace(/\s+/g, ' ').trim();

        console.log(`[Backend] Extracted ${cleanText.length} characters from resume`);
        res.json({ text: cleanText });

    } catch (error) {
        console.error('[Backend] Error parsing PDF details:', error);
        res.status(500).json({ error: 'Failed to process PDF file. Specific error: ' + error.message });
    }
});

// Start a new interview session
app.post('/api/session/start', async (req, res) => {
    try {
        const sessionId = `session_${Date.now()}`;
        const newSession = new Session({
            sessionId,
            isActive: true
        });
        await newSession.save();
        res.json({ sessionId });
        console.log(`[Backend] Started session: ${sessionId}`);

        // Spawn open_pose.py headless in background
        const scriptPath = path.join(__dirname, '..', 'open_pose.py');
        const pyProcess = spawn('python', [scriptPath, '--headless'], {
            cwd: path.join(__dirname, '..'),
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: false,
        });

        openPoseProcesses[sessionId] = pyProcess;

        pyProcess.stdout.on('data', (data) => {
            console.log(`[OpenPose:${sessionId}] ${data.toString().trim()}`);
        });
        pyProcess.stderr.on('data', (data) => {
            console.error(`[OpenPose:${sessionId}] ERR: ${data.toString().trim()}`);
        });
        pyProcess.on('close', (code) => {
            console.log(`[OpenPose:${sessionId}] Process exited with code ${code}`);
            delete openPoseProcesses[sessionId];
        });
        pyProcess.on('error', (err) => {
            console.error(`[OpenPose:${sessionId}] Failed to start: ${err.message}`);
            delete openPoseProcesses[sessionId];
        });

        console.log(`[Backend] Spawned open_pose.py for session: ${sessionId} (PID: ${pyProcess.pid})`);
    } catch (error) {
        console.error('[Backend] Error starting session:', error);
        res.status(500).json({ error: 'Failed to start session' });
    }
});

// Update session metrics in real-time
app.post('/api/session/update', async (req, res) => {
    try {
        const { sessionId, metrics } = req.body;
        const session = await Session.findOne({ sessionId, isActive: true });

        if (session) {
            // Apply incremental updates to metrics
            ['eyeContactTicks', 'totalTicks', 'headMovementCount', 'faceLostCount', 'handMovementCount', 'handNearFaceCount', 'blinkCount'].forEach(key => {
                if (metrics.hasOwnProperty(key)) {
                    session.metrics[key] += metrics[key];
                }
            });

            // Update confidence/engagement sums
            if (metrics.hasOwnProperty('confidence')) {
                session.metrics.sumConfidence += metrics.confidence;
                session.metrics.sumEngagement += metrics.engagement;
                session.metrics.tickCount += 1;
            }

            await session.save();
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Session not found or inactive' });
        }
    } catch (error) {
        console.error('[Backend] Error updating session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// End session and save full transcript/evaluation
app.post('/api/session/end', async (req, res) => {
    try {
        const { sessionId, transcript, vapiAnalysis, violation } = req.body;
        const session = await Session.findOne({ sessionId });

        if (session) {
            session.isActive = false;
            session.endTime = new Date();

            // Store full transcript if provided
            if (transcript && Array.isArray(transcript)) {
                session.transcript = transcript.map(msg => ({
                    role: msg.role,
                    text: msg.text,
                    timestamp: new Date()
                }));
            }

            if (violation) {
                session.violation = violation;
            }

            // Calculate evaluation
            const evaluation = calculateScores(session.metrics);
            evaluation.vapiAnalysis = vapiAnalysis;
            session.evaluation = evaluation;

            await session.save();

            // Kill open_pose.py process for this session
            if (openPoseProcesses[sessionId]) {
                try {
                    openPoseProcesses[sessionId].kill('SIGTERM');
                    console.log(`[Backend] Killed open_pose.py for session: ${sessionId}`);
                } catch (killErr) {
                    console.error(`[Backend] Error killing open_pose.py: ${killErr.message}`);
                }
                delete openPoseProcesses[sessionId];
            }

            res.json({
                sessionId,
                metrics: session.metrics,
                evaluation,
                transcript: session.transcript
            });
            console.log(`[Backend] Ended session and saved to DB: ${sessionId}`);
        } else {
            res.status(404).json({ error: 'Session not found' });
        }
    } catch (error) {
        console.error('[Backend] Error ending session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get session history (New endpoint)
app.get('/api/sessions', async (req, res) => {
    try {
        const sessions = await Session.find().sort({ createdAt: -1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// Final scoring logic
function calculateScores(metrics) {
    const { eyeContactTicks, totalTicks, headMovementCount, faceLostCount, handNearFaceCount, blinkCount, sumConfidence, sumEngagement, tickCount } = metrics;

    const avgConfidence = tickCount > 0 ? Math.round(sumConfidence / tickCount) : 0;
    const avgEngagement = tickCount > 0 ? Math.round(sumEngagement / tickCount) : 0;
    const eyeContactRatio = totalTicks > 0 ? eyeContactTicks / totalTicks : 0;
    const eyeContactScore = Math.round(eyeContactRatio * 100);
    const headStabilityScore = Math.max(0, 100 - (headMovementCount * 3));
    const sessionMinutes = totalTicks / 60;
    const blinkRate = sessionMinutes > 0 ? blinkCount / sessionMinutes : 0;

    let blinkScore = 100;
    if (blinkRate < 5) blinkScore = 70;
    if (blinkRate > 30) blinkScore = 60;

    const distractionScore = Math.max(0, 100 - (handNearFaceCount * 5) - (faceLostCount * 10));
    const focusScore = Math.round((blinkScore * 0.4) + (distractionScore * 0.6));
    const behavioralOverall = (eyeContactScore * 0.4) + (headStabilityScore * 0.3) + (focusScore * 0.3);
    const overallScore = Math.round((behavioralOverall * 0.6) + (avgConfidence * 0.2) + (avgEngagement * 0.2));

    const suggestions = [];
    if (eyeContactRatio < 0.6) suggestions.push("Try to maintain consistent eye contact.");
    if (headMovementCount > 10) suggestions.push("Reduce frequent head movements to appear more focused.");
    if (blinkRate < 5) suggestions.push("Relax your eyes; your blink rate is quite low.");
    if (avgConfidence < 60) suggestions.push("Work on projecting more confidence through posture and eye contact.");
    if (avgEngagement < 50) suggestions.push("Interact more actively with the interviewer.");
    if (suggestions.length === 0) suggestions.push("Great work! You maintained a high level of professionalism.");

    return {
        overallScore,
        eyeContactScore,
        headStabilityScore,
        focusScore,
        avgConfidence,
        avgEngagement,
        blinkCount,
        suggestions
    };
}

app.listen(PORT, () => {
    console.log(`[Backend] AI Interview System Server running on port ${PORT}`);
});

// Cleanup all open_pose processes on server exit
process.on('exit', () => {
    Object.values(openPoseProcesses).forEach(p => { try { p.kill(); } catch (_) { } });
});
process.on('SIGINT', () => process.exit());
process.on('SIGTERM', () => process.exit());
