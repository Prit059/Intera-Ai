const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: { type: String, required: true },
  experience: { type: String, required: true },
  topicsFocus: { type: String, required: true },
  description: String,
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  // New fields for session type
  interviewType: { 
    type: String, 
    enum: ["general", "company"], 
    default: "general" 
  },
  company: { 
    type: String, 
    default: null 
  },
  jobRole: { 
    type: String, 
    default: null 
  },
  branch: { 
    type: String, 
    default: "General" 
  }
}, { timestamps: true });

module.exports = mongoose.model("Session", sessionSchema);