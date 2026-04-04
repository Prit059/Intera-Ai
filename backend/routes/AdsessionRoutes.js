const express = require("express");
const { createSession, getAllSessions, getSessionById, deletesession } = require("../controllers/AdsessionController");

const router = express.Router();

// Admin: create session
router.post("/create", createSession);

// Student: get all sessions
router.get("/", getAllSessions);

// Student: get single session by ID
router.get("/:id", getSessionById);

// Admin: delete session by ID
router.delete("/delete/:id", deletesession);

module.exports = router;
