// pages/teacher/TeacherAptitudeDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Navbar from '../components/layouts/Navbar';
import {
  FiClock, FiAward, FiBarChart2, FiBook,
  FiCalendar, FiLock, FiEye, FiArrowLeft,
  FiCheckCircle, FiXCircle, FiZap, FiCoffee,
  FiAlertCircle, FiList, FiRefreshCw, FiLogIn,
  FiTrendingUp, FiUsers
} from 'react-icons/fi';

const TeacherAptitudeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [aptitude, setAptitude] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userAttempts, setUserAttempts] = useState([]);
  const [latestAttempt, setLatestAttempt] = useState(null);
  const [error, setError] = useState(null);
  const [showAllAttempts, setShowAllAttempts] = useState(false);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  useEffect(() => {
    fetchAptitudeDetails();
  }, [id]);

const fetchAptitudeDetails = async () => {
  try {
    console.log('Fetching teacher aptitude details...');
    setError(null);
    
    // Use the student endpoint instead
    const response = await axiosInstance.get(`/api/student/aptitude/test/${id}`);
    const aptitudeData = response.data.data;
    
    console.log('Teacher aptitude details fetched:', aptitudeData);
    setAptitude(aptitudeData);
    
    // The response already includes attempts
    if (aptitudeData.userAttempts) {
      setUserAttempts(aptitudeData.userAttempts);
      setLatestAttempt(aptitudeData.latestAttempt);
    }
    
  } catch (error) {
    console.error('Error fetching aptitude details:', error);
    setError('Failed to load test details. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const fetchUserAttempts = async () => {
    try {
      setAttemptsLoading(true);
      
      const response = await axiosInstance.get(`/api/student/aptitude/attempts/${id}`);
      const attemptsData = response.data.data || [];
      
      // Sort attempts by date (newest first)
      const sortedAttempts = attemptsData.sort((a, b) => 
        new Date(b.completedAt || b.startedAt) - new Date(a.completedAt || a.startedAt)
      );
      
      setUserAttempts(sortedAttempts);
      
      // Set the latest completed attempt
      if (sortedAttempts.length > 0) {
        const completedAttempts = sortedAttempts.filter(attempt => 
          attempt.status === 'completed'
        );
        
        if (completedAttempts.length > 0) {
          setLatestAttempt(completedAttempts[0]);
        } else {
          setLatestAttempt(null);
        }
      } else {
        setLatestAttempt(null);
      }
      
    } catch (error) {
      console.error('Error fetching user attempts:', error);
      setUserAttempts([]);
      setLatestAttempt(null);
    } finally {
      setAttemptsLoading(false);
    }
  };

  const refreshAttempts = async () => {
    await fetchUserAttempts();
  };

  const canStartTest = () => {
    if (!aptitude) return false;
    
    const now = new Date();
    const schedule = aptitude.schedule || {};
    
    if (schedule.isScheduled) {
      const startDate = new Date(schedule.startDate);
      const endDate = new Date(schedule.endDate);
      
      if (now < startDate) return false; // Upcoming
      if (now > endDate) return false; // Completed
    }
    
    return true;
  };

  const getTestStatus = () => {
    if (!aptitude) return 'loading';
    
    const now = new Date();
    const schedule = aptitude.schedule || {};
    
    if (!schedule.isScheduled) return 'available';
    
    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);
    
    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'ongoing';
    return 'completed';
  };

  const handleStartTest = () => {
    if (canStartTest()) {
      navigate(`/teacher/aptitude/${id}/attempt`);
    }
  };

  const handleViewResults = (attempt) => {
    if (!attempt || !attempt._id) return;
    
    navigate(`/teacher/aptitude/${attempt._id}/results`, {
      state: {
        result: attempt,
        aptitudeData: aptitude
      }
    });
  };

  const getAttemptStatus = (attempt) => {
    const passingScore = aptitude?.scoring?.passingScore || 60;
    const passed = attempt.passed === true || (attempt.percentage >= passingScore);
    
    return {
      text: passed ? 'Passed' : 'Failed',
      color: passed ? 'text-green-400' : 'text-red-400',
      bgColor: passed ? 'bg-green-900/20' : 'bg-red-900/20'
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-700/20 border border-green-500 text-green-100';
      case 'ongoing': return 'bg-green-700/20 border border-green-500 text-green-100';
      case 'upcoming': return 'bg-blue-700/20 border border-blue-500 text-blue-100';
      case 'completed': return 'bg-gray-700/20 border border-gray-500 text-gray-100';
      default: return 'bg-gray-700/20 border border-gray-500 text-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'ongoing': return 'Live Now';
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
      default: return 'Loading';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-700/20 border border-green-500 text-green-100';
      case 'Medium': return 'bg-yellow-700/20 border border-yellow-500 text-yellow-100';
      case 'Hard': return 'bg-orange-700/20 border border-orange-500 text-orange-100';
      case 'Very Hard': return 'bg-red-700/20 border border-red-500 text-red-100';
      default: return 'bg-gray-700/20 border border-gray-500 text-gray-100';
    }
  };

  const formatScheduleTime = (dateString) => {
    if (!dateString) return 'Not scheduled';
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !aptitude) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <FiAlertCircle className="text-red-400 text-4xl mx-auto mb-4" />
          <h2 className="text-2xl text-white mb-4">Test not found</h2>
          <button
            onClick={() => navigate('/useraptitudedashboard')}
            className="bg-blue-600 px-6 py-2 rounded-lg text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const status = getTestStatus();
  const scoring = aptitude.scoring || {};
  const schedule = aptitude.schedule || {};
  const negativeMarking = scoring.negativeMarking;
  const passingScore = scoring.passingScore || 60;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/useraptitudedashboard')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors"
        >
          <FiArrowLeft />
          Back to Dashboard
        </button>

        {/* Test Header */}
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-8 mb-8 border border-purple-700">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="px-3 py-1 rounded-full text-sm bg-purple-700/20 border border-purple-500 text-purple-100">
                  <FiLogIn className="inline mr-1" /> Teacher Test
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(status)}`}>
                  {getStatusText(status)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(aptitude.difficulty)}`}>
                  {aptitude.difficulty}
                </span>
              </div>
              
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                {aptitude.title}
              </h1>
              
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                {aptitude.description}
              </p>
              
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <FiBook className="text-blue-400" />
                  <span className="text-gray-400">Category:</span>
                  <span className="font-semibold">{aptitude.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiBarChart2 className="text-green-400" />
                  <span className="text-gray-400">Questions:</span>
                  <span className="font-semibold">{aptitude.totalQuestions || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="text-purple-400" />
                  <span className="text-gray-400">Duration:</span>
                  <span className="font-semibold">{aptitude.timeLimit} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiAward className="text-yellow-400" />
                  <span className="text-gray-400">Marks:</span>
                  <span className="font-semibold">{aptitude.totalMarks || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 items-center">
              <button
                onClick={handleStartTest}
                disabled={!canStartTest()}
                className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all transform hover:scale-105 ${
                  canStartTest()
                    ? 'bg-purple-600/20 border border-purple-500 hover:bg-purple-600/40 cursor-pointer shadow-lg hover:shadow-purple-500/25'
                    : 'bg-gray-700/50 border border-gray-600 cursor-not-allowed'
                }`}
              >
                {status === 'available' || status === 'ongoing' ? (
                  <>
                    <FiZap className="text-xl" />
                    Start Test
                  </>
                ) : status === 'upcoming' ? (
                  <>
                    <FiCalendar className="text-xl" />
                    Upcoming
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="text-xl" />
                    Completed
                  </>
                )}
              </button>
              
              {latestAttempt && (
                <button
                  onClick={() => handleViewResults(latestAttempt)}
                  className="px-6 py-3 bg-blue-600/20 border border-blue-500 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-600/30 transition-all w-full"
                >
                  <FiEye className="text-lg" />
                  View Latest Results
                </button>
              )}
              
              {!canStartTest() && status === 'upcoming' && schedule.startDate && (
                <div className="text-sm text-gray-400 text-center">
                  <p>Starts on {formatScheduleTime(schedule.startDate)}</p>
                </div>
              )}
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {userAttempts.length}
                </div>
                <div className="text-sm text-gray-400">
                  Attempt{userAttempts.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Information */}
        {schedule.isScheduled && (
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiCalendar className="text-purple-400" /> Test Schedule
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-black/30 rounded-lg">
                <p className="text-gray-400 text-sm">Start Time</p>
                <p className="text-lg font-semibold text-green-400">
                  {formatScheduleTime(schedule.startDate)}
                </p>
              </div>
              <div className="p-4 bg-black/30 rounded-lg">
                <p className="text-gray-400 text-sm">End Time</p>
                <p className="text-lg font-semibold text-red-400">
                  {formatScheduleTime(schedule.endDate)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Test Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            <h3 className="font-semibold mb-4">Test Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Questions</span>
                <span className="font-semibold">{aptitude.totalQuestions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Marks</span>
                <span className="font-semibold">{aptitude.totalMarks || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Passing Score</span>
                <span className="font-semibold">{passingScore}%</span>
              </div>
              {negativeMarking && (
                <div className="flex justify-between text-red-400">
                  <span>Negative Marking</span>
                  <span>Yes</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            <h3 className="font-semibold mb-4">Your Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Attempts</span>
                <span className="font-semibold">{userAttempts.length}</span>
              </div>
              {latestAttempt && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Latest Score</span>
                    <span className="font-semibold text-green-400">
                      {latestAttempt.score || 0}/{aptitude.totalMarks}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Percentage</span>
                    <span className="font-semibold text-blue-400">
                      {latestAttempt.percentage || 0}%
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            <h3 className="font-semibold mb-4">Security</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FiLock className="text-red-400" />
                <span>Fullscreen required</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FiLock className="text-red-400" />
                <span>Tab switching detected</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FiLock className="text-red-400" />
                <span>Time tracking enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attempts History */}
        {userAttempts.length > 0 && (
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold flex items-center gap-3">
                <FiList className="text-purple-400" />
                Your Attempt History
              </h2>
              <button
                onClick={refreshAttempts}
                disabled={attemptsLoading}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
              >
                <FiRefreshCw className={attemptsLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            <div className="space-y-3">
              {userAttempts.slice(0, showAllAttempts ? undefined : 5).map((attempt, index) => {
                const statusInfo = getAttemptStatus(attempt);
                return (
                  <div
                    key={attempt._id}
                    className="p-4 bg-black/30 rounded-lg border border-gray-600 hover:border-purple-500 transition-colors cursor-pointer"
                    onClick={() => handleViewResults(attempt)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-lg font-semibold">#{index + 1}</span>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded text-xs ${statusInfo.bgColor} ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(attempt.completedAt || attempt.startedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {attempt.score || 0}/{aptitude.totalMarks}
                        </div>
                        <div className="text-sm text-gray-400">
                          {attempt.percentage || 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {userAttempts.length > 5 && (
              <button
                onClick={() => setShowAllAttempts(!showAllAttempts)}
                className="mt-4 text-purple-400 hover:text-purple-300 text-sm"
              >
                {showAllAttempts ? 'Show Less' : `View All ${userAttempts.length} Attempts`}
              </button>
            )}
          </div>
        )}

        {/* No Attempts Message */}
        {userAttempts.length === 0 && (
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-8 border border-purple-700/30 text-center">
            <FiCoffee className="text-4xl mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">No Attempts Yet</h3>
            <p className="text-gray-300 mb-6">You haven't attempted this test yet.</p>
            {canStartTest() && (
              <button
                onClick={handleStartTest}
                className="bg-purple-600/20 border border-purple-500 hover:bg-purple-600/40 px-8 py-3 rounded-lg font-semibold"
              >
                <FiZap className="inline mr-2" />
                Start Your First Attempt
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAptitudeDetails;