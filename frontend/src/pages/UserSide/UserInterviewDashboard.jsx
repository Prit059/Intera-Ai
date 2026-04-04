import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';  
import { API_PATHS } from '../../utils/apiPaths';
import Navbar from '../../components/layouts/Navbar';
import {
  FiSearch, FiFilter, FiX, FiBookmark, 
  FiClock, FiStar, FiChevronRight, FiChevronLeft,
  FiCalendar, FiBarChart2, FiUsers, FiEye, FiPlay,
  FiTrendingUp, FiBriefcase, FiHelpCircle, FiCpu,
  FiCode, FiLayers, FiArrowRight, FiChevronDown,
  FiMessageSquare, FiType
} from 'react-icons/fi';

const UserInterviewDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedSessions, setBookmarkedSessions] = useState(new Set());
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedViewAll, setExpandedViewAll] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    difficulty: 'all',
    sessionType: 'all',
    company: 'all',
    branch: 'all'
  });

  const navigate = useNavigate();

  // Fetch all interview sessions
  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sessions, filters, activeCategory]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.ADSESSION.GET_ALL);
      
      // Ensure we always have an array, even if response.data is not
      let sessionsData = [];
      if (Array.isArray(response.data)) {
        sessionsData = response.data;
      } else if (response.data && Array.isArray(response.data.sessions)) {
        sessionsData = response.data.sessions;
      } else if (response.data && Array.isArray(response.data.data)) {
        sessionsData = response.data.data;
      }
      
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error fetching interview sessions:', error);
      setSessions([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to sessions
  const applyFilters = () => {
    // Ensure sessions is always treated as an array
    const sessionsArray = Array.isArray(sessions) ? sessions : [];
    let filtered = [...sessionsArray];

    // Search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(session =>
        session.sessionName.toLowerCase().includes(term) ||
        session.description?.toLowerCase().includes(term) ||
        session.company?.toLowerCase().includes(term) ||
        session.branch?.toLowerCase().includes(term) ||
        session.role?.toLowerCase().includes(term) ||
        session.topic?.toLowerCase().includes(term)
      );
    }

    // Difficulty filter
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(session => session.difficulty === filters.difficulty);
    }

    // Session type filter
    if (filters.sessionType !== 'all') {
      filtered = filtered.filter(session => session.sessionType === filters.sessionType);
    }

    // Company filter
    if (filters.company !== 'all') {
      filtered = filtered.filter(session => session.company === filters.company);
    }

    // Branch filter
    if (filters.branch !== 'all') {
      filtered = filtered.filter(session => session.branch === filters.branch);
    }

    // Category filter
    if (activeCategory !== 'all') {
      switch(activeCategory) {
        case 'latest':
          filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'topCompanies':
          filtered = filtered.filter(s => s.sessionType === 'company')
                            .sort((a, b) => (b.questions?.length || 0) - (a.questions?.length || 0));
          break;
        case 'popular':
          filtered = filtered.sort((a, b) => {
            const aScore = (a.questions?.length || 0) + (a.difficulty === 'Hard' ? 5 : a.difficulty === 'Medium' ? 3 : 1);
            const bScore = (b.questions?.length || 0) + (b.difficulty === 'Hard' ? 5 : b.difficulty === 'Medium' ? 3 : 1);
            return bScore - aScore;
          });
          break;
        case 'frontend':
          filtered = filtered.filter(s => s.branch === 'CSE' && s.role?.toLowerCase().includes('frontend'));
          break;
        case 'backend':
          filtered = filtered.filter(s => s.branch === 'CSE' && s.role?.toLowerCase().includes('backend'));
          break;
        case 'dataScience':
          filtered = filtered.filter(s => s.branch === 'CSE' && s.role?.toLowerCase().includes('data'));
          break;
        default:
          // For dynamic categories based on branch
          if (activeCategory.startsWith('branch-')) {
            const branch = activeCategory.replace('branch-', '');
            filtered = filtered.filter(s => s.branch === branch);
          }
          break;
      }
    }

    setFilteredSessions(filtered);
  };

  // Extract unique values for filter options
  const companies = ['all', ...new Set(
    Array.isArray(sessions) 
      ? sessions.map(s => s.company).filter(Boolean).sort() 
      : []
  )];
  
  const branches = ['all', ...new Set(
    Array.isArray(sessions) 
      ? sessions.map(s => s.branch).filter(Boolean).sort() 
      : []
  )];
  
  const difficulties = ['all', 'Easy', 'Medium', 'Hard', 'Mixed'];

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      difficulty: 'all',
      sessionType: 'all',
      company: 'all',
      branch: 'all'
    });
  };

  const toggleBookmark = (sessionId, e) => {
    e.stopPropagation();
    const newBookmarks = new Set(bookmarkedSessions);
    if (newBookmarks.has(sessionId)) {
      newBookmarks.delete(sessionId);
    } else {
      newBookmarks.add(sessionId);
    }
    setBookmarkedSessions(newBookmarks);
  };

  const handleViewQuestions = (sessionId, e) => {
    e.stopPropagation();
    navigate(`/usersession/${sessionId}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-700/20 border border-green-500 text-green-100';
      case 'Medium': return 'bg-yellow-700/20 border border-yellow-500 text-yellow-100';
      case 'Hard': return 'bg-red-700/20 border border-red-500 text-red-100';
      default: return 'bg-gray-700/20 border border-gray-500 text-gray-100';
    }
  };

  const getSessionTypeColor = (type) => {
    switch (type) {
      case 'company': return 'bg-blue-700/20 border border-blue-700 text-blue-100';
      case 'general': return 'bg-purple-700/20 border border-purple-700 text-purple-100';
      default: return 'bg-gray-700/20 text-gray-100';
    }
  };

  // Get unique categories dynamically
  const getAvailableCategories = () => {
    const categories = [
      { id: 'all', name: 'All Sessions', icon: <FiBarChart2 /> },
      { id: 'latest', name: 'Latest', icon: <FiTrendingUp /> },
      { id: 'topCompanies', name: 'Top Companies', icon: <FiBriefcase /> },
      { id: 'popular', name: 'Popular', icon: <FiStar /> }
    ];

    // Add frontend category if we have frontend sessions
    if (sessions.some(s => s.branch === 'CSE' && s.role?.toLowerCase().includes('frontend'))) {
      categories.push({ id: 'frontend', name: 'Frontend', icon: <FiCode /> });
    }

    // Add backend category if we have backend sessions
    if (sessions.some(s => s.branch === 'CSE' && s.role?.toLowerCase().includes('backend'))) {
      categories.push({ id: 'backend', name: 'Backend', icon: <FiCpu /> });
    }

    // Add data science category if we have data science sessions
    if (sessions.some(s => s.branch === 'CSE' && s.role?.toLowerCase().includes('data'))) {
      categories.push({ id: 'dataScience', name: 'Data Science', icon: <FiLayers /> });
    }

    // Add dynamic branch categories
    branches.filter(b => b !== 'all').forEach(branch => {
      if (sessions.some(s => s.branch === branch)) {
        categories.push({ 
          id: `branch-${branch}`, 
          name: branch, 
          icon: <FiUsers /> 
        });
      }
    });

    return categories;
  };

  // Get sessions for a specific category
  const getCategorySessions = (categoryId, limit = 6) => {
    let categorySessions = [...sessions];
    
    switch(categoryId) {
      case 'latest':
        categorySessions = categorySessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'topCompanies':
        categorySessions = categorySessions.filter(s => s.sessionType === 'company')
                              .sort((a, b) => (b.questions?.length || 0) - (a.questions?.length || 0));
        break;
      case 'popular':
        categorySessions = categorySessions.sort((a, b) => {
          const aScore = (a.questions?.length || 0) + (a.difficulty === 'Hard' ? 5 : a.difficulty === 'Medium' ? 3 : 1);
          const bScore = (b.questions?.length || 0) + (b.difficulty === 'Hard' ? 5 : b.difficulty === 'Medium' ? 3 : 1);
          return bScore - aScore;
        });
        break;
      case 'frontend':
        categorySessions = categorySessions.filter(s => s.branch === 'CSE' && s.role?.toLowerCase().includes('frontend'));
        break;
      case 'backend':
        categorySessions = categorySessions.filter(s => s.branch === 'CSE' && s.role?.toLowerCase().includes('backend'));
        break;
      case 'dataScience':
        categorySessions = categorySessions.filter(s => s.branch === 'CSE' && s.role?.toLowerCase().includes('data'));
        break;
      default:
        if (categoryId.startsWith('branch-')) {
          const branch = categoryId.replace('branch-', '');
          categorySessions = categorySessions.filter(s => s.branch === branch);
        }
        break;
    }
    
    return categorySessions.slice(0, limit);
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
          
            <div className='absolute left-42 top-43'>
              <div className='w-158 animate-pulse rounded-md mt-2 bg-gray-600 h-13'></div>
            </div>
            <div className='absolute top-62 left-42'>
              <div className='w-163 animate-pulse rounded-md bg-gray-600 h-5'></div>
            </div>
            <div className='absolute top-69 left-42'>
              <div className='w-28 animate-pulse rounded-md bg-gray-600 h-5'></div>
            </div>
            {/* button */}
            <div className='absolute left-42 top-77'>
              <div className='w-40 animate-pulse rounded-md mt-2 bg-gray-600 h-11'></div>
            </div>
            <div className='absolute left-86 top-77'>
              <div className='w-30 animate-pulse rounded-md mt-2 bg-gray-600 h-11'></div>
            </div>

            <div className='absolute top-133 left-42'>
              <div className='w-32 animate-pulse rounded-md bg-gray-600 h-5'></div>
            </div>
            <div className='absolute top-110 left-42'>
              <div className='w-32 animate-pulse rounded-md bg-gray-600 h-5'></div>
            </div>

        <div className="min-h-screen bg-black flex gap-4 justify-center p-4">
          <div className="bg-gray-700/20 absolute left-42 top-119 border border-gray-600 rounded-md animate-pulse w-24 h-8">
          </div>
          <div className="bg-gray-700/20 absolute left-68 top-119 border border-gray-600 rounded-md animate-pulse w-24 h-8">
          </div>
          <div className="bg-gray-700/20 absolute left-94 top-119 border border-gray-600 rounded-md animate-pulse w-24 h-8">
          </div>
          <div className="bg-gray-700/20 absolute left-120 top-119 border border-gray-600 rounded-md animate-pulse w-24 h-8">
          </div>
          <div className="bg-gray-700/20 absolute left-146 top-119 border border-gray-600 rounded-md animate-pulse w-24 h-8">
          </div>
          <div className="bg-gray-700/20 absolute left-172 top-119 border border-gray-600 rounded-md animate-pulse w-24 h-8">
          </div>
          <div className="bg-gray-700/20 absolute left-198 top-119 border border-gray-600 rounded-md animate-pulse w-24 h-8">
          </div>
          <div className="bg-gray-700/20 absolute left-224 top-119 border border-gray-600 rounded-md animate-pulse w-24 h-8">
          </div>
          <div className="bg-gray-700/20 absolute left-250 top-119 border border-gray-600 rounded-md animate-pulse w-24 h-8">
          </div>
        </div>

        <div className="min-h-screen bg-black absolute top-139 left-36 grid grid-cols-4 gap-5 justify-center p-4">
          <div className="bg-gray-700/20 border border-gray-600 rounded-md animate-pulse w-75 h-64">
            <div className="mt-48 ml-4 bg-gray-700 border border-gray-600 rounded-md animate-pulse w-67 h-10"></div>
            <div className='absolute top-8 left-8 bg-gray-700 rounded-md animate-pulse w-17 h-5'></div>
            <div className='absolute top-8 left-27 bg-gray-700 rounded-md animate-pulse w-17 h-5'></div>
          </div>
          <div className="bg-gray-700/20 border border-gray-600 rounded-md animate-pulse w-75 h-64">
            <div className="mt-48 ml-4 bg-gray-700 border border-gray-600 rounded-md animate-pulse w-67 h-10"></div>
            <div className='absolute top-8 left-91 bg-gray-700 rounded-md animate-pulse w-17 h-5'></div>
            <div className='absolute top-8 left-110 bg-gray-700 rounded-md animate-pulse w-17 h-5'></div>
          </div>
          <div className="bg-gray-700/20 border border-gray-600 rounded-md animate-pulse w-75 h-64">
            <div className="mt-48 ml-4 bg-gray-700 border border-gray-600 rounded-md animate-pulse w-67 h-10"></div>
            <div className='absolute top-8 left-173 bg-gray-700 rounded-md animate-pulse w-17 h-5'></div>
            <div className='absolute top-8 left-192 bg-gray-700 rounded-md animate-pulse w-17 h-5'></div>
          </div>
          <div className="bg-gray-700/20 border border-gray-600 rounded-md animate-pulse w-75 h-64">
            <div className="mt-48 ml-4 bg-gray-700 border border-gray-600 rounded-md animate-pulse w-67 h-10"></div>
            <div className='absolute top-8 left-256 bg-gray-700 rounded-md animate-pulse w-17 h-5'></div>
            <div className='absolute top-8 left-275 bg-gray-700 rounded-md animate-pulse w-17 h-5'></div>
          </div>
          
        </div>
      
        </div>
        {/* <div className='min-w-screen absolute top-45 h-0.5 bg-gray-700 animate-pulse'></div> */}
      </div>
    );
  }

  const availableCategories = getAvailableCategories();

  const CategoryRow = ({ title, sessions, icon, categoryId }) => {
    const scrollRef = React.useRef(null);
    const [showAll, setShowAll] = useState(false);
    
    const scroll = (direction) => {
      if (scrollRef.current) {
        const scrollAmount = 300;
        scrollRef.current.scrollBy({
          left: direction === 'right' ? scrollAmount : -scrollAmount,
          behavior: 'smooth'
        });
      }
    };

    const displayedSessions = showAll ? sessions : sessions.slice(0, 4);

    return (
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            {title}
          </h2>
          {sessions.length > 4 && (
            <button 
              onClick={() => setShowAll(!showAll)}
              className="flex items-center text-gray-400 hover:text-white text-sm"
            >
              {showAll ? 'Show Less' : 'View All'} 
              {showAll ? <FiChevronDown className="ml-1" /> : <FiArrowRight className="ml-1" />}
            </button>
          )}
        </div>
        
        {sessions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedSessions.map(session => (
                <SessionCard
                  key={session._id}
                  session={session}
                  isBookmarked={bookmarkedSessions.has(session._id)}
                  onBookmarkToggle={(e) => toggleBookmark(session._id, e)}
                  onViewQuestions={(e) => handleViewQuestions(session._id, e)}
                  getDifficultyColor={getDifficultyColor}
                  getSessionTypeColor={getSessionTypeColor}
                />
              ))}
            </div>
            
            {/* Show remaining sessions in a new row if View All is clicked */}
            {showAll && sessions.length > 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                {sessions.slice(4).map(session => (
                  <SessionCard
                    key={session._id}
                    session={session}
                    isBookmarked={bookmarkedSessions.has(session._id)}
                    onBookmarkToggle={(e) => toggleBookmark(session._id, e)}
                    onViewQuestions={(e) => handleViewQuestions(session._id, e)}
                    getDifficultyColor={getDifficultyColor}
                    getSessionTypeColor={getSessionTypeColor}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-gray-800/20 border border-gray-700 rounded-lg p-8 text-center">
            <FiEye className="text-4xl mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">No sessions available in this category</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className='h-18'>
        <Navbar />
      </div>
      {/* Hero Banner */}
      <div className="relative h-96 w-full mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black z-10"></div>
        
        {sessions.length > 0 && (
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1535223289827-42f1e9919769?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
          }}></div>
        )}
        
        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Ace Your Technical Interviews</h1>
            <p className="text-xl text-gray-300 mb-6 max-w-2xl">
              Practice with curated interview questions from top companies and master your skills.
            </p>
            <div className="flex space-x-4">
              <button className="px-6 py-3 bg-blue-700/20 border border-blue-600 text-white rounded-md hover:bg-blue-600/30 flex items-center">
                <FiPlay className="mr-2" /> Start Practicing
              </button>
              <button className="px-6 py-3 bg-gray-700/20 border border-gray-600 text-white rounded-md hover:bg-gray-600/30">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Search and Filter Bar */}
        <div className="">
          {/* <div className="flex flex-col md:flex-row md:items-center justify-between gap-4"> */}
            {/* <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search sessions, companies, topics..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div> */}
            {/* <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-2 border border-gray-700 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700"
            >
              <FiFilter className="mr-2" />
              Filters
            </button> */}
          {/* </div> */}

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Difficulty</label>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800 text-white"
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                >
                  {difficulties.map(opt => (
                    <option key={opt} value={opt}>
                      {opt === 'all' ? 'All Difficulties' : opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Session Type</label>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800 text-white"
                  value={filters.sessionType}
                  onChange={(e) => handleFilterChange('sessionType', e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="general">General</option>
                  <option value="company">Company Specific</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800 text-white"
                  value={filters.company}
                  onChange={(e) => handleFilterChange('company', e.target.value)}
                >
                  {companies.map(company => (
                    <option key={company} value={company}>
                      {company === 'all' ? 'All Companies' : company}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Branch</label>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800 text-white"
                  value={filters.branch}
                  onChange={(e) => handleFilterChange('branch', e.target.value)}
                >
                  {branches.map(branch => (
                    <option key={branch} value={branch}>
                      {branch === 'all' ? 'All Branches' : branch}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-4 flex justify-end">
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
            {filters.branch !== 'all' || filters.search || filters.company !== 'all' || filters.difficulty !== 'all' || filters.sessionType !== 'all' ? `Search Results (${filteredSessions.length}) of ${sessions.length}` : 'All Sessions'}
          </h2>
        </div>

        {/* Category Navigation */}
        <div className="flex overflow-x-auto scrollbar-hide mb-8 pb-2">
          <div className="flex space-x-2">
            {availableCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap flex items-center ${activeCategory === category.id ? 'bg-blue-700/20 border border-blue-500 text-white' : 'bg-gray-600/20 border border-gray-500 text-gray-300 hover:bg-gray-700'}`}
              >
                {category.icon && <span className="mr-2">{category.icon}</span>}
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Show filtered results when a category is selected */}
        {activeCategory !== 'all' ? (
          <CategoryRow 
            title={availableCategories.find(c => c.id === activeCategory)?.name || "Sessions"} 
            sessions={getCategorySessions(activeCategory)} 
            icon={availableCategories.find(c => c.id === activeCategory)?.icon}
            categoryId={activeCategory}
          />
        ) : (
          /* Show all categories when "All Sessions" is selected */
          <div className="space-y-10">
            {availableCategories.filter(c => c.id !== 'all').map(category => {
              const categorySessions = getCategorySessions(category.id, 4);
              return categorySessions.length > 0 ? (
                <CategoryRow 
                  key={category.id}
                  title={category.name} 
                  sessions={categorySessions} 
                  icon={category.icon}
                  categoryId={category.id}
                />
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const SessionCard = ({ session, isBookmarked, onBookmarkToggle, onViewQuestions, getDifficultyColor, getSessionTypeColor }) => {
  return (
    <div className="bg-gray-800/20 border border-gray-700 rounded-lg overflow-hidden hover:bg-gray-700/20 transition-all duration-300 h-full flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSessionTypeColor(session.sessionType)}`}>
              {session.sessionType === 'company' ? 'Company' : 'General'}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(session.difficulty)}`}>
              {session.difficulty}
            </span>
          </div>
          <button
            onClick={onBookmarkToggle}
            className={`p-1 rounded-full ${isBookmarked ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`}
          >
            <FiBookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
          {session.sessionName?.toUpperCase()}
        </h3>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
          {session.description}
        </p>
        
        <div className="space-y-2 text-sm text-gray-400 mb-4">
          {session.company && (
            <div className="flex items-center">
              <FiBriefcase className="mr-2" />
              <span>{session.company}{session.companyRole && ` - ${session.companyRole}`}</span>
            </div>
          )}
          {session.branch && session.role && (
            <div className="flex items-center">
              <FiUsers className="mr-2" />
              <span>{session.branch} - {session.role}</span>
            </div>
          )}
          <div className="flex items-center">
            <FiHelpCircle className="mr-2" />
            <span>{session.questions?.length || 0} questions</span>
          </div>
          <div className="flex items-center">
            <FiCalendar className="mr-2" />
            <span>{new Date(session.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <div className="px-5 pb-5 mt-auto">
        <button
          onClick={onViewQuestions}
          className="w-full px-4 py-2 bg-blue-600/10 border border-blue-500 text-white rounded-md hover:bg-blue-700/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
        >
          <FiPlay className="mr-2" /> View Questions
        </button>
      </div>
    </div>
  );
};

// Session Detail Page Component (for routing)
const SessionDetailPage = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const { sessionId } = useParams(); // Assuming you're using React Router

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(API_PATHS.ADSESSION.GET_ONE(sessionId));
        setSession(response.data);
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Session not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800/20 border border-gray-700 rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold mb-2">{session.sessionName}</h1>
          <p className="text-gray-400 mb-4">{session.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${session.sessionType === 'company' ? 'bg-blue-700 text-blue-100' : 'bg-purple-700 text-purple-100'}`}>
              {session.sessionType === 'company' ? 'Company' : 'General'}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              session.difficulty === 'Easy' ? 'bg-green-700 text-green-100' : 
              session.difficulty === 'Medium' ? 'bg-yellow-700 text-yellow-100' : 
              'bg-red-700 text-red-100'
            }`}>
              {session.difficulty}
            </span>
            {session.company && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-100">
                {session.company}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
            {session.branch && (
              <div className="flex items-center">
                <FiUsers className="mr-2" />
                <span>Branch: {session.branch}</span>
              </div>
            )}
            {session.role && (
              <div className="flex items-center">
                <FiBriefcase className="mr-2" />
                <span>Role: {session.role}</span>
              </div>
            )}
            <div className="flex items-center">
              <FiHelpCircle className="mr-2" />
              <span>Questions: {session.questions?.length || 0}</span>
            </div>
            <div className="flex items-center">
              <FiCalendar className="mr-2" />
              <span>Created: {new Date(session.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Questions</h2>
          {session.questions?.map((question, index) => (
            <div key={index} className="bg-gray-800/20 border border-gray-700 rounded-lg p-6">
              <div className="flex items-start mb-4">
                <div className="bg-blue-700 text-white rounded-full h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                  {index + 1}
                </div>
                <h3 className="text-lg font-medium">{question.question}</h3>
              </div>
              
              <div className="ml-11">
                <div className="mb-4">
                  <div className="flex items-center text-gray-300 mb-2">
                    <FiType className="mr-2" />
                    <span className="font-medium">Answer:</span>
                  </div>
                  <div className="bg-gray-900 rounded-md p-4">
                    <p className="whitespace-pre-wrap">{question.answer}</p>
                  </div>
                </div>
                
                {question.tag && (
                  <div className="flex items-center mb-4">
                    <span className="text-gray-300 mr-2">Tag:</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300">
                      {question.tag}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-400">
                  <FiMessageSquare className="mr-2" />
                  <span>Answer Type: {question.answerType === 'code' ? 'Code' : 'Text'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserInterviewDashboard;