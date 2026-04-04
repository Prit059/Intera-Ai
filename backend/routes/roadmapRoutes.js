const express = require('express');
const Roadmap = require("../Models/Roadmap.js");
const UserProgress = require("../Models/UserProgress");
const { 
  roadmapgenerator, 
  getallroadmap, 
  deleteroadmap, 
  getRoadmapById, 
  updateProgress, 
  getProgress, 
  getBadges, 
  skillGapScan, 
  fixMissingProgress, 
  analyzeSkillGapsAI,
  updateRoadmap  // ✅ ADD THIS
} = require("../controllers/roadmpaController.js");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// AI generation
router.post("/generate-roadmap", protect, roadmapgenerator);
router.get("/getallroadmap", protect, getallroadmap);
router.get("/getRoadmapById/:id", protect, getRoadmapById);
router.delete("/deleteroadmap/:id", protect, deleteroadmap);

// Progress tracking
router.post('/progress', protect, updateProgress);
router.get('/progress/:roadmapId', protect, getProgress);
router.get('/badges/:roadmapId', protect, getBadges);
router.post('/skill-gap-scan', protect, skillGapScan);
router.post('/analyze-skill-gaps', protect, analyzeSkillGapsAI);
router.post("/fix-progress", protect, fixMissingProgress);

// ✅ ADD THIS NEW ROUTE for editing roadmap
router.put("/update-roadmap/:id", protect, updateRoadmap);

// Save roadmap
router.post("/save", async (req, res) => {
  try {
    const roadmap = new Roadmap(req.body);
    await roadmap.save();
    res.status(201).json({ message: "Roadmap saved successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all roadmaps
router.get("/", async (req, res) => {
  try {
    const roadmaps = await Roadmap.find();
    res.json(roadmaps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch roadmap by role
router.get("/:role", async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ role: req.params.role });
    res.json(roadmap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;