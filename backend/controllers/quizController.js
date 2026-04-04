const axios = require("axios");
const mongoose = require('mongoose');
const Quiz = require('../Models/Quiz');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

// Enhanced branch mappings for placement and competitive exams
const BRANCH_CONFIGS = {
  cse: { name: "Computer Science", icon: "💻" },
  ec: { name: "Electronics & Communication", icon: "📡" },
  mechanical: { name: "Mechanical Engineering", icon: "⚙️" },
  ai_ml: { name: "AI & Machine Learning", icon: "🤖" },
  other: { name: "Other Field", icon: "📚" },
  placement: { name: "Placement Preparation", icon: "🎯" },
  competitive: { name: "Competitive Exams", icon: "🏆" }
};

const generateQuiz = async (req, res) => {
  try {
    const { branch, customBranch, mainTopic, subTopics, totalQuestions } = req.body;
    const userId = req.user.id;

    console.log("🎯 Generating quiz:", { branch, mainTopic, totalQuestions });

    if (!branch || !mainTopic || !subTopics || !totalQuestions) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const timeLimit = calculateTimeLimit(totalQuestions, subTopics);
    const questions = await generateAIContent(mainTopic, subTopics, totalQuestions, branch);

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
  let baseTime = totalQuestions * 1.2;
  
  const difficultyWeights = {
    'easy': 1,
    'medium': 1.3,
    'hard': 1.6
  };

  let weightedTime = 0;
  subTopics.forEach(st => {
    weightedTime += (st.weightage / 100) * (difficultyWeights[st.difficulty] || 1);
  });

  return Math.max(Math.round(baseTime * weightedTime), totalQuestions);
};

const getOverallLevel = (subTopics) => {
  const difficulties = subTopics.map(st => st.difficulty);
  if (difficulties.includes('hard')) return 'hard';
  if (difficulties.includes('medium')) return 'medium';
  return 'easy';
};

const generateAIContent = async (mainTopic, subTopics, totalQuestions, branch) => {
  const subtopicDistribution = subTopics.map(st => 
    `${st.topic} (${st.difficulty} difficulty, ${st.weightage}% weightage)`
  ).join('\n');

  const branchContext = getBranchContext(branch);

  const prompt = `You are an expert quiz generator for ${branchContext}. Generate a high-quality, diverse set of ${totalQuestions} multiple-choice questions.

TOPIC: "${mainTopic}"
BRANCH/CONTEXT: ${branchContext}

SUBTOPIC DISTRIBUTION (follow this exactly):
${subtopicDistribution}

REQUIREMENTS:
1. Create questions that test different cognitive levels: recall, understanding, application, and analysis
2. Vary question formats: definitions, scenarios, problem-solving, case studies, comparisons
3. Ensure questions are appropriate for the specified difficulty levels
4. Make options plausible but with only one clearly correct answer
5. Provide educational explanations that teach the concept

For EACH question, include EXACTLY these fields:
- "question": string (clear, well-phrased)
- "options": array of EXACTLY 4 strings (one correct, three plausible distractors)
- "correctAnswer": string (must match one option exactly)
- "explanation": string (explain WHY this is correct and optionally why others are wrong)
- "subtopic": string (must be one of: ${subTopics.map(s => s.topic).join(', ')})
- "difficulty": "easy", "medium", or "hard" (match the specified weightage)

QUESTION DISTRIBUTION BY DIFFICULTY:
${subTopics.map(st => `- ${st.topic}: ${st.weightage}% (${st.difficulty})`).join('\n')}

Return ONLY a valid JSON array. No additional text, no markdown formatting.

Example format:
[
  {
    "question": "What is the time complexity of binary search?",
    "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    "correctAnswer": "O(log n)",
    "explanation": "Binary search repeatedly divides the search interval in half, resulting in logarithmic time complexity.",
    "subtopic": "Algorithms",
    "difficulty": "medium"
  }
]`;

  try {
    console.log("📤 Sending prompt to Groq API");
    
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert quiz generator for technical and competitive exams. Always respond with valid JSON only. Create challenging, accurate, and educational questions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 10000
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 45000
      }
    );

    let rawText = response.data.choices[0].message.content;
    console.log("📥 Groq response received, length:", rawText.length);

    // Clean the response
    let cleanedText = rawText
      .replace(/^```json\s*|\s*```$/g, "")
      .replace(/^```\s*|\s*```$/g, "")
      .trim();
    
    const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }

    let quizQuestions = JSON.parse(cleanedText);
    
    if (!Array.isArray(quizQuestions)) {
      throw new Error("Response is not an array");
    }
    
    // Validate and fix questions
    quizQuestions = quizQuestions.slice(0, totalQuestions).map(q => ({
      question: q.question || "Question not available",
      options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: q.correctAnswer || (q.options ? q.options[0] : "Option A"),
      explanation: q.explanation || "No explanation available.",
      subtopic: q.subtopic || subTopics[0]?.topic || "General",
      difficulty: q.difficulty || "medium"
    }));
    
    return quizQuestions;
  } catch (error) {
    console.error("❌ Groq API Error:", error.message);
    return generateFallbackQuestions(mainTopic, subTopics, totalQuestions);
  }
};

const getBranchContext = (branch) => {
  const contexts = {
    cse: "Computer Science & Engineering. Focus on programming, algorithms, data structures, databases, networking, and software development.",
    ec: "Electronics & Communication Engineering. Focus on digital/analog circuits, signals, communication systems, VLSI, and embedded systems.",
    mechanical: "Mechanical Engineering. Focus on thermodynamics, fluid mechanics, solid mechanics, manufacturing, and machine design.",
    ai_ml: "AI & Machine Learning. Focus on ML algorithms, deep learning, NLP, computer vision, and data science.",
    placement: "Placement Preparation. Focus on aptitude, logical reasoning, verbal ability, data interpretation, and technical interview questions.",
    competitive: "Competitive Exams. Focus on quantitative aptitude, reasoning, general awareness, and exam-specific patterns.",
    other: "General knowledge and academic subjects."
  };
  return contexts[branch] || contexts.other;
};

const generateFallbackQuestions = (mainTopic, subTopics, totalQuestions) => {
  const questions = [];
  const subtopics = subTopics.map(st => st.topic);
  
  for (let i = 0; i < totalQuestions; i++) {
    const subtopic = subtopics[i % subtopics.length] || "General";
    const difficulty = subTopics.find(st => st.topic === subtopic)?.difficulty || "medium";
    
    questions.push({
      question: `What is a fundamental concept in ${subtopic} related to ${mainTopic}?`,
      options: [
        `Basic principle of ${subtopic}`,
        `Advanced application of ${subtopic}`,
        `Theoretical framework of ${subtopic}`,
        `Practical implementation of ${subtopic}`
      ],
      correctAnswer: `Basic principle of ${subtopic}`,
      explanation: `This is a fundamental concept in ${subtopic}. Understanding this principle is essential for mastering ${mainTopic}.`,
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

    // Calculate score and detailed results
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

    // Analyze weak and strong topics
    const subtopicStats = {};
    detailedResults.forEach(r => {
      if (!subtopicStats[r.subtopic]) {
        subtopicStats[r.subtopic] = { correct: 0, total: 0 };
      }
      subtopicStats[r.subtopic].total++;
      if (r.isCorrect) subtopicStats[r.subtopic].correct++;
    });

    const weakTopics = [];
    const strongTopics = [];
    Object.entries(subtopicStats).forEach(([topic, data]) => {
      const accuracy = (data.correct / data.total) * 100;
      if (accuracy < 60) weakTopics.push(topic);
      else if (accuracy > 80) strongTopics.push(topic);
    });

    const totalTimeSpent = timeSpent.reduce((a, b) => a + b, 0);
    const avgTime = detailedResults.length > 0 ? totalTimeSpent / detailedResults.length : 0;
    const accuracy = (score / quiz.totalQuestions) * 100;

    // Save results to database
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
      message: `📚 Focus on improving: ${weakTopics.slice(0, 3).join(', ')}. Review these topics and practice more questions.`,
      priority: 'high'
    });
  }

  if (accuracy < 50) {
    recommendations.push({
      type: 'overall_improvement',
      message: '📖 Start with basic concepts and gradually move to advanced topics. Consider taking easier quizzes first.',
      priority: 'high'
    });
  } else if (accuracy < 70) {
    recommendations.push({
      type: 'overall_improvement',
      message: '👍 Good effort! Focus on your weak areas and practice regularly to improve.',
      priority: 'medium'
    });
  } else if (accuracy >= 85) {
    recommendations.push({
      type: 'advanced_topics',
      message: '🌟 Excellent performance! Try more challenging topics or increase question difficulty.',
      priority: 'low'
    });
  }

  if (branch === 'placement') {
    recommendations.push({
      type: 'placement_tip',
      message: '💼 For placements: Focus on speed and accuracy. Practice timed mock tests regularly.',
      priority: 'medium'
    });
  } else if (branch === 'competitive') {
    recommendations.push({
      type: 'exam_tip',
      message: '🏆 For competitive exams: Analyze previous year papers and focus on high-weightage topics.',
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
      .select('_id mainTopic branch score totalQuestions completedAt subTopics')
      .lean();
    
    console.log(`✅ Found ${quizzes.length} completed quizzes`);
    
    const formattedHistory = quizzes.map(quiz => ({
      _id: quiz._id,
      quizId: quiz._id,
      topic: quiz.mainTopic,
      branch: quiz.branch,
      level: getOverallLevel(quiz.subTopics),
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
    
    const quizzes = await Quiz.find({ user: userId, status: 'completed' }).sort({ completedAt: -1 });
    
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
          message: '🎯 Start taking quizzes to see your analytics and track your progress!',
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
        topicPerformance[topic] = { total: 0, correct: 0, attempts: 0, lastScore: 0 };
      }
      topicPerformance[topic].total += quiz.totalQuestions;
      topicPerformance[topic].correct += (quiz.score || 0);
      topicPerformance[topic].attempts += 1;
      topicPerformance[topic].lastScore = (quiz.score / quiz.totalQuestions) * 100;
    });

    const weakAreas = Object.entries(topicPerformance)
      .filter(([_, data]) => (data.correct / data.total) * 100 < 60)
      .map(([topic]) => topic);

    const strongAreas = Object.entries(topicPerformance)
      .filter(([_, data]) => (data.correct / data.total) * 100 > 80)
      .map(([topic]) => topic);

    const progressData = quizzes.map((quiz, index) => ({
      attempt: quizzes.length - index,
      date: quiz.completedAt,
      accuracy: quiz.totalQuestions > 0 ? (quiz.score / quiz.totalQuestions) * 100 : 0,
      topic: quiz.mainTopic,
      score: quiz.score,
      total: quiz.totalQuestions
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
      message: `📚 Focus on improving: ${weakAreas.slice(0, 3).join(', ')}. These topics need more practice.`,
      priority: 'high'
    });
  }

  if (overallAccuracy < 50) {
    recommendations.push({
      type: 'overall_improvement',
      message: '📖 Start with basic concepts and easier difficulty levels. Build your foundation first.',
      priority: 'high'
    });
  } else if (overallAccuracy < 70) {
    recommendations.push({
      type: 'overall_improvement',
      message: '👍 You\'re on the right track! Focus on consistency and practice your weak areas.',
      priority: 'medium'
    });
  } else if (overallAccuracy >= 85) {
    recommendations.push({
      type: 'advanced_topics',
      message: '🌟 Excellent performance! Challenge yourself with harder questions and new topics.',
      priority: 'low'
    });
  }

  if (strongAreas.length > 0 && weakAreas.length === 0) {
    recommendations.push({
      type: 'maintain_momentum',
      message: '🎯 Great job! Keep maintaining this momentum and try exploring advanced concepts.',
      priority: 'low'
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