const Question = require("../Models/Question");
const Session = require("../Models/Session");

exports.addQuestionsToSession = async (req ,res) => {
  try{
    const { sessionId, questions } = req.body;

    if(!sessionId || !questions || !Array.isArray(questions)){
      return res.status(400).json({ message: "Invalid Input data request."});
    }

    const session = await Session.findById(sessionId);

    if(!session){
      return res.status(404).json({ message: "Session not found."});
    }

    //Create new Question
    const createdQuestions = await Question.insertMany(
      questions.map((q)=>({
        session: sessionId,
        question: q.question,
        answer: q.answer,
    }))
  );

  //Update session to include new question IDs
  session.questions.push(...createdQuestions);
  await session.save();

  res.status(201).json(createdQuestions);
  }catch(err){
    res.status(500).json({message: "Server Error."})
  }
}

exports.togglePinQuestion = async (req, res) => {
  try {
    const { id } = req.params; // Get ID from URL params
    
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }
    
    question.isPinned = !question.isPinned;
    await question.save();

    // Return consistent response structure
    res.status(200).json({ 
      success: true, 
      message: question.isPinned ? "Question pinned" : "Question unpinned",
      question: question // Make sure this matches frontend expectation
    });
  } catch (err) {
    console.error("Toggle pin error:", err);
    res.status(500).json({ message: "Server Error." });
  }
}

exports.updateQuestionsNote = async (req, res) => {
  try{
    const { note } = req.body;
    const question = await Question.findById(req.params.id);

    if(!question){
      return res.status(404).json({message: "Question not found."});
    }

    question.note = note || "";
    await question.save();

    res.status(200).json({success: true, question});
  }catch(err){
    res.status(500).json({message: "Server Error."});
  }
}