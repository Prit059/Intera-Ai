// models/AdAptitude.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: [
      "Multiple Choice (MCQ)",
      "True/False", 
      "Multiple Response",
      "Fill in the Blanks",
      "Short Answer",
      "Matching"
    ],
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  explanation: {
    type: String,
    default: ""
  },
  marks: {
    type: Number,
    default: 1
  },
  timeLimit: {
    type: Number,
    default: 0
  },
  imageUrl: {
    type: String,
    default: ""
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard", "Very Hard"],
    default: "Medium"
  }
});

const AdAptitudeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Quantitative Aptitude", "Logical Reasoning", "Verbal Ability",
      "Data Interpretation", "Puzzles", "Non-Verbal Reasoning",
      "Abstract Reasoning", "Technical Aptitude", "Other"
    ]
  },
  customCategory: String,
  subCategory: String,
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard", "Very Hard"],
    default: "Medium"
  },
  timeLimit: {
    type: Number,
    required: true
  },
  contestType: {
    type: String,
    enum: ["general", "friday"],
    default: "general"
  },
  description: String,
  tags: [String],
  schedule: {
    startDate: Date,
    startTime: String,
    endDate: Date,
    endTime: String
  },
  scoring: {
    maxAttempts: {
      type: String,
      enum: ["unlimited", "1", "2", "3", "5"],
      default: "unlimited"
    },
    pointsPerQuestion: {
      type: Number,
      default: 1
    },
    passingScore: {
      type: Number,
      default: 60
    },
    negativeMarking: {
      type: Boolean,
      default: false
    },
    negativeMarks: {
      type: Number,
      default: 0.25
    }
  },
  security: {
    safeMode: {
      type: Boolean,
      default: true
    },
    maxViolations: {
      type: Number,
      default: 3
    },
    fullScreenRequired: {
      type: Boolean,
      default: true
    },
    disableCopyPaste: {
      type: Boolean,
      default: true
    },
    disableRightClick: {
      type: Boolean,
      default: true
    }
  },
  specialInstructions: String,
  showExplanation: {
    type: Boolean,
    default: true
  },
  questions: [questionSchema],
  totalMarks: Number,
  totalQuestions: Number,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

AdAptitudeSchema.pre('save', function(next) {
  this.totalQuestions = this.questions.length;
  this.totalMarks = this.questions.reduce((sum, q) => sum + q.marks, 0);
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AdAptitude', AdAptitudeSchema);