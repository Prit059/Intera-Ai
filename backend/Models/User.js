const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstname: {
    type: String,
    required: true,
    trim: true
  },
  lastname: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'teacher', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailverified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpiry: Date,
  passwordResetToken: String,
  passwordResetTokenExpiry: Date,
  // Teacher specific fields
  teacherProfile: {
    college: String,
    department: String,
    qualification: String,
    experience: Number,
    phoneNumber: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    appliedAt: Date,
    approvedAt: Date,
    mustChangePassword: {
      type: Boolean,
      default: false
    }
  },
  // Google OAuth fields
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  profileImageUrl: {
    type: String,
    default: null
  },
  // For users who sign up with Google (no password)
  isGoogleAuth: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving (only if password is modified and not Google auth)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isGoogleAuth) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);