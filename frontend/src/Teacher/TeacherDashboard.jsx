// pages/teacher/TeacherDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus, FiEye, FiBarChart2, FiUsers, FiCopy,
  FiClock, FiAward, FiCheckCircle, FiXCircle,
  FiMoreHorizontal, FiEdit, FiTrash2, FiPause,
  FiPlay, FiRefreshCw, FiSearch
} from 'react-icons/fi';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';

function TeacherDashboard() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await axiosInstance.get('/api/teacher/aptitude/my-tests');
      setTests(response.data.data);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (testId, currentStatus) => {
    try {
      const response = await axiosInstance.patch(`/api/teacher/aptitude/test/${testId}/toggle-status`);
      if (response.data.success) {
        toast.success(`Test ${currentStatus ? 'deactivated' : 'activated'}`);
        fetchTests();
      }
    } catch (error) {
      toast.error('Failed to update test status');
    }
  };

  const handleDelete = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/api/teacher/aptitude/test/${testId}`);
      if (response.data.success) {
        toast.success('Test deleted successfully');
        fetchTests();
      }
    } catch (error) {
      toast.error('Failed to delete test');
    }
  };

  const copyJoinCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Join code copied to clipboard!');
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.joinCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'active') return matchesSearch && test.isActive;
    if (filter === 'inactive') return matchesSearch && !test.isActive;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage your aptitude tests</p>
          </div>
          
          <button
            onClick={() => navigate('/teacher/aptitude/create')}
            className="flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <FiPlus className="mr-2" />
            Create New Test
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Tests</p>
                <p className="text-2xl font-bold">{tests.length}</p>
              </div>
              <FiAward className="text-blue-400 text-2xl" />
            </div>
          </div>

          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Tests</p>
                <p className="text-2xl font-bold">{tests.filter(t => t.isActive).length}</p>
              </div>
              <FiCheckCircle className="text-green-400 text-2xl" />
            </div>
          </div>

          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Questions</p>
                <p className="text-2xl font-bold">
                  {tests.reduce((sum, t) => sum + (t.totalQuestions || 0), 0)}
                </p>
              </div>
              <FiBarChart2 className="text-yellow-400 text-2xl" />
            </div>
          </div>

          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Students</p>
                <p className="text-2xl font-bold">
                  {tests.reduce((sum, t) => sum + (t.allowedStudents?.length || 0), 0)}
                </p>
              </div>
              <FiUsers className="text-purple-400 text-2xl" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search tests by title or join code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
          >
            <option value="all">All Tests</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <button
            onClick={fetchTests}
            className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700"
          >
            <FiRefreshCw />
          </button>
        </div>

        {/* Tests Grid */}
        {filteredTests.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
            <p className="text-gray-400">No tests found</p>
            <button
              onClick={() => navigate('/teacher/aptitude/create')}
              className="mt-4 text-blue-400 hover:text-blue-300"
            >
              Create your first test
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <div
                key={test._id}
                className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{test.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{test.category}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    test.isActive ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {test.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Join Code */}
                <div className="bg-gray-900 p-3 rounded-lg mb-4">
                  <div className="text-xs text-gray-400 mb-1">Join Code</div>
                  <div className="flex items-center justify-between">
                    <code className="text-xl font-mono text-yellow-400">{test.joinCode}</code>
                    <button
                      onClick={() => copyJoinCode(test.joinCode)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <FiCopy />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center">
                    <div className="text-sm font-semibold">{test.totalQuestions || 0}</div>
                    <div className="text-xs text-gray-400">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">{test.timeLimit}m</div>
                    <div className="text-xs text-gray-400">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">{test.allowedStudents?.length || 0}</div>
                    <div className="text-xs text-gray-400">Students</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/teacher/aptitude/${test._id}`)}
                    className="flex-1 bg-blue-600/20 border border-blue-600 py-2 rounded-lg text-sm hover:bg-blue-600/40"
                  >
                    <FiEye className="inline mr-1" /> View
                  </button>
                  <button
                    onClick={() => navigate(`/teacher/aptitude/${test._id}/stats`)}
                    className="flex-1 bg-purple-600/20 border border-purple-600 py-2 rounded-lg text-sm hover:bg-purple-600/40"
                  >
                    <FiBarChart2 className="inline mr-1" /> Stats
                  </button>
                  <div className="relative group">
                    <button className="p-2 bg-gray-700 rounded-lg">
                      <FiMoreHorizontal />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg hidden group-hover:block z-10">
                      <button
                        onClick={() => navigate(`/teacher/aptitude/edit/${test._id}`)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center"
                      >
                        <FiEdit className="mr-2" /> Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(test._id, test.isActive)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center"
                      >
                        {test.isActive ? <FiPause className="mr-2" /> : <FiPlay className="mr-2" />}
                        {test.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(test._id)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-700 text-red-400 flex items-center"
                      >
                        <FiTrash2 className="mr-2" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;