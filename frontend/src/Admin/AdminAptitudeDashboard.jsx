import React, { useState, useEffect } from 'react';
import { adminAptitudeService } from '../services/aptitudeService';
import AptitudeTopicForm from './AptitudeTopicForm';
import { 
  FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiSearch, 
  FiFilter, FiBarChart2, FiBook, FiCheckCircle, FiUsers,
  FiX, FiSave, FiUpload, FiDownload, FiStar, FiRefreshCw,
  FiMoreVertical, FiCopy, FiExternalLink
} from 'react-icons/fi';
import Navbar from './AdNavbar';
import { toast } from 'react-toastify';

const AdminAptitudeDashboard = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [topicsRes, statsRes] = await Promise.all([
        adminAptitudeService.getAllTopicsAdmin(),
        adminAptitudeService.getAdminStats()
      ]);
      
      setTopics(topicsRes.data);
      setStats(statsRes.data);
      
      // Extract categories
      const uniqueCategories = [...new Set(topicsRes.data.map(t => t.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      toast.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

// In AdminAptitudeDashboard.jsx
const handleCreateTopic = async (topicData) => {
  try {
    // Create a simplified version with all required fields
    const simplifiedData = {
      title: topicData.title || 'Test Topic',
      slug: topicData.slug || 'test-topic',
      category: topicData.category || 'Quantitative Aptitude',
      subCategory: topicData.subCategory || 'Arithmetic',
      description: topicData.description || 'Test description',
      icon: topicData.icon || '📊',
      colorScheme: topicData.colorScheme || 'blue',
      
      conceptExplanation: {
        summary: topicData.conceptExplanation?.summary || 'Test summary',
        detailedExplanation: topicData.conceptExplanation?.detailedExplanation || 'Test detailed explanation',
        keyPoints: topicData.conceptExplanation?.keyPoints?.filter(kp => kp.trim()) || ['Test point 1']
      },
      
      // Provide minimal required data for formulas
      importantFormulas: topicData.importantFormulas?.map(formula => ({
        formula: formula.formula || 'A = πr²',
        explanation: formula.explanation || 'Area of a circle',
        variables: formula.variables?.filter(v => v.name && v.description) || [{
          name: 'r',
          description: 'Radius'
        }],
        example: {
          problem: formula.example?.problem || 'Find area of circle with radius 5',
          solution: formula.example?.solution || 'A = π(5)² = 25π'
        },
        usage: formula.usage || 'Calculating area of circular objects'
      })) || [],
      
      // Provide minimal required data for solved examples
      solvedExamples: topicData.solvedExamples?.map(example => ({
        question: example.question || 'Test question',
        solutionSteps: example.solutionSteps?.filter(step => step.trim()) || ['Step 1'],
        explanation: example.explanation || 'Test explanation',
        difficulty: example.difficulty || 'Easy',
        timeRequired: example.timeRequired || '30 seconds'
      })) || [],
      
      // Provide minimal required data for practice questions
      practiceQuestions: topicData.practiceQuestions?.map(q => ({
        question: q.question || 'Test question?',
        options: q.options?.filter(opt => opt.trim()) || ['A', 'B', 'C', 'D'],
        correctAnswer: q.correctAnswer || 'A',
        solution: q.solution || 'Test solution',
        difficulty: q.difficulty || 'Easy',
        timeLimit: q.timeLimit || 60
      })) || [],
      
      commonMistakes: topicData.commonMistakes?.filter(m => m.trim()) || [],
      timeSavingTricks: topicData.timeSavingTricks?.filter(t => t.trim()) || [],
      
      difficulty: topicData.difficulty || 'Medium',
      estimatedPreparationTime: topicData.estimatedPreparationTime || 120,
      prerequisiteTopics: topicData.prerequisiteTopics || [],
      tags: topicData.tags || ['test'],
      isPublished: topicData.isPublished !== undefined ? topicData.isPublished : true
    };
    
    console.log('Sending simplified data:', simplifiedData);
    
    const response = await adminAptitudeService.createTopic(simplifiedData);
    console.log('Response:', response);
    
    toast.success('Topic created successfully');
    setShowForm(false);
    loadData();
  } catch (error) {
    console.error('Error creating topic:', error);
    
    if (error.message) {
      console.error('Error message:', error.message);
      toast.error(`Failed to create topic: ${error.message}`);
    } else if (error.errors) {
      console.error('Validation errors:', error.errors);
      const errorMessages = Object.values(error.errors).join(', ');
      toast.error(`Validation errors: ${errorMessages}`);
    } else {
      console.error('Unknown error occurred');
      toast.error('Failed to create topic. Please check all required fields.');
    }
  }
};
  const handleUpdateTopic = async (topicData) => {
    try {
      await adminAptitudeService.updateTopic(topicData._id, topicData);
      toast.success('Topic updated successfully');
      setEditingTopic(null);
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to update topic');
    }
  };

  const handleDeleteTopic = async (id) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        await adminAptitudeService.deleteTopic(id);
        toast.success('Topic deleted successfully');
        loadData();
      } catch (error) {
        toast.error(error.message || 'Failed to delete topic');
      }
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      await adminAptitudeService.togglePublish(id);
      toast.success('Publish status updated');
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to update publish status');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await adminAptitudeService.toggleFeatured(id);
      toast.success('Featured status updated');
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to update featured status');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedTopics.length === 0) {
      toast.warning('Please select topics first');
      return;
    }

    try {
      let data = {};
      switch (action) {
        case 'publish':
          data = { topicIds: selectedTopics, action: 'publish' };
          break;
        case 'unpublish':
          data = { topicIds: selectedTopics, action: 'unpublish' };
          break;
        case 'feature':
          data = { topicIds: selectedTopics, action: 'feature' };
          break;
        case 'unfeature':
          data = { topicIds: selectedTopics, action: 'unfeature' };
          break;
        case 'delete':
          if (window.confirm(`Delete ${selectedTopics.length} selected topics?`)) {
            await Promise.all(selectedTopics.map(id => adminAptitudeService.deleteTopic(id)));
            toast.success('Topics deleted successfully');
            setSelectedTopics([]);
            loadData();
          }
          return;
      }

      await adminAptitudeService.bulkUpdateTopics(data);
      toast.success('Bulk action completed');
      setSelectedTopics([]);
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to perform bulk action');
    }
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || topic.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'published' && topic.isPublished) ||
                         (filterStatus === 'draft' && !topic.isPublished);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-black border border-gray-700 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-300">Total Topics</h3>
              <FiBook className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold mt-2">{stats.totalTopics}</p>
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>{stats.publishedTopics} Published</span>
              <span>{stats.draftTopics} Draft</span>
            </div>
          </div>
          
          <div className="bg-gray-700/20 border border-gray-700 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-300">Formulas</h3>
              <FiBarChart2 className="text-green-400" />
            </div>
            <p className="text-2xl font-bold mt-2">{stats.totalFormulas}</p>
          </div>
          
          <div className="bg-gray-700/20 border border-gray-700 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-300">Questions</h3>
              <FiCheckCircle className="text-yellow-400" />
            </div>
            <p className="text-2xl font-bold mt-2">{stats.totalQuestions}</p>
          </div>
          
          <div className="bg-gray-700/20 border border-gray-700 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-300">Examples</h3>
              <FiUsers className="text-purple-400" />
            </div>
            <p className="text-2xl font-bold mt-2">{stats.totalExamples}</p>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-gray-700 border border-gray-700 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              <FiPlus className="mr-2" /> New Topic
            </button>
            
            <button
              onClick={loadData}
              className="flex items-center bg-gray-700/20 border border-gray-700 hover:bg-gray-600/50 px-4 py-2 rounded-lg"
            >
              <FiRefreshCw className="mr-2" /> Refresh
            </button>
            
            {/* Bulk Actions Dropdown */}
            {selectedTopics.length > 0 && (
              <div className="relative">
                <button className="flex items-center bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg">
                  <FiMoreVertical className="mr-2" /> Actions ({selectedTopics.length})
                </button>
                <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-[200px]">
                  <button
                    onClick={() => handleBulkAction('publish')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded-t-lg"
                  >
                    Publish Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction('unpublish')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700"
                  >
                    Unpublish Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction('feature')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700"
                  >
                    Feature Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction('unfeature')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700"
                  >
                    Unfeature Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="w-full text-left px-4 py-2 hover:bg-red-700 rounded-b-lg text-red-400"
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search topics..."
                className="pl-10 pr-4 py-2 bg-gray-700/20 border border-gray-700 rounded-lg w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Topics Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="py-3 px-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTopics.length === filteredTopics.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTopics(filteredTopics.map(t => t._id));
                      } else {
                        setSelectedTopics([]);
                      }
                    }}
                  />
                </th>
                <th className="py-3 px-4 text-left">Topic</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Difficulty</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTopics.map((topic) => (
                <tr key={topic._id} className="border-t border-gray-700 hover:bg-gray-750">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedTopics.includes(topic._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTopics([...selectedTopics, topic._id]);
                        } else {
                          setSelectedTopics(selectedTopics.filter(id => id !== topic._id));
                        }
                      }}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{topic.icon}</span>
                      <div>
                        <div className="font-medium">{topic.title}</div>
                        <div className="text-sm text-gray-400 truncate max-w-xs">
                          {topic.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-gray-700/20 border border-gray-600 rounded-full text-sm">
                      {topic.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTogglePublish(topic._id)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          topic.isPublished 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {topic.isPublished ? 'Published' : 'Draft'}
                      </button>
                      {topic.isFeatured && (
                        <span className="px-3 py-1 bg-yellow-700/20 border border-yellow-600 text-yellow-300 rounded-full text-sm">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      topic.difficulty === 'Easy' ? 'bg-green-700/20 border border-green-600 text-green-300' :
                      topic.difficulty === 'Medium' ? 'bg-yellow-700/20 border border-yellow-600 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {topic.difficulty}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingTopic(topic)}
                        className="p-2 hover:bg-gray-700 rounded"
                        title="Edit"
                      >
                        <FiEdit className="text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(topic._id)}
                        className="p-2 hover:bg-gray-700 rounded"
                        title={topic.isFeatured ? "Unfeature" : "Feature"}
                      >
                        <FiStar className={topic.isFeatured ? "text-yellow-400 fill-yellow-400" : "text-gray-400"} />
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(topic._id)}
                        className="p-2 hover:bg-gray-700 rounded"
                        title="Delete"
                      >
                        <FiTrash2 className="text-red-400" />
                      </button>
                      <a
                        href={`/aptitude/preparation/${topic.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-700 rounded"
                        title="View"
                      >
                        <FiExternalLink className="text-green-400" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTopics.length === 0 && (
            <div className="text-center py-12">
              <FiSearch className="text-4xl mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-300">No topics found</h3>
              <p className="text-gray-500">Try a different search or add a new topic</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {(showForm || editingTopic) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-700/20 border border-gray-700 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <AptitudeTopicForm
              topic={editingTopic}
              onSave={editingTopic ? handleUpdateTopic : handleCreateTopic}
              onCancel={() => {
                setShowForm(false);
                setEditingTopic(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default AdminAptitudeDashboard;