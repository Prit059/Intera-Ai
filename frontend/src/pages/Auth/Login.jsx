import React, { useState, useContext } from 'react';
import { LuSparkles } from "react-icons/lu";
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import { Link } from 'react-router-dom';
import CardSwap, { Card } from '../../components/CardSwap';
import { motion } from 'framer-motion';
import TextType from '../../components/TextType'; // Import TextType
import questionImg from "../images/question.png";
import questionGenImg from "../images/question-gen.png";
import roadmapImg from "../images/roadmap.png";
import aptitudeImg from "../images/aptitude.png";

function Login({ setCurrentPage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);    

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

// In Login.jsx handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");

  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
      email,
      password,
    });
    
    console.log("Login response:", response.data);
    
    const { data } = response.data;
    const { accessToken, refreshToken, role, mustChangePassword, firstname, lastname, id, email: userEmail } = data;

    if (accessToken && refreshToken) {
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      
      // Store complete user data
      const userData = {
        id,
        email: userEmail,
        firstname,
        lastname,
        role,
        emailverified: true // Set based on backend response
      };
      localStorage.setItem('user', JSON.stringify(userData));
      
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      updateUser(userData);
      
      // Check email verification status
      if (!userData.emailverified) {
        toast.error('Please verify your email before logging in.');
        return;
      }
      
      // Role-based navigation
      if (mustChangePassword) {
        navigate('/teacher/change-password');
      } else if (role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  } catch (error) {
    console.error("Login error:", error.response?.data);
    setError(error.response?.data?.message || "Something went wrong. Please try again.");
  } finally {
    setIsLoading(false);
  }
};
  // 4 Cards for CardSwap
  const cardContent = [
    {
      title: "Interview Prep Q&A",
      description: "Practice with AI that thinks like a real interviewer",
      features: ["Real-time feedback", "Voice enabled", "Multiple scenarios"],
      icon: "🤖",
      color: "from-orange-500 to-red-500",
      image: questionImg,
    },
    {
      title: "AI Interview Question Generator",
      description: "Smart questions tailored to your role",
      features: ["Role specific", "Difficulty based", "Trending topics"],
      icon: "❓",
      color: "from-blue-500 to-cyan-500",
      image: questionGenImg
    },
    {
      title: "AI Roadmap Creator",
      description: "Personalized learning paths to mastery",
      features: ["Step by step", "Resources", "Track progress"],
      icon: "🗺️",
      color: "from-purple-500 to-pink-500",
      image: roadmapImg
    },
    {
      title: "Aptitude Contest",
      description: "Dynamic quizzes that identify weak areas",
      features: ["Adaptive difficulty", "Topic wise", "Performance analysis"],
      icon: "🎮",
      color: "from-green-500 to-emerald-500",
      image: aptitudeImg
    }
  ];

  return (
    <div className="min-h-screen flex overflow-hidden bg-white">
      {/* Left Side - Login Form (40%) - White Background */}
      <div className="w-[40%] bg-white flex items-center justify-center p-8 relative overflow-y-auto">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-50 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-100 rounded-full filter blur-3xl opacity-30"></div>
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-orange-900 to-orange-600 bg-clip-text text-transparent">
                Intera.
              </span>
              <span className="text-gray-900">AI</span>
            </h1>
            <p className="text-gray-500 text-lg mt-2">Your AI Placement Partner.</p>
          </div>

          {/* Form Container */}
          <div className="bg-gray-700/10 rounded-3xl p-8 shadow-2xl shadow-gray-600/60 border border-gray-400/60">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-500 text-sm mt-1">
                Please enter your details to login to your account
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                labelClassName="text-gray-700 font-medium text-sm"
                inputClassName="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900 placeholder-gray-400"
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                labelClassName="text-gray-700 font-medium text-sm"
                inputClassName="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900 placeholder-gray-400"
                required
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link 
                  to="/requestresetpassword"
                  className="text-md text-black hover:text-orange-600 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-600/60 to-orange-600/80 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-lg shadow-orange-500/25"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Logging in...</span>
                  </div>
                ) : 'Login'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-400"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or</span>
                </div>
              </div>

              <a 
                href='http://localhost:8000/auth/google'
                className="flex items-center justify-center gap-3 w-full py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-orange-500/30 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Login with Google
              </a>

              <div className="text-center">
                <span className="text-gray-500 text-md">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage('signup')}
                  className="text-orange-500 hover:text-orange-600 font-semibold text-md"
                >
                  <Link to="/signup">Sign up</Link>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Right Side - CardSwap (60%) - Black Background */}
      <div className="w-[60%] bg-black relative overflow-hidden flex items-center justify-center">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Quote Overlay with TextType Animation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute top-7 left-5 z-20 text-left"
        >
          <div className="text-5xl font-medium text-white/60">
            <TextType 
              text={["Your journey to"]}
              typingSpeed={50}
              pauseDuration={2000}
              showCursor={false}
              loop={false}
              initialDelay={500}
            />
          </div>
          
          <div className="text-7xl font-bold text-white mt-1">
            <TextType 
              text={["Interview Success"]}
              typingSpeed={50}
              pauseDuration={2000}
              showCursor={false}
              loop={false}
              initialDelay={1500}
            />
          </div>
          
          <div className="text-2xl text-orange-500 mt-2">
            <TextType 
              text={["Starts Here"]}
              typingSpeed={50}
              pauseDuration={2000}
              showCursor={true}
              cursorCharacter="_"
              cursorClassName="text-orange-500"
              loop={false}
              initialDelay={3000}
            />
          </div>
        </motion.div>

        {/* CardSwap Container - Centered */}
        <div className="relative w-full h-full flex items-center justify-center">
          <CardSwap
            width={620}
            height={550}
            cardDistance={70}
            verticalDistance={80}
            delay={4000}
            pauseOnHover={true}
            skewAmount={4}
            easing="elastic"
          >
            {cardContent.map((card, index) => (
              <Card key={index}>
                <div className="relative w-full h-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-white/10">
                  {/* Image/Icon Background */}
                  <img 
                      src={card.image} 
                      alt={card.title}
                      className="w-full h-full object-cover opacity-80"
                    />
                  
                  {/* Animated Particles */}
                  <div className="absolute inset-0">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/30 rounded-full animate-ping"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 2}s`,
                          animationDuration: `${2 + Math.random() * 3}s`
                        }}
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      {/* Icon */}
                      <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">
                        {card.icon}
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-3xl font-bold text-white mb-2">
                        {card.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-white/70 mb-6 text-lg">
                        {card.description}
                      </p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-3">
                        {card.features.map((feature, i) => (
                          <span 
                            key={i}
                            className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm border border-white/10"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Glowing Border */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
                </div>
              </Card>
            ))}
          </CardSwap>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
      </div>
    </div>
  );
}

export default Login;