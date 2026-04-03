// routes/AdAptitudeRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

// Import controllers
const {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  getMyQuizzes,
  getQuizWithAnswers,
  updateQuiz,
  deleteQuiz,
  toggleQuizStatus,
  getFridayContests,        
  getFridayContestStats,    
  getUpcomingFridayContest, 
  getActiveFridayContest,   
  cloneFridayContest 
} = require('../controllers/AdAptitudeController');

const {
  startAttempt,
  submitAnswer,
  completeAttempt,
  getUserAttempts,
  getAttemptResults,
  getDetailedResults,
  getLeaderboard,
  logViolation,
  getUserAttemptsForAptitude
} = require('../controllers/AdAptitudeAttemptController');

// Quiz management routes (Admin)
router.post('/create-aptitude', protect, createQuiz);
router.get('/', protect, getAllQuizzes);
router.get('/my/quizzes', protect, getMyQuizzes);
router.get('/:id', protect, getQuizById);
router.get('/:id/with-answers', protect, getQuizWithAnswers);
router.put('/:id', protect, updateQuiz);
router.delete('/:id', protect, deleteQuiz);
router.patch('/:id/toggle-status', protect, toggleQuizStatus);

router.get('/friday/all', protect, getFridayContests);
router.get('/friday/active', protect, getActiveFridayContest);
router.get('/friday/upcoming', protect, getUpcomingFridayContest);
router.get('/friday/:contestId/stats', protect, getFridayContestStats);
router.post('/friday/:contestId/clone', protect, cloneFridayContest);

// Quiz attempt routes (Users)
router.post('/attempt/start', protect, startAttempt);
router.post('/attempt/answer', protect, submitAnswer);
router.post('/attempt/complete', protect, completeAttempt);
router.get('/attempts/user', protect, getUserAttempts);
router.get('/attempt/results/:id', protect, getAttemptResults);
router.get('/attempt/detailed-results/:attemptId', protect, getDetailedResults);
router.get('/leaderboard/:aptitudeId', protect, getLeaderboard);
router.post('/attempt/violation', protect, logViolation);
router.get('/user/:aptitudeId', getUserAttemptsForAptitude);

module.exports = router;