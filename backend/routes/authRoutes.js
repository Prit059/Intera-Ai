const express = require("express");
const {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getUserProfile,
  refreshToken,
  logout,
  changePassword,
  registerTeacher,
} = require("../controllers/authController");
const { protect, requireRole } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const User = require("../Models/User");

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/teacher/register", registerTeacher);
router.post("/login", loginUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/refresh-token", refreshToken);

// Protected Routes
router.get("/profile", protect, getUserProfile);
router.post("/change-password", protect, changePassword);
router.post("/logout", protect, logout);

// ============ ADMIN ROUTES FOR TEACHER MANAGEMENT ============

// Get all pending teachers (Admin only)
router.get("/admin/teachers/pending", protect, requireRole('admin'), async (req, res) => {
  try {
    const pendingTeachers = await User.find({ 
      role: 'teacher',
      'teacherProfile.status': 'pending'
    }).select("-password -verificationToken -verificationTokenExpiry -passwordResetToken -passwordResetTokenExpiry");
    
    res.json({
      success: true,
      data: pendingTeachers
    });
  } catch (error) {
    console.error('Error fetching pending teachers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch pending teachers'
    });
  }
});

// Get all approved teachers (Admin only)
router.get("/admin/teachers/approved", protect, requireRole('admin'), async (req, res) => {
  try {
    const approvedTeachers = await User.find({ 
      role: 'teacher',
      'teacherProfile.status': 'approved'
    }).select("-password -verificationToken -verificationTokenExpiry -passwordResetToken -passwordResetTokenExpiry");
    
    res.json({
      success: true,
      data: approvedTeachers
    });
  } catch (error) {
    console.error('Error fetching approved teachers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch approved teachers'
    });
  }
});

// Get all rejected teachers (Admin only)
router.get("/admin/teachers/rejected", protect, requireRole('admin'), async (req, res) => {
  try {
    const rejectedTeachers = await User.find({ 
      role: 'teacher',
      'teacherProfile.status': 'rejected'
    }).select("-password -verificationToken -verificationTokenExpiry -passwordResetToken -passwordResetTokenExpiry");
    
    res.json({
      success: true,
      data: rejectedTeachers
    });
  } catch (error) {
    console.error('Error fetching rejected teachers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch rejected teachers'
    });
  }
});

// Get all teachers (all statuses) (Admin only)
router.get("/admin/teachers/all", protect, requireRole('admin'), async (req, res) => {
  try {
    const allTeachers = await User.find({ 
      role: 'teacher'
    }).select("-password -verificationToken -verificationTokenExpiry -passwordResetToken -passwordResetTokenExpiry")
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: allTeachers
    });
  } catch (error) {
    console.error('Error fetching all teachers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch teachers'
    });
  }
});

// Approve teacher (Admin only)
router.post("/admin/teachers/approve/:id", protect, requireRole('admin'), async (req, res) => {
  try {
    const teacher = await User.findById(req.params.id);
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    if (teacher.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'User is not a teacher'
      });
    }
    
    // Check if already approved
    if (teacher.teacherProfile.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Teacher is already approved'
      });
    }
    
    // Update teacher status to approved
    teacher.teacherProfile.status = 'approved';
    teacher.teacherProfile.approvedAt = new Date();
    teacher.teacherProfile.mustChangePassword = true; // Force password change on first login
    await teacher.save();
    
    // Send approval email to teacher
    const emailService = require('../services/Email.Service');
    try {
      await emailService.sendTeacherApprovalEmail(teacher.email, teacher.firstname);
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
      // Don't fail the request if email fails
    }
    
    res.json({
      success: true,
      message: 'Teacher approved successfully',
      data: {
        _id: teacher._id,
        firstname: teacher.firstname,
        lastname: teacher.lastname,
        email: teacher.email,
        status: teacher.teacherProfile.status
      }
    });
  } catch (error) {
    console.error('Error approving teacher:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to approve teacher'
    });
  }
});

// Reject teacher (Admin only)
router.post("/admin/teachers/reject/:id", protect, requireRole('admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const teacher = await User.findById(req.params.id);
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    if (teacher.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'User is not a teacher'
      });
    }
    
    // Check if already rejected
    if (teacher.teacherProfile.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Teacher is already rejected'
      });
    }
    
    // Update teacher status to rejected
    teacher.teacherProfile.status = 'rejected';
    teacher.teacherProfile.rejectedAt = new Date();
    teacher.teacherProfile.rejectionReason = reason || 'No reason provided';
    await teacher.save();
    
    // Send rejection email to teacher
    const emailService = require('../services/Email.Service');
    try {
      await emailService.sendTeacherRejectionEmail(teacher.email, teacher.firstname, reason);
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
      // Don't fail the request if email fails
    }
    
    res.json({
      success: true,
      message: 'Teacher rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting teacher:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject teacher'
    });
  }
});

// Get teacher details by ID (Admin only)
router.get("/admin/teachers/:id", protect, requireRole('admin'), async (req, res) => {
  try {
    const teacher = await User.findById(req.params.id)
      .select("-password -verificationToken -verificationTokenExpiry -passwordResetToken -passwordResetTokenExpiry");
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    if (teacher.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'User is not a teacher'
      });
    }
    
    res.json({
      success: true,
      data: teacher
    });
  } catch (error) {
    console.error('Error fetching teacher details:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch teacher details'
    });
  }
});

// Get teacher statistics (Admin only)
router.get("/admin/teachers/stats/summary", protect, requireRole('admin'), async (req, res) => {
  try {
    const pendingCount = await User.countDocuments({ role: 'teacher', 'teacherProfile.status': 'pending' });
    const approvedCount = await User.countDocuments({ role: 'teacher', 'teacherProfile.status': 'approved' });
    const rejectedCount = await User.countDocuments({ role: 'teacher', 'teacherProfile.status': 'rejected' });
    const totalCount = await User.countDocuments({ role: 'teacher' });
    
    res.json({
      success: true,
      data: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching teacher stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch statistics'
    });
  }
});

// Admin Routes for all users
router.get("/admin/all-users", protect, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select("-password -verificationToken -verificationTokenExpiry -passwordResetToken -passwordResetTokenExpiry");
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Image Upload
router.post("/upload-image", protect, upload.single("image"), (req, res) => {
  if(!req.file){
    return res.status(400).json({
      success: false,
      message: "No File uploaded."
    });
  }
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(200).json({
    success: true,
    message: "Image uploaded successfully",
    imageUrl
  });
});

module.exports = router;