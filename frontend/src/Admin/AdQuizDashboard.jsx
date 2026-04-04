import React, { useState, useEffect, useMemo } from 'react';
import { AdNavbar } from '../Admin/AdImport/Adimportfile';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import { useNavigate } from 'react-router-dom';
import {
  FiEye, FiUsers, FiBarChart2, FiCalendar,
  FiArrowRight, FiRefreshCw, FiFilter, FiX,
  FiChevronDown, FiChevronUp, FiSearch, FiPlus,
  FiEdit, FiTrash2, FiDownload, FiUpload, FiMoreHorizontal,
  FiGrid, FiList, FiCopy, FiSliders
} from 'react-icons/fi';

function AdQuizDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedQuizForAction, setSelectedQuizForAction] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState({ x: 0, y: 0 });
  
  const [filters, setFilters] = useState({
    difficulty: 'all',
    branch: 'all',
    category: 'all',
    subCategory: 'all',
    dateRange: 'all',
    search: '',
    status: 'all',
    minQuestions: '',
    maxQuestions: ''
  });
  
  const navigate = useNavigate();

  // Fetch all quizzes
  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (quizzes.length > 0) {
      extractFilterOptions();
      applyFilters();
    }
  }, [quizzes, filters, sortConfig]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_PATHS.ADQUIZ.GET_ALL);

      let quizData = [];
      if (Array.isArray(res.data)) quizData = res.data;
      else if (res.data?.quizzes) quizData = res.data.quizzes;
      else if (res.data?.data) quizData = res.data.data;

      setQuizzes(quizData);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique values for filter options
  const extractFilterOptions = () => {
    const branchSet = new Set();
    const categorySet = new Set();
    const subCategorySet = new Set();
    
    quizzes.forEach(quiz => {
      if (quiz.branch) branchSet.add(quiz.branch);
      if (quiz.category) categorySet.add(quiz.category);
      if (quiz.subCategory) subCategorySet.add(quiz.subCategory);
    });
    
    setBranches(['all', ...Array.from(branchSet).sort()]);
    setCategories(['all', ...Array.from(categorySet).sort()]);
    setSubCategories(['all', ...Array.from(subCategorySet).sort()]);
  };

  // Apply filters and sorting
  const applyFilters = () => {
    let filtered = [...quizzes];

    // Text search
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(q =>
        q.title.toLowerCase().includes(term) ||
        (q.description?.toLowerCase().includes(term)) ||
        (q.category?.toLowerCase().includes(term)) ||
        (q.subCategory?.toLowerCase().includes(term)) ||
        (q.branch?.toLowerCase().includes(term)) ||
        (q.tags?.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    // Difficulty filter
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === filters.difficulty);
    }

    // Branch filter
    if (filters.branch !== 'all') {
      filtered = filtered.filter(q => q.branch === filters.branch);
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(q => q.category === filters.category);
    }

    // Subcategory filter
    if (filters.subCategory !== 'all') {
      filtered = filtered.filter(q => q.subCategory === filters.subCategory);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(q => (q.status || 'draft') === filters.status);
    }

    // Question count filters
    if (filters.minQuestions) {
      filtered = filtered.filter(q => q.totalQuestions >= parseInt(filters.minQuestions));
    }
    
    if (filters.maxQuestions) {
      filtered = filtered.filter(q => q.totalQuestions <= parseInt(filters.maxQuestions));
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sevenDays = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDays = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(q => {
        const d = new Date(q.createdAt);
        if (filters.dateRange === 'today')
          return d >= today;
        if (filters.dateRange === 'week')
          return d >= sevenDays;
        if (filters.dateRange === 'month')
          return d >= thirtyDays;
        return true;
      });
    }

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredQuizzes(filtered);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const clearFilters = () => {
    setFilters({
      difficulty: 'all',
      branch: 'all',
      category: 'all',
      subCategory: 'all',
      dateRange: 'all',
      search: '',
      status: 'all',
      minQuestions: '',
      maxQuestions: ''
    });
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return 'bg-green-700';
      case 'Medium': return 'bg-yellow-700';
      case 'Hard': return 'bg-red-700';
      default: return 'bg-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-700';
      case 'draft': return 'bg-yellow-700';
      case 'archived': return 'bg-red-700';
      default: return 'bg-gray-700';
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await axiosInstance.delete(`${API_PATHS.ADQUIZ.DELETE}/${quizId}`);
        setQuizzes(quizzes.filter(q => q._id !== quizId));
        setActionMenuOpen(false);
      } catch (error) {
        console.error('Error deleting quiz:', error);
      }
    }
  };

  const handleActionMenu = (e, quiz) => {
    e.stopPropagation();
    setSelectedQuizForAction(quiz);
    setActionMenuPosition({ x: e.clientX, y: e.clientY });
    setActionMenuOpen(true);
  };

  const stats = useMemo(() => ({
    totalQuizzes: quizzes.length,
    easy: quizzes.filter(q => q.difficulty === 'Easy').length,
    medium: quizzes.filter(q => q.difficulty === 'Medium').length,
    hard: quizzes.filter(q => q.difficulty === 'Hard').length,
    published: quizzes.filter(q => (q.status || 'draft') === 'published').length,
    draft: quizzes.filter(q => (q.status || 'draft') === 'draft').length,
    archived: quizzes.filter(q => (q.status || 'draft') === 'archived').length,
    totalQuestions: quizzes.reduce((t, q) => t + (q.totalQuestions || 0), 0),
    filtered: filteredQuizzes.length
  }), [quizzes, filteredQuizzes]);

  const activeFiltersCount = Object.values(filters)
    .filter(v => v !== 'all' && v !== '').length;

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white">
        <AdNavbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <AdNavbar />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quiz Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/admin/AdQuiz')}
              className="flex items-center bg-green-600/20 border border-green-600 px-4 py-2 rounded hover:bg-green-500/20"
            >
              <FiPlus className="mr-2" /> Create Quiz
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center bg-gray-600/20 border border-gray-700 px-4 py-2 rounded hover:bg-gray-500/20"
            >
              <FiFilter className="mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-blue-600 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button
              onClick={fetchQuizzes}
              className="flex items-center bg-blue-600/20 border border-blue-600 px-4 py-2 rounded hover:bg-blue-500/20"
            >
              <FiRefreshCw className="mr-2" /> Refresh
            </button>
            <div className="flex border border-gray-700 rounded overflow-hidden">
              <button 
                className={`px-3 py-2 flex items-center ${viewMode === 'grid' ? 'bg-gray-700' : 'bg-gray-800'}`}
                onClick={() => setViewMode('grid')}
              >
                <FiGrid className="mr-1" /> Grid
              </button>
              <button 
                className={`px-3 py-2 flex items-center ${viewMode === 'list' ? 'bg-gray-700' : 'bg-gray-800'}`}
                onClick={() => setViewMode('list')}
              >
                <FiList className="mr-1" /> List
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          <StatCard title="Total Quizzes" icon={<FiCalendar />} value={stats.totalQuizzes} />
          <StatCard title="Easy" icon={<FiUsers />} value={stats.easy} color="bg-green-700" />
          <StatCard title="Medium" icon={<FiBarChart2 />} value={stats.medium} color="bg-yellow-700" />
          <StatCard title="Hard" icon={<FiEye />} value={stats.hard} color="bg-red-700" />
          <StatCard title="Published" icon={<FiUsers />} value={stats.published} color="bg-green-700" />
          <StatCard title="Total Questions" icon={<FiBarChart2 />} value={stats.totalQuestions} />
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <FiltersPanel
            filters={filters}
            handleFilterChange={handleFilterChange}
            clearFilters={clearFilters}
            setShowFilters={setShowFilters}
            activeFiltersCount={activeFiltersCount}
            branches={branches}
            categories={categories}
            subCategories={subCategories}
          />
        )}

        {/* Results header with sorting */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {activeFiltersCount > 0 ? 'Filtered Quizzes' : 'All Quizzes'}
            <span className="ml-2 text-gray-400 text-sm">
              ({stats.filtered} of {stats.totalQuizzes})
            </span>
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Sort by:
            </div>
            <select 
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white"
              value={`${sortConfig.key}-${sortConfig.direction}`}
              onChange={(e) => {
                const [key, direction] = e.target.value.split('-');
                setSortConfig({ key, direction });
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="totalQuestions-desc">Most Questions</option>
              <option value="totalQuestions-asc">Fewest Questions</option>
              <option value="difficulty-asc">Difficulty (Easy-Hard)</option>
              <option value="difficulty-desc">Difficulty (Hard-Easy)</option>
            </select>
          </div>
        </div>

        {filteredQuizzes.length === 0 ? (
          <EmptyState hasQuizzes={quizzes.length > 0} clearFilters={clearFilters} />
        ) : viewMode === 'grid' ? (
          <GridView 
            quizzes={filteredQuizzes} 
            navigate={navigate}
            getDifficultyColor={getDifficultyColor}
            getStatusColor={getStatusColor}
            expandedQuiz={expandedQuiz}
            setExpandedQuiz={setExpandedQuiz}
            handleActionMenu={handleActionMenu}
          />
        ) : (
          <ListView 
            quizzes={filteredQuizzes} 
            navigate={navigate}
            getDifficultyColor={getDifficultyColor}
            getStatusColor={getStatusColor}
            sortConfig={sortConfig}
            handleSort={handleSort}
            handleActionMenu={handleActionMenu}
          />
        )}
        
        {/* Action Menu */}
        {actionMenuOpen && (
          <ActionMenu 
            quiz={selectedQuizForAction}
            onClose={() => setActionMenuOpen(false)}
            onEdit={() => navigate(`/quizzes/edit/${selectedQuizForAction._id}`)}
            onDelete={() => handleDeleteQuiz(selectedQuizForAction._id)}
            position={actionMenuPosition}
          />
        )}
      </div>
    </div>
  );
}

/* ---- Sub Components ---- */

function StatCard({ title, icon, value, color = "bg-gray-700" }) {
  return (
    <div className="bg-gray-600/20 border border-gray-700 p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-white text-sm">{title}</h3>
        <div className="text-blue-400">{icon}</div>
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function FiltersPanel({ filters, handleFilterChange, clearFilters, setShowFilters, activeFiltersCount, branches, categories, subCategories }) {
  return (
    <div className="bg-gray-600/20 border border-gray-700 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <FiSliders className="mr-2" /> Filter Quizzes
        </h3>
        <div className="flex gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-white flex items-center bg-gray-700 px-3 py-1 rounded"
            >
              <FiX className="mr-1" /> Clear All
            </button>
          )}
          <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-white bg-gray-700 p-1 rounded">
            <FiX size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FilterInput
          label="Search"
          value={filters.search}
          onChange={e => handleFilterChange('search', e.target.value)}
          placeholder="Search titles, descriptions, tags..."
        />
        
        <FilterSelect
          label="Difficulty"
          value={filters.difficulty}
          onChange={e => handleFilterChange('difficulty', e.target.value)}
          options={['all', 'Easy', 'Medium', 'Hard']}
        />
        
        <FilterSelect
          label="Branch"
          value={filters.branch}
          onChange={e => handleFilterChange('branch', e.target.value)}
          options={branches}
        />
        
        <FilterSelect
          label="Category"
          value={filters.category}
          onChange={e => handleFilterChange('category', e.target.value)}
          options={categories}
        />
        
        <FilterSelect
          label="Subcategory"
          value={filters.subCategory}
          onChange={e => handleFilterChange('subCategory', e.target.value)}
          options={subCategories}
        />
        
        <FilterSelect
          label="Status"
          value={filters.status}
          onChange={e => handleFilterChange('status', e.target.value)}
          options={['all', 'published', 'draft', 'archived']}
        />
        
        <FilterSelect
          label="Date Range"
          value={filters.dateRange}
          onChange={e => handleFilterChange('dateRange', e.target.value)}
          options={['all', 'today', 'week', 'month']}
        />
        
        <div className="grid grid-cols-2 gap-2">
          <FilterInput
            label="Min Questions"
            value={filters.minQuestions}
            onChange={e => handleFilterChange('minQuestions', e.target.value)}
            type="number"
            placeholder="0"
          />
          <FilterInput
            label="Max Questions"
            value={filters.maxQuestions}
            onChange={e => handleFilterChange('maxQuestions', e.target.value)}
            type="number"
            placeholder="100"
          />
        </div>
      </div>
    </div>
  );
}

function FilterInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="relative">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 p-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {options.map(opt => (
          <option key={opt} value={opt}>
            {opt === 'all' ? `All ${label}` : opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function GridView({ quizzes, navigate, getDifficultyColor, getStatusColor, expandedQuiz, setExpandedQuiz, handleActionMenu }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {quizzes.map(q => (
        <QuizCard 
          key={q._id} 
          quiz={q} 
          navigate={navigate}
          getDifficultyColor={getDifficultyColor}
          getStatusColor={getStatusColor}
          isExpanded={expandedQuiz === q._id}
          onExpandToggle={() => setExpandedQuiz(expandedQuiz === q._id ? null : q._id)}
          onActionMenu={(e) => handleActionMenu(e, q)}
        />
      ))}
    </div>
  );
}

function ListView({ quizzes, navigate, getDifficultyColor, getStatusColor, sortConfig, handleSort, handleActionMenu }) {
  const SortableHeader = ({ label, sortKey }) => (
    <th 
      className="px-4 py-2 cursor-pointer hover:bg-gray-700"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center">
        {label}
        {sortConfig.key === sortKey && (
          sortConfig.direction === 'asc' ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />
        )}
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-700">
            <SortableHeader label="Title" sortKey="title" />
            <SortableHeader label="Questions" sortKey="totalQuestions" />
            <SortableHeader label="Difficulty" sortKey="difficulty" />
            <SortableHeader label="Status" sortKey="status" />
            <SortableHeader label="Branch" sortKey="branch" />
            <SortableHeader label="Category" sortKey="category" />
            <SortableHeader label="Created" sortKey="createdAt" />
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {quizzes.map(q => (
            <tr key={q._id} className="border-b border-gray-700 hover:bg-gray-800 cursor-pointer" onClick={() => navigate(`/quizzes/${q._id}`)}>
              <td className="px-4 py-3">
                <div className="font-semibold">{q.title}</div>
                {q.description && <div className="text-sm text-gray-400 truncate max-w-xs">{q.description}</div>}
              </td>
              <td className="px-4 py-3 text-center">{q.totalQuestions || 0}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(q.difficulty)}`}>
                  {q.difficulty}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(q.status || 'draft')}`}>
                  {q.status || 'draft'}
                </span>
              </td>
              <td className="px-4 py-3">{q.branch || '-'}</td>
              <td className="px-4 py-3">
                {q.category}{q.subCategory && ` / ${q.subCategory}`}
              </td>
              <td className="px-4 py-3">{new Date(q.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                <button 
                  className="p-2 hover:bg-gray-700 rounded"
                  onClick={(e) => handleActionMenu(e, q)}
                >
                  <FiMoreHorizontal />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuizCard({ quiz, navigate, getDifficultyColor, getStatusColor, isExpanded, onExpandToggle, onActionMenu }) {
  return (
    <div
      className="bg-gray-600/20 border border-gray-700 rounded-xl p-4 hover:bg-gray-400/20 transition-colors cursor-pointer"
      onClick={() => navigate(`/quizzes/${quiz._id}`)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-xl truncate">{quiz.title}</h3>
        <button 
          className="p-1 hover:bg-gray-700 rounded"
          onClick={onActionMenu}
        >
          <FiMoreHorizontal />
        </button>
      </div>

      <div className="flex items-center mb-3 gap-2">
        <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(quiz.difficulty)}`}>
          {quiz.difficulty}
        </span>
        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(quiz.status || 'draft')}`}>
          {quiz.status || 'draft'}
        </span>
        <span className="text-white text-md">
          {quiz.totalQuestions || 0} questions
        </span>
      </div>

      <div className="text-sm text-gray-400 mb-3">
        {quiz.branch} • {quiz.category}
        {quiz.subCategory && ` • ${quiz.subCategory}`}
      </div>

      {quiz.description && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{quiz.description}</p>
      )}

      {quiz.tags && quiz.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {quiz.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-700 text-xs rounded">
              {tag}
            </span>
          ))}
          {quiz.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-700 text-xs rounded">
              +{quiz.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-gray-400">
        <span>Created: {new Date(quiz.createdAt).toLocaleDateString()}</span>
        <div className="flex items-center gap-2">
          <button 
            className="text-blue-400 hover:text-blue-300 flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              onExpandToggle();
            }}
          >
            {isExpanded ? 'Show Less' : 'Show More'} 
            {isExpanded ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
          </button>
          <span className="text-blue-400 hover:text-blue-300 flex items-center">
            View <FiArrowRight className="ml-1" />
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="font-medium mb-2">Quiz Details:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-400">Time Limit:</span> {quiz.timeLimit || 'No limit'}</div>
            <div><span className="text-gray-400">Passing Score:</span> {quiz.passingScore || 'N/A'}</div>
            <div><span className="text-gray-400">Attempts:</span> {quiz.maxAttempts || 'Unlimited'}</div>
            <div><span className="text-gray-400">Shuffle:</span> {quiz.shuffleQuestions ? 'Yes' : 'No'}</div>
          </div>
          
          {quiz.updatedAt && (
            <div className="mt-2 text-xs text-gray-500">
              Last updated: {new Date(quiz.updatedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ActionMenu({ quiz, onClose, onEdit, onDelete, position }) {
  const handleExport = () => {
    // Export functionality would go here
    console.log("Export quiz:", quiz._id);
    onClose();
  };
  
  const handleDuplicate = () => {
    // Duplicate functionality would go here
    console.log("Duplicate quiz:", quiz._id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div 
        className="absolute bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-2 z-50 w-48"
        style={{ top: position.y, left: position.x }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded flex items-center"
          onClick={onEdit}
        >
          <FiEdit className="mr-2" /> Edit
        </button>
        <button 
          className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded flex items-center"
          onClick={handleDuplicate}
        >
          <FiCopy className="mr-2" /> Duplicate
        </button>
        <button 
          className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded flex items-center"
          onClick={handleExport}
        >
          <FiDownload className="mr-2" /> Export
        </button>
        <hr className="my-2 border-gray-700" />
        <button 
          className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 rounded flex items-center"
          onClick={onDelete}
        >
          <FiTrash2 className="mr-2" /> Delete
        </button>
      </div>
    </div>
  );
}

function EmptyState({ hasQuizzes, clearFilters }) {
  return (
    <div className="bg-gray-600/20 border border-gray-700 rounded-xl p-8 text-center">
      <FiCalendar className="text-4xl mx-auto text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold mb-2">
        {hasQuizzes ? 'No matching quizzes found' : 'No quizzes yet'}
      </h3>
      <p className="text-gray-400">
        {hasQuizzes
          ? 'Try adjusting your filters to see more results'
          : 'Create your first quiz to get started'}
      </p>
      {hasQuizzes && (
        <button
          onClick={clearFilters}
          className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}

export default AdQuizDashboard;