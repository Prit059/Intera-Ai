const axios = require("axios");
const Roadmap = require("../Models/Roadmap");
const UserProgress = require("../Models/UserProgress");
const { UserBadge, Badge } = require("../Models/Badge");
const SkillAnalysis = require("../Models/SkillAnalysis");
const mongoose = require("mongoose");

// Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

// ============ ROADMAP GENERATOR ============
const roadmapgenerator = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    let response;
    try {
      response = await axios.post(
        GROQ_API_URL,
        {
          model: GROQ_MODEL,
          messages: [
            {
              role: "system",
              content: `You are an expert career advisor and technical educator. Create DETAILED, COMPREHENSIVE learning roadmaps.

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON - no explanations, no markdown
2. Each roadmap MUST have 4-6 phases with 3-5 steps per phase
3. Include REAL resources (actual URLs, real books, real platforms)
4. Focus on 2025-26 trending technologies
5. Include SPECIFIC project ideas with descriptions
6. Add EMERGING trends in the field
7. Include REAL companies hiring for these skills

The JSON structure MUST be EXACTLY as specified.`
            },
            {
              role: "user",
              content: `Create a DETAILED learning roadmap for: "${prompt}"

Follow this EXACT JSON structure with COMPLETE data:

{
  "roadmap": [
    {
      "field": "Specific field name",
      "title": "Phase 1: Foundation",
      "estimatedTime": "X weeks/months",
      "description": "DETAILED description",
      "skillsToLearn": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
      "projects": ["Project 1: Description", "Project 2: Description"],
      "steps": [
        {
          "stepTitle": "Step 1: [Specific topic]",
          "description": "DETAILED step description",
          "resources": {
            "youtube": ["https://youtube.com/..."],
            "coursera": ["https://coursera.org/..."],
            "officialDocs": ["https://developer.mozilla.org/..."],
            "books": ["Book Title by Author"],
            "practicePlatforms": ["https://leetcode.com"]
          },
          "tools": ["Tool 1", "Tool 2"],
          "jobReadySkills": ["Skill A", "Skill B"]
        }
      ]
    }
  ],
  "companies": ["Company 1: What they look for"],
  "flowchart": ["Month 1-2: Learn Fundamentals →"],
  "emergingTrends": ["Trend 1: Explanation"],
  "salaryRange": "Entry Level: $X - $Y",
  "jobRoles": ["Role 1", "Role 2"]
}`
            }
          ],
          temperature: 0.7,
          max_tokens: 8000
        },
        {
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          timeout: 45000
        }
      );
    } catch (apiError) {
      console.error("❌ Groq API error:", apiError.message);
      return generateDetailedFallback(req, res);
    }

    const rawText = response.data.choices[0].message.content;

    let parsed;
    try {
      let cleanedText = rawText.replace(/^```json\s*|\s*```$/g, "").trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) cleanedText = jsonMatch[0];
      parsed = JSON.parse(cleanedText);
    } catch (err) {
      console.error("❌ JSON parse error:", err.message);
      return generateDetailedFallback(req, res);
    }

    const enhancedRoadmap = enhanceRoadmapStructure(parsed, prompt);

    const roadmapWithIds = {
      roadmap: (enhancedRoadmap.roadmap || []).map(phase => ({
        ...phase,
        _id: new mongoose.Types.ObjectId(),
        steps: (phase.steps || []).map(step => ({
          ...step,
          _id: new mongoose.Types.ObjectId(),
          completed: false
        }))
      })),
      companies: enhancedRoadmap.companies || [],
      flowchart: enhancedRoadmap.flowchart || [],
      emergingTrends: enhancedRoadmap.emergingTrends || [],
      salaryRange: enhancedRoadmap.salaryRange || "$70,000 - $150,000",
      jobRoles: enhancedRoadmap.jobRoles || []
    };

    const roadmapDoc = new Roadmap({
      ...roadmapWithIds,
      userId: req.user._id,
      createdAt: new Date()
    });

    await roadmapDoc.save();

    const userProgress = new UserProgress({
      userId: req.user._id,
      roadmapId: roadmapDoc._id,
      dailyProgress: [],
      completedSteps: [],
      completedPhases: [],
      lastUpdated: new Date()
    });
    
    await userProgress.save();

    res.status(201).json({
      success: true,
      _id: roadmapDoc._id,
      ...roadmapWithIds,
      progress: 0,
      message: "Roadmap generated successfully!"
    });

  } catch (err) {
    console.error("❌ Roadmap generation error:", err);
    return generateDetailedFallback(req, res);
  }
};

// ============ HELPER FUNCTIONS FOR ROADMAP ============
const enhanceRoadmapStructure = (parsed, prompt) => {
  const field = extractFieldFromPrompt(prompt);
  
  if (!parsed.roadmap || !Array.isArray(parsed.roadmap) || parsed.roadmap.length === 0) {
    parsed.roadmap = getDefaultRoadmapPhases(field);
  }

  parsed.roadmap = parsed.roadmap.map((phase, index) => ({
    field: phase.field || field,
    title: phase.title || `Phase ${index + 1}: ${getDefaultPhaseTitle(index, field)}`,
    estimatedTime: phase.estimatedTime || getDefaultEstimatedTime(index),
    description: phase.description || getDefaultDescription(index, field),
    skillsToLearn: phase.skillsToLearn || getDefaultSkills(index, field),
    projects: phase.projects || getDefaultProjects(index, field),
    steps: (phase.steps || []).map((step, stepIndex) => ({
      stepTitle: step.stepTitle || `Step ${stepIndex + 1}: ${getDefaultStepTitle(stepIndex)}`,
      description: step.description || getDefaultStepDescription(stepIndex, field),
      resources: {
        youtube: step.resources?.youtube || getDefaultYoutubeResources(field),
        coursera: step.resources?.coursera || getDefaultCourseraResources(field),
        officialDocs: step.resources?.officialDocs || getDefaultDocs(field),
        books: step.resources?.books || getDefaultBooks(field),
        practicePlatforms: step.resources?.practicePlatforms || getDefaultPlatforms(field)
      },
      tools: step.tools || getDefaultTools(index, stepIndex, field),
      jobReadySkills: step.jobReadySkills || getDefaultJobSkills(index, stepIndex, field)
    }))
  }));

  parsed.companies = parsed.companies || getDefaultCompanies(field);
  parsed.flowchart = parsed.flowchart || getDefaultFlowchart(field);
  parsed.emergingTrends = parsed.emergingTrends || getDefaultTrends(field);
  parsed.salaryRange = parsed.salaryRange || getDefaultSalary(field);
  parsed.jobRoles = parsed.jobRoles || getDefaultJobRoles(field);

  return parsed;
};

const extractFieldFromPrompt = (prompt) => {
  const match = prompt.match(/(?:for|in|about)\s+([^,.]+)/i);
  return match ? match[1].trim() : "Technology";
};

const getDefaultPhaseTitle = (index, field) => {
  const titles = [
    "Fundamentals & Core Concepts",
    "Essential Tools & Technologies",
    "Intermediate Skills & Projects",
    "Advanced Topics & Specialization",
    "Real-World Applications",
    "Job Preparation & Portfolio"
  ];
  return titles[index] || `Phase ${index + 1}`;
};

const getDefaultRoadmapPhases = (field) => {
  if (field.toLowerCase().includes('full stack') || field.toLowerCase().includes('mern')) {
    return [
      {
        field: field,
        title: "Frontend Fundamentals",
        estimatedTime: "4-6 weeks",
        description: "Master HTML5, CSS3, and JavaScript ES6+",
        skillsToLearn: ["HTML5", "CSS3", "JavaScript ES6+", "Responsive Design", "Git Basics"],
        projects: ["Personal Portfolio Website", "Responsive Landing Page"],
        steps: []
      },
      {
        field: field,
        title: "Frontend Framework - React.js",
        estimatedTime: "6-8 weeks",
        description: "Learn React.js - components, hooks, state management",
        skillsToLearn: ["React Components", "Hooks", "React Router", "State Management", "API Integration"],
        projects: ["E-commerce Store Frontend", "Task Management App"],
        steps: []
      },
      {
        field: field,
        title: "Backend with Node.js & Express",
        estimatedTime: "6-8 weeks",
        description: "Build scalable backend APIs",
        skillsToLearn: ["Node.js", "Express.js", "RESTful APIs", "MongoDB", "JWT Authentication"],
        projects: ["Blog API", "E-commerce Backend"],
        steps: []
      },
      {
        field: field,
        title: "Full Stack Integration",
        estimatedTime: "4-6 weeks",
        description: "Connect frontend with backend",
        skillsToLearn: ["Full Stack Integration", "Deployment", "WebSockets", "Testing", "Performance"],
        projects: ["Social Media Clone", "Real-time Chat Application"],
        steps: []
      }
    ];
  }
  
  return [
    {
      field: field,
      title: "Fundamentals",
      estimatedTime: "4-6 weeks",
      description: `Master the core concepts of ${field}`,
      skillsToLearn: ["Core Concept 1", "Core Concept 2", "Core Concept 3", "Tool 1", "Tool 2"],
      projects: ["Basic Project 1", "Basic Project 2"],
      steps: []
    },
    {
      field: field,
      title: "Intermediate Concepts",
      estimatedTime: "6-8 weeks",
      description: `Deep dive into advanced ${field} topics`,
      skillsToLearn: ["Advanced Topic 1", "Advanced Topic 2", "Framework/Library"],
      projects: ["Intermediate Project"],
      steps: []
    }
  ];
};

const getDefaultEstimatedTime = (index) => {
  const times = ["4-6 weeks", "6-8 weeks", "8-10 weeks", "6-8 weeks", "4-6 weeks"];
  return times[index] || "4-6 weeks";
};

const getDefaultDescription = (index, field) => {
  const desc = [
    `Build a strong foundation in ${field} by mastering essential concepts and tools.`,
    `Deepen your understanding of ${field} with intermediate topics.`,
    `Master advanced ${field} techniques used by industry professionals.`,
    `Apply your skills to real-world ${field} projects.`,
    `Prepare for ${field} job interviews and build your portfolio.`
  ];
  return desc[index] || `Learn ${field} concepts and best practices.`;
};

const getDefaultSkills = (index, field) => {
  if (field.toLowerCase().includes('full stack') || field.toLowerCase().includes('mern')) {
    const skills = [
      ["HTML5", "CSS3", "JavaScript ES6", "Git", "Command Line"],
      ["React", "React Hooks", "React Router", "State Management", "API Calls"],
      ["Node.js", "Express.js", "MongoDB", "REST APIs", "JWT Authentication"],
      ["Full Stack Integration", "Deployment", "WebSockets", "Testing", "Performance"]
    ];
    return skills[index] || ["JavaScript", "React", "Node.js", "MongoDB", "Git"];
  }
  return [`${field} Concept 1`, `${field} Concept 2`, `Tool 1`, `Tool 2`, `Best Practice`];
};

const getDefaultProjects = (index, field) => {
  return [
    "Personal Portfolio Website",
    "Task Management Application",
    "E-commerce Platform",
    "Real-time Chat Application",
    "API Integration Project"
  ].slice(0, 2);
};

const getDefaultStepTitle = (index) => {
  const steps = [
    "Getting Started with Fundamentals",
    "Hands-on Practice",
    "Building Your First Project",
    "Advanced Techniques",
    "Optimization & Best Practices"
  ];
  return steps[index] || `Step ${index + 1}`;
};

const getDefaultStepDescription = (index, field) => {
  return `Learn and practice ${field} concepts through hands-on exercises.`;
};

const getDefaultYoutubeResources = (field) => {
  return [
    "https://youtube.com/@freecodecamp",
    "https://youtube.com/@TraversyMedia",
    "https://youtube.com/@WebDevSimplified"
  ];
};

const getDefaultCourseraResources = (field) => {
  return [
    "https://coursera.org/learn/learning-how-to-learn",
    "https://coursera.org/specializations/web-design"
  ];
};

const getDefaultDocs = (field) => {
  return [
    "https://developer.mozilla.org",
    "https://w3schools.com",
    "https://stackoverflow.com"
  ];
};

const getDefaultBooks = (field) => {
  return [
    "Clean Code by Robert C. Martin",
    "The Pragmatic Programmer by David Thomas",
    "You Don't Know JS by Kyle Simpson"
  ];
};

const getDefaultPlatforms = (field) => {
  return [
    "https://leetcode.com",
    "https://codewars.com",
    "https://hackerrank.com"
  ];
};

const getDefaultTools = (phaseIndex, stepIndex, field) => {
  return ["VS Code", "Git", "Chrome DevTools", "Postman", "npm/yarn"];
};

const getDefaultJobSkills = (phaseIndex, stepIndex, field) => {
  return ["Problem Solving", "Critical Thinking", "Team Collaboration", "Code Review", "Documentation"];
};

const getDefaultCompanies = (field) => {
  return [
    "Google: Strong fundamentals and problem-solving",
    "Microsoft: Clean code and system design",
    "Amazon: Scalability and leadership",
    "Meta: Full-stack capabilities",
    "Startups: Versatility and rapid learning"
  ];
};

const getDefaultFlowchart = (field) => {
  return [
    "Month 1-2: Learn Fundamentals → Build Foundation",
    "Month 3-4: Practice with Projects → Gain Experience",
    "Month 5-6: Master Advanced Topics → Deepen Knowledge",
    "Month 7-8: Build Portfolio → Showcase Skills",
    "Month 9-10: Apply for Jobs → Interview Preparation"
  ];
};

const getDefaultTrends = (field) => {
  return [
    "AI Integration: Transforming development workflows",
    "Serverless Architecture: Reducing infrastructure complexity",
    "Edge Computing: Bringing computation closer to users",
    "Progressive Web Apps: Blurring web and mobile lines"
  ];
};

const getDefaultSalary = (field) => {
  return "Entry Level: $70-90k, Mid Level: $90-130k, Senior: $130-180k+";
};

const getDefaultJobRoles = (field) => {
  return [
    "Junior Developer",
    "Full Stack Developer",
    "Frontend Specialist",
    "Backend Engineer",
    "Technical Lead",
    "Solution Architect"
  ];
};

// ============ FALLBACK GENERATOR ============
const generateDetailedFallback = async (req, res) => {
  try {
    const { prompt } = req.body;
    const field = extractFieldFromPrompt(prompt);
    
    const detailedRoadmap = {
      roadmap: getDefaultRoadmapPhases(field).map(phase => ({
        ...phase,
        _id: new mongoose.Types.ObjectId(),
        steps: Array(4).fill(null).map((_, i) => ({
          _id: new mongoose.Types.ObjectId(),
          stepTitle: getDefaultStepTitle(i),
          description: getDefaultStepDescription(i, phase.field),
          resources: {
            youtube: getDefaultYoutubeResources(phase.field),
            coursera: getDefaultCourseraResources(phase.field),
            officialDocs: getDefaultDocs(phase.field),
            books: getDefaultBooks(phase.field),
            practicePlatforms: getDefaultPlatforms(phase.field)
          },
          tools: getDefaultTools(0, i, phase.field),
          jobReadySkills: getDefaultJobSkills(0, i, phase.field)
        }))
      })),
      companies: getDefaultCompanies(field),
      flowchart: getDefaultFlowchart(field),
      emergingTrends: getDefaultTrends(field),
      salaryRange: getDefaultSalary(field),
      jobRoles: getDefaultJobRoles(field)
    };

    const roadmapDoc = new Roadmap({
      ...detailedRoadmap,
      userId: req.user._id,
      createdAt: new Date()
    });

    await roadmapDoc.save();

    const userProgress = new UserProgress({
      userId: req.user._id,
      roadmapId: roadmapDoc._id,
      dailyProgress: [],
      completedSteps: [],
      completedPhases: [],
      lastUpdated: new Date()
    });
    
    await userProgress.save();

    res.json({
      success: true,
      _id: roadmapDoc._id,
      ...detailedRoadmap,
      progress: 0,
      message: "Roadmap generated successfully"
    });

  } catch (fallbackError) {
    console.error("Fallback generation failed:", fallbackError);
    res.status(500).json({ error: "Unable to generate roadmap at this time" });
  }
};

// ============ GET ROADMAP BY ID ============
const getRoadmapById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid roadmap ID format" });
    }
    
    const roadmap = await Roadmap.findById(id);
    if (!roadmap) {
      return res.status(404).json({ message: "No roadmap found." });
    }

    const userProgress = await UserProgress.findOne({
      userId: req.user._id,
      roadmapId: id
    });

    let progressData = userProgress;
    let progressPercentage = 0;
    
    if (!userProgress) {
      progressData = {
        userId: req.user._id,
        roadmapId: id,
        dailyProgress: [],
        completedSteps: [],
        completedPhases: [],
        lastUpdated: new Date(),
        progress: 0
      };
    } else {
      const totalSteps = roadmap.roadmap.reduce((total, phase) => 
        total + (phase.steps?.length || 0), 0
      );
      progressPercentage = totalSteps > 0 
        ? Math.round((userProgress.completedSteps.length / totalSteps) * 100) 
        : 0;
    }

    res.json({
      success: true,
      roadmap,
      userProgress: {
        ...(progressData.toObject ? progressData.toObject() : progressData),
        progress: progressPercentage
      }
    });
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    res.status(500).json({ error: error.message });
  }
};

// ============ GET ALL ROADMAPS ============
const getallroadmap = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    
    const roadmaps = await Roadmap.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(roadmaps || []);
    
  } catch (error) {
    console.error("Error in getallroadmap:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============ DELETE ROADMAP ============
const deleteroadmap = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid roadmap ID format" });
    }
    
    const roadmap = await Roadmap.findOneAndDelete({ _id: id, userId: req.user._id });
    
    if (!roadmap) {
      return res.status(404).json({ message: "No roadmap found." });
    }
    
    await Promise.all([
      UserProgress.deleteMany({ roadmapId: id }),
      UserBadge.deleteMany({ roadmapId: id }),
      SkillAnalysis.deleteMany({ roadmapId: id })
    ]);
    
    res.json({ success: true, message: "Roadmap deleted successfully" });
  } catch (error) {
    console.error("Error deleting roadmap:", error);
    res.status(500).json({ error: error.message });
  }
};

// ============ UPDATE PROGRESS ============
const updateProgress = async (req, res) => {
  try {
    const { roadmapId, stepId, completed } = req.body;
    
    if (!roadmapId || !stepId || completed === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let userProgress = await UserProgress.findOne({
      userId: req.user._id,
      roadmapId
    });

    if (!userProgress) {
      userProgress = new UserProgress({
        userId: req.user._id,
        roadmapId,
        dailyProgress: [],
        completedSteps: [],
        completedPhases: [],
        lastUpdated: new Date()
      });
    }

    const stepIdStr = stepId.toString();
    const completedStepsSet = new Set(
      userProgress.completedSteps.map(id => id.toString())
    );

    if (completed) {
      completedStepsSet.add(stepIdStr);
    } else {
      completedStepsSet.delete(stepIdStr);
    }

    userProgress.completedSteps = Array.from(completedStepsSet).map(
      id => new mongoose.Types.ObjectId(id)
    );

    userProgress.lastUpdated = new Date();
    await userProgress.save();

    res.json({ success: true, message: "Progress updated" });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ error: error.message });
  }
};

// ============ GET PROGRESS ============
const getProgress = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userProgress = await UserProgress.findOne({
      userId: req.user._id,
      roadmapId
    });
    res.json(userProgress || { dailyProgress: [], completedSteps: [], completedPhases: [], progress: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============ BADGES ============
const getBadges = async (req, res) => {
  try {
    let allBadges = await Badge.find().lean();
    
    if (allBadges.length === 0) {
      await initializeBadges();
      allBadges = await Badge.find().lean();
    }
    
    const userBadges = await UserBadge.find({
      userId: req.user._id,
      roadmapId: req.params.roadmapId
    }).populate('badgeId').lean();

    const badgesWithStatus = allBadges.map(badge => {
      const earnedBadge = userBadges.find(ub => 
        ub.badgeId && ub.badgeId._id.toString() === badge._id.toString()
      );
      
      return {
        _id: badge._id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        criteria: badge.criteria,
        earned: !!earnedBadge,
        earnedAt: earnedBadge?.createdAt || null
      };
    });

    res.json(badgesWithStatus);
  } catch (error) {
    res.json([]);
  }
};

const initializeBadges = async () => {
  try {
    const badges = [
      { name: "First Steps", description: "Complete your first learning step", icon: "🚀", criteria: { type: 'steps', threshold: 1 } },
      { name: "Consistent Learner", description: "Learn for 3 consecutive days", icon: "🔥", criteria: { type: 'days', threshold: 3 } },
      { name: "Halfway There", description: "Complete 50% of your roadmap", icon: "🎯", criteria: { type: 'steps', threshold: 10 } },
      { name: "Roadmap Master", description: "Complete all steps", icon: "🏆", criteria: { type: 'steps', threshold: 20 } },
      { name: "Weekly Warrior", description: "Learn for 7 days", icon: "⚡", criteria: { type: 'days', threshold: 7 } },
      { name: "Phase Champion", description: "Complete your first phase", icon: "⭐", criteria: { type: 'phases', threshold: 1 } }
    ];

    for (const badgeData of badges) {
      const existingBadge = await Badge.findOne({ name: badgeData.name });
      if (!existingBadge) {
        await Badge.create(badgeData);
      }
    }
  } catch (error) {
    console.error("Error creating badges:", error);
  }
};

async function checkForBadges(userId, roadmapId, userProgress) {
  const badges = await Badge.find().lean();
  const earnedBadges = await UserBadge.find({ userId, roadmapId }).lean();
  const earnedBadgeIds = new Set(earnedBadges.map(eb => eb.badgeId?.toString()).filter(Boolean));

  for (const badge of badges) {
    if (earnedBadgeIds.has(badge._id.toString())) continue;

    let earned = false;
    switch (badge.criteria.type) {
      case 'steps':
        earned = userProgress.completedSteps.length >= badge.criteria.threshold;
        break;
      case 'days':
        const uniqueDays = new Set(userProgress.dailyProgress.map(d => new Date(d.date).toDateString())).size;
        earned = uniqueDays >= badge.criteria.threshold;
        break;
      case 'phases':
        earned = userProgress.completedPhases.length >= badge.criteria.threshold;
        break;
    }

    if (earned) {
      await UserBadge.create({ userId, roadmapId, badgeId: badge._id });
    }
  }
}

const fixMissingProgress = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user._id });
    let fixedCount = 0;
    
    for (const roadmap of roadmaps) {
      const existingProgress = await UserProgress.findOne({ userId: req.user._id, roadmapId: roadmap._id });
      if (!existingProgress) {
        await UserProgress.create({
          userId: req.user._id,
          roadmapId: roadmap._id,
          dailyProgress: [],
          completedSteps: [],
          completedPhases: [],
          lastUpdated: new Date()
        });
        fixedCount++;
      }
    }
    
    res.json({ success: true, message: `Fixed ${fixedCount} missing progress` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============ ENHANCED SKILL GAP ANALYSIS ============

// Local skill analysis
function analyzeSkillsLocally(userSkills, roadmapSkills) {
  const actualMatches = [];
  const actualGaps = [];
  
  if (!roadmapSkills || !Array.isArray(roadmapSkills)) {
    return { actualMatches: [], actualGaps: [] };
  }
  
  const userSkillsLower = userSkills.map(skill => skill.toLowerCase().trim());
  
  roadmapSkills.forEach(roadmapSkill => {
    const skillName = (roadmapSkill.name || roadmapSkill).toLowerCase().trim();
    
    let hasSkill = false;
    if (userSkillsLower.includes(skillName)) {
      hasSkill = true;
    } else {
      for (const userSkill of userSkillsLower) {
        if (skillName.includes(userSkill) || userSkill.includes(skillName)) {
          hasSkill = true;
          break;
        }
      }
    }
    
    if (hasSkill) {
      actualMatches.push(roadmapSkill);
    } else {
      actualGaps.push(roadmapSkill);
    }
  });
  
  return { actualMatches, actualGaps };
}

// ENHANCED Groq API call with rich data
async function generateGroqAnalysis(userSkills, matchedSkills, skillGaps, skillLevel, timeCommitment) {
  try {
    const matchedNames = matchedSkills.map(s => s.name || s);
    const gapNames = skillGaps.map(s => s.name || s);
    
    const prompt = `
      Analyze these specific skill gaps for a ${skillLevel} developer:
      
      USER'S CURRENT SKILLS: ${userSkills.join(', ')}
      SKILLS ALREADY MASTERED: ${matchedNames.join(', ')}
      SKILLS NEEDED TO LEARN: ${gapNames.join(', ')}
      TIME AVAILABLE: ${timeCommitment} hours/week
      
      For EACH skill in "SKILLS NEEDED TO LEARN", provide RICH data:
      
      1. priority (high/medium/low)
      2. estimatedTimeHours (EXACT hours: "8 hours", "12 hours", "25 hours")
      3. prerequisites (skills needed BEFORE this, as array)
      4. difficultyLevel (beginner/intermediate/advanced)
      5. resources: {
           youtube: ["actual URL"],
           udemy: ["actual URL"],
           coursera: ["actual URL"],
           docs: ["actual URL"],
           blogs: ["actual URL"]
         }
      6. projectIdeas (3 specific project ideas)
      7. interviewQuestions (3 common interview questions)
      8. salaryRange (e.g., "$80k - $120k")
      9. demandLevel (High/Medium/Low)
      10. relatedSkills (other skills to learn alongside)
      
      Return JSON ONLY with this EXACT structure:
      {
        "skillGaps": [
          {
            "name": "skill_name",
            "category": "frontend/backend/database/devops",
            "priority": "high",
            "estimatedTimeHours": "25 hours",
            "prerequisites": ["skill1", "skill2"],
            "difficultyLevel": "intermediate",
            "resources": {
              "youtube": ["https://youtube.com/..."],
              "udemy": ["https://udemy.com/..."],
              "coursera": ["https://coursera.org/..."],
              "docs": ["https://docs.com/..."],
              "blogs": ["https://blog.com/..."]
            },
            "projectIdeas": ["Project 1", "Project 2", "Project 3"],
            "interviewQuestions": ["Question 1", "Question 2", "Question 3"],
            "salaryRange": "$80k - $120k",
            "demandLevel": "High",
            "relatedSkills": ["skill A", "skill B"]
          }
        ],
        "matchedSkills": ["skill1", "skill2"],
        "learningPath": [
          "Week 1-2: Master HTML (8h) + CSS (12h) [PARALLEL]",
          "Week 3-4: JavaScript (25h)",
          "Week 5-8: React (40h) + Projects"
        ],
        "readinessPercentage": 65,
        "estimatedTimeline": "12-16 weeks",
        "recommendations": ["Recommendation 1", "Recommendation 2"],
        "salaryProjection": {
          "current": 70000,
          "potential": 120000,
          "increase": 50000
        },
        "marketDemand": {
          "highDemandSkills": ["react", "node"],
          "advice": "Focus on React and Node for best job opportunities"
        }
      }
    `;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert career advisor. Return ONLY valid JSON with REAL URLs. No markdown."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8000
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 60000
      }
    );

    const rawText = response.data.choices[0].message.content;
    console.log("📥 Groq analysis response received, length:", rawText?.length);
    
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      if (parsed.skillGaps) {
        parsed.skillGaps = parsed.skillGaps.map(gap => ({
          ...gap,
          resources: {
            youtube: gap.resources?.youtube || [],
            udemy: gap.resources?.udemy || [],
            coursera: gap.resources?.coursera || [],
            docs: gap.resources?.docs || [],
            blogs: gap.resources?.blogs || []
          }
        }));
      }
      
      return parsed;
    }
  } catch (error) {
    console.error("❌ Groq API error:", error.message);
  }
  
  return null;
}

// ENHANCED Local analysis generator with rich data
function generateLocalAnalysis(userSkills, matchedSkills, skillGaps, skillLevel, timeCommitment) {
  const prioritizedGaps = skillGaps.map(gap => {
    const skillName = (gap.name || gap).toLowerCase();
    
    let priority = 'medium';
    let estimatedTimeHours = '20 hours';
    let difficultyLevel = 'beginner';
    let salaryRange = '$70,000 - $90,000';
    let demandLevel = 'Medium';
    let relatedSkills = [];
    let prerequisites = [];
    
    if (['javascript', 'react', 'python', 'aws'].includes(skillName)) {
      priority = 'high';
      estimatedTimeHours = '40 hours';
      difficultyLevel = 'intermediate';
      salaryRange = '$90,000 - $140,000';
      demandLevel = 'High';
      relatedSkills = skillName === 'javascript' ? ['TypeScript', 'Node.js'] : 
                      skillName === 'react' ? ['Next.js', 'Redux'] :
                      skillName === 'python' ? ['Django', 'FastAPI'] : ['Docker', 'Terraform'];
      prerequisites = skillName === 'react' ? ['JavaScript', 'HTML', 'CSS'] : [];
    } else if (['html', 'css', 'git'].includes(skillName)) {
      priority = 'high';
      estimatedTimeHours = '12 hours';
      difficultyLevel = 'beginner';
      salaryRange = '$60,000 - $80,000';
      demandLevel = 'High';
      relatedSkills = skillName === 'html' ? ['CSS', 'JavaScript'] : 
                      skillName === 'css' ? ['Tailwind', 'SASS'] : ['GitHub', 'CI/CD'];
    } else if (['node', 'mongodb', 'sql'].includes(skillName)) {
      priority = 'high';
      estimatedTimeHours = '30 hours';
      difficultyLevel = 'intermediate';
      salaryRange = '$80,000 - $120,000';
      demandLevel = 'High';
      relatedSkills = skillName === 'node' ? ['Express', 'NestJS'] : 
                      skillName === 'mongodb' ? ['Mongoose', 'Atlas'] : ['PostgreSQL', 'Prisma'];
    }
    
    return {
      name: gap.name || gap,
      category: getSkillCategory(skillName),
      priority,
      estimatedTimeHours,
      prerequisites,
      difficultyLevel,
      resources: getEnhancedResourcesForSkill(skillName),
      projectIdeas: getProjectIdeasForSkill(skillName, skillLevel),
      interviewQuestions: getInterviewQuestionsForSkill(skillName),
      salaryRange,
      demandLevel,
      relatedSkills
    };
  }).sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  const totalSkills = matchedSkills.length + skillGaps.length;
  const readinessPercentage = totalSkills > 0 
    ? Math.round((matchedSkills.length / totalSkills) * 100)
    : 0;
  
  const weeklyHours = parseInt(timeCommitment) || 20;
  const totalWeeks = Math.ceil(prioritizedGaps.reduce((sum, gap) => {
    const hours = parseInt(gap.estimatedTimeHours) || 20;
    return sum + (hours / weeklyHours);
  }, 0));
  
  const learningPath = [];
  let currentWeek = 1;
  
  for (const gap of prioritizedGaps.slice(0, 4)) {
    const weeksNeeded = Math.ceil((parseInt(gap.estimatedTimeHours) || 20) / weeklyHours);
    learningPath.push(`Week ${currentWeek}-${currentWeek + weeksNeeded - 1}: Master ${gap.name} (${gap.priority} priority, ${gap.estimatedTimeHours})`);
    currentWeek += weeksNeeded;
  }
  
  learningPath.push(`Week ${currentWeek}-${currentWeek + 2}: Build integrated projects using all skills`);
  learningPath.push(`Week ${currentWeek + 3}-${currentWeek + 4}: Portfolio preparation and interview practice`);

  const currentSalary = 70000 + (matchedSkills.length * 5000);
  const potentialSalary = 70000 + ((matchedSkills.length + skillGaps.length) * 5000);
  
  const highDemandSkills = prioritizedGaps.filter(g => g.demandLevel === 'High').map(g => g.name);
  
  return {
    skillGaps: prioritizedGaps,
    matchedSkills: matchedSkills.map(s => s.name || s),
    learningPath,
    readinessPercentage,
    estimatedTimeline: `${totalWeeks}-${totalWeeks + 4} weeks`,
    recommendations: generatePersonalizedRecommendations(prioritizedGaps, matchedSkills.length, readinessPercentage),
    salaryProjection: {
      current: currentSalary,
      potential: potentialSalary,
      increase: potentialSalary - currentSalary
    },
    marketDemand: {
      highDemandSkills: highDemandSkills.slice(0, 5),
      advice: highDemandSkills.length > 0 
        ? `Focus on ${highDemandSkills.slice(0, 3).join(', ')} for best job opportunities.`
        : "All skills are valuable. Build a strong foundation first."
    }
  };
}

// Helper functions for enhanced local analysis
function getSkillCategory(skillName) {
  const categories = {
    javascript: 'frontend', react: 'frontend', vue: 'frontend', angular: 'frontend', 
    html: 'frontend', css: 'frontend', tailwind: 'frontend',
    node: 'backend', python: 'backend', java: 'backend', express: 'backend', django: 'backend',
    sql: 'database', mongodb: 'database', postgresql: 'database', mysql: 'database',
    aws: 'cloud', docker: 'devops', kubernetes: 'devops', git: 'tools'
  };
  return categories[skillName] || 'general';
}

function getEnhancedResourcesForSkill(skillName) {
  const resources = {
    javascript: {
      youtube: ['https://youtube.com/watch?v=W6NZfCO5SIk', 'https://youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUocPVUl'],
      udemy: ['https://udemy.com/course/the-complete-javascript-course'],
      coursera: ['https://coursera.org/learn/javascript'],
      docs: ['https://developer.mozilla.org/en-US/docs/Web/JavaScript'],
      blogs: ['https://javascript.info']
    },
    react: {
      youtube: ['https://youtube.com/watch?v=bMknfKXIFA8', 'https://youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUocPVUl'],
      udemy: ['https://udemy.com/course/react-the-complete-guide'],
      coursera: ['https://coursera.org/learn/react-basics'],
      docs: ['https://react.dev/learn'],
      blogs: ['https://dev.to/t/react']
    },
    node: {
      youtube: ['https://youtube.com/watch?v=Oe421EPjeBE', 'https://youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUocPVUl'],
      udemy: ['https://udemy.com/course/nodejs-the-complete-guide'],
      coursera: ['https://coursera.org/learn/nodejs'],
      docs: ['https://nodejs.org/en/docs/guides'],
      blogs: ['https://dev.to/t/node']
    },
    html: {
      youtube: ['https://youtube.com/watch?v=qz0aGYrrlhU', 'https://youtube.com/watch?v=UB1O30fR-EE'],
      udemy: ['https://udemy.com/course/html5-css3-basics'],
      coursera: ['https://coursera.org/learn/html'],
      docs: ['https://developer.mozilla.org/en-US/docs/Web/HTML'],
      blogs: ['https://dev.to/t/html']
    },
    css: {
      youtube: ['https://youtube.com/watch?v=1Rs2ND1ryYc', 'https://youtube.com/watch?v=OXGznpKZ_sA'],
      udemy: ['https://udemy.com/course/css-the-complete-guide'],
      coursera: ['https://coursera.org/learn/css'],
      docs: ['https://developer.mozilla.org/en-US/docs/Web/CSS'],
      blogs: ['https://css-tricks.com']
    }
  };
  
  const defaultResources = {
    youtube: [`https://youtube.com/results?search_query=${encodeURIComponent(skillName)}+tutorial`],
    udemy: [`https://udemy.com/courses/search/?q=${encodeURIComponent(skillName)}`],
    coursera: [`https://coursera.org/search?query=${encodeURIComponent(skillName)}`],
    docs: [`https://www.google.com/search?q=${encodeURIComponent(skillName)}+documentation`],
    blogs: [`https://dev.to/search?q=${encodeURIComponent(skillName)}`]
  };
  
  return resources[skillName] || defaultResources;
}

function getInterviewQuestionsForSkill(skillName) {
  const questions = {
    javascript: ['Explain closures in JavaScript', 'What is the event loop?', 'Difference between == and ==='],
    react: ['What is JSX?', 'Explain React hooks', 'What is virtual DOM?'],
    node: ['What is event loop in Node.js?', 'Explain streams', 'What is middleware?'],
    html: ['What are semantic elements?', 'Explain HTML5 features', 'What is accessibility?'],
    css: ['What is Flexbox?', 'Explain CSS Grid', 'What are pseudo-classes?']
  };
  return questions[skillName] || [`What is ${skillName}?`, `How do you use ${skillName} effectively?`, `What are best practices for ${skillName}?`];
}

function getProjectIdeasForSkill(skillName, level) {
  const levelLower = level?.toLowerCase() || 'beginner';
  
  const projects = {
    beginner: [
      `Build a ${skillName} calculator app`,
      `Create a to-do list with ${skillName}`,
      `Make a weather app using ${skillName}`,
      `Personal portfolio website`
    ],
    intermediate: [
      `E-commerce site with ${skillName}`,
      `Real-time chat application`,
      `Social media dashboard`,
      `Blog platform with authentication`
    ],
    advanced: [
      `Microservices with ${skillName}`,
      `Real-time analytics dashboard`,
      `Scalable ${skillName} application`,
      `Full-stack project with multiple integrations`
    ]
  };
  
  return projects[levelLower] || projects.beginner;
}

function generatePersonalizedRecommendations(skillGaps, matchedCount, readinessScore) {
  const recommendations = [];
  
  if (skillGaps.length === 0) {
    recommendations.push("🎉 You have all required skills! Focus on building advanced portfolio projects.");
  } else {
    const highPriority = skillGaps.filter(g => g.priority === 'high');
    if (highPriority.length > 0) {
      recommendations.push(`🎯 Focus on ${highPriority[0].name} first (${highPriority[0].estimatedTimeHours} estimated) - it's critical for your career path.`);
    }
    
    const parallelSkills = skillGaps.filter(g => g.name === 'html' || g.name === 'css');
    if (parallelSkills.length === 2) {
      recommendations.push("⚡ HTML and CSS can be learned simultaneously - save 4 hours!");
    }
    
    recommendations.push(`📚 Dedicate consistent time daily for best results.`);
    recommendations.push("💡 Build at least 2-3 portfolio projects showcasing your skills.");
  }
  
  if (readinessScore < 50) {
    recommendations.push("📖 Start with fundamentals before moving to advanced topics.");
  } else if (readinessScore > 80) {
    recommendations.push("🚀 You're almost ready! Focus on interview preparation and system design.");
  }
  
  return recommendations;
}

// Basic skill gap scan
const skillGapScan = async (req, res) => {
  try {
    const { roadmapId, userSkills } = req.body;
    
    if (!roadmapId || !userSkills) {
      return res.status(400).json({ error: "Roadmap ID and user skills are required" });
    }

    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ error: "Roadmap not found" });
    }

    const requiredSkills = [];
    roadmap.roadmap?.forEach(phase => {
      phase.steps?.forEach(step => {
        if (step.skillsToLearn) requiredSkills.push(...step.skillsToLearn);
        if (step.jobReadySkills) requiredSkills.push(...step.jobReadySkills);
      });
    });

    const uniqueRequiredSkills = [...new Set(requiredSkills)];
    const matchedSkills = uniqueRequiredSkills.filter(skill => 
      userSkills.some(us => us.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(us.toLowerCase()))
    );
    const skillGaps = uniqueRequiredSkills.filter(skill => !matchedSkills.includes(skill));

    res.json({
      success: true,
      skillGaps: skillGaps.map(gap => ({ name: gap })),
      matchedSkills,
      requiredSkills: uniqueRequiredSkills
    });
    
  } catch (error) {
    console.error("Skill gap scan error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ENHANCED AI Skill Gap Analysis
const analyzeSkillGapsAI = async (req, res) => {
  try {
    const { roadmapId, userSkills, roadmapSkills, skillLevel, timeCommitment } = req.body;
    
    if (!roadmapId || !userSkills) {
      return res.status(400).json({ error: "Roadmap ID and user skills are required" });
    }

    const { actualGaps, actualMatches } = analyzeSkillsLocally(userSkills, roadmapSkills);
    
    let analysis = null;
    
    if (actualGaps.length > 0) {
      analysis = await generateGroqAnalysis(
        userSkills,
        actualMatches,
        actualGaps,
        skillLevel || 'beginner',
        timeCommitment || '20'
      );
    }

    if (!analysis) {
      analysis = generateLocalAnalysis(
        userSkills,
        actualMatches,
        actualGaps,
        skillLevel || 'beginner',
        timeCommitment || '20'
      );
    }

    try {
      const skillAnalysis = new SkillAnalysis({
        user: req.user._id,
        roadmapId,
        userSkills,
        skillGaps: analysis.skillGaps || [],
        matchedSkills: analysis.matchedSkills || [],
        analysisType: 'ai_enhanced',
        aiRecommendations: analysis.recommendations || []
      });
      await skillAnalysis.save();
    } catch (saveError) {
      console.log("⚠️ Database save warning:", saveError.message);
    }

    res.json({
      success: true,
      analysis: analysis,
      message: "Skill gap analysis completed"
    });

  } catch (error) {
    console.error("❌ AI analysis error:", error);
    res.status(500).json({ 
      success: false,
      error: "Analysis failed",
      message: error.message 
    });
  }
};

// ============ UPDATE ROADMAP ============
const updateRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    const { roadmap, companies, flowchart } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid roadmap ID format" });
    }
    
    const roadmapDoc = await Roadmap.findOne({ _id: id, userId: req.user._id });
    
    if (!roadmapDoc) {
      return res.status(404).json({ error: "Roadmap not found" });
    }
    
    if (roadmap) roadmapDoc.roadmap = roadmap;
    if (companies) roadmapDoc.companies = companies;
    if (flowchart) roadmapDoc.flowchart = flowchart;
    
    await roadmapDoc.save();
    
    res.json({ success: true, message: "Roadmap updated successfully" });
    
  } catch (error) {
    console.error("Error updating roadmap:", error);
    res.status(500).json({ error: error.message });
  }
};

// ============ MODULE EXPORTS ============
module.exports = {
  roadmapgenerator,
  getallroadmap,
  getRoadmapById,
  deleteroadmap,
  updateProgress,
  getProgress,
  getBadges,
  skillGapScan,
  initializeBadges,
  fixMissingProgress,
  analyzeSkillGapsAI,
  updateRoadmap
};