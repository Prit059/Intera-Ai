const express = require('express');
const router = express.Router();
const attemptCtrl = require('../controllers/AdquizattemptController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/submit', protect, attemptCtrl.submitAttempt);
router.get('/user-attempts/:id', protect, attemptCtrl.getUserAttempts);
router.get('/leaderboard/:id', attemptCtrl.getLeaderboard);
router.get('/results/:id', protect, attemptCtrl.getResult);
router.get('/detailed-results/:id', protect, attemptCtrl.getDetailedResult);

module.exports = router;
