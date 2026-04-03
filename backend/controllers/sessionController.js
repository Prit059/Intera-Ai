const Session = require("../Models/Session");
const Question = require("../Models/Question");

exports.createSession = async (req, res) => {
  try {
    const { 
      role, 
      experience, 
      topicsFocus, 
      description, 
      questions,
      interviewType = "general",
      company,
      jobRole,
      branch
    } = req.body;
    
    const userId = req.user._id;

    console.log("📝 Creating session with data:", {
      role,
      experience,
      topicsFocus,
      interviewType,
      questionsType: typeof questions,
      isArray: Array.isArray(questions)
    });

    // Validate required fields based on interview type
    if (interviewType === "company" && (!company || !jobRole)) {
      return res.status(400).json({ 
        success: false, 
        message: "Company and jobRole are required for company interviews" 
      });
    }

    if (!role || !experience || !topicsFocus) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: role, experience, topicsFocus" 
      });
    }

    // Handle questions - convert to array if needed
    let questionsArray = [];
    
    if (questions) {
      if (Array.isArray(questions)) {
        questionsArray = questions;
      } else if (typeof questions === 'object' && questions !== null) {
        // Check if it's the AI response format with a questions property
        if (questions.questions && Array.isArray(questions.questions)) {
          questionsArray = questions.questions;
        } else {
          // Convert object to array of questions
          questionsArray = Object.values(questions).filter(q => 
            q && typeof q === 'object' && q.question
          );
        }
      } else if (typeof questions === 'string') {
        try {
          // Try to parse if it's a JSON string
          const parsed = JSON.parse(questions);
          if (Array.isArray(parsed)) {
            questionsArray = parsed;
          } else if (parsed.questions && Array.isArray(parsed.questions)) {
            questionsArray = parsed.questions;
          }
        } catch (e) {
          console.log("Questions string not parseable:", e.message);
        }
      }
    }

    console.log(`📊 Processing ${questionsArray.length} questions`);

    // If no valid questions, create default ones
    if (questionsArray.length === 0) {
      questionsArray = [
        {
          question: `Tell me about your experience with ${topicsFocus || 'your tech stack'}.`,
          answer: "Expected answer would depend on candidate's experience",
          type: "general"
        },
        {
          question: "Describe a challenging project you worked on.",
          answer: "Use STAR method: Situation, Task, Action, Result",
          type: "behavioral"
        }
      ];
    }

    const sessionData = {
      user: userId,
      role,
      experience,
      topicsFocus,
      description: description || "",
      questions: [], // Will be populated after question creation
      interviewType,
      branch: branch || "General"
    };

    // Add company-specific fields only for company interviews
    if (interviewType === "company") {
      sessionData.company = company;
      sessionData.jobRole = jobRole;
    }

    // Create session first
    const session = await Session.create(sessionData);
    console.log("✅ Session created with ID:", session._id);

    // Create questions and link them to the session
    const questionDocs = [];
    
    for (let i = 0; i < questionsArray.length; i++) {
      const q = questionsArray[i];
      try {
        // Handle different question formats
        const questionText = q.question || q.text || q.content || `Question ${i + 1}`;
        const answerText = q.answer || q.expectedAnswer || q.solution || "";
        const questionType = q.type || q.category || 
          (q.question?.toLowerCase().includes('tell me about') ? 'behavioral' : 'technical');

        const question = await Question.create({
          session: session._id,
          question: questionText,
          answer: answerText,
          type: questionType,
          difficulty: q.difficulty || "medium",
          isPinned: false
        });
        
        questionDocs.push(question._id);
        console.log(`✅ Created question ${i + 1}: ${questionText.substring(0, 30)}...`);
      } catch (qError) {
        console.error(`❌ Error creating question ${i}:`, qError.message);
        // Continue with other questions
      }
    }

    // Update session with question references
    session.questions = questionDocs;
    await session.save();
    console.log(`✅ Session updated with ${questionDocs.length} questions`);

    // Populate the session with questions for the response
    const populatedSession = await Session.findById(session._id)
      .populate("questions")
      .lean();

    res.status(201).json({ 
      success: true, 
      session: populatedSession
    });
  } catch (error) {
    console.error("❌ Error creating session:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      success: false, 
      message: "Server Error",
      error: error.message 
    });
  }
};

exports.getMySession = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("questions")
      .lean();

    if (!sessions || sessions.length === 0) {
      return res.status(200).json({ 
        success: true, 
        sessions: [],
        count: 0,
        message: "No sessions found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      sessions,
      count: sessions.length 
    });
  } catch(err) {
    console.error("❌ Error in getMySession:", err);
    res.status(500).json({ 
      success: false,
      message: "Server Error",
      error: err.message 
    });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate({
        path: "questions",
        options: { sort: { isPinned: -1, createdAt: 1 } },
      })
      .lean()
      .exec();
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: "Session not found"
      });
    }

    // Check if the user owns this session
    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to access this session" 
      });
    }

    res.status(200).json({ 
      success: true, 
      session 
    });
  } catch(err) {
    console.error("❌ Error in getSessionById:", err);
    res.status(500).json({ 
      success: false,
      message: "Server Error",
      error: err.message 
    });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: "Session not found" 
      });
    }

    // Check if the logged-in user owns this session
    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to delete this session" 
      });
    }

    // Delete all questions linked to this session
    const deleteResult = await Question.deleteMany({ session: session._id });
    console.log(`✅ Deleted ${deleteResult.deletedCount} questions`);

    // Delete the session
    await Session.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      success: true, 
      message: "Session successfully deleted" 
    });
  } catch(err) {
    console.error("❌ Error in deleteSession:", err);
    res.status(500).json({ 
      success: false,
      message: "Server Error",
      error: err.message 
    });
  }
};

// Get sessions by type
exports.getSessionsByType = async (req, res) => {
  try {
    const { type } = req.params; // 'general' or 'company'
    
    const sessions = await Session.find({ 
      user: req.user.id,
      interviewType: type 
    })
      .sort({ createdAt: -1 })
      .populate("questions")
      .lean();

    res.status(200).json({ 
      success: true, 
      sessions,
      count: sessions.length 
    });
  } catch(err) {
    console.error("❌ Error in getSessionsByType:", err);
    res.status(500).json({ 
      success: false,
      message: "Server Error",
      error: err.message 
    });
  }
};

// Update question pin status
exports.togglePinQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    
    const question = await Question.findById(questionId);
    
    if (!question) {
      return res.status(404).json({ 
        success: false, 
        message: "Question not found" 
      });
    }

    // Verify ownership through session
    const session = await Session.findById(question.session);
    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized" 
      });
    }

    question.isPinned = !question.isPinned;
    await question.save();

    res.status(200).json({ 
      success: true, 
      isPinned: question.isPinned 
    });
  } catch(err) {
    console.error("❌ Error toggling pin:", err);
    res.status(500).json({ 
      success: false,
      message: "Server Error",
      error: err.message 
    });
  }
};

// Update question answer
exports.updateQuestionAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { answer } = req.body;
    
    const question = await Question.findById(questionId);
    
    if (!question) {
      return res.status(404).json({ 
        success: false, 
        message: "Question not found" 
      });
    }

    // Verify ownership through session
    const session = await Session.findById(question.session);
    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized" 
      });
    }

    question.answer = answer;
    await question.save();

    res.status(200).json({ 
      success: true, 
      question 
    });
  } catch(err) {
    console.error("❌ Error updating answer:", err);
    res.status(500).json({ 
      success: false,
      message: "Server Error",
      error: err.message 
    });
  }
};