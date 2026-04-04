import React, { useState, useEffect } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import Navbar from '../../components/layouts/Navbar';
import {
  FiSearch, FiFilter, FiX, FiClock, FiCalendar,
  FiBarChart2, FiUsers, FiEye, FiPlay, FiAward,
  FiTrendingUp, FiBook, FiStar, FiLoader, FiCheckCircle
} from 'react-icons/fi';


/*
  userquizdashboard in start quiz in click which route i dont know
so you give app.jsx in which i right all file you give please
please give also backend contrrole, route, server, api_path
*/

const UserQuizDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    topic: 'all',
    status: 'all',
    frequency: 'all',
    difficulty: 'all'
  });

  const navigate = useNavigate();

  // Fetch all quizzes
  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [quizzes, filters]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.ADQUIZ.GET_ALL);
      
      // Handle different API response structures
      let quizzesData = [];
      if (Array.isArray(response.data)) {
        quizzesData = response.data;
      } else if (response.data && Array.isArray(response.data.quizzes)) {
        quizzesData = response.data.quizzes;
      } else if (response.data && Array.isArray(response.data.data)) {
        quizzesData = response.data.data;
      }
      
      setQuizzes(quizzesData);
      extractFilterOptions(quizzesData);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique values for filter options
  const extractFilterOptions = (quizzesData) => {
    const categorySet = new Set();
    const topicSet = new Set();
    
    quizzesData.forEach(quiz => {
      if (quiz.category) categorySet.add(quiz.category);
      if (quiz.topic) topicSet.add(quiz.topic);
    });
    
    setCategories(['all', ...Array.from(categorySet).sort()]);
    setTopics(['all', ...Array.from(topicSet).sort()]);
  };

  // Apply filters to quizzes
  const applyFilters = () => {
    let filtered = [...quizzes];

    // Search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(term) ||
        quiz.description?.toLowerCase().includes(term) ||
        quiz.category?.toLowerCase().includes(term) ||
        quiz.topic?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(quiz => quiz.category === filters.category);
    }

    // Topic filter
    if (filters.topic !== 'all') {
      filtered = filtered.filter(quiz => quiz.topic === filters.topic);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(quiz => {
        const now = new Date();
        const startDate = new Date(quiz.startDate);
        const endDate = new Date(quiz.endDate);
        
        if (filters.status === 'ongoing') return now >= startDate && now <= endDate;
        if (filters.status === 'upcoming') return now < startDate;
        if (filters.status === 'completed') return now > endDate;
        return true;
      });
    }

    // Frequency filter
    if (filters.frequency !== 'all') {
      filtered = filtered.filter(quiz => quiz.frequency === filters.frequency);
    }

    // Difficulty filter
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(quiz => quiz.difficulty === filters.difficulty);
    }

    setFilteredQuizzes(filtered);
  };

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      topic: 'all',
      status: 'all',
      frequency: 'all',
      difficulty: 'all'
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-700/20 border border-green-500 text-green-100';
      case 'Medium': return 'bg-yellow-700/20 border border-yellow-500 text-yellow-100';
      case 'Hard': return 'bg-red-700/20 border border-red-500 text-red-100';
      default: return 'bg-gray-700/20 border border-gray-500 text-gray-100';
    }
  };

  const getStatusColor = (quiz) => {
    const now = new Date();
    const startDate = new Date(quiz.startDate);
    const endDate = new Date(quiz.endDate);
    
    if (now < startDate) return 'bg-blue-700 text-blue-100'; // Upcoming
    if (now >= startDate && now <= endDate) return 'bg-green-700 text-green-100'; // Ongoing
    return 'bg-gray-700 text-gray-100'; // Completed
  };

  const getStatusText = (quiz) => {
    const now = new Date();
    const startDate = new Date(quiz.startDate);
    const endDate = new Date(quiz.endDate);
    
    if (now < startDate) return 'Upcoming';
    if (now >= startDate && now <= endDate) return 'Ongoing';
    return 'Completed';
  };

  const handleStartQuiz = (quizId, e) => {
    e.stopPropagation();
    navigate(`/quiz/${quizId}`);
  };

  // Group quizzes by category for Netflix-like sections
  const groupQuizzesByCategory = () => {
    const grouped = {};
    
    // Get all unique categories
    const allCategories = [...new Set(quizzes.map(quiz => quiz.category))];
    
    // Initialize each category with empty array
    allCategories.forEach(category => {
      grouped[category] = [];
    });
    
    // Add a special section for latest quizzes (last 7 days)
    grouped['Latest'] = [];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Add a special section for popular/top-rated quizzes
    grouped['Top Rated'] = [];
    
    // Add a special section for daily quizzes
    grouped['Daily'] = [];
    
    // Add a special section for upcoming quizzes
    grouped['Upcoming'] = [];
    
    // Add a special section for ongoing quizzes
    grouped['Ongoing'] = [];
    
    // Add a special section for completed quizzes
    grouped['Completed'] = [];
    
    // Categorize quizzes
    quizzes.forEach(quiz => {
      // Add to its category
      if (quiz.category && grouped[quiz.category]) {
        grouped[quiz.category].push(quiz);
      }
      
      // Check if it's a latest quiz
      const quizDate = new Date(quiz.createdAt || quiz.startDate);
      if (quizDate >= oneWeekAgo) {
        grouped['Latest'].push(quiz);
      }
      
      // Check if it's a daily quiz
      if (quiz.frequency === 'daily') {
        grouped['Daily'].push(quiz);
      }
      
      // Check status for special sections
      const now = new Date();
      const startDate = new Date(quiz.startDate);
      const endDate = new Date(quiz.endDate);
      
      if (now < startDate) {
        grouped['Upcoming'].push(quiz);
      } else if (now >= startDate && now <= endDate) {
        grouped['Ongoing'].push(quiz);
      } else {
        grouped['Completed'].push(quiz);
      }
    });
    
    // Remove empty categories
    Object.keys(grouped).forEach(key => {
      if (grouped[key].length === 0) {
        delete grouped[key];
      }
    });
    
    return grouped;
  };

  // Group filtered quizzes by category
  const groupFilteredQuizzesByCategory = () => {
    const grouped = {};
    
    if (filteredQuizzes.length === 0) return grouped;
    
    // If we're filtering by a specific category, just use that
    if (filters.category !== 'all') {
      grouped[filters.category] = filteredQuizzes;
      return grouped;
    }
    
    // Otherwise, group by category like Netflix
    filteredQuizzes.forEach(quiz => {
      if (!grouped[quiz.category]) {
        grouped[quiz.category] = [];
      }
      grouped[quiz.category].push(quiz);
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <div className='bg-black h-370'>
        <div className='min-w-screen animate-pulse bg-gray-700/20 border border-gray-600 h-16 justify-center p-4'>
          <div className='absolute top-4 left-8 rounded-md bg-gray-700 w-25 h-7'></div>
          <div className='absolute top-3 right-24 rounded-full bg-gray-700 w-10 h-10'></div>
          <div className='absolute top-4 right-13 rounded-md bg-gray-700 w-9 h-3'></div>
          <div className='absolute top-9 right-8 rounded-md bg-gray-700 w-14 h-3'></div>
        </div>
        <div className='p-5'>
          
            <div className='absolute top-23 left-38'>
              <div className='w-58 animate-pulse rounded-md bg-gray-600 h-8'></div>
            </div>
            <div className='absolute left-38 top-32'>
              <div className='w-76 animate-pulse rounded-md mt-2 bg-gray-600 h-5'></div>
            </div>

            <div className='absolute top-113 left-40'>
              <div className='w-36 animate-pulse rounded-md bg-gray-600 h-6'></div>
            </div>

            <div className='absolute top-122 left-40'>
              <div className='w-42 animate-pulse rounded-md bg-gray-600 h-5'></div>
            </div>

        <div className="min-h-screen bg-black mt-29 flex gap-4 justify-center p-4">
          <div className="bg-gray-700/20 border border-gray-600 rounded-md animate-pulse w-72 h-25">
          </div>
          <div className="bg-gray-700/20 border border-gray-600 rounded-md animate-pulse w-72 h-25">
          </div>
          <div className="bg-gray-700/20 border border-gray-600 rounded-md animate-pulse w-72 h-25">
          </div>
          <div className="bg-gray-700/20 border border-gray-600 rounded-md animate-pulse w-72 h-25">
          </div>
        </div>

        <div className="min-h-screen bg-black absolute top-129 left-36 grid grid-cols-3 gap-15 justify-center p-4">
          <div className="bg-gray-700/20 border border-gray-600 rounded-md animate-pulse w-96 h-64">
            <div className="mt-48 ml-4 bg-gray-700 border border-gray-600 rounded-md animate-pulse w-88 h-10"></div>
            <div className='absolute top-8 left-8 bg-gray-700 rounded-md animate-pulse w-17 h-5'></div>
            <div className='absolute top-8 left-27 bg-gray-700 rounded-md animate-pulse w-17 h-5'></div>
          </div>
          <div className="bg-gray-700/20 border border-gray-600 rounded-md animate-pulse w-96 h-64">
            <div className="mt-48 ml-4 bg-gray-700 border border-gray-600 rounded-md animate-pulse w-88 h-10"></div>
            <div className='absolute top-8 left-120 bg-gray-700 rounded-md animate-pulse w-17 h-5'></div>
            <div className='absolute top-8 left-139 bg-gray-700 rounded-md animate-pulse w-17 h-5'></div>
          </div>
          <div className="bg-gray-700/20 border border-gray-600 rounded-md animate-pulse w-96 h-64">
            <div className="mt-48 ml-4 bg-gray-700 border border-gray-600 rounded-md animate-pulse w-88 h-10"></div>
            <div className='absolute top-8 left-230 bg-gray-700 rounded-md animate-pulse w-17 h-5'></div>
            <div className='absolute top-8 left-249 bg-gray-700 rounded-md animate-pulse w-17 h-5'></div>
          </div>
          
        </div>
        
          <div className="absolute top-85 left-40 bg-gray-700/20 border border-gray-600 rounded-md animate-pulse w-301 h-17">
          </div>
        
          <div className="absolute top-89 left-44 bg-gray-600/50 border border-gray-600 rounded-md animate-pulse w-265 h-8.5">
          </div>

          <div className="absolute top-88.5 left-312 bg-gray-600/50 border border-gray-600 rounded-md animate-pulse w-25 h-9.5">
          </div>
        </div>
        <div className='min-w-screen absolute top-45 h-0.5 bg-gray-700 animate-pulse'></div>
      </div>
    );
  }

  const activeFiltersCount = Object.values(filters)
    .filter(v => v !== 'all' && v !== '').length;

  // Get grouped quizzes based on whether we're filtering
  const groupedQuizzes = filters.category !== 'all' || filters.search || 
                        filters.topic !== 'all' || filters.status !== 'all' || 
                        filters.frequency !== 'all' || filters.difficulty !== 'all' 
                        ? groupFilteredQuizzesByCategory() 
                        : groupQuizzesByCategory();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className='mb-1'>
        <Navbar />
      </div>
      {/* Header */}
      <div className="bg-gray-800/30 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-white">Quiz Dashboard</h1>
          <p className="mt-2 text-gray-400">Test your knowledge with curated quizzes</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/20 border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-300">Total Quizzes</h3>
              <FiBook className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold mt-2 text-white">{quizzes.length}</p>
          </div>
          <div className="bg-gray-800/20 border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-300">Ongoing Quizzes</h3>
              <FiLoader className="text-green-400" />
            </div>
            <p className="text-2xl font-bold mt-2 text-white">
              {quizzes.filter(quiz => {
                const now = new Date();
                const start = new Date(quiz.startDate);
                const end = new Date(quiz.endDate);
                return now >= start && now <= end;
              }).length}
            </p>
          </div>
          <div className="bg-gray-800/20 border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-300">Upcoming Quizzes</h3>
              <FiCalendar className="text-yellow-400" />
            </div>
            <p className="text-2xl font-bold mt-2 text-white">
              {quizzes.filter(quiz => {
                const now = new Date();
                const start = new Date(quiz.startDate);
                return now < start;
              }).length}
            </p>
          </div>
          <div className="bg-gray-800/20 border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-300">Completed Quizzes</h3>
              <FiCheckCircle className="text-purple-400" />
            </div>
            <p className="text-2xl font-bold mt-2 text-white">
              {quizzes.filter(quiz => {
                const now = new Date();
                const end = new Date(quiz.endDate);
                return now > end;
              }).length}
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-gray-800/20 border border-gray-700 rounded-lg mb-8 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search quizzes, topics, categories..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-2 border border-gray-700 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700"
            >
              <FiFilter className="mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-blue-600 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800 text-white"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Topic</label>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800 text-white"
                  value={filters.topic}
                  onChange={(e) => handleFilterChange('topic', e.target.value)}
                >
                  {topics.map(topic => (
                    <option key={topic} value={topic}>
                      {topic === 'all' ? 'All Topics' : topic}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800 text-white"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Frequency</label>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800 text-white"
                  value={filters.frequency}
                  onChange={(e) => handleFilterChange('frequency', e.target.value)}
                >
                  <option value="all">All Frequency</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Difficulty</label>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800 text-white"
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                >
                  <option value="all">All Difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div className="lg:col-span-5 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center text-gray-400 hover:text-white text-sm"
                >
                  <FiX className="mr-1" /> Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            {filters.category !== 'all' || filters.search || 
            filters.topic !== 'all' || filters.status !== 'all' || 
            filters.frequency !== 'all' || filters.difficulty !== 'all' 
            ? `Search Results (${filteredQuizzes.length} of ${quizzes.length})`
            : 'Browse Quizzes'}
          </h2>
        </div>

        {/* Quizzes Grid - Netflix Style with Categories */}
        {Object.keys(groupedQuizzes).length === 0 ? (
          <div className="bg-gray-800/20 border border-gray-700 rounded-lg p-8 text-center">
            <FiEye className="text-4xl mx-auto text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No quizzes found</h3>
            <p className="text-gray-400">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            {quizzes.length > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedQuizzes).map(([category, categoryQuizzes]) => (
              <div key={category} className="category-section">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  {category}
                  <span className="ml-2 text-sm text-gray-400">
                    ({categoryQuizzes.length})
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryQuizzes.map(quiz => (
                    <QuizCard
                      key={quiz._id}
                      quiz={quiz}
                      onStartQuiz={handleStartQuiz}
                      getDifficultyColor={getDifficultyColor}
                      getStatusColor={getStatusColor}
                      getStatusText={getStatusText}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const QuizCard = ({ quiz, onStartQuiz, getDifficultyColor, getStatusColor, getStatusText }) => {
  const now = new Date();
  const startDate = new Date(quiz.startDate);
  const endDate = new Date(quiz.endDate);
  const isUpcoming = now < startDate;
  const isOngoing = now >= startDate && now <= endDate;
  const isCompleted = now > endDate;

  return (
    <div className="bg-gray-800/20 border border-gray-700 rounded-lg overflow-hidden hover:bg-gray-700/20 transition-all duration-300 h-full flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${getStatusColor(quiz)}`}>
              {getStatusText(quiz)}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
              {quiz.difficulty}
            </span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
          {quiz.title}
        </h3>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
          {quiz.description}
        </p>
        
        <div className="space-y-2 text-sm text-gray-400 mb-4">
          {quiz.category && (
            <div className="flex items-center">
              <FiBook className="mr-2" />
              <span>Category: <span className="text-white">{quiz.category}</span></span>
            </div>
          )}
          {quiz.topic && (
            <div className="flex items-center">
              <FiBarChart2 className="mr-2" />
              <span>Topic: <span className="text-white">{quiz.topic}</span></span>
            </div>
          )}
          <div className="flex items-center">
            <FiUsers className="mr-2" />
            <span>Questions: <span className="text-white">{quiz.questions?.length || 0}</span></span>
          </div>
          <div className="flex items-center">
            <FiClock className="mr-2" />
            <span>Duration: <span className="text-white">{quiz.duration || 'N/A'} mins</span></span>
          </div>
          {quiz.frequency && (
            <div className="flex items-center">
              <FiCalendar className="mr-2" />
              <span>Frequency: <span className="text-white">{quiz.frequency}</span></span>
            </div>
          )}
        </div>

        {/* Date Information */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>Starts: {new Date(quiz.startDate).toLocaleDateString()}</div>
          <div>Ends: {new Date(quiz.endDate).toLocaleDateString()}</div>
        </div>
      </div>
      
      <div className="px-5 pb-5 mt-auto">
        <button
          onClick={(e) => onStartQuiz(quiz._id, e)}
          // disabled={isCompleted}
          className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center cursor-pointer ${
            isCompleted 
              ? 'bg-gray-700/20 border border-gray-500 text-gray-400 hover:bg-gray-500/30' 
              : 'bg-blue-700/20 border border-blue-500 text-white hover:bg-blue-700/30'
          }`}
        >
          {isCompleted ? (
            <>
              <FiCheckCircle className="mr-2" /> Completed
            </>
          ) : isOngoing ?  (
            <>
              
                <FiPlay className="mr-2" /> Start Quiz
              
            </>
          ) : (
            <>
              <FiCalendar className="mr-2" /> Upcoming
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UserQuizDashboard;