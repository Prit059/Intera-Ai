// controllers/adminController.js
const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const { sendTeacherApprovalEmail } = require("../services/emailService");

// Approve teacher
const approveTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // Find the teacher
    const teacher = await User.findById(teacherId);
    
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Generate temporary password (8 chars + special chars for strength)
    const tempPassword = Math.random().toString(36).slice(-8) + 
                        Math.random().toString(36).toUpperCase().slice(-2) + "@" +
                        Math.floor(Math.random() * 100);
    
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update teacher record
    teacher.password = hashedPassword;
    teacher.teacherProfile.status = 'approved';
    teacher.teacherProfile.approvedBy = req.user.id;
    teacher.teacherProfile.approvedAt = new Date();
    teacher.teacherProfile.mustChangePassword = true;
    
    await teacher.save();

    // Send email with credentials
    try {
      await sendTeacherApprovalEmail(teacher.email, teacher.name, tempPassword);
      console.log(`Approval email sent to ${teacher.email}`);
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Still return success but note email failure
      return res.json({
        success: true,
        message: "Teacher approved but email delivery failed. Please note the temporary password.",
        data: teacher,
        tempPassword: tempPassword // Only show this in development!
      });
    }

    res.json({
      success: true,
      message: "Teacher approved successfully. Login credentials have been sent to their email.",
      data: teacher
    });

  } catch (error) {
    console.error("Approval error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all pending teachers
const getPendingTeachers = async (req, res) => {
  try {
    const pendingTeachers = await User.find({
      role: 'teacher',
      'teacherProfile.status': 'pending'
    }).select('-password');

    res.json({
      success: true,
      data: pendingTeachers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all teachers (approved and rejected)
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({
      role: 'teacher'
    }).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: teachers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject teacher
const rejectTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { reason } = req.body;

    const teacher = await User.findByIdAndUpdate(
      teacherId,
      {
        'teacherProfile.status': 'rejected',
        'teacherProfile.rejectionReason': reason,
        'teacherProfile.approvedBy': req.user.id,
        'teacherProfile.approvedAt': new Date()
      },
      { new: true }
    );

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // You could also send a rejection email here if needed

    res.json({
      success: true,
      message: "Teacher rejected",
      data: teacher
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPendingTeachers,
  getAllTeachers,
  approveTeacher,
  rejectTeacher
};