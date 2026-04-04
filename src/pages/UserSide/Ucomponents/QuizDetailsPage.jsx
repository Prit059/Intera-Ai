import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';
import { API_PATHS } from '../../../utils/apiPaths';
import Navbar from '../../../components/layouts/Navbar';
import QuizCountdown from './QuizCountdown';
import {
  FiClock, FiUsers, FiAward, FiBarChart2, 
  FiBook, FiCalendar, FiPlay, FiLock,
  FiEye, FiStar, FiTrendingUp, FiArrowLeft
} from 'react-icons/fi';

const QuizDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userAttempts, setUserAttempts] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [latestAttempt, setLatestAttempt] = useState(null);

useEffect(() => {
  fetchQuizDetails();
  fetchUserAttempts();
  fetchLeaderboard();
}, [id]);

// Fetch attempts only after we know user has attempts
useEffect(() => {
  if (userAttempts > 0) {
    fetchLatestAttempt();
  }
}, [userAttempts]);

  // After loading the quiz, add this:
useEffect(() => {
  if (quiz) {
    console.log('Quiz UTC times:', {
      startUTC: quiz.startDate,
      endUTC: quiz.endDate,
      currentUTC: new Date().toISOString(),
      currentLocal: new Date().toString(),
      startLocal: new Date(quiz.startDate).toString(),
      endLocal: new Date(quiz.endDate).toString()
    });
  }
}, [quiz]);

  const fetchQuizDetails = async () => {
    try {
      const response = await axiosInstance.get(`${API_PATHS.ADQUIZ.GET_ALL}/${id}`);
        console.log('Quiz API Response:', response.data); // Add this for debugging
      setQuiz(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching quiz details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAttempts = async () => {
    try {
      const response = await axiosInstance.get(`${API_PATHS.QUIZ_ATTEMPTS.USER_ATTEMPTS}/${id}`);
      setUserAttempts(response.data.attempts || 0);
    } catch (error) {
      console.error('Error fetching user attempts:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axiosInstance.get(`${API_PATHS.QUIZ_ATTEMPTS.LEADERBOARD}/${id}`);
      setLeaderboard(response.data.slice(0, 5)); // Top 5
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

const fetchLatestAttempt = async () => {
  try {
    const response = await axiosInstance.get(`${API_PATHS.QUIZ_ATTEMPTS.RESULTS}/${id}`);
    setLatestAttempt(response.data);
  } catch (error) {
    // Handle 404 specifically (no attempts yet)
    if (error.response?.status === 404) {
      console.log('No attempts found for this quiz yet');
      setLatestAttempt(null); // Explicitly set to null
    } else {
      console.error('Error fetching latest attempt:', error);
    }
  }
};

const canStartQuiz = () => {
  if (!quiz) return false;
  
  const now = Date.now(); // Use timestamp for UTC comparison
  const startDate = Date.parse(quiz.startDate); // Parse UTC date
  const endDate = Date.parse(quiz.endDate); // Parse UTC date
  
  // Check if quiz is ongoing (using UTC)
  if (now < startDate) return false;
  if (now > endDate) return false;
  
  // Check attempt limits
  if (userAttempts >= quiz.maxAttempts) return false;
  
  return true;
};

  const handleStartQuiz = () => {
    if (canStartQuiz()) {
      // Enable fullscreen and strict mode
      document.documentElement.requestFullscreen().catch(() => {
        console.log('Fullscreen not supported');
      });
      
      navigate(`/quiz/${id}/attempt`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Quiz not found</div>
      </div>
    );
  }

  const now = new Date();
  const startDate = new Date(quiz.startDate);
  const endDate = new Date(quiz.endDate);
  const isUpcoming = now < startDate;
  const isOngoing = now >= startDate && now <= endDate;
  const isCompleted = now > endDate;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Quiz Header */}
        <div className="bg-gray-700/20 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
              <p className="text-gray-400 mb-4">{quiz.description}</p>
              
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <FiBook className="text-blue-400" />
                  <span>{quiz.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiBarChart2 className="text-green-400" />
                  <span className={`px-2 py-1 rounded text-xs ${
                    quiz.difficulty === 'Easy' ? 'bg-green-700/20 border border-green-500' : 
                    quiz.difficulty === 'Medium' ? 'bg-yellow-700/20 border border-yellow-500' : 'bg-red-700/20 border border-red-500'
                  }`}>
                    {quiz.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="text-purple-400" />
                  <span>{quiz.duration} minutes</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 text-center items-center">
              <button
                onClick={handleStartQuiz}
                disabled={!canStartQuiz()}
                className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                  canStartQuiz() 
                    ? 'bg-blue-700/20 hover:bg-blue-600/30' 
                    : 'bg-gray-700/20 border border-gray-500 cursor-not-allowed'
                }`}
              >
                <FiPlay />
                {isUpcoming ? 'Upcoming' : isCompleted ? 'Completed' : 'Start Quiz'}
              </button>
              
              {!canStartQuiz() && (
                <div className="text-sm text-gray-400 text-center">
                  {isUpcoming && `Starts ${startDate.toLocaleDateString()}`}
                  {isCompleted && 'This quiz has ended'}
                  {userAttempts >= quiz.maxAttempts && `Maximum attempts reached (${quiz.maxAttempts})`}
                </div>
              )}
              </div>
          </div>
        </div>

        {/* Previous Results Section */}
        {userAttempts > 0 && latestAttempt && (
          <div className="bg-gray-700/20 rounded-xl p-6 mb-8 border border-green-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiAward className="text-green-400" />
              Your Latest Result
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-700/10 border border-gray-500 p-4 rounded-lg">
                <div className="text-gray-400">Score</div>
                <div className="text-2xl font-bold text-green-400">
                  {latestAttempt.score} / {latestAttempt.totalScore || (quiz.questions?.length * (quiz.pointsPerQuestion || 1))}
                </div>
              </div>
              
              <div className="bg-gray-700/10 border border-gray-500 p-4 rounded-lg">
                <div className="text-gray-400">Percentage</div>
                <div className="text-2xl font-bold text-blue-400">
                  {Math.round((latestAttempt.score / (latestAttempt.totalScore || (quiz.questions?.length * (quiz.pointsPerQuestion || 1))) * 100))}%
                </div>
              </div>
              
              <div className="bg-gray-700/10 border border-gray-500 p-4 rounded-lg">
                <div className="text-gray-400">Status</div>
                <div className="text-2xl font-bold">
                  <span className={latestAttempt.score >= (quiz.passingScore / 100) * (latestAttempt.totalScore || (quiz.questions?.length * (quiz.pointsPerQuestion || 1))) 
                    ? 'text-green-400' : 'text-red-400'}>
                    {latestAttempt.score >= (quiz.passingScore / 100) * (latestAttempt.totalScore || (quiz.questions?.length * (quiz.pointsPerQuestion || 1))) 
                      ? 'Passed' : 'Failed'}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              className="bg-blue-700/10 border border-blue-500 text-white px-6 py-2 rounded font-semibold flex items-center gap-2 hover:bg-blue-700/30 cursor-pointer transition"
              onClick={() => navigate(`/quiz/${id}/results`)}
            >
              <FiArrowLeft className="mr-1" />
              View Detailed Results
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quiz Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quiz Information */}
            <div className="bg-gray-700/20 border border-gray-500 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiEye className="text-blue-400" />
                Quiz Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Questions:</span>
                    <span className="font-semibold">{quiz.questions?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="font-semibold">{quiz.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Attempts:</span>
                    <span className="font-semibold">{quiz.maxAttempts}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Points per Question:</span>
                    <span className="font-semibold">{quiz.pointsPerQuestion || 'Varies'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Negative Marking:</span>
                    <span className="font-semibold">
                      {quiz.negativeMarking ? `-${quiz.negativePoints}` : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Passing Score:</span>
                    <span className="font-semibold">{quiz.passingScore}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Information */}
            <div className="bg-gray-700/20 rounded-xl p-6 border border-gray-500">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiCalendar className="text-green-400" />
                Schedule
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-700/10 border border-gray-500 rounded-lg">
                  <span className="text-gray-400">Start Time:</span>
                  <span className="font-semibold">{new Date(quiz.startDate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/10 border border-gray-500 rounded-lg">
                  <span className="text-gray-400">End Time:</span>
                  <span className="font-semibold">{new Date(quiz.endDate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/10 border border-gray-500 rounded-lg">
                  <span className="text-gray-400">Time Remaining:</span>
                  <span className="font-semibold">
                    <QuizCountdown 
                      startDate={quiz.startDate}
                      endDate={quiz.endDate}
                    />
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            {quiz.instructions && (
              <div className="bg-gray-700/20 border border-gray-500 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiLock className="text-yellow-400" />
                  Instructions
                </h2>
                <p className="text-gray-300 whitespace-pre-wrap">{quiz.instructions}</p>
              </div>
            )}
          </div>

          {/* Right Column - Leaderboard & Stats */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <div className="bg-gray-700/20 border border-gray-500 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-purple-400" />
                Top Performers
              </h2>
              
              {leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div key={entry._id} className="flex items-center justify-between p-3 bg-gray-700/10 border border-gray-500 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-yellow-700 text-white' :
                          'bg-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium">{entry.user?.name || 'Anonymous'}</span>
                      </div>
                      <span className="font-semibold">{entry.score} pts</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">No leaderboard data yet</p>
              )}
            </div>

            {/* User Stats */}
            <div className="bg-gray-700/20 border border-gray-500 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiAward className="text-orange-400" />
                Your Performance
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-700/10 border border-gray-500 rounded-lg">
                  <span className="text-gray-400">Attempts Used:</span>
                  <span className="font-semibold">{userAttempts}/{quiz.maxAttempts}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/10 border border-gray-500 rounded-lg">
                  <span className="text-gray-400">Best Score:</span>
                  <span className="font-semibold">
                    {latestAttempt ? `${latestAttempt.score}/${latestAttempt.totalScore || (quiz.questions?.length * (quiz.pointsPerQuestion || 1))}` : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/10 border border-gray-500 rounded-lg">
                  <span className="text-gray-400">Average Score:</span>
                  <span className="font-semibold">--</span>
                </div>
              </div>
            </div>

            {/* Anti-Cheating Measures */}
            <div className="bg-gray-700/20 border border-gray-500 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiLock className="text-red-400" />
                Anti-Cheating System
              </h2>
              
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <FiLock className="text-red-400" />
                  <span>Fullscreen mode required</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiLock className="text-red-400" />
                  <span>Tab switching detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiLock className="text-red-400" />
                  <span>Time tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiLock className="text-red-400" />
                  <span>Activity monitoring</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetailsPage;