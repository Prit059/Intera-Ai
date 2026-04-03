import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mic2, Brain, Map, Gamepad2, User, Bot, CheckCircle2, Waves, Search, MousePointer2, FileText, Lock, Building2,
  Upload, Cpu, Network, Database, GitBranch, BarChart, Clock, Shield, Filter, Zap, Settings, ChevronRight,
  Download, Calendar, Sparkles, Cctv, Radar, Gauge, Workflow, Layers3, Target, Crosshair, Scan
} from 'lucide-react';

const WhatWeOffer = () => {
  
  // --- 1. AI MOCK INTERVIEW - ENHANCED ANIMATION ---
  const AnimatedVoiceCall = () => {
    const [stage, setStage] = React.useState(0);
    
    React.useEffect(() => {
      const interval = setInterval(() => {
        setStage((prev) => (prev + 1) % 4);
      }, 4500);
      return () => clearInterval(interval);
    }, []);

    // AI Interview questions generator
    const aiQuestions = [
      "Based on your React experience, explain how you'd optimize a component that re-renders too frequently?",
      "Given your AWS knowledge, design a scalable architecture for a video streaming platform",
      "From your resume, you worked with Node.js - explain how you'd handle 10K concurrent requests",
      "Looking at your Python projects, implement a decorator for measuring function performance"
    ];

    return (
      <div className="relative w-full h-full min-h-[260px] bg-gradient-to-br from-[#0a0a0a] to-[#151515] rounded-2xl border border-white/5 p-5 overflow-hidden shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)]">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
          backgroundSize: '15px 15px'
        }} />

        {/* AI Processing Indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-orange-500"
          />
          <span className="text-[9px] font-mono text-orange-500/80">AI GENERATING...</span>
        </div>

        {/* Stage 1: AI Analyzing Resume */}
        <motion.div
          animate={{ 
            opacity: stage === 0 ? 1 : 0,
            scale: stage === 0 ? 1 : 0.8,
            y: stage === 0 ? 0 : 20
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 p-5 flex flex-col items-center justify-center"
        >
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-orange-500/50 flex items-center justify-center">
              <Scan className="w-8 h-8 text-orange-500" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border border-orange-500"
            />
          </motion.div>
          
          <div className="mt-4 w-full max-w-[200px]">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-3 h-3 text-gray-500" />
              <span className="text-[9px] text-gray-400">scanning resume_sde.pdf</span>
            </div>
            <div className="h-1 bg-[#222] rounded-full overflow-hidden">
              <motion.div
                animate={{ width: ["0%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-full bg-orange-500 rounded-full"
              />
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {['React', 'Node.js', 'Python', 'AWS'].map((skill, i) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                  className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-[8px] font-mono border border-orange-500/30"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>
          <div className="mt-2 text-[8px] text-gray-600 font-mono">AI EXTRACTING SKILLS • 4 DETECTED</div>
        </motion.div>

        {/* Stage 2: Live AI Interview - Enhanced Voice Animation */}
        <motion.div
          animate={{ 
            opacity: stage === 1 ? 1 : 0,
            scale: stage === 1 ? 1 : 0.8,
            y: stage === 1 ? 0 : 20
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 p-5"
        >
          <div className="h-full flex flex-col justify-between">
            {/* AI and User with Enhanced Voice Wave */}
            <div className="flex items-center justify-between px-2">
              {/* User */}
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={{ 
                    y: [0, -3, 0],
                    boxShadow: stage === 1 ? ['0 0 0px rgba(255,255,255,0.2)', '0 0 15px rgba(255,255,255,0.4)', '0 0 0px rgba(255,255,255,0.2)'] : {}
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-[#222] to-[#333] border-2 border-orange-500/30 flex items-center justify-center"
                >
                  <User className="w-6 h-6 text-gray-300" />
                </motion.div>
                <span className="text-[9px] text-gray-400 font-mono">YOU</span>
              </div>

              {/* Enhanced Voice Wave - FIXED ANIMATION */}
              <div className="flex items-end gap-1 h-16">
                {[1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      height: [
                        `${Math.max(15, h * 4)}%`,
                        `${Math.min(100, h * 12)}%`,
                        `${Math.max(15, h * 4)}%`
                      ],
                      backgroundColor: [
                        '#f97316',
                        '#fb923c',
                        '#f97316'
                      ]
                    }}
                    transition={{ 
                      duration: 1.2, 
                      repeat: Infinity, 
                      delay: i * 0.08,
                      ease: "easeInOut"
                    }}
                    className="w-1.5 rounded-full"
                    style={{ originY: 1 }}
                  />
                ))}
              </div>

              {/* AI Interviewer */}
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                    boxShadow: [
                      '0 0 20px rgba(249,115,22,0.3)',
                      '0 0 40px rgba(249,115,22,0.6)',
                      '0 0 20px rgba(249,115,22,0.3)'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center"
                >
                  <Bot className="w-6 h-6 text-white" />
                </motion.div>
                <span className="text-[9px] text-orange-400 font-mono">INTERA.AI</span>
              </div>
            </div>

            {/* AI Generated Question */}
            <motion.div
              key={stage} // Re-animate when stage changes
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 bg-gradient-to-r from-[#1a1a1a] to-[#222] rounded-xl border border-orange-500/20 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
              <p className="text-[10px] text-gray-300 leading-relaxed pl-2">
                "{aiQuestions[stage % aiQuestions.length]}"
              </p>
              <div className="flex items-center gap-2 mt-2 ml-2">
                <span className="text-[7px] px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full">AI-GENERATED</span>
                <span className="text-[7px] text-gray-500">based on your resume</span>
              </div>
            </motion.div>

            {/* Thinking Indicator */}
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute bottom-2 right-3 text-[6px] text-orange-500/50 font-mono"
            >
              AI ANALYZING RESPONSE...
            </motion.div>
          </div>
        </motion.div>

        {/* Stage 3: CS Fundamentals Assessment */}
        <motion.div
          animate={{ 
            opacity: stage === 2 ? 1 : 0,
            scale: stage === 2 ? 1 : 0.8,
            y: stage === 2 ? 0 : 20
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 p-5"
        >
          <div className="flex items-center gap-1 mb-4">
            <Cpu className="w-3 h-3 text-blue-400" />
            <span className="text-[9px] font-mono text-blue-400/80">AI ASSESSING CORE CS</span>
          </div>

          <div className="space-y-4">
            {[
              { icon: Database, label: "Operating Systems", topics: ["Process Management", "Memory", "File Systems"], score: 85 },
              { icon: Network, label: "Database Systems", topics: ["SQL", "Indexing", "Transactions"], score: 70 },
              { icon: GitBranch, label: "Data Structures", topics: ["Arrays", "Trees", "Graphs"], score: 90 },
              { icon: Cpu, label: "System Design", topics: ["Scalability", "Caching", "Load Balancing"], score: 65 },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-2"
              >
                <item.icon className="w-3 h-3 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-gray-300">{item.label}</span>
                    <span className="text-[8px] text-blue-400">{item.score}%</span>
                  </div>
                  <div className="text-[7px] text-gray-500 mb-1">{item.topics.join(' • ')}</div>
                  <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stage 4: AI Summary Report */}
        <motion.div
          animate={{ 
            opacity: stage === 3 ? 1 : 0,
            scale: stage === 3 ? 1 : 0.8,
            y: stage === 3 ? 0 : 20
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 p-5"
        >
          <div className="flex items-center gap-1 mb-4">
            <Target className="w-3 h-3 text-purple-400" />
            <span className="text-[9px] font-mono text-purple-400/80">AI PERFORMANCE ANALYSIS</span>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "TECHNICAL", score: 87, color: "green" },
                { label: "COMMUNICATION", score: 78, color: "yellow" },
                { label: "PROBLEM SOLVING", score: 92, color: "green" },
                { label: "SYSTEM DESIGN", score: 65, color: "orange" },
              ].map((item, i) => (
                <div key={i} className="bg-[#151515] p-2 rounded-lg border border-white/5">
                  <div className="text-[7px] text-gray-500 mb-1">{item.label}</div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-bold text-${item.color}-400`}>{item.score}%</span>
                    <div className="flex-1 h-1 bg-[#222] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        className={`h-full bg-${item.color}-400 rounded-full`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2 bg-gradient-to-r from-purple-500/10 to-orange-500/10 rounded-lg border border-purple-500/30"
            >
              <p className="text-[8px] text-purple-300 font-mono">
                → Focus on System Design & Distributed Systems<br/>
                → Practice more Database optimization questions<br/>
                → Your DSA skills are interview-ready!
              </p>
            </motion.div>

            <div className="flex items-center justify-center gap-1 text-[7px] text-gray-500">
              <Sparkles className="w-2 h-2 text-orange-400" />
              AI RECOMMENDATIONS BASED ON YOUR PERFORMANCE
            </div>
          </div>
        </motion.div>

        {/* Stage Dots */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20">
          {[0,1,2,3].map(i => (
            <motion.button
              key={i}
              animate={{ 
                scale: stage === i ? 1.2 : 1,
                backgroundColor: stage === i ? '#f97316' : '#333'
              }}
              className="w-1.5 h-1.5 rounded-full cursor-pointer"
              onClick={() => setStage(i)}
            />
          ))}
        </div>
      </div>
    );
  };

  // --- 2. AI ROADMAP - ENHANCED ANIMATION ---
  const TrueRoadmapAnimation = () => {
    const [step, setStep] = React.useState(0);
    
    React.useEffect(() => {
      const interval = setInterval(() => {
        setStep((prev) => (prev + 1) % 3);
      }, 5000);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="relative w-full h-[260px] bg-gradient-to-br from-[#0a0a0a] to-[#151515] rounded-2xl border border-white/5 p-4 overflow-hidden shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)]">
        {/* AI Generation Header */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Workflow className="w-3 h-3 text-orange-500" />
          </motion.div>
          <span className="text-[8px] font-mono text-orange-500/80">AI PATH GENERATOR v2.0</span>
        </div>

        {/* Step 1: AI Configuration */}
        <motion.div
          animate={{ opacity: step === 0 ? 1 : 0, x: step === 0 ? 0 : -20 }}
          className="absolute inset-0 p-5"
        >
          <div className="grid grid-cols-2 gap-2 mt-6">
            <div className="col-span-2 p-2 bg-[#151515] rounded-lg border border-white/5">
              <span className="text-[7px] text-gray-500">DEPARTMENT</span>
              <p className="text-[11px] font-mono text-white">Computer Science (CSE)</p>
            </div>
            <div className="p-2 bg-[#151515] rounded-lg border border-white/5">
              <span className="text-[7px] text-gray-500">ROLE</span>
              <p className="text-[10px] font-mono text-white">SDE / Full Stack</p>
            </div>
            <div className="p-2 bg-[#151515] rounded-lg border border-white/5">
              <span className="text-[7px] text-gray-500">DURATION</span>
              <p className="text-[10px] font-mono text-white">6 Months</p>
            </div>
          </div>

          <div className="mt-3">
            <span className="text-[8px] text-gray-500">AI ANALYZING TOPICS</span>
            <div className="flex flex-wrap gap-1 mt-2">
              {['DSA', 'System Design', 'Frontend', 'Backend', 'Database', 'DevOps'].map((topic, i) => (
                <motion.span
                  key={topic}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="px-2 py-1 bg-orange-500/10 text-orange-400 rounded text-[7px] font-mono"
                >
                  {topic}
                </motion.span>
              ))}
            </div>
          </div>

          <motion.button
            animate={{ 
              scale: [1, 1.02, 1],
              boxShadow: ['0 0 0px rgba(249,115,22,0.5)', '0 0 15px rgba(249,115,22,0.8)', '0 0 0px rgba(249,115,22,0.5)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-full mt-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-[10px] font-bold text-white flex items-center justify-center gap-1"
          >
            <Zap className="w-3 h-3" /> GENERATE AI ROADMAP
          </motion.button>
        </motion.div>

        {/* Step 2: AI Generation */}
        <motion.div
          animate={{ opacity: step === 1 ? 1 : 0 }}
          className="absolute inset-0 p-5"
        >
          <div className="relative h-full mt-6">
            {/* Animated Path */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-purple-500 to-blue-500">
              <motion.div
                animate={{ 
                  y: ['-100%', '100%'],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-full h-10 bg-white blur-sm"
              />
            </div>

            <div className="space-y-5 ml-8">
              {[
                { month: "MONTH 1-2", title: "Frontend Foundations", topics: "HTML/CSS, JavaScript, React", progress: 100 },
                { month: "MONTH 3-4", title: "Backend Development", topics: "Node.js, Python, APIs", progress: 60 },
                { month: "MONTH 5-6", title: "System Design", topics: "Architecture, Scaling, DB Design", progress: 20 },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 1.2 }}
                  className="relative"
                >
                  <div className="absolute -left-7 top-1 w-3 h-3 rounded-full bg-orange-500 border-2 border-black" />
                  <div className="p-2 bg-[#151515] rounded-lg border border-white/5">
                    <div className="flex justify-between">
                      <span className="text-[7px] text-orange-400 font-mono">{item.month}</span>
                      <span className="text-[7px] text-gray-500">{item.progress}%</span>
                    </div>
                    <p className="text-[9px] font-bold text-white">{item.title}</p>
                    <p className="text-[7px] text-gray-500 mt-1">{item.topics}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Step 3: Complete AI Roadmap */}
        <motion.div
          animate={{ opacity: step === 2 ? 1 : 0 }}
          className="absolute inset-0 p-5"
        >
          <div className="mt-6 space-y-2">
            {[
              { phase: "PHASE 1", title: "Frontend Mastery", duration: "8 weeks", status: "COMPLETED", score: 92 },
              { phase: "PHASE 2", title: "Backend Architecture", duration: "8 weeks", status: "IN PROGRESS", score: 65 },
              { phase: "PHASE 3", title: "Full Stack Projects", duration: "8 weeks", status: "UPCOMING", score: 0 },
            ].map((phase, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.2 }}
                className={`p-2 rounded-lg border ${
                  phase.status === 'COMPLETED' ? 'bg-green-500/10 border-green-500/30' :
                  phase.status === 'IN PROGRESS' ? 'bg-orange-500/10 border-orange-500/30' :
                  'bg-[#151515] border-white/5'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[7px] text-gray-500">{phase.phase}</span>
                    <p className="text-[9px] font-bold text-white">{phase.title}</p>
                  </div>
                  <span className={`text-[7px] px-2 py-0.5 rounded-full ${
                    phase.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                    phase.status === 'IN PROGRESS' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {phase.status}
                  </span>
                </div>
                {phase.score > 0 && (
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-[#222] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${phase.score}%` }}
                        className="h-full bg-orange-500 rounded-full"
                      />
                    </div>
                    <span className="text-[6px] text-gray-500">{phase.score}%</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            <Download className="w-3 h-3 text-orange-500" />
            <span className="text-[7px] text-gray-400 font-mono">DOWNLOAD AI ROADMAP</span>
          </div>
        </motion.div>

        {/* Step Dots */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20">
          {[0,1,2].map(i => (
            <motion.button
              key={i}
              animate={{ scale: step === i ? 1.2 : 1, backgroundColor: step === i ? '#f97316' : '#333' }}
              className="w-1.5 h-1.5 rounded-full cursor-pointer"
              onClick={() => setStep(i)}
            />
          ))}
        </div>
      </div>
    );
  };

  // --- 3. AI Q&A VISUAL - ENHANCED ---
  const QuestionVisual = () => {
    const [mode, setMode] = React.useState(0);
    
    React.useEffect(() => {
      const interval = setInterval(() => {
        setMode((prev) => (prev + 1) % 3);
      }, 4000);
      return () => clearInterval(interval);
    }, []);

    const pyqQuestions = [
      { company: "Google", question: "Design a distributed key-value store", year: "2024", difficulty: "HARD" },
      { company: "Microsoft", question: "Implement thread-safe LRU cache", year: "2023", difficulty: "MEDIUM" },
      { company: "Amazon", question: "Design Amazon's recommendation system", year: "2024", difficulty: "HARD" },
    ];

    return (
      <div className="relative w-full h-[180px] bg-gradient-to-br from-[#0a0a0a] to-[#151515] rounded-2xl border border-white/5 p-3 overflow-hidden shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)]">
        
        {/* Mode Selector */}
        <div className="flex gap-1 mb-3">
          {['GENERAL', 'COMPANY PYQ', 'TOPIC WISE'].map((m, i) => (
            <motion.div
              key={m}
              animate={{ 
                backgroundColor: mode === i ? '#f97316' : 'transparent',
                color: mode === i ? '#fff' : '#666'
              }}
              className="px-2 py-0.5 rounded text-[7px] font-mono cursor-pointer border border-white/5"
              onClick={() => setMode(i)}
            >
              {m}
            </motion.div>
          ))}
        </div>

        {/* Mode 0: General */}
        <motion.div
          animate={{ opacity: mode === 0 ? 1 : 0, x: mode === 0 ? 0 : -20 }}
          className="absolute inset-0 p-3 pt-8"
        >
          <div className="grid grid-cols-2 gap-2">
            {['DSA', 'SYSTEM DESIGN', 'OS', 'DBMS', 'NETWORKING', 'OOP'].map((topic, i) => (
              <motion.div
                key={topic}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-2 bg-[#151515] rounded-lg border border-white/5 text-center"
              >
                <span className="text-[7px] font-mono text-orange-400">{topic}</span>
                <div className="flex justify-center gap-1 mt-1">
                  <span className="text-[6px] px-1 py-0.5 bg-green-500/20 text-green-400 rounded">E</span>
                  <span className="text-[6px] px-1 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">M</span>
                  <span className="text-[6px] px-1 py-0.5 bg-red-500/20 text-red-400 rounded">H</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mode 1: Company PYQs */}
        <motion.div
          animate={{ opacity: mode === 1 ? 1 : 0, x: mode === 1 ? 0 : -20 }}
          className="absolute inset-0 p-3 pt-8 overflow-y-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {pyqQuestions.map((q, i) => (
            <motion.div
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="mb-2 p-2 bg-[#151515] rounded-lg border border-white/5"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Building2 className="w-2 h-2 text-blue-400" />
                  <span className="text-[7px] font-bold text-blue-400">{q.company}</span>
                  <span className="text-[6px] text-gray-500">'{q.year}</span>
                </div>
                <span className={`text-[6px] px-1.5 py-0.5 rounded ${
                  q.difficulty === 'HARD' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {q.difficulty}
                </span>
              </div>
              <p className="text-[7px] text-gray-400 mt-1">{q.question}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Mode 2: Topic Wise */}
        <motion.div
          animate={{ opacity: mode === 2 ? 1 : 0, x: mode === 2 ? 0 : -20 }}
          className="absolute inset-0 p-3 pt-8"
        >
          <div className="grid grid-cols-2 gap-2">
            {[
              { topic: "Arrays", count: 156, mastered: 89 },
              { topic: "Trees", count: 98, mastered: 45 },
              { topic: "Graphs", count: 87, mastered: 34 },
              { topic: "Dynamic Prog", count: 112, mastered: 56 },
            ].map((item, i) => (
              <div key={i} className="p-2 bg-[#151515] rounded-lg border border-white/5">
                <div className="flex justify-between">
                  <span className="text-[7px] font-mono text-orange-400">{item.topic}</span>
                  <span className="text-[6px] text-gray-500">{item.count} Q</span>
                </div>
                <div className="mt-1 h-1 bg-[#222] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.mastered / item.count) * 100}%` }}
                    className="h-full bg-green-500 rounded-full"
                  />
                </div>
                <span className="text-[5px] text-gray-600">{item.mastered} mastered</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  };

  // --- 4. AI QUIZ MASTER - ENHANCED ---
  const QuizVisual = () => {
    const [qIndex, setQIndex] = React.useState(0);
    
    React.useEffect(() => {
      const interval = setInterval(() => {
        setQIndex((prev) => (prev + 1) % 3);
      }, 4000);
      return () => clearInterval(interval);
    }, []);

    const questions = [
      { 
        topic: "Data Structures", 
        weight: 60, 
        text: "Time complexity of quicksort in worst case?",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
        correct: 2,
        userMastery: "EXPERT"
      },
      { 
        topic: "Computer Networks", 
        weight: 40, 
        text: "Which protocol ensures reliable data transmission?",
        options: ["UDP", "TCP", "IP", "HTTP"],
        correct: 1,
        userMastery: "INTERMEDIATE"
      },
      { 
        topic: "Database Systems", 
        weight: 50, 
        text: "What does ACID property ensure?",
        options: ["Atomicity, Consistency, Isolation, Durability", "Availability, Consistency, Integrity, Durability", "All Commands In Database", "Atomic, Continuous, Isolated, Durable"],
        correct: 0,
        userMastery: "BEGINNER"
      },
    ];

    return (
      <div className="relative w-full h-[180px] bg-gradient-to-br from-[#0a0a0a] to-[#151515] rounded-2xl border border-white/5 p-3 overflow-hidden shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)]">
        
        {/* Security Header */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <Shield className="w-2 h-2 text-green-500" />
            <span className="text-[6px] font-mono text-green-500">SECURE ENV</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="w-2 h-2 text-gray-600" />
            <span className="text-[5px] text-gray-600">NO TAB SWITCH</span>
          </div>
          <div className="flex items-center gap-1">
            <Gauge className="w-2 h-2 text-orange-500" />
            <span className="text-[5px] text-orange-500">{questions[qIndex].weight}% WEIGHT</span>
          </div>
        </div>

        {/* Question Area */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Radar className="w-2 h-2 text-orange-400" />
              <span className="text-[6px] font-mono text-orange-400">{questions[qIndex].topic}</span>
            </div>
            <span className={`text-[5px] px-1 py-0.5 rounded ${
              questions[qIndex].userMastery === 'EXPERT' ? 'bg-green-500/20 text-green-400' :
              questions[qIndex].userMastery === 'INTERMEDIATE' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {questions[qIndex].userMastery}
            </span>
          </div>

          <p className="text-[8px] text-white leading-tight">{questions[qIndex].text}</p>

          <div className="space-y-1.5">
            {questions[qIndex].options.map((opt, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.01 }}
                className={`p-1.5 rounded border ${
                  i === questions[qIndex].correct && qIndex === 1 
                    ? 'bg-green-500/20 border-green-500' 
                    : 'bg-[#151515] border-white/5'
                }`}
              >
                <span className="text-[6px] text-gray-400">{opt}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Timer & Progress */}
        <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Clock className="w-2 h-2 text-gray-500" />
            <span className="text-[5px] text-gray-500">02:30</span>
          </div>
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <motion.div
                key={i}
                animate={{ 
                  scale: qIndex === i ? 1.2 : 1,
                  backgroundColor: qIndex === i ? '#f97316' : i < qIndex ? '#22c55e' : '#333'
                }}
                className="w-1 h-1 rounded-full"
              />
            ))}
          </div>
          <div className="text-[4px] text-red-500/50 font-mono">⚠️ TAB LOCKED</div>
        </div>

        {/* AI Adaptation Indicator */}
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-0 right-0 text-[4px] text-orange-500/30 font-mono p-1"
        >
          AI ADAPTING DIFFICULTY
        </motion.div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="bg-white min-h-screen overflow-hidden relative">
      
      {/* BACKGROUND DEPTH - EXACTLY AS YOUR ORIGINAL */}
      <div className="absolute inset-0 bg-white pointer-events-none z-0"></div>
      <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-orange-100/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] bg-black/5 blur-[150px] rounded-full pointer-events-none z-0"></div>

      {/* ARCHITECTURAL LINES - EXACTLY AS YOUR ORIGINAL */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute left-[6%] lg:left-[10%] top-0 bottom-0 w-[1px] bg-black/10">
          <span className="absolute top-[10%] -left-3 transform -rotate-90 origin-top text-[9px] font-bold tracking-[0.4em] text-black/30 whitespace-nowrap">
            SYSTEM_NODE // AI_READY 
          </span>
        </div>
        
        <div className="absolute right-[6%] lg:right-[10%] top-0 bottom-0 w-[1px] bg-black/10">
          <span className="absolute bottom-[20%] left-3 transform rotate-90 origin-bottom text-[9px] font-bold tracking-[0.4em] text-black/30 whitespace-nowrap">
            CORE_V1 // ONLINE
          </span>
        </div>

        <div className="absolute left-[1%] lg:left-[1%] top-0 bottom-0 w-[1px] bg-black/10">
          <span className="absolute bottom-[60%] left-3 transform rotate-90 origin-bottom text-[9px] font-bold tracking-[0.4em] text-black/30 whitespace-nowrap">
            INTERA-AI
          </span>
        </div>

        <div className="absolute top-[20%] left-0 right-0 h-[1px] bg-black/10">
          <span className="absolute right-[12%] -top-5 text-[9px] font-bold tracking-[0.4em] text-black/30">
            INTERA-AI // MODULE_SYSTEM
          </span>
          <span className="absolute left-[2.5%] -top-5 text-[9px] font-bold tracking-[0.4em] text-black/30">
            LATENCY_TEST: OK
          </span>
        </div>

        <div className="absolute top-[20%] left-0 right-0 h-[1px] bg-black/10">
          <span className="absolute left-[4%] -bottom-305 text-[9px] font-bold tracking-[0.4em] text-black/30">
            ENGINE_STATUS: OPTIMAL
          </span>
        </div>

        <div className="absolute bottom-[10%] left-0 right-0 h-[1px] bg-black/10">
          <span className="absolute left-[12%] top-2 text-[9px] font-bold tracking-[0.4em] text-black/30">
            ACTIVE_ENGINES // 04
          </span>
          <span className="absolute right-[15%] top-2 text-[9px] font-bold tracking-[0.4em] text-black/30">
            SECURE_ENV: ENABLED
          </span>
        </div>
      </div>

      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 tracking-tight text-[#0a0a0a]">
            <span className='border-b-8 border-orange-400 border-dotted '>AI-Powered</span> <span className="text-orange-400/90">Modules</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-gray-600 max-w-2xl mx-auto font-medium tracking-wide">
            Four intelligent engines working for your success. <span className="text-black font-bold">Practice, Analyze, Track Progress,</span> and <span className="text-black font-bold">Gain Insights</span>.
          </motion.p>
        </div>
      </section>

      {/* THE "FRAME" BENTO BOX GRID - OPTIMIZED LAYOUT */}
      <section className="px-4 sm:px-6 lg:px-8 pb-32 z-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            
            {/* CARD 1: Mock Interviews - LARGE */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              className="lg:col-span-7 bg-[#050505] p-2 rounded-[32px] border border-white/10 shadow-xl group hover:-translate-y-1 transition-all duration-300"
            >
              <div className="bg-gray-700/20 rounded-[24px] border border-gray-700 p-5 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400/20 to-orange-600/20 border border-orange-600/50 flex items-center justify-center">
                    <Waves className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">AI Mock Interviews</h3>
                </div>
                
                <p className="text-gray-400 text-md mb-3 leading-relaxed">
                  Upload resume → AI extracts skills → Live interview with CS fundamentals → Detailed performance summary
                </p>
                
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="px-2 py-1 bg-[#1a1a1a] border border-white/10 rounded-md text-[13px] text-white font-medium">Resume Parsing</span>
                  <span className="px-2 py-1 bg-[#1a1a1a] border border-white/10 rounded-md text-[13px] text-white font-medium">CS Core</span>
                  <span className="px-2 py-1 bg-[#1a1a1a] border border-white/10 rounded-md text-[13px] text-white font-medium">Summary Report</span>
                </div>
                
                <div className="h-[260px]"><AnimatedVoiceCall /></div>
              </div>
            </motion.div>

            {/* CARD 2: AI Roadmap - MEDIUM */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }} 
              viewport={{ once: true }}
              className="lg:col-span-5 bg-[#050505] p-2 rounded-[32px] border border-white/10 shadow-xl group hover:-translate-y-1 transition-all duration-300"
            >
              <div className="bg-gray-700/20 rounded-[24px] border border-gray-700 p-5 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-700/20 border border-white/30 flex items-center justify-center">
                    <Map className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">AI Roadmap</h3>
                </div>
                
                <p className="text-gray-400 text-md mb-3">
                  Select Department → Choose Role → Set Duration → Get personalized weekly milestones
                </p>
                
                <div className="h-[260px]"><TrueRoadmapAnimation /></div>
              </div>
            </motion.div>

            {/* CARD 3: Interview Q&A - MEDIUM */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }} 
              viewport={{ once: true }}
              className="lg:col-span-5 bg-[#050505] p-2 rounded-[32px] border border-white/10 shadow-xl group hover:-translate-y-1 transition-all duration-300"
            >
              <div className="bg-gray-700/20 rounded-[24px] border border-gray-700 p-5 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-700/20 border border-white/30 flex items-center justify-center">
                    <Brain className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Interview Q&A</h3>
                </div>
                
                <p className="text-gray-400 text-md mb-3">
                  Filter by Department, Role, Topic, Difficulty. General Q&A or Company PYQs
                </p>
                
                <div className="flex gap-1.5 mb-2">
                  <span className="px-2 py-1 bg-[#1a1a1a] border border-white/10 rounded-md text-[10px] text-white font-medium">Company PYQs</span>
                  <span className="px-2 py-1 bg-[#1a1a1a] border border-white/10 rounded-md text-[10px] text-white font-medium">Difficulty Filter</span>
                </div>
                
                <div className="h-[180px]"><QuestionVisual /></div>
              </div>
            </motion.div>

            {/* CARD 4: AI Quiz Master - LARGE */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }} 
              viewport={{ once: true }}
              className="lg:col-span-7 bg-black p-2 rounded-[32px] border border-white/10 shadow-xl group hover:-translate-y-1 transition-all duration-300"
            >
              <div className="bg-gray-700/20 rounded-[24px] border border-gray-700 p-5 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400/20 to-orange-600/20 border border-orange-600 flex items-center justify-center">
                    <Gamepad2 className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">AI Quiz Master</h3>
                </div>
                
                <p className="text-gray-200 text-md mb-3">
                  Adaptive quizzes with weighted difficulty. Secure environment with anti-cheat protection
                </p>
                
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="px-2 py-1 bg-[#1a1a1a] border border-white/10 rounded-md text-[10px] text-white font-medium">Custom Difficulty</span>
                  <span className="px-2 py-1 bg-[#1a1a1a] border border-white/10 rounded-md text-[10px] text-white font-medium">Secure Env</span>
                  <span className="px-2 py-1 bg-[#1a1a1a] border border-white/10 rounded-md text-[10px] text-white font-medium">No Tab Switch</span>
                </div>
                
                <div className="h-[180px]"><QuizVisual /></div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default WhatWeOffer;