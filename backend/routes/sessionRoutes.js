const express = require("express");
const { createSession, getSessionById, getMySession, deleteSession, getSessionsByType} = require('../controllers/sessionController');
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create", protect, createSession);
router.get("/my-session", protect, getMySession);  // ✅ ADD protect here
router.get("/:id", protect, getSessionById);
router.get("/type/:type", protect, getSessionsByType);
router.delete("/:id", protect, deleteSession);

module.exports = router;