// controllers/quizAttemptController.js
const AdQuizAttempt = require('../Models/AdQuizAttempt');
const AdQuiz = require('../Models/AdQuiz');

const submitAttempt = async (req, res) => {
  try {
    const { quizId, answers, timeSpent, violations, forced, reason } = req.body;
    const quiz = await AdQuiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let score = 0, correctAnswers = 0, attemptedQuestions = 0;

    quiz.questions.forEach((q, idx) => {
      const userAns = answers[idx];
      if (userAns !== undefined && userAns !== '') attemptedQuestions++;
      if (userAns === q.correctAnswer) {
        correctAnswers++;
        score += q.points || quiz.pointsPerQuestion;
      } else if (userAns && quiz.negativeMarking) {
        score -= quiz.negativePoints;
      }
    });

    const attempt = await AdQuizAttempt.create({
      quizId,
      user: req.user.id,
      answers,
      score,
      correctAnswers,
      attemptedQuestions,
      timeSpent,
      violations,
      forced,
      reason
    });

    res.json({
      attemptId: attempt._id,
      score,
      correctAnswers,
      attemptedQuestions,
      timeSpent,
      violations
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getUserAttempts = async (req, res) => {
  const { id } = req.params; // quiz id
  const count = await AdQuizAttempt.countDocuments({ quizId: id, user: req.user.id });
  res.json({ attempts: count });
};

const getLeaderboard = async (req, res) => {
  const { id } = req.params;
  const top = await AdQuizAttempt.find({ quizId: id })
    .populate('user', 'name')
    .sort({ score: -1, timeSpent: 1 })
    .limit(50);
  res.json(top);
};

const getResult = async (req, res) => {
  const attempt = await AdQuizAttempt.findOne({ 
    quizId: req.params.id, 
    user: req.user.id 
  }).sort({ createdAt: -1 });
  
  if (!attempt) return res.status(404).json({ message: 'Result not found' });
  res.json(attempt);
};
// Backend fix for answer comparison
// Backend fix for answer comparison
const getDetailedResult = async (req, res) => {
  try {
    const attempt = await AdQuizAttempt.findOne({ 
      quizId: req.params.id, 
      user: req.user.id 
    }).sort({ createdAt: -1 });
    
    const quiz = await AdQuiz.findById(req.params.id);
    
    if (!attempt || !quiz) return res.status(404).json({ message: 'Data not found' });

    const details = quiz.questions.map((q, idx) => {
      let userAnswer;
      
      // Extract user answer from different possible data structures
      if (attempt.answers && Array.isArray(attempt.answers)) {
        // If answers is an array
        userAnswer = attempt.answers[idx] !== undefined ? String(attempt.answers[idx]) : '';
      } else if (attempt.answers && typeof attempt.answers === 'object') {
        // If answers is an object with index keys
        userAnswer = attempt.answers[idx] || attempt.answers[String(idx)] || '';
      } else if (attempt.answer instanceof Map) {
        // If answer is a Map
        userAnswer = attempt.answer.get(String(idx)) || '';
      } else if (attempt.answer && typeof attempt.answer === 'object') {
        // If answer is an object
        userAnswer = attempt.answer[idx] || attempt.answer[String(idx)] || '';
      } else {
        userAnswer = '';
      }

      // Proper answer comparison for different question types
      let isCorrect = false;
      
      if (q.questionType === 'Multiple Response') {
        // For multiple response, compare sorted arrays
        if (userAnswer && q.correctAnswer) {
          const userAnswers = userAnswer.split(',').map(a => a.trim()).sort().join(',');
          const correctAnswers = q.correctAnswer.split(',').map(a => a.trim()).sort().join(',');
          isCorrect = userAnswers === correctAnswers;
        }
      } else if (q.questionType === 'True/False') {
        // For True/False, compare strings
        isCorrect = userAnswer === q.correctAnswer;
      } else if (q.questionType === 'MCQ') {
        // For MCQ, compare option index or value
        if (userAnswer !== '' && q.correctAnswer !== undefined) {
          // Try both string comparison and index comparison
          isCorrect = String(userAnswer) === String(q.correctAnswer) || 
                     (q.options && q.options[userAnswer] === q.options[q.correctAnswer]);
        }
      } else {
        // For text input or code questions
        if (userAnswer && q.correctAnswer) {
          isCorrect = String(userAnswer).trim().toLowerCase() === 
                     String(q.correctAnswer).trim().toLowerCase();
        }
      }

      return {
        questionNumber: idx + 1,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswer,
        correct: isCorrect, // This should now be accurate
        explanation: q.explanation || '',
        imageUrl: q.imageUrl || '',
        points: q.points || quiz.pointsPerQuestion || 1,
        timeSpent: attempt.timeSpentPerQuestion ? attempt.timeSpentPerQuestion[idx] : null,
        difficulty: q.difficulty || quiz.difficulty,
        category: q.category || quiz.category
      };
    });

    res.json({ 
      ...attempt.toObject(), 
      questions: details,
      totalScore: quiz.questions.length * (quiz.pointsPerQuestion || 1),
      quiz: {
        title: quiz.title,
        passingScore: quiz.passingScore,
        category: quiz.category,
        difficulty: quiz.difficulty,
        totalQuestions: quiz.questions.length
      }
    });
  } catch (error) {
    console.error('Error in getDetailedResult:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  submitAttempt,
  getUserAttempts,
  getLeaderboard,
  getResult,
  getDetailedResult
};