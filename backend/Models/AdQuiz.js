const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500
  },
  questionType: { 
    type: String, 
    enum: ['MCQ', 'True/False', 'Multiple Response', 'Text Input', 'Code'], 
    required: true 
  },
  options: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  correctAnswer: { 
    type: String, 
    required: true,
    trim: true
  },
  explanation: {
    type: String,
    trim: true,
    maxlength: 500
  },
  points: { 
    type: Number, 
    default: 1,
    min: 1,
    max: 10
  },
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'] 
  },
  timeLimit: {
    type: Number,
    min: 0,
    max: 300,
    default: 0
  },
  imageUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^(https?:\/\/).*\.(jpg|jpeg|png|webp|gif)$/i.test(v);
      },
      message: 'Invalid image URL format'
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }]
});

// Define virtuals first
const quizSchema = new mongoose.Schema({
  // Basic Info
  title: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100 
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Classification
  branch: { 
    type: String, 
    required: true,
    enum: ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Others'],
    index: true
  },
  customBranch: {
    type: String,
    trim: true,
    maxlength: 50,
    default: ""
  },
  category: { 
    type: String, 
    required: true,
    index: true
  },
  customCategory: {
    type: String,
    trim: true,
    maxlength: 50,
    default: ""
  },
  subCategory: {
    type: String,
    default: "",
    index: true
  },
  customSubCategory: {
    type: String,
    trim: true,
    maxlength: 50,
    default: ""
  },

  // Difficulty & Timing
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'], 
    required: true,
    index: true
  },
  duration: { 
    type: Number, 
    required: true,
    min: 1,
    max: 300
  },
  totalQuestions: { 
    type: Number, 
    required: true,
    min: 1,
    max: 100
  },

  // Scheduling - REMOVED future date validation
  startDate: { 
    type: Date, 
    required: true
  },
  endDate: { 
    type: Date, 
    required: true
  },

  // Access & Settings
  isPublic: { 
    type: Boolean, 
    default: true,
    index: true
  },
  maxAttempts: { 
    type: Number, 
    default: 1,
    min: 1,
    max: 10
  },
  contestType: { 
    type: String, 
    enum: ['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Special'],
    index: true
  },

  // Scoring System
  pointsPerQuestion: { 
    type: Number, 
    default: 1,
    min: 1,
    max: 10
  },
  negativeMarking: { 
    type: Boolean, 
    default: false 
  },
  negativePoints: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 1
  },
  passingScore: { 
    type: Number, 
    default: 60,
    min: 0,
    max: 100
  },

  // Metadata
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  coverImage: {
    type: String,
    default: ""
  },
  instructions: {
    type: String,
    maxlength: 1000,
    default: ""
  },

  // Questions Array
  questions: [questionSchema],

  // Analytics & Statistics
  totalParticipants: { 
    type: Number, 
    default: 0,
    min: 0
  },
  averageScore: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100
  },

  // Ownership & Timestamps
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  }

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting the final branch name (custom or predefined)
quizSchema.virtual('finalBranch').get(function() {
  return this.branch === 'Others' && this.customBranch ? this.customBranch : this.branch;
});

// Virtual for getting the final category name
quizSchema.virtual('finalCategory').get(function() {
  return this.category === 'Others' && this.customCategory ? this.customCategory : this.category;
});

// Virtual for getting the final sub-category name
quizSchema.virtual('finalSubCategory').get(function() {
  return this.subCategory === 'Others' && this.customSubCategory ? this.customSubCategory : this.subCategory;
});

// Indexes
quizSchema.index({ branch: 1, category: 1, difficulty: 1, isActive: 1, isPublic: 1 });
quizSchema.index({ startDate: 1, endDate: 1, isActive: 1 });
quizSchema.index({ isPublic: 1, contestType: 1, isActive: 1 });
quizSchema.index({ createdBy: 1, createdAt: -1 });
quizSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Pre-save middleware to handle custom fields and validation
quizSchema.pre('save', function(next) {
  // Clean up custom fields if not needed
  if (this.branch !== 'Others') {
    this.customBranch = "";
  }
  if (this.category !== 'Others') {
    this.customCategory = "";
  }
  if (this.subCategory !== 'Others') {
    this.customSubCategory = "";
  }
  
  // Manual validation for dates
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  
  // Ensure totalQuestions matches actual questions count
  if (this.questions && this.isModified('questions')) {
    this.totalQuestions = this.questions.length;
  }
  
  next();
});

// Static method for finding active quizzes
quizSchema.statics.findActive = function() {
  return this.find({ 
    isActive: true, 
    isDeleted: false,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  });
};

// Instance method to check if quiz is currently active
quizSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && !this.isDeleted && this.startDate <= now && this.endDate >= now;
};

module.exports = mongoose.model('AdQuiz', quizSchema);