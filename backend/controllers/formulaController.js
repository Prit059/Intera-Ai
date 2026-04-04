// controllers/formulaController.js - COMPLETE VERSION
const FormulaSheet = require('../Models/FormulaSheet');
const fs = require('fs');
const path = require('path');
const markdownService = require('../services/markdownService');
const pdfGenerator = require('../services/pdfGenerator');
const searchService = require('../services/searchService');
const cloudinary = require('../config/cloudinary');

// Helper function to create content directory
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Helper to generate markdown content (NOT exported)
const generateMarkdownContent = (data) => {
  return `---
title: ${data.title}
slug: ${data.slug}
category: ${data.category}
subCategory: ${data.subCategory || ''}
difficulty: ${data.difficulty}
estimatedTime: ${data.estimatedTime || 15}
tags: ${JSON.stringify(data.tags || [])}
---

# ${data.title}

## Overview
${data.description || 'Comprehensive formula sheet with examples and visualizations.'}

## Key Formulas

${data.formulas?.map(f => `
### ${f.name}
\`\`\`latex
${f.formula}
\`\`\`

**Explanation:** ${f.explanation || 'No explanation provided.'}
`).join('\n') || 'Add formulas here.'}

## Examples

${data.examples?.map((e, i) => `
### Example ${i + 1}
**Question:** ${e.question}
**Solution:** ${e.solution}
`).join('\n') || 'Add examples here.'}

## Important Concepts
${data.concepts?.map(c => `- ${c}`).join('\n') || '- Add key concepts here.'}

## Common Mistakes to Avoid
${data.mistakes?.map(m => `- ${m}`).join('\n') || '- Add common mistakes here.'}

## Tips & Shortcuts
${data.tips?.map(t => `- ${t}`).join('\n') || '- Add tips here.'}
`;
};

// @desc    Upload image to Cloudinary
const uploadFormulaImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'formula-sheets',
          resource_type: 'auto',
          transformation: [
            { quality: 'auto:best' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
};

// @desc    Delete image from Cloudinary
const deleteFormulaImage = async (req, res) => {
  try {
    const result = await cloudinary.uploader.destroy(req.params.publicId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Image delete error:', error);
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};


// @desc    Search formulas using Algolia
const searchFormulas = async (req, res) => {
  try {
    const { query, category, difficulty, page = 0, limit = 20 } = req.query;
    
    const filters = [];
    if (category && category !== 'all') filters.push(`category:"${category}"`);
    if (difficulty && difficulty !== 'all') filters.push(`difficulty:"${difficulty}"`);
    filters.push('isPublished:true');
    
    const results = await searchService.searchFormulas(query, {
      filters: filters.join(' AND '),
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: results.hits,
      total: results.nbHits,
      page: results.page,
      totalPages: results.nbPages
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
};

const createFormulaSheet = async (req, res) => {
  try {
    const {
      title,
      category,
      subCategory,
      difficulty,
      description,
      tags,
      estimatedTime,
      formulas,
      examples,
      concepts,
      mistakes,
      tips,
      images,
      metaTitle,
      metaDescription
    } = req.body;
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Parse JSON fields
    const parsedFormulas = formulas ? (typeof formulas === 'string' ? JSON.parse(formulas) : formulas) : [];
    const parsedExamples = examples ? (typeof examples === 'string' ? JSON.parse(examples) : examples) : [];
    const parsedConcepts = concepts ? (typeof concepts === 'string' ? JSON.parse(concepts) : concepts) : [];
    const parsedMistakes = mistakes ? (typeof mistakes === 'string' ? JSON.parse(mistakes) : mistakes) : [];
    const parsedTips = tips ? (typeof tips === 'string' ? JSON.parse(tips) : tips) : [];
    const parsedImages = images ? (typeof images === 'string' ? JSON.parse(images) : images) : [];
    const parsedTags = tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [];
    
    const categoryFolder = category.toLowerCase().replace(/ /g, '-');
    const contentDir = path.join(__dirname, '../content/formulas', categoryFolder);
    ensureDirectoryExists(contentDir);
    
    const fileName = `${slug}.md`;
    const filePath = path.join(contentDir, fileName);
    
    const markdownData = {
      title,
      slug,
      category,
      subCategory,
      difficulty,
      description,
      tags: parsedTags,
      estimatedTime,
      formulas: parsedFormulas,
      examples: parsedExamples,
      concepts: parsedConcepts,
      mistakes: parsedMistakes,
      tips: parsedTips,
      images: parsedImages
    };
    
    const markdownContent = generateMarkdownContent(markdownData);
    fs.writeFileSync(filePath, markdownContent);
    
    // Save to database with ALL structured data including images
    const formulaSheet = new FormulaSheet({
      title,
      slug,
      category,
      subCategory,
      difficulty,
      description,
      tags: parsedTags,
      estimatedTime,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || description,
      contentPath: `formulas/${categoryFolder}/${fileName}`,
      createdBy: req.user.id,
      isPublished: true,
      publishedAt: new Date(),
      formulas: parsedFormulas,
      examples: parsedExamples,
      concepts: parsedConcepts,
      mistakes: parsedMistakes,
      tips: parsedTips,
      images: parsedImages
    });
    
    await formulaSheet.save();
    
    const { html } = await markdownService.convertToHtml(filePath);
    formulaSheet.contentHtml = html;
    await formulaSheet.save();
    
    await searchService.indexFormula(formulaSheet);
    
    res.status(201).json({
      success: true,
      data: formulaSheet,
      message: 'Formula sheet created successfully'
    });
  } catch (error) {
    console.error('Create formula error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating formula sheet',
      error: error.message
    });
  }
};
// @desc    Get all formula sheets (public)
const getAllFormulaSheets = async (req, res) => {
  try {
    const { category, difficulty, page = 1, limit = 20 } = req.query;
    
    let query = { isPublished: true };
    if (category && category !== 'all') query.category = category;
    if (difficulty && difficulty !== 'all') query.difficulty = difficulty;
    
    const formulas = await FormulaSheet.find(query)
      .select('title slug category difficulty downloads views rating estimatedTime description tags')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await FormulaSheet.countDocuments(query);
    
    res.json({
      success: true,
      data: formulas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get formulas error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching formula sheets',
      error: error.message
    });
  }
};

// @desc    Get single formula sheet by slug
const getFormulaSheet = async (req, res) => {
  try {
    const formula = await FormulaSheet.findOne({ slug: req.params.slug, isPublished: true });
    
    if (!formula) {
      return res.status(404).json({
        success: false,
        message: 'Formula sheet not found'
      });
    }
    
    // Increment views
    formula.views += 1;
    await formula.save();
    
    // Update Algolia index with new view count
    await searchService.updateFormulaIndex(formula);
    
    res.json({
      success: true,
      data: formula
    });
  } catch (error) {
    console.error('Get formula error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching formula sheet',
      error: error.message
    });
  }
};

// @desc    Update formula sheet
const updateFormulaSheet = async (req, res) => {
  try {
    const formula = await FormulaSheet.findById(req.params.id);
    
    if (!formula) {
      return res.status(404).json({
        success: false,
        message: 'Formula sheet not found'
      });
    }
    
    const {
      title,
      category,
      subCategory,
      difficulty,
      description,
      tags,
      estimatedTime,
      formulas,
      examples,
      concepts,
      mistakes,
      tips,
      metaTitle,
      metaDescription,
      isPublished
    } = req.body;
    
    // Parse JSON fields
    const parsedFormulas = formulas ? (typeof formulas === 'string' ? JSON.parse(formulas) : formulas) : [];
    const parsedExamples = examples ? (typeof examples === 'string' ? JSON.parse(examples) : examples) : [];
    const parsedConcepts = concepts ? (typeof concepts === 'string' ? JSON.parse(concepts) : concepts) : [];
    const parsedMistakes = mistakes ? (typeof mistakes === 'string' ? JSON.parse(mistakes) : mistakes) : [];
    const parsedTips = tips ? (typeof tips === 'string' ? JSON.parse(tips) : tips) : [];
    const parsedTags = tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : formula.tags;
    
    // Handle slug update if title changed
    let newSlug = formula.slug;
    let newContentPath = formula.contentPath;
    
    if (title && title !== formula.title) {
      newSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const categoryFolder = (category || formula.category).toLowerCase().replace(/ /g, '-');
      const contentDir = path.join(__dirname, '../content/formulas', categoryFolder);
      ensureDirectoryExists(contentDir);
      
      const newFileName = `${newSlug}.md`;
      newContentPath = `formulas/${categoryFolder}/${newFileName}`;
      
      // Delete old file if exists and path changed
      const oldFilePath = path.join(__dirname, '../content', formula.contentPath);
      const newFilePath = path.join(__dirname, '../content', newContentPath);
      
      if (fs.existsSync(oldFilePath) && oldFilePath !== newFilePath) {
        fs.unlinkSync(oldFilePath);
      }
    }
    
    // Update markdown file
    const markdownData = {
      title: title || formula.title,
      slug: newSlug,
      category: category || formula.category,
      subCategory: subCategory || formula.subCategory,
      difficulty: difficulty || formula.difficulty,
      description: description || formula.description,
      tags: parsedTags,
      estimatedTime: estimatedTime || formula.estimatedTime,
      formulas: parsedFormulas,
      examples: parsedExamples,
      concepts: parsedConcepts,
      mistakes: parsedMistakes,
      tips: parsedTips
    };
    
    const markdownContent = generateMarkdownContent(markdownData);
    const filePath = path.join(__dirname, '../content', newContentPath);
    fs.writeFileSync(filePath, markdownContent);
    
    // Update database
    if (title) formula.title = title;
    if (category) formula.category = category;
    if (subCategory !== undefined) formula.subCategory = subCategory;
    if (difficulty) formula.difficulty = difficulty;
    if (description) formula.description = description;
    if (tags) formula.tags = parsedTags;
    if (estimatedTime) formula.estimatedTime = estimatedTime;
    if (metaTitle) formula.metaTitle = metaTitle;
    if (metaDescription) formula.metaDescription = metaDescription;
    if (isPublished !== undefined) formula.isPublished = isPublished;
    
    formula.slug = newSlug;
    formula.contentPath = newContentPath;
    formula.version += 1;
    formula.lastUpdatedBy = req.user.id;
    if (isPublished && !formula.publishedAt) formula.publishedAt = new Date();
    
    await formula.save();
    
    // Re-convert to HTML
    const { html } = await markdownService.convertToHtml(filePath);
    formula.contentHtml = html;
    await formula.save();
    
    // Update search index
    await searchService.updateFormulaIndex(formula);
    
    res.json({
      success: true,
      data: formula,
      message: 'Formula sheet updated successfully'
    });
  } catch (error) {
    console.error('Update formula error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating formula sheet',
      error: error.message
    });
  }
};

// @desc    Delete formula sheet
const deleteFormulaSheet = async (req, res) => {
  try {
    const formula = await FormulaSheet.findById(req.params.id);
    
    if (!formula) {
      return res.status(404).json({
        success: false,
        message: 'Formula sheet not found'
      });
    }
    
    // Delete markdown file
    const filePath = path.join(__dirname, '../content', formula.contentPath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Remove from search index
    await searchService.deleteFormulaIndex(formula._id);
    
    await formula.deleteOne();
    
    res.json({
      success: true,
      message: 'Formula sheet deleted successfully'
    });
  } catch (error) {
    console.error('Delete formula error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting formula sheet',
      error: error.message
    });
  }
};

// @desc    Download formula sheet as PDF
const downloadFormulaSheet = async (req, res) => {
  try {
    const formula = await FormulaSheet.findOne({ slug: req.params.slug, isPublished: true });
    
    if (!formula) {
      return res.status(404).json({
        success: false,
        message: 'Formula sheet not found'
      });
    }
    
    // Increment downloads
    formula.downloads += 1;
    await formula.save();
    
    // Update search index
    await searchService.updateFormulaIndex(formula);
    
    // Generate PDF
    const pdfBuffer = await pdfGenerator.generatePdf(formula);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${formula.slug}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download formula error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
};

// @desc    Get formula sheets by category
const getFormulasByCategory = async (req, res) => {
  try {
    const formulas = await FormulaSheet.find({
      category: req.params.category,
      isPublished: true
    }).select('title slug difficulty downloads views rating estimatedTime');
    
    res.json({
      success: true,
      data: formulas
    });
  } catch (error) {
    console.error('Get formulas by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching formulas',
      error: error.message
    });
  }
};

// @desc    Get admin formula sheets (all)
const getAllAdminFormulas = async (req, res) => {
  try {
    const formulas = await FormulaSheet.find()
      .select('title slug category difficulty isPublished views downloads createdAt version')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: formulas
    });
  } catch (error) {
    console.error('Get admin formulas error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching formulas',
      error: error.message
    });
  }
};

// @desc    Toggle publish status
const togglePublish = async (req, res) => {
  try {
    const formula = await FormulaSheet.findById(req.params.id);
    
    if (!formula) {
      return res.status(404).json({
        success: false,
        message: 'Formula sheet not found'
      });
    }
    
    formula.isPublished = !formula.isPublished;
    formula.publishedAt = formula.isPublished ? new Date() : null;
    await formula.save();
    
    // Update search index
    await searchService.updateFormulaIndex(formula);
    
    res.json({
      success: true,
      data: formula
    });
  } catch (error) {
    console.error('Toggle publish error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling publish status',
      error: error.message
    });
  }
};

module.exports = {
  getAllFormulaSheets,
  createFormulaSheet,
  getFormulaSheet,
  updateFormulaSheet,
  deleteFormulaSheet,
  downloadFormulaSheet,
  getFormulasByCategory,
  getAllAdminFormulas,
  togglePublish,
  uploadFormulaImage,
  deleteFormulaImage,
  searchFormulas
};