// models/UserQuizHistory.js
const mongoose = require('mongoose');

const userQuizHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  topic: String,
  branch: String,
  score: Number,
  totalQuestions: Number,
  performance: {
    weakAreas: [String],
    strongAreas: [String],
    overallAccuracy: Number
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
userQuizHistorySchema.index({ user: 1, completedAt: -1 });
userQuizHistorySchema.index({ user: 1, topic: 1 });

module.exports = mongoose.model('UserQuizHistory', userQuizHistorySchema);