import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoadmapDisplay from '../../components/RoadmapDisplay';
import ProgressHeatmap from '../../components/Roadmap-com/ProgressHeatmap';
import SkillGapScanner from '../../components/Roadmap-com/SkillGapScanner';
import BadgesDisplay from '../../components/Roadmap-com/BadgesDisplay';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import Navbar from '../../components/layouts/Navbar';
import { 
  LucideArrowLeft, 
  LucideCalendar, 
  LucideAward,
  LucideScan,
  LucideFileText,
  LucideBarChart3,
  LucideTarget,
  LucideFlame
} from 'lucide-react';

const RoadmapView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [flowchart, setFlowchart] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [badges, setBadges] = useState([]);
  const [activeTab, setActiveTab] = useState('roadmap');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roadmapName, setRoadmapName] = useState('');

  useEffect(() => {
    fetchRoadmap();
    fetchBadges();
  }, [id]);

  const fetchRoadmap = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.ROADMAP.GET_ONE(id));
      
      const roadmapData = response.data.roadmap;
      
      setRoadmap(roadmapData.roadmap || []);
      setCompanies(roadmapData.companies || []);
      setFlowchart(roadmapData.flowchart || []);
      
      // ✅ FIX: Ensure userProgress always has required structure
      const progressData = response.data.userProgress || {
        completedSteps: [],
        dailyProgress: [],
        completedPhases: [],
        progress: 0,
        lastUpdated: new Date()
      };
      setUserProgress(progressData);
      
      // Extract roadmap name
      let name = 'Learning Roadmap';
      if (roadmapData.roadmap && roadmapData.roadmap.length > 0) {
        name = roadmapData.roadmap[0]?.field || roadmapData.roadmap[0]?.title || name;
      }
      setRoadmapName(name);
      
    } catch (error) {
      setError('Failed to load roadmap');
      console.error('Error fetching roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBadges = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.ROADMAP.GET_BADGES(id));
      setBadges(response.data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  // ✅ FIXED: Update step completion
  const updateStepCompletion = async (stepId, completed) => {
    try {
      console.log("Updating step:", stepId, "completed:", completed);
      
      await axiosInstance.post(API_PATHS.ROADMAP.UPDATE_PROGRESS, {
        roadmapId: id,
        stepId,
        completed
      });
      
      // Refresh data
      await fetchRoadmap();
      await fetchBadges();
      
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Failed to update progress. Please try again.');
    }
  };

  // Calculate total steps
  const getTotalSteps = () => {
    if (!roadmap) return 0;
    return roadmap.reduce((total, phase) => total + (phase.steps?.length || 0), 0);
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!userProgress || !roadmap) return 0;
    
    const totalSteps = getTotalSteps();
    const completedSteps = userProgress.completedSteps?.length || 0;
    
    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <button
            onClick={() => navigate('/roadmapdashboard')}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <LucideArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-900/30 text-blue-300 px-4 py-2 rounded-full">
              <LucideTarget className="w-4 h-4" />
              <span className="font-medium">{calculateProgress()}% Complete</span>
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-700/20 border border-blue-600 rounded-xl">
              <LucideFileText className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {roadmapName}
            </h1>
          </div>
          
          {/* Stats */}
          <div className="flex justify-center gap-6 text-white mt-4">
            {roadmap && (
              <div className="flex items-center gap-2">
                <LucideBarChart3 className="w-4 h-4" />
                <span className="bg-gray-700/20 border border-gray-600 px-2 py-1 rounded text-sm">
                  {roadmap.length} Phases
                </span>
              </div>
            )}
            
            {userProgress && (
              <div className="flex items-center gap-2">
                <LucideFlame className="w-4 h-4 text-orange-400" />
                <span className="bg-gray-700/20 border border-gray-600 px-2 py-1 rounded text-sm">
                  {userProgress.completedSteps?.length || 0} Steps Completed
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center gap-2 px-6 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'roadmap'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <LucideFileText className="w-4 h-4" />
            Roadmap
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex items-center gap-2 px-6 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'progress'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <LucideCalendar className="w-4 h-4" />
            Progress Heatmap
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex items-center gap-2 px-6 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'skills'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <LucideScan className="w-4 h-4" />
            Skill Gap Analysis
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex items-center gap-2 px-6 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'badges'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <LucideAward className="w-4 h-4" />
            Badges {badges.length > 0 && `(${badges.length})`}
          </button>
        </div>

        {/* Content */}
        <div className="min-h-[500px]">
          {activeTab === 'roadmap' && (
            <>
              {/* Progress Summary */}
              {userProgress && (
                <div className="mb-6 bg-gray-800/20 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Your Learning Progress</h3>
                      <p className="text-gray-400 text-sm">
                        {userProgress.completedSteps?.length || 0} of {getTotalSteps()} steps completed
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{calculateProgress()}%</div>
                        <div className="text-xs text-gray-400">Overall</div>
                      </div>
                      <div className="h-10 w-48 bg-gray-700/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-700/20 border border-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${calculateProgress()}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

        {/* Quick Stats */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-700/20 rounded-lg p-4 border border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Total Steps</p>
                <p className="text-white font-semibold">{getTotalSteps()}</p>
              </div>
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <span className="text-blue-400 text-sm">✓</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700/20 rounded-lg p-4 border border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Completed Steps</p>
                <p className="text-white font-semibold">
                  {userProgress?.completedSteps?.length || 0}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-500/30 rounded-full flex items-center justify-center">
                <span className="text-green-400 text-sm">✓</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700/20 rounded-lg p-4 border border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Earned Badges</p>
                <p className="text-white font-semibold text-sm">
                  {badges.filter(b => b.earned).length} / {badges.length}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center">
                <span className="text-purple-400 text-sm">🏆</span>
              </div>
            </div>
          </div>
        </div>

              {/* Roadmap Display - ✅ PASS ALL PROPS */}
              <RoadmapDisplay 
                roadmap={roadmap} 
                companies={companies} 
                flowchart={flowchart}
                userProgress={userProgress}
                onStepCompletionChange={updateStepCompletion} // ✅ CRITICAL
              />
            </>
          )}
          
          {activeTab === 'progress' && userProgress && (
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-6">Learning Activity Heatmap</h3>
              <ProgressHeatmap 
                progressData={userProgress.dailyProgress || []} 
                roadmap={roadmap}
                completedSteps={userProgress.completedSteps || []}
              />
            </div>
          )}
          
          {activeTab === 'skills' && roadmap && (
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-6">Skill Gap Analysis</h3>
              <SkillGapScanner roadmap={roadmap} roadmapId={id} />
            </div>
          )}
          
          {activeTab === 'badges' && (
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-6">Your Achievements</h3>
              <BadgesDisplay badges={badges} roadmapId={id} />
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default RoadmapView;