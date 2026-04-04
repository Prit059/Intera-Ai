// components/Admin/FormulaSheets/FormulaSheetsAdmin.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { AdNavbar } from '../AdImport/Adimportfile';
import { 
  FiPlus, FiEdit2, FiTrash2, FiDownload, FiEye, 
  FiToggleLeft, FiToggleRight, FiSearch, FiFilter,
  FiX, FiSave, FiRefreshCw, FiFileText, FiTag,
  FiClock, FiTrendingUp, FiBookOpen, FiDownloadCloud,
  FiChevronLeft, FiChevronRight, FiBarChart2
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const FormulaSheetsAdmin = () => {
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFormula, setEditingFormula] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedFormulas, setSelectedFormulas] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    totalViews: 0,
    totalDownloads: 0
  });

  const navigate = useNavigate();
  
const [formData, setFormData] = useState({
  title: '',
  category: 'Quantitative Aptitude',
  subCategory: '',
  difficulty: 'Intermediate',
  description: '',
  tags: '',
  estimatedTime: 15,
  formulas: [],
  examples: [],
  concepts: [],
  mistakes: [],
  tips: [],
  metaTitle: '',
  metaDescription: ''
});

  const categories = [
    'Quantitative Aptitude',
    'Logical Reasoning',
    'Verbal Aptitude',
    'Data Interpretation'
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    fetchFormulas();
  }, []);

  const fetchFormulas = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/formulas/admin/all');
      const data = response.data.data;
      setFormulas(data);
      
      // Calculate stats
      const published = data.filter(f => f.isPublished).length;
      const drafts = data.filter(f => !f.isPublished).length;
      const totalViews = data.reduce((sum, f) => sum + (f.views || 0), 0);
      const totalDownloads = data.reduce((sum, f) => sum + (f.downloads || 0), 0);
      
      setStats({
        total: data.length,
        published,
        drafts,
        totalViews,
        totalDownloads
      });
    } catch (error) {
      console.error('Error fetching formulas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axiosInstance.post('/api/formulas', formData);
      setFormulas([response.data.data, ...formulas]);
      setShowCreateModal(false);
      resetForm();
      fetchFormulas(); // Refresh stats
    } catch (error) {
      console.error('Error creating formula:', error);
      alert(error.response?.data?.message || 'Error creating formula sheet');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axiosInstance.put(`/api/formulas/${editingFormula._id}`, formData);
      setFormulas(formulas.map(f => f._id === editingFormula._id ? response.data.data : f));
      setShowCreateModal(false);
      setEditingFormula(null);
      resetForm();
      fetchFormulas(); // Refresh stats
    } catch (error) {
      console.error('Error updating formula:', error);
      alert(error.response?.data?.message || 'Error updating formula sheet');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      await axiosInstance.patch(`/api/formulas/${id}/toggle-publish`);
      setFormulas(formulas.map(f => 
        f._id === id ? { ...f, isPublished: !currentStatus } : f
      ));
      fetchFormulas(); // Refresh stats
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this formula sheet? This action cannot be undone.')) {
      try {
        await axiosInstance.delete(`/api/formulas/${id}`);
        setFormulas(formulas.filter(f => f._id !== id));
        fetchFormulas(); // Refresh stats
      } catch (error) {
        console.error('Error deleting formula:', error);
        alert('Error deleting formula sheet');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFormulas.length === 0) return;
    if (window.confirm(`Delete ${selectedFormulas.length} formula sheets? This action cannot be undone.`)) {
      try {
        for (const id of selectedFormulas) {
          await axiosInstance.delete(`/api/formulas/${id}`);
        }
        setFormulas(formulas.filter(f => !selectedFormulas.includes(f._id)));
        setSelectedFormulas([]);
        fetchFormulas(); // Refresh stats
      } catch (error) {
        console.error('Error bulk deleting:', error);
      }
    }
  };

  const handleBulkPublish = async () => {
    if (selectedFormulas.length === 0) return;
    try {
      for (const id of selectedFormulas) {
        const formula = formulas.find(f => f._id === id);
        if (!formula.isPublished) {
          await axiosInstance.patch(`/api/formulas/${id}/toggle-publish`);
        }
      }
      setFormulas(formulas.map(f => 
        selectedFormulas.includes(f._id) ? { ...f, isPublished: true } : f
      ));
      setSelectedFormulas([]);
      fetchFormulas(); // Refresh stats
    } catch (error) {
      console.error('Error bulk publishing:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'Quantitative Aptitude',
      subCategory: '',
      difficulty: 'Intermediate',
      description: '',
      tags: '',
      estimatedTime: 15,
      metaTitle: '',
      metaDescription: ''
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedFormulas(filteredFormulas.map(f => f._id));
    } else {
      setSelectedFormulas([]);
    }
  };

  const handleSelectFormula = (id) => {
    setSelectedFormulas(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Filter formulas
  const filteredFormulas = formulas.filter(formula => {
    const matchesSearch = formula.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || formula.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'all' || formula.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'published' && formula.isPublished) ||
      (statusFilter === 'draft' && !formula.isPublished);
    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFormulas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFormulas.length / itemsPerPage);

  if (loading && formulas.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 rounded-full border-t-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Loading formula sheets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AdNavbar />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Formula Sheets</h1>
            <p className="text-gray-400 text-sm mt-1">Create and manage formula sheets for students</p>
          </div>
<button
  onClick={() => navigate('/admin/formula-sheets/create')}
  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-sm font-medium hover:shadow-lg"
>
  <FiPlus className="text-sm" />
  Create New Sheet
</button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-black border border-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <FiFileText className="text-orange-400 text-sm" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <p className="text-xl font-bold mt-1">{stats.total}</p>
            <p className="text-xs text-gray-500">Formula Sheets</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <FiEye className="text-green-400 text-sm" />
              <span className="text-xs text-gray-500">Published</span>
            </div>
            <p className="text-xl font-bold mt-1 text-green-400">{stats.published}</p>
            <p className="text-xs text-gray-500">Active Sheets</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <FiEdit2 className="text-yellow-400 text-sm" />
              <span className="text-xs text-gray-500">Drafts</span>
            </div>
            <p className="text-xl font-bold mt-1 text-yellow-400">{stats.drafts}</p>
            <p className="text-xs text-gray-500">In Progress</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <FiEye className="text-blue-400 text-sm" />
              <span className="text-xs text-gray-500">Total Views</span>
            </div>
            <p className="text-xl font-bold mt-1">{stats.totalViews.toLocaleString()}</p>
            <p className="text-xs text-gray-500">All Time</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <FiDownloadCloud className="text-purple-400 text-sm" />
              <span className="text-xs text-gray-500">Downloads</span>
            </div>
            <p className="text-xl font-bold mt-1">{stats.totalDownloads.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Downloads</p>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedFormulas.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiBarChart2 className="text-orange-400 text-sm" />
              <span className="text-sm">{selectedFormulas.length} items selected</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkPublish}
                className="px-3 py-1 bg-green-500/20 border border-green-500 rounded-lg text-xs font-medium hover:bg-green-500/30 transition-colors"
              >
                Publish All
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-500/20 border border-red-500 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors"
              >
                Delete All
              </button>
              <button
                onClick={() => setSelectedFormulas([])}
                className="px-3 py-1 bg-gray-700 rounded-lg text-xs font-medium hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search formula sheets..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="all">All Difficulties</option>
              {difficulties.map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
            <select
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <button
              onClick={fetchFormulas}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <FiRefreshCw className="text-sm" />
              Refresh
            </button>
          </div>
          
          {/* Results count */}
          <div className="mt-3 text-xs text-gray-500">
            Showing {filteredFormulas.length} of {formulas.length} formula sheets
          </div>
        </div>

        {/* Formula Sheets Table */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-700">
                <tr>
                  <th className="w-8 py-3 px-4">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedFormulas.length === filteredFormulas.length && filteredFormulas.length > 0}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 accent-orange-500"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Difficulty</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Views</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Downloads</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12">
                      <FiFileText className="text-4xl text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No formula sheets found</p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-3 text-orange-400 hover:text-orange-300 text-sm"
                      >
                        Create your first formula sheet →
                      </button>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((formula) => (
                    <tr key={formula._id} className="border-b border-gray-700 hover:bg-gray-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedFormulas.includes(formula._id)}
                          onChange={() => handleSelectFormula(formula._id)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 accent-orange-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-sm">{formula.title}</p>
                          <p className="text-xs text-gray-500">v{formula.version}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs">{formula.category}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          formula.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                          formula.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {formula.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-gray-400">{formula.views?.toLocaleString() || 0}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-gray-400">{formula.downloads?.toLocaleString() || 0}</span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleTogglePublish(formula._id, formula.isPublished)}
                          className="flex items-center gap-1 text-xs"
                        >
                          {formula.isPublished ? (
                            <FiToggleRight className="text-green-400 text-base" />
                          ) : (
                            <FiToggleLeft className="text-gray-500 text-base" />
                          )}
                          <span className={formula.isPublished ? 'text-green-400' : 'text-gray-500'}>
                            {formula.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => window.open(`/formulas/${formula.slug}`, '_blank')}
                            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                            title="View"
                          >
                            <FiEye className="text-gray-400 text-sm" />
                          </button>
                          <button
                            onClick={() => window.open(`/api/formulas/${formula.slug}/download`, '_blank')}
                            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Download"
                          >
                            <FiDownload className="text-gray-400 text-sm" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingFormula(formula);
                              setFormData({
                                title: formula.title,
                                category: formula.category,
                                subCategory: formula.subCategory || '',
                                difficulty: formula.difficulty,
                                description: formula.description || '',
                                tags: formula.tags?.join(', ') || '',
                                estimatedTime: formula.estimatedTime || 15,
                                metaTitle: formula.metaTitle || '',
                                metaDescription: formula.metaDescription || ''
                              });
                              setShowCreateModal(true);
                            }}
                            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="text-gray-400 text-sm" />
                          </button>
                          <button
                            onClick={() => handleDelete(formula._id)}
                            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="text-red-400 text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-gray-700">
              <div className="text-xs text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronLeft className="text-sm" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronRight className="text-sm" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-black rounded-xl max-w-2xl w-full max-h-[105vh] overflow-hidden border border-gray-700">
              <div className="sticky top-0 bg-black border-b border-gray-700 p-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  {editingFormula ? 'Edit Formula Sheet' : 'Create New Formula Sheet'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingFormula(null);
                    resetForm();
                  }}
                  className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <FiX className="text-lg" />
                </button>
              </div>
              
<div className="p-5 overflow-y-auto max-h-[calc(90vh-70px)] space-y-4">
  
  {/* Basic Info Section */}
  <div>
    <label className="block text-xs font-medium text-gray-400 mb-1">Title *</label>
    <input
      type="text"
      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
      value={formData.title}
      onChange={(e) => setFormData({...formData, title: e.target.value})}
      placeholder="e.g., Profit & Loss Formulas"
    />
  </div>
  
  <div className="grid grid-cols-2 gap-3">
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
      <select
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
        value={formData.category}
        onChange={(e) => setFormData({...formData, category: e.target.value})}
      >
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">Difficulty</label>
      <select
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
        value={formData.difficulty}
        onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
      >
        {difficulties.map(diff => (
          <option key={diff} value={diff}>{diff}</option>
        ))}
      </select>
    </div>
  </div>
  
  <div>
    <label className="block text-xs font-medium text-gray-400 mb-1">Sub Category (Optional)</label>
    <input
      type="text"
      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
      value={formData.subCategory}
      onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
      placeholder="e.g., Profit & Loss, Percentages, Time & Work"
    />
  </div>
  
  <div>
    <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
    <textarea
      rows="3"
      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
      value={formData.description}
      onChange={(e) => setFormData({...formData, description: e.target.value})}
      placeholder="Brief description of what this formula sheet covers..."
    />
  </div>
  
  <div>
    <label className="block text-xs font-medium text-gray-400 mb-1">Tags (comma separated)</label>
    <input
      type="text"
      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
      value={formData.tags}
      onChange={(e) => setFormData({...formData, tags: e.target.value})}
      placeholder="e.g., profit, loss, discount, percentage"
    />
  </div>
  
  <div className="grid grid-cols-2 gap-3">
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">Estimated Time (minutes)</label>
      <input
        type="number"
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
        value={formData.estimatedTime}
        onChange={(e) => setFormData({...formData, estimatedTime: parseInt(e.target.value)})}
      />
    </div>
  </div>

  {/* ========== FORMULAS SECTION ========== */}
  <div className="border-t border-gray-700 pt-4">
    <div className="flex justify-between items-center mb-3">
      <label className="text-sm font-medium text-orange-400">📐 FORMULAS</label>
      <button
        type="button"
        onClick={() => {
          const newFormulas = [...(formData.formulas || []), { name: '', formula: '', explanation: '' }];
          setFormData({...formData, formulas: newFormulas});
        }}
        className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
      >
        <FiPlus className="text-xs" /> Add Formula
      </button>
    </div>
    
    {(formData.formulas || []).map((formula, idx) => (
      <div key={idx} className="bg-gray-800/30 border border-gray-700 rounded-lg p-3 mb-3">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-gray-500">Formula {idx + 1}</span>
          <button
            type="button"
            onClick={() => {
              const newFormulas = [...(formData.formulas || [])];
              newFormulas.splice(idx, 1);
              setFormData({...formData, formulas: newFormulas});
            }}
            className="text-red-400 hover:text-red-300 text-xs"
          >
            Remove
          </button>
        </div>
        
        <input
          type="text"
          placeholder="Formula Name (e.g., Profit Formula)"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm mb-2 focus:outline-none focus:border-orange-500"
          value={formula.name}
          onChange={(e) => {
            const newFormulas = [...(formData.formulas || [])];
            newFormulas[idx].name = e.target.value;
            setFormData({...formData, formulas: newFormulas});
          }}
        />
        
        <textarea
          placeholder="LaTeX Formula (e.g., Profit = SP - CP)"
          rows="2"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm mb-2 font-mono focus:outline-none focus:border-orange-500"
          value={formula.formula}
          onChange={(e) => {
            const newFormulas = [...(formData.formulas || [])];
            newFormulas[idx].formula = e.target.value;
            setFormData({...formData, formulas: newFormulas});
          }}
        />
        
        <input
          type="text"
          placeholder="Explanation"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
          value={formula.explanation}
          onChange={(e) => {
            const newFormulas = [...(formData.formulas || [])];
            newFormulas[idx].explanation = e.target.value;
            setFormData({...formData, formulas: newFormulas});
          }}
        />
      </div>
    ))}
    
    {(formData.formulas || []).length === 0 && (
      <div className="text-center py-3 text-gray-500 text-xs border border-dashed border-gray-700 rounded-lg">
        Click "Add Formula" to add formulas
      </div>
    )}
  </div>

  {/* ========== EXAMPLES SECTION ========== */}
  <div className="border-t border-gray-700 pt-4">
    <div className="flex justify-between items-center mb-3">
      <label className="text-sm font-medium text-orange-400">📝 EXAMPLES</label>
      <button
        type="button"
        onClick={() => {
          const newExamples = [...(formData.examples || []), { question: '', solution: '' }];
          setFormData({...formData, examples: newExamples});
        }}
        className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
      >
        <FiPlus className="text-xs" /> Add Example
      </button>
    </div>
    
    {(formData.examples || []).map((example, idx) => (
      <div key={idx} className="bg-gray-800/30 border border-gray-700 rounded-lg p-3 mb-3">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-gray-500">Example {idx + 1}</span>
          <button
            type="button"
            onClick={() => {
              const newExamples = [...(formData.examples || [])];
              newExamples.splice(idx, 1);
              setFormData({...formData, examples: newExamples});
            }}
            className="text-red-400 hover:text-red-300 text-xs"
          >
            Remove
          </button>
        </div>
        
        <textarea
          placeholder="Question"
          rows="2"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm mb-2 focus:outline-none focus:border-orange-500"
          value={example.question}
          onChange={(e) => {
            const newExamples = [...(formData.examples || [])];
            newExamples[idx].question = e.target.value;
            setFormData({...formData, examples: newExamples});
          }}
        />
        
        <textarea
          placeholder="Solution"
          rows="3"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
          value={example.solution}
          onChange={(e) => {
            const newExamples = [...(formData.examples || [])];
            newExamples[idx].solution = e.target.value;
            setFormData({...formData, examples: newExamples});
          }}
        />
      </div>
    ))}
    
    {(formData.examples || []).length === 0 && (
      <div className="text-center py-3 text-gray-500 text-xs border border-dashed border-gray-700 rounded-lg">
        Click "Add Example" to add examples
      </div>
    )}
  </div>

  {/* ========== IMPORTANT CONCEPTS SECTION ========== */}
  <div className="border-t border-gray-700 pt-4">
    <div className="flex justify-between items-center mb-3">
      <label className="text-sm font-medium text-orange-400">💡 IMPORTANT CONCEPTS</label>
      <button
        type="button"
        onClick={() => {
          const newConcepts = [...(formData.concepts || []), ''];
          setFormData({...formData, concepts: newConcepts});
        }}
        className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
      >
        <FiPlus className="text-xs" /> Add Concept
      </button>
    </div>
    
    {(formData.concepts || []).map((concept, idx) => (
      <div key={idx} className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="e.g., Cost Price (CP): The price at which an article is purchased"
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
          value={concept}
          onChange={(e) => {
            const newConcepts = [...(formData.concepts || [])];
            newConcepts[idx] = e.target.value;
            setFormData({...formData, concepts: newConcepts});
          }}
        />
        <button
          type="button"
          onClick={() => {
            const newConcepts = [...(formData.concepts || [])];
            newConcepts.splice(idx, 1);
            setFormData({...formData, concepts: newConcepts});
          }}
          className="text-red-400 hover:text-red-300"
        >
          <FiTrash2 className="text-sm" />
        </button>
      </div>
    ))}
    
    {(formData.concepts || []).length === 0 && (
      <div className="text-center py-3 text-gray-500 text-xs border border-dashed border-gray-700 rounded-lg">
        Click "Add Concept" to add important concepts
      </div>
    )}
  </div>

  {/* ========== COMMON MISTAKES SECTION ========== */}
  <div className="border-t border-gray-700 pt-4">
    <div className="flex justify-between items-center mb-3">
      <label className="text-sm font-medium text-orange-400">⚠️ COMMON MISTAKES</label>
      <button
        type="button"
        onClick={() => {
          const newMistakes = [...(formData.mistakes || []), ''];
          setFormData({...formData, mistakes: newMistakes});
        }}
        className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
      >
        <FiPlus className="text-xs" /> Add Mistake
      </button>
    </div>
    
    {(formData.mistakes || []).map((mistake, idx) => (
      <div key={idx} className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="e.g., Calculating profit/loss percentage on SP instead of CP"
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
          value={mistake}
          onChange={(e) => {
            const newMistakes = [...(formData.mistakes || [])];
            newMistakes[idx] = e.target.value;
            setFormData({...formData, mistakes: newMistakes});
          }}
        />
        <button
          type="button"
          onClick={() => {
            const newMistakes = [...(formData.mistakes || [])];
            newMistakes.splice(idx, 1);
            setFormData({...formData, mistakes: newMistakes});
          }}
          className="text-red-400 hover:text-red-300"
        >
          <FiTrash2 className="text-sm" />
        </button>
      </div>
    ))}
    
    {(formData.mistakes || []).length === 0 && (
      <div className="text-center py-3 text-gray-500 text-xs border border-dashed border-gray-700 rounded-lg">
        Click "Add Mistake" to add common mistakes to avoid
      </div>
    )}
  </div>

  {/* ========== TIPS & SHORTCUTS SECTION ========== */}
  <div className="border-t border-gray-700 pt-4">
    <div className="flex justify-between items-center mb-3">
      <label className="text-sm font-medium text-orange-400">⚡ TIPS & SHORTCUTS</label>
      <button
        type="button"
        onClick={() => {
          const newTips = [...(formData.tips || []), ''];
          setFormData({...formData, tips: newTips});
        }}
        className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
      >
        <FiPlus className="text-xs" /> Add Tip
      </button>
    </div>
    
    {(formData.tips || []).map((tip, idx) => (
      <div key={idx} className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="e.g., Always calculate profit/loss percentage on Cost Price (CP)"
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
          value={tip}
          onChange={(e) => {
            const newTips = [...(formData.tips || [])];
            newTips[idx] = e.target.value;
            setFormData({...formData, tips: newTips});
          }}
        />
        <button
          type="button"
          onClick={() => {
            const newTips = [...(formData.tips || [])];
            newTips.splice(idx, 1);
            setFormData({...formData, tips: newTips});
          }}
          className="text-red-400 hover:text-red-300"
        >
          <FiTrash2 className="text-sm" />
        </button>
      </div>
    ))}
    
    {(formData.tips || []).length === 0 && (
      <div className="text-center py-3 text-gray-500 text-xs border border-dashed border-gray-700 rounded-lg">
        Click "Add Tip" to add helpful tips and shortcuts
      </div>
    )}
  </div>

  {/* ========== SEO SECTION ========== */}
  <div className="border-t border-gray-700 pt-4">
    <label className="block text-xs font-medium text-gray-400 mb-1">Meta Title (SEO)</label>
    <input
      type="text"
      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
      value={formData.metaTitle}
      onChange={(e) => setFormData({...formData, metaTitle: e.target.value})}
      placeholder="SEO title for search engines"
    />
  </div>
  
  <div>
    <label className="block text-xs font-medium text-gray-400 mb-1">Meta Description (SEO)</label>
    <textarea
      rows="2"
      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
      value={formData.metaDescription}
      onChange={(e) => setFormData({...formData, metaDescription: e.target.value})}
      placeholder="SEO description for search engines"
    />
  </div>
</div>
              
              <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-4 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingFormula(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingFormula ? handleUpdate : handleCreate}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <FiSave className="text-sm" />
                  {editingFormula ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormulaSheetsAdmin;