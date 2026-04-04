const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  branch: {
    type: String,
    required: true,
    enum: ['cse', 'ec', 'mechanical', 'ai_ml', 'other', 'placement', 'competitive']
  },
  customBranch: String,
  mainTopic: {
    type: String,
    required: true
  },
  subTopics: [{
    topic: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    weightage: Number
  }],
  totalQuestions: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String,
    explanation: String,
    subtopic: String,
    difficulty: String
  }],
  timeLimit: Number,
  status: {
    type: String,
    enum: ['created', 'in-progress', 'completed'],
    default: 'created'
  },
  userAnswers: [{
    questionIndex: Number,
    selectedAnswer: String,
    isCorrect: Boolean,
    timeSpent: Number
  }],
  score: {
    type: Number,
    default: 0
  },
  violations: {
    type: Number,
    default: 0
  },
  completedAt: Date,
  performanceAnalysis: {
    weakTopics: [String],
    strongTopics: [String],
    averageTimePerQuestion: Number,
    accuracy: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);