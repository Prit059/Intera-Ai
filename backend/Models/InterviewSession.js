const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  isActive: { type: Boolean, default: true },
  metrics: {
    eyeContactTicks: { type: Number, default: 0 },
    totalTicks: { type: Number, default: 0 },
    headMovementCount: { type: Number, default: 0 },
    faceLostCount: { type: Number, default: 0 },
    handMovementCount: { type: Number, default: 0 },
    handNearFaceCount: { type: Number, default: 0 },
    blinkCount: { type: Number, default: 0 },
    sumConfidence: { type: Number, default: 0 },
    sumEngagement: { type: Number, default: 0 },
    tickCount: { type: Number, default: 0 }
  },
  transcript: [
    {
      role: { type: String, required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  evaluation: {
    overallScore: Number,
    eyeContactScore: Number,
    headStabilityScore: Number,
    focusScore: Number,
    avgConfidence: Number,
    avgEngagement: Number,
    blinkCount: Number,
    suggestions: [String],
    vapiAnalysis: mongoose.Schema.Types.Mixed
  },
  violation: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('InterviewSession', SessionSchema);
