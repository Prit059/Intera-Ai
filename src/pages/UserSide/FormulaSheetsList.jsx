// pages/FormulaSheetsList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Navbar from '../../components/layouts/Navbar';
import { 
  FiSearch, FiClock, FiEye, FiDownload, FiStar, 
  FiBookOpen, FiFilter, FiChevronRight, FiTrendingUp
} from 'react-icons/fi';

const FormulaSheetsList = () => {
  const [formulas, setFormulas] = useState([]);
  const [filteredFormulas, setFilteredFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const navigate = useNavigate();

  const categories = ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Aptitude', 'Data Interpretation'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    fetchFormulas();
  }, []);

  const fetchFormulas = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/formulas');
      console.log("Formula Res: ",response);
      console.log("Formula Res: ",response.data);
      console.log("Formula Res: ",response.data.data);
      
      setFormulas(response.data.data);
      setFilteredFormulas(response.data.data);
    } catch (error) {
      console.error('Error fetching formulas:', error);
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = formulas;
    
    if (searchTerm) {
      filtered = filtered.filter(f => 
        f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(f => f.category === categoryFilter);
    }
    
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(f => f.difficulty === difficultyFilter);
    }
    
    setFilteredFormulas(filtered);
  }, [searchTerm, categoryFilter, difficultyFilter, formulas]);

  const handleViewFormula = (slug) => {
    navigate(`/formulas/${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-t-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Formula Sheets</h1>
          <p className="text-gray-400">Master concepts with comprehensive formula sheets and quick reference guides</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search formulas by title, category, or topic..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select
              className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="all">All Difficulties</option>
              {difficulties.map(diff => <option key={diff} value={diff}>{diff}</option>)}
            </select>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            Found {filteredFormulas.length} formula sheets
          </div>
        </div>

        {/* Formula Cards Grid */}
        {filteredFormulas.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/30 rounded-xl">
            <FiBookOpen className="text-5xl text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No formula sheets found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFormulas.map((formula) => (
              <div
                key={formula._id}
                onClick={() => handleViewFormula(formula.slug)}
                className="group bg-gray-900/30 border border-gray-700 rounded-xl p-5 hover:border-orange-500/50 hover:bg-gray-800/30 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400">
                      {formula.category}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    formula.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                    formula.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {formula.difficulty}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold mb-2 group-hover:text-orange-400 transition-colors">
                  {formula.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{formula.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FiClock /> {formula.estimatedTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <FiEye /> {formula.views || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiDownload /> {formula.downloads || 0}
                    </span>
                  </div>
                  <FiChevronRight className="group-hover:text-orange-400 transition-colors" />
                </div>
                
                {formula.tags && formula.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {formula.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 bg-gray-800 rounded-full text-gray-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormulaSheetsList;