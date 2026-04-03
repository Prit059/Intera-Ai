const { GoogleGenerativeAI } = require("@google/generative-ai");
const { conceptExplainPrompt, questionAnswerPrompt } = require("../utils/prompts");
const { companyQuestionAnswerPrompt } = require("../utils/companyPrompts");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

// Helper to extract response
const extractText = (response) => {
  return response.candidates?.[0]?.content?.parts?.[0]?.text || null;
};

// Helper function to clean and parse AI response
const cleanAndParseResponse = (rawText) => {
  if (!rawText) throw new Error("Empty response from AI");
  
  const cleanedText = rawText
    .replace(/^```json\s*/, "") // remove starting ```json
    .replace(/```$/, "") // remove ending ```
    .trim(); // remove extra spaces

  try {
    return JSON.parse(cleanedText);
  } catch (parseError) {
    console.error("Failed to parse AI response:", cleanedText);
    throw new Error(`Invalid JSON response from AI: ${parseError.message}`);
  }
};

// Exponential backoff retry wrapper
const withRetry = async (fn, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Wait before retrying (exponential backoff)
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      return await fn();
      
    } catch (error) {
      lastError = error;
      
      // Only retry on rate limit errors (429)
      if (error.status !== 429) {
        throw error;
      }
      
      // If it's the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
      }
    }
  }
  
  throw lastError;
};

const generateInterviewQuestions = async (req, res) => {
  try {

     console.log("Request body received:", req.body);
    console.log("Experience value:", req.body.experience, "Type:", typeof req.body.experience);
    const { role, experience, topicsFocus, numberOfQuestions } = req.body;

    // Better validation
    if (!role || !numberOfQuestions) {
      return res.status(400).json({ 
        message: "Missing required fields: role and numberOfQuestions are required." 
      });
    }

    // Check if experience is provided and is valid
    if (!experience || isNaN(parseInt(experience)) || parseInt(experience) <= 0) {
      return res.status(400).json({ 
        message: "Valid experience is required (e.g., 1, 2, 3, etc.)." 
      });
    }

    // Ensure numberOfQuestions is a valid number
    if (isNaN(parseInt(numberOfQuestions)) || parseInt(numberOfQuestions) <= 0) {
      return res.status(400).json({ 
        message: "Valid number of questions is required." 
      });
    }

    const prompt = questionAnswerPrompt(role, experience, topicsFocus, numberOfQuestions);

    const result = await withRetry(async () => {
      return await model.generateContent(prompt);
    });

    const rawText = result.response.text();
    const data = cleanAndParseResponse(rawText);

    res.status(200).json(data);

  } catch (err) {
    console.error("ERROR IN generateInterviewQuestions:", err);
    
    // Handle specific error types
    if (err.status === 429) {
      return res.status(429).json({
        message: "Rate limit exceeded. Please try again in a few minutes.",
        error: err.message,
      });
    }
    
    res.status(err.status || 500).json({
      message: "Failed to generate questions",
      error: err.message,
    });
  }
};

const generateConceptExplanations = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Missing required field: question" });
    }

    const prompt = conceptExplainPrompt(question);

    const result = await withRetry(async () => {
      return await model.generateContent(prompt);
    });

    const rawText = result.response.text();
    const data = cleanAndParseResponse(rawText);

    res.status(200).json(data);
    
  } catch (err) {
    console.error("ERROR IN generateConceptExplanations:", err);
    
    if (err.status === 429) {
      return res.status(429).json({
        message: "Rate limit exceeded. Please try again in a few minutes.",
        error: err.message,
      });
    }
    
    res.status(err.status || 500).json({
      message: "Failed to generate concept explanation",
      error: err.message,
    });
  }
};

// New company question generator
const generateCompanyInterviewQuestions = async (req, res) => {
  try {
    const { company, jobRole, experience, description, numberOfQuestions } = req.body;

    if (!company || !jobRole || !experience || !numberOfQuestions) {
      return res.status(400).json({ 
        message: "Missing required fields: company, jobRole, experience, and numberOfQuestions are required." 
      });
    }

    const prompt = companyQuestionAnswerPrompt(company, jobRole, experience, description, numberOfQuestions);

    const result = await withRetry(async () => {
      return await model.generateContent(prompt);
    });

    const rawText = result.response.text();
    const data = cleanAndParseResponse(rawText);
    
    res.status(200).json(data);
    
  } catch (err) {
    console.error("Company questions generation error:", err);
    
    if (err.status === 429) {
      return res.status(429).json({
        message: "Rate limit exceeded. Please try again in a few minutes.",
        error: err.message,
      });
    }
    
    res.status(err.status || 500).json({
      message: "Failed to generate company-specific questions",
      error: err.message,
    });
  }
};

module.exports = { 
  generateConceptExplanations, 
  generateInterviewQuestions, 
  generateCompanyInterviewQuestions 
};