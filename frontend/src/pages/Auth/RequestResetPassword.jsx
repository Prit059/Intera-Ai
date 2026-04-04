// RequestResetPassword.jsx
import React, { useState } from 'react';
import { LuSparkles, LuMail, LuArrowLeft } from "react-icons/lu";
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import CardSwap, { Card } from '../../components/CardSwap';
import { motion } from 'framer-motion';
import TextType from '../../components/TextType';
import questionImg from "../images/question.png";
import questionGenImg from "../images/question-gen.png";
import roadmapImg from "../images/roadmap.png";
import aptitudeImg from "../images/aptitude.png";

function RequestResetPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.FORGOT_PASSWORD, { email });
      console.log(response.data);
      setIsSubmitted(true);
    } catch (error) {
      console.log(error.response?.data || error.message);
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
      {/* Left Side - Request Reset Form (40%) - White Background */}
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
              <div className="flex items-center gap-2 mb-2">
                <LuSparkles className="text-orange-500" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
              </div>
              <p className="text-gray-500 text-sm">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                {error}
              </div>
            )}

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  labelClassName="text-gray-700 font-medium text-sm"
                  inputClassName="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900 placeholder-gray-400"
                  icon={<LuMail className="text-gray-400" size={18} />}
                  required
                />

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
                      <span>Sending...</span>
                    </div>
                  ) : 'Send Reset Link'}
                </button>

                <div className="text-center">
                  <Link 
                    to="/login"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors text-sm"
                  >
                    <LuArrowLeft size={16} />
                    Back to login
                  </Link>
                </div>
              </form>
            ) : (
              <div className="text-center py-6">
                <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl border border-green-100">
                  <svg className="w-12 h-12 mx-auto mb-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="font-medium">Check your email!</p>
                  <p className="text-sm mt-1">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  Didn't receive the email? Check your spam folder or
                </p>
                
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                    setError(null);
                  }}
                  className="text-orange-500 hover:text-orange-600 font-medium text-sm"
                >
                  Try again with a different email
                </button>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Link 
                    to="/login"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    <LuArrowLeft size={16} />
                    Back to login
                  </Link>
                </div>
              </div>
            )}
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
              text={["Don't worry,"]}
              typingSpeed={50}
              pauseDuration={2000}
              showCursor={false}
              loop={false}
              initialDelay={500}
            />
          </div>
          
          <div className="text-7xl font-bold text-white mt-1">
            <TextType 
              text={["We've got you"]}
              typingSpeed={50}
              pauseDuration={2000}
              showCursor={false}
              loop={false}
              initialDelay={1500}
            />
          </div>
          
          <div className="text-2xl text-orange-500 mt-2">
            <TextType 
              text={["Reset Password"]}
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

export default RequestResetPassword;