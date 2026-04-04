import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LucideFileText, 
  LucideCalendar,
  LucideEye,
  LucidePlus,
  LucideTrash,
  LucideTrendingUp,
  LucideAward,
  LucideActivity
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import Navbar from '../../components/layouts/Navbar';

const RoadmapDashboard = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRoadmaps: 0,
    totalProgress: 0,
    activeDays: 0,
    earnedBadges: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.ROADMAP.GET_ALL);
      console.log("Fetched roadmaps:", response.data); // Debug log
      
      // Ensure response.data is an array
      const roadmapsData = Array.isArray(response.data) ? response.data : [];
      setRoadmaps(roadmapsData);
      
      // Calculate stats
      const totalProgress = roadmapsData.reduce((sum, roadmap) => sum + (roadmap.progress || 0), 0);
      const avgProgress = roadmapsData.length > 0 ? totalProgress / roadmapsData.length : 0;
      
      setStats({
        totalRoadmaps: roadmapsData.length,
        totalProgress: Math.round(avgProgress),
        activeDays: calculateActiveDays(roadmapsData),
        earnedBadges: calculateEarnedBadges(roadmapsData)
      });
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      setRoadmaps([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateActiveDays = (roadmaps) => {
    return roadmaps.reduce((days, roadmap) => {
      return days + Math.floor((roadmap.progress || 0) / 10);
    }, 0);
  };

  const calculateEarnedBadges = (roadmaps) => {
    return roadmaps.reduce((badges, roadmap) => {
      return badges + Math.floor((roadmap.progress || 0) / 25);
    }, 0);
  };

  const handleDeleteRoadmap = async (id) => {
    if (!window.confirm("Are you sure you want to delete this roadmap?")) return;
    try {
      await axiosInstance.delete(API_PATHS.ROADMAP.DELETE(id));
      setRoadmaps(prev => prev.filter(r => r._id !== id));
      
      setStats(prev => ({
        ...prev,
        totalRoadmaps: prev.totalRoadmaps - 1
      }));
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      alert('Failed to delete roadmap.');
    }
  };
  
  const handleViewRoadmap = (id) => {
    navigate(`/roadmap-view/${id}`);
  };

  const handleGenerateNew = () => {
    navigate('/roadmapgen');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to get roadmap title/field safely
  const getRoadmapTitle = (roadmap) => {
    // Try different possible field names
    if (roadmap.roadmap && Array.isArray(roadmap.roadmap) && roadmap.roadmap.length > 0) {
      const firstPhase = roadmap.roadmap[0];
      return firstPhase.field || firstPhase.title || 'Learning Roadmap';
    }
    if (roadmap.title) return roadmap.title;
    if (roadmap.name) return roadmap.name;
    return 'Learning Roadmap';
  };

  // Helper function to get roadmap description
  const getRoadmapDescription = (roadmap) => {
    if (roadmap.roadmap && Array.isArray(roadmap.roadmap) && roadmap.roadmap.length > 0) {
      const firstPhase = roadmap.roadmap[0];
      if (firstPhase.steps && firstPhase.steps.length > 0) {
        return firstPhase.steps[0]?.description || firstPhase.description || 'No description available';
      }
      return firstPhase.description || 'No description available';
    }
    return 'No description available';
  };

  // Helper function to get phases count
  const getPhasesCount = (roadmap) => {
    if (roadmap.roadmap && Array.isArray(roadmap.roadmap)) {
      return roadmap.roadmap.length;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="md:flex md:justify-between md:items-center md:mb-8 mb-8">
          <h1 className="text-3xl font-bold">Your Learning Dashboard</h1>
          <button 
            onClick={handleGenerateNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-600 hover:bg-blue-700/30 cursor-pointer rounded-lg mt-4 md:mt-0"
          >
            <LucidePlus className="w-5 h-5" />
            Generate New
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400">Roadmaps</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalRoadmaps}</h3>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <LucideFileText className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Total learning paths</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400">Avg. Progress</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalProgress}%</h3>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <LucideTrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Across all roadmaps</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400">Active Days</p>
                <h3 className="text-2xl font-bold mt-1">{stats.activeDays}</h3>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <LucideActivity className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Last 30 days</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400">Badges</p>
                <h3 className="text-2xl font-bold mt-1">{stats.earnedBadges}</h3>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <LucideAward className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Achievements earned</p>
          </div>
        </div>
        
        {roadmaps.length === 0 ? (
          <div className="text-center py-12">
            <LucideFileText className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">No roadmaps generated yet.</p>
            <button 
              onClick={handleGenerateNew}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Generate Your First Roadmap
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6">Your Roadmaps</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roadmaps.map((roadmap) => (
                <div
                  key={roadmap._id}
                  className="relative group bg-gray-600/20 rounded-xl p-6 border border-gray-500 hover:border-blue-500 transition-colors flex flex-col"
                >
                  {/* Progress bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700 rounded-t-xl overflow-hidden">
                    <div 
                      className="h-1 bg-blue-500 transition-all duration-300"
                      style={{ width: `${roadmap.progress || 0}%` }}
                    ></div>
                  </div>

                  {/* Trash icon visible on hover */}
                  <button
                    onClick={() => handleDeleteRoadmap(roadmap._id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-red-600/80 hover:bg-red-700 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Delete roadmap"
                  >
                    <LucideTrash className="w-4 h-4" />
                  </button>

                  <div className="flex justify-between items-start mb-4 mt-2">
                    <h3 className="text-xl font-semibold truncate pr-8">
                      {getRoadmapTitle(roadmap)}
                    </h3>
                    <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                      {getPhasesCount(roadmap)} phases
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-400 text-sm mb-4">
                    <LucideCalendar className="w-4 h-4 mr-1" />
                    Created {formatDate(roadmap.createdAt)}
                  </div>
                  
                  <div className="mb-4 flex-grow">
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {getRoadmapDescription(roadmap)}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-400">
                      Progress: <span className="text-blue-400 font-medium">{roadmap.progress || 0}%</span>
                    </div>
                    {(roadmap.progress || 0) > 0 && (
                      <div className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded-full">
                        Active
                      </div>
                    )}
                  </div>
                  
                  <div className='mt-auto pt-4'>
                    <button
                      onClick={() => handleViewRoadmap(roadmap._id)}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
                    >
                      <LucideEye className="w-4 h-4" />
                      View Roadmap
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoadmapDashboard;