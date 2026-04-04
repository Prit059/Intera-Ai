// Models/PracticeSession.js
const mongoose = require("mongoose");

const practiceSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
  type: {
    type: String,
    enum: ["single", "mock", "timed"],
    default: "single"
  },
  questions: [{ 
    type: mongoose.Schema.Types.ObjectId, ref: "Question" 
  }],
  currentQuestionIndex: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  
  // Recording and feedback
  recordings: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    audioUrl: String,
    transcript: String,
    duration: Number,
    feedback: {
      fillerWordsCount: Number,
      fillerWords: [String],
      confidenceScore: Number,
      contentScore: Number,
      timingScore: Number,
      overallScore: Number,
      suggestions: [String],
      strengths: [String]
    },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Performance metrics
  scores: {
    communication: Number,
    technical: Number,
    confidence: Number,
    timing: Number,
    overall: Number
  },
  
  startedAt: Date,
  completedAt: Date,
  duration: Number // in minutes
}, { timestamps: true });

module.exports = mongoose.model("PracticeSession", practiceSessionSchema);