const mongoose = require("mongoose");

// Update the schema to match what you're trying to save
const skillAnalysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Keep this as user
  roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true },
  userSkills: [String],
  skillGaps: [{
    // Define as objects if you want structured data
    name: String,
    category: String,
    priority: String,
    estimatedTime: String,
    resources: [String],
    projectIdeas: [String]
  }],
  matchedSkills: [String],
  analysisType: { type: String, default: 'basic' },
  aiRecommendations: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SkillAnalysis", skillAnalysisSchema);