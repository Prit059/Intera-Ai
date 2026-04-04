const mongoose = require("mongoose");

const AdquestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  tag: { type: String },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
  answerType: { type: String, enum: ["text", "code"], default: "text" },
});

const AdsessionSchema = new mongoose.Schema(
  {
    sessionType: { type: String, enum: ["general", "company"], required: true },
    sessionName: { type: String, required: true },
    branch: { type: String },   // only for general
    role: { type: String },     // only for general
    topic: { type: String },    // optional
    company: { type: String },  // only for company
    companyRole: { type: String },
    difficulty: { type: String, default: "Mixed" },
    description: { type: String },
    importType: { type: String, default: "manual" },
    questions: [AdquestionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdSession", AdsessionSchema);