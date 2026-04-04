// services/markdownService.js - COMPLETE
const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const markdownItKatex = require('markdown-it-katex');
const markdownItHighlight = require('markdown-it-highlightjs');
const matter = require('gray-matter');

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
}).use(markdownItKatex).use(markdownItHighlight);

exports.convertToHtml = async (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { content, data } = matter(fileContent);
    
    // Process LaTeX formulas
    let processedContent = content;
    processedContent = processedContent.replace(/```latex\n([\s\S]*?)```/g, (match, formula) => {
      return `<div class="formula-card"><code>${formula.trim()}</code></div>`;
    });
    
    const html = md.render(processedContent);
    
    return {
      html,
      metadata: data
    };
  } catch (error) {
    console.error('Markdown conversion error:', error);
    throw error;
  }
};

exports.extractMetadata = async (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContent);
    return data;
  } catch (error) {
    console.error('Metadata extraction error:', error);
    throw error;
  }
};