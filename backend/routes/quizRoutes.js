// routes/quizRoutes.js
const express = require('express');
const { generateQuiz, submitQuiz, getQuizHistory, getPerformanceAnalytics, getQuizResult, deleteQuiz, getQuizById} = require('../controllers/quizController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/generate', protect, generateQuiz);
router.post('/submit', protect, submitQuiz);
router.get('/history', protect, getQuizHistory);
router.get('/analytics', protect, getPerformanceAnalytics);
router.get('/result/:quizId', protect, getQuizResult);
router.delete('/:quizId', protect, deleteQuiz);
// New routes for fetching quiz by ID and all quizzes
// router.get('/my-quiz', getAllQuizzes);
router.get('/:quizId', protect, getQuizById);

module.exports = router;