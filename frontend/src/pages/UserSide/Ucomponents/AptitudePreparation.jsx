import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAptitudeTopic } from '../../../context/useAptitudeTopic';
import { 
  FiSearch, FiFilter, FiBook, FiBarChart2,
  FiClock, FiTrendingUp, FiTarget, FiStar, FiChevronRight,
  FiHeart, FiBookmark
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const AptitudePreparation = () => {
  const navigate = useNavigate();
  const { 
    topics, 
    loading, 
    error, 
    fetchTopics, 
    fetchCategories,
    toggleBookmark,
    fetchBookmarks,
    bookmarks
  } = useAptitudeTopic();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalTopics: 0,
    totalFormulas: 0,
    totalQuestions: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await fetchTopics();
      const cats = await fetchCategories();
      setCategories(cats.data || []);
      await fetchBookmarks();
      calculateStats();
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const calculateStats = () => {
    const totalFormulas = topics.reduce((sum, topic) => sum + topic.totalFormulas, 0);
    const totalQuestions = topics.reduce((sum, topic) => sum + topic.totalQuestions, 0);
    
    setStats({
      totalTopics: topics.length,
      totalFormulas,
      totalQuestions
    });
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || topic.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleTopicClick = (slug) => {
    navigate(`/aptitude/preparation/${slug}`);
  };

  const handleBookmark = async (e, topicId) => {
    e.stopPropagation();
    try {
      await toggleBookmark(topicId);
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const getColorClass = (colorScheme) => {
    const colors = {
      blue: 'from-blue-500 to-cyan-500',
      green: 'from-green-500 to-emerald-500',
      purple: 'from-purple-500 to-pink-500',
      orange: 'from-orange-500 to-red-500',
      red: 'from-red-500 to-pink-500'
    };
    return colors[colorScheme] || colors.blue;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Hard': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative border-b border-gray-800 bg-gradient-to-b from-gray-900/50 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Aptitude Preparation Hub
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Master aptitude concepts with comprehensive resources, formulas, 
              solved examples, and practice questions.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 text-center hover:border-blue-500/30 transition-colors">
              <div className="text-2xl font-bold text-blue-400">{stats.totalTopics}</div>
              <div className="text-sm text-gray-400">Topics</div>
            </div>
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 text-center hover:border-green-500/30 transition-colors">
              <div className="text-2xl font-bold text-green-400">{stats.totalFormulas}+</div>
              <div className="text-sm text-gray-400">Formulas</div>
            </div>
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 text-center hover:border-yellow-500/30 transition-colors">
              <div className="text-2xl font-bold text-yellow-400">{stats.totalQuestions}+</div>
              <div className="text-sm text-gray-400">Questions</div>
            </div>
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 text-center hover:border-purple-500/30 transition-colors">
              <div className="text-2xl font-bold text-purple-400">{bookmarks.length}</div>
              <div className="text-sm text-gray-400">Bookmarks</div>
            </div>
          </motion.div>

          {/* Search & Filter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-900/30 border border-gray-700 rounded-xl p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search topics, formulas, or questions..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat._id} ({cat.count})
                    </option>
                  ))}
                </select>
                
                <select
                  className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  <option value="all">All Difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Browse Topics</h2>
          <div className="text-gray-400">
            Showing {filteredTopics.length} of {topics.length} topics
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {filteredTopics.length === 0 ? (
          <div className="text-center py-12">
            <FiSearch className="text-4xl mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-300">No topics found</h3>
            <p className="text-gray-500">Try a different search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic, index) => (
              <motion.div
                key={topic._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleTopicClick(topic.slug)}
                className="bg-gray-800/20 border border-gray-700 rounded-xl p-6 hover:bg-gray-700/20 hover:border-blue-500/30 cursor-pointer transition-all duration-300 group relative"
              >
                {/* Bookmark button */}
                <button
                  onClick={(e) => handleBookmark(e, topic._id)}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 z-10"
                >
                  <FiBookmark 
                    className={bookmarks.some(b => b._id === topic._id) 
                      ? "text-yellow-400 fill-yellow-400" 
                      : "text-gray-400"
                    } 
                  />
                </button>

                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${getColorClass(topic.colorScheme)}`}>
                    <div className="text-2xl">{topic.icon}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(topic.difficulty)}`}>
                    {topic.difficulty}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-300 transition-colors">
                  {topic.title}
                </h3>
                <p className="text-gray-400 mb-4 line-clamp-2">{topic.description}</p>

                <div className="flex items-center text-sm text-gray-400 mb-4">
                  <span className="flex items-center mr-4">
                    <FiBook className="mr-1" /> {topic.category}
                  </span>
                  <span className="flex items-center">
                    <FiClock className="mr-1" /> {topic.estimatedPreparationTime} min
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="font-bold text-blue-300">{topic.totalFormulas}</div>
                      <div className="text-gray-400">Formulas</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-300">{topic.totalQuestions}</div>
                      <div className="text-gray-400">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-yellow-300">{topic.totalExamples}</div>
                      <div className="text-gray-400">Examples</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-blue-400 group-hover:text-blue-300">
                    Start Learning <FiChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-gray-700 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <FiStar className="mr-2 text-yellow-400" />
            How to Use This Platform
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/30 p-4 rounded-lg hover:bg-gray-700/30 transition-colors">
              <div className="text-lg font-semibold mb-2 flex items-center">
                <FiBook className="mr-2 text-blue-400" /> 1. Learn Concepts
              </div>
              <p className="text-sm text-gray-400">Study concept explanations and formulas first</p>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg hover:bg-gray-700/30 transition-colors">
              <div className="text-lg font-semibold mb-2 flex items-center">
                <FiBook className="mr-2 text-green-400" /> 2. Practice Examples
              </div>
              <p className="text-sm text-gray-400">Go through solved examples step-by-step</p>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg hover:bg-gray-700/30 transition-colors">
              <div className="text-lg font-semibold mb-2 flex items-center">
                <FiTarget className="mr-2 text-red-400" /> 3. Test Yourself
              </div>
              <p className="text-sm text-gray-400">Attempt practice questions with timer</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AptitudePreparation;