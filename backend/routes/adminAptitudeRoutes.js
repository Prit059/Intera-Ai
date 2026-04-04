const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middlewares/authMiddleware");
const {
  createTopic,
  getAllTopicsAdmin,
  getTopicByIdAdmin,
  updateTopic,
  deleteTopic,
  togglePublish,
  toggleFeatured,
  getAdminStats,
  bulkUpdateTopics
} = require("../controllers/AdAptitudeTopicController");
router.use(protect);
router.use(requireRole("admin"));
  // Topic management
  router.post("/createtopics",  createTopic);
  router.get("/topics",  getAllTopicsAdmin);  
router.get("/topics/:id",  getTopicByIdAdmin);
router.put("/topics/:id",  updateTopic);
router.delete("/topics/:id",  deleteTopic);
// Topic status management
router.put("/topics/:id/publish",  togglePublish);
router.put("/topics/:id/feature",  toggleFeatured);

// Bulk operations
router.put("/topics/bulk",  bulkUpdateTopics);
// Admin dashboard
router.get("/stats",  getAdminStats);

module.exports = router;