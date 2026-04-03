// src/pages/OAuthSuccess.jsx
import React, { useEffect, useContext,useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext"; // Adjust path as needed
import axiosInstance from "../../utils/axiosInstance"; // Adjust path as needed
import { motion } from "framer-motion";
import { FcGoogle,FcInspection,FcCheckmark,FcLock,FcKey } from "react-icons/fc";

export default function OAuthSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  // const [dots, setDots] = useState("");
  
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setDots(prev => prev.length >= 3 ? "" : prev + ".");
  //   }, 500);
  //   return () => clearInterval(interval);
  // }, []);

useEffect(() => {
  const handleOAuthSuccess = async () => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (!accessToken || !refreshToken) {
      console.error("❌ No tokens found in URL");
      navigate("/login?error=no_token");
      return;
    }

    try {
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      const response = await axiosInstance.get('/api/auth/profile');
      const userData = response.data.data;
      
      login(userData, accessToken, refreshToken);
      
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 500);
      
    } catch (error) {
      console.error("❌ OAuth success error:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      delete axiosInstance.defaults.headers.common['Authorization'];
      navigate("/login?error=auth_failed");
    }
  };

  handleOAuthSuccess();
}, [location, navigate, login]);

  return (
<div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo Section */}
        <div className="text-center mb-8">
          {/* Google Icon with Simple Animation */}
          <motion.div
            className="inline-block mb-4"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <FcGoogle className="text-5xl" />
          </motion.div>

          {/* Intera.AI Title */}
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-gray-500 to-gray-700 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Intera.AI
          </motion.h1>
        </div>

        {/* Main Content */}
        <div className="bg-gray-700/20 rounded-2xl shadow-lg p-6 border border-gray-500 text-white">
          {/* Header */}
          <motion.h2
            className="text-xl font-semibold text-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Connecting to Google
          </motion.h2>

          {/* Security Badges */}
          <div className="flex justify-center space-x-4 mb-8">
            <motion.div
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <FcInspection className="text-black" />
              <span className="text-sm font-medium text-black">Secure</span>
            </motion.div>
            
            <motion.div
              className="flex items-center space-x-2 px-3 py-1.5 bg-purple-50 rounded-lg"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="text-sm font-bold text-purple-600">Intera.AI</span>
            </motion.div>
          </div>

          {/* Progress Section */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Authentication</span>
              <motion.span
                className="font-medium"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Processing...
              </motion.span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>

          {/* Status Steps */}
          <div className="space-y-3">
            {[
              { icon: <FcCheckmark />, text: "Verifying credentials", color: "text-green-500" },
              { icon: "→", text: "Linking with Intera.AI profile", color: "text-blue-500" },
              { icon: <FcLock />, text: "Encrypting session data", color: "" },
              { icon: "•", text: "Finalizing setup", color: "text-gray-400" },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-3 text-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className={`w-5 h-5 flex items-center justify-center ${step.color}`}>
                  {step.icon}
                </div>
                <span className="">{step.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Technology Indicators */}
          <motion.div
            className="mt-8 pt-6 border-t border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="space-y-2">
              {[
                { name: "OAuth 2.0", color: "bg-orange-100 text-orange-700" },
                { name: "Google API", color: "bg-blue-100 text-blue-700" },
                { name: "Intera.AI", color: "bg-purple-100 text-purple-700" },
              ].map((tech, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg ${tech.color}`}
                >
                  <FcKey className="text-sm" />
                  <span className="text-xs font-medium">{tech.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Footer Note */}
        <motion.p
          className="text-center text-xs text-gray-300 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          This may take a few moments
        </motion.p>
      </div>
    </div>
  );
}