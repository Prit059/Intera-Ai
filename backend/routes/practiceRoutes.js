// routes/practiceRoutes.js
const express = require("express");
const {
  startPracticeSession,
  submitRecording,
  getNextQuestion
} = require("../controllers/practiceController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/start", protect, startPracticeSession);
router.post("/submit-recording", protect, submitRecording);
router.get("/next-question/:practiceSessionId", protect, getNextQuestion);


module.exports = router;