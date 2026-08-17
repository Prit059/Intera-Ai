require("dotenv").config();
const express = require("express");
const cors = require("cors")
const path = require("path");
const connectDB = require("./config/db");
const { Server } = require("socket.io");
require('./config/passport');
const mongoose = require('mongoose');
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
const teacherAptitudeRoutes = require('./routes/teacherAptitudeRoutes');
const studentAptitudeRoutes = require('./routes/studentAptitudeRoutes');
const formulaRoutes = require('./routes/formulaRoutes');

require('./Models/TeacherAptitude');
require('./Models/TeacherAptitudeAttempt');

const { generateInterviewQuestions } = require("./controllers/aiController");
const { generateConceptExplanations, generateCompanyInterviewQuestions } = require("./controllers/aiController");
const { generateQuiz } = require("./controllers/quizController");

const { protect } = require("./middlewares/authMiddleware");
const app = express();
const passport = require('passport');
const session = require('express-session');

const server = require("http").createServer(app);

// CORS configuration - SINGLE CONFIGURATION
const allowedOrigins = [
  "http://localhost:5173",
  "https://intera-ai.vercel.app/",  // Your Vercel frontend
  "https://intera-ai.onrender.com"     // Your backend itself (if needed)
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if(!origin) return callback(null, true);
    
    if(allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
}));

// Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io accessible inside routes/controllers
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-quiz-room", (quizId) => {
    socket.join(quizId);
    console.log(`User ${socket.id} joined room ${quizId}`);
  });

  socket.on("update-leaderboard", (payload) => {
    socket.to(payload.quizId).emit("leaderboard-update", payload);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Session configuration - IMPORTANT for production
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === "production", // true in production (HTTPS)
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// Middleware
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/Adsessions', AdsessionRoutes);
app.use('/api/Adquizzes', AdquizRoutes);
app.use('/api/quiz-attempts', AdquizAttemptRoutes);
app.use('/', GoogleAuthRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/AdAptitude', AdAptitudeRoutes);
app.use('/api/ai', aiLearningRoutes);
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api/admin/aptitudetopic', adminAptitudeRoutes);
app.use('/api/student', studentAptitudeRoutes);
app.use('/api/formulas', formulaRoutes);

app.use("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.use("/api/ai/generate-explanation", protect, generateConceptExplanations);
app.use("/api/ai/generate-quiz", protect, generateQuiz);
app.use("/api/ai/generate-company-questions", protect, generateCompanyInterviewQuestions);

app.use('/api/teacher/aptitude', teacherAptitudeRoutes);

// Server uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test endpoint to check if backend is reachable
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend is running" });
});

// Start Server
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
      // console.log(`CORS enabled for: ${allowedOrigins.join(", ")}`);
    });
  })
  .catch(err => {
    console.error("DB connection failed", err);
    process.exit(1);
  });