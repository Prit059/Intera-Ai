// pages/user/UserAptitudeDashboard.jsx - COMPLETE FIXED VERSION

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Navbar from '../../components/layouts/Navbar';
import JoinTestModal from '../../components/JoinTestModal';
import {
  FiSearch, FiFilter, FiX, FiClock, FiCalendar,
  FiBarChart2, FiUsers, FiEye, FiPlay, FiAward,
  FiTrendingUp, FiBook, FiStar, FiLoader, FiCheckCircle,
  FiZap, FiCoffee, FiTarget, FiLogIn, FiActivity,
  FiChevronRight, FiGitBranch, FiCpu, FiDatabase,
  FiPieChart, FiCode, FiGlobe, FiLayers, FiPercent,
  FiTrendingDown, FiArrowUp, FiArrowDown, FiThumbsUp,
  FiTrendingUp as FiTrend, FiHelpCircle, FiBarChart,
  FiMaximize2, FiMinimize2, FiPlusCircle, FiRefreshCw,
} from 'react-icons/fi';
import 'react-calendar-heatmap/dist/styles.css';
import Modal from 'react-modal';

const UserAptitudeDashboard = () => {
  const [aptitudes, setAptitudes] = useState([]);
  const [filteredAptitudes, setFilteredAptitudes] = useState([]);
  const [fridayContests, setFridayContests] = useState([]);
  const [generalTests, setGeneralTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'joined', 'friday'
  const [joinedTests, setJoinedTests] = useState([]);
  const [joinedTestsLoading, setJoinedTestsLoading] = useState(false);
  const [joinSuccessMessage, setJoinSuccessMessage] = useState(null);
  const [showFullHeatmap, setShowFullHeatmap] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [userStats, setUserStats] = useState({
    totalAttempts: 0,
    completedTests: 0,
    averageScore: 0,
    totalQuestionsSolved: 0,
    streak: 0,
    rank: 0
  });
  const [heatmapData, setHeatmapData] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    difficulty: 'all',
    status: 'all'
  });
  const [selectedCategory, setSelectedCategory] = useState('all');

  const navigate = useNavigate();

  // All categories data (expanded)
  const allCategories = [
    { 
      name: 'Quantitative Aptitude', 
      icon: FiPercent, 
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      description: 'Numbers, percentages, profit & loss, time & work, averages, ratios, partnerships, mixtures, simple & compound interest, probability, permutations & combinations',
      subTopics: ['Percentages', 'Profit & Loss', 'Time & Work', 'Averages', 'Ratio & Proportion', 'Probability', 'Simple Interest', 'Compound Interest', 'Permutations', 'Combinations']
    },
    { 
      name: 'Logical Reasoning', 
      icon: FiGitBranch, 
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      description: 'Pattern recognition, logical puzzles, analytical thinking, syllogisms, blood relations, seating arrangements, coding-decoding, direction sense, data sufficiency',
      subTopics: ['Syllogisms', 'Blood Relations', 'Seating Arrangements', 'Coding-Decoding', 'Direction Sense', 'Data Sufficiency', 'Logical Puzzles', 'Pattern Recognition']
    },
    { 
      name: 'Verbal Reasoning', 
      icon: FiBook, 
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      description: 'Grammar, vocabulary, reading comprehension, synonyms, antonyms, sentence correction, para jumbles, critical reasoning',
      subTopics: ['Synonyms & Antonyms', 'Reading Comprehension', 'Sentence Correction', 'Para Jumbles', 'Critical Reasoning', 'Vocabulary', 'Grammar Rules', 'Idioms & Phrases']
    },
    { 
      name: 'Data Interpretation', 
      icon: FiPieChart, 
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      description: 'Graphs, charts, tables, data analysis, bar graphs, line charts, pie charts, caselets, data sufficiency',
      subTopics: ['Bar Graphs', 'Line Charts', 'Pie Charts', 'Tables', 'Caselets', 'Data Sufficiency', 'Mixed Graphs', 'Radar Charts']
    },
    { 
      name: 'Technical Aptitude', 
      icon: FiCode, 
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
      description: 'Algorithms, data structures, coding logic, output prediction, debugging, complexity analysis, programming concepts',
      subTopics: ['Algorithms', 'Data Structures', 'Output Prediction', 'Debugging', 'Complexity Analysis', 'Programming Concepts', 'Pseudocode', 'Flowcharts']
    },
    { 
      name: 'Spatial Aptitude', 
      icon: FiGlobe, 
      color: 'from-teal-500 to-green-500',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/30',
      description: 'Visual reasoning, spatial visualization, pattern folding, mirror images, paper cutting, figure matrix, embedded figures',
      subTopics: ['Mirror Images', 'Paper Cutting', 'Figure Matrix', 'Embedded Figures', 'Pattern Folding', 'Visual Reasoning', 'Spatial Visualization']
    },
    { 
      name: 'Mechanical Aptitude', 
      icon: FiCpu, 
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      description: 'Mechanical principles, physics concepts, tools, gears, pulleys, levers, fluid dynamics, basic engineering',
      subTopics: ['Gears & Pulleys', 'Levers', 'Fluid Dynamics', 'Mechanical Principles', 'Tools', 'Physics Concepts', 'Simple Machines']
    },
    { 
      name: 'Abstract Reasoning', 
      icon: FiTrendingUp, 
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30',
      description: 'Pattern recognition, sequence completion, analogy, classification, odd one out, matrix reasoning',
      subTopics: ['Pattern Recognition', 'Sequence Completion', 'Analogy', 'Classification', 'Odd One Out', 'Matrix Reasoning', 'Figure Series']
    }
  ];

  // Popular topics data
  const popularTopics = [
    { name: 'Percentages', count: 245, difficulty: 'Medium', icon: FiPercent, color: 'from-blue-500 to-cyan-500', askedIn: ['TCS', 'Infosys', 'Wipro'] },
    { name: 'Profit & Loss', count: 189, difficulty: 'Medium', icon: FiTrendingUp, color: 'from-green-500 to-emerald-500', askedIn: ['Accenture', 'Capgemini'] },
    { name: 'Time & Work', count: 167, difficulty: 'Hard', icon: FiClock, color: 'from-orange-500 to-red-500', askedIn: ['Amazon', 'Microsoft'] },
    { name: 'Averages', count: 156, difficulty: 'Easy', icon: FiBarChart, color: 'from-purple-500 to-pink-500', askedIn: ['TCS', 'IBM'] },
    { name: 'Ratio & Proportion', count: 143, difficulty: 'Medium', icon: FiPieChart, color: 'from-indigo-500 to-blue-500', askedIn: ['Deloitte', 'PwC'] },
    { name: 'Probability', count: 128, difficulty: 'Hard', icon: FiTrendingDown, color: 'from-red-500 to-orange-500', askedIn: ['Google', 'Facebook'] },
    { name: 'Simple Interest', count: 112, difficulty: 'Easy', icon: FiAward, color: 'from-teal-500 to-green-500', askedIn: ['Infosys', 'HCL'] }
  ];

  // Display only first 4 categories initially
  const displayedCategories = allCategories.slice(0, 4);

  useEffect(() => {
    fetchAptitudes();
    fetchJoinedTests();
    fetchUserStats();
    generateDynamicHeatmapData();
  }, []);

  const fetchAptitudes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/AdAptitude');
      
      let aptitudeData = [];
      if (Array.isArray(response.data)) {
        aptitudeData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        aptitudeData = response.data.data;
      }
      
      console.log('Raw aptitude data from API:', aptitudeData);
      
      // Separate Friday contests from general tests
      const friday = aptitudeData.filter(apt => apt.contestType === 'friday');
      const general = aptitudeData.filter(apt => apt.contestType !== 'friday');
      
      console.log('Friday contests found:', friday.length);
      console.log('General tests found:', general.length);
      
      setFridayContests(friday);
      setGeneralTests(general);
      setAptitudes(general); // For backward compatibility
      setFilteredAptitudes(general);
      
      // Calculate category counts
      const counts = {};
      allCategories.forEach(cat => {
        counts[cat.name] = general.filter(apt => apt.category === cat.name).length;
      });
      console.log('Category counts:', counts);
      setCategoryCounts(counts);
      
      extractFilterOptions(general);
    } catch (error) {
      console.error('Error fetching aptitude tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinedTests = async () => {
    try {
      setJoinedTestsLoading(true);
      const response = await axiosInstance.get('/api/student/aptitude/joined');
      setJoinedTests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching joined tests:', error);
    } finally {
      setJoinedTestsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await axiosInstance.get('/api/AdAptitude/attempts/user');
      const attempts = response.data.data || [];
      
      const completed = attempts.filter(a => a.status === 'completed');
      const totalScore = completed.reduce((sum, a) => sum + (a.percentage || 0), 0);
      const avgScore = completed.length > 0 ? totalScore / completed.length : 0;
      
      setUserStats({
        totalAttempts: attempts.length,
        completedTests: completed.length,
        averageScore: Math.round(avgScore),
        totalQuestionsSolved: completed.reduce((sum, a) => sum + (a.analysis?.totalCorrect || 0), 0),
        streak: calculateStreak(attempts),
        rank: Math.floor(Math.random() * 100) + 1
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const calculateStreak = (attempts) => {
    const dates = attempts.map(a => new Date(a.completedAt).toDateString());
    const uniqueDates = [...new Set(dates)].sort();
    let streak = 0;
    let lastDate = null;
    
    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      const currentDate = new Date(uniqueDates[i]);
      if (!lastDate) {
        streak = 1;
        lastDate = currentDate;
      } else {
        const diffDays = Math.floor((lastDate - currentDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          streak++;
          lastDate = currentDate;
        } else {
          break;
        }
      }
    }
    return streak;
  };

  const generateDynamicHeatmapData = async () => {
    try {
      const response = await axiosInstance.get('/api/AdAptitude/attempts/user');
      const attempts = response.data.data || [];
      
      const attemptsByDate = {};
      attempts.forEach(attempt => {
        if (attempt.completedAt) {
          const date = new Date(attempt.completedAt).toISOString().split('T')[0];
          attemptsByDate[date] = (attemptsByDate[date] || 0) + 1;
        }
      });
      
      const data = [];
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = attemptsByDate[dateStr] || 0;
        data.push({
          date: dateStr,
          count: count
        });
      }
      
      setHeatmapData(data);
    } catch (error) {
      console.error('Error generating heatmap data:', error);
      const mockData = [];
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const count = Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0;
        mockData.push({
          date: date.toISOString().split('T')[0],
          count: count
        });
      }
      setHeatmapData(mockData);
    }
  };

  const extractFilterOptions = (aptitudeData) => {
    const categorySet = new Set();
    aptitudeData.forEach(apt => {
      if (apt.category) categorySet.add(apt.category);
    });
    setCategories(['all', ...Array.from(categorySet).sort()]);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    if (category === 'all') {
      setFilteredAptitudes(generalTests);
    } else {
      setFilteredAptitudes(generalTests.filter(apt => apt.category === category));
    }
    setFilters(prev => ({ ...prev, category: category === 'all' ? 'all' : category }));
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    let filtered = selectedCategory === 'all' ? generalTests : generalTests.filter(apt => apt.category === selectedCategory);
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredAptitudes(filtered);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'Hard': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'Very Hard': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const handleStartAptitude = (aptitudeId) => {
    navigate(`/aptitudesdetails/${aptitudeId}`);
  };

  const handleStartJoinedTest = (testId) => {
    navigate(`/aptitudesdetails/${testId}`, {
      state: { testType: 'teacher' }
    });
  };

  const handleCategoryClick = (category) => {
    navigate(`/aptitude/category/${encodeURIComponent(category)}`, {
      state: { category, tests: generalTests.filter(apt => apt.category === category) }
    });
  };

  const handleJoinSuccess = (joinedTest) => {
    fetchJoinedTests();
    setActiveTab('joined');
    setJoinSuccessMessage(`Successfully joined "${joinedTest.title}"!`);
    
    setTimeout(() => {
      setJoinSuccessMessage(null);
    }, 5000);
  };

  const isTestJoined = (testId) => {
    return joinedTests.some(test => test._id === testId);
  };

  const getHeatmapColor = (count) => {
    if (count === 0) return 'bg-gray-800';
    if (count === 1) return 'bg-green-500/30';
    if (count === 2) return 'bg-green-500/50';
    if (count === 3) return 'bg-green-500/70';
    return 'bg-green-500';
  };

  const getContestStatus = (contest) => {
    if (!contest.schedule || !contest.schedule.startDate) {
      return { status: 'upcoming', color: 'blue', text: 'Upcoming' };
    }
    
    const now = new Date();
    const startDate = new Date(`${contest.schedule.startDate}T${contest.schedule.startTime}`);
    const endDate = new Date(`${contest.schedule.endDate}T${contest.schedule.endTime}`);
    
    if (now < startDate) {
      return { status: 'upcoming', color: 'blue', text: 'Upcoming' };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'active', color: 'green', text: 'Live Now!' };
    } else {
      return { status: 'completed', color: 'gray', text: 'Completed' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin text-4xl text-orange-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading aptitude platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      
      {/* Success Toast Message */}
      {joinSuccessMessage && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div className="bg-green-600/90 backdrop-blur-sm border border-green-400 rounded-lg p-4 shadow-xl flex items-center gap-3">
            <FiCheckCircle className="text-white text-xl" />
            <span className="text-white font-medium">{joinSuccessMessage}</span>
            <button 
              onClick={() => setJoinSuccessMessage(null)}
              className="ml-4 text-white/70 hover:text-white"
            >
              <FiX />
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-200 to-red-200 bg-clip-text text-transparent">
                Aptitude Mastery
              </h1>
              <p className="text-gray-400 mt-2">Sharpen your skills with curated practice tests</p>
            </div>
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-orange-700/10 border border-orange-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/20 transition-all whitespace-nowrap"
            >
              <FiLogIn /> Join with Code
            </button>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Total Tests</p>
              <p className="text-2xl font-bold text-white">{generalTests.length + fridayContests.length}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Joined Tests</p>
              <p className="text-2xl font-bold text-purple-400">{joinedTests.length}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-400">{userStats.completedTests}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Avg Score</p>
              <p className="text-2xl font-bold text-orange-400">{userStats.averageScore}%</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Solved Qs</p>
              <p className="text-2xl font-bold text-blue-400">{userStats.totalQuestionsSolved}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Streak</p>
              <p className="text-2xl font-bold text-orange-400">{userStats.streak} days</p>
            </div>
          </div>
        </div>

        {/* Tabs for All Tests, Friday Contests, and Joined Tests */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'general'
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Tests
            <span className="ml-2 text-xs bg-gray-700 px-2 py-0.5 rounded-full">
              {generalTests.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('friday')}
            className={`px-6 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'friday'
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FiAward className="inline mr-1 text-sm" />
            Friday Contests
            <span className="ml-2 text-xs bg-orange-600/30 px-2 py-0.5 rounded-full">
              {fridayContests.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('joined')}
            className={`px-6 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'joined'
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Joined Tests
            <span className="ml-2 text-xs bg-orange-600/30 px-2 py-0.5 rounded-full">
              {joinedTests.length}
            </span>
          </button>
        </div>

        {/* Friday Contests Tab */}
        {activeTab === 'friday' && (
          <div>
            {fridayContests.length === 0 ? (
              <div className="bg-gray-800/20 border border-gray-700 rounded-xl p-12 text-center">
                <FiAward className="text-6xl mx-auto text-gray-500 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">No Friday Contests Available</h3>
                <p className="text-gray-400 text-lg mb-6">
                  Check back on Fridays for special weekly contests!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Active Contest Banner */}
                {(() => {
                  const activeContest = fridayContests.find(c => {
                    const { status } = getContestStatus(c);
                    return status === 'active';
                  });
                  
                  if (activeContest) {
                    return (
                      <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border-2 border-orange-500 rounded-2xl p-6 mb-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center">
                              <FiAward className="text-3xl text-white" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white">Active Friday Contest!</h3>
                              <p className="text-orange-300">{activeContest.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <FiClock className="text-orange-400 text-sm" />
                                <span className="text-sm text-gray-300">
                                  Ends {new Date(`${activeContest.schedule.endDate}T${activeContest.schedule.endTime}`).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleStartAptitude(activeContest._id)}
                            className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                          >
                            Join Contest Now!
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                {/* All Friday Contests List */}
                <div className="grid grid-cols-1 gap-4">
                  {fridayContests.map((contest) => {
                    const { status, color, text } = getContestStatus(contest);
                    const canJoin = status === 'active' || status === 'upcoming';
                    
                    return (
                      <div
                        key={contest._id}
                        className="bg-gradient-to-r from-gray-900 to-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-orange-500/50 transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-xl font-semibold text-white">{contest.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${color}-500/20 text-${color}-400 border border-${color}-500/30`}>
                                {text}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                {contest.category}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-3">{contest.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center gap-1 text-gray-400">
                                <FiClock className="text-orange-400" />
                                <span>{contest.timeLimit} minutes</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-400">
                                <FiBarChart2 className="text-orange-400" />
                                <span>{contest.totalQuestions} questions</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-400">
                                <FiAward className="text-orange-400" />
                                <span>{contest.totalMarks} marks</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-400">
                                <FiCalendar className="text-orange-400" />
                                <span>
                                  {contest.schedule ? 
                                    `${new Date(contest.schedule.startDate).toLocaleDateString()} at ${contest.schedule.startTime}` : 
                                    'Date TBA'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleStartAptitude(contest._id)}
                            disabled={!canJoin}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                              canJoin
                                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-lg hover:shadow-orange-500/25'
                                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {status === 'active' ? <FiPlay /> : status === 'upcoming' ? <FiCalendar /> : <FiCheckCircle />}
                            {status === 'active' ? 'Join Now' : status === 'upcoming' ? 'Upcoming' : 'Completed'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* General Tests Tab - Your existing code */}
        {activeTab === 'general' && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Main Content */}
            <div className="flex-1 min-w-0">
              {/* Category Cards */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FiLayers className="text-orange-400" />
                    <h2 className="text-lg font-semibold">Explore by Category</h2>
                  </div>
                  <button
                    onClick={() => setShowAllCategories(true)}
                    className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    <FiPlusCircle className="text-sm" />
                    Explore More
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  {displayedCategories.map((category) => {
                    const Icon = category.icon;
                    const testCount = generalTests.filter(apt => apt.category === category.name).length;
                    return (
                      <button
                        key={category.name}
                        onClick={() => handleCategoryClick(category.name)}
                        className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700 rounded-xl p-5 text-left hover:border-orange-500/50 transition-all hover:scale-[1.00]"
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Icon className="w-full h-full" />
                        </div>
                        <Icon className={`text-2xl mb-3 bg-gradient-to-r ${category.color} bg-clip-text text-transparent`} />
                        <h3 className="font-semibold text-white text-xl mb-1">{category.name}</h3>
                        <p className="text-xs text-gray-400 mb-3 line-clamp-2">{category.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-orange-400 font-medium">{testCount} tests</span>
                          <FiChevronRight className="text-gray-500 group-hover:text-orange-400 transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tests by title..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                    value={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Tests List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <FiBook className="text-orange-400" />
                    Available Tests
                    <span className="text-sm text-gray-400 ml-2">({filteredAptitudes.length})</span>
                  </h2>
                </div>
                
                <div className="space-y-3">
                  {filteredAptitudes.length === 0 ? (
                    <div className="text-center py-12 bg-gray-900/30 rounded-xl">
                      <FiCoffee className="text-6xl mx-auto text-gray-600 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No tests found</h3>
                      <p className="text-gray-400">Try changing your category or search term</p>
                    </div>
                  ) : (
                    filteredAptitudes.slice(0, 8).map((aptitude) => (
                      <TestCard
                        key={aptitude._id}
                        aptitude={aptitude}
                        isJoined={isTestJoined(aptitude._id)}
                        onStart={() => handleStartAptitude(aptitude._id)}
                        getDifficultyColor={getDifficultyColor}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:w-80 flex-shrink-0 space-y-6">
              {/* Practice Activity Heatmap */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <FiActivity className="text-orange-400" />
                    Practice Activity
                  </h3>
                  <button
                    onClick={() => setShowFullHeatmap(true)}
                    className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
                  >
                    <FiMaximize2 className="text-xs" />
                    Expand
                  </button>
                </div>
                <div className="text-xs text-gray-500 mb-2">Last 30 days</div>
                <div className="grid grid-cols-7 gap-1">
                  {heatmapData.slice(0, 30).reverse().map((day, idx) => {
                    const date = new Date(day.date);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
                    return (
                      <div key={idx} className="text-center">
                        <div
                          className={`w-full aspect-square rounded-md ${getHeatmapColor(day.count)} transition-all hover:scale-110 cursor-pointer`}
                          title={`${day.date}: ${day.count} attempt${day.count !== 1 ? 's' : ''}`}
                        />
                        <span className="text-[10px] text-gray-600">{dayName}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-gray-800"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-500/30"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-500/50"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-500/70"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                  </div>
                  <span>More</span>
                </div>
              </div>

              {/* Recommended Tests */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700 rounded-xl p-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <FiStar className="text-yellow-400" />
                  Recommended for You
                </h3>
                <div className="space-y-3">
                  {generalTests.slice(0, 4).map((test) => (
                    <button
                      key={test._id}
                      onClick={() => handleStartAptitude(test._id)}
                      className="w-full text-left p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all group"
                    >
                      <p className="font-medium text-sm group-hover:text-orange-400 transition-colors line-clamp-1">
                        {test.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(test.difficulty)}`}>
                          {test.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">{test.totalQuestions} Qs</span>
                        <span className="text-xs text-gray-500">{test.timeLimit} min</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Most Asked Topics */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700 rounded-xl p-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <FiTrend className="text-green-400" />
                  Most Asked Topics
                </h3>
                <div className="space-y-2">
                  {popularTopics.slice(0, 7).map((topic) => {
                    const Icon = topic.icon;
                    return (
                      <div key={topic.name} className="flex items-center gap-3 p-2 hover:bg-gray-800/30 rounded-lg transition-colors group cursor-pointer">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${topic.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="text-white text-sm" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium group-hover:text-orange-400 transition-colors">
                            {topic.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${topic.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : topic.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                              {topic.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Joined Tests Section - Your existing code */}
        {activeTab === 'joined' && (
          <div>
            {joinedTestsLoading ? (
              <div className="flex justify-center py-12">
                <FiLoader className="animate-spin text-3xl text-orange-500" />
              </div>
            ) : joinedTests.length === 0 ? (
              <div className="bg-gray-800/20 border border-gray-700 rounded-xl p-12 text-center">
                <FiLogIn className="text-6xl mx-auto text-gray-500 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">No Joined Tests</h3>
                <p className="text-gray-400 text-lg mb-6">
                  Join a test using the code provided by your teacher
                </p>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
                >
                  <FiLogIn /> Join with Code
                </button>
              </div>
            ) : (
              <div>
                {joinSuccessMessage && (
                  <div className="mb-4 p-4 bg-green-600/20 border border-green-500 rounded-lg flex items-center gap-2">
                    <FiCheckCircle className="text-green-400" />
                    <span className="text-green-300">{joinSuccessMessage}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {joinedTests.map((test) => (
                    <JoinedTestCard
                      key={test._id}
                      test={test}
                      onStart={() => handleStartJoinedTest(test._id)}
                      getDifficultyColor={getDifficultyColor}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* All Categories Modal */}
      <Modal
        isOpen={showAllCategories}
        onRequestClose={() => setShowAllCategories(false)}
        className="max-w-6xl w-full mx-auto bg-gray-900 rounded-2xl p-6 outline-none max-h-[90vh] overflow-y-auto"
        overlayClassName="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      >
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-900 pb-4">
            <div>
              <h3 className="text-2xl text-white font-bold flex items-center gap-2">
                <FiLayers className="text-orange-400" />
                All Categories
              </h3>
              <p className="text-gray-400 text-sm mt-1">Explore all aptitude categories and master your skills</p>
            </div>
            <button
              onClick={() => setShowAllCategories(false)}
              className="p-2 text-white hover:text-gray-400 rounded-lg transition-colors"
            >
              <FiX className="text-xl" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allCategories.map((category) => {
              const Icon = category.icon;
              const testCount = generalTests.filter(apt => apt.category === category.name).length;
              return (
                <button
                  key={category.name}
                  onClick={() => {
                    setShowAllCategories(false);
                    handleCategoryClick(category.name);
                  }}
                  className="group relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900/50 border border-gray-700 rounded-xl p-5 text-left hover:border-orange-500/50 transition-all hover:scale-[1.02]"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Icon className="w-full h-full" />
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center mb-4`}>
                    <Icon className="text-white text-xl" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{category.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {category.subTopics.slice(0, 4).map(topic => (
                      <span key={topic} className="text-xs px-2 py-0.5 bg-gray-700/50 rounded-full text-gray-300">
                        {topic}
                      </span>
                    ))}
                    {category.subTopics.length > 4 && (
                      <span className="text-xs px-2 py-0.5 bg-gray-700/50 rounded-full text-gray-400">
                        +{category.subTopics.length - 4} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <div>
                      <span className="text-xs text-gray-500">Available Tests</span>
                      <p className="text-lg font-bold text-orange-400">{testCount}</p>
                    </div>
                    <FiChevronRight className="text-gray-500 group-hover:text-orange-400 transition-colors text-xl" />
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-700 text-center">
            <p className="text-sm text-gray-400">
              {generalTests.length} total tests available across all categories
            </p>
          </div>
        </div>
      </Modal>

      {/* Full Heatmap Modal */}
      <Modal
        isOpen={showFullHeatmap}
        onRequestClose={() => setShowFullHeatmap(false)}
        className="max-w-4xl w-full mx-auto bg-gray-900 rounded-2xl p-6 outline-none"
        overlayClassName="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      >
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FiActivity className="text-orange-400" />
              Practice Activity History
            </h3>
            <button
              onClick={() => setShowFullHeatmap(false)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiX />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="text-sm text-gray-400 mb-4">Activity Log (Last 30 Days)</div>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs text-gray-500 font-medium py-2">
                  {day}
                </div>
              ))}
              {heatmapData.slice(0, 30).reverse().map((day, idx) => {
                const date = new Date(day.date);
                return (
                  <div key={idx} className="text-center">
                    <div
                      className={`w-full aspect-square rounded-lg ${getHeatmapColor(day.count)} transition-all hover:scale-110 cursor-pointer`}
                      title={`${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}: ${day.count} attempt${day.count !== 1 ? 's' : ''}`}
                    />
                    <span className="text-[10px] text-gray-600 mt-1 block">
                      {date.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Activity Level:</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-gray-800"></div>
                <div className="w-4 h-4 rounded bg-green-500/30"></div>
                <div className="w-4 h-4 rounded bg-green-500/50"></div>
                <div className="w-4 h-4 rounded bg-green-500/70"></div>
                <div className="w-4 h-4 rounded bg-green-500"></div>
              </div>
              <span className="ml-2">Low → High</span>
            </div>
            <div className="text-sm text-gray-400">
              Total: {heatmapData.reduce((sum, day) => sum + day.count, 0)} attempts
            </div>
          </div>
        </div>
      </Modal>

      <JoinTestModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={handleJoinSuccess}
      />
    </div>
  );
};

// Test Card Component
const TestCard = ({ aptitude, isJoined, onStart, getDifficultyColor }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-gray-900/30 border border-gray-700 rounded-xl hover:border-orange-500/50 transition-all duration-300 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                {aptitude.title}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(aptitude.difficulty)}`}>
                {aptitude.difficulty}
              </span>
              {isJoined && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500 text-green-400">
                  <FiCheckCircle className="inline mr-1 text-xs" /> Joined
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 line-clamp-1">{aptitude.description || 'Practice test to enhance your skills'}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <FiBarChart2 className="text-orange-400 text-xs" />
                {aptitude.totalQuestions} Qs
              </span>
              <span className="flex items-center gap-1">
                <FiClock className="text-orange-400 text-xs" />
                {aptitude.timeLimit} min
              </span>
              <span className="flex items-center gap-1">
                <FiAward className="text-orange-400 text-xs" />
                {aptitude.totalMarks || aptitude.totalQuestions} pts
              </span>
            </div>
          </div>
          
          <button
            onClick={onStart}
            className={`px-5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              isHovered
                ? isJoined
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg shadow-green-500/25'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                : 'bg-gray-800 text-gray-300 border border-gray-700'
            }`}
          >
            <FiPlay className="text-sm" />
            {isJoined ? 'Continue' : 'Start'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Joined Test Card Component
const JoinedTestCard = ({ test, onStart, getDifficultyColor }) => {
  const now = new Date();
  const isScheduled = test.schedule?.isScheduled;
  const startDate = isScheduled ? new Date(test.schedule.startDate) : null;
  const endDate = isScheduled ? new Date(test.schedule.endDate) : null;
  
  const canStart = !isScheduled || (now >= startDate && now <= endDate);
  const status = !isScheduled ? 'available' :
                 now < startDate ? 'upcoming' :
                 now > endDate ? 'completed' : 'available';

  return (
    <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 group">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 bg-orange-600/30 border border-orange-500 rounded text-xs text-orange-300">
            <FiLogIn className="inline mr-1 text-xs" /> Joined via Code
          </span>
          {status === 'upcoming' && (
            <span className="px-2 py-1 bg-blue-600/30 border border-blue-500 rounded text-xs text-blue-300">
              Upcoming
            </span>
          )}
          {status === 'completed' && (
            <span className="px-2 py-1 bg-gray-600/30 border border-gray-500 rounded text-xs text-gray-300">
              Completed
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
          {test.title}
        </h3>
        
        <div className="space-y-2 text-sm text-gray-400 mb-4">
          <div className="flex justify-between">
            <span>Questions:</span>
            <span className="text-white">{test.totalQuestions}</span>
          </div>
          <div className="flex justify-between">
            <span>Duration:</span>
            <span className="text-white">{test.timeLimit} min</span>
          </div>
          <div className="flex justify-between">
            <span>Difficulty:</span>
            <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyColor(test.difficulty)}`}>
              {test.difficulty}
            </span>
          </div>
        </div>

        {isScheduled && startDate && endDate && (
          <div className="mb-4 p-2 bg-gray-900/50 rounded-lg text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Starts:</span>
              <span className="text-gray-300">{startDate.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Ends:</span>
              <span className="text-gray-300">{endDate.toLocaleString()}</span>
            </div>
          </div>
        )}

        <button
          onClick={onStart}
          disabled={!canStart}
          className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            canStart
              ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {status === 'upcoming' ? (
            <>
              <FiCalendar /> Starts Soon
            </>
          ) : status === 'completed' ? (
            <>
              <FiCheckCircle /> Completed
            </>
          ) : (
            <>
              <FiPlay /> Start Test
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UserAptitudeDashboard;