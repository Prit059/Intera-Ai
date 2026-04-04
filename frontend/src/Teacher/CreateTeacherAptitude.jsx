// pages/teacher/CreateTeacherAptitude.jsx
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
  FiPlus, FiSave, FiArrowLeft, FiClock, FiAward, FiBarChart2,
  FiHelpCircle, FiEye, FiCopy, FiCheckCircle, FiX,
  FiTrash2, FiEdit2, FiChevronDown, FiChevronUp, FiCalendar, FiUpload
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { motion } from 'framer-motion';
import PdfQuestionUploader from '../components/PdfQuestionUploader';

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
  "Short Answer"
];

const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard", "Very Hard"];

function CreateTeacherAptitude() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [enableScheduling, setEnableScheduling] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showPdfUploader, setShowPdfUploader] = useState(false);
  
  // Test basic info
  const [testData, setTestData] = useState({
    title: "",
    category: "",
    customCategory: "",
    subCategory: "",
    difficulty: "Medium",
    description: "",
    timeLimit: 30,
    tags: []
  });

  // Add this function to handle imported questions
const handlePdfQuestionsImported = (importedQuestions) => {
  setQuestions([...questions, ...importedQuestions]);
  toast.success(`${importedQuestions.length} questions imported from PDF!`);
};
  // Scoring settings
  const [scoring, setScoring] = useState({
    pointsPerQuestion: 1,
    passingScore: 60,
    negativeMarking: false,
    negativeMarks: 0.25
  });

  // Access settings
  const [accessSettings, setAccessSettings] = useState({
    requiresApproval: false,
    maxStudents: 100,
    allowMultipleAttempts: false,
    showResultsImmediately: true
  });

  // Questions
  const [questions, setQuestions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    questionType: "Multiple Choice (MCQ)",
    options: ["", "", "", ""],
    correctAnswer: null,
    explanation: "",
    marks: 1,
    difficulty: "Medium"
  });

  // Preview mode
  const [previewMode, setPreviewMode] = useState(false);

  // Calculate end date/time based on start and duration
  const calculateEndDateTime = (date, time, duration) => {
    if (!date || !time || !duration) return { endDate: '', endTime: '' };
    
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + (duration * 60000));
    
    const endDateStr = endDateTime.toISOString().split('T')[0];
    const endTimeStr = endDateTime.toTimeString().slice(0, 5);
    
    return { endDate: endDateStr, endTime: endTimeStr };
  };

  // Handle test data changes
  const handleTestDataChange = (e) => {
    const newTestData = {
      ...testData,
      [e.target.name]: e.target.value
    };
    setTestData(newTestData);
    
    // Recalculate end date/time if scheduling is enabled
    if (enableScheduling && startDate && startTime && newTestData.timeLimit) {
      const { endDate: newEndDate, endTime: newEndTime } = calculateEndDateTime(
        startDate, 
        startTime, 
        newTestData.timeLimit
      );
      setEndDate(newEndDate);
      setEndTime(newEndTime);
    }
  };

  // Handle start date change
  const handleStartDateChange = (e) => {
    const date = e.target.value;
    setStartDate(date);
    
    if (enableScheduling && date && startTime && testData.timeLimit) {
      const { endDate: newEndDate, endTime: newEndTime } = calculateEndDateTime(
        date, 
        startTime, 
        testData.timeLimit
      );
      setEndDate(newEndDate);
      setEndTime(newEndTime);
    }
  };

  // Handle start time change
  const handleStartTimeChange = (e) => {
    const time = e.target.value;
    setStartTime(time);
    
    if (enableScheduling && startDate && time && testData.timeLimit) {
      const { endDate: newEndDate, endTime: newEndTime } = calculateEndDateTime(
        startDate, 
        time, 
        testData.timeLimit
      );
      setEndDate(newEndDate);
      setEndTime(newEndTime);
    }
  };

  // Handle scoring changes
  const handleScoringChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setScoring({
      ...scoring,
      [e.target.name]: value
    });
  };

  // Question handling
  const handleQuestionChange = (e) => {
    setNewQuestion({
      ...newQuestion,
      [e.target.name]: e.target.value
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({
      ...newQuestion,
      options: newOptions
    });
  };

  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, ""]
    });
  };

  const removeOption = (index) => {
    if (newQuestion.options.length <= 2) {
      toast.error("At least 2 options required");
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

  const saveQuestion = () => {
    // Validation
    if (!newQuestion.questionText) {
      toast.error("Please enter question text");
      return;
    }

    if (newQuestion.correctAnswer === null || newQuestion.correctAnswer === undefined) {
      toast.error("Please select correct answer");
      return;
    }

    if (editingIndex !== null) {
      // Update existing question
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = newQuestion;
      setQuestions(updatedQuestions);
      toast.success("Question updated!");
    } else {
      // Add new question
      setQuestions([...questions, newQuestion]);
      toast.success("Question added!");
    }

    // Reset form
    setNewQuestion({
      questionText: "",
      questionType: "Multiple Choice (MCQ)",
      options: ["", "", "", ""],
      correctAnswer: null,
      explanation: "",
      marks: scoring.pointsPerQuestion,
      difficulty: "Medium"
    });
    setEditingIndex(null);
  };

  const editQuestion = (index) => {
    setNewQuestion(questions[index]);
    setEditingIndex(index);
  };

  const removeQuestion = (index) => {
    if (window.confirm("Remove this question?")) {
      setQuestions(questions.filter((_, i) => i !== index));
      toast.success("Question removed");
    }
  };

  const addTag = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      setTestData({
        ...testData,
        tags: [...testData.tags, e.target.value.trim()]
      });
      e.target.value = '';
    }
  };

  const removeTag = (index) => {
    setTestData({
      ...testData,
      tags: testData.tags.filter((_, i) => i !== index)
    });
  };

  // Submit test
  const handleSubmit = async () => {
    // Validation
    if (!testData.title) {
      toast.error("Please enter test title");
      return;
    }

    if (!testData.category) {
      toast.error("Please select category");
      return;
    }

    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    // Validate scheduling if enabled
    if (enableScheduling) {
      if (!startDate || !startTime) {
        toast.error("Please select start date and time");
        return;
      }
      
      const selectedStart = new Date(`${startDate}T${startTime}`);
      if (selectedStart < new Date()) {
        toast.error("Start date/time cannot be in the past");
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        ...testData,
        scoring,
        accessSettings,
        questions,
        schedule: enableScheduling ? {
          startDate: startDate ? new Date(`${startDate}T${startTime}`) : null,
          endDate: endDate ? new Date(`${endDate}T${endTime}`) : null,
          isScheduled: enableScheduling
        } : { isScheduled: false }
      };
      
      console.log('payload', payload);
      
      const response = await axiosInstance.post('/api/teacher/aptitude/create', payload);

      if (response.data.success) {
        toast.success("Test created successfully!");
        const joinCode = response.data.joinCode;
        
        navigate(`/teacher/aptitude/${response.data.data._id}`, {
          state: { showJoinCode: true, joinCode }
        });
      }
    } catch (error) {
      console.error("Error creating test:", error);
      
      // Show detailed error message
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => toast.error(err));
      } else {
        toast.error(error.response?.data?.message || "Failed to create test");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/teacher/dashboard')}
              className="flex items-center text-blue-400 hover:text-blue-300 mr-4"
            >
              <FiArrowLeft className="mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-bold">Create Aptitude Test</h1>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              <FiEye className="mr-2" />
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>
            {step === 3 && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    Create Test
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1">
              <div className={`h-2 ${s <= step ? 'bg-blue-600' : 'bg-gray-700'} ${s === 1 ? 'rounded-l-full' : ''} ${s === 3 ? 'rounded-r-full' : ''}`}></div>
              <div className="text-center mt-2 text-sm">
                {s === 1 && 'Basic Info'}
                {s === 2 && 'Questions'}
                {s === 3 && 'Review'}
              </div>
            </div>
          ))}
        </div>

        {!previewMode ? (
          <>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm mb-2">Test Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={testData.title}
                        onChange={handleTestDataChange}
                        className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                        placeholder="e.g., Quantitative Aptitude Practice Test"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Category *</label>
                      <select
                        name="category"
                        value={testData.category}
                        onChange={handleTestDataChange}
                        className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                      >
                        <option value="">Select Category</option>
                        {APTITUDE_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {testData.category === "Other" && (
                      <div>
                        <label className="block text-sm mb-2">Custom Category</label>
                        <input
                          type="text"
                          name="customCategory"
                          value={testData.customCategory}
                          onChange={handleTestDataChange}
                          className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                          placeholder="Enter custom category"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm mb-2">Difficulty</label>
                      <select
                        name="difficulty"
                        value={testData.difficulty}
                        onChange={handleTestDataChange}
                        className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                      >
                        {DIFFICULTY_LEVELS.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Duration (minutes) *</label>
                      <input
                        type="number"
                        name="timeLimit"
                        value={testData.timeLimit}
                        onChange={handleTestDataChange}
                        min="5"
                        className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm mb-2">Description</label>
                      <textarea
                        name="description"
                        value={testData.description}
                        onChange={handleTestDataChange}
                        rows="3"
                        className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                        placeholder="Describe what this test covers..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {testData.tags.map((tag, i) => (
                          <span key={i} className="bg-blue-600 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            {tag}
                            <button onClick={() => removeTag(i)} className="text-xs hover:text-red-300">×</button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Type tag and press Enter"
                        onKeyDown={addTag}
                        className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold mb-4">Scoring Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm mb-2">Points per Question</label>
                      <input
                        type="number"
                        name="pointsPerQuestion"
                        value={scoring.pointsPerQuestion}
                        onChange={handleScoringChange}
                        min="0.5"
                        step="0.5"
                        className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Passing Score (%)</label>
                      <input
                        type="number"
                        name="passingScore"
                        value={scoring.passingScore}
                        onChange={handleScoringChange}
                        min="0"
                        max="100"
                        className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="negativeMarking"
                        checked={scoring.negativeMarking}
                        onChange={handleScoringChange}
                        className="w-5 h-5"
                      />
                      <label>Enable Negative Marking</label>
                    </div>

                    {scoring.negativeMarking && (
                      <div>
                        <label className="block text-sm mb-2">Negative Marks per Wrong Answer</label>
                        <input
                          type="number"
                          name="negativeMarks"
                          value={scoring.negativeMarks}
                          onChange={handleScoringChange}
                          min="0"
                          step="0.25"
                          className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Scheduling Section */}
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FiCalendar className="text-blue-400" />
                    Schedule Test (Optional)
                  </h2>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="enableScheduling"
                      checked={enableScheduling}
                      onChange={(e) => {
                        setEnableScheduling(e.target.checked);
                        if (!e.target.checked) {
                          setStartDate('');
                          setStartTime('');
                          setEndDate('');
                          setEndTime('');
                        }
                      }}
                      className="w-5 h-5"
                    />
                    <label htmlFor="enableScheduling" className="text-sm">
                      Set specific start and end time for this test
                    </label>
                  </div>
                  
                  {enableScheduling && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2">Start Date *</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={handleStartDateChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm mb-2">Start Time *</label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={handleStartTimeChange}
                          className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                        />
                      </div>
                      
                      {endDate && endTime && (
                        <>
                          <div>
                            <label className="block text-sm mb-2">End Date (Auto-calculated)</label>
                            <input
                              type="date"
                              value={endDate}
                              readOnly
                              className="w-full p-3 bg-gray-600 rounded-lg border border-gray-500 text-gray-300 cursor-not-allowed"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm mb-2">End Time (Auto-calculated)</label>
                            <input
                              type="time"
                              value={endTime}
                              readOnly
                              className="w-full p-3 bg-gray-600 rounded-lg border border-gray-500 text-gray-300 cursor-not-allowed"
                            />
                          </div>
                        </>
                      )}
                      
                      <div className="md:col-span-2 text-sm text-gray-400 mt-2 bg-blue-900/20 p-3 rounded-lg border border-blue-600">
                        <FiClock className="inline mr-2 text-blue-400" />
                        End time is automatically calculated based on test duration ({testData.timeLimit} minutes)
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!testData.title || !testData.category}
                    className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Next: Add Questions
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Questions */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Add Questions ({questions.length} added)</h2>
                    <button
                      onClick={() => setShowPdfUploader(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
                    >
                      <FiUpload />
                      Import from PDF
                    </button>
                  </div>
                  {/* Question Form */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm mb-2">Question Type</label>
                      <select
                        name="questionType"
                        value={newQuestion.questionType}
                        onChange={handleQuestionChange}
                        className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600"
                      >
                        {QUESTION_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Question Text *</label>
                      <textarea
                        name="questionText"
                        value={newQuestion.questionText}
                        onChange={handleQuestionChange}
                        rows="3"
                        className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                        placeholder="Enter your question..."
                      />
                    </div>

                    {/* Options for MCQ types */}
                    {(newQuestion.questionType === 'Multiple Choice (MCQ)' || 
                      newQuestion.questionType === 'Multiple Response') && (
                      <div>
                        <label className="block text-sm mb-2">Options *</label>
                        {newQuestion.options.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2 mb-2">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={newQuestion.correctAnswer === idx}
                              onChange={() => setNewQuestion({...newQuestion, correctAnswer: idx})}
                              className="w-4 h-4"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleOptionChange(idx, e.target.value)}
                              className="flex-1 p-2 bg-gray-700 rounded-lg border border-gray-600"
                              placeholder={`Option ${idx + 1}`}
                            />
                            {newQuestion.options.length > 2 && (
                              <button
                                onClick={() => removeOption(idx)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <FiX />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={addOption}
                          className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                        >
                          + Add Option
                        </button>
                      </div>
                    )}

                    {/* True/False Options */}
                    {newQuestion.questionType === 'True/False' && (
                      <div>
                        <label className="block text-sm mb-2">Correct Answer</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={newQuestion.correctAnswer === true}
                              onChange={() => setNewQuestion({...newQuestion, correctAnswer: true})}
                            />
                            True
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={newQuestion.correctAnswer === false}
                              onChange={() => setNewQuestion({...newQuestion, correctAnswer: false})}
                            />
                            False
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Fill in Blanks / Short Answer */}
                    {(newQuestion.questionType === 'Fill in the Blanks' || 
                      newQuestion.questionType === 'Short Answer') && (
                      <div>
                        <label className="block text-sm mb-2">Correct Answer *</label>
                        <input
                          type="text"
                          name="correctAnswer"
                          value={newQuestion.correctAnswer || ''}
                          onChange={(e) => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                          className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600"
                          placeholder="Enter correct answer"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2">Marks</label>
                        <input
                          type="number"
                          name="marks"
                          value={newQuestion.marks}
                          onChange={handleQuestionChange}
                          min="0.5"
                          step="0.5"
                          className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm mb-2">Difficulty</label>
                        <select
                          name="difficulty"
                          value={newQuestion.difficulty}
                          onChange={handleQuestionChange}
                          className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600"
                        >
                          {DIFFICULTY_LEVELS.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Explanation (Optional)</label>
                      <textarea
                        name="explanation"
                        value={newQuestion.explanation}
                        onChange={handleQuestionChange}
                        rows="2"
                        className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600"
                        placeholder="Explain why this answer is correct..."
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={saveQuestion}
                        className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        {editingIndex !== null ? 'Update Question' : 'Add Question'}
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
                              marks: scoring.pointsPerQuestion,
                              difficulty: "Medium"
                            });
                            setEditingIndex(null);
                          }}
                          className="bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Questions List */}
                  {questions.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">Questions Added</h3>
                      <div className="space-y-3">
                        {questions.map((q, idx) => (
                          <div key={idx} className="bg-gray-700 p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium mb-1">{idx + 1}. {q.questionText}</div>
                                <div className="flex gap-2 text-sm">
                                  <span className="text-blue-400">{q.questionType}</span>
                                  <span className="text-yellow-400">{q.marks} marks</span>
                                  <span className="text-gray-400">{q.difficulty}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => editQuestion(idx)}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  <FiEdit2 />
                                </button>
                                <button
                                  onClick={() => removeQuestion(idx)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="bg-gray-700 px-6 py-3 rounded-lg hover:bg-gray-600"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={questions.length === 0}
                    className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Review Test
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold mb-4">Review Your Test</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><strong>Title:</strong> {testData.title}</div>
                    <div><strong>Category:</strong> {testData.category}</div>
                    <div><strong>Difficulty:</strong> {testData.difficulty}</div>
                    <div><strong>Duration:</strong> {testData.timeLimit} minutes</div>
                    <div><strong>Questions:</strong> {questions.length}</div>
                    <div><strong>Total Marks:</strong> {questions.reduce((sum, q) => sum + (q.marks || 1), 0)}</div>
                  </div>

                  {/* Schedule Review */}
                  {enableScheduling && startDate && startTime && (
                    <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-600">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <FiCalendar className="text-blue-400" /> Schedule
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-400">Start:</span>{' '}
                          {new Date(`${startDate}T${startTime}`).toLocaleString()}
                        </div>
                        <div>
                          <span className="text-gray-400">End:</span>{' '}
                          {endDate && endTime ? new Date(`${endDate}T${endTime}`).toLocaleString() : 'Auto-calculated'}
                        </div>
                      </div>
                    </div>
                  )}

                  {testData.tags.length > 0 && (
                    <div className="mb-4">
                      <strong>Tags:</strong>
                      <div className="flex gap-2 mt-1">
                        {testData.tags.map(tag => (
                          <span key={tag} className="bg-blue-600 px-2 py-1 rounded text-sm">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-600 pt-4">
                    <h3 className="font-semibold mb-2">Scoring</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>Points per question: {scoring.pointsPerQuestion}</div>
                      <div>Passing score: {scoring.passingScore}%</div>
                      <div>Negative marking: {scoring.negativeMarking ? `Yes (-${scoring.negativeMarks})` : 'No'}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                  <h3 className="font-semibold mb-4">Questions Preview</h3>
                  <div className="space-y-4">
                    {questions.slice(0, 3).map((q, idx) => (
                      <div key={idx} className="bg-gray-700 p-3 rounded">
                        <p><strong>{idx + 1}.</strong> {q.questionText}</p>
                        <div className="text-sm text-gray-400 mt-1">
                          {q.questionType} • {q.marks} marks • {q.difficulty}
                        </div>
                      </div>
                    ))}
                    {questions.length > 3 && (
                      <p className="text-gray-400">...and {questions.length - 3} more questions</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="bg-gray-700 px-6 py-3 rounded-lg hover:bg-gray-600"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-green-600 px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <FiSave /> Create Test
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          </>
        ) : (
          // Preview Mode
          <PreviewMode
            testData={testData}
            scoring={scoring}
            questions={questions}
            enableScheduling={enableScheduling}
            startDate={startDate}
            startTime={startTime}
            endDate={endDate}
            endTime={endTime}
          />
        )}

        {showPdfUploader && (
          <PdfQuestionUploader
            onQuestionsParsed={handlePdfQuestionsImported}
            onClose={() => setShowPdfUploader(false)}
          />
        )}
      </div>
    </div>
  );
}

// Preview Mode Component
function PreviewMode({ testData, scoring, questions, enableScheduling, startDate, startTime, endDate, endTime }) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-600/10 border border-blue-600 rounded-lg p-4">
        <h2 className="font-semibold mb-2">Preview Mode</h2>
        <p className="text-sm text-gray-400">This is how students will see the test</p>
      </div>

      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
        <h1 className="text-2xl font-bold mb-2">{testData.title}</h1>
        <p className="text-gray-400 mb-4">{testData.description}</p>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-1">
            <FiClock className="text-blue-400" />
            <span>{testData.timeLimit} minutes</span>
          </div>
          <div className="flex items-center gap-1">
            <FiAward className="text-yellow-400" />
            <span>{questions.length} questions</span>
          </div>
          <div className="flex items-center gap-1">
            <FiBarChart2 className="text-green-400" />
            <span>{testData.difficulty}</span>
          </div>
        </div>

        {/* Show schedule in preview if enabled */}
        {enableScheduling && startDate && startTime && (
          <div className="mb-6 p-3 bg-blue-900/20 rounded-lg border border-blue-600">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <FiCalendar className="text-blue-400" /> Test Schedule
            </h3>
            <p className="text-sm">
              <span className="text-gray-400">Available from:</span>{' '}
              {new Date(`${startDate}T${startTime}`).toLocaleString()}
            </p>
            {endDate && endTime && (
              <p className="text-sm">
                <span className="text-gray-400">Available until:</span>{' '}
                {new Date(`${endDate}T${endTime}`).toLocaleString()}
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={idx} className="bg-gray-700 p-4 rounded-lg">
              <p className="font-medium mb-3">{idx + 1}. {q.questionText}</p>
              
              {q.options && q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 border-2 border-gray-500 rounded-full"></div>
                  <span>{opt}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CreateTeacherAptitude;