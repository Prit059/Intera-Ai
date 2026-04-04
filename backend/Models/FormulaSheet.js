// Models/FormulaSheet.js - COMPLETE WITH IMAGES
const mongoose = require('mongoose');

const formulaSheetSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Aptitude', 'Data Interpretation']
  },
  subCategory: { type: String, default: '' },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  contentPath: { type: String, required: true },
  contentHtml: { type: String },
  description: { type: String, maxlength: 500 },
  tags: [{ type: String, trim: true }],
  estimatedTime: { type: Number, default: 15 },
  downloads: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  rating: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  version: { type: Number, default: 1 },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  metaTitle: String,
  metaDescription: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // ========== STRUCTURED DATA ==========
  formulas: [{
    name: String,
    formula: String,
    explanation: String
  }],
  examples: [{
    question: String,
    solution: String
  }],
  concepts: [String],
  mistakes: [String],
  tips: [String],
  
  // ========== IMAGES SECTION ==========
  images: [{
    url: { type: String, required: true },
    caption: { type: String, default: '' },
    publicId: { type: String },
    order: { type: Number, default: 0 }
  }]
  
}, { timestamps: true });

formulaSheetSchema.index({ title: 'text', description: 'text', tags: 'text' });
formulaSheetSchema.index({ category: 1, difficulty: 1 });
formulaSheetSchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model('FormulaSheet', formulaSheetSchema);