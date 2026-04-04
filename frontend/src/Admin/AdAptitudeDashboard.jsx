import React, { useState, useEffect, useMemo } from 'react';
import { AdNavbar } from '../Admin/AdImport/Adimportfile';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  FiEye, FiUsers, FiBarChart2, FiCalendar,
  FiArrowRight, FiRefreshCw, FiFilter, FiX,
  FiChevronDown, FiChevronUp, FiSearch, FiPlus,
  FiEdit, FiTrash2, FiDownload, FiUpload, FiMoreHorizontal,
  FiGrid, FiList, FiCopy, FiSliders, FiAward, FiClock,
  FiCheckCircle, FiXCircle, FiPlay, FiPause
} from 'react-icons/fi';
import { API_PATHS } from '../utils/apiPaths';

function AdAptitudeDashboard() {
  const [aptitudes, setAptitudes] = useState([]);
  const [filteredAptitudes, setFilteredAptitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedAptitude, setExpandedAptitude] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [viewMode, setViewMode] = useState('grid');
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedAptitudeForAction, setSelectedAptitudeForAction] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState({ x: 0, y: 0 });
  
  const [filters, setFilters] = useState({
    difficulty: 'all',
    category: 'all',
    subCategory: 'all',
    contestType: 'all',
    dateRange: 'all',
    search: '',
    status: 'all',
    minQuestions: '',
    maxQuestions: '',
    minTimeLimit: '',
    maxTimeLimit: '',
    hasNegativeMarking: 'all'
  });
  
  const navigate = useNavigate();

  // Fetch all aptitudes
  useEffect(() => {
    fetchAptitudes();
  }, []);

  useEffect(() => {
    if (aptitudes.length > 0) {
      extractFilterOptions();
      applyFilters();
    }
  }, [aptitudes, filters, sortConfig]);

  const fetchAptitudes = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`${API_PATHS.ADAPTITUDE.GET_ALL}?all=true`);

      let aptitudeData = [];
      if (Array.isArray(res.data)) {
        aptitudeData = res.data;
      } else if (res.data?.data) {
        aptitudeData = res.data.data;
      } else if (res.data?.quizzes) {
        aptitudeData = res.data.quizzes;
      }

      setAptitudes(aptitudeData);
    } catch (err) {
      console.error('Error fetching aptitudes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique values for filter options
  const extractFilterOptions = () => {
    const categorySet = new Set();
    const subCategorySet = new Set();
    
    aptitudes.forEach(aptitude => {
      if (aptitude.category) categorySet.add(aptitude.category);
      if (aptitude.subCategory) subCategorySet.add(aptitude.subCategory);
    });
    
    setCategories(['all', ...Array.from(categorySet).sort()]);
    setSubCategories(['all', ...Array.from(subCategorySet).sort()]);
  };

  // Apply filters and sorting
  const applyFilters = () => {
    let filtered = [...aptitudes];

    // Text search
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(term) ||
        (a.description?.toLowerCase().includes(term)) ||
        (a.category?.toLowerCase().includes(term)) ||
        (a.subCategory?.toLowerCase().includes(term)) ||
        (a.tags?.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    // Difficulty filter
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(a => a.difficulty === filters.difficulty);
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(a => a.category === filters.category);
    }

    // Subcategory filter
    if (filters.subCategory !== 'all') {
      filtered = filtered.filter(a => a.subCategory === filters.subCategory);
    }

    // Contest type filter
    if (filters.contestType !== 'all') {
      filtered = filtered.filter(a => a.contestType === filters.contestType);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(a => (a.isActive ? 'active' : 'inactive') === filters.status);
    }

    // Negative marking filter
    if (filters.hasNegativeMarking !== 'all') {
      const hasNegative = filters.hasNegativeMarking === 'yes';
      filtered = filtered.filter(a => 
        a.scoring?.negativeMarking === hasNegative || a.negativeMarking === hasNegative
      );
    }

    // Question count filters
    if (filters.minQuestions) {
      filtered = filtered.filter(a => a.totalQuestions >= parseInt(filters.minQuestions));
    }
    
    if (filters.maxQuestions) {
      filtered = filtered.filter(a => a.totalQuestions <= parseInt(filters.maxQuestions));
    }

    // Time limit filters
    if (filters.minTimeLimit) {
      filtered = filtered.filter(a => a.timeLimit >= parseInt(filters.minTimeLimit));
    }
    
    if (filters.maxTimeLimit) {
      filtered = filtered.filter(a => a.timeLimit <= parseInt(filters.maxTimeLimit));
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sevenDays = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDays = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(a => {
        const d = new Date(a.createdAt);
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
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Handle nested properties
        if (sortConfig.key === 'passingScore') {
          aVal = a.scoring?.passingScore || a.passingScore;
          bVal = b.scoring?.passingScore || b.passingScore;
        } else if (sortConfig.key === 'negativeMarking') {
          aVal = a.scoring?.negativeMarking || a.negativeMarking;
          bVal = b.scoring?.negativeMarking || b.negativeMarking;
        }

        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredAptitudes(filtered);
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
      category: 'all',
      subCategory: 'all',
      contestType: 'all',
      dateRange: 'all',
      search: '',
      status: 'all',
      minQuestions: '',
      maxQuestions: '',
      minTimeLimit: '',
      maxTimeLimit: '',
      hasNegativeMarking: 'all'
    });
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return 'bg-green-700';
      case 'Medium': return 'bg-yellow-700';
      case 'Hard': return 'bg-orange-700';
      case 'Very Hard': return 'bg-red-700';
      default: return 'bg-gray-700';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-700' : 'bg-red-700';
  };

  const getContestTypeColor = (type) => {
    return type === 'friday' ? 'bg-purple-700' : 'bg-blue-700';
  };

  const handleDeleteAptitude = async (aptitudeId) => {
    if (window.confirm('Are you sure you want to delete this aptitude test?')) {
      try {
        await axiosInstance.delete(API_PATHS.ADAPTITUDE.DELETE.replace(':id', aptitudeId));
        setAptitudes(aptitudes.filter(a => a._id !== aptitudeId));
        setActionMenuOpen(false);
      } catch (error) {
        console.error('Error deleting aptitude:', error);
      }
    }
  };

  const handleToggleStatus = async (aptitudeId) => {
    try {
      const res = await axiosInstance.put(API_PATHS.ADAPTITUDE.TOGGLE_STATUS.replace(':id', aptitudeId));
      setAptitudes(aptitudes.map(a => 
        a._id === aptitudeId ? { ...a, isActive: res.data.data.isActive } : a
      ));
      setActionMenuOpen(false);
    } catch (error) {
      console.error('Error toggling aptitude status:', error);
    }
  };

  const handleActionMenu = (e, aptitude) => {
    e.stopPropagation();
    setSelectedAptitudeForAction(aptitude);
    setActionMenuPosition({ x: e.clientX, y: e.clientY });
    setActionMenuOpen(true);
  };

  const stats = useMemo(() => ({
    totalAptitudes: aptitudes.length,
    easy: aptitudes.filter(a => a.difficulty === 'Easy').length,
    medium: aptitudes.filter(a => a.difficulty === 'Medium').length,
    hard: aptitudes.filter(a => a.difficulty === 'Hard').length,
    veryHard: aptitudes.filter(a => a.difficulty === 'Very Hard').length,
    active: aptitudes.filter(a => a.isActive).length,
    inactive: aptitudes.filter(a => !a.isActive).length,
    general: aptitudes.filter(a => a.contestType === 'general').length,
    friday: aptitudes.filter(a => a.contestType === 'friday').length,
    totalQuestions: aptitudes.reduce((t, a) => t + (a.totalQuestions || 0), 0),
    totalMarks: aptitudes.reduce((t, a) => t + (a.totalMarks || 0), 0),
    filtered: filteredAptitudes.length
  }), [aptitudes, filteredAptitudes]);

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
          <h1 className="text-2xl font-bold">Aptitude Tests Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/admin/AdAptitude')}
              className="flex items-center bg-green-600/20 border border-green-600 px-4 py-2 rounded hover:bg-green-500/20"
            >
              <FiPlus className="mr-2" /> Create Aptitude Test
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
              onClick={fetchAptitudes}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
          <StatCard title="Total Tests" icon={<FiAward />} value={stats.totalAptitudes} color='bg-yellow-700/20 border border-yellow-700'/>
          <StatCard title="Active" icon={<FiPlay />} value={stats.active} color="bg-green-700/20 border border-green-700" />
          <StatCard title="Inactive" icon={<FiPause />} value={stats.inactive} color="bg-red-700/20 border border-red-700" />
          <StatCard title="General" icon={<FiUsers />} value={stats.general} color="bg-blue-700/20 border border-blue-700" />
          <StatCard title="Friday" icon={<FiCalendar />} value={stats.friday} color="bg-purple-700/20 border border-purple-700" />
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <FiltersPanel
            filters={filters}
            handleFilterChange={handleFilterChange}
            clearFilters={clearFilters}
            setShowFilters={setShowFilters}
            activeFiltersCount={activeFiltersCount}
            categories={categories}
            subCategories={subCategories}
          />
        )}

        {/* Results header with sorting */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {activeFiltersCount > 0 ? 'Filtered Aptitude Tests' : 'All Aptitude Tests'}
            <span className="ml-2 text-gray-400 text-sm">
              ({stats.filtered} of {stats.totalAptitudes})
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
              <option value="timeLimit-desc">Longest Duration</option>
              <option value="timeLimit-asc">Shortest Duration</option>
              <option value="difficulty-asc">Difficulty (Easy-Hard)</option>
              <option value="difficulty-desc">Difficulty (Hard-Easy)</option>
              <option value="passingScore-desc">Highest Passing Score</option>
              <option value="passingScore-asc">Lowest Passing Score</option>
            </select>
          </div>
        </div>

        {filteredAptitudes.length === 0 ? (
          <EmptyState hasAptitudes={aptitudes.length > 0} clearFilters={clearFilters} />
        ) : viewMode === 'grid' ? (
          <GridView 
            aptitudes={filteredAptitudes} 
            navigate={navigate}
            getDifficultyColor={getDifficultyColor}
            getStatusColor={getStatusColor}
            getContestTypeColor={getContestTypeColor}
            expandedAptitude={expandedAptitude}
            setExpandedAptitude={setExpandedAptitude}
            handleActionMenu={handleActionMenu}
          />
        ) : (
          <ListView 
            aptitudes={filteredAptitudes} 
            navigate={navigate}
            getDifficultyColor={getDifficultyColor}
            getStatusColor={getStatusColor}
            getContestTypeColor={getContestTypeColor}
            sortConfig={sortConfig}
            handleSort={handleSort}
            handleActionMenu={handleActionMenu}
          />
        )}
        
        {/* Action Menu */}
        {actionMenuOpen && (
          <ActionMenu 
            aptitude={selectedAptitudeForAction}
            onClose={() => setActionMenuOpen(false)}
            onEdit={() => navigate(`/admin/aptitudes/edit/${selectedAptitudeForAction._id}`)}
            onDelete={() => handleDeleteAptitude(selectedAptitudeForAction._id)}
            onToggleStatus={() => handleToggleStatus(selectedAptitudeForAction._id)}
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
    <div className={`${color} border border-gray-700 p-4 rounded-lg`}>
      <div className="flex justify-between items-center">
        <h3 className="text-white text-sm">{title}</h3>
        <div className="text-blue-400">{icon}</div>
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function FiltersPanel({ filters, handleFilterChange, clearFilters, setShowFilters, activeFiltersCount, categories, subCategories }) {
  return (
    <div className="bg-gray-600/20 border border-gray-700 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <FiSliders className="mr-2" /> Filter Aptitude Tests
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
          options={['all', 'Easy', 'Medium', 'Hard', 'Very Hard']}
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
          label="Contest Type"
          value={filters.contestType}
          onChange={e => handleFilterChange('contestType', e.target.value)}
          options={['all', 'general', 'friday']}
        />
        
        <FilterSelect
          label="Status"
          value={filters.status}
          onChange={e => handleFilterChange('status', e.target.value)}
          options={['all', 'active', 'inactive']}
        />
        
        <FilterSelect
          label="Negative Marking"
          value={filters.hasNegativeMarking}
          onChange={e => handleFilterChange('hasNegativeMarking', e.target.value)}
          options={['all', 'yes', 'no']}
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

        <div className="grid grid-cols-2 gap-2">
          <FilterInput
            label="Min Time (min)"
            value={filters.minTimeLimit}
            onChange={e => handleFilterChange('minTimeLimit', e.target.value)}
            type="number"
            placeholder="0"
          />
          <FilterInput
            label="Max Time (min)"
            value={filters.maxTimeLimit}
            onChange={e => handleFilterChange('maxTimeLimit', e.target.value)}
            type="number"
            placeholder="180"
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
            {opt === 'all' ? `All ${label}` : opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}

function GridView({ aptitudes, navigate, getDifficultyColor, getStatusColor, getContestTypeColor, expandedAptitude, setExpandedAptitude, handleActionMenu }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {aptitudes.map(a => (
        <AptitudeCard 
          key={a._id} 
          aptitude={a} 
          navigate={navigate}
          getDifficultyColor={getDifficultyColor}
          getStatusColor={getStatusColor}
          getContestTypeColor={getContestTypeColor}
          isExpanded={expandedAptitude === a._id}
          onExpandToggle={() => setExpandedAptitude(expandedAptitude === a._id ? null : a._id)}
          onActionMenu={(e) => handleActionMenu(e, a)}
        />
      ))}
    </div>
  );
}

function ListView({ aptitudes, navigate, getDifficultyColor, getStatusColor, getContestTypeColor, sortConfig, handleSort, handleActionMenu }) {
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
            <SortableHeader label="Marks" sortKey="totalMarks" />
            <SortableHeader label="Duration" sortKey="timeLimit" />
            <SortableHeader label="Difficulty" sortKey="difficulty" />
            <SortableHeader label="Status" sortKey="isActive" />
            <SortableHeader label="Type" sortKey="contestType" />
            <SortableHeader label="Category" sortKey="category" />
            <SortableHeader label="Created" sortKey="createdAt" />
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {aptitudes.map(a => (
            <tr key={a._id} className="border-b border-gray-700 hover:bg-gray-800 cursor-pointer" onClick={() => navigate(`/aptitudes/${a._id}`)}>
              <td className="px-4 py-3">
                <div className="font-semibold">{a.title}</div>
                {a.description && <div className="text-sm text-gray-400 truncate max-w-xs">{a.description}</div>}
              </td>
              <td className="px-4 py-3 text-center">{a.totalQuestions || 0}</td>
              <td className="px-4 py-3 text-center">{a.totalMarks || 0}</td>
              <td className="px-4 py-3 text-center">{a.timeLimit} min</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(a.difficulty)}`}>
                  {a.difficulty}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(a.isActive)}`}>
                  {a.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs ${getContestTypeColor(a.contestType)}`}>
                  {a.contestType === 'friday' ? 'Friday Contest' : 'General'}
                </span>
              </td>
              <td className="px-4 py-3">
                {a.category}{a.subCategory && ` / ${a.subCategory}`}
              </td>
              <td className="px-4 py-3">{new Date(a.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                <button 
                  className="p-2 hover:bg-gray-700 rounded"
                  onClick={(e) => handleActionMenu(e, a)}
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

function AptitudeCard({ aptitude, navigate, getDifficultyColor, getStatusColor, getContestTypeColor, isExpanded, onExpandToggle, onActionMenu }) {
  const scoring = aptitude.scoring || {};
  const negativeMarking = scoring.negativeMarking || aptitude.negativeMarking;
  const passingScore = scoring.passingScore || aptitude.passingScore;
  const maxAttempts = scoring.maxAttempts || aptitude.maxAttempts;

  return (
    <div
      className="bg-gray-600/20 border border-gray-700 rounded-xl p-4 hover:bg-gray-400/20 transition-colors cursor-pointer"
      onClick={() => navigate(`/aptitudes/${aptitude._id}`)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-xl truncate">{aptitude.title}</h3>
        <button 
          className="p-1 hover:bg-gray-700 rounded"
          onClick={onActionMenu}
        >
          <FiMoreHorizontal />
        </button>
      </div>

      <div className="flex items-center mb-3 gap-2 flex-wrap">
        <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(aptitude.difficulty)}`}>
          {aptitude.difficulty}
        </span>
        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(aptitude.isActive)}`}>
          {aptitude.isActive ? 'Active' : 'Inactive'}
        </span>
        <span className={`px-2 py-1 rounded text-xs ${getContestTypeColor(aptitude.contestType)}`}>
          {aptitude.contestType === 'friday' ? 'Friday Contest' : 'General'}
        </span>
      </div>

      <div className="text-sm text-gray-400 mb-3">
        {aptitude.category}
        {aptitude.subCategory && ` • ${aptitude.subCategory}`}
        {aptitude.timeLimit && ` • ${aptitude.timeLimit} min`}
      </div>

      {aptitude.description && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{aptitude.description}</p>
      )}

      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div><span className="text-gray-400">Questions:</span> {aptitude.totalQuestions || 0}</div>
        <div><span className="text-gray-400">Marks:</span> {aptitude.totalMarks || 0}</div>
        <div><span className="text-gray-400">Passing:</span> {passingScore || 60}%</div>
        <div><span className="text-gray-400">Attempts:</span> {maxAttempts === 'unlimited' ? 'Unlimited' : maxAttempts}</div>
      </div>

      {aptitude.tags && aptitude.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {aptitude.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-700 text-xs rounded">
              {tag}
            </span>
          ))}
          {aptitude.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-700 text-xs rounded">
              +{aptitude.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-gray-400">
        <span>Created: {new Date(aptitude.createdAt).toLocaleDateString()}</span>
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
          <h4 className="font-medium mb-2">Test Details:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-400">Negative Marking:</span> {negativeMarking ? 'Yes' : 'No'}</div>
            {negativeMarking && (
              <div><span className="text-gray-400">Negative Marks:</span> {scoring.negativeMarks || aptitude.negativeMarks || 0.25}</div>
            )}
            <div><span className="text-gray-400">Show Explanation:</span> {aptitude.showExplanation ? 'Yes' : 'No'}</div>
            <div><span className="text-gray-400">Points/Question:</span> {scoring.pointsPerQuestion || aptitude.pointsPerQuestion || 1}</div>
          </div>
          
          {aptitude.schedule && aptitude.schedule.startDate && (
            <div className="mt-2 text-xs text-gray-500">
              Schedule: {new Date(aptitude.schedule.startDate).toLocaleDateString()} at {aptitude.schedule.startTime}
            </div>
          )}
          
          {aptitude.updatedAt && (
            <div className="mt-2 text-xs text-gray-500">
              Last updated: {new Date(aptitude.updatedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ActionMenu({ aptitude, onClose, onEdit, onDelete, onToggleStatus, position }) {
  const handleExport = () => {
    console.log("Export aptitude:", aptitude._id);
    onClose();
  };
  
  const handleDuplicate = () => {
    console.log("Duplicate aptitude:", aptitude._id);
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
        <button 
          className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded flex items-center"
          onClick={onToggleStatus}
        >
          {aptitude.isActive ? <FiPause className="mr-2" /> : <FiPlay className="mr-2" />}
          {aptitude.isActive ? 'Deactivate' : 'Activate'}
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

function EmptyState({ hasAptitudes, clearFilters }) {
  return (
    <div className="bg-gray-600/20 border border-gray-700 rounded-xl p-8 text-center">
      <FiAward className="text-4xl mx-auto text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold mb-2">
        {hasAptitudes ? 'No matching aptitude tests found' : 'No aptitude tests yet'}
      </h3>
      <p className="text-gray-400">
        {hasAptitudes
          ? 'Try adjusting your filters to see more results'
          : 'Create your first aptitude test to get started'}
      </p>
      {hasAptitudes && (
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

export default AdAptitudeDashboard;