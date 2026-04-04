const mongoose = require("mongoose");

const formulaSchema = new mongoose.Schema({
  formula: {
    type: String,
    required: [true, "Formula is required"],
    trim: true
  },
  explanation: {
    type: String,
    required: [true, "Explanation is required"]
  },
  variables: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  example: {
    problem: {
      type: String,
      required: true
    },
    solution: {
      type: String,
      required: true
    }
  },
  usage: {
    type: String,
    required: true
  },
  tags: [String],
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium"
  }
}, { timestamps: true });

const solvedExampleSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Question is required"]
  },
  solutionSteps: [{
    type: String,
    required: true
  }],
  explanation: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium"
  },
  timeRequired: {
    type: String,
    default: "30 seconds"
  },
  formulaUsed: String,
  tags: [String]
}, { timestamps: true });

const practiceQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Question is required"]
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: String,
    required: true
  },
  solution: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium"
  },
  category: String,
  subCategory: String,
  hint: String,
  timeLimit: {
    type: Number, // in seconds
    default: 60
  },
  formulaReferences: [String],
  tags: [String]
}, { timestamps: true });

const aptitudeTopicSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: [true, "Slug is required"],
    unique: true,
    lowercase: true
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    enum: ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability", "Data Interpretation", "General Awareness"]
  },
  subCategory: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: [true, "Description is required"]
  },
  icon: {
    type: String,
    default: "📊"
  },
  colorScheme: {
    type: String,
    enum: ["blue", "green", "purple", "orange", "red"],
    default: "blue"
  },

  // Concept Explanation
  conceptExplanation: {
    summary: {
      type: String,
      required: [true, "Concept summary is required"]
    },
    detailedExplanation: {
      type: String,
      required: [true, "Detailed explanation is required"]
    },
    keyPoints: [String]
  },

  // Core Content
  importantFormulas: [formulaSchema],
  solvedExamples: [solvedExampleSchema],
  practiceQuestions: [practiceQuestionSchema],
  commonMistakes: [String],
  timeSavingTricks: [String],

  // Metadata
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium"
  },
  estimatedPreparationTime: {
    type: Number, // in minutes
    default: 120
  },
  prerequisiteTopics: [String],
  tags: [String],
  popularity: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },

  // Status
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },

  // Admin
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total content count
aptitudeTopicSchema.virtual("totalFormulas").get(function() {
  return this.importantFormulas.length;
});

aptitudeTopicSchema.virtual("totalExamples").get(function() {
  return this.solvedExamples.length;
});

aptitudeTopicSchema.virtual("totalQuestions").get(function() {
  return this.practiceQuestions.length;
});

// Indexes for better query performance
aptitudeTopicSchema.index({ slug: 1 });
aptitudeTopicSchema.index({ category: 1, subCategory: 1 });
aptitudeTopicSchema.index({ difficulty: 1 });
aptitudeTopicSchema.index({ isPublished: 1 });
aptitudeTopicSchema.index({ tags: 1 });
aptitudeTopicSchema.index({ popularity: -1 });
aptitudeTopicSchema.index({ title: "text", description: "text", "conceptExplanation.summary": "text" });

// Pre-save middleware to generate slug from title
aptitudeTopicSchema.pre("save", function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

module.exports = mongoose.model("AptitudeTopic", aptitudeTopicSchema);