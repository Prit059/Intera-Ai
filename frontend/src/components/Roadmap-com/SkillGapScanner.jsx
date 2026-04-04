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
  LucideSparkles,
  LucideYoutube,
  LucideBookMarked,
  LucideBriefcase,
  LucideFileText,
  LucideClock as LucideClockIcon,
  LucideAward,
  LucideMap,
  LucideShare2,
  LucidePrinter
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
  const [activeTab, setActiveTab] = useState('gaps');
  const [studyPlanView, setStudyPlanView] = useState('weekly');
  const [selectedSkillForResources, setSelectedSkillForResources] = useState(null);

  // ============ ENHANCED SKILL DATABASE WITH RESOURCES ============
  const skillResourceDatabase = {
    'javascript': {
      youtube: ['https://youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUocPVUl', 'https://youtube.com/watch?v=W6NZfCO5SIk'],
      udemy: ['https://udemy.com/course/the-complete-javascript-course'],
      coursera: ['https://coursera.org/learn/javascript'],
      docs: ['https://developer.mozilla.org/en-US/docs/Web/JavaScript'],
      blogs: ['https://javascript.info', 'https://dev.to/t/javascript'],
      salary: '$80,000 - $130,000',
      demand: 'Very High',
      projects: ['Build a weather app', 'Create a to-do list', 'Build a calculator'],
      interviewQuestions: ['Explain closures', 'What is event loop?', 'Difference between == and ===']
    },
    'react': {
      youtube: ['https://youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUocPVUl', 'https://youtube.com/watch?v=bMknfKXIFA8'],
      udemy: ['https://udemy.com/course/react-the-complete-guide'],
      coursera: ['https://coursera.org/learn/react-basics'],
      docs: ['https://react.dev/learn'],
      blogs: ['https://dev.to/t/react', 'https://react-status.com'],
      salary: '$90,000 - $150,000',
      demand: 'Very High',
      projects: ['E-commerce frontend', 'Task manager app', 'Portfolio website'],
      interviewQuestions: ['What is JSX?', 'Explain hooks', 'What is virtual DOM?']
    },
    'node': {
      youtube: ['https://youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUocPVUl', 'https://youtube.com/watch?v=Oe421EPjeBE'],
      udemy: ['https://udemy.com/course/nodejs-the-complete-guide'],
      coursera: ['https://coursera.org/learn/nodejs'],
      docs: ['https://nodejs.org/en/docs/guides'],
      blogs: ['https://dev.to/t/node', 'https://nodesource.com/blog'],
      salary: '$85,000 - $140,000',
      demand: 'High',
      projects: ['REST API', 'Chat application', 'Blog platform'],
      interviewQuestions: ['What is event loop?', 'Explain streams', 'What is middleware?']
    },
    'python': {
      youtube: ['https://youtube.com/playlist?list=PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU', 'https://youtube.com/watch?v=_uQrJ0TkZlc'],
      udemy: ['https://udemy.com/course/100-days-of-code'],
      coursera: ['https://coursera.org/learn/python'],
      docs: ['https://docs.python.org/3/tutorial'],
      blogs: ['https://realpython.com', 'https://pythoninsider.blogspot.com'],
      salary: '$95,000 - $160,000',
      demand: 'Very High',
      projects: ['Data analysis tool', 'Web scraper', 'Automation script'],
      interviewQuestions: ['What are decorators?', 'Explain list comprehension', 'What is GIL?']
    },
    'html': {
      youtube: ['https://youtube.com/watch?v=qz0aGYrrlhU', 'https://youtube.com/watch?v=UB1O30fR-EE'],
      udemy: ['https://udemy.com/course/html5-css3-basics'],
      coursera: ['https://coursera.org/learn/html'],
      docs: ['https://developer.mozilla.org/en-US/docs/Web/HTML'],
      blogs: ['https://dev.to/t/html', 'https://css-tricks.com'],
      salary: '$60,000 - $90,000',
      demand: 'High',
      projects: ['Personal website', 'Landing page', 'Email template'],
      interviewQuestions: ['What are semantic elements?', 'Explain HTML5 features', 'What is accessibility?']
    },
    'css': {
      youtube: ['https://youtube.com/watch?v=1Rs2ND1ryYc', 'https://youtube.com/watch?v=OXGznpKZ_sA'],
      udemy: ['https://udemy.com/course/css-the-complete-guide'],
      coursera: ['https://coursera.org/learn/css'],
      docs: ['https://developer.mozilla.org/en-US/docs/Web/CSS'],
      blogs: ['https://css-tricks.com', 'https://dev.to/t/css'],
      salary: '$65,000 - $100,000',
      demand: 'High',
      projects: ['Responsive portfolio', 'Animation gallery', 'Dashboard UI'],
      interviewQuestions: ['What is Flexbox?', 'Explain Grid', 'What are pseudo-classes?']
    },
    'sql': {
      youtube: ['https://youtube.com/watch?v=HXV3zeQKqGY', 'https://youtube.com/watch?v=7S_tz1z_5bA'],
      udemy: ['https://udemy.com/course/the-complete-sql-bootcamp'],
      coursera: ['https://coursera.org/learn/sql-for-data-science'],
      docs: ['https://www.w3schools.com/sql'],
      blogs: ['https://dev.to/t/sql', 'https://learnsql.com/blog'],
      salary: '$75,000 - $125,000',
      demand: 'Very High',
      projects: ['Database design', 'Query optimization', 'Data analysis'],
      interviewQuestions: ['What is JOIN?', 'Explain normalization', 'What is indexing?']
    },
    'mongodb': {
      youtube: ['https://youtube.com/watch?v=ofme2o29ngU', 'https://youtube.com/watch?v=Www6cTUymCY'],
      udemy: ['https://udemy.com/course/mongodb-the-complete-developers-guide'],
      coursera: ['https://coursera.org/learn/mongodb'],
      docs: ['https://docs.mongodb.com'],
      blogs: ['https://dev.to/t/mongodb', 'https://mongodb.com/blog'],
      salary: '$80,000 - $135,000',
      demand: 'High',
      projects: ['CRUD API', 'E-commerce database', 'Analytics dashboard'],
      interviewQuestions: ['What is sharding?', 'Explain aggregation', 'What is indexing?']
    },
    'aws': {
      youtube: ['https://youtube.com/playlist?list=PL5TdZ_U8L2XH9x5XqN9qZQZFZGd5qVqVq'],
      udemy: ['https://udemy.com/course/aws-certified-solutions-architect'],
      coursera: ['https://coursera.org/learn/aws-fundamentals'],
      docs: ['https://aws.amazon.com/documentation'],
      blogs: ['https://dev.to/t/aws', 'https://aws.amazon.com/blogs'],
      salary: '$100,000 - $180,000',
      demand: 'Very High',
      projects: ['Serverless app', 'S3 bucket setup', 'Lambda function'],
      interviewQuestions: ['What is EC2?', 'Explain S3', 'What is IAM?']
    },
    'docker': {
      youtube: ['https://youtube.com/watch?v=3c-iBn73dDE', 'https://youtube.com/watch?v=fqMOX6JJhGo'],
      udemy: ['https://udemy.com/course/docker-mastery'],
      coursera: ['https://coursera.org/learn/docker'],
      docs: ['https://docs.docker.com'],
      blogs: ['https://dev.to/t/docker', 'https://docker.com/blog'],
      salary: '$90,000 - $155,000',
      demand: 'High',
      projects: ['Containerize app', 'Docker compose setup', 'Multi-container app'],
      interviewQuestions: ['What is container?', 'Explain Dockerfile', 'What is orchestration?']
    }
  };

  // ============ DEFAULT RESOURCES FOR ANY SKILL ============
  const getDefaultResources = (skillName) => {
    return {
      youtube: [`https://youtube.com/results?search_query=${encodeURIComponent(skillName)} tutorial`],
      udemy: [`https://udemy.com/courses/search/?q=${encodeURIComponent(skillName)}`],
      coursera: [`https://coursera.org/search?query=${encodeURIComponent(skillName)}`],
      docs: [`https://www.google.com/search?q=${encodeURIComponent(skillName)}+documentation`],
      blogs: [`https://dev.to/search?q=${encodeURIComponent(skillName)}`],
      salary: '$70,000 - $120,000',
      demand: 'Medium',
      projects: [`Build a project using ${skillName}`, `Integrate ${skillName} into your app`],
      interviewQuestions: [`What is ${skillName}?`, `How to use ${skillName} effectively?`]
    };
  };

  const getSkillResources = (skillName) => {
    const lowerName = skillName.toLowerCase();
    for (const [key, resources] of Object.entries(skillResourceDatabase)) {
      if (lowerName.includes(key) || key.includes(lowerName)) {
        return resources;
      }
    }
    return getDefaultResources(skillName);
  };

  // Skill categories
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

  // Extract skills from roadmap
  const extractSkillsFromRoadmap = () => {
    const skills = [];
    if (!roadmap || !Array.isArray(roadmap)) return skills;
    
    roadmap.forEach(phase => {
      const phaseText = `${phase.field || ''} ${phase.title || ''} ${phase.description || ''}`.toLowerCase();
      
      phase.steps?.forEach(step => {
        const stepText = `${step.stepTitle || ''} ${step.description || ''}`.toLowerCase();
        
        Object.entries(skillCategories).forEach(([category, categorySkills]) => {
          categorySkills.forEach(skill => {
            if (stepText.includes(skill) || phaseText.includes(skill)) {
              skills.push({
                name: skill,
                category: category,
                level: getSkillLevelFromText(stepText),
                importance: getSkillImportance(step.stepTitle, step.description),
                resources: getSkillResources(skill)
              });
            }
          });
        });
      });
    });

    const uniqueSkills = Array.from(
      new Map(skills.map(item => [item.name, item])).values()
    ).sort((a, b) => b.importance - a.importance);

    return uniqueSkills;
  };

  const getSkillLevelFromText = (text) => {
    if (text.includes('advanced') || text.includes('expert') || text.includes('senior')) return 'advanced';
    if (text.includes('intermediate') || text.includes('professional')) return 'intermediate';
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

  // ============ ENHANCED AI ANALYSIS ============
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
        // Enhance analysis with resources for each skill gap
        const enhancedAnalysis = {
          ...response.data.analysis,
          skillGaps: response.data.analysis.skillGaps?.map(gap => ({
            ...gap,
            resources: getSkillResources(gap.name),
            detailedStudyPlan: generateDetailedStudyPlan(gap.name, parseInt(timeCommitment))
          })) || []
        };
        setAiAnalysis(enhancedAnalysis);
        setScanComplete(true);
      } else {
        throw new Error(response.data.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error in AI skill gap analysis:', error);
      // Generate enhanced fallback analysis
      const fallbackAnalysis = generateEnhancedFallbackAnalysis();
      setAiAnalysis(fallbackAnalysis);
      setScanComplete(true);
    } finally {
      setLoading(false);
    }
  };

  // ============ GENERATE DETAILED STUDY PLAN ============
  const generateDetailedStudyPlan = (skillName, weeklyHours) => {
    const hoursPerWeek = weeklyHours;
    const estimatedTotalHours = 40; // Average hours to master a skill
    const weeksNeeded = Math.ceil(estimatedTotalHours / hoursPerWeek);
    
    return {
      weeksNeeded,
      hoursPerWeek,
      weeklySchedule: Array.from({ length: Math.min(weeksNeeded, 4) }, (_, i) => ({
        week: i + 1,
        focus: getWeekFocus(skillName, i),
        tasks: getWeekTasks(skillName, i),
        estimatedHours: hoursPerWeek
      })),
      dailyRoutine: {
        weekdays: `${Math.floor(hoursPerWeek / 5)}-${Math.ceil(hoursPerWeek / 5)} hours/day`,
        weekends: `${Math.floor(hoursPerWeek / 2)}-${Math.ceil(hoursPerWeek / 2)} hours/day`
      }
    };
  };

  const getWeekFocus = (skillName, week) => {
    const focuses = {
      0: `Fundamentals of ${skillName}`,
      1: `Core concepts and best practices`,
      2: `Hands-on projects with ${skillName}`,
      3: `Advanced topics and optimization`
    };
    return focuses[week] || `Mastering ${skillName}`;
  };

  const getWeekTasks = (skillName, week) => {
    const tasks = {
      0: [`Watch introductory videos on ${skillName}`, `Set up development environment`, `Complete basic tutorials`],
      1: [`Build small projects`, `Practice coding exercises`, `Join community discussions`],
      2: [`Build a portfolio project`, `Review code from experts`, `Contribute to open source`],
      3: [`Optimize your projects`, `Learn advanced patterns`, `Prepare for interviews`]
    };
    return tasks[week] || [`Continue practicing ${skillName}`, `Build real-world applications`];
  };

  // ============ ENHANCED FALLBACK ANALYSIS ============
  const generateEnhancedFallbackAnalysis = () => {
    const skillGaps = requiredSkills.filter(skill => !userSkills.includes(skill.name));
    
    return {
      skillGaps: skillGaps.map(gap => ({
        name: gap.name,
        category: gap.category,
        priority: gap.importance >= 4 ? 'high' : gap.importance >= 3 ? 'medium' : 'low',
        estimatedTime: `${gap.importance * 2}-${gap.importance * 3} weeks`,
        resources: getSkillResources(gap.name),
        detailedStudyPlan: generateDetailedStudyPlan(gap.name, parseInt(timeCommitment)),
        projectIdeas: getSkillResources(gap.name).projects || [`Build a project using ${gap.name}`],
        interviewQuestions: getSkillResources(gap.name).interviewQuestions || [`What is ${gap.name}?`]
      })),
      matchedSkills: userSkills,
      learningPath: generatePersonalizedLearningPath(skillGaps, parseInt(timeCommitment)),
      readinessPercentage: Math.round((userSkills.length / requiredSkills.length) * 100),
      estimatedTimeline: `${Math.ceil(skillGaps.length * 3)}-${Math.ceil(skillGaps.length * 4)} weeks`,
      recommendations: generatePersonalizedRecommendations(skillGaps, userSkills),
      salaryProjection: calculateSalaryProjection(userSkills, skillGaps),
      marketDemand: analyzeMarketDemand(skillGaps)
    };
  };

  const generatePersonalizedLearningPath = (skillGaps, weeklyHours) => {
    const prioritizedGaps = [...skillGaps].sort((a, b) => b.importance - a.importance);
    const path = [];
    let currentWeek = 1;
    
    for (const gap of prioritizedGaps.slice(0, 4)) {
      const weeksNeeded = Math.ceil(40 / weeklyHours);
      path.push(`Week ${currentWeek}-${currentWeek + weeksNeeded - 1}: Master ${gap.name} (${gap.priority || 'medium'} priority)`);
      currentWeek += weeksNeeded;
    }
    
    path.push(`Week ${currentWeek}-${currentWeek + 2}: Build integrated projects using all skills`);
    path.push(`Week ${currentWeek + 3}-${currentWeek + 4}: Portfolio preparation and interview practice`);
    
    return path;
  };

  const generatePersonalizedRecommendations = (skillGaps, currentSkills) => {
    const recommendations = [];
    
    if (skillGaps.length === 0) {
      recommendations.push("🎉 You have all required skills! Focus on building advanced projects.");
    } else {
      const highPriorityGaps = skillGaps.filter(g => g.importance >= 4);
      if (highPriorityGaps.length > 0) {
        recommendations.push(`🎯 Focus on ${highPriorityGaps[0].name} first - it's essential for your career path.`);
      }
      
      recommendations.push(`📚 Dedicate ${timeCommitment} hours/week consistently for best results.`);
      recommendations.push("💡 Build at least 2-3 portfolio projects showcasing your skills.");
      recommendations.push("🤝 Join developer communities and contribute to open source.");
      recommendations.push("📝 Practice interview questions for each skill you learn.");
    }
    
    if (currentSkills.length > 0) {
      recommendations.push(`✨ Leverage your ${currentSkills[0]} knowledge to learn related technologies faster.`);
    }
    
    return recommendations;
  };

  const calculateSalaryProjection = (currentSkills, skillGaps) => {
    const baseSalary = 70000;
    const skillValue = 5000;
    const currentValue = currentSkills.length * skillValue;
    const potentialValue = (currentSkills.length + skillGaps.length) * skillValue;
    
    return {
      current: baseSalary + currentValue,
      potential: baseSalary + potentialValue,
      increase: potentialValue - currentValue
    };
  };

  const analyzeMarketDemand = (skillGaps) => {
    const highDemandSkills = skillGaps.filter(g => 
      ['javascript', 'react', 'python', 'aws', 'sql'].includes(g.name.toLowerCase())
    );
    
    return {
      highDemandCount: highDemandSkills.length,
      topDemandSkills: highDemandSkills.slice(0, 3).map(s => s.name),
      advice: highDemandSkills.length > 0 
        ? "These skills are in high demand. Prioritize them for better job opportunities."
        : "All skills are valuable. Focus on building a strong foundation."
    };
  };

  const toggleGapExpand = (skillName) => {
    setExpandedGaps(prev => 
      prev.includes(skillName) ? prev.filter(name => name !== skillName) : [...prev, skillName]
    );
  };

  const getSkillIcon = (skillName) => {
    const icons = {
      javascript: '🟨', react: '⚛️', node: '🟢', python: '🐍', html: '🌐',
      css: '🎨', sql: '🗃️', mongodb: '🍃', aws: '☁️', docker: '🐳',
      git: '📝', typescript: '🔷', vue: '🟩', angular: '🔴', java: '☕'
    };
    return icons[skillName] || '💻';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      frontend: '🎨', backend: '⚙️', database: '🗄️', devops: '🚀',
      mobile: '📱', 'ai-ml': '🤖', cloud: '☁️', tools: '🛠️'
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
    return <span className={`px-2 py-1 text-xs rounded-full ${cfg.color} text-white`}>{cfg.text}</span>;
  };

  const exportLearningPlan = () => {
    if (!aiAnalysis) return;
    
    const plan = {
      title: "Personalized Learning Plan",
      generatedAt: new Date().toISOString(),
      roadmapId,
      skillLevel,
      timeCommitment: `${timeCommitment} hours/week`,
      userSkills: userSkills,
      analysis: aiAnalysis,
      salaryProjection: calculateSalaryProjection(userSkills, aiAnalysis.skillGaps || [])
    };
    
    const dataStr = JSON.stringify(plan, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `learning-plan-${Date.now()}.json`);
    linkElement.click();
  };

  const printReport = () => {
    window.print();
  };

  // ============ RENDER AI RESULTS WITH RESOURCES ============
  const renderAIResults = () => {
    if (!aiAnalysis) return null;

    const { skillGaps = [], matchedSkills = [], learningPath = [], readinessPercentage = 0, estimatedTimeline = '', recommendations = [], salaryProjection, marketDemand } = aiAnalysis;

    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            {['gaps', 'resources', 'study-plan', 'market-insights'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab === 'gaps' && 'Skill Gaps'}
                {tab === 'resources' && 'Learning Resources'}
                {tab === 'study-plan' && 'Study Plan'}
                {tab === 'market-insights' && 'Market Insights'}
              </button>
            ))}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-900/20 p-4 rounded-xl border border-green-800/30">
              <div className="flex justify-between">
                <div><div className="text-2xl font-bold text-white">{matchedSkills.length}</div><div className="text-sm text-green-300">Skills You Have</div></div>
                <LucideCheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-red-900/20 p-4 rounded-xl border border-red-800/30">
              <div className="flex justify-between">
                <div><div className="text-2xl font-bold text-white">{skillGaps.length}</div><div className="text-sm text-red-300">Skills to Learn</div></div>
                <LucideTarget className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-800/30">
              <div className="flex justify-between">
                <div><div className="text-2xl font-bold text-white">{readinessPercentage}%</div><div className="text-sm text-blue-300">Readiness Score</div></div>
                <LucideBarChart3 className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-xs text-blue-200/70 mt-2">Est. {estimatedTimeline}</div>
            </div>
            <div className="bg-purple-900/20 p-4 rounded-xl border border-purple-800/30">
              <div className="flex justify-between">
                <div><div className="text-2xl font-bold text-white">${(salaryProjection?.increase || 0).toLocaleString()}</div><div className="text-sm text-purple-300">Salary Increase</div></div>
                <LucideDollarSign className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Active Tab Content */}
          {activeTab === 'gaps' && (
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <LucideLightbulb className="w-6 h-6 text-yellow-400" />
                Detailed Skill Gap Analysis
              </h3>
              <div className="space-y-4">
                {skillGaps.map((gap, index) => (
                  <motion.div key={gap.name || index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
                    <div className="p-4 cursor-pointer hover:bg-gray-700/30 transition-colors" onClick={() => toggleGapExpand(gap.name)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getSkillIcon(gap.name)}</span>
                          <div>
                            <h4 className="font-semibold text-white capitalize">{gap.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400 capitalize">{gap.category || 'general'}</span>
                              {gap.priority && getPriorityBadge(gap.priority)}
                              {gap.estimatedTime && <span className="flex items-center gap-1 text-xs text-gray-400"><LucideClockIcon className="w-3 h-3" />{gap.estimatedTime}</span>}
                            </div>
                          </div>
                        </div>
                        {expandedGaps.includes(gap.name) ? <LucideChevronUp className="w-5 h-5 text-gray-400" /> : <LucideChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedGaps.includes(gap.name) && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-gray-700">
                          <div className="p-4 space-y-4">
                            {gap.resources?.youtube && <div><h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"><LucideYoutube className="w-4 h-4 text-red-400" />YouTube Resources</h5><div className="flex flex-wrap gap-2">{gap.resources.youtube.slice(0, 3).map((url, i) => (<a key={i} href={url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-red-900/30 text-red-300 rounded-full text-sm hover:bg-red-900/50 flex items-center gap-1">{url.length > 40 ? url.substring(0, 40) + '...' : url}<LucideExternalLink className="w-3 h-3" /></a>))}</div></div>}
                            {gap.resources?.udemy && <div><h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"><LucideBookMarked className="w-4 h-4 text-purple-400" />Udemy Courses</h5><div className="flex flex-wrap gap-2">{gap.resources.udemy.slice(0, 2).map((url, i) => (<a key={i} href={url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm flex items-center gap-1">Course {i+1}<LucideExternalLink className="w-3 h-3" /></a>))}</div></div>}
                            {gap.resources?.docs && <div><h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"><LucideFileText className="w-4 h-4 text-blue-400" />Documentation</h5><div className="flex flex-wrap gap-2">{gap.resources.docs.slice(0, 2).map((url, i) => (<a key={i} href={url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm flex items-center gap-1">Docs {i+1}<LucideExternalLink className="w-3 h-3" /></a>))}</div></div>}
                            {gap.projectIdeas && <div><h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"><LucideSparkles className="w-4 h-4 text-green-400" />Project Ideas</h5><div className="space-y-2">{gap.projectIdeas.slice(0, 3).map((idea, i) => (<div key={i} className="flex items-start gap-2"><LucideCheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /><span className="text-green-300 text-sm">{idea}</span></div>))}</div></div>}
                            {gap.interviewQuestions && <div><h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"><LucideBriefcase className="w-4 h-4 text-yellow-400" />Interview Questions</h5><div className="space-y-2">{gap.interviewQuestions.slice(0, 3).map((q, i) => (<div key={i} className="flex items-start gap-2"><LucideTarget className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" /><span className="text-yellow-300 text-sm">{q}</span></div>))}</div></div>}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'study-plan' && (
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><LucideCalendar className="w-6 h-6 text-green-400" />Personalized Study Plan ({timeCommitment} hours/week)</h3>
              <div className="space-y-6">
                {learningPath.map((phase, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center"><span className="text-green-300 font-bold">{index + 1}</span></div>
                    <p className="text-white flex-1">{phase}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
                <h4 className="text-blue-300 font-semibold mb-2">📅 Daily Schedule Recommendation</h4>
                <p className="text-blue-200 text-sm">Weekdays: 3-4 hours/day • Weekends: 6-8 hours/day</p>
                <p className="text-blue-200 text-sm mt-2">💡 Tip: Consistency beats intensity. Study at the same time every day.</p>
              </div>
            </div>
          )}

          {activeTab === 'market-insights' && (
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><LucideBriefcase className="w-6 h-6 text-cyan-400" />Job Market Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-cyan-900/20 rounded-lg border border-cyan-800/30">
                  <h4 className="text-cyan-300 font-semibold mb-2 flex items-center gap-2"><LucideDollarSign className="w-4 h-4" />Salary Projection</h4>
                  <p className="text-2xl font-bold text-white">${(salaryProjection?.potential || 0).toLocaleString()}</p>
                  <p className="text-sm text-cyan-200">Potential salary after mastering all skills</p>
                  <p className="text-xs text-cyan-200/70 mt-2">↑ ${(salaryProjection?.increase || 0).toLocaleString()} increase from current</p>
                </div>
                <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-800/30">
                  <h4 className="text-yellow-300 font-semibold mb-2 flex items-center gap-2"><LucideTrendingUp className="w-4 h-4" />Market Demand</h4>
                  <p className="text-2xl font-bold text-white">{marketDemand?.highDemandCount || 0}</p>
                  <p className="text-sm text-yellow-200">High-demand skills in your gap list</p>
                  <div className="flex flex-wrap gap-1 mt-2">{marketDemand?.topDemandSkills?.map((skill, i) => <span key={i} className="px-2 py-0.5 bg-yellow-900/30 text-yellow-300 rounded-full text-xs">{skill}</span>)}</div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-800/30">
                <h4 className="text-purple-300 font-semibold mb-2">💡 Career Advice</h4>
                <p className="text-purple-200 text-sm">{marketDemand?.advice || "Focus on building a strong portfolio and practicing interview questions."}</p>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-gradient-to-br from-purple-900/20 to-purple-900/5 rounded-xl p-6 border border-purple-800/30">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><LucideSparkles className="w-6 h-6 text-purple-400" />AI Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-3 bg-purple-900/20 rounded-lg border border-purple-800/30">
                  <div className="flex items-start gap-3"><LucideLightbulb className="w-5 h-5 text-purple-300 mt-0.5" /><p className="text-purple-100 text-sm">{rec}</p></div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => { setScanComplete(false); setAiAnalysis(null); }} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white flex items-center justify-center gap-2"><LucideScan className="w-5 h-5" />Start New Analysis</button>
            <button onClick={exportLearningPlan} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white flex items-center justify-center gap-2"><LucideDownload className="w-5 h-5" />Export Learning Plan</button>
            <button onClick={printReport} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex items-center justify-center gap-2"><LucidePrinter className="w-5 h-5" />Print Report</button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="bg-black p-6 rounded-xl border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"><LucideBrain className="w-6 h-6 text-white" /></div>
        <div><h2 className="text-2xl font-bold text-white">AI Skill Gap Analyzer</h2><p className="text-gray-400 text-sm">Get personalized learning resources and study plan based on your skills</p></div>
      </div>

      {!scanComplete ? (
        <>
          {/* Time Commitment */}
          <div className="mb-6"><h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><LucideClockIcon className="w-5 h-5 text-green-400" />Weekly Time Commitment</h3>
            <div className="grid grid-cols-5 gap-2">{['5', '10', '15', '20', '30+'].map(hours => (<button key={hours} onClick={() => setTimeCommitment(hours === '30+' ? '30' : hours)} className={`p-3 rounded-lg border text-center transition-all ${timeCommitment === (hours === '30+' ? '30' : hours) ? 'bg-green-900/30 border-green-500 text-green-300' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'}`}><div className="font-medium">{hours}</div><div className="text-xs text-gray-400 mt-1">hours/week</div></button>))}</div>
          </div>

          {/* Skill Level */}
          <div className="mb-6"><h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><LucideTrendingUp className="w-5 h-5 text-blue-400" />Your Current Skill Level</h3>
            <div className="grid grid-cols-4 gap-2">{['beginner', 'intermediate', 'advanced', 'all'].map(level => (<button key={level} onClick={() => setSkillLevel(level)} className={`p-3 rounded-lg border text-center transition-all ${skillLevel === level ? 'bg-blue-900/30 border-blue-500 text-blue-300' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'}`}><div className="capitalize">{level}</div></button>))}</div>
          </div>

          {/* Category Filter */}
          <div className="mb-6"><h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><LucideFilter className="w-5 h-5 text-purple-400" />Filter by Category</h3>
            <div className="flex flex-wrap gap-2">{['all', ...Object.keys(skillCategories)].map(category => (<button key={category} onClick={() => setSelectedCategory(category)} className={`px-3 py-2 rounded-full border text-sm flex items-center gap-2 ${selectedCategory === category ? 'bg-purple-900/30 border-purple-500 text-purple-300' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'}`}>{getCategoryIcon(category)} <span className="capitalize">{category}</span></button>))}</div>
          </div>

          {/* Search */}
          <div className="mb-6"><div className="relative"><LucideSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" /><input type="text" placeholder="Search skills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" /></div></div>

          {/* Skills Grid */}
          <div className="mb-8"><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold text-white">Select Your Skills ({userSkills.length} selected)</h3><div className="text-sm text-gray-400">{filteredSkills.length} skills found</div></div>
            {filteredSkills.length === 0 ? (<div className="text-center py-8 bg-gray-800/30 rounded-lg"><LucideSearch className="w-12 h-12 text-gray-500 mx-auto mb-3" /><p className="text-gray-400">No skills found. Try a different filter.</p></div>) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2">
                {filteredSkills.map((skill) => (<div key={skill.name} onClick={() => handleSkillToggle(skill)} className={`p-4 rounded-lg border cursor-pointer transition-all ${userSkills.includes(skill.name) ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}>
                  <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span className="text-2xl">{getSkillIcon(skill.name)}</span><div><div className="font-semibold text-white capitalize">{skill.name}</div><div className="flex items-center gap-1 text-xs text-gray-400"><span>{getCategoryIcon(skill.category)}</span><span className="capitalize">{skill.category}</span></div></div></div>{userSkills.includes(skill.name) && <LucideCheckCircle className="w-5 h-5 text-green-400" />}</div>
                  <div className="flex items-center justify-between mt-3"><span className={`px-2 py-1 text-xs rounded-full ${skill.level === 'beginner' ? 'bg-green-900/30 text-green-300' : skill.level === 'intermediate' ? 'bg-yellow-900/30 text-yellow-300' : 'bg-red-900/30 text-red-300'}`}>{skill.level}</span><div className="flex items-center gap-1">{[...Array(skill.importance)].map((_, i) => (<LucideStar key={i} className="w-3 h-3 text-yellow-500 fill-current" />))}</div></div>
                </div>))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-4"><button onClick={() => setUserSkills(requiredSkills.map(s => s.name))} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white flex items-center justify-center gap-2"><LucideZap className="w-5 h-5" />Select All</button><button onClick={() => setUserSkills([])} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white flex items-center justify-center gap-2">Clear All</button></div>

          {/* Analyze Button */}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={performAIAnalysis} disabled={loading || userSkills.length === 0} className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg text-white font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>Analyzing with AI...</> : <><LucideScan className="w-6 h-6" />Generate AI Analysis<LucideRocket className="w-6 h-6" /></>}
          </motion.button>
        </>
      ) : renderAIResults()}
    </div>
  );
};

export default SkillGapScanner;