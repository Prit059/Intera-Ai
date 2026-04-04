const axios = require("axios");
const { conceptExplainPrompt, questionAnswerPrompt } = require("../utils/prompts");
const { companyQuestionAnswerPrompt } = require("../utils/companyPrompts");
require("dotenv").config();

// Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile"; // or "mixtral-8x7b-32768", "llama3-70b-8192"

// Helper to extract text from Groq response
const extractText = (response) => {
  return response.data.choices[0]?.message?.content || null;
};

// Helper function to clean and parse AI response
const cleanAndParseResponse = (rawText) => {
  if (!rawText) throw new Error("Empty response from AI");
  
  const cleanedText = rawText
    .replace(/^```json\s*/, "") // remove starting ```json
    .replace(/^```\s*/, "") // remove starting ```
    .replace(/```$/, "") // remove ending ```
    .trim(); // remove extra spaces

  try {
    return JSON.parse(cleanedText);
  } catch (parseError) {
    console.error("Failed to parse AI response:", cleanedText.substring(0, 500));
    throw new Error(`Invalid JSON response from AI: ${parseError.message}`);
  }
};

// Exponential backoff retry wrapper for Groq
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
      
      // Check for rate limit errors (429) or overloaded errors
      const isRateLimit = error.response?.status === 429 || 
                          error.message?.includes('rate limit') ||
                          error.message?.includes('overloaded');
      
      if (!isRateLimit) {
        throw error;
      }
      
      // If it's the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      console.log(`Rate limit hit, retrying in ${Math.pow(2, attempt)}s...`);
    }
  }
  
  throw lastError;
};

// Call Groq API with messages format
const callGroqAPI = async (systemPrompt, userPrompt, temperature = 0.7) => {
  const response = await axios.post(
    GROQ_API_URL,
    {
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: temperature,
      max_tokens: 4096,
      top_p: 0.95
    },
    {
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: 60000 // 60 second timeout
    }
  );
  
  return response;
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

    const userPrompt = questionAnswerPrompt(role, experience, topicsFocus, numberOfQuestions);
    
    const systemPrompt = `You are an expert technical interviewer for ${role} positions. 
Generate realistic interview questions based on the candidate's experience level.
Always respond with valid JSON only. Do not include any markdown formatting or extra text.`;

    const result = await withRetry(async () => {
      return await callGroqAPI(systemPrompt, userPrompt, 0.8);
    });

    const rawText = extractText(result);
    console.log("Raw AI response received, length:", rawText?.length);
    
    const data = cleanAndParseResponse(rawText);

    res.status(200).json(data);

  } catch (err) {
    console.error("ERROR IN generateInterviewQuestions:", err);
    
    // Handle specific error types
    if (err.response?.status === 429) {
      return res.status(429).json({
        message: "Rate limit exceeded. Please try again in a few minutes.",
        error: err.message,
      });
    }
    
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({
        message: "Request timeout. Please try again.",
        error: err.message,
      });
    }
    
    res.status(err.response?.status || 500).json({
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

    const userPrompt = conceptExplainPrompt(question);
    
    const systemPrompt = `You are an expert technical educator. 
Provide clear, concise, and educational explanations for technical concepts.
Always respond with valid JSON only. Do not include any markdown formatting or extra text.`;

    const result = await withRetry(async () => {
      return await callGroqAPI(systemPrompt, userPrompt, 0.7);
    });

    const rawText = extractText(result);
    const data = cleanAndParseResponse(rawText);

    res.status(200).json(data);
    
  } catch (err) {
    console.error("ERROR IN generateConceptExplanations:", err);
    
    if (err.response?.status === 429) {
      return res.status(429).json({
        message: "Rate limit exceeded. Please try again in a few minutes.",
        error: err.message,
      });
    }
    
    res.status(err.response?.status || 500).json({
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

    const userPrompt = companyQuestionAnswerPrompt(company, jobRole, experience, description, numberOfQuestions);
    
    const systemPrompt = `You are an expert interview coach specializing in ${company} interviews.
Generate realistic interview questions that match ${company}'s interview style and culture.
Consider the job role, experience level, and any specific requirements mentioned.
Always respond with valid JSON only. Do not include any markdown formatting or extra text.`;

    const result = await withRetry(async () => {
      return await callGroqAPI(systemPrompt, userPrompt, 0.8);
    });

    const rawText = extractText(result);
    const data = cleanAndParseResponse(rawText);
    
    res.status(200).json(data);
    
  } catch (err) {
    console.error("Company questions generation error:", err);
    
    if (err.response?.status === 429) {
      return res.status(429).json({
        message: "Rate limit exceeded. Please try again in a few minutes.",
        error: err.message,
      });
    }
    
    res.status(err.response?.status || 500).json({
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