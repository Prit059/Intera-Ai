import React, { useState } from "react";
import {
  FiPlus, FiUpload, FiEdit2, FiTrash2, FiSave, FiEye, 
  FiArrowLeft, FiClock, FiAward, FiBarChart2, FiDownload,
  FiCheckCircle, FiXCircle, FiCalendar, FiWatch, FiTag,
  FiHelpCircle, FiInfo, FiSettings, FiList, FiLoader
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

// Aptitude categories and question types
const APTITUDE_CATEGORIES = [
  "Quantitative Aptitude", "Logical Reasoning", "Verbal Ability",
  "Data Interpretation", "Puzzles", "Non-Verbal Reasoning",
  "Abstract Reasoning", "Technical Aptitude", "Other"
];

const QUESTION_TYPES = [
  "Multiple Choice (MCQ)",
  "True/False",
  "Multiple Response",
  "Fill in the Blanks",
  "Short Answer",
  "Matching"
];

const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard", "Very Hard"];

function AdAptitude() {
  const [step, setStep] = useState(1);
  const [aptitudeData, setAptitudeData] = useState({
    title: "",
    category: "",
    customCategory: "",
    subCategory: "",
    difficulty: "Medium",
    timeLimit: 30,
    contestType: "general",
    description: "",
    tags: [],
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    maxAttempts: "unlimited",
    pointsPerQuestion: 1,
    passingScore: 60,
    negativeMarking: false,
    negativeMarks: 0.25,
    specialInstructions: "",
    showExplanation: true
  });
  
  const [questions, setQuestions] = useState([]);
  const [importType, setImportType] = useState("manual");
  const [showPreview, setShowPreview] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    questionType: "Multiple Choice (MCQ)",
    options: ["", "", "", ""],
    correctAnswer: null,
    explanation: "",
    marks: aptitudeData.pointsPerQuestion > 0 ? aptitudeData.pointsPerQuestion : 1,
    timeLimit: 0,
    imageUrl: "",
    difficulty: "Medium"
  });

  // Update end date/time when start date/time changes
  const updateEndDateTime = (startDate, startTime) => {
    if (startDate && startTime) {
      const start = new Date(`${startDate}T${startTime}`);
      
      // Add timeLimit minutes to start time
      const end = new Date(start.getTime() + (aptitudeData.timeLimit * 60000));
      
      // Format dates properly for display
      const endDate = end.toISOString().split('T')[0];
      const endTime = end.toTimeString().substring(0, 5);
      
      setAptitudeData(prev => ({
        ...prev,
        endDate,
        endTime
      }));
    }
  };
  // Handle start date change
  const handleStartDateChange = (date) => {
    setAptitudeData(prev => ({ ...prev, startDate: date }));
    updateEndDateTime(date, aptitudeData.startTime);
  };

  // Handle start time change
  const handleStartTimeChange = (time) => {
    setAptitudeData(prev => ({ ...prev, startTime: time }));
    updateEndDateTime(aptitudeData.startDate, time);
  };

  // Handle time limit change
  const handleTimeLimitChange = (minutes) => {
    if (minutes < 1) {
      toast.error("Time limit must be at least 1 minute");
      return;
    }
    
    setAptitudeData(prev => ({ ...prev, timeLimit: minutes }));
    if (aptitudeData.startDate && aptitudeData.startTime) {
      updateEndDateTime(aptitudeData.startDate, aptitudeData.startTime);
    }
  };

  // Save aptitude to backend
  const saveAptitude = async () => {
    try {
      setLoading(true);

      // Validation - Fix date comparison
      const startDateTime = new Date(`${aptitudeData.startDate}T${aptitudeData.startTime}`);
      const endDateTime = new Date(`${aptitudeData.endDate}T${aptitudeData.endTime}`);

      if (startDateTime >= endDateTime) {
        toast.error("End date/time must be after start date/time");
        return;
      }

      if (startDateTime < new Date()) {
        toast.error("Start date/time cannot be in the past");
        return;
      }

      if (questions.length === 0) {
        toast.error("Please add at least one question");
        return;
      }

      // Prepare payload according to backend schema
      const aptitudePayload = {
        title: aptitudeData.title,
        category: aptitudeData.category === "Other" ? aptitudeData.customCategory : aptitudeData.category,
        customCategory: aptitudeData.category === "Other" ? aptitudeData.customCategory : undefined,
        subCategory: aptitudeData.subCategory,
        difficulty: aptitudeData.difficulty,
        timeLimit: aptitudeData.timeLimit,
        contestType: aptitudeData.contestType,
        description: aptitudeData.description,
        tags: aptitudeData.tags,
        schedule: {
          startDate: aptitudeData.startDate,
          startTime: aptitudeData.startTime,
          endDate: aptitudeData.endDate,
          endTime: aptitudeData.endTime
        },
        scoring: {
          maxAttempts: aptitudeData.maxAttempts,
          pointsPerQuestion: aptitudeData.pointsPerQuestion,
          passingScore: aptitudeData.passingScore,
          negativeMarking: aptitudeData.negativeMarking,
          negativeMarks: aptitudeData.negativeMarks
        },
        specialInstructions: aptitudeData.specialInstructions,
        showExplanation: aptitudeData.showExplanation,
        questions: questions,
        security: {
          safeMode: true,
          maxViolations: 3,
          fullScreenRequired: true,
          disableCopyPaste: true,
          disableRightClick: true
        }
      };

      // Send API request
      const response = await axiosInstance.post(API_PATHS.ADAPTITUDE.CREATE, aptitudePayload);
      
      if (response.data.success) {
        toast.success("Aptitude quiz created successfully!");
        // Reset form
        setStep(1);
        setAptitudeData({
          title: "",
          category: "",
          customCategory: "",
          subCategory: "",
          difficulty: "Medium",
          timeLimit: 30,
          contestType: "general",
          description: "",
          tags: [],
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: "",
          maxAttempts: "unlimited",
          pointsPerQuestion: 1,
          passingScore: 60,
          negativeMarking: false,
          negativeMarks: 0.25,
          specialInstructions: "",
          showExplanation: true
        });
        setQuestions([]);
      } else {
        toast.error(response.data.message || "Failed to create quiz");
      }
    } catch (error) {
      console.error("Error creating aptitude quiz:", error);
      toast.error(error.response?.data?.message || "An error occurred while creating the aptitude quiz");
    } finally {
      setLoading(false);
    }
  };

  // Add or update question
  const saveQuestion = () => {
    if (!newQuestion.questionText || newQuestion.correctAnswer === null) {
      toast.error("Please fill all required fields");
      return;
    }

    if (editingIndex !== null) {
      // Update existing question
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = newQuestion;
      setQuestions(updatedQuestions);
      toast.success("Question updated successfully!");
    } else {
      // Add new question
      setQuestions([...questions, newQuestion]);
      toast.success("Question added successfully!");
    }

    // Reset form
    setNewQuestion({
      questionText: "",
      questionType: "Multiple Choice (MCQ)",
      options: ["", "", "", ""],
      correctAnswer: null,
      explanation: "",
      marks: aptitudeData.pointsPerQuestion > 0 ? aptitudeData.pointsPerQuestion : 1,
      timeLimit: 0,
      imageUrl: "",
      difficulty: "Medium"
    });
    setEditingIndex(null);
  };

  // Edit question
  const editQuestion = (index) => {
    setNewQuestion(questions[index]);
    setEditingIndex(index);
  };

  // Remove question
  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
    toast.success("Question removed");
  };

  // Add option field
  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, ""]
    });
  };

  // Remove option field
  const removeOption = (index) => {
    if (newQuestion.options.length <= 2) {
      toast.error("At least 2 options are required");
      return;
    }
    
    const newOptions = newQuestion.options.filter((_, i) => i !== index);
    setNewQuestion({
      ...newQuestion,
      options: newOptions,
      correctAnswer: newQuestion.correctAnswer === index ? null : 
                   newQuestion.correctAnswer > index ? newQuestion.correctAnswer - 1 : newQuestion.correctAnswer
    });
  };

  // Handle option change
  const handleOptionChange = (index, value) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({
      ...newQuestion,
      options: newOptions
    });
  };

  // Download import template
  const downloadTemplate = () => {
    const template = {
      format: "aptitude-quiz-v1",
      quiz: {
        title: "Sample Quiz Title",
        category: "Quantitative Aptitude",
        difficulty: "Medium",
        timeLimit: 30,
        pointsPerQuestion: 1,
        passingScore: 60
      },
      questions: [
        {
          questionText: "Sample question text?",
          questionType: "Multiple Choice (MCQ)",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctAnswer: 0,
          explanation: "Explanation for correct answer",
          marks: 1,
          timeLimit: 60
        }
      ]
    };

    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'aptitude_quiz_template.json');
    linkElement.click();
  };

  // Step 1: Basic Information
  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FiAward className="text-blue-500" />
        Step 1: Basic Information
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Quiz Title *</label>
          <input
            type="text"
            value={aptitudeData.title}
            onChange={e => setAptitudeData({...aptitudeData, title: e.target.value})}
            className="w-full p-3 bg-gray-700/20 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Quantitative Aptitude Master Test"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category *</label>
          <select
            value={aptitudeData.category}
            onChange={e => setAptitudeData({...aptitudeData, category: e.target.value})}
            className="w-full p-3 bg-gray-700/20 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="" className="bg-black">Select Category</option>
            {APTITUDE_CATEGORIES.map((cat, idx) => (
              <option className="bg-black" key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {aptitudeData.category === "Other" && (
          <div>
            <label className="block text-sm font-medium mb-2">Custom Category *</label>
            <input
              type="text"
              value={aptitudeData.customCategory}
              onChange={e => setAptitudeData({...aptitudeData, customCategory: e.target.value})}
              className="w-full p-3 bg-gray-700/20 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter custom category"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Sub-Category</label>
          <input
            type="text"
            value={aptitudeData.subCategory}
            onChange={e => setAptitudeData({...aptitudeData, subCategory: e.target.value})}
            className="w-full p-3 bg-gray-700/20 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Percentages, Ratios, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Difficulty Level *</label>
          <select
            value={aptitudeData.difficulty}
            onChange={e => setAptitudeData({...aptitudeData, difficulty: e.target.value})}
            className="w-full p-3 bg-gray-700/20 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {DIFFICULTY_LEVELS.map((diff, idx) => (
              <option key={idx} value={diff} className="bg-black">{diff}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Duration (minutes) *</label>
          <input
            type="number"
            value={aptitudeData.timeLimit}
            onChange={e => handleTimeLimitChange(parseInt(e.target.value))}
            className="w-full p-3 bg-gray-700/20 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="5"
          />
        </div>

// In AdAptitude.jsx - Update the contest type section
<div>
  <label className="block text-sm font-medium mb-2">Contest Type *</label>
  <select
    value={aptitudeData.contestType}
    onChange={e => setAptitudeData({...aptitudeData, contestType: e.target.value})}
    className="w-full p-3 bg-gray-700/20 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  >
    <option value="general" className="bg-black">General Practice</option>
    <option value="friday" className="bg-black">Friday Contest</option>
  </select>
  {aptitudeData.contestType === "friday" && (
    <p className="text-xs text-yellow-400 mt-1">
      Friday contests appear in the special Friday Contest dashboard
    </p>
  )}
</div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={aptitudeData.description}
          onChange={e => setAptitudeData({...aptitudeData, description: e.target.value})}
          className="w-full p-3 bg-gray-700/20 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="3"
          placeholder="Describe this aptitude quiz, what topics it covers, and what students will learn..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {aptitudeData.tags.map((tag, index) => (
            <span key={index} className="bg-blue-600 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              {tag}
              <button
                onClick={() => setAptitudeData({
                  ...aptitudeData,
                  tags: aptitudeData.tags.filter((_, i) => i !== index)
                })}
                className="text-xs hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a tag and press Enter"
            className="flex-1 p-2 bg-gray-700/20 rounded border border-gray-600 text-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                setAptitudeData({
                  ...aptitudeData,
                  tags: [...aptitudeData.tags, e.target.value.trim()]
                });
                e.target.value = '';
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder="Add a tag and press Enter"]');
              if (input.value.trim()) {
                setAptitudeData({
                  ...aptitudeData,
                  tags: [...aptitudeData.tags, input.value.trim()]
                });
                input.value = '';
              }
            }}
            className="bg-gray-600/20 hover:bg-gray-700/20 px-3 rounded"
          >
            <FiPlus />
          </button>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep(2)}
          disabled={!aptitudeData.title || !aptitudeData.category || 
                  (aptitudeData.category === "Other" && !aptitudeData.customCategory)}
          className="bg-blue-700/20 hover:bg-blue-600/30 border border-blue-600 px-6 py-3 rounded-lg font-semibold disabled:bg-gray-600/20 disabled:border disabled:border-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          Next: Schedule & Scoring
        </button>
      </div>
    </div>
  );

  // Step 2: Schedule & Scoring
  const renderScheduleScoring = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FiCalendar className="text-blue-500" />
        Step 2: Schedule & Scoring
      </h2>

      <div className="bg-gray-700/20 border border-gray-700 p-6 rounded-lg">
        <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
          <FiWatch className="text-blue-400" />
          Schedule Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date *</label>
            <input
              type="date"
              value={aptitudeData.startDate}
              onChange={e => handleStartDateChange(e.target.value)}
              className="w-full p-3 bg-gray-600/20 rounded-lg border border-gray-700 text-white focus:bg-gray-600/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Start Time *</label>
            <input
              type="time"
              value={aptitudeData.startTime}
              onChange={e => handleStartTimeChange(e.target.value)}
              className="w-full p-3 bg-gray-600/20 rounded-lg border border-gray-700 text-white focus:bg-gray-600/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={aptitudeData.endDate}
              readOnly
              className="w-full p-3 bg-gray-600/20 rounded-lg border border-gray-700 text-white focus:bg-gray-600/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">End Time</label>
            <input
              type="time"
              value={aptitudeData.endTime}
              readOnly
              className="w-full p-3 bg-gray-600/20 rounded-lg border border-gray-700 text-white focus:bg-gray-600/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          End date/time is automatically calculated based on start time and duration
        </p>
      </div>

      <div className="bg-gray-700/20 border border-gray-700 p-6 rounded-lg">
        <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
          <FiBarChart2 className="text-blue-400" />
          Scoring Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Max Attempts</label>
            <select
              value={aptitudeData.maxAttempts}
              onChange={e => setAptitudeData({...aptitudeData, maxAttempts: e.target.value})}
              className="w-full p-3 bg-gray-600/20 rounded-lg border border-gray-700 text-white focus:bg-gray-600/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="unlimited" className="bg-black">Unlimited</option>
              <option value="1" className="bg-black">1 Attempt</option>
              <option value="2" className="bg-black">2 Attempts</option>
              <option value="3" className="bg-black">3 Attempts</option>
              <option value="5" className="bg-black">5 Attempts</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Points per Question</label>
            <input
              type="number"
              value={aptitudeData.pointsPerQuestion}
              onChange={e => setAptitudeData({...aptitudeData, pointsPerQuestion: parseFloat(e.target.value)})}
              className="w-full p-3 bg-gray-600/20 rounded-lg border border-gray-700 text-white focus:bg-gray-600/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="0.5"
            />
            <p className="text-xs text-gray-400 mt-1">
              Set to 0 to assign points individually per question
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Passing Score (%)</label>
            <input
              type="number"
              value={aptitudeData.passingScore}
              onChange={e => setAptitudeData({...aptitudeData, passingScore: parseInt(e.target.value)})}
              className="w-full p-3 bg-gray-600/20 rounded-lg border border-gray-500 text-white focus:bg-gray-600/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="100"
            />
          </div>

          </div>
          <div className="flex mt-5 items-center gap-3">
            <input
              type="checkbox"
              checked={aptitudeData.negativeMarking}
              onChange={e => setAptitudeData({...aptitudeData, negativeMarking: e.target.checked})}
              className="rounded border-gray-600"
              id="negativeMarking"
            />
            <label htmlFor="negativeMarking">Enable Negative Marking</label>
          </div>

          {aptitudeData.negativeMarking && (
            <div>
              <label className="block text-sm font-medium mb-2">Negative Marks per Wrong Answer</label>
              <input
                type="number"
                value={aptitudeData.negativeMarks}
                onChange={e => setAptitudeData({...aptitudeData, negativeMarks: parseFloat(e.target.value)})}
                className="p-3 bg-gray-600/20 w-95 rounded-lg border border-gray-700 text-white"
                min="0"
                step="0.25"
              />
            </div>
          )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Special Instructions</label>
        <textarea
          value={aptitudeData.specialInstructions}
          onChange={e => setAptitudeData({...aptitudeData, specialInstructions: e.target.value})}
          className="w-full p-3 bg-gray-700/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-gray-600/40"
          rows="3"
          placeholder="Any special instructions for students taking this quiz..."
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep(1)}
          className="bg-gray-600/20 hover:bg-gray-500 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <FiArrowLeft /> Back
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={!aptitudeData.startDate || !aptitudeData.startTime}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          Next: Add Questions
        </button>
      </div>
    </div>
  );

  // Step 3: Add Questions
  const renderAddQuestions = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FiHelpCircle className="text-blue-500" />
        Step 3: Add Questions ({questions.length} added)
      </h2>

      <div className="bg-gray-700/20 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-3">Import Questions</h3>
        <div className="flex gap-4 mb-4">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${importType === "manual" ? "bg-blue-600" : "bg-gray-700/20 border border-gray-600/20 hover:bg-gray-500/30"}`}
            onClick={() => setImportType("manual")}
          >
            <FiPlus /> Manual Input
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${importType === "file" ? "bg-blue-600" : "bg-gray-700/20 border border-gray-600 hover:bg-gray-500/30"}`}
            onClick={() => setImportType("file")}
          >
            <FiUpload /> Import File
          </button>
        </div>

        {importType === "file" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-600/20 rounded-lg p-6 text-center">
              <FiUpload className="text-3xl mx-auto mb-2 text-gray-400" />
              <p className="mb-3">Upload your question file (JSON format)</p>
              <input
                type="file"
                accept=".json"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded cursor-pointer inline-block">
                Browse Files
              </label>
            </div>
            
            <div className="text-center">
              <button
                onClick={downloadTemplate}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-2 justify-center"
              >
                <FiDownload /> Download Template
              </button>
              <p className="text-xs text-gray-400 mt-1">Use our template for proper formatting</p>
            </div>
          </div>
        )}
      </div>

      {importType === "manual" && (
        <div className="bg-gray-700/20 border border-gray-700 p-6 rounded-lg">
          <h3 className="font-semibold mb-4 text-lg">
            {editingIndex !== null ? `Edit Question ${editingIndex + 1}` : "Add New Question"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Question Type</label>
              <select
                value={newQuestion.questionType}
                onChange={e => setNewQuestion({...newQuestion, questionType: e.target.value})}
                className="w-full p-3 bg-gray-600/20 rounded-lg border border-gray-500 text-white"
              >
                {QUESTION_TYPES.map((type, idx) => (
                  <option key={idx} value={type} className="bg-black">{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                value={newQuestion.difficulty}
                onChange={e => setNewQuestion({...newQuestion, difficulty: e.target.value})}
                className="w-full p-3 bg-gray-600/20 rounded-lg border border-gray-500 text-white"
              >
                {DIFFICULTY_LEVELS.map(level => (
                  <option key={level} value={level} className="bg-black">{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Question Text *</label>
            <textarea
              value={newQuestion.questionText}
              onChange={e => setNewQuestion({...newQuestion, questionText: e.target.value})}
              className="w-full p-3 bg-gray-700/20 rounded-lg border border-gray-700 text-white"
              rows="3"
              placeholder="Enter the question..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Options *</label>
            {newQuestion.options.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={newQuestion.correctAnswer === idx}
                  onChange={() => setNewQuestion({...newQuestion, correctAnswer: idx})}
                  className="h-4 w-4"
                />
                <input
                  type="text"
                  value={option}
                  onChange={e => handleOptionChange(idx, e.target.value)}
                  className="flex-1 p-2 bg-gray-700/20 rounded border border-gray-500 text-white"
                  placeholder={`Option ${idx + 1}`}
                />
                {newQuestion.options.length > 2 && (
                  <button
                    onClick={() => removeOption(idx)}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <FiTrash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addOption}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm mt-2"
            >
              <FiPlus size={14} /> Add Option
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Marks</label>
              <input
                type="number"
                value={newQuestion.marks}
                onChange={e => setNewQuestion({...newQuestion, marks: parseFloat(e.target.value)})}
                className="w-full p-2 bg-gray-700/20 rounded border border-gray-500 text-white"
                min="0.5"
                step="0.5"
                disabled={aptitudeData.pointsPerQuestion > 0}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Time Limit (seconds)</label>
              <input
                type="number"
                value={newQuestion.timeLimit}
                onChange={e => setNewQuestion({...newQuestion, timeLimit: parseInt(e.target.value)})}
                className="w-full p-2 bg-gray-700/20 rounded border border-gray-500 text-white"
                min="0"
                placeholder="0 for no limit"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Explanation</label>
            <textarea
              value={newQuestion.explanation}
              onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})}
              className="w-full p-2 bg-gray-700/20 rounded border border-gray-500 text-white"
              rows="2"
              placeholder="Explanation for the correct answer..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Image URL (optional)</label>
            <input
              type="text"
              value={newQuestion.imageUrl}
              onChange={e => setNewQuestion({...newQuestion, imageUrl: e.target.value})}
              className="w-full p-2 bg-gray-700/20 rounded border border-gray-500 text-white"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={saveQuestion}
              className="bg-green-600/20 border border-green-600 hover:bg-green-500/40 px-4 py-2 rounded font-semibold flex items-center gap-2"
            >
              {editingIndex !== null ? <FiSave /> : <FiPlus />}
              {editingIndex !== null ? "Update Question" : "Add Question"}
            </button>
            
            {editingIndex !== null && (
              <button
                onClick={() => {
                  setNewQuestion({
                    questionText: "",
                    questionType: "Multiple Choice (MCQ)",
                    options: ["", "", "", ""],
                    correctAnswer: null,
                    explanation: "",
                    marks: aptitudeData.pointsPerQuestion > 0 ? aptitudeData.pointsPerQuestion : 1,
                    timeLimit: 0,
                    imageUrl: "",
                    difficulty: "Medium"
                  });
                  setEditingIndex(null);
                }}
                className="bg-gray-700/20 hover:bg-gray-500/40 px-4 py-2 rounded font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {questions.length > 0 && (
        <div className="bg-gray-700 p-6 rounded-lg">
          <h3 className="font-semibold mb-4 text-lg">Added Questions</h3>
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={idx} className="bg-gray-600 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-semibold">{idx + 1}. {q.questionText}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className={`px-2 py-1 rounded text-xs ${
                        q.difficulty === 'Easy' ? 'bg-green-600' :
                        q.difficulty === 'Medium' ? 'bg-yellow-600' :
                        q.difficulty === 'Hard' ? 'bg-orange-600' : 'bg-red-600'
                      }`}>
                        {q.difficulty}
                      </span>
                      <span className="bg-blue-600 px-2 py-1 rounded text-xs">{q.questionType}</span>
                      <span className="bg-purple-600 px-2 py-1 rounded text-xs">{q.marks} marks</span>
                      {q.timeLimit > 0 && (
                        <span className="bg-gray-500 px-2 py-1 rounded text-xs">{q.timeLimit}s</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editQuestion(idx)}
                      className="text-blue-400 hover:text-blue-300 p-1"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => removeQuestion(idx)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
                
                {q.imageUrl && (
                  <div className="my-2">
                    <img src={q.imageUrl} alt="Question" className="max-w-xs h-auto rounded-lg" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => setStep(2)}
          className="bg-gray-700/20 border border-gray-700 hover:bg-gray-500 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <FiArrowLeft /> Back
        </button>
        <button
          onClick={() => setStep(4)}
          disabled={questions.length === 0}
          className="bg-blue-600/20 border border-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold disabled:bg-gray-700/20 disabled:border disabled:border-gray-700 disabled:cursor-not-allowed transition-colors"
        >
          Next: Preview & Submit
        </button>
      </div>
    </div>
  );

  // Step 4: Preview & Submit
  const renderPreview = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FiEye className="text-blue-500" />
        Step 4: Preview & Submit
      </h2>

      <div className="bg-gray-700 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Quiz Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div><strong>Title:</strong> {aptitudeData.title}</div>
          <div><strong>Category:</strong> {aptitudeData.category === "Other" ? aptitudeData.customCategory : aptitudeData.category}</div>
          {aptitudeData.subCategory && <div><strong>Sub-Category:</strong> {aptitudeData.subCategory}</div>}
          <div><strong>Difficulty:</strong> {aptitudeData.difficulty}</div>
          <div><strong>Duration:</strong> {aptitudeData.timeLimit} minutes</div>
          <div><strong>Contest Type:</strong> {aptitudeData.contestType === "general" ? "General Practice" : "Friday Contest"}</div>
          <div><strong>Total Questions:</strong> {questions.length}</div>
          <div><strong>Total Marks:</strong> {questions.reduce((sum, q) => sum + q.marks, 0)}</div>
          <div><strong>Passing Score:</strong> {aptitudeData.passingScore}%</div>
          <div><strong>Max Attempts:</strong> {aptitudeData.maxAttempts === "unlimited" ? "Unlimited" : aptitudeData.maxAttempts}</div>
          {aptitudeData.negativeMarking && <div><strong>Negative Marking:</strong> -{aptitudeData.negativeMarks} per wrong answer</div>}
        </div>

        <div className="mb-6">
          <strong>Schedule:</strong>
          <div className="mt-1">
            <p>Starts: {aptitudeData.startDate} at {aptitudeData.startTime}</p>
            <p>Ends: {aptitudeData.endDate} at {aptitudeData.endTime}</p>
          </div>
        </div>

        {aptitudeData.description && (
          <div className="mb-6">
            <strong>Description:</strong>
            <p className="mt-1 text-gray-300">{aptitudeData.description}</p>
          </div>
        )}

        {aptitudeData.tags.length > 0 && (
          <div className="mb-6">
            <strong>Tags:</strong>
            <div className="flex flex-wrap gap-2 mt-2">
              {aptitudeData.tags.map((tag, index) => (
                <span key={index} className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {aptitudeData.specialInstructions && (
          <div>
            <strong>Special Instructions:</strong>
            <p className="mt-1 text-gray-300">{aptitudeData.specialInstructions}</p>
          </div>
        )}
      </div>

      <div className="bg-gray-700 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Questions Preview</h3>
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={idx} className="bg-gray-600 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold">{idx + 1}.</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  q.difficulty === 'Easy' ? 'bg-green-600' :
                  q.difficulty === 'Medium' ? 'bg-yellow-600' :
                  q.difficulty === 'Hard' ? 'bg-orange-600' : 'bg-red-600'
                }`}>
                  {q.difficulty}
                </span>
                <span className="bg-blue-600 px-2 py-1 rounded text-xs">{q.questionType}</span>
                <span className="bg-purple-600 px-2 py-1 rounded text-xs">{q.marks} marks</span>
              </div>
              
              <div className="font-medium mb-4">{q.questionText}</div>
              
              {q.imageUrl && (
                <div className="mb-4">
                  <img src={q.imageUrl} alt="Question" className="max-w-xs h-auto rounded-lg" />
                </div>
              )}
              
              <div className="space-y-2 mb-4">
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      optIdx === q.correctAnswer 
                        ? "border-green-500 bg-green-500/20" 
                        : "border-gray-500"
                    }`}></div>
                    <span>{opt || `Option ${optIdx + 1}`}</span>
                  </div>
                ))}
              </div>
              
              {q.explanation && (
                <div className="bg-gray-700 p-3 rounded">
                  <div className="text-sm text-gray-300 mb-1">Explanation:</div>
                  <div className="text-sm">{q.explanation}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setShowPreview(true)}
          className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded font-semibold flex items-center gap-2"
        >
          <FiEye /> Full Preview
        </button>
        <button
          onClick={saveAptitude}
          disabled={loading}
          className="bg-green-600/20 hover:bg-green-700/30 px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <FiLoader className="animate-spin" /> : <FiSave />}
          {loading ? "Saving..." : "Save Aptitude"}
        </button>
        <button
          onClick={() => setStep(3)}
          className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded font-semibold flex items-center gap-2"
        >
          <FiArrowLeft /> Back to Questions
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black mt-15 ml-70 text-white p-6">
      <div className="max-w-4xl mx-auto border border-gray-700 p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-center">Create Aptitude Quiz</h1>
        <p className="text-gray-400 text-center mb-8">Build comprehensive aptitude tests for placement preparation</p>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          {[1, 2, 3, 4].map(stepNum => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step === stepNum 
                  ? "bg-blue-600 text-white" 
                  : step > stepNum 
                  ? "bg-green-600 text-white" 
                  : "bg-gray-700 text-gray-400"
              }`}>
                {step > stepNum ? <FiCheckCircle /> : stepNum}
              </div>
              {stepNum < 4 && (
                <div className={`w-16 h-1 ${step > stepNum ? "bg-green-600" : "bg-gray-700"}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        {step === 1 && renderBasicInfo()}
        {step === 2 && renderScheduleScoring()}
        {step === 3 && renderAddQuestions()}
        {step === 4 && renderPreview()}
      </div>
    </div>
  );
}

export default AdAptitude;