import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import { FiArrowLeft, FiCheck, FiX, FiClock, FiAward, FiUsers, FiBarChart2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function AdQuizDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.ADQUIZ.GET_ONE.replace(':id', id));
        setQuiz(res.data.data || res.data);
      } catch (err) {
        console.error("Error fetching quiz details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-600/20 border border-green-600 text-green-200';
      case 'Medium': return 'bg-yellow-600/20 border border-yellow-600 text-yellow-200';
      case 'Hard': return 'bg-red-600/20 border border-red-600 text-red-200';
      default: return 'bg-gray-600/20 border border-gray-600 text-gray-200';
    }
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'MCQ': return '🔘';
      case 'True/False': return '✅';
      case 'Multiple Response': return '☑️';
      case 'Text Input': return '📝';
      case 'Code': return '💻';
      default: return '❓';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black border border-gray-700 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-500/20 border border-gray-700 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-400 hover:text-blue-300 mr-4"
          >
            <FiArrowLeft className="mr-2" />
          </button>
          <h1 className="text-3xl font-bold">Quiz Details</h1>
        </div>

        {/* Quiz Overview Card */}
        <div className="bg-gray-600/20 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
              <p className="text-gray-300 mb-4">{quiz.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(quiz.difficulty)}`}>
                {quiz.difficulty}
              </span>
              <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                {quiz.totalQuestions} Qs
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-300">
              <FiClock className="mr-2 text-blue-400" />
              {quiz.duration} minutes
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <FiUsers className="mr-2 text-green-400" />
              {quiz.totalParticipants || 0} participants
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <FiAward className="mr-2 text-yellow-400" />
              Avg: {quiz.averageScore || 0}%
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <FiBarChart2 className="mr-2 text-purple-400" />
              {quiz.contestType}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <span className="font-semibold">Branch:</span> {quiz.branch}
              {quiz.customBranch && ` (${quiz.customBranch})`}
            </div>
            <div>
              <span className="font-semibold">Category:</span> {quiz.category}
              {quiz.customCategory && ` (${quiz.customCategory})`}
            </div>
            {quiz.subCategory && (
              <div>
                <span className="font-semibold">Sub-category:</span> {quiz.subCategory}
                {quiz.customSubCategory && ` (${quiz.customSubCategory})`}
              </div>
            )}
            <div>
              <span className="font-semibold">Schedule:</span> {formatDate(quiz.startDate)} - {formatDate(quiz.endDate)}
            </div>
          </div>

          {quiz.tags && quiz.tags.length > 0 && (
            <div className="mt-4">
              <span className="font-semibold text-gray-400">Tags:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {quiz.tags.map((tag, index) => (
                  <span key={index} className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Questions Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            Questions ({quiz.questions?.length || 0})
            <span className="ml-2 text-sm text-gray-400">({quiz.totalQuestions} total)</span>
          </h2>
        </div>

        {quiz.questions?.length ? (
          <div className="space-y-4">
            {quiz.questions.map((q, idx) => (
              <div key={idx} className="bg-gray-600/20 rounded-xl p-6 border border-gray-700">
                {/* Question Header */}
                <div 
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => toggleQuestion(idx)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-lg">{idx + 1}.</span>
                      <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty}
                      </span>
                      <span className="bg-blue-700/20 border border-blue-600 px-2 py-2 rounded text-xs">
                        {getQuestionTypeIcon(q.questionType)} {q.questionType}
                      </span>
                      <span className="text-yellow-400 text-sm">
                        {q.points} point{q.points !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-lg font-medium mb-2">{q.questionText}</p>
                  </div>
                  <div className="text-2xl ml-4">
                    {expandedQuestions[idx] ? '−' : '+'}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedQuestions[idx] && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    {/* Options for MCQ types */}
                    {(q.questionType === 'MCQ' || q.questionType === 'Multiple Response') && q.options && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-3 text-gray-300">Options:</h4>
                        <div className="space-y-2">
                          {q.options.map((option, optIndex) => {
                            const isCorrect = q.correctAnswer.includes(optIndex.toString());
                            return (
                              <div
                                key={optIndex}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                  isCorrect
                                    ? 'bg-green-800/10 border-green-600 text-green-200'
                                    : 'bg-gray-700/20 border-gray-600 text-gray-300'
                                }`}
                              >
                                <div className="flex items-center">
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                                    isCorrect 
                                      ? 'bg-green-600/20 border border-green-600 text-white' 
                                      : 'bg-gray-500/20 border border-gray-600 text-gray-300'
                                  }`}>
                                    {String.fromCharCode(65 + optIndex)}
                                  </span>
                                  <span className="flex-1">{option}</span>
                                  {isCorrect && (
                                    <FiCheck className="text-green-400 ml-2" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* True/False Options */}
                    {q.questionType === 'True/False' && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-3 text-gray-300">Correct Answer:</h4>
                        <div className={`p-4 rounded-lg ${
                          q.correctAnswer === 'true' 
                            ? 'bg-green-900/30 border border-green-600 text-green-200' 
                            : 'bg-red-900/30 border border-red-600 text-red-200'
                        }`}>
                          <div className="flex items-center justify-center">
                            <span className="text-lg font-semibold">
                              {q.correctAnswer === 'true' ? 'TRUE' : 'FALSE'}
                            </span>
                            {q.correctAnswer === 'true' ? (
                              <FiCheck className="ml-2 text-green-400" size={20} />
                            ) : (
                              <FiX className="ml-2 text-red-400" size={20} />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Text/Code Answer */}
                    {(q.questionType === 'Text Input' || q.questionType === 'Code') && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-3 text-gray-300">Correct Answer:</h4>
                        <div className="bg-gray-500/20 p-4 rounded-lg border border-gray-600">
                          <pre className="whitespace-pre-wrap break-words">
                            {q.correctAnswer}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2 text-gray-300">Explanation:</h4>
                        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-600">
                          <p className="text-blue-200">{q.explanation}</p>
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                      {q.timeLimit > 0 && (
                        <div>
                          <span className="font-semibold">Time Limit:</span> {q.timeLimit} seconds
                        </div>
                      )}
                      {q.imageUrl && (
                        <div>
                          <span className="font-semibold">Image:</span> 
                          <a href={q.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-2">
                            View Image
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-500/20 rounded-xl p-8 text-center border border-gray-700">
            <div className="text-6xl mb-4">❓</div>
            <h3 className="text-xl font-semibold mb-2">No questions available</h3>
            <p className="text-gray-400">This quiz doesn't have any questions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}