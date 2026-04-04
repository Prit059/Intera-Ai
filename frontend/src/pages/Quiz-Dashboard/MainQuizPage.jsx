import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import QuizHistory from "../Home/QuizHistory";
import { useDarkMode } from "../../context/DarkModeContext";
import Navbar from "../../components/layouts/Navbar";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuBarcode, LuTarget, LuClock, LuTrendingUp } from "react-icons/lu";

function MainQuizPage() {
  const { isDarkMode } = useDarkMode();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.QUIZ.ANALYTICS);
      setAnalytics(response.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-orange-400 bg-clip-text text-transparent">
            AI Quiz Dashboard
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Welcome to your personalized learning hub! Track your progress, discover insights, and continue your knowledge journey.
          </p>
        </div>

        {/* Analytics Overview */}
        {analytics && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Overall Stats */}
            <div className="lg:col-span-1 bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <LuBarcode className="text-blue-400" />
                Overall Performance
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-gray-400">
                    <span>Total Quizzes</span>
                    <span className="text-white font-semibold">{analytics.overall.totalQuizzes}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-gray-400">
                    <span>Average Accuracy</span>
                    <span className="text-green-400 font-semibold">{analytics.overall.overallAccuracy}%</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-gray-400">
                    <span>Total Questions</span>
                    <span className="text-white font-semibold">{analytics.overall.totalQuestions}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weak Areas */}
            <div className="lg:col-span-1 bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <LuTarget className="text-red-400" />
                Areas to Improve
              </h3>
              {analytics.weakAreas.length > 0 ? (
                <ul className="space-y-2">
                  {analytics.weakAreas.slice(0, 3).map((area, index) => (
                    <li key={index} className="flex items-center gap-3 text-red-300">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      {area}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">Great job! No weak areas detected.</p>
              )}
            </div>

            {/* Recommendations */}
            <div className="lg:col-span-1 bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <LuTrendingUp className="text-green-400" />
                Recommendations
              </h3>
              {analytics.recommendations.slice(0, 2).map((rec, index) => (
                <div key={index} className="mb-3 last:mb-0">
                  <p className="text-sm text-gray-300">{rec.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quiz History Section */}
        <div className="mb-8">
          <QuizHistory />
        </div>
      </div>

      {/* Floating Action Button */}
      <Link
        to="/quiz"
        className="absolute top-133.5 right-29 bg-blue-700/40 hover:from-blue-700/60 text-white font-bold px-5 py-2 rounded-lg border border-blue-700 shadow-2xl hover:scale-101 transition-all duration-300 flex items-center gap-3"
      >
        Start New Quiz
      </Link>
    </div>
  );
}

export default MainQuizPage;