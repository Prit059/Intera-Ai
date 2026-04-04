const express = require("express");
const cors = require("cors");
const path = require("path");
const passport = require("passport"); 
const session = require("express-session");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const questionRoutes = require("./routes/questionRoutes");
const roadmapRoutes = require('./routes/roadmapRoutes');
const AdsessionRoutes = require('./routes/AdsessionRoutes');
const AdquizRoutes = require('./routes/AdquizRoutes');
const AdquizAttemptRoutes = require('./routes/AdquizAttemptRoutes');
const GoogleAuthRoutes = require('./routes/GoogleAuthRoutes');
const quizRoutes = require('./routes/quizRoutes')
const AdAptitudeRoutes = require('./routes/AdAptitudeRoutes');
const aiLearningRoutes = require('./routes/aiLearningRoutes');
const aptitudeRoutes = require('./routes/aptitudeRoutes');
const adminAptitudeRoutes = require('./routes/adminAptitudeRoutes');
const { generateInterviewQuestions } = require("./controllers/aiController");
const { generateConceptExplanations, generateCompanyInterviewQuestions } = require("./controllers/aiController");
const { generateQuiz } = require("./controllers/quizController");

const { protect } = require("./middlewares/authMiddleware");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes); 
app.use('/api/quizzes', quizRoutes);
app.use('/api/aptitude', aptitudeRoutes);

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/oauth', GoogleAuthRoutes); 

app.use('/api/sessions', sessionRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/Adsessions', AdsessionRoutes);
app.use('/api/Adquizzes', AdquizRoutes);
app.use('/api/quiz-attempts', AdquizAttemptRoutes);
app.use('/api/AdAptitude', AdAptitudeRoutes);
app.use('/api/ai', aiLearningRoutes);
app.use('/api/aptitudetopic', adminAptitudeRoutes);

app.use("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.use("/api/ai/generate-explanation", protect, generateConceptExplanations);
app.use("/api/ai/generate-quiz", protect, generateQuiz);
app.use("/api/ai/generate-company-questions", protect, generateCompanyInterviewQuestions);

app.use("/uploads", express.static(path.join(__dirname, "uploads"), {}));

module.exports = app;