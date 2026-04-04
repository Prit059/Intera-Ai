import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import {
  LucideAward,
  LucideTrophy,
  LucideStar,
  LucideLock,
  LucideZap,
  LucideCalendar,
  LucideTarget,
  LucideCheckCircle,
  LucideFlame,
  LucideCrown,
  LucideRocket
} from 'lucide-react';

const BadgesDisplay = ({ roadmapId }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    fetchBadges();
  }, [roadmapId]);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(API_PATHS.ROADMAP.GET_BADGES(roadmapId));
      
      // Ensure we have an array and handle NaN values
      const fetchedBadges = Array.isArray(response.data) ? response.data : [];
      
      // Filter out invalid badges and calculate stats safely
      const validBadges = fetchedBadges.filter(badge => 
        badge && badge.name && badge.criteria
      ).map(badge => ({
        ...badge,
        // Ensure earned is boolean
        earned: !!badge.earned,
        // Add safe progress calculation
        progress: badge.progress || {
          current: badge.earned ? badge.criteria?.threshold || 1 : 0,
          target: badge.criteria?.threshold || 1,
          percentage: badge.earned ? 100 : 0
        }
      }));
      
      setBadges(validBadges);
    } catch (error) {
      console.error('Error fetching badges:', error);
      setError('Failed to load badges. Please try again.');
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badge) => {
    if (!badge.earned) return <LucideLock className="w-8 h-8 text-gray-500" />;
    
    const iconMap = {
      'first steps': LucideRocket,
      'consistent learner': LucideCalendar,
      'halfway there': LucideTarget,
      'roadmap master': LucideCrown,
      'weekly warrior': LucideFlame,
      'phase champion': LucideTrophy,
      'completionist': LucideTrophy,
      'fast learner': LucideZap,
      'consistent': LucideCalendar,
    };

    const IconComponent = iconMap[badge.name.toLowerCase()] || LucideAward;
    return <IconComponent className="w-8 h-8" />;
  };

  const getBadgeColor = (badge) => {
    if (!badge.earned) {
      return {
        gradient: 'from-gray-800 to-gray-700',
        text: 'text-gray-500',
        border: 'border-gray-700'
      };
    }
    
    const colorMap = {
      'first steps': { gradient: 'from-blue-600 to-blue-800', text: 'text-blue-200', border: 'border-blue-500' },
      'consistent learner': { gradient: 'from-green-600 to-green-800', text: 'text-green-200', border: 'border-green-500' },
      'halfway there': { gradient: 'from-yellow-600 to-yellow-800', text: 'text-yellow-200', border: 'border-yellow-500' },
      'roadmap master': { gradient: 'from-purple-600 to-purple-800', text: 'text-purple-200', border: 'border-purple-500' },
      'weekly warrior': { gradient: 'from-red-600 to-red-800', text: 'text-red-200', border: 'border-red-500' },
      'phase champion': { gradient: 'from-pink-600 to-pink-800', text: 'text-pink-200', border: 'border-pink-500' },
      'completionist': { gradient: 'from-yellow-600 to-yellow-800', text: 'text-yellow-200', border: 'border-yellow-500' },
      'fast learner': { gradient: 'from-blue-600 to-blue-800', text: 'text-blue-200', border: 'border-blue-500' },
      'consistent': { gradient: 'from-green-600 to-green-800', text: 'text-green-200', border: 'border-green-500' },
    };

    return colorMap[badge.name.toLowerCase()] || {
      gradient: 'from-purple-600 to-purple-800',
      text: 'text-purple-200',
      border: 'border-purple-500'
    };
  };

  const getEarnedCount = () => {
    return badges.filter(b => b.earned).length;
  };

  const getCompletionPercentage = () => {
    const earned = getEarnedCount();
    const total = badges.length;
    
    if (total === 0) return 0;
    return Math.round((earned / total) * 100);
  };

  const calculateProgress = (badge) => {
    if (!badge.progress) {
      return badge.earned ? 100 : 0;
    }
    
    const { current = 0, target = 1, percentage = 0 } = badge.progress;
    
    if (badge.earned) return 100;
    if (target === 0) return 0;
    
    return Math.min(100, Math.round((current / target) * 100));
  };

  if (loading) {
    return (
      <div className="bg-black p-6 rounded-xl border border-gray-800">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-800 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black p-6 rounded-xl border border-gray-800">
        <div className="text-center py-8">
          <LucideLock className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">{error}</p>
          <button
            onClick={fetchBadges}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const earnedCount = getEarnedCount();
  const completionPercentage = getCompletionPercentage();

  return (
    <div className="bg-black p-6 rounded-xl border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-500/20 rounded-lg">
          <LucideAward className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Achievement Badges</h3>
          <p className="text-gray-400 text-sm">
            Earn badges as you progress through your learning journey
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-white">
            {earnedCount}
          </div>
          <div className="text-xs text-gray-400">Earned</div>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-white">
            {badges.length}
          </div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-white">
            {completionPercentage}%
          </div>
          <div className="text-xs text-gray-400">Completed</div>
        </div>
      </div>

      {/* Badges Grid */}
      {badges.length === 0 ? (
        <div className="text-center py-8 bg-gray-800/30 rounded-lg">
          <LucideAward className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No badges available yet</p>
          <p className="text-gray-500 text-sm mt-2">Start learning to earn badges!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {badges.map((badge, index) => {
              const colors = getBadgeColor(badge);
              const progress = calculateProgress(badge);
              
              return (
                <motion.div
                  key={badge._id || index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedBadge(badge)}
                  className={`aspect-square rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer border-2 ${
                    badge.earned 
                      ? `${colors.border} shadow-lg shadow-yellow-500/20` 
                      : 'border-gray-700'
                  } bg-gradient-to-br ${colors.gradient} relative overflow-hidden`}
                >
                  {/* Progress ring for unearned badges */}
                  {!badge.earned && progress > 0 && (
                    <div className="absolute inset-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="50%"
                          cy="50%"
                          r="45%"
                          fill="transparent"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="4"
                        />
                        <circle
                          cx="50%"
                          cy="50%"
                          r="45%"
                          fill="transparent"
                          stroke="rgba(59, 130, 246, 0.8)"
                          strokeWidth="4"
                          strokeDasharray={`${progress * 2.83} 283`}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  )}

                  <div className="mb-2 z-10">
                    {getBadgeIcon(badge)}
                  </div>
                  
                  <h4 className={`font-semibold text-sm mb-1 z-10 ${colors.text}`}>
                    {badge.name}
                  </h4>
                  
                  {badge.earned ? (
                    <div className="flex items-center gap-1 z-10">
                      <LucideStar className="w-4 h-4 text-yellow-300" />
                      <span className="text-xs text-yellow-200">Earned</span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-300 mt-1 z-10">
                      {progress}% complete
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Progress Bar */}
          {badges.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Collection Progress</span>
                <span>{earnedCount}/{badges.length}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${completionPercentage}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBadge(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`bg-gradient-to-br ${getBadgeColor(selectedBadge).gradient} rounded-xl p-6 max-w-md w-full border-2 ${
              selectedBadge.earned ? getBadgeColor(selectedBadge).border : 'border-gray-700'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="inline-block p-4 rounded-full bg-black/20 mb-4">
                {getBadgeIcon(selectedBadge)}
              </div>
              
              <h3 className="text-2xl font-bold mb-2">
                {selectedBadge.name}
              </h3>
              
              <p className="text-sm mb-4">
                {selectedBadge.description || 'Earn this badge by completing challenges'}
              </p>
              
              <div className="bg-black p-3 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">How to Earn</h4>
                <p className="text-sm">
                  {selectedBadge.criteria 
                    ? `Complete ${selectedBadge.criteria.threshold} ${selectedBadge.criteria.type}`
                    : 'Complete specific challenges'
                  }
                </p>
                
                {!selectedBadge.earned && selectedBadge.progress && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{selectedBadge.progress.current}/{selectedBadge.progress.target}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${calculateProgress(selectedBadge)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedBadge.earned && selectedBadge.earnedAt && (
                <p className="text-sm mb-4">
                  <LucideCheckCircle className="inline w-4 h-4 text-green-400 mr-1" />
                  Earned on {new Date(selectedBadge.earnedAt).toLocaleDateString()}
                </p>
              )}
              
              <button
                onClick={() => setSelectedBadge(null)}
                className="mt-4 px-4 py-2 bg-black/50 hover:bg-black/70 rounded-lg text-white"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BadgesDisplay;