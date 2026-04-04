import React, { useState, useEffect } from "react";
import { 
  FiPlus, FiUpload, FiEdit2, FiTrash2, FiSave, 
  FiEye, FiArrowLeft, FiClock, FiAward, FiDollarSign,
  FiCalendar, FiType, FiCode, FiImage, FiVideo,
  FiCheckSquare, FiRadio, FiFileText, FiX, FiArrowRight, FiLoader
} from "react-icons/fi";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { toast } from "react-hot-toast";

function AdQuiz() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [customBranches, setCustomBranches] = useState(''); 
  const [quizData, setQuizData] = useState({
    // Basic Info
    title: "",
    description: "",
    branch: "",
    customBranch: "",
    category: "",
    customCategory: "",
    subCategory: "",
    customSubCategory: "",
    difficulty: "Medium",
    duration: 30,
    totalQuestions: 0,
    
    // Scheduling & Access
    startDate: "",
    endDate: "",
    isPublic: true,
    maxAttempts: 1,
    contestType: "Special",
    
    // Scoring & Rules
    pointsPerQuestion: 1,
    negativeMarking: false,
    negativePoints: 0.25,
    passingScore: 60,
    
    // Metadata
    tags: [],
    coverImage: "",
    instructions: ""
  });
  
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    questionType: "MCQ",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    points: 1,
    difficulty: "Medium",
    timeLimit: 0,
    imageUrl: "",
    tags: []
  });
  const [editIdx, setEditIdx] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [suggestedTags, setSuggestedTags] = useState([]);

  // Branch and category data
  const branches = ["CSE", "ECE", "EEE", "Mechanical", "Civil", "Others"];
  const branchCategories = {
    CSE: ["Programming", "DSA", "Web Development", "AI/ML", "Database", "Networking", "Others"],
    ECE: ["Electronics", "Communication", "VLSI", "Signal Processing", "Embedded Systems", "Others"],
    EEE: ["Electrical", "Power Systems", "Control Systems", "Renewable Energy", "Others"],
    Mechanical: ["Thermodynamics", "Manufacturing", "Design", "Automobile", "Others"],
    Civil: ["Structural", "Geotechnical", "Transportation", "Environmental", "Others"],
    Others: ["General Knowledge", "Aptitude", "Reasoning", "Current Affairs", "Others"]
  };

  const subCategories = {
    // ----- CSE -----
    Programming: ["JavaScript", "Python", "Java", "C/C++", "React", "Node.js", "DSA", "Others"],
    DSA: ["Arrays", "Linked Lists", "Stacks & Queues", "Trees", "Graphs", "Sorting", "Dynamic Programming", "Others"],
    "Web Development": ["Frontend", "Backend", "Full Stack", "React", "Node.js", "Next.js", "Database Integration", "Others"],
    "AI/ML": ["Machine Learning", "Deep Learning", "Neural Networks", "NLP", "Computer Vision", "Others"],
    Database: ["SQL", "NoSQL", "MongoDB", "MySQL", "PostgreSQL", "Database Design", "Others"],
    Networking: ["OSI Model", "TCP/IP", "Routing & Switching", "Network Security", "Cloud Networking", "Others"],

    // ----- ECE -----
    Electronics: ["Analog Circuits", "Digital Circuits", "Microelectronics", "Semiconductors", "Others"],
    Communication: ["Analog Communication", "Digital Communication", "Wireless Systems", "Satellite Communication", "Others"],
    VLSI: ["VHDL", "Verilog", "ASIC Design", "FPGA", "CMOS Technology", "Others"],
    "Signal Processing": ["DSP Fundamentals", "Image Processing", "Audio Processing", "Filter Design", "Others"],
    "Embedded Systems": ["Microcontrollers", "RTOS", "IoT", "ARM Architecture", "Others"],

    // ----- EEE -----
    Electrical: ["Machines", "Circuits", "Power Electronics", "Measurement & Instrumentation", "Others"],
    "Power Systems": ["Generation", "Transmission", "Distribution", "Protection", "Smart Grid", "Others"],
    "Control Systems": ["Classical Control", "Modern Control", "PLC", "Automation", "Others"],
    "Renewable Energy": ["Solar", "Wind", "Hydro", "Energy Storage", "Others"],

    // ----- Mechanical -----
    Thermodynamics: ["Laws of Thermodynamics", "Heat Transfer", "Refrigeration & AC", "Power Plant", "Others"],
    Manufacturing: ["Casting", "Welding", "Machining", "Additive Manufacturing", "Others"],
    Design: ["Machine Design", "CAD/CAM", "Finite Element Analysis", "Others"],
    Automobile: ["Vehicle Dynamics", "IC Engines", "Electric Vehicles", "Automotive Electronics", "Others"],

    // ----- Civil -----
    Structural: ["Concrete Technology", "Steel Design", "Earthquake Engineering", "Others"],
    Geotechnical: ["Soil Mechanics", "Foundation Engineering", "Geo-Environmental", "Others"],
    Transportation: ["Highway Engineering", "Traffic Engineering", "Railway/Metro", "Airport/Port", "Others"],
    Environmental: ["Water Supply", "Wastewater", "Air Pollution", "Environmental Impact", "Others"],

    // ----- Cross-discipline & Aptitude -----
    "General Knowledge": ["Current Affairs", "History", "Geography", "Sports", "Science & Tech", "Others"],
    Aptitude: ["Quantitative", "Logical", "Verbal", "Data Interpretation", "Others"],
    Reasoning: ["Logical Reasoning", "Analytical Reasoning", "Puzzles", "Others"],
    "Current Affairs": ["National", "International", "Economy", "Sports", "Others"],
    Mathematics: ["Algebra", "Calculus", "Geometry", "Probability & Statistics", "Others"],

    // fallback
    Others: ["Others"]
  };

  const preDefinedTags = {
    Programming: ["JavaScript", "Python", "Java", "React", "Node.js", "HTML", "CSS"],
    DSA: ["Arrays", "Linked Lists", "Trees", "Graphs", "Sorting", "Searching"],
    "Web Development": ["Frontend", "Backend", "API", "Database", "Authentication"],
    "General Knowledge": ["Current Affairs", "History", "Geography", "Sports", "Politics"],
    Aptitude: ["Quantitative", "Logical", "Verbal", "Analytical"],
    Mathematics: ["Algebra", "Calculus", "Geometry", "Statistics"]
  };
  
  const questionTypes = [
    { value: "MCQ", label: "Multiple Choice", icon: <FiRadio /> },
    { value: "True/False", label: "True/False", icon: <FiCheckSquare /> },
    { value: "Multiple Response", label: "Multiple Response", icon: <FiCheckSquare /> },
    { value: "Text Input", label: "Text Input", icon: <FiFileText /> },
    { value: "Code", label: "Code Question", icon: <FiCode /> }
  ];

  const contestTypes = ["Daily", "Weekly", "Bi-weekly", "Monthly", "Special"];

const saveQuiz = async () => {
  try {
    setLoading(true);

    // Convert local times to UTC
    const startDateLocal = new Date(quizData.startDate);
    const endDateLocal = new Date(quizData.endDate);
    
    // Convert to UTC ISO strings
    const startDateUTC = startDateLocal.toISOString();
    const endDateUTC = endDateLocal.toISOString();
    
    // Validate dates (using UTC)
    if (new Date(startDateUTC) >= new Date(endDateUTC)) {
      toast.error("End date must be after start date");
      return;
    }

    if (new Date(startDateUTC) < new Date()) {
      toast.error("Start date cannot be in the past");
      return;
    }

    // Apply points per question to all questions if set
    const finalQuestions = quizData.pointsPerQuestion > 0 
      ? questions.map(q => ({ ...q, points: quizData.pointsPerQuestion }))
      : questions;

    const quizPayload = {
      ...quizData,
      startDate: startDateUTC,  // Send UTC time
      endDate: endDateUTC,      // Send UTC time
      questions: finalQuestions,
      branch: quizData.branch === "Others" ? "Others" : quizData.branch,
      customBranch: quizData.branch === "Others" ? quizData.customBranch : "",
      category: quizData.category === "Others" ? "Others" : quizData.category,
      customCategory: quizData.category === "Others" ? quizData.customCategory : "",
      subCategory: quizData.subCategory === "Others" ? "Others" : quizData.subCategory,
      customSubCategory: quizData.subCategory === "Others" ? quizData.customSubCategory : "",
      totalQuestions: finalQuestions.length
    };

    console.log("Saving quiz with UTC times:", {
      startLocal: quizData.startDate,
      startUTC: startDateUTC,
      endLocal: quizData.endDate,
      endUTC: endDateUTC
    });
      const res = await axiosInstance.post(API_PATHS.ADQUIZ.CREATE, quizPayload);

      if(res.data.success) {
        toast.success("Quiz created successfully");
        // Reset form
        setQuizData({
          title: "",
          description: "",
          branch: "",
          customBranch: "",
          category: "",
          customCategory: "",
          subCategory: "",
          customSubCategory: "",
          difficulty: "Medium",
          duration: 30,
          totalQuestions: 0,
          startDate: "",
          endDate: "",
          isPublic: true,
          maxAttempts: 1,
          contestType: "Special",
          pointsPerQuestion: 1,
          negativeMarking: false,
          negativePoints: 0.25,
          passingScore: 60,
          tags: [],
          coverImage: "",
          instructions: ""
        });
        setQuestions([]);
        setStep(1);
      } else {
        toast.error(res.data.message || "Failed to create quiz");
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error(error.response?.data?.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  }

  // const handleaddquestion =  () => {
  //   if(correctAnswer === ""){
  //     toast("Please Select answer!!!")
  //   }
  //   setQuestions([...questions, newQuestion]);
    // setNewQuestion({
    //                 questionText: "",
    //                 questionType: "MCQ",
    //                 options: ["", "", "", ""],
    //                 correctAnswer: "",
    //                 explanation: "",
    //                 points: 1,
    //                 difficulty: "Medium",
    //                 timeLimit: 0,
    //                 imageUrl: "",
    //                 tags: []
    //               })
  // }

  // Auto-calculate end date when start date or duration changes
useEffect(() => {
  if (quizData.startDate && quizData.duration) {
    // Convert local datetime to UTC for calculation
    const startDate = new Date(quizData.startDate);
    
    // Get the UTC timestamp (this removes timezone offset issues)
    const startUtcTimestamp = startDate.getTime();
    
    // Calculate end date in UTC
    const endUtcTimestamp = startUtcTimestamp + quizData.duration * 60000;
    const endDate = new Date(endUtcTimestamp);
    
    // Format for display in local time
    const formatDateForInput = (date) => {
      // Get local date components
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    
    // Format both dates
    const formattedStartDate = formatDateForInput(startDate);
    const formattedEndDate = formatDateForInput(endDate);
    
    setQuizData(prev => ({
      ...prev,
      startDate: formattedStartDate,
      endDate: formattedEndDate
    }));
  }
}, [quizData.startDate, quizData.duration]);

  // Update suggested tags based on category
  useEffect(() => {
    if (quizData.category && quizData.category !== "Others") {
      const categoryTags = preDefinedTags[quizData.category] || [];
      setSuggestedTags(categoryTags.filter(tag => !quizData.tags.includes(tag)));
    } else {
      setSuggestedTags([]);
    }
  }, [quizData.category, quizData.tags]);

  // Add tag to quiz from suggestions
  const addSuggestedTag = (tag) => {
    if (!quizData.tags.includes(tag)) {
      setQuizData({
        ...quizData,
        tags: [...quizData.tags, tag]
      });
      setSuggestedTags(suggestedTags.filter(t => t !== tag));
    }
  };

  // Add custom tag to quiz
  const addTag = () => {
    if (newTag.trim() && !quizData.tags.includes(newTag.trim())) {
      setQuizData({
        ...quizData,
        tags: [...quizData.tags, newTag.trim()]
      });
      setNewTag("");
    }
  };

  // Remove tag from quiz
  const removeTag = (tagToRemove) => {
    setQuizData({
      ...quizData,
      tags: quizData.tags.filter(tag => tag !== tagToRemove)
    });
    // Add back to suggestions if it's a predefined tag
    if (preDefinedTags[quizData.category]?.includes(tagToRemove)) {
      setSuggestedTags(prev => [...prev, tagToRemove]);
    }
  };

  // Add option to question
  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, ""]
    });
  };

  // Remove option from question
  const removeOption = (index) => {
    const newOptions = newQuestion.options.filter((_, i) => i !== index);
    setNewQuestion({
      ...newQuestion,
      options: newOptions,
      correctAnswer: newQuestion.correctAnswer === index.toString() ? "" : newQuestion.correctAnswer
    });
  };

  // Update total questions count when questions array changes
  useEffect(() => {
    setQuizData(prev => ({
      ...prev,
      totalQuestions: questions.length
    }));
  }, [questions]);

  // Reset newQuestion when not in edit mode
  useEffect(() => {
    if (editIdx === null) {
      setNewQuestion({
        questionText: "",
        questionType: "MCQ",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
        points: quizData.pointsPerQuestion > 0 ? quizData.pointsPerQuestion : 1,
        difficulty: "Medium",
        timeLimit: 0,
        imageUrl: "",
        tags: []
      });
    }
  }, [editIdx, quizData.pointsPerQuestion]);

  // Step 1: Quiz Basic Info
  const quizInfoForm = (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-2">Step 1: Quiz Basic Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Branch Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Branch *</label>
          <select
            value={quizData.branch}
            onChange={e => setQuizData({ 
              ...quizData, 
              branch: e.target.value, 
              category: "",
              subCategory: "",
              customBranch: "",
              tags: []
            })}
            className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="" className="bg-black">Select Branch</option>
            {branches.map(branch => (
              <option key={branch} value={branch} className="bg-black">{branch}</option>
            ))}
          </select>
        </div>

        {/* Custom Branch Input */}
        {quizData.branch === "Others" && (
          <div>
            <label className="block text-sm font-medium mb-1">Custom Branch Name *</label>
            <input
              type="text"
              placeholder="Enter branch name"
              value={quizData.customBranch}
              onChange={e => setQuizData({ ...quizData, customBranch: e.target.value })}
              className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Quiz Title *</label>
          <input
            type="text"
            placeholder="Enter quiz title"
            value={quizData.title}
            onChange={e => setQuizData({ ...quizData, title: e.target.value })}
            className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Category *</label>
          <select
            value={quizData.category}
            onChange={e => setQuizData({ 
              ...quizData, 
              category: e.target.value, 
              subCategory: "",
              customCategory: "",
              tags: []
            })}
            disabled={!quizData.branch}
            className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="" className="bg-black">Select Category</option>
            {quizData.branch && branchCategories[quizData.branch]?.map(cat => (
              <option key={cat} value={cat} className="bg-black">{cat}</option>
            ))}
          </select>
        </div>

        {/* Custom Category Input */}
        {quizData.category === "Others" && (
          <div>
            <label className="block text-sm font-medium mb-1">Custom Category *</label>
            <input
              type="text"
              placeholder="Enter category name"
              value={quizData.customCategory}
              onChange={e => setQuizData({ ...quizData, customCategory: e.target.value })}
              className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
        
        {/* Sub-category Selection */}
        {quizData.category && quizData.category !== "Others" && (
          <div>
            <label className="block text-sm font-medium mb-1">Sub-category</label>
            <select
              value={quizData.subCategory}
              onChange={e => setQuizData({ ...quizData, subCategory: e.target.value, customSubCategory: "" })}
              className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="" className="bg-black">Select Sub-category</option>
              {subCategories[quizData.category]?.map(subCat => (
                <option key={subCat} value={subCat} className="bg-black">{subCat}</option>
              ))}
            </select>
          </div>
        )}

        {/* Custom Sub-category Input */}
        {quizData.subCategory === "Others" && (
          <div>
            <label className="block text-sm font-medium mb-1">Custom Sub-category</label>
            <input
              type="text"
              placeholder="Enter sub-category name"
              value={quizData.customSubCategory}
              onChange={e => setQuizData({ ...quizData, customSubCategory: e.target.value })}
              className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-1">Difficulty Level *</label>
          <select
            value={quizData.difficulty}
            onChange={e => setQuizData({ ...quizData, difficulty: e.target.value })}
            className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Easy" className="bg-black">Easy</option>
            <option value="Medium" className="bg-black">Medium</option>
            <option value="Hard" className="bg-black">Hard</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Duration (minutes) *</label>
          <input
            type="number"
            min="1"
            value={quizData.duration}
            onChange={e => setQuizData({ ...quizData, duration: parseInt(e.target.value) || 0 })}
            className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Contest Type</label>
          <select
            value={quizData.contestType}
            onChange={e => setQuizData({ ...quizData, contestType: e.target.value })}
            className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {contestTypes.map(type => (
              <option key={type} value={type} className="bg-black">{type}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          placeholder="Describe what this quiz is about..."
          value={quizData.description}
          onChange={e => setQuizData({ ...quizData, description: e.target.value })}
          className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="3"
        />
      </div>
      
      {/* Tags Section */}
      <div>
        <label className="block text-sm font-medium mb-1">Tags</label>
        
        {/* Suggested Tags */}
        {suggestedTags.length > 0 && (
          <div className="mb-3">
            <p className="text-sm text-gray-400 mb-2">Suggested tags:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => addSuggestedTag(tag)}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors"
                >
                  {tag} <FiPlus size={12} />
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Custom Tag Input */}
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Add a custom tag"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && addTag()}
            className="flex-1 p-2 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={addTag}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Add
          </button>
        </div>
        
        {/* Current Tags */}
        <div className="flex flex-wrap gap-2">
          {quizData.tags.map(tag => (
            <span key={tag} className="bg-blue-600 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-300">
                <FiX size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        <div></div>
        <button
          onClick={() => setStep(2)}
          disabled={!quizData.title || !quizData.branch || 
          (quizData.branch === "Others" && !quizData.customBranch) ||
          (quizData.category === "Others" && !quizData.customCategory)}
          className={`bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
            !quizData.title || !quizData.branch || !quizData.category || !quizData.subCategory ||
            (quizData.branch === "Others" && !quizData.customBranch) ||
            (quizData.category === "Others" && !quizData.customCategory) 
            ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Next <FiArrowRight />
        </button>
      </div>
    </div>
  );

  // Step 2: Scheduling & Rules
  const schedulingForm = (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-2">Step 2: Scheduling & Rules</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date & Time *</label>
          <input
            type="datetime-local"
            value={quizData.startDate}
            onChange={e => setQuizData({ ...quizData, startDate: e.target.value })}
            className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">End Date & Time *</label>
          <input
            type="datetime-local"
            value={quizData.endDate}
            onChange={e => setQuizData({ ...quizData, endDate: e.target.value })}
            className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            readOnly
          />
          <p className="text-xs text-gray-400 mt-1">
            Auto-calculated: {quizData.duration} minutes from start time
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Maximum Attempts</label>
          <input
            type="number"
            min="1"
            value={quizData.maxAttempts}
            onChange={e => setQuizData({ ...quizData, maxAttempts: parseInt(e.target.value) || 1 })}
            className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Points per Question</label>
          <input
            type="number"
            min="0"
            value={quizData.pointsPerQuestion}
            onChange={e => setQuizData({ ...quizData, pointsPerQuestion: parseInt(e.target.value) || 0 })}
            className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            Set to 0 to use individual question points
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={quizData.passingScore}
            onChange={e => setQuizData({ ...quizData, passingScore: parseInt(e.target.value) || 0 })}
            className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="negativeMarking"
            checked={quizData.negativeMarking}
            onChange={e => setQuizData({ ...quizData, negativeMarking: e.target.checked })}
            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="negativeMarking" className="text-sm font-medium">
            Enable Negative Marking
          </label>
        </div>
        
        {quizData.negativeMarking && (
          <div>
            <label className="block text-sm font-medium mb-1">Negative Points per Wrong Answer</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={quizData.negativePoints}
              onChange={e => setQuizData({ ...quizData, negativePoints: parseFloat(e.target.value) || 0 })}
              className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            checked={quizData.isPublic}
            onChange={e => setQuizData({ ...quizData, isPublic: e.target.checked })}
            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isPublic" className="text-sm font-medium">
            Public Quiz (Visible to all users)
          </label>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Special Instructions</label>
        <textarea
          placeholder="Any special instructions for participants..."
          value={quizData.instructions}
          onChange={e => setQuizData({ ...quizData, instructions: e.target.value })}
          className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="3"
        />
      </div>
      
      <div className="flex justify-between pt-4">
        <button
          className="bg-gray-500/20 hover:bg-gray-600/20 px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors border border-gray-700"
          onClick={() => setStep(1)}
        >
          <FiArrowLeft /> Back
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          onClick={() => setStep(3)}
          disabled={!quizData.startDate || !quizData.endDate}
        >
          Next <FiArrowRight />
        </button>
      </div>
    </div>
  );

  // Step 3: Questions & Content
  const questionsForm = (
    <div>
      <h2 className="text-2xl font-bold mb-6">Step 3: Add Questions</h2>
      
      <div className="mb-8 p-4 bg-gray-500/20 rounded-lg border border-gray-700">
        <h3 className="font-semibold mb-2">Quiz Details</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-gray-400">Title:</span> {quizData.title}</div>
          <div><span className="text-gray-400">Category:</span> {quizData.category}</div>
          <div><span className="text-gray-400">Difficulty:</span> {quizData.difficulty}</div>
          <div><span className="text-gray-400">Duration:</span> {quizData.duration} mins</div>
          <div><span className="text-gray-400">Questions:</span> {questions.length}</div>
          <div><span className="text-gray-400">Points per Question:</span> {quizData.pointsPerQuestion > 0 ? quizData.pointsPerQuestion : "Individual"}</div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-lg">
          {editIdx !== null ? `Edit Question ${editIdx + 1}` : "Add New Question"}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Question Type</label>
            <div className="grid grid-cols-2 gap-2">
              {questionTypes.map(type => (
                <button
                  key={type.value}
                  className={`flex items-center gap-2 p-3 rounded-lg font-semibold transition border ${
                    newQuestion.questionType === type.value
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-gray-500/20 text-gray-300 hover:bg-gray-600/20 border-gray-700"
                  }`}
                  onClick={() => setNewQuestion({ ...newQuestion, questionType: type.value, correctAnswer: "" })}
                >
                  {type.icon} {type.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Difficulty</label>
            <select
              value={newQuestion.difficulty}
              onChange={e => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
              className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Easy" className="bg-black">Easy</option>
              <option value="Medium" className="bg-black">Medium</option>
              <option value="Hard" className="bg-black">Hard</option>
            </select>
            
            <label className="block text-sm font-medium mb-1 mt-3">Points</label>
            <input
              type="number"
              min="1"
              value={newQuestion.points}
              onChange={e => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 1 })}
              className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={quizData.pointsPerQuestion > 0}
            />
            {quizData.pointsPerQuestion > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Using global points per question setting
              </p>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Question Text *</label>
          <textarea
            placeholder="Enter the question"
            value={newQuestion.questionText}
            onChange={e => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
            className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
          />
        </div>
        
        {(newQuestion.questionType === "MCQ" || newQuestion.questionType === "Multiple Response") && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Options *</label>
            {newQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type={newQuestion.questionType === "Multiple Response" ? "checkbox" : "radio"}
                  name="correctAnswer"
                  checked={newQuestion.correctAnswer.includes(index.toString())}
                  onChange={() => {
                    if (newQuestion.questionType === "Multiple Response") {
                      const currentAnswers = newQuestion.correctAnswer.split(',').filter(Boolean);
                      const answerIndex = currentAnswers.indexOf(index.toString());
                      
                      if (answerIndex === -1) {
                        setNewQuestion({ 
                          ...newQuestion, 
                          correctAnswer: [...currentAnswers, index.toString()].join(',') 
                        });
                      } else {
                        currentAnswers.splice(answerIndex, 1);
                        setNewQuestion({ 
                          ...newQuestion, 
                          correctAnswer: currentAnswers.join(',') 
                        });
                      }
                    } else {
                      setNewQuestion({ ...newQuestion, correctAnswer: index.toString() });
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={e => {
                    const options = [...newQuestion.options];
                    options[index] = e.target.value;
                    setNewQuestion({ ...newQuestion, options });
                  }}
                  className="flex-1 p-2 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {newQuestion.options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="p-2 text-red-500 hover:text-red-400"
                  >
                    <FiX size={18} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addOption}
              className="mt-2 bg-gray-500/20 hover:bg-gray-600/20 px-3 py-1 rounded-lg text-sm flex items-center gap-1 border border-gray-700"
            >
              <FiPlus size={14} /> Add Option
            </button>
          </div>
        )}
        
        {newQuestion.questionType === "True/False" && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Correct Answer</label>
            <div className="flex gap-4">
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  newQuestion.correctAnswer === "true" 
                    ? "bg-green-600 border-green-500" 
                    : "bg-gray-500/20 border-gray-700"
                }`}
                onClick={() => setNewQuestion({ ...newQuestion, correctAnswer: "true" })}
              >
                <FiCheckSquare /> True
              </button>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  newQuestion.correctAnswer === "false" 
                    ? "bg-red-600 border-red-500" 
                    : "bg-gray-500/20 border-gray-700"
                }`}
                onClick={() => setNewQuestion({ ...newQuestion, correctAnswer: "false" })}
              >
                <FiX /> False
              </button>
            </div>
          </div>
        )}
        
        {(newQuestion.questionType === "Text Input" || newQuestion.questionType === "Code") && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Correct Answer *</label>
            <input
              type="text"
              placeholder="Enter the correct answer"
              value={newQuestion.correctAnswer}
              onChange={e => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
              className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Explanation</label>
          <textarea
            placeholder="Explanation for the correct answer (optional)"
            value={newQuestion.explanation}
            onChange={e => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
            className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="2"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Time Limit (seconds)</label>
            <input
              type="number"
              min="0"
              placeholder="0 for no limit"
              value={newQuestion.timeLimit}
              onChange={e => setNewQuestion({ ...newQuestion, timeLimit: parseInt(e.target.value) || 0 })}
              className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              value={newQuestion.imageUrl}
              onChange={e => setNewQuestion({ ...newQuestion, imageUrl: e.target.value })}
              className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          {editIdx !== null ? (
            <>
              <button
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                onClick={() => {
                  if (newQuestion.questionText && 
                      ((newQuestion.questionType === "MCQ" || newQuestion.questionType === "Multiple Response") ? 
                      newQuestion.options.every(opt => opt) && newQuestion.correctAnswer !== "" : 
                      newQuestion.correctAnswer)) {
                    const updatedQuestions = [...questions];
                    updatedQuestions[editIdx] = newQuestion;
                    setQuestions(updatedQuestions);
                    setEditIdx(null);
                  }
                }}
              >
                <FiSave /> Save Changes
              </button>
              <button
                className="bg-gray-500/20 hover:bg-gray-600/20 px-4 py-2 rounded-lg font-semibold transition-colors border border-gray-700"
                onClick={() => setEditIdx(null)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
              onClick={() => {
                const validOptions = newQuestion.options.filter(o => o.trim() !== "");
                const isValid =
                  newQuestion.questionText.trim() &&
                  (
                    (["MCQ", "Multiple Response"].includes(newQuestion.questionType))
                      ? validOptions.length >= 2 && newQuestion.correctAnswer !== ""
                      : newQuestion.correctAnswer.trim()
                  );
                
                if (isValid) {
                  setQuestions([...questions, newQuestion]);
                  setNewQuestion({
                    questionText: "",
                    questionType: "MCQ",
                    options: ["", "", "", ""],
                    correctAnswer: "",
                    explanation: "",
                    points: 1,
                    difficulty: "Medium",
                    timeLimit: 0,
                    imageUrl: "",
                    tags: []
                  });
                }
                else {
                  toast.error("Please fill all required fields");
                }
              }}
            >
              Add Question <FiPlus />
            </button>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-3 text-lg">Questions ({questions.length})</h3>
        {questions.length === 0 ? (
          <div className="bg-gray-500/20 p-6 rounded-lg text-center border border-gray-700">
            <p className="text-gray-400">No questions added yet. Start adding questions to your quiz.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {questions.map((q, idx) => (
              <li key={idx} className="bg-gray-500/20 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold">{idx + 1}.</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        q.difficulty === 'Easy' ? 'bg-green-700' : 
                        q.difficulty === 'Medium' ? 'bg-yellow-700' : 'bg-red-700'
                      }`}>
                        {q.difficulty}
                      </span>
                      <span className="bg-blue-700 px-2 py-1 rounded text-xs">
                        {q.questionType}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {q.points} point{q.points !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="mb-2">{q.questionText}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
                      onClick={() => {
                        setEditIdx(idx);
                        setNewQuestion(q);
                      }}
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      className="text-red-400 hover:text-red-300 flex items-center gap-1"
                      onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="flex justify-between mt-6">
        <button
          className="bg-gray-500/20 hover:bg-gray-600/20 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors border border-gray-700"
          onClick={() => setStep(2)}
        >
          <FiArrowLeft /> Back
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          onClick={() => setStep(4)}
          disabled={questions.length === 0}
        >
          Next <FiArrowRight />
        </button>
      </div>
    </div>
  );

  // Step 4: Review & Save
  const reviewForm = (
    <div>
      <h2 className="text-2xl font-bold mb-6">Step 4: Review & Save</h2>
      
      <div className="bg-gray-500/20 p-5 rounded-lg mb-6 border border-gray-700">
        <h3 className="font-semibold text-lg mb-3">Quiz Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-semibold text-gray-400">Title:</span>
            <p>{quizData.title}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-400">Branch:</span>
            <p>{quizData.branch === "Others" ? quizData.customBranch : quizData.branch}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-400">Category:</span>
            <p>{quizData.category === "Others" ? quizData.customCategory : quizData.category}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-400">Sub-category:</span>
            <p>
              {quizData.subCategory === "Others" 
                ? quizData.customSubCategory 
                : quizData.subCategory || "None"
              }
            </p>
          </div>
          <div>
            <span className="font-semibold text-gray-400">Difficulty:</span>
            <p>{quizData.difficulty}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-400">Duration:</span>
            <p>{quizData.duration} minutes</p>
          </div>
          <div>
            <span className="font-semibold text-gray-400">Questions:</span>
            <p>{questions.length}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-400">Points per Question:</span>
            <p>{quizData.pointsPerQuestion > 0 ? quizData.pointsPerQuestion : "Individual"}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-400">Start Date:</span>
            <p>{quizData.startDate ? new Date(quizData.startDate).toLocaleString() : "Not set"}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-400">End Date:</span>
            <p>{quizData.endDate ? new Date(quizData.endDate).toLocaleString() : "Not set"}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-400">Max Attempts:</span>
            <p>{quizData.maxAttempts}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-400">Passing Score:</span>
            <p>{quizData.passingScore}%</p>
          </div>
          <div className="col-span-2">
            <span className="font-semibold text-gray-400">Description:</span>
            <p>{quizData.description || "No description provided"}</p>
          </div>
          {quizData.tags.length > 0 && (
            <div className="col-span-2">
              <span className="font-semibold text-gray-400">Tags:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {quizData.tags.map(tag => (
                  <span key={tag} className="bg-blue-700 px-2 py-1 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={saveQuiz}
          disabled={loading}
          className="bg-green-600/20 hover:bg-green-700/30 px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <FiLoader className="animate-spin" /> : <FiSave />}
          {loading ? "Saving..." : "Save Quiz"}
        </button>
        <button
          className="bg-gray-500/20 hover:bg-gray-600/20 px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors border border-gray-700"
          onClick={() => setShowPreview(true)}
        >
          <FiEye /> Preview
        </button>
        <button
          className="bg-gray-500/20 hover:bg-gray-600/20 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors border border-gray-700"
          onClick={() => setStep(3)}
        >
          <FiArrowLeft /> Back
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Preview Quiz</h3>
              <button
                className="text-2xl hover:text-red-400 transition-colors"
                onClick={() => setShowPreview(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-gray-500/20 rounded-lg border border-gray-700">
              <h4 className="font-semibold text-lg mb-2">{quizData.title}</h4>
              <p className="text-gray-400">{quizData.difficulty} • {questions.length} questions • {quizData.duration} minutes</p>
              {quizData.description && <p className="mt-2">{quizData.description}</p>}
            </div>
            
            <ul className="space-y-6">
              {questions.map((q, idx) => (
                <li key={idx} className="bg-gray-500/20 p-5 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-lg">{idx + 1}.</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      q.difficulty === 'Easy' ? 'bg-green-700' : 
                      q.difficulty === 'Medium' ? 'bg-yellow-700' : 'bg-red-700'
                    }`}>
                      {q.difficulty}
                    </span>
                    <span className="bg-blue-700 px-2 py-1 rounded text-xs">
                      {q.questionType}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {q.points} point{q.points !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="font-bold mb-4 text-lg">{q.questionText}</div>
                  
                  {q.imageUrl && (
                    <div className="mb-4">
                      <img src={q.imageUrl} alt="Question" className="max-w-full h-auto rounded-lg" />
                    </div>
                  )}
                  
                  {(q.questionType === "MCQ" || q.questionType === "Multiple Response") && (
                    <div className="space-y-2 mb-4">
                      {q.options.map((option, i) => (
                        <div 
                          key={i} 
                          className={`p-3 rounded-lg border ${
                            q.correctAnswer.includes(i.toString()) 
                              ? 'bg-green-800 border-green-600' 
                              : 'bg-gray-600/20 border-gray-700'
                          }`}
                        >
                          {option}
                          {q.correctAnswer.includes(i.toString()) && (
                            <span className="ml-2 text-green-400 text-sm">✓ Correct</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {(q.questionType === "True/False" || q.questionType === "Text Input" || q.questionType === "Code") && (
                    <div className="bg-green-800 p-3 rounded-lg mb-4 border border-green-600">
                      <span className="font-semibold">Correct Answer:</span> {q.correctAnswer}
                    </div>
                  )}
                  
                  {q.explanation && (
                    <div className="pt-4 border-t border-gray-700">
                      <div className="font-semibold mb-2">Explanation:</div>
                      <div className="text-gray-300">{q.explanation}</div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen w-full ml-35 mt-16 flex items-center justify-center p-4 text-white bg-black">
      <div className="max-w-4xl w-full p-8 rounded-xl shadow-lg border border-gray-700">
        <h1 className="text-3xl font-bold mb-2 text-center">Create Quiz Contest</h1>
        <p className="text-gray-400 text-center mb-8">Build engaging quiz contests for your platform</p>
        
        {/* Progress steps */}
        <div className="mb-8 flex gap-4 items-center justify-center">
          {[1, 2, 3, 4].map(stepNum => (
            <React.Fragment key={stepNum}>
              <div className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 border ${
                step === stepNum ? "bg-blue-600 text-white border-blue-500" : "bg-gray-700/20 text-gray-300 border-gray-700"
              }`}>
                <span className={`h-6 w-6 rounded-full flex items-center justify-center ${
                  step === stepNum ? "bg-white text-blue-600" : "bg-gray-700/20"
                }`}>{stepNum}</span>
                <span>
                  {stepNum === 1 && "Basic Info"}
                  {stepNum === 2 && "Rules"}
                  {stepNum === 3 && "Questions"}
                  {stepNum === 4 && "Review"}
                </span>
              </div>
              {stepNum < 4 && <div className="h-1 w-8 bg-gray-700"></div>}
            </React.Fragment>
          ))}
        </div>
        
        {step === 1 && quizInfoForm}
        {step === 2 && schedulingForm}
        {step === 3 && questionsForm}
        {step === 4 && reviewForm}
      </div>
    </div>
  );
}

export default AdQuiz;