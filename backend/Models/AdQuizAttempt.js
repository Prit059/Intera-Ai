const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema({
  quizId : { type: mongoose.Schema.Types.ObjectId, ref: "AdQuiz", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answer: { type: Map, of: String },
  score: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  attemptedQuestions: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 },    // seconds
  violations: { type: Number, default: 0 },
  forced: { type: Boolean, default: false },
  reason: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('AdQuizAttempt', quizAttemptSchema);