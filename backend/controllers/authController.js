const authService = require('../services/Auth.Service');
const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const registerUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password, role } = req.body;
    
    const userData = {
      firstname,
      lastname,
      email,
      password,
      role: role || 'user'
    };
    
    const result = await authService.registerService(userData);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await authService.loginService({ email, password });
    
    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const result = await authService.verifyEmail(token);
    
    // Return 200 OK for successful verification
    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });
  } catch (error) {
    // Return 400 only for actual errors
    res.status(400).json({
      success: false,
      message: error.message || 'Email verification failed'
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    await authService.forgotpassword(email);
    
    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process request'
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    await authService.resetpassword(token, password);
    
    res.json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await authService.getprofile(req.user.id);
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required'
      });
    }
    
    const result = await authService.refreshToken(refreshToken);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    await authService.changePassword(userId, currentPassword, newPassword);
    
    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const registerTeacher = async (req, res) => {
  try {
    const { 
      firstname,
      lastname,
      email,
      password,
      college,
      department,
      qualification,
      experience,
      phoneNumber
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create teacher account
    const teacher = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role: 'teacher',
      emailverified: false, // Will be verified via email
      teacherProfile: {
        college,
        department,
        qualification,
        experience: parseInt(experience) || 0,
        phoneNumber,
        status: 'pending',
        appliedAt: new Date(),
        mustChangePassword: true
      }
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    teacher.verificationToken = verificationToken;
    teacher.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
    
    await teacher.save();

    // Send verification email
    const emailService = require('../services/Email.Service');
    await emailService.sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Teacher registration successful. Please check your email to verify your account. You will be notified once approved.'
    });

  } catch (error) {
    console.error('Teacher registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed: ' + error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getUserProfile,
  refreshToken,
  logout,
  changePassword,
  registerTeacher
};