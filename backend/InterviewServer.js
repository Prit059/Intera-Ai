require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { spawn } = require('child_process');
const path = require('path');
const Session = require('./Models/InterviewSession');
const multer = require('multer');
const PDFParser = require('pdf2json'); // Using pdf2json instead of pdf-parse

// Configure multer to store uploaded files in memory
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const PORT = process.env.IPORT || 5000; // Changed back to 5000
const MONGODB_URI = process.env.MONGO_URI;

// Track running open_pose.py processes per session
const openPoseProcesses = {};

app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log('[Backend] Connected to MongoDB'))
    .catch(err => console.error('[Backend] MongoDB connection error:', err));

// Upload Resume Endpoint - FIXED with pdf2json
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded. Please ensure the field name is "resume".' });
        }

        // Create a new PDFParser instance
        const pdfParser = new PDFParser();
        
        // Handle successful parsing
        pdfParser.on('pdfParser_dataReady', () => {
            try {
                // Get the extracted text
                const extractedText = pdfParser.getRawTextContent();
                let cleanText = extractedText
                    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
                    .replace(/[^\w\s.,!?-]/g, '') // Remove special characters
                    .trim();
                
                if (!cleanText || cleanText.length < 10) {
                    return res.status(400).json({ error: 'Could not extract meaningful text from PDF. Please ensure the PDF contains readable text.' });
                }
                
                console.log(`[Backend] Extracted ${cleanText.length} characters from resume`);
                res.json({ text: cleanText });
            } catch (err) {
                console.error('[Backend] Error processing extracted text:', err);
                res.status(500).json({ error: 'Error processing PDF content: ' + err.message });
            }
        });
        
        // Handle parsing errors
        pdfParser.on('pdfParser_dataError', errData => {
            console.error('[Backend] PDF parsing error:', errData);
            res.status(500).json({ error: 'Failed to parse PDF file. The file might be corrupted or password protected.' });
        });
        
        // Parse the buffer
        pdfParser.parseBuffer(req.file.buffer);
        
    } catch (error) {
        console.error('[Backend] Error parsing PDF:', error);
        res.status(500).json({ error: 'Failed to process PDF file. Specific error: ' + error.message });
    }
});

// Start a new interview session
app.post('/api/interview-session/start', async (req, res) => {
    try {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newSession = new Session({
            sessionId,
            isActive: true,
            startTime: new Date(),
            metrics: {
                eyeContactTicks: 0,
                totalTicks: 0,
                headMovementCount: 0,
                faceLostCount: 0,
                handMovementCount: 0,
                handNearFaceCount: 0,
                blinkCount: 0,
                sumConfidence: 0,
                sumEngagement: 0,
                tickCount: 0
            }
        });
        await newSession.save();
        res.json({ sessionId });
        console.log(`[Backend] Started session: ${sessionId}`);

        // Check if open_pose.py exists before spawning
        const scriptPath = path.join(__dirname, 'open_pose.py');
        const fs = require('fs');
        
        if (fs.existsSync(scriptPath)) {
            const pyProcess = spawn('python', [scriptPath, '--headless'], {
                cwd: __dirname,
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
        } else {
            console.log(`[Backend] open_pose.py not found, skipping pose detection`);
        }
    } catch (error) {
        console.error('[Backend] Error starting session:', error);
        res.status(500).json({ error: 'Failed to start session: ' + error.message });
    }
});

// Update session metrics in real-time
app.post('/api/interview-session/update', async (req, res) => {
    try {
        const { sessionId, metrics } = req.body;
        
        if (!sessionId || !metrics) {
            return res.status(400).json({ error: 'Missing sessionId or metrics' });
        }
        
        const session = await Session.findOne({ sessionId, isActive: true });

        if (session) {
            // Apply incremental updates to metrics
            const metricFields = ['eyeContactTicks', 'totalTicks', 'headMovementCount', 'faceLostCount', 'handMovementCount', 'handNearFaceCount', 'blinkCount'];
            metricFields.forEach(key => {
                if (metrics.hasOwnProperty(key) && typeof metrics[key] === 'number') {
                    session.metrics[key] = (session.metrics[key] || 0) + metrics[key];
                }
            });

            // Update confidence/engagement sums
            if (metrics.hasOwnProperty('confidence') && metrics.hasOwnProperty('engagement')) {
                session.metrics.sumConfidence = (session.metrics.sumConfidence || 0) + metrics.confidence;
                session.metrics.sumEngagement = (session.metrics.sumEngagement || 0) + metrics.engagement;
                session.metrics.tickCount = (session.metrics.tickCount || 0) + 1;
            }

            await session.save();
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Session not found or inactive' });
        }
    } catch (error) {
        console.error('[Backend] Error updating session:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

// End session and save full transcript/evaluation
app.post('/api/interview-session/end', async (req, res) => {
    try {
        const { sessionId, transcript, vapiAnalysis, violation, audioUrl } = req.body;
        const session = await Session.findOne({ sessionId });

        if (session) {
            session.isActive = false;
            session.endTime = new Date();

            // Store full transcript if provided
            if (transcript && Array.isArray(transcript) && transcript.length > 0) {
                session.transcript = transcript.map(msg => ({
                    role: msg.role,
                    text: msg.text,
                    timestamp: new Date()
                }));
            }

            if (violation) {
                session.violation = violation;
            }
            
            if (audioUrl) {
                session.audioUrl = audioUrl;
            }

            // Calculate evaluation
            const evaluation = calculateScores(session.metrics);
            if (vapiAnalysis) {
                evaluation.vapiAnalysis = vapiAnalysis;
            }
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
                success: true,
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
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

// Get session history
app.get('/api/interview-sessions', async (req, res) => {
    try {
        const sessions = await Session.find().sort({ createdAt: -1 }).limit(50);
        res.json(sessions);
    } catch (error) {
        console.error('[Backend] Error fetching sessions:', error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// Get single session by ID
app.get('/api/interview-session/:sessionId', async (req, res) => {
    try {
        const session = await Session.findOne({ sessionId: req.params.sessionId });
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json(session);
    } catch (error) {
        console.error('[Backend] Error fetching session:', error);
        res.status(500).json({ error: 'Failed to fetch session' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date(), service: 'AI Interview Proctor' });
});

// Final scoring logic
function calculateScores(metrics) {
    const { 
        eyeContactTicks = 0, 
        totalTicks = 0, 
        headMovementCount = 0, 
        faceLostCount = 0, 
        handNearFaceCount = 0, 
        blinkCount = 0, 
        sumConfidence = 0, 
        sumEngagement = 0, 
        tickCount = 0 
    } = metrics;

    const avgConfidence = tickCount > 0 ? Math.min(100, Math.max(0, Math.round(sumConfidence / tickCount))) : 0;
    const avgEngagement = tickCount > 0 ? Math.min(100, Math.max(0, Math.round(sumEngagement / tickCount))) : 0;
    const eyeContactRatio = totalTicks > 0 ? Math.min(1, eyeContactTicks / totalTicks) : 0;
    const eyeContactScore = Math.round(eyeContactRatio * 100);
    const headStabilityScore = Math.max(0, Math.min(100, 100 - (headMovementCount * 3)));
    const sessionMinutes = Math.max(0.1, totalTicks / 60);
    const blinkRate = blinkCount / sessionMinutes;

    let blinkScore = 100;
    if (blinkRate < 5) blinkScore = 70;
    if (blinkRate > 30) blinkScore = 60;

    const distractionScore = Math.max(0, Math.min(100, 100 - (handNearFaceCount * 5) - (faceLostCount * 10)));
    const focusScore = Math.round((blinkScore * 0.4) + (distractionScore * 0.6));
    const behavioralOverall = (eyeContactScore * 0.4) + (headStabilityScore * 0.3) + (focusScore * 0.3);
    const overallScore = Math.round((behavioralOverall * 0.6) + (avgConfidence * 0.2) + (avgEngagement * 0.2));

    const suggestions = [];
    if (eyeContactRatio < 0.6) suggestions.push("Try to maintain consistent eye contact with the camera.");
    if (headMovementCount > 10) suggestions.push("Reduce frequent head movements to appear more focused.");
    if (blinkRate < 5) suggestions.push("Relax your eyes; your blink rate is quite low.");
    if (blinkRate > 30) suggestions.push("You're blinking frequently. Try to stay calm.");
    if (avgConfidence < 60) suggestions.push("Work on projecting more confidence through posture and eye contact.");
    if (avgEngagement < 50) suggestions.push("Interact more actively with the interviewer.");
    if (faceLostCount > 5) suggestions.push("Try to stay centered in the camera frame.");
    if (suggestions.length === 0) suggestions.push("Excellent work! You maintained high professionalism throughout the interview.");

    return {
        overallScore,
        eyeContactScore,
        headStabilityScore,
        focusScore,
        avgConfidence,
        avgEngagement,
        blinkCount: Math.round(blinkCount),
        suggestions: suggestions.slice(0, 5)
    };
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Cleanup all open_pose processes on server exit
const cleanup = () => {
    console.log('Cleaning up processes...');
    Object.values(openPoseProcesses).forEach(p => { 
        try { p.kill(); } catch (_) { } 
    });
    process.exit();
};

process.on('exit', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    cleanup();
});

app.listen(PORT, () => {
    console.log(`[Backend] AI Interview System Server running on port ${PORT}`);
    console.log(`[Backend] Health check: http://localhost:${PORT}/api/health`);
});