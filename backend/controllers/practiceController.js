// controllers/practiceController.js
const Question = require("../Models/Question");
const PracticeSession = require("../Models/PracticeSession");
const Session = require("../Models/Session");

// Start a practice session
exports.startPracticeSession = async (req, res) => {
  try {
    const { sessionId, type = "single", questionCount = 5 } = req.body;
    const userId = req.user._id;

    // Get session questions
    const session = await Session.findById(sessionId).populate("questions");
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    // Select questions based on type
    let selectedQuestions = session.questions;
    
    if (type === "timed") {
      // Select random questions
      selectedQuestions = selectedQuestions
        .sort(() => 0.5 - Math.random())
        .slice(0, questionCount);
    } else if (type === "mock") {
      // Select questions across difficulty levels
      const easy = selectedQuestions.filter(q => q.difficulty === "easy");
      const medium = selectedQuestions.filter(q => q.difficulty === "medium");
      const hard = selectedQuestions.filter(q => q.difficulty === "hard");
      
      selectedQuestions = [
        ...easy.slice(0, Math.ceil(questionCount * 0.3)),
        ...medium.slice(0, Math.ceil(questionCount * 0.4)),
        ...hard.slice(0, Math.ceil(questionCount * 0.3))
      ].slice(0, questionCount);
    }

    // Create practice session
    const practiceSession = await PracticeSession.create({
      user: userId,
      session: sessionId,
      type,
      questions: selectedQuestions.map(q => q._id),
      startedAt: new Date()
    });

    res.status(201).json({
      success: true,
      practiceSession,
      firstQuestion: selectedQuestions[0]
    });
  } catch (error) {
    console.error("Error starting practice:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit audio recording and get feedback
exports.submitRecording = async (req, res) => {
  try {
    const { practiceSessionId, questionId, audioUrl, transcript, duration } = req.body;
    const userId = req.user._id;

    // Validate practice session
    const practiceSession = await PracticeSession.findById(practiceSessionId);
    if (!practiceSession || practiceSession.user.toString() !== userId.toString()) {
      return res.status(404).json({ success: false, message: "Practice session not found" });
    }

    // Generate AI feedback
    const feedback = await generateFeedback(transcript, questionId);

    // Save recording
    const recording = {
      questionId,
      audioUrl,
      transcript,
      duration,
      feedback
    };

    practiceSession.recordings.push(recording);
    
    // Update question practice stats
    const question = await Question.findById(questionId);
    if (question) {
      question.practiceAttempts += 1;
      question.lastPracticedAt = new Date();
      question.userRecordings.push({
        audioUrl,
        duration,
        createdAt: new Date(),
        feedback
      });
      await question.save();
    }

    await practiceSession.save();

    res.status(200).json({
      success: true,
      feedback,
      nextQuestion: await getNextQuestion(practiceSession)
    });
  } catch (error) {
    console.error("Error submitting recording:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get next question in practice session
exports.getNextQuestion = async (req, res) => {
  try {
    const { practiceSessionId } = req.params;
    const practiceSession = await PracticeSession.findById(practiceSessionId)
      .populate("questions");

    const nextQuestion = await getNextQuestion(practiceSession);
    
    if (!nextQuestion) {
      // Complete the session
      practiceSession.isCompleted = true;
      practiceSession.completedAt = new Date();
      practiceSession.duration = Math.round(
        (practiceSession.completedAt - practiceSession.startedAt) / 60000
      );
      
      // Calculate scores
      const scores = calculateOverallScores(practiceSession.recordings);
      practiceSession.scores = scores;
      
      await practiceSession.save();
      
      return res.status(200).json({
        success: true,
        sessionComplete: true,
        scores,
        feedback: generateSessionFeedback(scores)
      });
    }

    practiceSession.currentQuestionIndex += 1;
    await practiceSession.save();

    res.status(200).json({
      success: true,
      question: nextQuestion,
      progress: {
        current: practiceSession.currentQuestionIndex + 1,
        total: practiceSession.questions.length
      }
    });
  } catch (error) {
    console.error("Error getting next question:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to generate AI feedback
async function generateFeedback(transcript, questionId) {
  // In production, use OpenAI API for better feedback
  // For now, implement basic analysis
  
  const question = await Question.findById(questionId);
  const answerText = question?.answer || "";
  
  // Simple analysis
  const fillerWords = ["um", "uh", "like", "you know", "actually", "basically"];
  const transcriptWords = transcript.toLowerCase().split(" ");
  
  const fillerWordsFound = transcriptWords.filter(word => 
    fillerWords.includes(word)
  );
  
  const fillerCount = fillerWordsFound.length;
  const wordCount = transcriptWords.length;
  const fillerPercentage = wordCount > 0 ? (fillerCount / wordCount) * 100 : 0;
  
  // Content matching (simple version)
  const keyTerms = extractKeyTerms(answerText);
  const mentionedTerms = keyTerms.filter(term => 
    transcript.toLowerCase().includes(term.toLowerCase())
  );
  
  const contentScore = keyTerms.length > 0 ? 
    (mentionedTerms.length / keyTerms.length) * 100 : 0;
  
  // Confidence score (based on speech patterns)
  const confidenceScore = calculateConfidenceScore(transcript);
  
  return {
    fillerWordsCount: fillerCount,
    fillerWords: [...new Set(fillerWordsFound)],
    confidenceScore: Math.min(100, Math.max(0, confidenceScore)),
    contentScore: Math.min(100, Math.max(0, contentScore)),
    timingScore: 75, // Placeholder
    overallScore: Math.round((confidenceScore + contentScore) / 2),
    suggestions: generateSuggestions(fillerCount, contentScore),
    strengths: generateStrengths(transcript)
  };
}

function extractKeyTerms(text) {
  // Simple keyword extraction
  const stopWords = ["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for"];
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(' ');
  return [...new Set(words.filter(word => 
    word.length > 3 && !stopWords.includes(word)
  ).slice(0, 10))];
}

function calculateConfidenceScore(transcript) {
  // Simple confidence calculation
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.length > 0 ? 
    transcript.length / sentences.length : 0;
  
  let score = 70; // Base score
  
  // Adjust based on characteristics
  if (avgSentenceLength > 15) score += 10;
  if (sentences.length > 3) score += 10;
  
  return Math.min(100, score);
}

function generateSuggestions(fillerCount, contentScore) {
  const suggestions = [];
  
  if (fillerCount > 5) {
    suggestions.push("Try to reduce filler words like 'um', 'uh'. Practice pausing instead.");
  }
  
  if (contentScore < 60) {
    suggestions.push("Focus more on key technical terms. Review the model answer.");
  }
  
  if (contentScore > 80) {
    suggestions.push("Great technical knowledge! Now work on structuring your answer.");
  }
  
  if (suggestions.length === 0) {
    suggestions.push("Good job! Try to speak more slowly and clearly.");
  }
  
  return suggestions.slice(0, 3);
}

function generateStrengths(transcript) {
  const strengths = ["Clear communication"];
  
  if (transcript.length > 100) {
    strengths.push("Detailed explanation");
  }
  
  const sentences = transcript.split(/[.!?]+/);
  if (sentences.length > 2) {
    strengths.push("Well-structured answer");
  }
  
  return strengths;
}

function calculateOverallScores(recordings) {
  if (!recordings || recordings.length === 0) {
    return {
      communication: 0,
      technical: 0,
      confidence: 0,
      timing: 0,
      overall: 0
    };
  }
  
  const totalScores = recordings.reduce((acc, recording) => {
    const feedback = recording.feedback;
    return {
      communication: acc.communication + (100 - (feedback.fillerWordsCount * 5)),
      technical: acc.technical + feedback.contentScore,
      confidence: acc.confidence + feedback.confidenceScore,
      timing: acc.timing + feedback.timingScore,
      overall: acc.overall + feedback.overallScore
    };
  }, { communication: 0, technical: 0, confidence: 0, timing: 0, overall: 0 });
  
  const count = recordings.length;
  return {
    communication: Math.round(totalScores.communication / count),
    technical: Math.round(totalScores.technical / count),
    confidence: Math.round(totalScores.confidence / count),
    timing: Math.round(totalScores.timing / count),
    overall: Math.round(totalScores.overall / count)
  };
}

function generateSessionFeedback(scores) {
  const feedback = [];
  
  if (scores.communication < 70) {
    feedback.push("Work on reducing filler words and speaking more clearly.");
  } else if (scores.communication > 85) {
    feedback.push("Excellent communication skills!");
  }
  
  if (scores.technical < 70) {
    feedback.push("Review technical concepts and key terms.");
  } else if (scores.technical > 85) {
    feedback.push("Strong technical knowledge demonstrated.");
  }
  
  if (scores.confidence < 70) {
    feedback.push("Practice more to build confidence in your answers.");
  }
  
  if (scores.overall < 70) {
    feedback.push("Keep practicing! Focus on one area at a time.");
  } else if (scores.overall > 85) {
    feedback.push("Outstanding performance! You're interview-ready.");
  }
  
  return feedback.length > 0 ? feedback : ["Good progress! Keep practicing regularly."];
}

async function getNextQuestion(practiceSession) {
  if (practiceSession.currentQuestionIndex >= practiceSession.questions.length) {
    return null;
  }
  
  return await Question.findById(
    practiceSession.questions[practiceSession.currentQuestionIndex]
  );
}