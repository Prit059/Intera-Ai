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

const roadmapgenerator = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Try API first
    let response;
    try {
      response = await axios.post(
        GROK_API_URL,
        {
          model: GROK_MODEL,
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
      "description": "DETAILED description of what this phase covers (100-200 words)",
      "skillsToLearn": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
      "projects": [
        "Project 1: Detailed project description",
        "Project 2: Detailed project description"
      ],
      "steps": [
        {
          "stepTitle": "Step 1: [Specific topic]",
          "description": "DETAILED step description with learning objectives",
          "resources": {
            "youtube": [
              "https://youtube.com/playlist?list=... (actual FreeCodeCamp/Traversy Media/etc.)",
              "https://youtube.com/watch?v=... (actual tutorial)"
            ],
            "coursera": [
              "https://coursera.org/learn/... (actual course)",
              "https://coursera.org/specializations/... (actual specialization)"
            ],
            "officialDocs": [
              "https://developer.mozilla.org/...",
              "https://react.dev/learn",
              "https://nodejs.org/en/docs/guides/"
            ],
            "books": [
              "Book Title by Author (Publisher, Year)",
              "Another Book Title by Author"
            ],
            "practicePlatforms": [
              "https://leetcode.com",
              "https://codewars.com",
              "https://hackerrank.com",
              "https://frontendmentor.io"
            ]
          },
          "tools": ["Tool 1", "Tool 2", "Tool 3"],
          "jobReadySkills": ["Skill A", "Skill B", "Skill C"]
        }
      ]
    }
  ],
  "companies": [
    "Company 1: What they look for",
    "Company 2: What they look for",
    "Company 3: What they look for"
  ],
  "flowchart": [
    "Month 1-2: Learn Fundamentals →",
    "Month 3-4: Build Projects →", 
    "Month 5-6: Master Advanced Topics →",
    "Month 7-8: Portfolio & Applications"
  ],
  "emergingTrends": [
    "Trend 1: Detailed explanation",
    "Trend 2: Detailed explanation",
    "Trend 3: Detailed explanation"
  ],
  "salaryRange": "Entry Level: $X - $Y, Mid Level: $X - $Y, Senior: $X - $Y",
  "jobRoles": ["Role 1", "Role 2", "Role 3", "Role 4", "Role 5"]
}

IMPORTANT: Make this roadmap COMPREHENSIVE and DETAILED. Each phase should have 3-5 steps. Include REAL learning resources.`
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

    // Parse JSON response
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

    // Validate and enhance roadmap
    const enhancedRoadmap = enhanceRoadmapStructure(parsed, prompt);

    // Generate MongoDB IDs
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

    // Save to database
    const roadmapDoc = new Roadmap({
      ...roadmapWithIds,
      userId: req.user._id,
      createdAt: new Date()
    });

    await roadmapDoc.save();

    // Create UserProgress
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

// Helper to enhance and validate roadmap structure
const enhanceRoadmapStructure = (parsed, prompt) => {
  const field = extractFieldFromPrompt(prompt);
  
  // Default structure if missing
  if (!parsed.roadmap || !Array.isArray(parsed.roadmap) || parsed.roadmap.length === 0) {
    parsed.roadmap = getDefaultRoadmapPhases(field);
  }

  // Ensure each phase has required fields
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

  // Ensure other fields exist
  parsed.companies = parsed.companies || getDefaultCompanies(field);
  parsed.flowchart = parsed.flowchart || getDefaultFlowchart(field);
  parsed.emergingTrends = parsed.emergingTrends || getDefaultTrends(field);
  parsed.salaryRange = parsed.salaryRange || getDefaultSalary(field);
  parsed.jobRoles = parsed.jobRoles || getDefaultJobRoles(field);

  return parsed;
};

// Extract field from prompt
const extractFieldFromPrompt = (prompt) => {
  const match = prompt.match(/(?:for|in|about)\s+([^,.]+)/i);
  return match ? match[1].trim() : "Technology";
};

// Default phase titles based on field
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

// Get default roadmap phases based on field
const getDefaultRoadmapPhases = (field) => {
  if (field.toLowerCase().includes('full stack') || field.toLowerCase().includes('mern')) {
    return [
      {
        field: field,
        title: "Frontend Fundamentals",
        estimatedTime: "4-6 weeks",
        description: "Master HTML5, CSS3, and JavaScript ES6+ - the building blocks of web development",
        skillsToLearn: ["HTML5", "CSS3", "JavaScript ES6+", "Responsive Design", "Git Basics"],
        projects: ["Personal Portfolio Website", "Responsive Landing Page"],
        steps: []
      },
      {
        field: field,
        title: "Frontend Framework - React.js",
        estimatedTime: "6-8 weeks",
        description: "Learn React.js - components, hooks, state management, and modern React patterns",
        skillsToLearn: ["React Components", "Hooks (useState, useEffect)", "React Router", "State Management", "API Integration"],
        projects: ["E-commerce Store Frontend", "Task Management App"],
        steps: []
      },
      {
        field: field,
        title: "Backend with Node.js & Express",
        estimatedTime: "6-8 weeks",
        description: "Build scalable backend APIs with Node.js, Express, and MongoDB",
        skillsToLearn: ["Node.js", "Express.js", "RESTful APIs", "MongoDB", "Authentication (JWT)"],
        projects: ["Blog API", "E-commerce Backend"],
        steps: []
      },
      {
        field: field,
        title: "Full Stack Integration",
        estimatedTime: "4-6 weeks",
        description: "Connect frontend with backend, implement authentication, and deploy full-stack apps",
        skillsToLearn: ["Full Stack Integration", "Deployment", "WebSockets", "Testing", "Performance Optimization"],
        projects: ["Social Media Clone", "Real-time Chat Application"],
        steps: []
      }
    ];
  }
  
  // Default generic roadmap
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

// Default estimated time
const getDefaultEstimatedTime = (index) => {
  const times = ["4-6 weeks", "6-8 weeks", "8-10 weeks", "6-8 weeks", "4-6 weeks"];
  return times[index] || "4-6 weeks";
};

// Default description
const getDefaultDescription = (index, field) => {
  const desc = [
    `Build a strong foundation in ${field} by mastering essential concepts and tools.`,
    `Deepen your understanding of ${field} with intermediate topics and practical applications.`,
    `Master advanced ${field} techniques used by industry professionals.`,
    `Apply your skills to real-world ${field} projects and challenges.`,
    `Prepare for ${field} job interviews and build your professional portfolio.`
  ];
  return desc[index] || `Learn ${field} concepts and best practices.`;
};

// Default skills based on field
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

// Default projects
const getDefaultProjects = (index, field) => {
  return [
    "Personal Portfolio Website",
    "Task Management Application",
    "E-commerce Platform",
    "Real-time Chat Application",
    "API Integration Project"
  ].slice(0, 2);
};

// Default step title
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

// Default step description
const getDefaultStepDescription = (index, field) => {
  return `Learn and practice ${field} concepts through hands-on exercises and real-world examples.`;
};

// Default YouTube resources
const getDefaultYoutubeResources = (field) => {
  return [
    "https://youtube.com/@freecodecamp",
    "https://youtube.com/@TraversyMedia",
    "https://youtube.com/@WebDevSimplified",
    "https://youtube.com/@Fireship"
  ];
};

// Default Coursera resources
const getDefaultCourseraResources = (field) => {
  return [
    "https://coursera.org/learn/learning-how-to-learn",
    "https://coursera.org/specializations/web-design"
  ];
};

// Default documentation
const getDefaultDocs = (field) => {
  return [
    "https://developer.mozilla.org",
    "https://w3schools.com",
    "https://stackoverflow.com"
  ];
};

// Default books
const getDefaultBooks = (field) => {
  return [
    "Clean Code by Robert C. Martin",
    "The Pragmatic Programmer by David Thomas",
    "You Don't Know JS by Kyle Simpson"
  ];
};

// Default practice platforms
const getDefaultPlatforms = (field) => {
  return [
    "https://leetcode.com",
    "https://codewars.com",
    "https://hackerrank.com",
    "https://frontendmentor.io"
  ];
};

// Default tools
const getDefaultTools = (phaseIndex, stepIndex, field) => {
  return ["VS Code", "Git", "Chrome DevTools", "Postman", "npm/yarn"];
};

// Default job skills
const getDefaultJobSkills = (phaseIndex, stepIndex, field) => {
  return ["Problem Solving", "Critical Thinking", "Team Collaboration", "Code Review", "Documentation"];
};

// Default companies
const getDefaultCompanies = (field) => {
  return [
    "Google: Looking for strong fundamentals and problem-solving skills",
    "Microsoft: Value clean code and system design knowledge",
    "Amazon: Focus on scalability and customer obsession",
    "Meta: Emphasize full-stack capabilities and product sense",
    "Startups: Require versatility and rapid learning ability"
  ];
};

// Default flowchart
const getDefaultFlowchart = (field) => {
  return [
    "Month 1-2: Learn Fundamentals → Build Foundation",
    "Month 3-4: Practice with Projects → Gain Experience",
    "Month 5-6: Master Advanced Topics → Deepen Knowledge",
    "Month 7-8: Build Portfolio → Showcase Skills",
    "Month 9-10: Apply for Jobs → Interview Preparation"
  ];
};

// Default trends
const getDefaultTrends = (field) => {
  return [
    "AI Integration: How AI is transforming development workflows",
    "Serverless Architecture: Reducing infrastructure complexity",
    "Edge Computing: Bringing computation closer to users",
    "Progressive Web Apps: Blurring line between web and mobile",
    "Low-Code/No-Code: Democratizing application development"
  ];
};

// Default salary
const getDefaultSalary = (field) => {
  return "Entry Level: $70-90k, Mid Level: $90-130k, Senior: $130-180k+";
};

// Default job roles
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

// Enhanced fallback generator
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

    // Create UserProgress
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

    // Get user progress
    const userProgress = await UserProgress.findOne({
      userId: req.user._id,
      roadmapId: id
    });

    // Calculate progress
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
        ...progressData.toObject?.(),
        ...progressData,
        progress: progressPercentage
      }
    });
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    res.status(500).json({ 
      message: "Error fetching roadmap", 
      error: error.message 
    });
  }
};

const getallroadmap = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    if (!roadmaps || roadmaps.length === 0) {
      return res.json([]); // Return empty array instead of 404
    }

    // Get progress for all roadmaps
    const roadmapIds = roadmaps.map(r => r._id);
    const progresses = await UserProgress.find({
      userId: req.user._id,
      roadmapId: { $in: roadmapIds }
    });

    const roadmapsWithProgress = roadmaps.map(roadmap => {
      const progress = progresses.find(p => 
        p.roadmapId.toString() === roadmap._id.toString()
      );
      
      const totalSteps = roadmap.roadmap?.reduce((total, phase) => 
        total + (phase.steps?.length || 0), 0
      ) || 0;
      
      const completedSteps = progress?.completedSteps?.length || 0;
      const progressPercentage = totalSteps > 0 
        ? Math.round((completedSteps / totalSteps) * 100) 
        : 0;
      
      return {
        ...roadmap,
        progress: progressPercentage,
        completedSteps: completedSteps,
        totalSteps: totalSteps
      };
    });

    res.json(roadmapsWithProgress);
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteroadmap = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid roadmap ID format" });
    }
    
    const roadmap = await Roadmap.findOneAndDelete({ 
      _id: id, 
      userId: req.user._id 
    });
    
    if (!roadmap) {
      return res.status(404).json({ message: "No roadmap found." });
    }
    
    // Delete associated data
    await Promise.all([
      UserProgress.deleteMany({ roadmapId: id }),
      UserBadge.deleteMany({ roadmapId: id }),
      SkillAnalysis.deleteMany({ roadmapId: id })
    ]);
    
    res.json({ 
      success: true, 
      message: "Roadmap and associated data deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting roadmap:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateProgress = async (req, res) => {
  try {
    const { roadmapId, stepId, completed } = req.body;
    
    // Validate input
    if (!roadmapId || !stepId || completed === undefined) {
      return res.status(400).json({ 
        error: "Roadmap ID, Step ID, and completion status are required" 
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(roadmapId) || 
        !mongoose.Types.ObjectId.isValid(stepId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Find the roadmap
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    // Find or create user progress
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

    // Update step completion
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

    // Update daily progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dailyEntry = userProgress.dailyProgress.find(entry => {
      if (!entry?.date) return false;
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    if (dailyEntry) {
      dailyEntry.count = Math.max(0, dailyEntry.count + (completed ? 1 : -1));
    } else if (completed) {
      userProgress.dailyProgress.push({ 
        date: today, 
        count: 1 
      });
    }

    // Update phase completion
    const completedPhases = [];
    if (roadmap.roadmap && Array.isArray(roadmap.roadmap)) {
      roadmap.roadmap.forEach(phase => {
        if (phase.steps && Array.isArray(phase.steps)) {
          const phaseStepIds = phase.steps
            .map(step => step._id?.toString())
            .filter(Boolean);
          
          const completedPhaseSteps = phaseStepIds.filter(stepId => 
            userProgress.completedSteps.some(id => id.toString() === stepId)
          );
          
          if (completedPhaseSteps.length === phaseStepIds.length && phaseStepIds.length > 0) {
            completedPhases.push(phase._id || phase.title);
          }
        }
      });
    }
    
    userProgress.completedPhases = completedPhases;
    userProgress.lastUpdated = new Date();

    await userProgress.save();

    // Calculate progress
    const totalSteps = roadmap.roadmap.reduce((total, phase) => 
      total + (phase.steps?.length || 0), 0
    );
    const progressPercentage = totalSteps > 0 
      ? Math.round((userProgress.completedSteps.length / totalSteps) * 100) 
      : 0;

    // Check for badges
    try {
      await checkForBadges(req.user._id, roadmapId, userProgress);
    } catch (badgeError) {
      console.error("⚠️ Error checking badges:", badgeError.message);
    }

    res.json({ 
      success: true,
      message: "Progress updated successfully", 
      userProgress: {
        ...userProgress.toObject(),
        progress: progressPercentage
      },
      progressPercentage
    });

  } catch (error) {
    console.error("❌ Error in updateProgress:", error);
    res.status(500).json({ 
      error: error.message,
      details: "Failed to update progress. Please try again." 
    });
  }
};

const getProgress = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(roadmapId)) {
      return res.status(400).json({ error: "Invalid roadmap ID format" });
    }
    
    const userProgress = await UserProgress.findOne({
      userId: req.user._id,
      roadmapId
    });

    if (!userProgress) {
      return res.json({
        dailyProgress: [],
        completedSteps: [],
        completedPhases: [],
        progress: 0
      });
    }

    res.json(userProgress);
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ error: error.message });
  }
};

const getBadges = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    
    // Get all available badges
    let allBadges = await Badge.find().lean();
    
    // If no badges in database, initialize them
    if (allBadges.length === 0) {
      await initializeBadges();
      allBadges = await Badge.find().lean();
    }
    
    // Get user's earned badges for this roadmap
    const userBadges = await UserBadge.find({
      userId: req.user._id,
      roadmapId
    }).populate('badgeId').lean();

    // Create response with all badges, marking which ones are earned
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
        earnedAt: earnedBadge?.createdAt || null,
        progress: calculateBadgeProgress(badge, req.user._id, roadmapId)
      };
    });

    res.json(badgesWithStatus);
  } catch (error) {
    console.error("Error fetching badges:", error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to calculate badge progress
async function calculateBadgeProgress(badge, userId, roadmapId) {
  try {
    const userProgress = await UserProgress.findOne({ userId, roadmapId });

    if (!userProgress) {
      return { current: 0, target: badge.criteria.threshold, percentage: 0 };
    }

    let currentValue = 0;
    
    switch (badge.criteria.type) {
      case 'steps':
        currentValue = userProgress.completedSteps.length;
        break;
      case 'days':
        const uniqueDays = new Set(
          userProgress.dailyProgress.map(d => new Date(d.date).toDateString())
        ).size;
        currentValue = uniqueDays;
        break;
      case 'phases':
        currentValue = userProgress.completedPhases.length;
        break;
      default:
        currentValue = 0;
    }

    const percentage = Math.min(
      100,
      Math.round((currentValue / badge.criteria.threshold) * 100)
    );

    return {
      current: currentValue,
      target: badge.criteria.threshold,
      percentage: percentage
    };
  } catch (error) {
    console.error("Error calculating badge progress:", error);
    return { current: 0, target: badge.criteria.threshold, percentage: 0 };
  }
}

// Check for badges
async function checkForBadges(userId, roadmapId, userProgress) {
  try {
    const badges = await Badge.find().lean();
    const earnedBadges = await UserBadge.find({ 
      userId, 
      roadmapId 
    }).lean();
    
    const earnedBadgeIds = new Set(
      earnedBadges.map(eb => eb.badgeId?.toString()).filter(Boolean)
    );

    let newBadgesEarned = [];

    for (const badge of badges) {
      if (earnedBadgeIds.has(badge._id.toString())) {
        continue;
      }

      let earned = false;
      let currentValue = 0;
      
      switch (badge.criteria.type) {
        case 'steps':
          currentValue = userProgress.completedSteps.length;
          earned = currentValue >= badge.criteria.threshold;
          break;
        case 'days':
          const uniqueDays = new Set(
            userProgress.dailyProgress.map(d => new Date(d.date).toDateString())
          ).size;
          currentValue = uniqueDays;
          earned = currentValue >= badge.criteria.threshold;
          break;
        case 'phases':
          currentValue = userProgress.completedPhases.length;
          earned = currentValue >= badge.criteria.threshold;
          break;
      }

      if (earned) {
        // console.log(`🎉 User earned badge: ${badge.name}`);
        
        const userBadge = new UserBadge({
          userId,
          roadmapId,
          badgeId: badge._id
        });
        
        await userBadge.save();
        newBadgesEarned.push(badge);
      }
    }

    return newBadgesEarned;
  } catch (error) {
    console.error("❌ Error in checkForBadges:", error);
    throw error;
  }
}

// Initialize badges
const initializeBadges = async () => {
  try {
    const badges = [
      {
        name: "First Steps",
        description: "Complete your first learning step",
        icon: "🚀",
        criteria: { type: 'steps', threshold: 1 }
      },
      {
        name: "Consistent Learner", 
        description: "Learn for 3 consecutive days",
        icon: "🔥",
        criteria: { type: 'days', threshold: 3 }
      },
      {
        name: "Halfway There",
        description: "Complete 50% of your roadmap",
        icon: "🎯", 
        criteria: { type: 'steps', threshold: 10 }
      },
      {
        name: "Roadmap Master",
        description: "Complete all steps in your roadmap",
        icon: "🏆",
        criteria: { type: 'steps', threshold: 20 }
      },
      {
        name: "Weekly Warrior",
        description: "Complete learning activities for 7 days",
        icon: "⚡",
        criteria: { type: 'days', threshold: 7 }
      },
      {
        name: "Phase Champion",
        description: "Complete your first phase",
        icon: "⭐",
        criteria: { type: 'phases', threshold: 1 }
      }
    ];

    for (const badgeData of badges) {
      const existingBadge = await Badge.findOne({ name: badgeData.name });
      if (!existingBadge) {
        await Badge.create(badgeData);
        // console.log(`✅ Created badge: ${badgeData.name}`);
      }
    }
    // console.log("🎉 All badges initialized successfully");
  } catch (error) {
    console.error("❌ Error creating badges:", error);
  }
};

// Fix missing progress
const fixMissingProgress = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user._id });
    
    let fixedCount = 0;
    const results = [];
    
    for (const roadmap of roadmaps) {
      const existingProgress = await UserProgress.findOne({
        userId: req.user._id,
        roadmapId: roadmap._id
      });
      
      if (!existingProgress) {
        const newProgress = new UserProgress({
          userId: req.user._id,
          roadmapId: roadmap._id,
          dailyProgress: [],
          completedSteps: [],
          completedPhases: [],
          lastUpdated: new Date()
        });
        
        await newProgress.save();
        fixedCount++;
        results.push({
          roadmapId: roadmap._id,
          status: 'fixed',
          progressId: newProgress._id
        });
      } else {
        results.push({
          roadmapId: roadmap._id,
          status: 'already_exists'
        });
      }
    }
    
    res.json({ 
      success: true,
      message: `Fixed ${fixedCount} missing UserProgress documents`,
      totalRoadmaps: roadmaps.length,
      fixedCount,
      results
    });
    
  } catch (error) {
    console.error("Error fixing progress:", error);
    res.status(500).json({ error: error.message });
  }
};

// AI Skill Gap Analysis with Grok
const analyzeSkillGapsAI = async (req, res) => {
  try {
    // console.log("🧠 AI Skill Gap Analysis - START");
    
    const { roadmapId, userSkills, roadmapSkills, skillLevel, timeCommitment } = req.body;
    
    if (!roadmapId || !userSkills) {
      return res.status(400).json({ 
        error: "Roadmap ID and user skills are required" 
      });
    }

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ 
        error: "User not authenticated" 
      });
    }

    // console.log("📊 User Skills:", userSkills);
    // console.log("📊 Roadmap Skills Count:", roadmapSkills?.length || 0);

    // Local skill analysis
    const { actualGaps, actualMatches } = analyzeSkillsLocally(userSkills, roadmapSkills);
    
    // console.log("📈 Analysis Results:");
    // console.log("- User has skills:", userSkills.length);
    // console.log("- Skills matched:", actualMatches.length);
    // console.log("- Skills to learn:", actualGaps.length);

    // Try AI analysis first
    let analysis;
    
    if (actualGaps.length > 0) {
      analysis = await generateGrokAnalysis(
        userSkills,
        actualMatches,
        actualGaps,
        skillLevel || 'beginner',
        timeCommitment || '20'
      );
    }

    // Fallback if AI fails
    if (!analysis) {
      analysis = generateLocalAnalysis(
        userSkills,
        actualMatches,
        actualGaps,
        skillLevel || 'beginner',
        timeCommitment || '20'
      );
    }

    // Save to database
    try {
      const skillAnalysis = new SkillAnalysis({
        user: userId,
        roadmapId,
        userSkills,
        skillGaps: analysis.skillGaps || [],
        matchedSkills: analysis.matchedSkills || [],
        analysisType: 'ai_enhanced',
        aiRecommendations: analysis.recommendations || []
      });
      
      await skillAnalysis.save();
      // console.log("✅ Analysis saved to database");
    } catch (saveError) {
      // console.log("⚠️ Database save warning:", saveError.message);
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

// Grok API call for skill analysis
async function generateGrokAnalysis(userSkills, matchedSkills, skillGaps, skillLevel, timeCommitment) {
  try {
    const matchedNames = matchedSkills.map(s => s.name || s);
    const gapNames = skillGaps.map(s => s.name || s);
    
    const prompt = `
      Analyze these specific skill gaps for a ${skillLevel} developer:
      
      USER'S CURRENT SKILLS: ${userSkills.join(', ')}
      SKILLS ALREADY MASTERED: ${matchedNames.join(', ')}
      SKILLS NEEDED TO LEARN: ${gapNames.join(', ')}
      TIME AVAILABLE: ${timeCommitment} hours/week
      
      For EACH skill in "SKILLS NEEDED TO LEARN", provide:
      1. Priority (high/medium/low) based on importance and dependencies
      2. Specific learning resources (courses, tutorials, books)
      3. Practical project ideas
      4. Estimated learning time
      
      Return JSON ONLY with this exact structure:
      {
        "skillGaps": [
          {
            "name": "skill_name",
            "category": "category",
            "priority": "priority",
            "estimatedTime": "X weeks",
            "resources": ["resource1", "resource2"],
            "projectIdeas": ["idea1", "idea2"]
          }
        ],
        "matchedSkills": ["skill1", "skill2"],
        "learningPath": ["Phase 1: ...", "Phase 2: ..."],
        "readinessPercentage": 65,
        "estimatedTimeline": "X months",
        "recommendations": ["recommendation1", "recommendation2"]
      }
    `;

    const response = await axios.post(
      GROK_API_URL,
      {
        model: "grok-2-latest",
        messages: [
          {
            role: "system",
            content: "You are an expert career advisor. Return ONLY valid JSON, no markdown, no explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      },
      {
        headers: {
          "Authorization": `Bearer ${GROK_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const rawText = response.data.choices[0].message.content;
    // console.log("🤖 Grok AI Response received");
    
    // Extract JSON
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error("❌ Grok API error:", error.message);
  }
  
  return null;
}

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

// Local analysis generator
function generateLocalAnalysis(userSkills, matchedSkills, skillGaps, skillLevel, timeCommitment) {
  // console.log("🔄 Generating local analysis");
  
  const prioritizedGaps = skillGaps.map(gap => {
    const skillName = (gap.name || gap).toLowerCase();
    
    let priority = 'medium';
    let estimatedTime = '3-4 weeks';
    
    if (['javascript', 'html', 'css', 'git', 'python'].includes(skillName)) {
      priority = 'high';
      estimatedTime = '2-3 weeks';
    } else if (['react', 'node.js', 'express', 'mongodb', 'sql'].includes(skillName)) {
      priority = 'high';
      estimatedTime = '4-6 weeks';
    } else if (['aws', 'docker', 'kubernetes'].includes(skillName)) {
      priority = 'medium';
      estimatedTime = '5-8 weeks';
    }
    
    return {
      name: gap.name || gap,
      category: gap.category || 'general',
      priority,
      estimatedTime,
      resources: getResourcesForSkill(gap.name || gap),
      projectIdeas: getProjectIdeasForSkill(gap.name || gap, skillLevel)
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
  const totalWeeks = Math.ceil(prioritizedGaps.length * 3);
  
  return {
    skillGaps: prioritizedGaps.slice(0, 5),
    matchedSkills: matchedSkills.map(s => s.name || s),
    learningPath: [
      `Weeks 1-2: Master ${prioritizedGaps[0]?.name || 'core concepts'}`,
      `Weeks 3-4: Learn ${prioritizedGaps[1]?.name || 'frameworks'}`,
      `Weeks 5-8: Build projects with ${prioritizedGaps.slice(0, 2).map(s => s.name).join(', ')}`,
      `Weeks 9-12: Advanced topics and portfolio preparation`
    ],
    readinessPercentage,
    estimatedTimeline: `${totalWeeks}-${Math.ceil(totalWeeks * 1.3)} weeks`,
    recommendations: [
      `Focus on ${prioritizedGaps[0]?.name || 'core skills'} first (${prioritizedGaps[0]?.priority || 'high'} priority)`,
      `Dedicate ${Math.ceil(weeklyHours * 0.6)} hours/week to hands-on practice`,
      `Build at least 2 portfolio projects`,
      `Join communities for ${prioritizedGaps.slice(0, 2).map(s => s.name).join(', ')}`
    ]
  };
}

// Get resources for skill
function getResourcesForSkill(skillName) {
  const skill = skillName.toLowerCase();
  const resources = {
    javascript: [
      "MDN JavaScript Guide",
      "JavaScript.info",
      "FreeCodeCamp JavaScript",
      "Eloquent JavaScript (book)"
    ],
    react: [
      "React Official Docs",
      "Scrimba React Course",
      "Full Stack Open",
      "React - The Complete Guide (Udemy)"
    ],
    python: [
      "Python.org Tutorial",
      "Automate the Boring Stuff",
      "Real Python",
      "Python Crash Course"
    ],
    node: [
      "Node.js Docs",
      "The Odin Project",
      "Node.js Design Patterns",
      "Express.js Guide"
    ],
    mongodb: [
      "MongoDB University",
      "Mongoose Docs",
      "MongoDB Crash Course (YouTube)",
      "MongoDB for Node.js Developers"
    ]
  };
  
  return resources[skill] || [
    `${skillName} Official Documentation`,
    `Complete ${skillName} Course on Udemy`,
    `${skillName} Tutorial for Beginners (YouTube)`,
    `Books on ${skillName}`
  ];
}

// Get project ideas
function getProjectIdeasForSkill(skillName, level) {
  const skill = skillName.toLowerCase();
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

// Basic skill gap scan
const skillGapScan = async (req, res) => {
  try {
    const { roadmapId, userSkills } = req.body;
    
    if (!roadmapId || !userSkills) {
      return res.status(400).json({ 
        error: "Roadmap ID and user skills are required" 
      });
    }

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ error: "Roadmap not found" });
    }

    // Extract skills from roadmap
    const requiredSkills = [];
    roadmap.roadmap?.forEach(phase => {
      phase.steps?.forEach(step => {
        if (step.skillsToLearn) {
          requiredSkills.push(...step.skillsToLearn);
        }
        if (step.jobReadySkills) {
          requiredSkills.push(...step.jobReadySkills);
        }
      });
    });

    // Remove duplicates
    const uniqueRequiredSkills = [...new Set(requiredSkills)];

    // Match skills
    const matchedSkills = uniqueRequiredSkills.filter(skill => 
      userSkills.some(us => us.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(us.toLowerCase()))
    );
    
    const skillGaps = uniqueRequiredSkills.filter(skill => 
      !matchedSkills.includes(skill)
    );

    // Save analysis
    const skillAnalysis = new SkillAnalysis({
      user: userId,
      roadmapId,
      userSkills,
      skillGaps: skillGaps.map(gap => ({ name: gap })),
      matchedSkills,
      analysisType: 'basic'
    });
    
    await skillAnalysis.save();
    
    res.json({
      success: true,
      skillGaps: skillGaps.map(gap => ({ name: gap })),
      matchedSkills,
      requiredSkills: uniqueRequiredSkills,
      analysisId: skillAnalysis._id,
      message: "Skill gap analysis completed"
    });
    
  } catch (error) {
    console.error("Skill gap scan error:", error);
    res.status(500).json({ error: error.message });
  }
};

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
  analyzeSkillGapsAI
};