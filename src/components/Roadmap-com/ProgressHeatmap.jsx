import React from 'react';
import { motion } from 'framer-motion';
import { 
  LucideCalendar, 
  LucideFlame,
  LucideTrendingUp,
  LucideInfo
} from 'lucide-react';

const ProgressHeatmap = ({ progressData, roadmap, completedSteps }) => {
  // Generate last 30 days
  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const last30Days = getLast30Days();

  // Find activity for each day
  const getActivityForDate = (date) => {
    if (!progressData || !Array.isArray(progressData)) return 0;
    
    const dateStr = date.toDateString();
    const entry = progressData.find(d => {
      if (!d || !d.date) return false;
      const entryDate = new Date(d.date);
      return entryDate.toDateString() === dateStr;
    });
    return entry ? (entry.count || 0) : 0;
  };

  // Calculate current streak
  const calculateCurrentStreak = () => {
    if (!progressData || !Array.isArray(progressData)) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date();
      checkDate.setDate(today.getDate() - i);
      const activity = getActivityForDate(checkDate);
      
      if (activity > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Calculate total activities
  const calculateTotalActivities = () => {
    if (!progressData || !Array.isArray(progressData)) return 0;
    return progressData.reduce((total, day) => total + (day.count || 0), 0);
  };

  // Get color based on activity level
  const getColor = (count) => {
    if (count === 0) return 'bg-gray-800 hover:bg-gray-700';
    if (count <= 2) return 'bg-green-900 hover:bg-green-800';
    if (count <= 4) return 'bg-green-700 hover:bg-green-600';
    if (count <= 6) return 'bg-green-500 hover:bg-green-400';
    return 'bg-green-300 hover:bg-green-200';
  };

  const totalActivities = calculateTotalActivities();
  const currentStreak = calculateCurrentStreak();
  const longestStreak = Math.max(currentStreak, 7); // Simple calculation

  return (
    <div className="bg-black p-6 rounded-xl border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <LucideCalendar className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Learning Activity Heatmap</h3>
          <p className="text-gray-400 text-sm">Track your daily learning progress</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-white">{totalActivities}</div>
          <div className="text-xs text-gray-400">Total Activities</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-white">{currentStreak}</div>
          <div className="text-xs text-gray-400">Current Streak</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-white">{longestStreak}</div>
          <div className="text-xs text-gray-400">Longest Streak</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <div className="text-sm text-gray-400">Last 30 days</div>
          <div className="text-sm text-gray-400">
            {new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {/* Day labels */}
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <div key={idx} className="text-center text-xs text-gray-500 font-medium">
              {day}
            </div>
          ))}
          
          {/* Heatmap squares */}
          {last30Days.map((date, index) => {
            const activity = getActivityForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className={`h-5 rounded cursor-pointer ${getColor(activity)} ${
                  isToday ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-black' : ''
                }`}
                title={`${date.toLocaleDateString()}: ${activity} step${activity !== 1 ? 's' : ''} completed`}
              />
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400">Less</div>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-gray-800 rounded" title="No activity"></div>
          <div className="w-4 h-4 bg-green-900 rounded" title="1-2 activities"></div>
          <div className="w-4 h-4 bg-green-700 rounded" title="3-4 activities"></div>
          <div className="w-4 h-4 bg-green-500 rounded" title="5-6 activities"></div>
          <div className="w-4 h-4 bg-green-300 rounded" title="7+ activities"></div>
        </div>
        <div className="text-xs text-gray-400">More</div>
      </div>

      {/* Tip */}
      <div className="mt-6 p-3 bg-blue-900/20 rounded-lg border border-blue-800/30">
        <div className="flex items-start gap-2">
          <LucideInfo className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-300">
            Complete steps each day to build your streak and fill the heatmap!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressHeatmap;