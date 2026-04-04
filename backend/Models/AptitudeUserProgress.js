const mongoose = require("mongoose");

const questionAttemptSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AptitudeTopic.practiceQuestions",
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  },
  userAnswer: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const topicProgressSchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AptitudeTopic",
    required: true
  },
  formulasMastered: [{
    formulaId: mongoose.Schema.Types.ObjectId,
    masteryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastReviewed: Date
  }],
  questionsAttempted: [questionAttemptSchema],
  totalAttempts: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  averageTimePerQuestion: {
    type: Number,
    default: 0
  },
  lastAttempted: Date,
  isCompleted: {
    type: Boolean,
    default: false
  },
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, { timestamps: true });

const AptitudeuserProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  topicsProgress: [topicProgressSchema],
  overallStats: {
    totalTopicsAttempted: {
      type: Number,
      default: 0
    },
    totalQuestionsAttempted: {
      type: Number,
      default: 0
    },
    totalCorrectAnswers: {
      type: Number,
      default: 0
    },
    overallAccuracy: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    totalStudyTime: {
      type: Number, // in minutes
      default: 0
    },
    lastActive: Date,
    streakDays: {
      type: Number,
      default: 0
    }
  },
  recentActivity: [{
    action: {
      type: String,
      enum: ["topic_viewed", "formula_studied", "question_attempted", "topic_completed", "test_taken"]
    },
    topicId: mongoose.Schema.Types.ObjectId,
    details: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "AptitudeTopic"
  }],
  favoriteTopics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "AptitudeTopic"
  }]
}, {
  timestamps: true
});

// Indexes
AptitudeuserProgressSchema.index({ userId: 1 });
AptitudeuserProgressSchema.index({ "topicsProgress.topicId": 1 });
AptitudeuserProgressSchema.index({ "overallStats.lastActive": -1 });

// Pre-save middleware to update accuracy
topicProgressSchema.pre("save", function(next) {
  if (this.totalAttempts > 0) {
    this.accuracy = (this.correctAnswers / this.totalAttempts) * 100;
  }
  next();
});

module.exports = mongoose.model("AptitudeUserProgress", AptitudeuserProgressSchema);