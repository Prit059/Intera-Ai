import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuTrash2, LuBarcode, LuClock, LuTrendingUp } from "react-icons/lu";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

export default function QuizHistory() {
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClearAll, setShowClearAll] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizHistory();
  }, []);

  const fetchQuizHistory = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.QUIZ.HISTORY);
      setQuizHistory(response.data);
      localStorage.setItem("quizHistory", JSON.stringify(response.data));
    } catch (error) {
      console.error("Failed to fetch quiz history:", error);
      toast.error("Failed to load quiz history");
      // Fallback to localStorage
      const stored = JSON.parse(localStorage.getItem("quizHistory") || "[]");
      setQuizHistory(stored);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    console.log("Delete quiz:", quizId);

    try {
      const response = await axiosInstance.delete(API_PATHS.QUIZ.DELETE(quizId));
      console.log("Delete response:", response.data);

      // Remove the quiz from local state
      setQuizHistory(prevHistory => prevHistory.filter((quiz) => quiz._id !== quizId));

      toast.success(response.data.message || "Quiz deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Failed to delete quiz");
      } else {
        toast.error("Failed to delete quiz");
      }
    }
  };

  const handleClearAll = async () => {
    try {
      // Clear from backend
      try {
        await axiosInstance.delete('/api/quiz/clear-all');
      } catch (apiError) {
        console.log("API clear all failed");
      }
      
      // Clear local state and storage
      setQuizHistory([]);
      localStorage.removeItem("quizHistory");
      
      setShowClearAll(false);
      toast.success("All quiz history cleared");
    } catch (error) {
      toast.error("Failed to clear history");
    }
  };

const handleview = async (quizId) => {
  // Navigate directly to the result page with quizId in URL
  navigate(`/quiz-result/${quizId}`);
};
  const getPerformanceColor = (accuracy) => {
    if (accuracy >= 80) return "text-green-400";
    if (accuracy >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (quizHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-6xl mb-4">📚</div>
        <p className="text-2xl text-gray-400 mb-2">
          No quizzes yet
        </p>
        <p className="text-gray-500">
          Start your first quiz to see your history here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 underline">
            Quiz History
          </h2>
          <p className="text-gray-400">
            Your learning journey across {quizHistory.length} quizzes
          </p>
        </div>
        <button
          onClick={() => setShowClearAll(true)}
          className="bg-red-700/10 hover:bg-red-600/30 border border-red-600 text-red-400 px-4 py-2 rounded-lg transition"
        >
          Clear All
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <LuBarcode className="text-blue-400 text-xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{quizHistory.length}</div>
              <div className="text-sm text-gray-400">Total Quizzes</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <LuTrendingUp className="text-green-400 text-xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {Math.round(quizHistory.reduce((acc, quiz) => acc + (quiz.score / quiz.totalQuestions) * 100, 0) / quizHistory.length)}%
              </div>
              <div className="text-sm text-gray-400">Avg Accuracy</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <LuClock className="text-purple-400 text-xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {quizHistory.reduce((acc, quiz) => acc + quiz.totalQuestions, 0)}
              </div>
              <div className="text-sm text-gray-400">Total Questions</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-600/20 rounded-lg">
              <span className="text-amber-400 text-xl">⭐</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {quizHistory.filter(q => (q.score / q.totalQuestions) >= 0.8).length}
              </div>
              <div className="text-sm text-gray-400">High Scores</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizHistory.map((quiz, index) => {
          const accuracy = Math.round((quiz.score / quiz.totalQuestions) * 100);
          const performanceColor = getPerformanceColor(accuracy);
          
          return (
            <div
              key={quiz._id || quiz.id}
              className="relative group bg-gray-700/20 rounded-2xl shadow-lg p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:scale-105"
            >
              {/* Delete Button - Direct delete on click */}
              <button
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600 rounded-lg text-red-400"
                onClick={() => handleDelete(quiz._id || quiz.id)}
                title="Delete this quiz"
              >
                <LuTrash2 size={16} />
              </button>

              {/* Quiz Header */}
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white truncate">
                    {quiz.topic}
                  </h3>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getDifficultyColor(quiz.level)} bg-gray-700/50`}>
                    {quiz.level}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{quiz.branch}</p>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Score:</span>
                  <span className="font-semibold text-white">
                    {quiz.score}/{quiz.totalQuestions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Accuracy:</span>
                  <span className={`font-bold ${performanceColor}`}>
                    {accuracy}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-sm text-gray-400">
                    {new Date(quiz.completedAt || quiz.date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700/20 rounded-full h-2 mb-4">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    accuracy >= 80 ? 'bg-green-500' : 
                    accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${accuracy}%` }}
                ></div>
              </div>

              {/* Action Button */}
              <button
                className="w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500 text-blue-400 py-2 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center gap-2"
                onClick={() => handleview(quiz._id || quiz.id)}
              >
                View Detailed Results
              </button>
            </div>
          );
        })}
      </div>

      {/* Clear All Confirmation Modal */}
      {showClearAll && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-white mb-2">Clear All History</h3>
            <p className="text-gray-400 mb-4">This will permanently delete all your quiz history. This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearAll(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}