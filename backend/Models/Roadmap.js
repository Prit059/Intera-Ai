const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema({
  stepTitle: String,
  description: String,
  completed: { type: Boolean, default: false },
  resources: {
    youtube: [String],
    coursera: [String], 
  }
});

const phaseSchema = new mongoose.Schema({
  field: String,
  title: String,
  estimatedTime: String,
  completed: { type: Boolean, default: false },
  steps: [stepSchema]
});

const roadmapSchema = new mongoose.Schema({
  roadmap: [phaseSchema],
  companies: [String],
  flowchart: [String],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  progress: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Roadmap", roadmapSchema);