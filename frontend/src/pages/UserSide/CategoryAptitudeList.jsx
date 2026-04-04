// pages/user/UserCategoryDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Navbar from '../../components/layouts/Navbar';
import {
  FiArrowLeft, FiClock, FiBarChart2, FiAward, FiBook,
  FiTrendingUp, FiUsers, FiPlay, FiStar, FiZap, FiFilter,
  FiSearch, FiChevronRight, FiCheckCircle, FiXCircle,
  FiCalendar, FiTarget, FiTrendingDown, FiPieChart,
  FiPercent, FiGitBranch, FiCode, FiGlobe, FiCpu,
  FiActivity, FiThumbsUp, FiAward as FiAwardIcon
} from 'react-icons/fi';

const CategoryAptitudeList = () => { 
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [userProgress, setUserProgress] = useState({
    totalAttempts: 0,
    completedTests: 0,
    totalQuestions: 0,
    solvedQuestions: 0,
    averageScore: 0,
    bestScore: 0,
    timeSpent: 0,
    categoryRank: 0
  });
  const [attemptHistory, setAttemptHistory] = useState([]);

  const category = decodeURIComponent(categoryName);
  
  // Category configurations with icons and colors
  const categoryConfig = {
    'Quantitative Aptitude': {
      icon: FiPercent,
      gradient: 'from-blue-500/20 to-cyan-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      bgGradient: 'bg-gradient-to-br from-blue-500/5 to-cyan-500/5',
      topics: ['Percentages', 'Profit & Loss', 'Time & Work', 'Averages', 'Ratio & Proportion', 'Probability', 'Simple Interest', 'Compound Interest', 'Permutations', 'Combinations'],
      difficultyDistribution: { Easy: 30, Medium: 45, Hard: 25 }
    },
    'Logical Reasoning': {
      icon: FiGitBranch,
      gradient: 'from-purple-500/20 to-pink-500/10',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
      bgGradient: 'bg-gradient-to-br from-purple-500/5 to-pink-500/5',
      topics: ['Syllogisms', 'Blood Relations', 'Seating Arrangements', 'Coding-Decoding', 'Direction Sense', 'Data Sufficiency', 'Logical Puzzles', 'Pattern Recognition'],
      difficultyDistribution: { Easy: 25, Medium: 50, Hard: 25 }
    },
    'Verbal Aptitude': {
      icon: FiBook,
      gradient: 'from-green-500/20 to-emerald-500/10',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-400',
      bgGradient: 'bg-gradient-to-br from-green-500/5 to-emerald-500/5',
      topics: ['Synonyms & Antonyms', 'Reading Comprehension', 'Sentence Correction', 'Para Jumbles', 'Critical Reasoning', 'Vocabulary', 'Grammar Rules', 'Idioms & Phrases'],
      difficultyDistribution: { Easy: 35, Medium: 40, Hard: 25 }
    },
    'Data Interpretation': {
      icon: FiPieChart,
      gradient: 'from-orange-500/20 to-red-500/10',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
      bgGradient: 'bg-gradient-to-br from-orange-500/5 to-red-500/5',
      topics: ['Bar Graphs', 'Line Charts', 'Pie Charts', 'Tables', 'Caselets', 'Data Sufficiency', 'Mixed Graphs', 'Radar Charts'],
      difficultyDistribution: { Easy: 20, Medium: 50, Hard: 30 }
    },
    'Programming Aptitude': {
      icon: FiCode,
      gradient: 'from-indigo-500/20 to-blue-500/10',
      borderColor: 'border-indigo-500/30',
      textColor: 'text-indigo-400',
      bgGradient: 'bg-gradient-to-br from-indigo-500/5 to-blue-500/5',
      topics: ['Algorithms', 'Data Structures', 'Output Prediction', 'Debugging', 'Complexity Analysis', 'Programming Concepts', 'Pseudocode', 'Flowcharts'],
      difficultyDistribution: { Easy: 25, Medium: 45, Hard: 30 }
    }
  };

  const config = categoryConfig[category] || {
    icon: FiBook,
    gradient: 'from-gray-500/20 to-gray-500/10',
    borderColor: 'border-gray-500/30',
    textColor: 'text-gray-400',
    bgGradient: 'bg-gradient-to-br from-gray-500/5 to-gray-500/5',
    topics: ['General Topics'],
    difficultyDistribution: { Easy: 33, Medium: 34, Hard: 33 }
  };

  const Icon = config.icon;

  useEffect(() => {
    const loadData = async () => {
      if (location.state?.tests) {
        setTests(location.state.tests);
        setFilteredTests(location.state.tests);
        await fetchUserProgressForCategory(location.state.tests);
        setLoading(false);
      } else {
        await fetchTestsByCategory();
      }
    };

    setLoading(true);
    loadData();
  }, [category]);

  const fetchTestsByCategory = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/AdAptitude');
      let aptitudeData = [];
      if (Array.isArray(response.data)) {
        aptitudeData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        aptitudeData = response.data.data;
      }
      const categoryTests = aptitudeData.filter(apt => apt.category === category && apt.isActive);
      setTests(categoryTests);
      setFilteredTests(categoryTests);
      fetchUserProgressForCategory(categoryTests);
    } catch (error) {
      console.error('Error fetching category tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgressForCategory = async (categoryTests) => {
    try {
      const response = await axiosInstance.get('/api/AdAptitude/attempts/user');
      const allAttempts = response.data.data || [];
      
      // Filter attempts for tests in this category
      const testIds = categoryTests.map(t => t._id);
      const categoryAttempts = allAttempts.filter(attempt => 
        testIds.includes(attempt.quizId?._id || attempt.quizId)
      );
      
      const completedAttempts = categoryAttempts.filter(a => a.status === 'completed');
      const totalQuestions = categoryTests.reduce((sum, t) => sum + (t.totalQuestions || 0), 0);
      const solvedQuestions = completedAttempts.reduce((sum, a) => sum + (a.analysis?.totalCorrect || 0), 0);
      const totalScore = completedAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0);
      const avgScore = completedAttempts.length > 0 ? totalScore / completedAttempts.length : 0;
      const bestScore = Math.max(...completedAttempts.map(a => a.percentage || 0), 0);
      const timeSpent = completedAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
      
      setUserProgress({
        totalAttempts: categoryAttempts.length,
        completedTests: completedAttempts.length,
        totalQuestions,
        solvedQuestions,
        averageScore: Math.round(avgScore),
        bestScore: Math.round(bestScore),
        timeSpent,
        categoryRank: Math.floor(Math.random() * 50) + 1
      });
      
      // Get attempt history
      const sortedAttempts = completedAttempts.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
      setAttemptHistory(sortedAttempts.slice(0, 5));
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  useEffect(() => {
    let filtered = [...tests];
    
    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(test => test.difficulty === difficultyFilter);
    }
    
    if (sortBy === 'easy-first') {
      const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3, 'Very Hard': 4 };
      filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    } else if (sortBy === 'hard-first') {
      const difficultyOrder = { 'Easy': 4, 'Medium': 3, 'Hard': 2, 'Very Hard': 1 };
      filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    } else if (sortBy === 'questions-asc') {
      filtered.sort((a, b) => (a.totalQuestions || 0) - (b.totalQuestions || 0));
    } else if (sortBy === 'questions-desc') {
      filtered.sort((a, b) => (b.totalQuestions || 0) - (a.totalQuestions || 0));
    } else if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    setFilteredTests(filtered);

  }, [searchTerm, difficultyFilter, sortBy, tests]);

  const getDifficultyBadge = (difficulty) => {
    const styles = {
      'Easy': 'bg-green-500/10 text-green-400 border-green-500/30',
      'Medium': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      'Hard': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      'Very Hard': 'bg-red-500/10 text-red-400 border-red-500/30'
    };
    return styles[difficulty] || styles['Medium'];
  };

  const handleStartTest = (testId) => {
    navigate(`/aptitudesdetails/${testId}`);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  const completionPercentage = userProgress.totalQuestions > 0 
    ? Math.round((userProgress.solvedQuestions / userProgress.totalQuestions) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/userAptitudeDashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors mb-6"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Topic Details & Progress */}
          <div className="lg:w-80 flex-shrink-0 space-y-5">
            {/* Category Header Card */}
            <div className={`bg-gradient-to-br ${config.gradient} border ${config.borderColor} rounded-xl p-5 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <Icon className="w-full h-full" />
              </div>
              <div className="relative">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.gradient} border ${config.borderColor} flex items-center justify-center mb-4`}>
                  <Icon className={`text-2xl ${config.textColor}`} />
                </div>
                <h1 className="text-xl font-bold mb-2">{category}</h1>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Master {category} concepts with comprehensive practice tests and detailed analytics
                </p>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-gray-900/30 border border-gray-700 rounded-xl p-5">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                <FiTarget className="text-orange-400" />
                Progress Overview
              </h3>
              
              {/* Overall Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Overall Completion</span>
                  <span className={`font-semibold ${config.textColor}`}>{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-400">Tests Completed</p>
                  <p className="text-lg font-bold text-white">{userProgress.completedTests}/{tests.length}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-400">Questions Solved</p>
                  <p className="text-lg font-bold text-white">{userProgress.solvedQuestions}/{userProgress.totalQuestions}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-400">Avg. Score</p>
                  <p className={`text-lg font-bold ${userProgress.averageScore >= 70 ? 'text-green-400' : userProgress.averageScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {userProgress.averageScore}%
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-400">Best Score</p>
                  <p className="text-lg font-bold text-orange-400">{userProgress.bestScore}%</p>
                </div>
              </div>

              {/* Time Spent */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FiClock className="text-orange-400" />
                  <span>Total Time Spent</span>
                </div>
                <span className="font-semibold">{formatTime(userProgress.timeSpent)}</span>
              </div>
            </div>

            {/* Topics Covered */}
            <div className="bg-gray-900/30 border border-gray-700 rounded-xl p-5">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <FiBook className="text-orange-400" />
                Topics Covered
              </h3>
              <div className="flex flex-wrap gap-2">
                {config.topics.map(topic => (
                  <span key={topic} className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-300 hover:bg-gray-700 transition-colors cursor-pointer">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Difficulty Distribution */}
            <div className="bg-gray-900/30 border border-gray-700 rounded-xl p-5">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <FiBarChart2 className="text-orange-400" />
                Difficulty Distribution
              </h3>
              <div className="space-y-2">
                {Object.entries(config.difficultyDistribution).map(([level, percentage]) => (
                  <div key={level}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={level === 'Easy' ? 'text-green-400' : level === 'Medium' ? 'text-yellow-400' : 'text-red-400'}>
                        {level}
                      </span>
                      <span className="text-gray-400">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          level === 'Easy' ? 'bg-green-500' : level === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Attempts */}
            {attemptHistory.length > 0 && (
              <div className="bg-gray-900/30 border border-gray-700 rounded-xl p-5">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <FiActivity className="text-orange-400" />
                  Recent Attempts
                </h3>
                <div className="space-y-2">
                  {attemptHistory.map((attempt, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        {attempt.passed ? (
                          <FiCheckCircle className="text-green-400 text-sm" />
                        ) : (
                          <FiXCircle className="text-red-400 text-sm" />
                        )}
                        <div>
                          <p className="text-xs font-medium line-clamp-1">{attempt.quizId?.title || 'Test'}</p>
                          <p className="text-[10px] text-gray-500">
                            {new Date(attempt.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold ${attempt.passed ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.round(attempt.percentage)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ranking */}
          </div>

          {/* Right Column - Tests List */}
          <div className="flex-1 min-w-0">
            {/* Header with Search and Filter */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tests by title..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    className="px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                  >
                    <option value="all">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Very Hard">Very Hard</option>
                  </select>
                  <select
                    className="px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="recent">Most Recent</option>
                    <option value="easy-first">Difficulty: Easy First</option>
                    <option value="hard-first">Difficulty: Hard First</option>
                    <option value="questions-asc">Questions: Low to High</option>
                    <option value="questions-desc">Questions: High to Low</option>
                  </select>
                </div>
              </div>
              
              {/* Results Count */}
              <div className="flex items-center justify-between mt-3">
                <p className="text-sm text-gray-400">
                  Showing {filteredTests.length} of {tests.length} tests
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-xs text-orange-400 hover:text-orange-300"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>

            {/* Tests Grid/List */}
            {filteredTests.length === 0 ? (
              <div className="text-center py-12 bg-gray-900/30 rounded-xl">
                <FiBook className="text-6xl mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tests found</h3>
                <p className="text-gray-400">Try adjusting your filters or search term</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTests.map((test, index) => (
                  <TestCard
                    key={test._id}
                    test={test}
                    index={index}
                    onStart={() => handleStartTest(test._id)}
                    getDifficultyBadge={getDifficultyBadge}
                    config={config}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Test Card Component
const TestCard = ({ test, index, onStart, getDifficultyBadge, config }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return <FiThumbsUp className="text-green-400 text-xs" />;
      case 'Medium': return <FiBarChart2 className="text-yellow-400 text-xs" />;
      case 'Hard': return <FiTrendingUp className="text-orange-400 text-xs" />;
      default: return <FiZap className="text-red-400 text-xs" />;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-gray-900/30 border border-gray-700 rounded-xl hover:border-orange-500/50 transition-all duration-300 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`w-6 h-6 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center text-xs font-semibold ${config.textColor}`}>
                {index + 1}
              </span>
              <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                {test.title}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyBadge(test.difficulty)} flex items-center gap-1`}>
                {getDifficultyIcon(test.difficulty)}
                {test.difficulty}
              </span>
            </div>
            <p className="text-sm text-gray-400 line-clamp-2 mb-3">
              {test.description || 'Practice test to enhance your skills in this category. Includes comprehensive questions with detailed explanations.'}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <FiBarChart2 className="text-orange-400 text-xs" />
                {test.totalQuestions} Questions
              </span>
              <span className="flex items-center gap-1">
                <FiClock className="text-orange-400 text-xs" />
                {test.timeLimit} Minutes
              </span>
              <span className="flex items-center gap-1">
                <FiAward className="text-orange-400 text-xs" />
                {test.totalMarks || test.totalQuestions} Points
              </span>
              {test.scoring?.passingScore && (
                <span className="flex items-center gap-1">
                  <FiTarget className="text-orange-400 text-xs" />
                  Pass: {test.scoring.passingScore}%
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={onStart}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              isHovered
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                : 'bg-gray-800 text-gray-300 border border-gray-700'
            }`}
          >
            <FiPlay className="text-sm" />
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryAptitudeList;