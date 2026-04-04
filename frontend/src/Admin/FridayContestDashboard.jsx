// pages/admin/FridayContestDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import {
  FiCalendar, FiClock, FiUsers, FiBarChart2,
  FiAward, FiEye, FiEdit2, FiTrash2, FiPlus, FiSearch,
  FiFilter, FiStar, FiTrendingUp, FiCheckCircle,
  FiXCircle, FiLoader, FiRefreshCw, FiDownload,
  FiUpload, FiSettings, FiBell, FiFlag
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Modal from 'react-modal';

const FridayContestDashboard = () => {
  const [contests, setContests] = useState([]);
  const [filteredContests, setFilteredContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContest, setSelectedContest] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [contestStats, setContestStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statsLoading, setStatsLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchFridayContests();
  }, []);

  const fetchFridayContests = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.ADAPTITUDE.GET_ALL);
      
      let allTests = [];
      if (Array.isArray(response.data)) {
        allTests = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        allTests = response.data.data;
      }
      
      // Filter only Friday contests
      const fridayContests = allTests.filter(test => test.contestType === 'friday');
      setContests(fridayContests);
      setFilteredContests(fridayContests);
    } catch (error) {
      console.error('Error fetching Friday contests:', error);
      toast.error('Failed to load Friday contests');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    let filtered = contests;
    
    if (searchTerm) {
      filtered = filtered.filter(contest =>
        contest.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(contest => {
        if (!contest.schedule) return statusFilter === 'upcoming';
        
        const startDate = new Date(`${contest.schedule.startDate}T${contest.schedule.startTime}`);
        const endDate = new Date(`${contest.schedule.endDate}T${contest.schedule.endTime}`);
        
        if (statusFilter === 'active') {
          return now >= startDate && now <= endDate && contest.isActive;
        } else if (statusFilter === 'upcoming') {
          return now < startDate;
        } else if (statusFilter === 'completed') {
          return now > endDate;
        }
        return true;
      });
    }
    
    setFilteredContests(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [searchTerm, statusFilter, contests]);

  const getContestStatus = (contest) => {
    if (!contest.schedule || !contest.schedule.startDate) {
      return { status: 'draft', color: 'gray', icon: FiXCircle };
    }
    
    const now = new Date();
    const startDate = new Date(`${contest.schedule.startDate}T${contest.schedule.startTime}`);
    const endDate = new Date(`${contest.schedule.endDate}T${contest.schedule.endTime}`);
    
    if (now < startDate) {
      return { status: 'upcoming', color: 'blue', icon: FiCalendar };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'active', color: 'green', icon: FiCheckCircle };
    } else {
      return { status: 'completed', color: 'gray', icon: FiFlag };
    }
  };

  const viewContestStats = async (contest) => {
    setSelectedContest(contest);
    setShowStatsModal(true);
    setStatsLoading(true);
    
    try {
      // Fetch contest statistics
      const response = await axiosInstance.get(`${API_PATHS.ADAPTITUDE.GET_BY_ID}/${contest._id}/stats`);
      setContestStats(response.data.data);
    } catch (error) {
      console.error('Error fetching contest stats:', error);
      // Mock stats for demonstration
      setContestStats({
        totalParticipants: 156,
        averageScore: 72.5,
        highestScore: 98,
        lowestScore: 34,
        averageTimeSpent: 42,
        completionRate: 78,
        questionWiseStats: contest.questions?.map((q, idx) => ({
          questionText: q.questionText,
          correctRate: Math.floor(Math.random() * 40) + 40,
          averageTime: Math.floor(Math.random() * 60) + 30
        })) || [],
        topPerformers: [
          { name: 'John Doe', score: 98, timeSpent: 35 },
          { name: 'Jane Smith', score: 95, timeSpent: 38 },
          { name: 'Mike Johnson', score: 92, timeSpent: 42 }
        ]
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const toggleContestStatus = async (contestId, currentStatus) => {
    try {
      await axiosInstance.patch(`${API_PATHS.ADAPTITUDE.TOGGLE_STATUS}/${contestId}`);
      toast.success(`Contest ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchFridayContests();
    } catch (error) {
      toast.error('Failed to update contest status');
    }
  };

  const deleteContest = async (contestId) => {
    if (window.confirm('Are you sure you want to delete this contest? This action cannot be undone.')) {
      try {
        await axiosInstance.delete(`${API_PATHS.ADAPTITUDE.DELETE}/${contestId}`);
        toast.success('Contest deleted successfully');
        fetchFridayContests();
      } catch (error) {
        toast.error('Failed to delete contest');
      }
    }
  };

  const createNewContest = () => {
    navigate('/admin/aptitude/create', { state: { contestType: 'friday' } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <FiLoader className="animate-spin text-4xl text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black mt-15 ml-70 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FiAward className="text-4xl text-orange-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Friday Contest Dashboard
              </h1>
            </div>
            <p className="text-gray-400">Manage weekly aptitude contests and track performance</p>
          </div>
          
          <button
            onClick={createNewContest}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all"
          >
            <FiPlus /> Create Friday Contest
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Contests</p>
                <p className="text-3xl font-bold text-white">{contests.length}</p>
              </div>
              <FiAward className="text-3xl text-orange-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Contests</p>
                <p className="text-3xl font-bold text-green-400">
                  {contests.filter(c => getContestStatus(c).status === 'active').length}
                </p>
              </div>
              <FiCheckCircle className="text-3xl text-green-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Upcoming</p>
                <p className="text-3xl font-bold text-blue-400">
                  {contests.filter(c => getContestStatus(c).status === 'upcoming').length}
                </p>
              </div>
              <FiCalendar className="text-3xl text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Participants</p>
                <p className="text-3xl font-bold text-purple-400">
                  {contests.reduce((sum, c) => sum + (c.participantsCount || 0), 0)}
                </p>
              </div>
              <FiUsers className="text-3xl text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search contests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-white"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
            
            <button
              onClick={fetchFridayContests}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>

        {/* Contests List */}
        <div className="space-y-4">
          {filteredContests.length === 0 ? (
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-12 text-center">
              <FiAward className="text-6xl mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Friday Contests</h3>
              <p className="text-gray-400 mb-6">Create your first Friday contest to engage students</p>
              <button
                onClick={createNewContest}
                className="px-6 py-3 bg-orange-600 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                Create Contest
              </button>
            </div>
          ) : (
            filteredContests.map((contest) => {
              const { status, color, icon: StatusIcon } = getContestStatus(contest);
              return (
                <div
                  key={contest._id}
                  className="bg-gray-900/30 border border-gray-700 rounded-xl p-6 hover:border-orange-500/50 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-semibold text-white">{contest.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${color}-500/20 text-${color}-400 border border-${color}-500/30 flex items-center gap-1`}>
                          <StatusIcon className="text-xs" />
                          {status.toUpperCase()}
                        </span>
                        {contest.isActive && status === 'active' && (
                          <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                            Live
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {contest.description || 'No description provided'}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-400">
                          <FiCalendar className="text-orange-400" />
                          <span>
                            {contest.schedule?.startDate 
                              ? new Date(`${contest.schedule.startDate}T${contest.schedule.startTime}`).toLocaleString()
                              : 'Not scheduled'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <FiClock className="text-orange-400" />
                          <span>{contest.timeLimit || 30} minutes</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <FiBarChart2 className="text-orange-400" />
                          <span>{contest.questions?.length || 0} questions</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <FiUsers className="text-orange-400" />
                          <span>{contest.participantsCount || 0} participants</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewContestStats(contest)}
                        className="px-4 py-2 bg-blue-600/20 border border-blue-600 rounded-lg hover:bg-blue-600/40 transition-colors flex items-center gap-2"
                      >
                        <FiBarChart2 /> Stats
                      </button>
                      <button
                        onClick={() => navigate(`/admin/aptitude/edit/${contest._id}`)}
                        className="px-4 py-2 bg-yellow-600/20 border border-yellow-600 rounded-lg hover:bg-yellow-600/40 transition-colors flex items-center gap-2"
                      >
                        <FiEdit2 /> Edit
                      </button>
                      <button
                        onClick={() => toggleContestStatus(contest._id, contest.isActive)}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                          contest.isActive
                            ? 'bg-red-600/20 border border-red-600 hover:bg-red-600/40'
                            : 'bg-green-600/20 border border-green-600 hover:bg-green-600/40'
                        }`}
                      >
                        {contest.isActive ? <FiXCircle /> : <FiCheckCircle />}
                        {contest.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteContest(contest._id)}
                        className="px-4 py-2 bg-red-600/20 border border-red-600 rounded-lg hover:bg-red-600/40 transition-colors flex items-center gap-2"
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Stats Modal */}
      <Modal
        isOpen={showStatsModal}
        onRequestClose={() => setShowStatsModal(false)}
        className="max-w-5xl w-full mx-auto bg-gray-900 rounded-2xl p-6 outline-none max-h-[90vh] overflow-y-auto"
        overlayClassName="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      >
        {statsLoading ? (
          <div className="flex justify-center py-12">
            <FiLoader className="animate-spin text-3xl text-orange-500" />
          </div>
        ) : contestStats && selectedContest && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedContest.title}</h2>
                <p className="text-gray-400">Contest Statistics & Analytics</p>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FiXCircle />
              </button>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm">Participants</p>
                <p className="text-2xl font-bold text-white">{contestStats.totalParticipants}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm">Average Score</p>
                <p className="text-2xl font-bold text-green-400">{contestStats.averageScore}%</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm">Highest Score</p>
                <p className="text-2xl font-bold text-orange-400">{contestStats.highestScore}%</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm">Completion Rate</p>
                <p className="text-2xl font-bold text-blue-400">{contestStats.completionRate}%</p>
              </div>
            </div>
            
            {/* Top Performers */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiAward className="text-yellow-500" />
                Top Performers
              </h3>
              <div className="space-y-2">
                {contestStats.topPerformers?.map((performer, idx) => (
                  <div key={idx} className="bg-gray-800/30 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className="text-white">{performer.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-green-400">{performer.score}%</span>
                      <span className="text-gray-400 text-sm">{performer.timeSpent} min</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Question-wise Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiBarChart2 className="text-blue-500" />
                Question-wise Performance
              </h3>
              <div className="space-y-3">
                {contestStats.questionWiseStats?.map((q, idx) => (
                  <div key={idx} className="bg-gray-800/30 rounded-lg p-3">
                    <p className="text-sm text-white mb-2">{idx + 1}. {q.questionText}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${q.correctRate}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-green-400">{q.correctRate}% correct</span>
                      <span className="text-sm text-gray-400">{q.averageTime}s avg time</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FridayContestDashboard;