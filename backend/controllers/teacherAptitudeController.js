// controllers/teacherAptitudeController.js
const TeacherAptitude = require('../Models/TeacherAptitude');
const TeacherAptitudeAttempt = require('../Models/TeacherAptitudeAttempt');
const User = require('../Models/User');

// Generate unique join code (6 characters, no confusing chars)
const generateUniqueJoinCode = async () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += characters[Math.floor(Math.random() * characters.length)];
    }
    
    const existing = await TeacherAptitude.findOne({ joinCode: code });
    if (!existing) {
      isUnique = true;
    }
  }
  
  return code;
};

// Create Test
const createTest = async (req, res) => {
  try {
    console.log('Creating test...');
    
    // Generate unique join code
    const joinCode = await generateUniqueJoinCode();
    console.log('Generated join code:', joinCode);
    
    // Calculate end date if scheduling is enabled
    let schedule = { isScheduled: false };
    if (req.body.schedule?.isScheduled && req.body.schedule?.startDate) {
      const startDate = new Date(req.body.schedule.startDate);
      const endDate = new Date(startDate.getTime() + (req.body.timeLimit * 60000));
      
      schedule = {
        startDate,
        endDate,
        isScheduled: true
      };
    }
    
    // Create test with join code
    const testData = {
      title: req.body.title,
      description: req.body.description || "",
      category: req.body.category,
      customCategory: req.body.customCategory || "",
      subCategory: req.body.subCategory || "",
      difficulty: req.body.difficulty || "Medium",
      timeLimit: req.body.timeLimit,
      scoring: req.body.scoring || {
        pointsPerQuestion: 1,
        passingScore: 60,
        negativeMarking: false,
        negativeMarks: 0.25
      },
      questions: req.body.questions || [],
      joinCode,
      schedule, // Add calculated schedule
      accessSettings: req.body.accessSettings || {
        requiresApproval: false,
        maxStudents: 100,
        allowMultipleAttempts: false,
        showResultsImmediately: true
      },
      createdBy: req.user.id,
      allowedStudents: [], // Initialize empty students array
      tags: req.body.tags || []
    };
    
    const test = new TeacherAptitude(testData);
    await test.save();
    
    console.log('Test created with join code:', test.joinCode);
    
    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: test,
      joinCode: test.joinCode
    });
    
  } catch (error) {
    console.error('Error creating test:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get all tests created by teacher
const getMyTests = async (req, res) => {
  try {
    const tests = await TeacherAptitude.find({ createdBy: req.user.id })
      .select('title joinCode timeLimit isActive allowedStudents schedule createdAt difficulty category')
      .sort({ createdAt: -1 });
    
    // Add statistics for each test
    const testsWithStats = tests.map(test => {
      const students = test.allowedStudents || [];
      return {
        ...test.toObject(),
        totalStudents: students.length,
        completedStudents: students.filter(s => s.status === 'completed').length,
        pendingStudents: students.filter(s => s.status === 'pending').length,
        isScheduled: test.schedule?.isScheduled || false,
        startDate: test.schedule?.startDate,
        endDate: test.schedule?.endDate
      };
    });
    
    res.json({ success: true, data: testsWithStats });
    
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single test with questions
const getTestById = async (req, res) => {
  try {
    const test = await TeacherAptitude.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    }).populate('allowedStudents.studentId', 'name email');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Format student data
    const studentsList = (test.allowedStudents || []).map(s => ({
      id: s.studentId?._id,
      name: s.studentId?.name || 'Unknown',
      email: s.studentId?.email || 'N/A',
      joinedAt: s.addedAt,
      status: s.status || 'pending',
      score: s.score
    }));

    res.json({
      success: true,
      data: {
        ...test.toObject(),
        students: studentsList,
        stats: {
          total: studentsList.length,
          completed: studentsList.filter(s => s.status === 'completed').length,
          pending: studentsList.filter(s => s.status === 'pending').length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching test',
      error: error.message
    });
  }
};

// Update test
const updateTest = async (req, res) => {
  try {
    // Recalculate end date if scheduling is enabled
    let schedule = req.body.schedule;
    if (req.body.schedule?.isScheduled && req.body.schedule?.startDate) {
      const startDate = new Date(req.body.schedule.startDate);
      const endDate = new Date(startDate.getTime() + (req.body.timeLimit * 60000));
      
      schedule = {
        startDate,
        endDate,
        isScheduled: true
      };
    }

    const test = await TeacherAptitude.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      { 
        ...req.body, 
        schedule, 
        updatedAt: Date.now() 
      },
      { new: true, runValidators: true }
    );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    res.json({
      success: true,
      message: 'Test updated successfully',
      data: test
    });
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating test',
      error: error.message
    });
  }
};

// Delete test
const deleteTest = async (req, res) => {
  try {
    const test = await TeacherAptitude.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Delete all attempts for this test
    await TeacherAptitudeAttempt.deleteMany({ testId: req.params.id });

    res.json({
      success: true,
      message: 'Test deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting test',
      error: error.message
    });
  }
};

// Toggle test active status
const toggleTestStatus = async (req, res) => {
  try {
    const test = await TeacherAptitude.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    test.isActive = !test.isActive;
    await test.save();

    res.json({
      success: true,
      message: `Test ${test.isActive ? 'activated' : 'deactivated'} successfully`,
      data: test
    });
  } catch (error) {
    console.error('Error toggling test status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating test status',
      error: error.message
    });
  }
};

// Regenerate join code
const regenerateJoinCode = async (req, res) => {
  try {
    const test = await TeacherAptitude.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Generate new unique code
    const newCode = await generateUniqueJoinCode();

    test.joinCode = newCode;
    await test.save();

    res.json({
      success: true,
      message: 'Join code regenerated successfully',
      joinCode: newCode
    });
  } catch (error) {
    console.error('Error regenerating join code:', error);
    res.status(500).json({
      success: false,
      message: 'Error regenerating join code',
      error: error.message
    });
  }
};

// Get test statistics
const getTestStats = async (req, res) => {
  try {
    const testId = req.params.id;
    
    const test = await TeacherAptitude.findById(testId);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const attempts = await TeacherAptitudeAttempt.find({ testId })
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });

    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter(a => a.status === 'completed').length;
    const passedCount = attempts.filter(a => a.passed).length;
    
    let totalScore = 0;
    let highestScore = 0;
    attempts.forEach(a => {
      totalScore += a.score || 0;
      if (a.score > highestScore) highestScore = a.score;
    });

    const averageScore = totalAttempts > 0 ? (totalScore / totalAttempts) : 0;
    const passRate = completedAttempts > 0 ? (passedCount / completedAttempts) * 100 : 0;

    // Question-wise analysis
    let questionAnalysis = [];
    if (test.questions && test.questions.length > 0) {
      questionAnalysis = test.questions.map((q, index) => {
        const questionAttempts = attempts.filter(a => 
          a.answers?.some(ans => ans.questionId?.toString() === q._id?.toString())
        );
        
        const correctCount = attempts.filter(a =>
          a.answers?.some(ans => 
            ans.questionId?.toString() === q._id?.toString() && ans.isCorrect
          )
        ).length;

        return {
          questionNumber: index + 1,
          questionText: q.questionText?.substring(0, 50) + (q.questionText?.length > 50 ? '...' : ''),
          totalAttempts: questionAttempts.length,
          correctCount,
          correctPercentage: questionAttempts.length > 0 
            ? Number(((correctCount / questionAttempts.length) * 100).toFixed(1))
            : 0
        };
      });
    }

    res.json({
      success: true,
      data: {
        test: {
          title: test.title,
          joinCode: test.joinCode,
          totalQuestions: test.totalQuestions,
          totalMarks: test.totalMarks,
          timeLimit: test.timeLimit,
          schedule: test.schedule
        },
        stats: {
          totalAttempts,
          completedAttempts,
          passedCount,
          averageScore: Number(averageScore.toFixed(2)),
          highestScore,
          passRate: Number(passRate.toFixed(1))
        },
        questionAnalysis,
        recentAttempts: attempts.slice(0, 10).map(a => ({
          studentName: a.studentId?.name || 'Unknown',
          studentEmail: a.studentId?.email || 'N/A',
          score: a.score || 0,
          percentage: a.percentage || 0,
          passed: a.passed || false,
          completedAt: a.completedAt,
          timeSpent: a.timeSpent || 0
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching test stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching test statistics',
      error: error.message
    });
  }
};

// Add students manually by email
const addStudents = async (req, res) => {
  try {
    const { testId } = req.params;
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of emails'
      });
    }

    const test = await TeacherAptitude.findOne({
      _id: testId,
      createdBy: req.user.id
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    const addedStudents = [];
    const notFound = [];
    const alreadyExists = [];

    for (const email of emails) {
      const user = await User.findOne({ email });
      
      if (user) {
        const exists = test.allowedStudents?.some(
          s => s.email === email
        );

        if (!exists) {
          test.allowedStudents.push({
            studentId: user._id,
            email: user.email,
            name: user.name,
            status: 'pending'
          });
          addedStudents.push(email);
        } else {
          alreadyExists.push(email);
        }
      } else {
        notFound.push(email);
      }
    }

    await test.save();

    res.json({
      success: true,
      message: 'Students added successfully',
      data: {
        added: addedStudents,
        notFound: notFound,
        alreadyExists: alreadyExists
      }
    });
  } catch (error) {
    console.error('Error adding students:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding students',
      error: error.message
    });
  }
};

const removeStudent = async (req, res) => {
  try {
    const { testId, studentId } = req.params;
    const { reason, removedBy } = req.body;

    console.log('Removing student:', { testId, studentId, reason });

    // Find the test
    const test = await TeacherAptitude.findById(testId);
    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: 'Test not found' 
      });
    }

    // Check if teacher owns this test
    if (test.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to modify this test' 
      });
    }

    // Find student in allowedStudents array
    const studentIndex = test.allowedStudents.findIndex(
      s => s.studentId.toString() === studentId
    );

    if (studentIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found in this test' 
      });
    }

    const student = test.allowedStudents[studentIndex];

    // Check if student can be removed (not completed)
    if (student.attemptStatus === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot remove a student who has already completed the test' 
      });
    }

    // Get student details for history
    const user = await User.findById(studentId);
    
    // Add to removal history
    test.removalHistory.push({
      studentId: studentId,
      studentName: user?.name || student.name || 'Unknown',
      studentEmail: user?.email || student.email || 'Unknown',
      reason: reason || 'No reason provided',
      removedBy: removedBy || 'teacher',
      removedAt: new Date(),
      previousStatus: student.status,
      attemptNumber: student.attemptNumber || 1
    });

    // Update student status to removed
    test.allowedStudents[studentIndex].status = 'removed';
    test.allowedStudents[studentIndex].removedAt = new Date();
    test.allowedStudents[studentIndex].removalReason = reason || 'No reason provided';
    test.allowedStudents[studentIndex].removedBy = removedBy || 'teacher';
    test.allowedStudents[studentIndex].attemptStatus = 'terminated';

    // Update test stats
    test.stats.removedStudents = (test.stats.removedStudents || 0) + 1;
    if (student.attemptStatus === 'in_progress') {
      test.stats.activeStudents = Math.max(0, (test.stats.activeStudents || 0) - 1);
    }

    await test.save();

    // Terminate any active attempts
    await TeacherAptitudeAttempt.updateMany(
      { 
        testId: testId, 
        studentId: studentId,
        status: 'in-progress'
      },
      { 
        $set: { 
          status: 'terminated',
          terminatedAt: new Date(),
          terminationReason: reason || 'Removed by teacher'
        }
      }
    );

    res.json({ 
      success: true, 
      message: 'Student removed successfully',
      data: {
        studentId: studentId,
        name: user?.name || student.name,
        email: user?.email || student.email,
        reason: reason,
        removedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Remove student error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while removing student',
      error: error.message 
    });
  }
};

// Public route for students to join (no auth required)
const getTestByJoinCode = async (req, res) => {
  try {
    const { joinCode } = req.params;
    
    const test = await TeacherAptitude.findOne({ 
      joinCode: joinCode.toUpperCase(),
      isActive: true 
    }).select('-questions.correctAnswer');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Invalid join code or test not active'
      });
    }

    // Check if test is scheduled and accessible
    if (test.schedule?.isScheduled) {
      const now = new Date();
      if (test.schedule.startDate && now < new Date(test.schedule.startDate)) {
        return res.status(400).json({
          success: false,
          message: `Test starts on ${new Date(test.schedule.startDate).toLocaleString()}`
        });
      }
      if (test.schedule.endDate && now > new Date(test.schedule.endDate)) {
        return res.status(400).json({
          success: false,
          message: 'Test has ended'
        });
      }
    }

    res.json({
      success: true,
      data: {
        _id: test._id,
        title: test.title,
        description: test.description,
        category: test.category,
        difficulty: test.difficulty,
        timeLimit: test.timeLimit,
        totalQuestions: test.totalQuestions,
        totalMarks: test.totalMarks,
        scoring: test.scoring,
        createdBy: test.createdBy,
        schedule: test.schedule,
        questions: test.questions.map(q => ({
          _id: q._id,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          marks: q.marks,
          difficulty: q.difficulty
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching test by join code:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching test',
      error: error.message
    });
  }
};

// Student joins using code
const joinTestByCode = async (req, res) => {
  try {
    const { joinCode } = req.body;
    const studentId = req.user.id;
    
    // Get user details
    const user = await User.findById(studentId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Find test by join code
    const test = await TeacherAptitude.findOne({ 
      joinCode: joinCode.toUpperCase(),
      isActive: true 
    });
    
    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid join code or test not active' 
      });
    }
    
    // Check if test is scheduled and within time
    if (test.schedule?.isScheduled) {
      const now = new Date();
      if (test.schedule.startDate && now < new Date(test.schedule.startDate)) {
        return res.status(400).json({
          success: false,
          message: `Test starts on ${new Date(test.schedule.startDate).toLocaleString()}`
        });
      }
      if (test.schedule.endDate && now > new Date(test.schedule.endDate)) {
        return res.status(400).json({
          success: false,
          message: 'Test has ended'
        });
      }
    }
    
    // Check if student already joined
    const alreadyJoined = test.allowedStudents?.find(
      s => s.studentId && s.studentId.toString() === studentId.toString()
    );
    
    if (!alreadyJoined) {
      // Add student to test
      test.allowedStudents.push({
        studentId,
        email: user.email,
        name: user.name,
        status: 'pending'
      });
      await test.save();
    }
    
    res.json({
      success: true,
      message: 'Joined test successfully',
      data: {
        testId: test._id,
        title: test.title,
        timeLimit: test.timeLimit,
        totalQuestions: test.totalQuestions,
        schedule: test.schedule
      }
    });
    
  } catch (error) {
    console.error('Error joining test:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};


const getStudentTestById = async (req, res) => {
  try {
    const testId = req.params.id;
    const userId = req.user.id;

    // Find the test
    const test = await TeacherAptitude.findById(testId)
      .select('-questions.correctAnswer'); // Hide correct answers from students

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Check if user has joined this test
    const user = await User.findById(userId);
    const hasJoined = user.joinedTests?.some(
      j => j.testId.toString() === testId
    );

    if (!hasJoined) {
      return res.status(403).json({
        success: false,
        message: 'You have not joined this test'
      });
    }

    // Get user's attempts for this test
    const attempts = await TeacherAptitudeAttempt.find({
      testId,
      studentId: userId
    }).sort({ createdAt: -1 });

    const latestAttempt = attempts[0] || null;

    res.json({
      success: true,
      data: {
        ...test.toObject(),
        userAttempts: attempts,
        latestAttempt,
        totalAttempts: attempts.length
      }
    });

  } catch (error) {
    console.error('Error fetching student test:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching test details',
      error: error.message
    });
  }
};

// Get student's attempts for a specific test
const getStudentAttempts = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user.id;

    const attempts = await TeacherAptitudeAttempt.find({
      testId,
      studentId: userId
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: attempts
    });

  } catch (error) {
    console.error('Error fetching student attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attempts',
      error: error.message
    });
  }
};

// Get single attempt details for student
const getStudentAttemptById = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await TeacherAptitudeAttempt.findById(attemptId)
      .populate('testId');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    // Verify this attempt belongs to the user
    if (attempt.studentId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this attempt'
      });
    }

    res.json({
      success: true,
      data: attempt
    });

  } catch (error) {
    console.error('Error fetching attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attempt',
      error: error.message
    });
  }
};
module.exports = {
  createTest,
  getMyTests,
  getTestById,
  updateTest,
  deleteTest,
  toggleTestStatus,
  regenerateJoinCode,
  getTestStats,
  addStudents,
  removeStudent,
  getTestByJoinCode,
  joinTestByCode,
  getStudentTestById,
  getStudentAttempts,
  getStudentAttemptById
};