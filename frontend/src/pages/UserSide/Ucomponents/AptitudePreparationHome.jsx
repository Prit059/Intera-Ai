import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/layouts/Navbar';
import { 
  FiSearch, FiFilter, FiBook, FiAward, FiBarChart2,
  FiClock, FiTrendingUp, FiTarget, FiStar, FiChevronRight
} from 'react-icons/fi';
// import { initialTopics } from '../../../Admin/data/aptitudeSchema';
import axiosInstance from '../../../utils/axiosInstance';
import { API_PATHS } from '../../../utils/apiPaths';
import { aptitudeService } from '../../../services/aptitudeService';
import { toast } from 'react-toastify';

const AptitudePreparationHome = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  // const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchTopics();
    // fetchCategories();
  }, []);


const fetchTopics = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await axiosInstance.get(API_PATHS.APTITUDETOPIC.GET_ALL, {
      params: {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
        search: searchTerm || undefined
      }
    });
    
    // Response structure might be different - check the console
    console.log('API Response:', response.data);
    
    // Adjust based on actual response structure
    if (response.data.success) {
      setTopics(response.data.data || []);
    } else {
      throw new Error(response.data.message || 'Failed to load topics');
    }
  } catch (error) {
    console.error("Error fetching topics:", error);
    setError(error.message || 'Failed to load topics');
    toast.error(error.message || 'Failed to load topics. Please try again.');
  } finally {
    setLoading(false);
  }
};
  // const fetchCategories = async () => {
  //   try {
  //     const response = await aptitudeService.getCategories();
  //     setCategories(response.data || []);
  //   } catch (error) {
  //     console.error("Error fetching categories:", error);
  //   }
  // };
  // Filter topics
  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || topic.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty && topic.isPublished;
  });

  // Categories
  const categories = ['all', ...new Set(topics.filter(t => t.isPublished).map(t => t.category))];
  
  // Difficulty levels
  const difficulties = ['all', 'Easy', 'Medium', 'Hard'];

  const stats = {
    totalTopics: topics.filter(t => t.isPublished).length,
    totalFormulas: topics.filter(t => t.isPublished).reduce((sum, t) => sum + (t.totalFormulas || 0), 0),
    totalQuestions: topics.filter(t => t.isPublished).reduce((sum, t) => sum + (t.totalQuestions || 0), 0),
    avgPreparationTime: Math.round(
      topics.filter(t => t.isPublished).reduce((sum, t) => sum + (t.estimatedPreparationTime || 0), 0) / 
      Math.max(topics.filter(t => t.isPublished).length, 1)
    )
  };

  const handleTopicClick = (slug) => {
  console.log("Navigating to topic:", slug);
  navigate(`/aptitude/topics/${slug}`);
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

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative border-b border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-orange-400 bg-clip-text text-transparent">
              Aptitude Preparation Hub
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Master aptitude concepts with comprehensive resources, formulas, 
              solved examples, and practice questions.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-700/20 border border-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.totalTopics}</div>
              <div className="text-sm text-gray-400">Topics</div>
            </div>
            <div className="bg-gray-700/20 border border-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.totalFormulas}+</div>
              <div className="text-sm text-gray-400">Formulas</div>
            </div>
            <div className="bg-gray-700/20 border border-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.totalQuestions}+</div>
              <div className="text-sm text-gray-400">Questions</div>
            </div>
            <div className="bg-gray-700/20 border border-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.avgPreparationTime} min</div>
              <div className="text-sm text-gray-400">Avg. Prep Time</div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-black border border-gray-700 rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search topics, formulas, or questions..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/20 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  className="px-4 py-3 bg-gray-700/20 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
                
                <select
                  className="px-4 py-3 bg-gray-700/20 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  {difficulties.map(diff => (
                    <option key={diff} value={diff}>
                      {diff === 'all' ? 'All Difficulty' : diff}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Browse Topics</h2>
        </div>
          {topics.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No topics found. Try different filters.</p>
        </div>
      ) : (
        <div></div>
      )}
        </div>

        {filteredTopics.length === 0 ? (
          <div className="text-center py-12">
            <FiSearch className="text-4xl mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-300">No topics found</h3>
            <p className="text-gray-500">Try a different search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map(topic => (
              <div
                key={topic.id}
                onClick={() => handleTopicClick(topic.slug)}
                className="bg-gray-700/20 border border-gray-700 rounded-xl p-0 hover:bg-gray-700/50 hover:border-blue-500/30 cursor-pointer transition-all duration-300 group"
              >
                <div className={`rounded-t-xl bg-gradient-to-br ${getColorClass(topic.colorScheme)}/120 p-0 m-0 `}>
                <div className={`flex w-90 justify-between items-start mb-4`}>
                  <div className={`pl-3 pt-3 pb-0 rounded-lg `}>
                    <div className="text-4xl">{topic.icon}</div>
                  </div>
                  <span className={`px-3 mt-3 py-1 rounded-full text-xs font-medium ${
                    topic.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
                    topic.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {topic.difficulty}
                  </span>
                </div>
                  <h3 className="p-3 text-2xl font-bold mb-2 group-hover:text-blue-300">{topic.title}</h3>

                </div>
                  <p className="p-3 text-gray-400 mb-4">{topic.description}</p>
                <div className="flex items-center text-sm text-gray-400 mb-4">
                  <span className="p-3 flex items-center mr-4">
                    <FiBook className="mr-1" /> {topic.category}
                  </span>
                  <span className="flex items-center">
                    <FiClock className="mr-1" /> {topic.estimatedPreparationTime} min
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  {/* <div className="flex gap-4">
                    <div className="text-center">
                      <div className="font-bold text-blue-300">{topic.totalFormulas || 0}</div>
                      <div className="text-gray-400">Formulas</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-300">{topic.totalQuestions || 0}</div>
                      <div className="text-gray-400">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-yellow-300">{topic.totalExamples || 0}</div>
                      <div className="text-gray-400">Examples</div>
                    </div>
                  </div> */}
                  
                  <div className="p-3 flex items-center text-blue-400 group-hover:text-blue-300">
                    Start <FiChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Tips */}
        <div className="mt-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <FiStar className="mr-2 text-yellow-400" />
            How to Use This Platform
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <div className="text-lg font-semibold mb-2 flex items-center">
                <FiBook className="mr-2 text-blue-400" /> 1. Learn Concepts
              </div>
              <p className="text-sm text-gray-400">Study concept explanations and formulas first</p>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <div className="text-lg font-semibold mb-2 flex items-center">
                <FiAward className="mr-2 text-green-400" /> 2. Practice Examples
              </div>
              <p className="text-sm text-gray-400">Go through solved examples step-by-step</p>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <div className="text-lg font-semibold mb-2 flex items-center">
                <FiTarget className="mr-2 text-red-400" /> 3. Test Yourself
              </div>
              <p className="text-sm text-gray-400">Attempt practice questions with timer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AptitudePreparationHome;