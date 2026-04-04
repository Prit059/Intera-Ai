const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  getAllTopics,
  getTopicBySlug,
  getCategories,
  getFeaturedTopics,
  getPopularTopics,
  searchTopics,
  rateTopic
} = require("../controllers/aptitudeController");
const {
  getUserProgress,
  updateQuestionAttempt,
  bookmarkTopic,
  markFormulaMastered,
  getBookmarks
} = require("../controllers/progressController");

// Public routes
router.get("/topics", protect, getAllTopics);
router.get("/topics/:slug", protect, getTopicBySlug);
router.get("/categories", protect, getCategories);
router.get("/featured", protect, getFeaturedTopics);
router.get("/popular", protect, getPopularTopics);
router.get("/search", protect, searchTopics);

router.post("/topics/:id/rate", protect, rateTopic);

// User progress routes
router.get("/progress", protect, getUserProgress);
router.post("/progress/attempt", protect, updateQuestionAttempt);
router.post("/progress/bookmark/:topicId", protect, bookmarkTopic);
router.post("/progress/master-formula", protect, markFormulaMastered);
router.get("/progress/bookmarks", protect, getBookmarks);

module.exports = router;