const AdQuiz = require('../Models/AdQuiz');

// Create new quiz
const createQuiz = async (req, res) => {
  try {
    // Manual date validation
    if (new Date(req.body.endDate) <= new Date(req.body.startDate)) {
      return res.status(400).json({ 
        success: false, 
        message: "End date must be after start date" 
      });
    }
    
    if (new Date(req.body.startDate) < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: "Start date cannot be in the past" 
      });
    }

    const quizData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const quiz = new AdQuiz(quizData);
    await quiz.save();
    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all quizzes with filters (OPTIMIZED)
const getAllQuizzes = async (req, res) => {
  try {
    const { branch, category, difficulty, contestType, isPublic, page = 1, limit = 20 } = req.query;
    
    let filter = { isActive: true };
    
    if (branch) filter.branch = branch;
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (contestType) filter.contestType = contestType;
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
    
    // ✅ OPTIMIZED: lean() + pagination + select
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    
    const quizzes = await AdQuiz.find(filter)
      .select('_id title description branch category difficulty createdBy startDate endDate isPublic')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    const total = await AdQuiz.countDocuments(filter);
      
    res.status(200).json({ 
      success: true, 
      data: quizzes,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get quiz by ID
const getQuizById = async (req, res) => {
  try {
    const quiz = await AdQuiz.findById(req.params.id).populate('createdBy', 'name email');
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }
    
    if (!quiz.isActive) {
      return res.status(404).json({ success: false, message: "Quiz is not active" });
    }
    
    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get quizzes by creator
const getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await AdQuiz.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update quiz
const updateQuiz = async (req, res) => {
  try {
    const quiz = await AdQuiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }
    
    // Check if user owns the quiz
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    
    const updatedQuiz = await AdQuiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ success: true, data: updatedQuiz });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete quiz (soft delete)
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await AdQuiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }
    
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    
    await AdQuiz.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get active quizzes (for students) (OPTIMIZED)
const getActiveQuizzes = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const now = new Date();
    
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    
    const filter = {
      isActive: true,
      isPublic: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    };
    
    const quizzes = await AdQuiz.find(filter)
      .select('_id title description branch category difficulty startDate endDate createdBy')
      .populate('createdBy', 'name')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    const total = await AdQuiz.countDocuments(filter);
    
    res.status(200).json({ 
      success: true, 
      data: quizzes,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  getMyQuizzes,
  updateQuiz,
  deleteQuiz,
  getActiveQuizzes
};