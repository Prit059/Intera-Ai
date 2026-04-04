// models/TeacherAptitude.js
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

// Enhanced student schema with removal tracking
const studentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: String,
  name: String,
  addedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'blocked', 'removed'], // Added 'removed'
    default: 'active'
  },
  // New fields for removal tracking
  removedAt: Date,
  removalReason: String,
  removedBy: {
    type: String,
    enum: ['teacher', 'system', 'student']
  },
  // Test attempt status (to track student's progress)
  attemptStatus: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'terminated'],
    default: 'not_started'
  },
  attemptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherAptitudeAttempt'
  },
  score: Number,
  completedAt: Date
});

const TeacherAptitudeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
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
    required: true,
    default: 30
  },
  totalMarks: Number,
  totalQuestions: Number,
  
  scoring: {
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
  
  questions: [questionSchema],
  
  // UNIQUE JOIN CODE
  joinCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  
  // Updated allowedStudents with enhanced schema
  allowedStudents: [studentSchema],
  
  // Removed students history (optional - to keep track of all removals)
  removalHistory: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    studentName: String,
    studentEmail: String,
    reason: String,
    removedBy: {
      type: String,
      enum: ['teacher', 'system', 'student']
    },
    removedAt: {
      type: Date,
      default: Date.now
    },
    previousStatus: String,
    attemptNumber: Number
  }],
  
  accessSettings: {
    requiresApproval: {
      type: Boolean,
      default: false
    },
    maxStudents: {
      type: Number,
      default: 100
    },
    allowMultipleAttempts: {
      type: Boolean,
      default: false
    },
    showResultsImmediately: {
      type: Boolean,
      default: true
    }
  },
  
  schedule: {
    startDate: Date,
    endDate: Date,
    isScheduled: {
      type: Boolean,
      default: false
    }
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  stats: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    totalStudents: {
      type: Number,
      default: 0
    },
    activeStudents: {
      type: Number,
      default: 0
    },
    completedStudents: {
      type: Number,
      default: 0
    },
    removedStudents: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    highestScore: {
      type: Number,
      default: 0
    }
  },
  
  tags: [String],
  
}, {
  timestamps: true
});

// Generate unique join code before saving
TeacherAptitudeSchema.pre('save', async function(next) {
  try {
    console.log('✅ PRE-SAVE HOOK TRIGGERED for teacher aptitude');
    
    // Calculate totals
    if (this.questions && this.questions.length > 0) {
      this.totalQuestions = this.questions.length;
      this.totalMarks = this.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    } else {
      this.totalQuestions = 0;
      this.totalMarks = 0;
    }
    
    // Update stats
    if (this.allowedStudents && this.allowedStudents.length > 0) {
      this.stats.totalStudents = this.allowedStudents.length;
      this.stats.activeStudents = this.allowedStudents.filter(s => s.status === 'active').length;
      this.stats.completedStudents = this.allowedStudents.filter(s => s.attemptStatus === 'completed').length;
      this.stats.removedStudents = this.allowedStudents.filter(s => s.status === 'removed').length;
    }
    
    // Generate unique join code if not provided
    if (!this.joinCode) {
      console.log('🔑 Generating join code...');
      
      let isUnique = false;
      let attempts = 0;
      let code = '';
      
      const TeacherAptitude = mongoose.model('TeacherAptitude');
      
      while (!isUnique && attempts < 10) {
        // Generate code: APT-XXXXX (e.g., APT-X7K9M)
        const prefix = 'APT';
        const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
        code = `${prefix}-${randomPart}`;
        
        console.log(`Attempt ${attempts + 1}: Trying code ${code}`);
        
        const existing = await TeacherAptitude.findOne({ joinCode: code });
        if (!existing) {
          isUnique = true;
          console.log(`✅ Unique code found: ${code}`);
        }
        attempts++;
      }
      
      if (!isUnique) {
        // Fallback: add timestamp to ensure uniqueness
        code = `APT-${Date.now().toString(36).toUpperCase()}`;
        console.log(`⚠️ Using fallback code: ${code}`);
      }
      
      this.joinCode = code;
      console.log(`✅ Join code set to: ${this.joinCode}`);
    } else {
      console.log(`Join code already exists: ${this.joinCode}`);
    }
    
    next();
  } catch (error) {
    console.error('Error in pre-save hook:', error);
    next(error);
  }
});

// Index for faster lookups
TeacherAptitudeSchema.index({ joinCode: 1 });
TeacherAptitudeSchema.index({ createdBy: 1, createdAt: -1 });
TeacherAptitudeSchema.index({ 'allowedStudents.studentId': 1 });
TeacherAptitudeSchema.index({ 'allowedStudents.status': 1 });
TeacherAptitudeSchema.index({ 'removalHistory.removedAt': -1 });

// Create the model
const TeacherAptitude = mongoose.model('TeacherAptitude', TeacherAptitudeSchema);

module.exports = TeacherAptitude;