import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft, FiCheck, FiX, FiClock, FiAward, FiUsers, 
  FiBarChart2, FiEye, FiEdit, FiTrash2, FiPlay, FiPause,
  FiCalendar, FiTag, FiHelpCircle, FiAlertTriangle, FiCheckCircle,FiCoffee
} from "react-icons/fi";
import { API_PATHS } from "../utils/apiPaths";

// API paths for aptitude
const ADAPTITUDE_API = {
  GET_ONE: '/api/AdAptitude/:id',
  GET_WITH_ANSWERS: '/api/AdAptitude/:id/with-answers',
  DELETE: '/api/AdAptitude/:id',
  TOGGLE_STATUS: '/api/AdAptitude/:id/toggle-status'
};

export default function AdAptitudeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [aptitude, setAptitude] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [showAnswers, setShowAnswers] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    const fetchAptitude = async () => {
      try {
        // Try to fetch with answers first
        const res = await axiosInstance.get(
          ADAPTITUDE_API.GET_WITH_ANSWERS.replace(':id', id)
        );
        setAptitude(res.data.data || res.data);
      } catch (err) {
        console.error("Error fetching aptitude details:", err);
        // Fallback to regular fetch
        try {
          const res = await axiosInstance.get(
            ADAPTITUDE_API.GET_ONE.replace(':id', id)
          );
          setAptitude(res.data.data || res.data);
        } catch (fallbackErr) {
          console.error("Error in fallback fetch:", fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAptitude();
    fetchleaderboard();
  }, [id]);

    const fetchleaderboard = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.ADAPTITUDE_ATTEMPTS.LEADERBOARD.replace(':aptitudeId',id));
      // console.log(response.data || response.data.data);
      const list = response.data.data || [];
      console.log(response);
      console.log(list);
      setLeaderboardData(list.slice(0, 100));
    } catch (error) {
      console.log(error.message);
    }
  }

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
      case 'Hard': return 'bg-orange-600/20 border border-orange-600 text-orange-200';
      case 'Very Hard': return 'bg-red-600/20 border border-red-600 text-red-200';
      default: return 'bg-gray-600/20 border border-gray-600 text-gray-200';
    }
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'Multiple Choice (MCQ)': return '🔘';
      case 'True/False': return '✅';
      case 'Multiple Response': return '☑️';
      case 'Fill in the Blanks': return '📝';
      case 'Short Answer': return '✏️';
      case 'Matching': return '🔗';
      default: return '❓';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  const handleDeleteAptitude = async () => {
    if (window.confirm('Are you sure you want to delete this aptitude test?')) {
      try {
        await axiosInstance.delete(ADAPTITUDE_API.DELETE.replace(':id', id));
        navigate('/admin/aptitude-dashboard');
      } catch (error) {
        console.error('Error deleting aptitude:', error);
      }
    }
  };

  const handleToggleStatus = async () => {
    try {
      const res = await axiosInstance.put(ADAPTITUDE_API.TOGGLE_STATUS.replace(':id', id));
      setAptitude(prev => ({ ...prev, isActive: res.data.data.isActive }));
    } catch (error) {
      console.error('Error toggling aptitude status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!aptitude) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Aptitude Test not found</h2>
          <button
            onClick={() => navigate('/AdAptitudeDashboard')}
            className="bg-blue-700/20 hover:bg-blue-700/50 px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const scoring = aptitude.scoring || {};
  const schedule = aptitude.schedule || {};
  const negativeMarking = scoring.negativeMarking || aptitude.negativeMarking;
  const passingScore = scoring.passingScore || aptitude.passingScore;
  const maxAttempts = scoring.maxAttempts || aptitude.maxAttempts;
  const pointsPerQuestion = scoring.pointsPerQuestion || aptitude.pointsPerQuestion;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/AdAptitudeDashboard')}
              className="flex items-center text-blue-400 hover:text-blue-300 mr-4"
            >
              <FiArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold">Aptitude Test Details</h1>
          </div>Performancs
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="flex items-center bg-blue-600/20 border border-blue-600 px-4 py-2 rounded hover:bg-blue-500/20"
            >
              <FiEye className="mr-2" />
              {showAnswers ? 'Hide Answers' : 'Show Answers'}
            </button>
            <button
              onClick={() => navigate(`/admin/aptitudes/edit/${aptitude._id}`)}
              className="flex items-center bg-yellow-600/20 border border-yellow-600 px-4 py-2 rounded hover:bg-yellow-500/20"
            >
              <FiEdit className="mr-2" />
              Edit
            </button>
            <button
              onClick={handleToggleStatus}
              className={`flex items-center px-4 py-2 rounded ${
                aptitude.isActive 
                  ? 'bg-red-600/20 border border-red-600 hover:bg-red-500/20' 
                  : 'bg-green-600/20 border border-green-600 hover:bg-green-500/20'
              }`}
            >
              {aptitude.isActive ? <FiPause className="mr-2" /> : <FiPlay className="mr-2" />}
              {aptitude.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={handleDeleteAptitude}
              className="flex items-center bg-red-600/20 border border-red-600 px-4 py-2 rounded hover:bg-red-500/20"
            >
              <FiTrash2 className="mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Aptitude Overview Card */}
        <div className="bg-gray-600/20 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{aptitude.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(aptitude.difficulty)}`}>
                  {aptitude.difficulty}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  aptitude.isActive ? 'bg-green-600/20 border border-green-600' : 'bg-red-600/20 border border-red-600'
                }`}>
                  {aptitude.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="bg-blue-700/30 border border-blue-500 px-3 py-1 rounded-full text-sm">
                  {aptitude.totalQuestions} Questions
                </span>
              </div>
              <p className="text-gray-300 mb-4">{aptitude.description}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center text-sm">
              <FiClock className="mr-2 text-blue-400" />
              <span className="text-gray-300">Duration:</span>
              <span className="ml-2 font-semibold">{aptitude.timeLimit} minutes</span>
            </div>
            <div className="flex items-center text-sm">
              <FiAward className="mr-2 text-yellow-400" />
              <span className="text-gray-300">Total Marks:</span>
              <span className="ml-2 font-semibold">{aptitude.totalMarks || 0}</span>
            </div>
            <div className="flex items-center text-sm">
              <FiCheckCircle className="mr-2 text-green-400" />
              <span className="text-gray-400">Passing Score:</span>
              <span className="ml-2 font-semibold">{passingScore}%</span>
            </div>
            <div className="flex items-center text-sm">
              <FiUsers className="mr-2 text-purple-400" />
              <span className="text-gray-400">Max Attempts:</span>
              <span className="ml-2 font-semibold">
                {maxAttempts === 'unlimited' ? 'Unlimited' : maxAttempts}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-400">Category:</span> 
              <span className="ml-2">{aptitude.category}</span>
              {aptitude.customCategory && <span className="text-gray-500"> ({aptitude.customCategory})</span>}
            </div>
            <div>
              <span className="font-semibold text-gray-400">Sub-category:</span> 
              <span className="ml-2">{aptitude.subCategory || 'None'}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-400">Contest Type:</span> 
              <span className="ml-2 capitalize">{aptitude.contestType}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-400">Points per Question:</span> 
              <span className="ml-2">{pointsPerQuestion || 1}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-400">Negative Marking:</span> 
              <span className="ml-2">{negativeMarking ? 'Yes' : 'No'}</span>
              {negativeMarking && (
                <span className="ml-2 text-red-400">
                  (-{scoring.negativeMarks || aptitude.negativeMarks || 0.25})
                </span>
              )}
            </div>
            <div>
              <span className="font-semibold text-gray-400">Show Explanation:</span> 
              <span className="ml-2">{aptitude.showExplanation ? 'Yes' : 'No'}</span>
            </div>
          </div>

          {/* Schedule Information */}
          {(schedule.startDate || aptitude.startDate) && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h3 className="font-semibold mb-2 flex items-center">
                <FiCalendar className="mr-2 text-blue-400" />
                Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-400">Start:</span> 
                  <span className="ml-2">
                    {formatDate(schedule.startDate || aptitude.startDate)} at {formatTime(schedule.startTime || aptitude.startTime)}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-400">End:</span> 
                  <span className="ml-2">
                    {formatDate(schedule.endDate || aptitude.endDate)} at {formatTime(schedule.endTime || aptitude.endTime)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {aptitude.tags && aptitude.tags.length > 0 && (
            <div className="mt-4">
              <span className="font-semibold text-gray-400 flex items-center">
                <FiTag className="mr-2" />
                Tags:
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {aptitude.tags.map((tag, index) => (
                  <span key={index} className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          {aptitude.specialInstructions && (
            <div className="mt-4">
              <span className="font-semibold text-gray-400 flex items-center">
                <FiAlertTriangle className="mr-2 text-yellow-400" />
                Special Instructions:
              </span>
              <p className="mt-2 text-gray-300 bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-3">
                {aptitude.specialInstructions}
              </p>
            </div>
          )}
        </div>
        {/* Questions Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center">
              <FiHelpCircle className="mr-2" />
              Questions ({aptitude.questions?.length || 0})
            </h2>
            <div className="text-sm text-gray-400">
              Total: {aptitude.totalQuestions} questions • {aptitude.totalMarks} marks
            </div>
          </div>
        </div>
        
        <div className="flex">
          <div className="absolute right-12 bg-gray-700/20 p-8 rounded-2xl border border-gray-600">
            <h2 className="text-3xl font-semibold mb-4">Performancs</h2>
            {leaderboardData.length > 0 ? (
                          <div className="space-y-3 max-h-119 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-900 scrollbar-track-gray-800">
                            {leaderboardData.map((entry, index) => (
                              <div key={entry._id} className={`flex items-center justify-between p-4.5 rounded-lg border ${
                                index === 0 ? 'bg-yellow-900/20 border-yellow-600' :
                                index === 1 ? 'bg-gray-700/20 border-gray-600' :
                                index === 2 ? 'bg-yellow-700/20 border-yellow-700' :
                                'bg-black/30 border-gray-600'
                              }`}>
                                <div className="flex items-center gap-4">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    index === 0 ? 'bg-yellow-500 text-black' :
                                    index === 1 ? 'bg-gray-400 text-black' :
                                    index === 2 ? 'bg-yellow-700 text-white' :
                                    'bg-gray-700'
                                  }`}>
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div className="font-medium">{entry.user?.name || 'Anonymous'}</div>
                                    <div className="text-sm text-gray-400">
                                      Score: {entry.score}/{entry.totalMarks}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold">
                                    {entry.percentage}%
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {entry.timeSpent ? Math.floor(entry.timeSpent / 60) + 'm' : '--'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <FiCoffee className="text-4xl mx-auto text-gray-600 mb-3" />
                            <p className="text-gray-400">No leaderboard data available yet</p>
                            <p className="text-gray-500 text-sm">Be the first to set a record!</p>
                          </div>
                        )}
          </div>
        {aptitude.questions?.length ? (
          <div className="space-y-4 space-x-44">
            {aptitude.questions.map((q, idx) => (
              <div key={idx} className="bg-gray-600/20 rounded-xl p-6 border border-gray-700">
                {/* Question Header */}
                <div 
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => toggleQuestion(idx)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="font-bold text-lg">{idx + 1}.</span>
                      <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty}
                      </span>
                      <span className="bg-blue-700/20 border border-blue-600 px-2 py-1 rounded text-xs">
                        {getQuestionTypeIcon(q.questionType)} {q.questionType}
                      </span>
                      <span className="text-yellow-400 text-sm">
                        {q.marks || pointsPerQuestion} mark{q.marks !== 1 ? 's' : ''}
                      </span>
                      {q.timeLimit > 0 && (
                        <span className="text-gray-400 text-sm flex items-center">
                          <FiClock className="mr-1" /> {q.timeLimit}s
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-medium mb-2">{q.questionText}</p>
                    
                    {/* Question Image */}
                    {q.imageUrl && (
                      <div className="mb-3">
                        <img 
                          src={q.imageUrl} 
                          alt="Question" 
                          className="max-w-xs max-h-40 rounded-lg border border-gray-600"
                        />
                      </div>
                    )}
                  </div>
                  <div className="text-2xl ml-4 text-gray-400">
                    {expandedQuestions[idx] ? '−' : '+'}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedQuestions[idx] && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    {/* Options for MCQ types */}
                    {(q.questionType === 'Multiple Choice (MCQ)' || q.questionType === 'Multiple Response') && q.options && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-3 text-gray-300">Options:</h4>
                        <div className="space-y-2">
                          {q.options.map((option, optIndex) => {
                            const isCorrect = showAnswers && (
                              Array.isArray(q.correctAnswer) 
                                ? q.correctAnswer.includes(optIndex)
                                : q.correctAnswer === optIndex
                            );
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
                                  <span className="flex-1">{option || `Option ${optIndex + 1}`}</span>
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
                    {q.questionType === 'True/False' && showAnswers && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-3 text-gray-300">Correct Answer:</h4>
                        <div className={`p-4 rounded-lg ${
                          q.correctAnswer === true || q.correctAnswer === 'true'
                            ? 'bg-green-900/30 border border-green-600 text-green-200' 
                            : 'bg-red-900/30 border border-red-600 text-red-200'
                        }`}>
                          <div className="flex items-center justify-center">
                            <span className="text-lg font-semibold">
                              {q.correctAnswer === true || q.correctAnswer === 'true' ? 'TRUE' : 'FALSE'}
                            </span>
                            {q.correctAnswer === true || q.correctAnswer === 'true' ? (
                              <FiCheck className="ml-2 text-green-400" size={20} />
                            ) : (
                              <FiX className="ml-2 text-red-400" size={20} />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Text-based Answers */}
                    {(q.questionType === 'Fill in the Blanks' || q.questionType === 'Short Answer') && showAnswers && (
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

                    {/* Question Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                      <div>
                        <span className="font-semibold">Question ID:</span> {q._id || `Q${idx + 1}`}
                      </div>
                      <div>
                        <span className="font-semibold">Type:</span> {q.questionType}
                      </div>
                      {q.timeLimit > 0 && (
                        <div>
                          <span className="font-semibold">Time Limit:</span> {q.timeLimit} seconds
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">Marks:</span> {q.marks || pointsPerQuestion}
                      </div>
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
            <p className="text-gray-400">This aptitude test doesn't have any questions yet.</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}