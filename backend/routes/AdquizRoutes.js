const express = require("express");
const { createQuiz, getAllQuizzes, getMyQuizzes, getQuizById, updateQuiz, deleteQuiz, getActiveQuizzes } = require("../controllers/AdquizController")
const { protect } = require("../middlewares/authMiddleware");


const router = express.Router();

// Public routes
router.get("/active", getActiveQuizzes);
router.get("/:id", getQuizById);

router.post("/create-quiz", protect, createQuiz);
router.get("/", getAllQuizzes);
router.get("/my/quizzes", protect, getMyQuizzes);
router.put("/:id", protect, updateQuiz);
router.delete("/:id", protect, deleteQuiz);

module.exports = router;  