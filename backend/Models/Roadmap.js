const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema({
  stepTitle: String,
  description: String,
  completed: { type: Boolean, default: false },
  estimatedTime: { type: String, default: "2-3 weeks" },
  parallelWith: [String],
  resources: {
    youtube: [String],
    coursera: [String],
    udemy: [String],
    officialDocs: [String],
    blogs: [String],
    books: [String],
    practicePlatforms: [String]
  },
  tools: [String],
  jobReadySkills: [String]
});

const phaseSchema = new mongoose.Schema({
  field: String,
  title: String,
  estimatedTime: String,
  description: String,
  skillsToLearn: [String],
  projects: [String],
  completed: { type: Boolean, default: false },
  steps: [stepSchema]
});

const roadmapSchema = new mongoose.Schema({
  roadmap: [phaseSchema],
  companies: [String],
  flowchart: [String],
  emergingTrends: [String],
  salaryRange: String,
  jobRoles: [String],
  parallelLearningPaths: [String],
  bonusMonths: {
    title: String,
    description: String,
    recommendations: [{
      topic: String,
      estimatedTime: String,
      priority: String
    }]
  },
  placementMode: {
    name: String,
    duration: String,
    weeklyHours: String,
    focus: String
  },
  deepLearningMode: {
    name: String,
    duration: String,
    weeklyHours: String,
    focus: String
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  progress: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Roadmap", roadmapSchema);