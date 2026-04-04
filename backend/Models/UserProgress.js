const mongoose = require("mongoose");

const dailyProgressSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  count: { type: Number, default: 0 }
});

const userProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true },
  dailyProgress: [dailyProgressSchema],
  completedSteps: [{ type: mongoose.Schema.Types.ObjectId }],
  completedPhases: [{ type: mongoose.Schema.Types.ObjectId }],
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserProgress", userProgressSchema);