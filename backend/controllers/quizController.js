const axios = require("axios");
const mongoose = require('mongoose');
const Quiz = require('../Models/Quiz');

// Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const generateQuiz = async (req, res) => {
  try {
    const { branch, customBranch, mainTopic, subTopics, totalQuestions } = req.body;
    const userId = req.user.id;

    console.log("🎯 Generating quiz with Groq:", { branch, mainTopic, totalQuestions });

    if (!branch || !mainTopic || !subTopics || !totalQuestions) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const timeLimit = calculateTimeLimit(totalQuestions, subTopics);
    const questions = await generateAIContent(mainTopic, subTopics, totalQuestions);

    const quiz = new Quiz({
      user: userId,
      branch: branch,
      customBranch: branch === 'other' ? customBranch : undefined,
      mainTopic,
      subTopics,
      totalQuestions,
      questions,
      timeLimit,
      status: 'created'
    });

    await quiz.save();
    console.log("✅ Quiz saved with ID:", quiz._id);

    res.status(200).json({
      quizId: quiz._id,
      questions: quiz.questions,
      timeLimit: quiz.timeLimit,
      topic: mainTopic,
      level: getOverallLevel(subTopics)
    });
  } catch (error) {
    console.error("❌ Quiz generation error:", error);
    res.status(500).json({ message: "Quiz generation failed", error: error.message });
  }
};

const calculateTimeLimit = (totalQuestions, subTopics) => {
  let baseTime = totalQuestions * 1.5;
  
  const difficultyWeights = {
    'easy': 1,
    'medium': 1.5,
    'hard': 2
  };

  let weightedTime = 0;
  subTopics.forEach(st => {
    weightedTime += (st.weightage / 100) * difficultyWeights[st.difficulty];
  });

  return Math.round(baseTime * weightedTime);
};

const getOverallLevel = (subTopics) => {
  const difficulties = subTopics.map(st => st.difficulty);
  if (difficulties.includes('hard')) return 'hard';
  if (difficulties.includes('medium')) return 'medium';
  return 'easy';
};

const generateAIContent = async (mainTopic, subTopics, totalQuestions) => {
  const prompt = `
Generate a JSON array of exactly ${totalQuestions} multiple-choice questions on "${mainTopic}".

SUBTOPIC DISTRIBUTION:
${JSON.stringify(subTopics, null, 2)}

For EACH question, include these EXACT fields:
- "question": string
- "options": array of EXACTLY 4 strings
- "correctAnswer": string (must match one option exactly)
- "explanation": string
- "subtopic": string
- "difficulty": "easy", "medium", or "hard"

Return ONLY valid JSON array, no other text.

EXAMPLE FORMAT:
[
  {
    "question": "What is React?",
    "options": ["A programming language", "A JavaScript library", "A database", "An operating system"],
    "correctAnswer": "A JavaScript library",
    "explanation": "React is a JavaScript library for building user interfaces.",
    "subtopic": "React",
    "difficulty": "easy"
  }
]
`;

  try {
    console.log("📤 Sending prompt to Groq API");
    
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert quiz generator. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8000
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    const rawText = response.data.choices[0].message.content;
    console.log("📥 Groq response received");

    let cleanedText = rawText
      .replace(/^```json\s*|```$/g, "")
      .trim();
    
    const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }

    const quizQuestions = JSON.parse(cleanedText);
    
    if (!Array.isArray(quizQuestions)) {
      throw new Error("Response is not an array");
    }
    
    return quizQuestions.slice(0, totalQuestions);
  } catch (error) {
    console.error("❌ Groq API Error:", error.message);
    return generateFallbackQuestions(mainTopic, subTopics, totalQuestions);
  }
};

const generateFallbackQuestions = (mainTopic, subTopics, totalQuestions) => {
  const questions = [];
  const subtopics = subTopics.map(st => st.topic);
  
  for (let i = 0; i < totalQuestions; i++) {
    const subtopic = subtopics[i % subtopics.length] || "General";
    const difficulty = subTopics.find(st => st.topic === subtopic)?.difficulty || "medium";
    
    questions.push({
      question: `What is the main concept of ${subtopic} in ${mainTopic}?`,
      options: [
        `${subtopic} fundamental concept`,
        `${subtopic} practical application`,
        `${subtopic} theoretical approach`,
        `${subtopic} advanced technique`
      ],
      correctAnswer: `${subtopic} fundamental concept`,
      explanation: `This is the correct answer because it represents the core concept of ${subtopic}.`,
      subtopic: subtopic,
      difficulty: difficulty
    });
  }
  
  return questions;
};

const submitQuiz = async (req, res) => {
  try {
    const { quizId, userAnswers, timeSpent, violations } = req.body;
    const userId = req.user.id;

    console.log("📝 Submitting quiz:", { quizId, userId });

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    
    if (quiz.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    let score = 0;
    const detailedResults = quiz.questions.map((q, index) => {
      const userAnswer = userAnswers[index]?.selectedAnswer || '';
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) score++;
      
      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer,
        isCorrect,
        explanation: q.explanation,
        subtopic: q.subtopic,
        difficulty: q.difficulty
      };
    });

    const weakTopics = [];
    const strongTopics = [];
    const subtopicStats = {};
    
    detailedResults.forEach(r => {
      if (!subtopicStats[r.subtopic]) {
        subtopicStats[r.subtopic] = { correct: 0, total: 0 };
      }
      subtopicStats[r.subtopic].total++;
      if (r.isCorrect) subtopicStats[r.subtopic].correct++;
    });

    Object.entries(subtopicStats).forEach(([topic, data]) => {
      const accuracy = (data.correct / data.total) * 100;
      if (accuracy < 60) weakTopics.push(topic);
      else if (accuracy > 80) strongTopics.push(topic);
    });

    const totalTime = timeSpent.reduce((a, b) => a + b, 0);
    const avgTime = detailedResults.length > 0 ? totalTime / detailedResults.length : 0;
    const accuracy = (score / quiz.totalQuestions) * 100;

    quiz.userAnswers = userAnswers.map((ans, idx) => ({
      questionIndex: idx,
      selectedAnswer: ans.selectedAnswer,
      isCorrect: ans.selectedAnswer === quiz.questions[idx]?.correctAnswer,
      timeSpent: ans.timeSpent || 0
    }));
    quiz.score = score;
    quiz.violations = violations || 0;
    quiz.status = 'completed';
    quiz.completedAt = new Date();
    quiz.performanceAnalysis = {
      weakTopics,
      strongTopics,
      averageTimePerQuestion: avgTime,
      accuracy
    };

    await quiz.save();
    console.log("✅ Quiz submitted with score:", score);

    res.json({
      success: true,
      score,
      totalQuestions: quiz.totalQuestions,
      detailedResults,
      performance: {
        weakTopics,
        strongTopics,
        averageTimePerQuestion: avgTime,
        accuracy
      },
      recommendations: generateRecommendations(weakTopics, strongTopics, accuracy, quiz.branch),
      topic: quiz.mainTopic,
      level: getOverallLevel(quiz.subTopics),
      date: new Date().toLocaleString()
    });
  } catch (error) {
    console.error("❌ Quiz submission error:", error);
    res.status(500).json({ message: "Submission failed", error: error.message });
  }
};

const generateRecommendations = (weakTopics, strongTopics, accuracy, branch) => {
  const recommendations = [];
  
  if (weakTopics.length > 0) {
    recommendations.push({
      type: 'weak_topic',
      message: `Focus on improving: ${weakTopics.slice(0, 3).join(', ')}`,
      priority: 'high'
    });
  }

  if (accuracy < 60) {
    recommendations.push({
      type: 'overall_improvement',
      message: 'Practice fundamental concepts to improve your score.',
      priority: 'high'
    });
  } else if (accuracy > 85) {
    recommendations.push({
      type: 'advanced_topics',
      message: 'Great job! Try more challenging topics.',
      priority: 'medium'
    });
  }

  return recommendations;
};

const getQuizHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("📊 Fetching quiz history for user:", userId);
    
    const quizzes = await Quiz.find({ 
      user: userId, 
      status: 'completed' 
    })
      .sort({ completedAt: -1 })
      .select('_id mainTopic branch score totalQuestions completedAt')
      .lean();
    
    console.log(`✅ Found ${quizzes.length} completed quizzes`);
    
    const formattedHistory = quizzes.map(quiz => ({
      _id: quiz._id,
      quizId: quiz._id,
      topic: quiz.mainTopic,
      branch: quiz.branch,
      level: 'medium',
      score: quiz.score || 0,
      totalQuestions: quiz.totalQuestions,
      completedAt: quiz.completedAt,
      accuracy: quiz.totalQuestions > 0 
        ? Math.round((quiz.score / quiz.totalQuestions) * 100) 
        : 0
    }));
    
    res.json(formattedHistory);
  } catch (error) {
    console.error("❌ Failed to fetch quiz history:", error);
    res.status(500).json({ message: "Failed to fetch history", error: error.message });
  }
};

const getQuizResult = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    console.log("📊 Fetching quiz result for:", quizId);

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }

    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    
    if (quiz.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const detailedResults = quiz.questions.map((q, idx) => {
      const userAnswer = quiz.userAnswers?.find(a => a.questionIndex === idx);
      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswer ? userAnswer.selectedAnswer : 'Not answered',
        isCorrect: userAnswer ? userAnswer.isCorrect : false,
        explanation: q.explanation,
        subtopic: q.subtopic,
        difficulty: q.difficulty,
        timeSpent: userAnswer ? userAnswer.timeSpent : 0,
      };
    });

    res.json({
      quizId: quiz._id,
      topic: quiz.mainTopic,
      branch: quiz.branch,
      level: getOverallLevel(quiz.subTopics),
      score: quiz.score || 0,
      totalQuestions: quiz.totalQuestions,
      accuracy: quiz.totalQuestions > 0 ? Math.round((quiz.score / quiz.totalQuestions) * 100) : 0,
      completedAt: quiz.completedAt,
      detailedResults,
      performance: quiz.performanceAnalysis || {
        weakTopics: [],
        strongTopics: [],
        averageTimePerQuestion: 0,
        accuracy: 0
      },
      recommendations: generateRecommendations(
        quiz.performanceAnalysis?.weakTopics || [],
        quiz.performanceAnalysis?.strongTopics || [],
        quiz.performanceAnalysis?.accuracy || 0,
        quiz.branch
      )
    });
  } catch (error) {
    console.error("❌ Quiz result fetch error:", error);
    res.status(500).json({ message: "Failed to fetch quiz result", error: error.message });
  }
};

const getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    
    if (quiz.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(quiz);
  } catch (error) {
    console.error("❌ Quiz fetch error:", error);
    res.status(500).json({ message: "Failed to fetch quiz" });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    console.log("🗑️ Delete request for quiz:", quizId);

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }

    const quiz = await Quiz.findOne({ _id: quizId, user: userId });
    
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found or unauthorized" });
    }

    await Quiz.findByIdAndDelete(quizId);

    console.log("✅ Quiz deleted successfully:", quizId);
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("❌ Quiz delete error:", error);
    res.status(500).json({ message: "Failed to delete quiz" });
  }
};

const getPerformanceAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("📊 Generating analytics for user:", userId);
    
    const quizzes = await Quiz.find({ user: userId, status: 'completed' });
    
    if (quizzes.length === 0) {
      return res.json({
        overall: {
          totalQuizzes: 0,
          totalQuestions: 0,
          overallAccuracy: 0,
          averageScore: 0
        },
        topicPerformance: {},
        weakAreas: [],
        strongAreas: [],
        progressData: [],
        recommendations: [{
          type: 'start',
          message: 'Start taking quizzes to see your analytics!',
          priority: 'low'
        }]
      });
    }

    const totalQuizzes = quizzes.length;
    const totalQuestions = quizzes.reduce((sum, q) => sum + q.totalQuestions, 0);
    const totalScore = quizzes.reduce((sum, q) => sum + (q.score || 0), 0);
    const overallAccuracy = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;

    const topicPerformance = {};
    quizzes.forEach(quiz => {
      const topic = quiz.mainTopic;
      if (!topicPerformance[topic]) {
        topicPerformance[topic] = { total: 0, correct: 0, attempts: 0 };
      }
      topicPerformance[topic].total += quiz.totalQuestions;
      topicPerformance[topic].correct += (quiz.score || 0);
      topicPerformance[topic].attempts += 1;
    });

    const weakAreas = Object.entries(topicPerformance)
      .filter(([_, data]) => (data.correct / data.total) * 100 < 60)
      .map(([topic]) => topic);

    const strongAreas = Object.entries(topicPerformance)
      .filter(([_, data]) => (data.correct / data.total) * 100 > 80)
      .map(([topic]) => topic);

    const progressData = quizzes.map((quiz, index) => ({
      attempt: index + 1,
      date: quiz.completedAt,
      accuracy: quiz.totalQuestions > 0 ? (quiz.score / quiz.totalQuestions) * 100 : 0,
      topic: quiz.mainTopic
    }));

    res.json({
      overall: {
        totalQuizzes,
        totalQuestions,
        overallAccuracy: Math.round(overallAccuracy * 100) / 100,
        averageScore: totalQuizzes > 0 ? Math.round((totalScore / totalQuizzes) * 100) / 100 : 0
      },
      topicPerformance,
      weakAreas,
      strongAreas,
      progressData,
      recommendations: generateAnalyticsRecommendations(weakAreas, strongAreas, overallAccuracy)
    });

  } catch (error) {
    console.error("❌ Analytics error:", error);
    res.status(500).json({ message: "Failed to get analytics", error: error.message });
  }
};

const generateAnalyticsRecommendations = (weakAreas, strongAreas, overallAccuracy) => {
  const recommendations = [];

  if (weakAreas.length > 0) {
    recommendations.push({
      type: 'weak_areas',
      message: `Focus on improving: ${weakAreas.slice(0, 3).join(', ')}`,
      priority: 'high'
    });
  }

  if (overallAccuracy < 60) {
    recommendations.push({
      type: 'overall_improvement',
      message: 'Your overall accuracy is low. Practice fundamental concepts first.',
      priority: 'high'
    });
  } else if (overallAccuracy > 85) {
    recommendations.push({
      type: 'advanced_topics',
      message: 'Great performance! Try more challenging topics.',
      priority: 'medium'
    });
  }

  return recommendations;
};

module.exports = { 
  generateQuiz, 
  submitQuiz, 
  getQuizHistory,
  getQuizById,
  getPerformanceAnalytics,
  getQuizResult,
  deleteQuiz
};