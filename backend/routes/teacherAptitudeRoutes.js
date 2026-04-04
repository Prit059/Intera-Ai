// routes/teacherAptitudeRoutes.js
const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middlewares/authMiddleware');

const {
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
  getTestByJoinCode
} = require('../controllers/teacherAptitudeController');

// All teacher routes require authentication and teacher role
router.use(protect);
router.use(requireRole('teacher'));

// Test management
router.post('/create', createTest);
router.get('/my-tests', getMyTests);
router.get('/test/:id', getTestById);
router.put('/test/:id', updateTest);
router.delete('/test/:id', deleteTest);
router.patch('/test/:id/toggle-status', toggleTestStatus);
router.post('/test/:id/regenerate-code', regenerateJoinCode);

// Statistics
router.get('/test/:id/stats', getTestStats);

// Student management
router.post('/test/:testId/add-students', addStudents);
router.delete('/test/:testId/students/:studentId', removeStudent);

// Public route for students to join (no auth required)
router.get('/join/:joinCode', getTestByJoinCode);

module.exports = router;