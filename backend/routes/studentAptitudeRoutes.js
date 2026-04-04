// routes/studentAptitudeRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const TeacherAptitude = require('../Models/TeacherAptitude');
const TeacherAptitudeAttempt = require('../Models/TeacherAptitudeAttempt');
const User = require('../Models/User');
const {  getStudentTestById,getStudentAttempts,getStudentAttemptById } = require('../controllers/teacherAptitudeController')

// ============= TEST JOINING ENDPOINTS =============
// Get test details for students (verify they have access)
router.get('/test/:id', protect, getStudentTestById);

// Get student's attempts for a test
router.get('/attempts/:testId', protect, getStudentAttempts);

// Get single attempt details
router.get('/attempt/:attemptId', protect, getStudentAttemptById);

// Get test preview by join code (no auth required for preview)
router.get('/join/:joinCode', async (req, res) => {
  try {
    const { joinCode } = req.params;
    
    const test = await TeacherAptitude.findOne({ 
      joinCode: joinCode.toUpperCase(),
      isActive: true 
    }).select('title description timeLimit totalQuestions totalMarks difficulty schedule scoring');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Invalid join code or test not active'
      });
    }

    res.json({
      success: true,
      data: test
    });
  } catch (error) {
    console.error('Error in /join/:joinCode:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Join test (authenticated)
router.post('/join', protect, async (req, res) => {
  try {
    const { joinCode } = req.body;
    const userId = req.user.id;

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

    // Check if user already joined
    const user = await User.findById(userId);
    const alreadyJoined = user.joinedTests?.some(
      j => j.testId.toString() === test._id.toString()
    );

    if (!alreadyJoined) {
      // Add to user's joined tests
      user.joinedTests = user.joinedTests || [];
      user.joinedTests.push({
        testId: test._id,
        joinCode: test.joinCode,
        joinedAt: new Date()
      });
      await user.save();

      // Add to test's allowed students
      test.allowedStudents = test.allowedStudents || [];
      test.allowedStudents.push({
        studentId: userId,
        email: user.email,
        name: user.name,
        joinedAt: new Date(),
        status: 'active'
      });
      await test.save();
    }

    res.json({
      success: true,
      message: 'Successfully joined test',
      data: {
        testId: test._id,
        title: test.title,
        timeLimit: test.timeLimit,
        totalQuestions: test.totalQuestions
      }
    });
  } catch (error) {
    console.error('Error in /join:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's joined tests
router.get('/joined', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'joinedTests.testId',
        model: 'TeacherAptitude',
        select: 'title description timeLimit totalQuestions totalMarks difficulty schedule scoring'
      });

    const joinedTests = user.joinedTests
      .filter(j => j.testId) // Remove any with missing test data
      .map(j => ({
        ...j.testId.toObject(),
        joinedAt: j.joinedAt,
        status: j.status
      }));

    res.json({
      success: true,
      data: joinedTests
    });
  } catch (error) {
    console.error('Error in /joined:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get specific joined test details
router.get('/joined/:testId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const joinedTest = user.joinedTests?.find(
      j => j.testId.toString() === req.params.testId
    );

    if (!joinedTest) {
      return res.status(404).json({
        success: false,
        message: 'Test not found in your joined list'
      });
    }

    const test = await TeacherAptitude.findById(req.params.testId)
      .select('-questions.correctAnswer'); // Hide correct answers

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...test.toObject(),
        joinedAt: joinedTest.joinedAt,
        lastAccessed: joinedTest.lastAccessed
      }
    });
  } catch (error) {
    console.error('Error in /joined/:testId:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============= ATTEMPT MANAGEMENT ENDPOINTS =============

// Check for existing active attempt
router.get('/attempt/active/:testId', protect, async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user.id;

    const existingAttempt = await TeacherAptitudeAttempt.findOne({
      testId,
      studentId: userId,
      status: 'in-progress'
    });

    if (!existingAttempt) {
      return res.status(404).json({
        success: false,
        message: 'No active attempt found'
      });
    }

    res.json({
      success: true,
      data: existingAttempt
    });
  } catch (error) {
    console.error('Error checking active attempt:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// In your backend routes/studentAptitudeRoutes.js
router.post('/attempt/start', protect, async (req, res) => {
  try {
    const { testId, startTime } = req.body;
    const userId = req.user.id;

    // Check if user has access to this test
    const user = await User.findById(userId);
    const hasAccess = user.joinedTests?.some(
      j => j.testId.toString() === testId
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this test'
      });
    }

    const test = await TeacherAptitude.findById(testId);
    
    // Check for existing in-progress attempt
    const existingAttempt = await TeacherAptitudeAttempt.findOne({
      testId,
      studentId: userId,
      status: 'in-progress'
    });

    if (existingAttempt) {
      return res.json({
        success: true,
        data: existingAttempt,
        message: 'Existing attempt found'
      });
    }

    // Create new attempt
    const attempt = new TeacherAptitudeAttempt({
      studentId: userId,
      testId,
      joinCode: test.joinCode,
      startedAt: startTime || new Date(),
      status: 'in-progress'
    });

    await attempt.save();

    res.status(201).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Error starting attempt:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Resume an existing attempt
router.post('/attempt/resume', protect, async (req, res) => {
  try {
    const { attemptId, resumeTime, deviceInfo } = req.body;
    const userId = req.user.id;

    const attempt = await TeacherAptitudeAttempt.findById(attemptId)
      .populate('testId');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    if (attempt.studentId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this attempt'
      });
    }

    // Update device info if provided
    if (deviceInfo) {
      attempt.deviceInfo = deviceInfo;
    }

    attempt.lastActiveAt = new Date();
    await attempt.save();

    res.json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Error resuming attempt:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit an answer
router.post('/attempt/answer', protect, async (req, res) => {
  try {
    const { attemptId, questionId, selectedAnswer, timeTaken, timestamp } = req.body;
    const userId = req.user.id;

    const attempt = await TeacherAptitudeAttempt.findById(attemptId)
      .populate('testId');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    if (attempt.studentId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this attempt'
      });
    }

    if (attempt.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'This attempt is no longer in progress'
      });
    }

    const test = attempt.testId;
    const question = test.questions.id(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if answer is correct
    const isCorrect = question.correctAnswer === selectedAnswer;

    // Check if question already answered
    const existingAnswerIndex = attempt.answers.findIndex(
      a => a.questionId.toString() === questionId
    );

    const answerData = {
      questionId,
      selectedAnswer,
      isCorrect,
      timeTaken: timeTaken || 0,
      answeredAt: timestamp || new Date()
    };

    if (existingAnswerIndex >= 0) {
      // Update existing answer
      attempt.answers[existingAnswerIndex] = answerData;
    } else {
      // Add new answer
      attempt.answers.push(answerData);
    }

    attempt.lastActiveAt = new Date();
    await attempt.save();

    res.json({
      success: true,
      data: { isCorrect }
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Complete an attempt
router.post('/attempt/complete', protect, async (req, res) => {
  try {
    const { attemptId, submissionReason, answers, timeRemaining } = req.body;
    const userId = req.user.id;

    const attempt = await TeacherAptitudeAttempt.findById(attemptId)
      .populate('testId');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    if (attempt.studentId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this attempt'
      });
    }

    const test = attempt.testId;
    let totalScore = 0;
    const totalMarks = test.totalMarks || test.questions.length;

    // Calculate score
    test.questions.forEach(question => {
      const userAnswer = answers?.[question._id] || 
        attempt.answers.find(a => a.questionId.toString() === question._id.toString())?.selectedAnswer;
      
      if (userAnswer !== undefined && userAnswer !== null) {
        const isCorrect = question.correctAnswer === userAnswer;
        if (isCorrect) {
          totalScore += question.marks || 1;
        } else if (test.scoring?.negativeMarking) {
          totalScore -= (test.scoring.negativeMarks || 0.25);
        }
      }
    });

    // Ensure score doesn't go negative
    totalScore = Math.max(0, totalScore);

    // Calculate percentage
    const percentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;

    attempt.score = totalScore;
    attempt.totalMarks = totalMarks;
    attempt.percentage = Math.round(percentage * 100) / 100;
    attempt.passed = percentage >= (test.scoring?.passingScore || 60);
    attempt.completedAt = new Date();
    attempt.status = 'completed';
    attempt.timeSpent = test.timeLimit * 60 - (timeRemaining || 0);

    await attempt.save();

    // Update user's joined test status
    await User.updateOne(
      { _id: userId, 'joinedTests.testId': test._id },
      { 
        $set: { 
          'joinedTests.$.status': 'completed',
          'joinedTests.$.lastAccessed': new Date() 
        }
      }
    );

    res.json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Error completing attempt:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all attempts for a test (for user)
router.get('/attempts/:testId', protect, async (req, res) => {
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
    console.error('Error fetching attempts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single attempt details
router.get('/attempt/:attemptId', protect, async (req, res) => {
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
    res.status(500).json({ success: false, message: error.message });
  }
});

// Auto-save progress
router.post('/attempt/auto-save', protect, async (req, res) => {
  try {
    const { attemptId, answers, currentQuestionIndex, timeLeft, questionTimes } = req.body;
    const userId = req.user.id;

    const attempt = await TeacherAptitudeAttempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    if (attempt.studentId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this attempt'
      });
    }

    // Update answers if provided
    if (answers) {
      Object.entries(answers).forEach(([questionId, selectedAnswer]) => {
        const existingIndex = attempt.answers.findIndex(
          a => a.questionId.toString() === questionId
        );

        const answerData = {
          questionId,
          selectedAnswer,
          answeredAt: new Date()
        };

        if (existingIndex >= 0) {
          attempt.answers[existingIndex] = answerData;
        } else {
          attempt.answers.push(answerData);
        }
      });
    }

    attempt.lastActiveAt = new Date();
    await attempt.save();

    res.json({
      success: true,
      message: 'Progress saved'
    });
  } catch (error) {
    console.error('Error auto-saving:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;