import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import {
  LucideScan,
  LucideCheckCircle,
  LucideXCircle,
  LucideBrain,
  LucideTarget,
  LucideZap,
  LucideTrendingUp,
  LucideClock,
  LucideDollarSign,
  LucideGraduationCap,
  LucideLightbulb,
  LucideBarChart3,
  LucideSearch,
  LucideFilter,
  LucideStar,
  LucideBookOpen,
  LucideRocket,
  LucideAlertCircle,
  LucideCalendar,
  LucideChevronDown,
  LucideChevronUp,
  LucideDownload,
  LucideExternalLink,
  LucideLayers,
  LucideSparkles
} from 'lucide-react';

const SkillGapScanner = ({ roadmap, roadmapId }) => {
  const [userSkills, setUserSkills] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedGaps, setExpandedGaps] = useState([]);
  const [timeCommitment, setTimeCommitment] = useState('20');

  // Advanced skill categories
  const skillCategories = {
    'frontend': ['javascript', 'react', 'vue', 'angular', 'typescript', 'html', 'css', 'sass', 'tailwind'],
    'backend': ['node', 'python', 'java', 'php', 'ruby', 'go', 'express', 'django', 'spring'],
    'database': ['sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'firebase'],
    'devops': ['aws', 'docker', 'kubernetes', 'jenkins', 'git', 'ci/cd', 'nginx'],
    'mobile': ['react native', 'flutter', 'ios', 'android', 'kotlin', 'swift'],
    'ai-ml': ['python', 'tensorflow', 'pytorch', 'machine learning', 'deep learning', 'nlp'],
    'cloud': ['aws', 'azure', 'google cloud', 'serverless', 'lambda', 's3'],
    'tools': ['git', 'vscode', 'figma', 'postman', 'jira', 'docker']
  };

  // Extract skills intelligently from roadmap
  const extractSkillsFromRoadmap = () => {
    const skills = [];
    
    if (!roadmap || !Array.isArray(roadmap)) return skills;
    
    roadmap.forEach(phase => {
      // Extract from phase title and description
      const phaseText = `${phase.field || ''} ${phase.title || ''} ${phase.description || ''}`.toLowerCase();
      
      phase.steps?.forEach(step => {
        const stepText = `${step.stepTitle || ''} ${step.description || ''}`.toLowerCase();
        
        // Check all categories
        Object.entries(skillCategories).forEach(([category, categorySkills]) => {
          categorySkills.forEach(skill => {
            if (stepText.includes(skill) || phaseText.includes(skill)) {
              skills.push({
                name: skill,
                category: category,
                level: getSkillLevelFromText(stepText),
                importance: getSkillImportance(step.stepTitle, step.description)
              });
            }
          });
        });
      });
    });

    // Remove duplicates and sort by importance
    const uniqueSkills = Array.from(
      new Map(skills.map(item => [item.name, item])).values()
    ).sort((a, b) => b.importance - a.importance);

    return uniqueSkills;
  };

  const getSkillLevelFromText = (text) => {
    if (text.includes('advanced') || text.includes('expert') || text.includes('senior')) 
      return 'advanced';
    if (text.includes('intermediate') || text.includes('professional')) 
      return 'intermediate';
    return 'beginner';
  };

  const getSkillImportance = (title, description) => {
    let importance = 1;
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('essential') || text.includes('must') || text.includes('core')) importance = 5;
    else if (text.includes('important') || text.includes('required')) importance = 4;
    else if (text.includes('recommended') || text.includes('good to have')) importance = 3;
    else if (text.includes('optional') || text.includes('bonus')) importance = 2;
    
    return importance;
  };

  const requiredSkills = extractSkillsFromRoadmap();

  // Filter skills based on search and category
  const filteredSkills = requiredSkills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    const matchesLevel = skillLevel === 'all' || skill.level === skillLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleSkillToggle = (skill) => {
    if (userSkills.includes(skill.name)) {
      setUserSkills(userSkills.filter(s => s !== skill.name));
    } else {
      setUserSkills([...userSkills, skill.name]);
    }
  };

  const performAIAnalysis = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.ROADMAP.SKILL_GAP_AI, {
        roadmapId,
        userSkills,
        roadmapSkills: requiredSkills,
        skillLevel,
        timeCommitment
      });

      if (response.data.success) {
        setAiAnalysis(response.data.analysis);
        setScanComplete(true);
      } else {
        throw new Error(response.data.message || 'Analysis failed');
      }

    } catch (error) {
      console.error('Error in AI skill gap analysis:', error);
      // Fallback to basic analysis
      try {
        const response = await axiosInstance.post(API_PATHS.ROADMAP.SKILL_GAP_SCAN, {
          roadmapId,
          userSkills
        });
        
        // Format basic analysis to match AI analysis structure
        const basicData = response.data;
        setAiAnalysis({
          skillGaps: basicData.skillGaps || requiredSkills.filter(skill => !userSkills.includes(skill.name)),
          matchedSkills: basicData.matchedSkills || userSkills,
          learningPath: [
            "Week 1-2: Focus on core missing skills",
            "Week 3-4: Build foundational projects",
            "Week 5-8: Advanced concepts and real-world applications",
            "Week 9-12: Portfolio development and interview prep"
          ],
          readinessPercentage: basicData.skillGaps ? 
            Math.round(((requiredSkills.length - basicData.skillGaps.length) / requiredSkills.length) * 100) : 0,
          estimatedTimeline: '12-16 weeks',
          recommendations: [
            "Focus on one skill at a time",
            "Build practical projects",
            "Join online communities",
            "Practice regularly"
          ]
        });
        setScanComplete(true);
      } catch (fallbackError) {
        console.error('Fallback analysis also failed:', fallbackError);
        alert('Analysis failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleGapExpand = (skillName) => {
    setExpandedGaps(prev => 
      prev.includes(skillName) 
        ? prev.filter(name => name !== skillName)
        : [...prev, skillName]
    );
  };

  const exportLearningPlan = () => {
    if (!aiAnalysis) return;
    
    const plan = {
      title: "Personalized Learning Plan",
      generatedAt: new Date().toISOString(),
      roadmapId,
      skillLevel,
      timeCommitment: `${timeCommitment} hours/week`,
      analysis: aiAnalysis
    };
    
    const dataStr = JSON.stringify(plan, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `learning-plan-${roadmapId}-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getSkillIcon = (skillName) => {
    const icons = {
      javascript: '🟨',
      react: '⚛️',
      node: '🟢',
      python: '🐍',
      html: '🌐',
      css: '🎨',
      sql: '🗃️',
      mongodb: '🍃',
      aws: '☁️',
      docker: '🐳',
      kubernetes: '⚓',
      git: '📝',
      typescript: '🔷',
      vue: '🟩',
      angular: '🔴',
      java: '☕',
      php: '🐘',
      go: '🐹',
      ruby: '💎',
      express: '🚀',
      django: '🐍',
      spring: '🌱',
      tensorflow: '🧠',
      pytorch: '🔥',
      flutter: '🦋',
      'react native': '📱',
      firebase: '🔥',
      azure: '🔵',
      'google cloud': '🔴'
    };
    
    return icons[skillName] || '💻';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      frontend: '🎨',
      backend: '⚙️',
      database: '🗄️',
      devops: '🚀',
      mobile: '📱',
      'ai-ml': '🤖',
      cloud: '☁️',
      tools: '🛠️'
    };
    return icons[category] || '📊';
  };

  const getPriorityBadge = (priority) => {
    const config = {
      high: { color: 'bg-red-500', text: 'High Priority' },
      medium: { color: 'bg-yellow-500', text: 'Medium Priority' },
      low: { color: 'bg-green-500', text: 'Low Priority' }
    };
    
    const cfg = config[priority?.toLowerCase()] || config.medium;
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${cfg.color} text-white`}>
        {cfg.text}
      </span>
    );
  };

  const renderAIResults = () => {
    if (!aiAnalysis) return null;

    const { skillGaps = [], matchedSkills = [], learningPath = [], readinessPercentage = 0, estimatedTimeline = '', recommendations = [] } = aiAnalysis;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-8"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-900/20 to-green-900/5 p-4 rounded-xl border border-green-800/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{matchedSkills.length}</div>
                  <div className="text-sm text-green-300">Skills You Have</div>
                </div>
                <LucideCheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-xs text-green-200/70 mt-2">
                {matchedSkills.length} out of {matchedSkills.length + skillGaps.length} total skills
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-red-900/20 to-red-900/5 p-4 rounded-xl border border-red-800/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{skillGaps.length}</div>
                  <div className="text-sm text-red-300">Skills to Learn</div>
                </div>
                <LucideTarget className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-xs text-red-200/70 mt-2">
                Focus on these to become job-ready
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-blue-900/20 to-blue-900/5 p-4 rounded-xl border border-blue-800/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{readinessPercentage}%</div>
                  <div className="text-sm text-blue-300">Readiness Score</div>
                </div>
                <LucideBarChart3 className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-xs text-blue-200/70 mt-2">
                Estimated timeline: {estimatedTimeline}
              </div>
            </motion.div>
          </div>

          {/* Learning Path */}
          {learningPath.length > 0 && (
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <LucideLayers className="w-6 h-6 text-purple-400" />
                Your Learning Path
              </h3>
              <div className="space-y-4">
                {learningPath.map((phase, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center">
                      <span className="text-purple-300 font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white">{phase}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Gaps Analysis */}
          {skillGaps.length > 0 && (
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <LucideLightbulb className="w-6 h-6 text-yellow-400" />
                Detailed Skill Gap Analysis
              </h3>
              <div className="space-y-4">
                {skillGaps.map((gap, index) => (
                  <motion.div
                    key={gap.name || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700"
                  >
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-700/30 transition-colors"
                      onClick={() => toggleGapExpand(gap.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getSkillIcon(gap.name)}</span>
                          <div>
                            <h4 className="font-semibold text-white capitalize">{gap.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400 capitalize">{gap.category || 'general'}</span>
                              {gap.priority && getPriorityBadge(gap.priority)}
                              {gap.estimatedTime && (
                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                  <LucideClock className="w-3 h-3" />
                                  {gap.estimatedTime}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {expandedGaps.includes(gap.name) ? 
                            <LucideChevronUp className="w-5 h-5 text-gray-400" /> : 
                            <LucideChevronDown className="w-5 h-5 text-gray-400" />
                          }
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedGaps.includes(gap.name) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-700"
                        >
                          <div className="p-4 space-y-4">
                            {/* Resources */}
                            {gap.resources && gap.resources.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                  <LucideBookOpen className="w-4 h-4" />
                                  Recommended Resources
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {gap.resources.slice(0, 4).map((resource, i) => (
                                    <span key={i} className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm">
                                      {resource}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Project Ideas */}
                            {gap.projectIdeas && gap.projectIdeas.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                  <LucideSparkles className="w-4 h-4" />
                                  Project Ideas
                                </h5>
                                <div className="space-y-2">
                                  {gap.projectIdeas.slice(0, 3).map((idea, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                      <LucideCheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                      <span className="text-green-300 text-sm">{idea}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-gradient-to-br from-purple-900/20 to-purple-900/5 rounded-xl p-6 border border-purple-800/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <LucideSparkles className="w-6 h-6 text-purple-400" />
                AI Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-purple-900/20 rounded-lg border border-purple-800/30"
                  >
                    <div className="flex items-start gap-3">
                      <LucideLightbulb className="w-5 h-5 text-purple-300 mt-0.5 flex-shrink-0" />
                      <p className="text-purple-100 text-sm">{rec}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setScanComplete(false);
                setAiAnalysis(null);
              }}
              className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white flex items-center justify-center gap-2"
            >
              <LucideScan className="w-5 h-5" />
              Start New Analysis
            </button>
            
            <button
              onClick={exportLearningPlan}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg text-white flex items-center justify-center gap-2"
            >
              <LucideDownload className="w-5 h-5" />
              Export Learning Plan
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="bg-black p-6 rounded-xl border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
          <LucideBrain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">AI Skill Gap Analyzer</h2>
          <p className="text-gray-400 text-sm">
            Get personalized recommendations based on your current skills and career goals
          </p>
        </div>
      </div>

      {!scanComplete ? (
        <>
          {/* Time Commitment */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <LucideClock className="w-5 h-5 text-green-400" />
              Weekly Time Commitment
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {['5', '10', '15', '20', '30+'].map(hours => (
                <button
                  key={hours}
                  onClick={() => setTimeCommitment(hours === '30+' ? '30' : hours)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    timeCommitment === (hours === '30+' ? '30' : hours)
                      ? 'bg-green-900/30 border-green-500 text-green-300'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="font-medium">{hours}</div>
                  <div className="text-xs text-gray-400 mt-1">hours/week</div>
                </button>
              ))}
            </div>
          </div>

          {/* Skill Level Selector */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <LucideTrendingUp className="w-5 h-5 text-blue-400" />
              Your Current Skill Level
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {['beginner', 'intermediate', 'advanced', 'all'].map(level => (
                <button
                  key={level}
                  onClick={() => setSkillLevel(level)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    skillLevel === level
                      ? 'bg-blue-900/30 border-blue-500 text-blue-300'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="capitalize">{level}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <LucideFilter className="w-5 h-5 text-purple-400" />
              Filter by Category
            </h3>
            <div className="flex flex-wrap gap-2">
              {['all', ...Object.keys(skillCategories)].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-2 rounded-full border text-sm flex items-center gap-2 ${
                    selectedCategory === category
                      ? 'bg-purple-900/30 border-purple-500 text-purple-300'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {getCategoryIcon(category)} 
                  <span className="capitalize">{category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <LucideSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Skills Grid */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                Select Your Skills ({userSkills.length} selected)
              </h3>
              <div className="text-sm text-gray-400">
                {filteredSkills.length} skills found
              </div>
            </div>

            {filteredSkills.length === 0 ? (
              <div className="text-center py-8 bg-gray-800/30 rounded-lg">
                <LucideSearch className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No skills found. Try a different filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2">
                <AnimatePresence>
                  {filteredSkills.map((skill) => (
                    <motion.div
                      key={skill.name}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div
                        onClick={() => handleSkillToggle(skill)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          userSkills.includes(skill.name)
                            ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500'
                            : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getSkillIcon(skill.name)}</span>
                            <div>
                              <div className="font-semibold text-white capitalize">
                                {skill.name}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <span>{getCategoryIcon(skill.category)}</span>
                                <span className="capitalize">{skill.category}</span>
                              </div>
                            </div>
                          </div>
                          {userSkills.includes(skill.name) && (
                            <LucideCheckCircle className="w-5 h-5 text-green-400" />
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            skill.level === 'beginner' ? 'bg-green-900/30 text-green-300' :
                            skill.level === 'intermediate' ? 'bg-yellow-900/30 text-yellow-300' :
                            'bg-red-900/30 text-red-300'
                          }`}>
                            {skill.level}
                          </span>
                          <div className="flex items-center gap-1">
                            {[...Array(skill.importance)].map((_, i) => (
                              <LucideStar key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setUserSkills(requiredSkills.map(s => s.name))}
              className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white flex items-center justify-center gap-2"
            >
              <LucideZap className="w-5 h-5" />
              Select All
            </button>
            
            <button
              onClick={() => setUserSkills([])}
              className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white flex items-center justify-center gap-2"
            >
              Clear All
            </button>
          </div>

          {/* Analyze Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={performAIAnalysis}
            disabled={loading || userSkills.length === 0}
            className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg text-white font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                Analyzing with AI...
              </>
            ) : (
              <>
                <LucideScan className="w-6 h-6" />
                <span>Generate AI Analysis</span>
                <LucideRocket className="w-6 h-6" />
              </>
            )}
          </motion.button>
        </>
      ) : (
        renderAIResults()
      )}
    </div>
  );
};

export default SkillGapScanner;