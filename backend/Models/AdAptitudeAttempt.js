// models/AdAptitudeAttempt.js
const mongoose = require('mongoose');

const userAnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  selectedAnswer: mongoose.Schema.Types.Mixed,
  isCorrect: Boolean,
  timeTaken: Number,
  answeredAt: {
    type: Date,
    default: Date.now
  }
});

// models/AdAptitudeAttempt.js

const violationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'tab_switch', 
      'fullscreen_exit', 
      'copy_paste', 
      'right_click', 
      'inactivity', 
      'multiple_faces', 
      'no_face',
      'device_change',  // ADD THIS
      'device_switch'    // ADD THIS (optional)
    ],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  // ADD THIS to store extra details
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const analysisSchema = new mongoose.Schema({
  totalCorrect: Number,
  totalWrong: Number,
  totalSkipped: Number,
  accuracy: Number,
  averageTimePerQuestion: Number,
  categoryWisePerformance: mongoose.Schema.Types.Mixed,
  difficultyWisePerformance: mongoose.Schema.Types.Mixed,
  timeManagementScore: Number
});

const AdAptitudeAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdAptitude',
    required: true
  },
   // NEW: Track device info for cross-device recovery
  lastDeviceInfo: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // NEW: Track last activity time
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  
  // NEW: Store answers as you go (you already have this)
  answers: [userAnswerSchema],
  violations: [violationSchema],
  analysis: analysisSchema,
  score: {
    type: Number,
    default: 0
  },
  totalMarks: Number,
  percentage: Number,
  timeSpent: Number,
  attemptNumber: Number,
  startedAt: Date,
  completedAt: Date,
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'terminated', 'abandoned'],
    default: 'in-progress'
  },
  passed: Boolean,
  terminatedReason: String,
  warningsCount: {
    type: Number,
    default: 0
  },
  safeModeEnabled: {
    type: Boolean,
    default: true
  },

}, {
  timestamps: true
});

AdAptitudeAttemptSchema.index({ userId: 1, quizId: 1, attemptNumber: 1 }, { unique: true });
AdAptitudeAttemptSchema.index({ userId: 1, quizId: 1, status: 1 }); // For active checks
AdAptitudeAttemptSchema.index({ userId: 1, createdAt: -1 }); // For user attempts

module.exports = mongoose.model('AdAptitudeAttempt', AdAptitudeAttemptSchema);