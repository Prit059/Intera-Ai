// QuizResult.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Target, BarChart3, Clock, TrendingUp, Award, Lightbulb, Home, Loader } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const QuizResult = () => {
  const { quizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);

  // Check if we have data from location state (just submitted)
  const hasLocationState = location.state && location.state.detailedResults;

  useEffect(() => {
    const fetchResult = async () => {
      // If we have data from navigation state, use it directly
      if (hasLocationState) {
        setResultData(location.state);
        setLoading(false);
        return;
      }

      // Otherwise, fetch from API using quizId
      if (quizId) {
        try {
          setLoading(true);
          const response = await axiosInstance.get(API_PATHS.QUIZ.RESULT(quizId));
          setResultData(response.data);
          setError(null);
        } catch (err) {
          console.error("Failed to fetch quiz result:", err);
          setError(err.response?.data?.message || "Failed to load quiz result");
        } finally {
          setLoading(false);
        }
      } else {
        setError("No quiz ID provided");
        setLoading(false);
      }
    };

    fetchResult();
  }, [quizId, hasLocationState, location.state]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-blue-400" size={48} />
          <p className="text-gray-400">Loading your results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !resultData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="bg-gray-900/80 border border-gray-700 rounded-2xl shadow-2xl p-8 text-center backdrop-blur-lg">
          <p className="text-red-400 text-lg mb-4">❌ {error || "No result data found."}</p>
          <button
            className="bg-blue-600/20 border border-blue-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:bg-blue-600/40 transition-all"
            onClick={() => navigate('/main-quiz')}
          >
            Go to Quiz Dashboard
          </button>
        </div>
      </div>
    );
  }

  const {
    detailedResults,
    performance,
    recommendations,
    topic,
    level,
    score,
    totalQuestions,
    completedAt
  } = resultData;

  const accuracy = Math.round((score / totalQuestions) * 100);
  const formattedDate = completedAt ? new Date(completedAt).toLocaleString() : new Date().toLocaleString();

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 pt-8">
          <button
            className="bg-blue-600/20 border border-blue-500 text-white absolute top-15 left-34 px-6 py-2 z-10 rounded-lg font-semibold shadow-lg hover:bg-blue-600/40 transition-all"
            onClick={() => navigate('/main-quiz')}
          >
            ← Back to Dashboard
          </button>
          
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-8 backdrop-blur-lg">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              🎉 Quiz Completed!
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              Topic: <span className="font-semibold text-white">{topic}</span> • 
              Level: <span className="uppercase text-amber-400">{level}</span>
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Completed: {formattedDate}
            </p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 backdrop-blur-sm">
                <Target className="mx-auto mb-2 text-blue-400" size={24} />
                <div className="text-2xl font-bold text-white">{score}/{totalQuestions}</div>
                <div className="text-sm text-gray-400">Score</div>
              </div>
              <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 backdrop-blur-sm">
                <BarChart3 className="mx-auto mb-2 text-green-400" size={24} />
                <div className="text-2xl font-bold text-white">{accuracy}%</div>
                <div className="text-sm text-gray-400">Accuracy</div>
              </div>
              <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 backdrop-blur-sm">
                <Clock className="mx-auto mb-2 text-amber-400" size={24} />
                <div className="text-2xl font-bold text-white">
                  {performance?.averageTimePerQuestion?.toFixed(1) || 0}s
                </div>
                <div className="text-sm text-gray-400">Avg Time/Q</div>
              </div>
              <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 backdrop-blur-sm">
                <TrendingUp className="mx-auto mb-2 text-red-400" size={24} />
                <div className="text-2xl font-bold text-white">
                  {performance?.weakTopics?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Areas to Improve</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Performance Insights - Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Weak Areas */}
            {performance?.weakTopics && performance.weakTopics.length > 0 && (
              <div className="bg-red-600/10 border border-red-500/30 rounded-xl p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <h3 className="font-bold text-red-300 text-lg">Need Improvement</h3>
                </div>
                <ul className="space-y-2">
                  {performance.weakTopics.map((topic, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                      <span className="text-gray-200">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strong Areas */}
            {performance?.strongTopics && performance.strongTopics.length > 0 && (
              <div className="bg-green-600/10 border border-green-500/30 rounded-xl p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="text-green-400" size={18} />
                  <h3 className="font-bold text-green-300 text-lg">Strong Areas</h3>
                </div>
                <ul className="space-y-2">
                  {performance.strongTopics.map((topic, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                      <span className="text-gray-200">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {recommendations && recommendations.length > 0 && (
              <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="text-blue-400" size={18} />
                  <h3 className="font-bold text-blue-300 text-lg">Recommendations</h3>
                </div>
                <ul className="space-y-3">
                  {recommendations.map((rec, idx) => (
                    <li 
                      key={idx} 
                      className={`p-3 rounded-lg text-sm border-l-4 ${
                        rec.priority === 'high' 
                          ? 'bg-red-500/10 border-l-red-400' 
                          : 'bg-blue-500/10 border-l-blue-400'
                      }`}
                    >
                      <div className="font-medium text-gray-200">{rec.message}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Detailed Results - Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-6 backdrop-blur-lg">
              <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                <BarChart3 className="text-cyan-400" size={24} />
                Detailed Question Analysis
              </h3>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {detailedResults.map((q, i) => (
                  <div 
                    key={i} 
                    className={`border-l-4 rounded-r-xl p-5 transition-all duration-300 hover:scale-[1.02] ${
                      q.isCorrect 
                        ? 'bg-green-600/5 border-l-green-500 hover:bg-green-600/10' 
                        : 'bg-red-600/5 border-l-red-500 hover:bg-red-600/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          q.isCorrect 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          Q{i+1}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          q.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                          q.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {q.difficulty || 'medium'}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-gray-600/30 text-gray-300">
                          {q.subtopic || 'General'}
                        </span>
                      </div>
                      <span className={`text-lg font-bold ${
                        q.isCorrect ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {q.isCorrect ? '✓' : '✗'}
                      </span>
                    </div>

                    <div className="text-lg font-medium text-gray-200 mb-4 leading-relaxed">
                      {q.question}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Your Answer</div>
                        <div className={`px-3 py-2 rounded-lg border ${
                          q.isCorrect 
                            ? 'bg-green-500/10 border-green-500/30 text-green-300' 
                            : 'bg-red-500/10 border-red-500/30 text-red-300'
                        }`}>
                          {q.userAnswer || "Not answered"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Correct Answer</div>
                        <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300">
                          {q.correctAnswer}
                        </div>
                      </div>
                    </div>

                    {q.explanation && (
                      <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-4">
                        <div className="text-sm text-cyan-400 font-semibold mb-2">💡 Explanation</div>
                        <div className="text-gray-300 text-sm leading-relaxed">
                          {q.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <button
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg"
            onClick={() => navigate('/quiz')}
          >
            <Target size={20} />
            Take Another Quiz
          </button>
          <button
            className="bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105"
            onClick={() => navigate('/main-quiz')}
          >
            <Home size={20} />
            Back to Dashboard
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #60a5fa;
        }
      `}</style>
    </div>
  );
};

export default QuizResult;