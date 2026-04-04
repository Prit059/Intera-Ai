import React, { useState, useEffect, useRef } from 'react';
import { 
  LucideCalendar, 
  LucideAward, 
  LucideClock,
  LucideTrendingUp,
  LucideGitBranch,
  LucideUsers,
  LucideStar
} from 'lucide-react';

const NextGenDashboard = () => {
  const [activeTab, setActiveTab] = useState('progress');
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [currentTimeframe, setCurrentTimeframe] = useState(6); // months

  // Sample data - replace with your actual data
  useEffect(() => {
    // This would come from your API
    const sampleData = [
      {
        _id: '1',
        title: 'Full Stack Web Development',
        createdAt: new Date('2023-01-15'),
        progress: 65,
        phases: [
          { title: 'HTML/CSS Fundamentals', completed: true, duration: 1 },
          { title: 'JavaScript Mastery', completed: true, duration: 2 },
          { title: 'React & Redux', completed: true, duration: 2 },
          { title: 'Node.js & Express', completed: false, duration: 2 },
          { title: 'Database Management', completed: false, duration: 1 },
          { title: 'Deployment', completed: false, duration: 1 },
        ],
        heatmapData: generateHeatmapData(),
        badges: [
          { name: 'HTML Expert', icon: '🛠️', earned: true },
          { name: 'JS Ninja', icon: '🥷', earned: true },
          { name: 'React Champion', icon: '⚛️', earned: true },
          { name: 'Backend Master', icon: '⚡', earned: false },
          { name: 'Database Guru', icon: '📊', earned: false },
          { name: 'Deployment Pro', icon: '🚀', earned: false },
        ]
      },
      {
        _id: '2',
        title: 'Data Science',
        createdAt: new Date('2023-03-10'),
        progress: 30,
        phases: [
          { title: 'Python Fundamentals', completed: true, duration: 1 },
          { title: 'Statistics & Probability', completed: true, duration: 2 },
          { title: 'Data Visualization', completed: false, duration: 2 },
          { title: 'Machine Learning', completed: false, duration: 3 },
        ],
        heatmapData: generateHeatmapData(),
        badges: [
          { name: 'Pythonista', icon: '🐍', earned: true },
          { name: 'Statistician', icon: '📈', earned: true },
          { name: 'Visualization Expert', icon: '📊', earned: false },
          { name: 'ML Engineer', icon: '🤖', earned: false },
        ]
      }
    ];
    
    setRoadmaps(sampleData);
    setSelectedRoadmap(sampleData[0]);
  }, []);

  // Generate sample heatmap data
  function generateHeatmapData() {
    const data = [];
    const today = new Date();
    
    for (let i = 90; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 5) // Random activity count
      });
    }
    
    return data;
  }

  // Render heatmap cells
  const renderHeatmap = () => {
    if (!selectedRoadmap) return null;
    
    const weeks = [];
    let week = [];
    
    selectedRoadmap.heatmapData.forEach((day, index) => {
      week.push(
        <div 
          key={day.date}
          className="h-4 w-4 rounded-sm m-0.5"
          style={{ 
            backgroundColor: day.count > 0 ? 
              `rgba(59, 130, 246, ${0.2 + (day.count / 5) * 0.8})` : 
              'rgba(55, 65, 81, 0.1)'
          }}
          title={`${day.date}: ${day.count} activities`}
        />
      );
      
      if ((index + 1) % 7 === 0 || index === selectedRoadmap.heatmapData.length - 1) {
        weeks.push(
          <div key={index} className="flex">
            {week}
          </div>
        );
        week = [];
      }
    });
    
    return (
      <div className="p-6 bg-gray-800 rounded-xl">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <LucideCalendar className="w-5 h-5 mr-2" />
          Learning Activity Heatmap
        </h3>
        <div className="flex">
          <div className="flex flex-col mr-1 justify-between text-xs text-gray-500">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>
          <div>
            {weeks}
          </div>
        </div>
        <div className="flex items-center mt-4 text-xs text-gray-400">
          <span className="mr-4">Less</span>
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div 
                key={level}
                className="h-3 w-3 rounded-sm"
                style={{ 
                  backgroundColor: level > 0 ? 
                    `rgba(59, 130, 246, ${0.2 + (level / 5) * 0.8})` : 
                    'rgba(55, 65, 81, 0.1)'
                }}
              />
            ))}
          </div>
          <span className="ml-4">More</span>
        </div>
      </div>
    );
  };

  // Render timeline
  const renderTimeline = () => {
    if (!selectedRoadmap) return null;
    
    const totalMonths = selectedRoadmap.phases.reduce((acc, phase) => acc + phase.duration, 0);
    const monthWidth = 100 / currentTimeframe;
    
    return (
      <div className="p-6 bg-gray-800 rounded-xl mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <LucideClock className="w-5 h-5 mr-2" />
            Learning Timeline
          </h3>
          <div className="flex space-x-2">
            {[3, 6, 9, 12].map(months => (
              <button
                key={months}
                onClick={() => setCurrentTimeframe(months)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  currentTimeframe === months 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {months} months
              </button>
            ))}
          </div>
        </div>
        
        <div className="relative h-32">
          {/* Timeline bar */}
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-600 transform -translate-y-1/2 rounded-full"></div>
          
          {/* Timeline progress */}
          <div 
            className="absolute top-1/2 left-0 h-2 bg-blue-500 transform -translate-y-1/2 rounded-full"
            style={{ width: `${(selectedRoadmap.progress / 100) * 100}%` }}
          ></div>
          
          {/* Phases */}
          {selectedRoadmap.phases.map((phase, index) => {
            const phaseStart = selectedRoadmap.phases
              .slice(0, index)
              .reduce((acc, p) => acc + p.duration, 0);
            
            const position = (phaseStart / totalMonths) * 100;
            const width = (phase.duration / totalMonths) * 100;
            
            return (
              <div
                key={index}
                className="absolute top-1/2 transform -translate-y-1/2"
                style={{ left: `${position}%`, width: `${width}%` }}
              >
                <div className="flex flex-col items-center">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                    phase.completed ? 'bg-green-500' : 'bg-gray-500'
                  }`}>
                    {phase.completed ? '✓' : index + 1}
                  </div>
                  <div className="text-xs mt-2 text-center w-24">
                    {phase.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render badges
  const renderBadges = () => {
    if (!selectedRoadmap) return null;
    
    return (
      <div className="p-6 bg-gray-800 rounded-xl mt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <LucideAward className="w-5 h-5 mr-2" />
          Earned Badges
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {selectedRoadmap.badges.map((badge, index) => (
            <div 
              key={index}
              className={`flex flex-col items-center p-4 rounded-lg ${
                badge.earned 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                  : 'bg-gray-700 opacity-50'
              }`}
            >
              <div className="text-2xl mb-2">{badge.icon}</div>
              <div className="text-sm text-center font-medium">
                {badge.name}
              </div>
              <div className="text-xs mt-1">
                {badge.earned ? 'Earned' : 'Locked'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render stats
  const renderStats = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gray-800 rounded-xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400">Roadmaps</p>
              <h3 className="text-2xl font-bold mt-1">{roadmaps.length}</h3>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <LucideGitBranch className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Total learning paths</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400">Progress</p>
              <h3 className="text-2xl font-bold mt-1">{selectedRoadmap?.progress || 0}%</h3>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <LucideTrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Current roadmap</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400">Active Days</p>
              <h3 className="text-2xl font-bold mt-1">
                {selectedRoadmap?.heatmapData.filter(d => d.count > 0).length || 0}
              </h3>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <LucideCalendar className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Last 90 days</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400">Badges</p>
              <h3 className="text-2xl font-bold mt-1">
                {selectedRoadmap?.badges.filter(b => b.earned).length || 0}
              </h3>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <LucideStar className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Achievements earned</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Learning Dashboard</h1>
          <p className="text-gray-400 mt-2">Track your progress and achievements</p>
        </header>
        
        {/* Roadmap selector */}
        <div className="flex overflow-x-auto pb-2 mb-6">
          {roadmaps.map(roadmap => (
            <button
              key={roadmap._id}
              onClick={() => setSelectedRoadmap(roadmap)}
              className={`px-4 py-2 mr-2 rounded-lg whitespace-nowrap ${
                selectedRoadmap?._id === roadmap._id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {roadmap.title}
            </button>
          ))}
        </div>
        
        {/* Stats */}
        {renderStats()}
        
        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'progress'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Progress
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'timeline'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'badges'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Badges
          </button>
        </div>
        
        {/* Content */}
        {activeTab === 'progress' && renderHeatmap()}
        {activeTab === 'timeline' && renderTimeline()}
        {activeTab === 'badges' && renderBadges()}
      </div>
    </div>
  );
};

export default NextGenDashboard;