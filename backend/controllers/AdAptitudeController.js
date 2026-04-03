// controllers/quizController.js
const AdAptitude = require('../Models/AdAptitude');
const AdAptitudeAttempt = require('../Models/AdAptitudeAttempt');
const User = require('../Models/User')
// Create new quiz
const createQuiz = async (req, res) => {
  try {
    const quizData = {
      ...req.body,
      createdBy: req.user.id
    };

    const quiz = new AdAptitude(quizData);
    await quiz.save();

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating quiz',
      error: error.message
    });
  }
};

// Get all quizzes (for admin/list view)
const getAllQuizzes = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, difficulty, status } = req.query;
    
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
    if (status === 'active') filter.isActive = true;
    
    const quizzes = await AdAptitude.find(filter)
      .select('-questions') // Exclude questions for list view
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await AdAptitude.countDocuments(filter);
    
    res.json({
      success: true,
      data: quizzes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quizzes',
      error: error.message
    });
  }
};

// Get quiz by ID (for student attempt) - FIXED
const getQuizById = async (req, res) => {
  try {
    const quiz = await AdAptitude.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // For students, don't include correct answers but keep other question data
    const quizForStudent = {
      ...quiz.toObject(),
      questions: quiz.questions.map(question => ({
        _id: question._id,
        questionText: question.questionText,
        questionType: question.questionType,
        options: question.options,
        marks: question.marks,
        timeLimit: question.timeLimit,
        imageUrl: question.imageUrl,
        difficulty: question.difficulty,
        // Don't send correctAnswer and explanation to student
      }))
    };
    
    res.json({
      success: true,
      data: quizForStudent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz',
      error: error.message
    });
  }
};

// Get quiz with answers (for review/results) - FIXED
const getQuizWithAnswers = async (req, res) => {
  try {
    const quiz = await AdAptitude.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz',
      error: error.message
    });
  }
};

// Update quiz
const updateQuiz = async (req, res) => {
  try {
    const quiz = await AdAptitude.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating quiz',
      error: error.message
    });
  }
};

// Delete quiz
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await AdAptitude.findByIdAndDelete(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Also delete all attempts for this quiz
    await AdAptitudeAttempt.deleteMany({ quizId: req.params.id });
    
    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting quiz',
      error: error.message
    });
  }
};

// Toggle quiz active status
const toggleQuizStatus = async (req, res) => {
  try {
    const quiz = await AdAptitude.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    quiz.isActive = !quiz.isActive;
    await quiz.save();
    
    res.json({
      success: true,
      message: `Quiz ${quiz.isActive ? 'activated' : 'deactivated'} successfully`,
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating quiz status',
      error: error.message
    });
  }
};

const getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await AdAptitude.find({ createdBy: req.user.id }).select('-questions');
    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your quizzes',
      error: error.message
    });
  }
}
// controllers/quizController.js - ADD THESE FUNCTIONS

// Get Friday contests only
const getFridayContests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { contestType: 'friday' };
    
    // Filter by status
    if (status === 'active') {
      filter.isActive = true;
      filter['schedule.startDate'] = { $lte: new Date() };
      filter['schedule.endDate'] = { $gte: new Date() };
    } else if (status === 'upcoming') {
      filter['schedule.startDate'] = { $gt: new Date() };
    } else if (status === 'completed') {
      filter['schedule.endDate'] = { $lt: new Date() };
    }
    
    const contests = await AdAptitude.find(filter)
      .select('-questions')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Get participant counts for each contest
    const contestsWithStats = await Promise.all(contests.map(async (contest) => {
      const participantCount = await AdAptitudeAttempt.countDocuments({ 
        quizId: contest._id,
        status: 'completed'
      });
      return {
        ...contest.toObject(),
        participantsCount: participantCount
      };
    }));
    
    const total = await AdAptitude.countDocuments(filter);
    
    res.json({
      success: true,
      data: contestsWithStats,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Friday contests',
      error: error.message
    });
  }
};

// Get Friday contest statistics with detailed analytics
const getFridayContestStats = async (req, res) => {
  try {
    const { contestId } = req.params;
    
    const contest = await AdAptitude.findById(contestId);
    if (!contest || contest.contestType !== 'friday') {
      return res.status(404).json({
        success: false,
        message: 'Friday contest not found'
      });
    }
    
    const attempts = await AdAptitudeAttempt.find({ 
      quizId: contestId,
      status: 'completed'
    }).populate('userId', 'name email');
    
    const totalParticipants = attempts.length;
    
    if (totalParticipants === 0) {
      return res.json({
        success: true,
        data: {
          contest: {
            title: contest.title,
            category: contest.category,
            difficulty: contest.difficulty,
            timeLimit: contest.timeLimit,
            totalQuestions: contest.questions.length,
            totalMarks: contest.totalMarks
          },
          stats: {
            totalParticipants: 0,
            averageScore: 0,
            highestScore: 0,
            lowestScore: 0,
            averageTimeSpent: 0,
            completionRate: 0,
            passRate: 0
          },
          topPerformers: [],
          questionWiseStats: contest.questions.map((q, idx) => ({
            questionNumber: idx + 1,
            questionText: q.questionText.substring(0, 100),
            correctRate: 0,
            averageTime: 0,
            difficulty: q.difficulty
          }))
        }
      });
    }
    
    // Calculate statistics
    const scores = attempts.map(a => a.percentage || 0);
    const timeSpent = attempts.map(a => a.timeSpent || 0);
    const passedCount = attempts.filter(a => a.passed === true).length;
    
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalParticipants);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const averageTimeSpent = Math.round(timeSpent.reduce((a, b) => a + b, 0) / totalParticipants);
    const passRate = Math.round((passedCount / totalParticipants) * 100);
    
    // Calculate question-wise statistics
    const questionWiseStats = contest.questions.map((question, qIndex) => {
      let correctCount = 0;
      let totalTime = 0;
      let answeredCount = 0;
      
      attempts.forEach(attempt => {
        const answer = attempt.answers.find(a => 
          a.questionId && a.questionId.toString() === question._id.toString()
        );
        if (answer) {
          answeredCount++;
          totalTime += answer.timeTaken || 0;
          if (answer.isCorrect) correctCount++;
        }
      });
      
      return {
        questionNumber: qIndex + 1,
        questionText: question.questionText.substring(0, 100),
        correctRate: Math.round((correctCount / totalParticipants) * 100),
        averageTime: answeredCount > 0 ? Math.round(totalTime / answeredCount) : 0,
        difficulty: question.difficulty,
        marks: question.marks
      };
    });
    
    // Get top 10 performers
    const topPerformers = attempts
      .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
      .slice(0, 10)
      .map(attempt => ({
        name: attempt.userId?.name || 'Anonymous',
        email: attempt.userId?.email,
        score: attempt.percentage || 0,
        timeSpent: attempt.timeSpent || 0,
        completedAt: attempt.completedAt
      }));
    
    // Get difficulty-wise performance
    const difficultyWiseStats = {};
    contest.questions.forEach(question => {
      const difficulty = question.difficulty;
      if (!difficultyWiseStats[difficulty]) {
        difficultyWiseStats[difficulty] = { total: 0, correct: 0 };
      }
      difficultyWiseStats[difficulty].total++;
      
      attempts.forEach(attempt => {
        const answer = attempt.answers.find(a => 
          a.questionId && a.questionId.toString() === question._id.toString()
        );
        if (answer && answer.isCorrect) {
          difficultyWiseStats[difficulty].correct++;
        }
      });
    });
    
    // Calculate difficulty-wise percentages
    Object.keys(difficultyWiseStats).forEach(diff => {
      const stats = difficultyWiseStats[diff];
      stats.percentage = Math.round((stats.correct / (stats.total * totalParticipants)) * 100);
    });
    
    res.json({
      success: true,
      data: {
        contest: {
          _id: contest._id,
          title: contest.title,
          category: contest.category,
          difficulty: contest.difficulty,
          timeLimit: contest.timeLimit,
          totalQuestions: contest.questions.length,
          totalMarks: contest.totalMarks,
          schedule: contest.schedule,
          isActive: contest.isActive
        },
        stats: {
          totalParticipants,
          averageScore,
          highestScore,
          lowestScore,
          averageTimeSpent,
          completionRate: Math.round((totalParticipants / totalParticipants) * 100),
          passRate
        },
        topPerformers,
        questionWiseStats,
        difficultyWiseStats,
        scoreDistribution: calculateScoreDistribution(scores)
      }
    });
  } catch (error) {
    console.error('Error fetching Friday contest stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contest statistics',
      error: error.message
    });
  }
};

// Helper function for score distribution
const calculateScoreDistribution = (scores) => {
  const distribution = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0
  };
  
  scores.forEach(score => {
    if (score <= 20) distribution['0-20']++;
    else if (score <= 40) distribution['21-40']++;
    else if (score <= 60) distribution['41-60']++;
    else if (score <= 80) distribution['61-80']++;
    else distribution['81-100']++;
  });
  
  return distribution;
};

// Get upcoming Friday contest
const getUpcomingFridayContest = async (req, res) => {
  try {
    const now = new Date();
    const contest = await AdAptitude.findOne({
      contestType: 'friday',
      isActive: true,
      'schedule.startDate': { $gt: now }
    }).sort({ 'schedule.startDate': 1 });
    
    res.json({
      success: true,
      data: contest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming contest',
      error: error.message
    });
  }
};

// Get active Friday contest
const getActiveFridayContest = async (req, res) => {
  try {
    const now = new Date();
    const contest = await AdAptitude.findOne({
      contestType: 'friday',
      isActive: true,
      'schedule.startDate': { $lte: now },
      'schedule.endDate': { $gte: now }
    });
    
    res.json({
      success: true,
      data: contest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active contest',
      error: error.message
    });
  }
};

// Clone contest for next Friday
const cloneFridayContest = async (req, res) => {
  try {
    const { contestId } = req.params;
    const originalContest = await AdAptitude.findById(contestId);
    
    if (!originalContest || originalContest.contestType !== 'friday') {
      return res.status(404).json({
        success: false,
        message: 'Friday contest not found'
      });
    }
    
    // Calculate next Friday
    const nextFriday = new Date();
    const daysUntilFriday = (5 - nextFriday.getDay() + 7) % 7;
    if (daysUntilFriday === 0 && nextFriday.getHours() >= 18) {
      nextFriday.setDate(nextFriday.getDate() + 7);
    } else {
      nextFriday.setDate(nextFriday.getDate() + daysUntilFriday);
    }
    nextFriday.setHours(18, 0, 0, 0); // 6 PM
    
    const nextFridayEnd = new Date(nextFriday);
    nextFridayEnd.setHours(nextFridayEnd.getHours() + 2); // 2 hours duration
    
    // Create cloned contest
    const clonedContest = new AdAptitude({
      ...originalContest.toObject(),
      _id: undefined,
      title: `${originalContest.title} - ${nextFriday.toLocaleDateString()}`,
      schedule: {
        startDate: nextFriday,
        startTime: '18:00',
        endDate: nextFridayEnd,
        endTime: '20:00'
      },
      createdBy: req.user.id,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await clonedContest.save();
    
    res.json({
      success: true,
      message: 'Contest cloned successfully for next Friday',
      data: clonedContest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cloning contest',
      error: error.message
    });
  }
};

// Add to module.exports
module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  getMyQuizzes,
  getQuizWithAnswers,
  updateQuiz,
  deleteQuiz,
  toggleQuizStatus,
  getFridayContests,        // NEW
  getFridayContestStats,    // NEW
  getUpcomingFridayContest, // NEW
  getActiveFridayContest,   // NEW
  cloneFridayContest        // NEW
};