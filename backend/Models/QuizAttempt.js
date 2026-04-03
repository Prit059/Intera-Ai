const mongoose = require("mongoose");

const questionAttemptSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  },
  selectedAnswer: {
    type: String
  },
  isCorrect: {
    type: Boolean
  }
});

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ["easy", "moderate", "hard"],
    default: "easy"
  },
  numberOfQuestions: {
    type: Number
  },
  score: {
    type: Number
  },
  questions: [questionAttemptSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
