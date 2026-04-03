// controllers/AdAptitudeAttemptController.js - COMPLETE FIXED VERSION
const AdAptitudeAttempt = require('../Models/AdAptitudeAttempt');
const AdAptitude = require('../Models/AdAptitude');
const User = require('../Models/User');

// Start quiz attempt with security checks
const startAttempt = async (req, res) => {
  try {
    const { quizId } = req.body;
    const userId = req.user._id;
    
    const quiz = await AdAptitude.findById(quizId);
    if (!quiz || !quiz.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found or inactive'
      });
    }

    // Check max attempts
    const previousAttempts = await AdAptitudeAttempt.countDocuments({ userId, quizId });
    const maxAttempts = quiz.scoring.maxAttempts === 'unlimited' ? Infinity : parseInt(quiz.scoring.maxAttempts);
    
    if (previousAttempts >= maxAttempts) {
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts reached'
      });
    }

    const attempt = new AdAptitudeAttempt({
      userId,
      quizId,
      attemptNumber: previousAttempts + 1,
      startedAt: new Date(),
      safeModeEnabled: quiz.security.safeMode
    });

    await attempt.save();
    
    res.status(201).json({
      success: true,
      message: 'Quiz attempt started',
      data: attempt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error starting attempt',
      error: error.message
    });
  }
};


const submitAnswer = async (req, res) => {
  try {
    const { attemptId, questionId, selectedAnswer, timeTaken, violation } = req.body;
    const userId = req.user._id;

    console.log('Submitting answer with timeTaken:', timeTaken); // Add logging

    const attempt = await AdAptitudeAttempt.findById(attemptId);
    if (!attempt || attempt.userId.toString() !== userId.toString()) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    // Handle violations (if any)
    if (violation) {
      attempt.violations.push({
        type: violation.type || 'general',
        timestamp: new Date(),
        severity: violation.severity || 'medium'
      });
      attempt.warningsCount = attempt.violations.length;
      
      // Terminate if max violations reached
      const quiz = await AdAptitude.findById(attempt.quizId);
      if (attempt.warningsCount >= quiz.security.maxViolations) {
        attempt.status = 'terminated';
        attempt.terminatedReason = 'Maximum violations reached';
        await attempt.save();
        return res.status(400).json({
          success: false,
          message: 'Attempt terminated due to multiple violations',
          terminated: true
        });
      }
    }

    const quiz = await AdAptitude.findById(attempt.quizId);
    const question = quiz.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Check if answer is correct
    const isCorrect = checkAnswer(selectedAnswer, question.correctAnswer, question.questionType);
    
    console.log('Answer Submission Details:', {
      questionId,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      questionType: question.questionType,
      isCorrect,
      timeTaken
    });

    // Update or add answer
    const answerIndex = attempt.answers.findIndex(a => 
      a.questionId && a.questionId.toString() === questionId.toString()
    );
    
    if (answerIndex > -1) {
      // Update existing answer
      attempt.answers[answerIndex] = { 
        questionId, 
        selectedAnswer, 
        isCorrect, 
        timeTaken: timeTaken || 0, 
        answeredAt: new Date() 
      };
    } else {
      // Add new answer
      attempt.answers.push({ 
        questionId, 
        selectedAnswer, 
        isCorrect, 
        timeTaken: timeTaken || 0, 
        answeredAt: new Date() 
      });
    }

    // Update last active time
    attempt.lastActiveAt = new Date();

    await attempt.save();

    res.json({
      success: true,
      message: 'Answer submitted',
      data: { isCorrect, warnings: attempt.warningsCount }
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting answer',
      error: error.message
    });
  }
};

// Complete attempt with detailed analysis - FIXED
const completeAttempt = async (req, res) => {
  try {
    const { attemptId } = req.body;
    const userId = req.user._id;

    const attempt = await AdAptitudeAttempt.findById(attemptId).populate('quizId');
    if (!attempt || attempt.userId.toString() !== userId.toString()) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    const quiz = attempt.quizId;
    let totalScore = 0;
    let totalMarks = 0;
    const analysis = {
      totalCorrect: 0,
      totalWrong: 0,
      totalSkipped: 0,
      accuracy: 0,
      averageTimePerQuestion: 0,
      categoryWisePerformance: {},
      difficultyWisePerformance: {},
      timeManagementScore: 0
    };

    // Calculate scores and analysis - FIXED LOGIC
    quiz.questions.forEach(question => {
      const userAnswer = attempt.answers.find(a => 
        a.questionId && a.questionId.toString() === question._id.toString()
      );
      
      const questionMarks = question.marks || quiz.scoring.pointsPerQuestion || 1;
      totalMarks += questionMarks;

      if (userAnswer) {
        if (userAnswer.isCorrect === true) {
          totalScore += questionMarks;
          analysis.totalCorrect++;
        } else {
          analysis.totalWrong++;
          // Apply negative marking only for wrong answers
          if (quiz.scoring.negativeMarking) {
            totalScore -= (quiz.scoring.negativeMarks || 0.25);
          }
        }

        // Category-wise performance
        const category = quiz.category || 'General';
        if (!analysis.categoryWisePerformance[category]) {
          analysis.categoryWisePerformance[category] = { correct: 0, total: 0 };
        }
        analysis.categoryWisePerformance[category].total++;
        if (userAnswer.isCorrect) {
          analysis.categoryWisePerformance[category].correct++;
        }

        // Difficulty-wise performance
        const difficulty = question.difficulty || 'Medium';
        if (!analysis.difficultyWisePerformance[difficulty]) {
          analysis.difficultyWisePerformance[difficulty] = { correct: 0, total: 0 };
        }
        analysis.difficultyWisePerformance[difficulty].total++;
        if (userAnswer.isCorrect) {
          analysis.difficultyWisePerformance[difficulty].correct++;
        }
      } else {
        analysis.totalSkipped++;
      }
    });

    // Calculate analytics
    analysis.accuracy = analysis.totalCorrect > 0 ? 
      (analysis.totalCorrect / (analysis.totalCorrect + analysis.totalWrong)) * 100 : 0;
    
    const totalAnswered = analysis.totalCorrect + analysis.totalWrong;
    analysis.averageTimePerQuestion = totalAnswered > 0 ? 
      attempt.answers.reduce((sum, a) => sum + (a.timeTaken || 0), 0) / totalAnswered : 0;

    // Ensure score doesn't go negative
    totalScore = Math.max(0, totalScore);
    const percentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;

    // Update attempt
    attempt.score = totalScore;
    attempt.totalMarks = totalMarks;
    attempt.percentage = Math.round(percentage);
    attempt.passed = percentage >= (quiz.scoring.passingScore || 60);
    attempt.completedAt = new Date();
    attempt.status = 'completed';
    attempt.timeSpent = Math.floor((new Date() - attempt.startedAt) / 1000);
    attempt.analysis = analysis;

    await attempt.save();

    console.log('Attempt completed successfully:', {
      attemptId: attempt._id,
      score: totalScore,
      totalMarks,
      percentage,
      correct: analysis.totalCorrect,
      wrong: analysis.totalWrong,
      skipped: analysis.totalSkipped
    });

    res.json({
      success: true,
      message: 'Quiz completed successfully',
      data: attempt
    });

  } catch (error) {
    console.error('Complete attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing attempt',
      error: error.message
    });
  }
};

// Get detailed results with proper data structure - FIXED
const getDetailedResults = async (req, res) => {
  try {
    console.log('Fetching detailed results for attempt:', req.params.attemptId);
    
    const attempt = await AdAptitudeAttempt.findById(req.params.attemptId)
      .populate('quizId');
    
    if (!attempt) {
      console.log('Attempt not found:', req.params.attemptId);
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    if (attempt.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const quiz = attempt.quizId;
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Create proper detailed results structure
    const detailedResults = {
      _id: attempt._id,
      userId: attempt.userId,
      quizId: attempt.quizId,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      passed: attempt.passed,
      timeSpent: attempt.timeSpent,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      violations: attempt.violations || [],
      analysis: attempt.analysis || {},
      questions: quiz.questions.map(question => {
        const userAnswer = attempt.answers.find(a => 
          a.questionId && a.questionId.toString() === question._id.toString()
        );
        
        return {
          _id: question._id,
          questionText: question.questionText,
          questionType: question.questionType,
          options: question.options || [],
          correctAnswer: question.correctAnswer,
          explanation: question.explanation || '',
          marks: question.marks || 1,
          difficulty: question.difficulty || 'Medium',
          imageUrl: question.imageUrl,
          category: quiz.category,
          userAnswer: userAnswer ? userAnswer.selectedAnswer : null,
          isCorrect: userAnswer ? userAnswer.isCorrect : false,
          timeSpent: userAnswer ? userAnswer.timeTaken : 0,
          answeredAt: userAnswer ? userAnswer.answeredAt : null
        };
      })
    };

    console.log('Detailed results prepared:', {
      attemptId: detailedResults._id,
      questionsCount: detailedResults.questions.length,
      score: detailedResults.score
    });

    res.json({ 
      success: true, 
      data: detailedResults 
    });
  } catch (error) {
    console.error('Error fetching detailed results:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching detailed results',
      error: error.message
    });
  }
};

const getUserAttemptsForAptitude = async (req, res) => {
  try {
    const { aptitudeId } = req.params;
    const userId = req.user._id;

    console.log('Fetching attempts for aptitude:', aptitudeId, 'user:', userId);

    // CRITICAL FIX: Add userId filter here
    const attempts = await AdAptitudeAttempt.find({ 
      userId: userId, // This was missing!
      quizId: aptitudeId 
    })
    .populate('quizId', 'title category difficulty timeLimit totalMarks totalQuestions scoring')
    .sort({ completedAt: -1, startedAt: -1 });

    console.log('Found attempts for current user:', attempts.length);

    res.json({
      success: true,
      data: attempts,
      count: attempts.length
    });
  } catch (error) {
    console.error('Error fetching user attempts for aptitude:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user attempts',
      error: error.message
    });
  }
};

// Get attempt results by ID
const getAttemptResults = async (req, res) => {
  try {
    const attempt = await AdAptitudeAttempt.findById(req.params.id)
      .populate('quizId');
    
    if (!attempt || attempt.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    res.json({ success: true, data: attempt });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching results',
      error: error.message
    });
  }
};

// Get leaderboard with proper user data - FIXED
const getLeaderboard = async (req, res) => {
  try {
    const { aptitudeId } = req.params;
    const { limit = 20 } = req.query;

    console.log('Fetching leaderboard for aptitude:', aptitudeId);

    const leaderboard = await AdAptitudeAttempt.find({ 
      quizId: aptitudeId,
      status: 'completed' 
    })
    .populate('userId', 'name email')
    .sort({ score: -1, timeSpent: 1 })
    .limit(parseInt(limit));

    // Format the response properly
    const formattedLeaderboard = leaderboard.map(attempt => ({
      _id: attempt._id,
      user: {
        _id: attempt.userId?._id,
        name: attempt.userId?.name || 'Anonymous',
        email: attempt.userId?.email
      },
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      timeSpent: attempt.timeSpent,
      passed: attempt.passed,
      completedAt: attempt.completedAt,
      attemptNumber: attempt.attemptNumber
    }));

    console.log('Leaderboard data:', formattedLeaderboard.length, 'entries');

    res.json({ 
      success: true, 
      data: formattedLeaderboard 
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
};

// Helper functions - FIXED answer checking
const checkAnswer = (selected, correct, type) => {
  if (selected === undefined || selected === null) return false;
  
  try {
    console.log('Checking answer:', { selected, correct, type });
    
    switch (type) {
      case 'Multiple Choice (MCQ)':
      case 'True/False':
        return selected === correct;
      
      case 'Multiple Response':
        if (!Array.isArray(selected) || !Array.isArray(correct)) return false;
        // Check if arrays have same elements (order doesn't matter)
        const sortedSelected = [...selected].sort();
        const sortedCorrect = [...correct].sort();
        return JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);
      
      case 'Fill in the Blanks':
      case 'Short Answer':
        const selectedStr = selected.toString().toLowerCase().trim();
        const correctStr = correct.toString().toLowerCase().trim();
        return selectedStr === correctStr;
      
      case 'Matching':
        return JSON.stringify(selected) === JSON.stringify(correct);
      
      default:
        return selected == correct;
    }
  } catch (error) {
    console.error('Error checking answer:', error);
    return false;
  }
};

const logViolation = async (req, res) => {
  try {
    const { attemptId, reason, violationCount, timestamp } = req.body;
    
    await AdAptitudeAttempt.findByIdAndUpdate(
      attemptId,
      { 
        $push: { 
          violations: { 
            type: reason, 
            timestamp: timestamp || new Date(),
            severity: 'medium'
          } 
        },
        $set: { warningsCount: violationCount }
      }
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getUserAttempts = async (req, res) => {
  try {
    const userId = req.user._id; // Get from authenticated user
    const { page = 1, limit = 10 } = req.query;

    console.log('Fetching attempts for user:', userId);

    // Query with userId filter
    const attempts = await AdAptitudeAttempt.find({ userId: userId })
      .populate('quizId', 'title category difficulty timeLimit totalMarks')
      .sort({ completedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AdAptitudeAttempt.countDocuments({ userId: userId });

    console.log('Found attempts:', attempts.length, 'total:', total);

    res.json({
      success: true,
      data: attempts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attempts',
      error: error.message
    });
  }
};

const getUserFridayContestHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const attempts = await AdAptitudeAttempt.find({ userId })
      .populate({
        path: 'quizId',
        match: { contestType: 'friday' },
        select: 'title category difficulty timeLimit schedule contestType'
      })
      .sort({ completedAt: -1 });
    
    // Filter out null quizId (non-friday contests)
    const fridayAttempts = attempts.filter(a => a.quizId !== null);
    
    res.json({
      success: true,
      data: fridayAttempts,
      stats: {
        totalParticipated: fridayAttempts.length,
        averageScore: fridayAttempts.length > 0 
          ? Math.round(fridayAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / fridayAttempts.length)
          : 0,
        bestScore: fridayAttempts.length > 0
          ? Math.max(...fridayAttempts.map(a => a.percentage || 0))
          : 0,
        totalWon: fridayAttempts.filter(a => a.percentage >= 80).length // Top performer badge
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Friday contest history',
      error: error.message
    });
  }
};

module.exports = {
  startAttempt,
  submitAnswer,
  completeAttempt,
  getUserAttempts,
  getUserFridayContestHistory,
  getAttemptResults,
  getDetailedResults,
  getLeaderboard,
  logViolation,
  getUserAttemptsForAptitude
};