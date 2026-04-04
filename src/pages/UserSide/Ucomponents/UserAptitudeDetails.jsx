// pages/user/UserAptitudeDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';
import Navbar from '../../../components/layouts/Navbar';
import {
  FiClock, FiUsers, FiAward, FiBarChart2, 
  FiBook, FiCalendar, FiPlay, FiLock,
  FiEye, FiStar, FiTrendingUp, FiArrowLeft,
  FiCheckCircle, FiXCircle, FiZap, FiCoffee,
  FiAlertCircle, FiList, FiRefreshCw, FiLogIn,
  FiTarget, FiActivity, FiThumbsUp, FiShield,
  FiTerminal, FiSettings, FiCode, FiChevronRight,
  FiPercent, FiGitBranch, FiPieChart, FiTrendingDown
} from 'react-icons/fi';
import { API_PATHS } from '../../../utils/apiPaths';

const UserAptitudeDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [aptitude, setAptitude] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userAttempts, setUserAttempts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [latestAttempt, setLatestAttempt] = useState(null);
  const [error, setError] = useState(null);
  const [showAllAttempts, setShowAllAttempts] = useState(false);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [testType, setTestType] = useState('general');

  useEffect(() => {
    if (location.state?.testType === 'teacher') setTestType('teacher');
    fetchAptitudeDetails();
  }, [id]);

  const fetchAptitudeDetails = async () => {
    try {
      setError(null);
      let aptitudeData;
      if (location.state?.testType === 'teacher') {
        const response = await axiosInstance.get(`/api/student/aptitude/joined/${id}`);
        aptitudeData = response.data.data;
      } else {
        const response = await axiosInstance.get(`${API_PATHS.ADAPTITUDE.GET_ALL}/${id}`);
        aptitudeData = response.data.data || response.data;
      }
      setAptitude(aptitudeData);
      await Promise.all([fetchUserAttempts(), fetchLeaderboard()]);
    } catch (error) {
      setError('Failed to load test details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAttempts = async () => {
    try {
      setAttemptsLoading(true);
      let attemptsData = [];
      
      if (location.state?.testType === 'teacher') {
        try {
          const response = await axiosInstance.get(`/api/student/aptitude/attempts/${id}`);
          attemptsData = response.data.data || [];
        } catch (error) {
          console.log('No teacher attempts found');
        }
      } else {
        try {
          const response = await axiosInstance.get(`/api/AdAptitude/user/${id}`);
          attemptsData = response.data.data || [];
        } catch (specificError) {
          console.log('Specific endpoint failed, trying general endpoint...');
          const allAttemptsResponse = await axiosInstance.get(API_PATHS.ADAPTITUDE_ATTEMPTS.USER_ATTEMPTS);
          const allAttempts = allAttemptsResponse.data.data || allAttemptsResponse.data.attempts || [];
          attemptsData = allAttempts.filter(attempt => {
            const attemptAptitudeId = attempt.quizId?._id || attempt.quizId;
            return attemptAptitudeId === id;
          });
        }
      }
      
      const sortedAttempts = attemptsData.sort((a, b) => 
        new Date(b.completedAt || b.startedAt) - new Date(a.completedAt || a.startedAt)
      );
      
      setUserAttempts(sortedAttempts);
      
      if (sortedAttempts.length > 0) {
        const completedAttempts = sortedAttempts.filter(attempt => 
          attempt.status === 'completed' || attempt.status === 'submitted' || attempt.status === 'terminated'
        );
        if (completedAttempts.length > 0) setLatestAttempt(completedAttempts[0]);
      }
    } catch (error) {
      console.error('Error fetching user attempts:', error);
    } finally {
      setAttemptsLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      if (location.state?.testType !== 'teacher') {
        const response = await axiosInstance.get(API_PATHS.ADAPTITUDE_ATTEMPTS.LEADERBOARD.replace(':aptitudeId', id));
        setLeaderboard((response.data.data || []).slice(0, 5));
      }
    } catch (error) {
      setLeaderboard([]);
    }
  };

  const refreshAttempts = async () => {
    await fetchUserAttempts();
  };

  const canStartAptitude = () => {
    if (!aptitude) return false;
    const now = new Date();
    const schedule = aptitude.schedule || {};
    const startDate = new Date(schedule.startDate || aptitude.startDate);
    const endDate = new Date(schedule.endDate || aptitude.endDate);
    
    if (testType === 'teacher' && schedule.isScheduled && (now < startDate || now > endDate)) return false;
    if (aptitude.contestType === 'friday' && (now < startDate || now > endDate)) return false;
    
    const maxAttempts = aptitude.scoring?.maxAttempts || aptitude.maxAttempts;
    if (maxAttempts !== 'unlimited' && userAttempts.length >= parseInt(maxAttempts)) return false;
    
    return true;
  };

  const getAptitudeStatus = () => {
    if (!aptitude) return 'loading';
    const now = new Date();
    const schedule = aptitude.schedule || {};
    const startDate = new Date(schedule.startDate || aptitude.startDate);
    const endDate = new Date(schedule.endDate || aptitude.endDate);
    
    if (testType === 'teacher' && schedule.isScheduled) {
      if (now < startDate) return 'upcoming';
      if (now > endDate) return 'completed';
      return 'available';
    }
    if (aptitude.contestType === 'general') return 'available';
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'completed';
    return 'available';
  };

  const handleStartAptitude = () => {
    if (canStartAptitude()) {
      navigate(`/aptitude/${id}/attempt`, { state: { testType } });
    }
  };

  const handleViewDetailedAnalysis = (attempt) => {
    if (attempt?._id) {
      navigate(`/aptitude/${attempt._id}/results`, {
        state: { result: attempt, aptitudeData: aptitude, testType }
      });
    }
  };

  const handleViewAllAttempts = () => {
    setShowAllAttempts(!showAllAttempts);
  };

  const getAttemptStatus = (attempt) => {
    if (attempt.status === 'terminated') {
      return { text: 'Terminated', color: 'text-red-400', bgColor: 'bg-red-900/20' };
    }
    if (attempt.status === 'completed' || attempt.status === 'submitted') {
      const passingScore = aptitude?.scoring?.passingScore || 60;
      const passed = attempt.passed === true || (attempt.percentage >= passingScore);
      return { 
        text: passed ? 'Passed' : 'Failed', 
        color: passed ? 'text-green-400' : 'text-red-400',
        bgColor: passed ? 'bg-green-900/20' : 'bg-red-900/20'
      };
    }
    return { text: 'In Progress', color: 'text-yellow-400', bgColor: 'bg-yellow-900/20' };
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

  const formatScheduleTime = (dateString, timeString) => {
    if (!dateString) return 'Not scheduled';
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString()} ${timeString || ''}`.trim();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // DYNAMIC PREPARATION GUIDELINES BASED ON TOPIC
  const getDynamicGuidelines = () => {
    const title = aptitude?.title?.toLowerCase() || '';
    const tags = aptitude?.tags || [];
    const category = aptitude?.category || '';
    const totalQuestions = aptitude?.totalQuestions || 30;
    const timeLimit = aptitude?.timeLimit || 45;
    const avgTimePerQuestion = Math.floor(timeLimit / totalQuestions);

    const topicGuidelines = {
      'percentage': {
        icon: FiPercent,
        tips: [
          { title: 'PERCENTAGE CONVERSION', description: 'Master converting fractions to percentages. Remember: 1/4 = 25%, 1/3 ≈ 33.33%, 1/8 = 12.5%' },
          { title: 'BASE VALUE CONCEPT', description: 'Always identify the base value. "X% of Y" means (X/100) × Y. Percentage increase/decrease is always calculated on the original value.' },
          { title: 'SUCCESSIVE PERCENTAGES', description: 'For successive percentage changes, use: a + b + (ab/100). Not additive! Example: 10% + 10% = 21%, not 20%.' },
          { title: 'QUICK CALCULATIONS', description: `Allocate ${avgTimePerQuestion} seconds per question. Use fraction equivalents for faster calculations.` }
        ]
      },
      'profit and loss': {
        icon: FiTrendingUp,
        tips: [
          { title: 'CP AND SP FORMULA', description: 'Profit = SP - CP, Loss = CP - SP. Profit% = (Profit/CP) × 100, Loss% = (Loss/CP) × 100' },
          { title: 'MARKED PRICE CONCEPT', description: 'Discount is on Marked Price (MP). SP = MP - Discount. Discount% = (Discount/MP) × 100' },
          { title: 'TRICK: SELLING PRICE', description: 'If profit% = x%, then SP = CP × (100 + x)/100. If loss% = y%, then SP = CP × (100 - y)/100' },
          { title: 'FAKE WEIGHT PROBLEMS', description: `For profit due to false weight: Profit% = (Error/True Value) × 100. Allocate ${avgTimePerQuestion} seconds per question.` }
        ]
      },
      'time and work': {
        icon: FiClock,
        tips: [
          { title: 'LCM METHOD', description: 'Find LCM of individual times to get total work. If A takes 10 days, work done per day = 1/10' },
          { title: 'EFFICIENCY CONCEPT', description: 'Efficiency is inversely proportional to time. If A is twice as efficient as B, A takes half the time.' },
          { title: 'PIPES AND CISTERNS', description: 'Inlet pipe: +ve work, Outlet pipe: -ve work. Net work = Inlet rate - Outlet rate' },
          { title: 'ALTERNATE DAYS', description: `For alternate day work, calculate 2-day work first. Use LCM for complex problems. ${avgTimePerQuestion}s per question.` }
        ]
      }
    };

    let matchedGuidelines = null;
    for (const [topic, guidelines] of Object.entries(topicGuidelines)) {
      if (title.includes(topic)) {
        matchedGuidelines = guidelines;
        break;
      }
    }
    
    if (!matchedGuidelines && tags.length > 0) {
      for (const tag of tags) {
        const tagLower = tag.toLowerCase();
        for (const [topic, guidelines] of Object.entries(topicGuidelines)) {
          if (tagLower.includes(topic)) {
            matchedGuidelines = guidelines;
            break;
          }
        }
        if (matchedGuidelines) break;
      }
    }
    
    if (!matchedGuidelines) {
      return {
        icon: FiStar,
        tips: [
          { title: 'UNDERSTAND CONCEPTS', description: `Focus on ${tags.slice(0, 3).join(', ') || 'core concepts'} before attempting complex problems.` },
          { title: 'PRACTICE REGULARLY', description: 'Consistent practice improves speed and accuracy by 40% within 2 weeks.' },
          { title: 'ANALYZE MISTAKES', description: 'Review wrong answers to identify weak areas. Focus improvement on those topics.' },
          { title: 'TIME MANAGEMENT', description: `Allocate ${avgTimePerQuestion} seconds per question. Flag difficult ones for review.` }
        ]
      };
    }
    
    return matchedGuidelines;
  };

  const getUserStats = () => {
    const completedAttempts = userAttempts.filter(attempt => 
      attempt.status === 'completed' || attempt.status === 'submitted'
    );
    const validCompletedAttempts = completedAttempts.filter(attempt => attempt.status !== 'terminated');
    const bestScore = validCompletedAttempts.length > 0 
      ? Math.max(...validCompletedAttempts.map(a => a.score || 0)) 
      : 0;
    const avgScore = validCompletedAttempts.length > 0 
      ? Math.round(validCompletedAttempts.reduce((s, a) => s + (a.percentage || 0), 0) / validCompletedAttempts.length)
      : 0;
    const passingThreshold = aptitude?.scoring?.passingScore || 60;
    const passedAttempts = validCompletedAttempts.filter(a => 
      a.passed === true || (a.percentage >= passingThreshold)
    );
    const successRate = validCompletedAttempts.length > 0 
      ? Math.round((passedAttempts.length / validCompletedAttempts.length) * 100) 
      : 0;

    return {
      totalAttempts: userAttempts.length,
      completedAttempts: validCompletedAttempts.length,
      bestScore,
      avgScore,
      successRate,
      terminatedAttempts: userAttempts.filter(a => a.status === 'terminated').length
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-t-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !aptitude) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <FiAlertCircle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">{error || 'Test not found'}</p>
          <button onClick={() => navigate('/userAptitudeDashboard')} className="mt-4 text-orange-400 hover:text-orange-300">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const status = getAptitudeStatus();
  const scoring = aptitude.scoring || {};
  const schedule = aptitude.schedule || {};
  const totalMarks = aptitude.totalMarks || aptitude.totalQuestions || 0;
  const passingScore = scoring.passingScore || aptitude.passingScore || 60;
  const userStats = getUserStats();
  const guidelines = getDynamicGuidelines();
  const GuidelineIcon = guidelines.icon;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/aptitude')}
          className="flex items-center gap-2 text-gray-400 hover:text-orange-400 mb-5 transition-colors text-sm"
        >
          <FiArrowLeft className="text-sm" />
          Back to Dashboard
        </button>

        {/* Header Card */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800/50 border border-gray-700 rounded-xl p-5 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {testType === 'teacher' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600/20 border border-purple-500 text-purple-300">
                    <FiLogIn className="inline mr-1 text-xs" /> Joined via Code
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(status)}`}>
                  {getStatusText(status)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(aptitude.difficulty)}`}>
                  {aptitude.difficulty}
                </span>
                {aptitude.contestType === 'friday' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600/20 border border-purple-500 text-purple-300">
                    🎯 Friday Contest
                  </span>
                )}
              </div>
              
              <h1 className="text-2xl font-bold mb-2">{aptitude.title}</h1>
              <p className="text-gray-400 text-sm mb-3">{aptitude.description || 'Master the core principles with this comprehensive assessment.'}</p>
              
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <FiBook className="text-orange-400 text-xs" />
                  <span className="text-gray-400">{aptitude.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiBarChart2 className="text-orange-400 text-xs" />
                  <span>{aptitude.totalQuestions || 0} Qs</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiClock className="text-orange-400 text-xs" />
                  <span>{aptitude.timeLimit} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiAward className="text-orange-400 text-xs" />
                  <span>{totalMarks} pts</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleStartAptitude}
                disabled={!canStartAptitude()}
                className={`px-5 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
                  canStartAptitude() 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:shadow-orange-500/25'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FiZap className="text-sm" />
                {status === 'available' || status === 'ongoing' ? 'Start Test' : 
                 status === 'upcoming' ? 'Upcoming' : 'Completed'}
              </button>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-400">{userStats.totalAttempts}</div>
                <div className="text-xs text-gray-500">Attempts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-gray-500 text-xs mb-1">QUESTIONS</div>
            <div className="text-lg font-bold">{aptitude.totalQuestions || 0}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-gray-500 text-xs mb-1">TOTAL POINTS</div>
            <div className="text-lg font-bold">{totalMarks}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-gray-500 text-xs mb-1">DURATION</div>
            <div className="text-lg font-bold">{aptitude.timeLimit || 45} min</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-gray-500 text-xs mb-1">NEGATIVE</div>
            <div className="text-lg font-bold text-red-400">{scoring.negativeMarking ? `-${scoring.negativeMarks || 0.25}` : 'No'}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-gray-500 text-xs mb-1">MAX ATTEMPTS</div>
            <div className="text-lg font-bold">{scoring.maxAttempts === 'unlimited' ? '∞' : scoring.maxAttempts}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-gray-500 text-xs mb-1">PASSING</div>
            <div className="text-lg font-bold text-green-400">{passingScore}%</div>
          </div>
        </div>

        {/* PREVIOUS RESULTS SECTION - KEPT FROM ORIGINAL CODE */}
        {latestAttempt && (
          <div className="bg-gray-800/20  rounded-xl p-5 mb-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FiAward className="text-green-400" />
                Your Latest Performance
              </h2>
              <button
                onClick={refreshAttempts}
                disabled={attemptsLoading}
                className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition-colors disabled:opacity-50 text-sm"
              >
                <FiRefreshCw className={`${attemptsLoading ? 'animate-spin' : ''} text-sm`} />
                Refresh
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-black/30 p-3 rounded-lg border border-green-600/30">
                <div className="text-gray-400 text-xs">Score</div>
                <div className="text-lg font-bold text-green-400">
                  {latestAttempt.score || 0} / {latestAttempt.totalMarks || totalMarks}
                </div>
              </div>
              
              <div className="bg-black/30 p-3 rounded-lg border border-blue-600/30">
                <div className="text-gray-400 text-xs">Percentage</div>
                <div className="text-lg font-bold text-blue-400">
                  {latestAttempt.percentage || 0}%
                </div>
              </div>
              
              <div className="bg-black/30 p-3 rounded-lg border border-yellow-600/30">
                <div className="text-gray-400 text-xs">Time Spent</div>
                <div className="text-lg font-bold text-yellow-400">
                  {Math.floor((latestAttempt.timeSpent || 0) / 60)}m {(latestAttempt.timeSpent || 0) % 60}s
                </div>
              </div>
              
              <div className="bg-black/30 p-3 rounded-lg border border-purple-600/30">
                <div className="text-gray-400 text-xs">Status</div>
                <div className="text-lg font-bold">
                  {latestAttempt.status === 'terminated' ? (
                    <span className="text-red-400">Terminated</span>
                  ) : (
                    <span className={(latestAttempt.passed || (latestAttempt.percentage >= passingScore)) ? 'text-green-400' : 'text-red-400'}>
                      {(latestAttempt.passed || (latestAttempt.percentage >= passingScore)) ? 'Passed' : 'Failed'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {latestAttempt.status === 'terminated' && latestAttempt.violations && (
              <div className="mb-3 p-2 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <FiAlertCircle />
                  <span>Test terminated due to {latestAttempt.violations.length} security violation{latestAttempt.violations.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}
            
            <div className="flex gap-2 flex-wrap">
              <button
                className="bg-blue-600/20 border border-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-blue-600/30 transition-colors"
                onClick={() => handleViewDetailedAnalysis(latestAttempt)}
              >
                <FiEye className="text-sm" />
                View Detailed Analysis
              </button>
              
              {userAttempts.length > 1 && (
                <button
                  className="bg-purple-600/20 border border-purple-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-purple-600/30 transition-colors"
                  onClick={handleViewAllAttempts}
                >
                  <FiList className="text-sm" />
                  {showAllAttempts ? 'Hide All Attempts' : `View All Attempts (${userAttempts.length})`}
                </button>
              )}
            </div>

            {/* All Attempts Section */}
            {showAllAttempts && userAttempts.length > 0 && (
              <div className="mt-4 border-t border-gray-600 pt-4">
                <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
                  <FiList className="text-purple-400" />
                  All Your Attempts ({userAttempts.length})
                </h3>
                
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {userAttempts.map((attempt, index) => {
                    const statusInfo = getAttemptStatus(attempt);
                    return (
                      <div 
                        key={attempt._id} 
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          attempt._id === latestAttempt._id 
                            ? 'border-orange-500 bg-orange-500/10' 
                            : 'border-gray-700 bg-black/20 hover:border-orange-500/50'
                        }`}
                        onClick={() => handleViewDetailedAnalysis(attempt)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold">#{index + 1}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                              {statusInfo.text}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(attempt.completedAt || attempt.startedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">
                              {attempt.score || 0}/{attempt.totalMarks || totalMarks}
                            </div>
                            <div className="text-xs text-gray-500">
                              {attempt.percentage || 0}% • {Math.floor((attempt.timeSpent || 0) / 60)}m
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Attempts Message */}
        {userStats.totalAttempts === 0 && (
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 mb-6 border border-blue-700/30 text-center">
            <FiAward className="text-blue-400 text-3xl mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">No Attempts Yet</h3>
            <p className="text-gray-400 text-sm mb-4">Start your first attempt to see your performance analytics here.</p>
            <button
              onClick={handleStartAptitude}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-1.5 rounded-lg text-sm font-medium"
            >
              <FiZap className="inline mr-1 text-sm" />
              Start Your First Attempt
            </button>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* PREPARATION GUIDELINES - DYNAMIC */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden">
              <div className="border-b border-gray-700 px-4 py-2.5 bg-gray-800/30">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <GuidelineIcon className="text-orange-400" />
                  PREPARATION GUIDELINES
                </h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {guidelines.tips.map((tip, idx) => (
                    <div key={idx} className="bg-black/30 rounded-lg p-3 border border-gray-700 hover:border-orange-500/50 transition-colors">
                      <h3 className="text-xs font-semibold text-orange-400 mb-1">{tip.title}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">{tip.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Topics Covered */}
            {aptitude.tags && aptitude.tags.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden">
                <div className="border-b border-gray-700 px-4 py-2.5 bg-gray-800/30">
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    <FiStar className="text-orange-400" />
                    TOPICS COVERED
                  </h2>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {aptitude.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 bg-gray-800 rounded-full text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Session Details */}
            {/* <div className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden">
              <div className="border-b border-gray-700 px-4 py-2.5 bg-gray-800/30">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <FiTerminal className="text-orange-400" />
                  SESSION DETAILS
                </h2>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">SESSION KEY</span>
                  <span className="text-xs font-mono text-orange-400">{aptitude._id?.slice(-8).toUpperCase() || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">TIME LIMIT</span>
                  <span className="text-base font-bold">{aptitude.timeLimit || 45}:00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">STATUS</span>
                  <span className={`text-xs font-semibold ${
                    status === 'available' ? 'text-green-400' : 
                    status === 'upcoming' ? 'text-blue-400' : 'text-gray-400'
                  }`}>
                    {status === 'available' ? 'Ready' : status === 'upcoming' ? 'Scheduled' : 'Completed'}
                  </span>
                </div>
              </div>
            </div> */}

            {/* Security Protocol */}
            <div className="bg-gray-900/50 border border-orange-500/30 rounded-xl overflow-hidden">
              <div className="border-b border-orange-500/30 px-4 py-2.5 bg-orange-500/5">
                <h2 className="text-sm font-semibold flex items-center gap-2 text-orange-400">
                  <FiShield className="text-sm" />
                  ENVIRONMENT LOCK
                </h2>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start gap-2 text-xs">
                  <FiLock className="text-orange-400 text-xs mt-0.5" />
                  <span>Mandatory Fullscreen Mode</span>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <FiEye className="text-orange-400 text-xs mt-0.5" />
                  <span>Tab Switching Detection</span>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <FiClock className="text-orange-400 text-xs mt-0.5" />
                  <span>Auto-submit on Timeout</span>
                </div>
              </div>
            </div>

            {/* Your Statistics */}
            {userStats.totalAttempts > 0 && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden">
                <div className="border-b border-gray-700 px-4 py-2.5 bg-gray-800/30">
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    <FiTrendingUp className="text-orange-400" />
                    YOUR STATISTICS
                  </h2>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Total Attempts</span>
                    <span className="font-semibold">{userStats.totalAttempts}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Completed</span>
                    <span className="font-semibold text-green-400">{userStats.completedAttempts}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Best Score</span>
                    <span className="font-semibold text-orange-400">{userStats.bestScore}/{totalMarks}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Avg Score</span>
                    <span className="font-semibold text-blue-400">{userStats.avgScore}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Top Performers */}
            {leaderboard.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden">
                <div className="border-b border-gray-700 px-4 py-2.5 bg-gray-800/30">
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    <FiUsers className="text-orange-400" />
                    TOP PERFORMERS
                  </h2>
                </div>
                <div className="p-4 space-y-2">
                  {leaderboard.map((entry, idx) => (
                    <div key={entry._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs w-5 ${
                          idx === 0 ? 'text-yellow-400' : 
                          idx === 1 ? 'text-gray-400' : 
                          idx === 2 ? 'text-orange-400' : 'text-gray-600'
                        }`}>
                          #{idx + 1}
                        </span>
                        <span className="text-xs truncate max-w-[100px]">{entry.user?.name || 'Anonymous'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-orange-400">{entry.percentage || 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Information */}
        {schedule.isScheduled && (
          <div className="mt-5 bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden">
            <div className="border-b border-gray-700 px-4 py-2.5 bg-gray-800/30">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <FiCalendar className="text-orange-400" />
                SCHEDULE
              </h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-500">Start Date</div>
                  <div>{schedule.startDate ? new Date(schedule.startDate).toLocaleDateString() : 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Start Time</div>
                  <div>{schedule.startTime || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">End Date</div>
                  <div>{schedule.endDate ? new Date(schedule.endDate).toLocaleDateString() : 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">End Time</div>
                  <div>{schedule.endTime || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAptitudeDetails;