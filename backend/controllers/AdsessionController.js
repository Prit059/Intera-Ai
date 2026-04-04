const AdSession = require("../Models/AdSession");

// Create new session
const createSession = async (req, res) => {
  try {
    const session = new AdSession(req.body);
    await session.save();
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all sessions (for student)
const getAllSessions = async (req, res) => {
  try {
    const sessions = await AdSession.find();
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get session by ID
const getSessionById = async (req, res) => {
  try {
    const session = await AdSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletesession = async (req, res) => {
  try {
    const session = await AdSession.findByIdAndDelete(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }
    res.status(200).json({ success: true, message: "Session deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { createSession, getAllSessions, getSessionById, deletesession };