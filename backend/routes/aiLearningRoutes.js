// routes/aiLearningRoutes.js
const express = require('express');
const router = express.Router();
const AILearningController = require('../controllers/AILearningController');
const { protect } = require('../middlewares/authMiddleware'); // Make sure this path is correct

// AI Learning and Recommendation routes
router.post('/learning-recommendations', protect, AILearningController.getLearningRecommendations);
router.post('/generate-practice-questions', protect, AILearningController.generatePracticeQuestions);
router.post('/create-study-plan', protect, AILearningController.createStudyPlan);
router.get('/user-progress/:userId', protect, AILearningController.getUserProgress);
router.post('/update-learning-path', protect, AILearningController.updateLearningPath);

module.exports = router;