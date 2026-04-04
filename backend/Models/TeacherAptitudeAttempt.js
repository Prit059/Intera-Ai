// models/TeacherAptitudeAttempt.js
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
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

const TeacherAptitudeAttemptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherAptitude',
    required: true
  },
  joinCode: {
    type: String,
    required: true
  },
  
  // Attempt details
  answers: [answerSchema],
  score: {
    type: Number,
    default: 0
  },
  totalMarks: Number,
  percentage: Number,
  passed: Boolean,
  
  // Time tracking
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  timeSpent: Number, // in seconds
  
  // Status
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  
  // Attempt number (for multiple attempts)
  attemptNumber: {
    type: Number,
    default: 1
  },
  
  // Device info for security
  deviceInfo: {
    ipAddress: String,
    userAgent: String,
    platform: String
  },
  
  // Violations (if any)
  violations: [{
    type: {
      type: String,
      enum: ['tab_switch', 'fullscreen_exit', 'copy_paste', 'right_click']
    },
    timestamp: Date,
    details: String
  }]
}, {
  timestamps: true
});

// Ensure unique attempts per student per test
TeacherAptitudeAttemptSchema.index({ studentId: 1, testId: 1, attemptNumber: 1 }, { unique: true });

module.exports = mongoose.model('TeacherAptitudeAttempt', TeacherAptitudeAttemptSchema);