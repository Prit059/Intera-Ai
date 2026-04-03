require("dotenv").config();
const express = require("express");
const cors = require("cors")
const path = require("path");
const connectDB = require("./config/db");
const { Server } = require("socket.io");
require('./config/passport'); // Ensure passport config is loaded
// require('./config/passportConfig');   // your Google strategy file
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
app.use(cors()); // allow frontend requests
const passport = require('passport');
const session = require('express-session');


const server = require("http").createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
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
    // broadcast to everyone else in the room
    socket.to(payload.quizId).emit("leaderboard-update", payload);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

app.use(
  cors({
    origin: [
    "http://localhost:5173",
    "https://intera-ai-f-p.vercel.app"
    ],
    credentials: true,
    methods: ["GET","POST","PUT","DELETE"],
    allowedHeaders: ["Content-Type","Authorization"],
  })
);

// connectDB();

app.use(
  session({
    secret: process.env.SESSION_SECRET, // 🔑 pulls from .env
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set secure: true only if using HTTPS
  })
);

//middleware
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session()); // enable persistent login

//Routes
app.use("/api/auth",authRoutes);
app.use('/api/sessions',sessionRoutes);
app.use('/api/questions',questionRoutes);
app.use('/api/roadmap',roadmapRoutes);
app.use('/api/Adsessions',AdsessionRoutes);
app.use('/api/Adquizzes',AdquizRoutes);
app.use('/api/quiz-attempts',AdquizAttemptRoutes);
app.use('/',GoogleAuthRoutes);
app.use('/api/quizzes',quizRoutes);
app.use('/api/AdAptitude',AdAptitudeRoutes);
app.use('/api/ai',aiLearningRoutes);
app.use('/api/aptitude',aptitudeRoutes);
app.use('/api/admin/aptitudetopic',adminAptitudeRoutes);
app.use('/api/student', studentAptitudeRoutes);
app.use('/api/formulas', formulaRoutes);

app.use("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.use("/api/ai/generate-explanation",protect, generateConceptExplanations);
app.use("/api/ai/generate-quiz",protect, generateQuiz);
app.use("/api/ai/generate-company-questions",protect, generateCompanyInterviewQuestions);

app.use('/api/teacher/aptitude',teacherAptitudeRoutes);


// Server uploads folder
app.use("/uploads",express.static(path.join(__dirname,"uploads"), {}));

//Start Server
const PORT =  process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch(err => {
    console.error("DB connection failed", err);
    process.exit(1);
  });