import React, { useState } from "react";
import { FiPlus, FiUpload, FiEdit2, FiTrash2, FiSave, FiEye, FiArrowLeft, FiCode, FiType, FiBriefcase, FiUser, FiCheckCircle, FiMenu, FiX } from "react-icons/fi";
import { BRANCH_ROLES, ROLE_TOPICS } from "../../utils/Role_Data";
import { COMPANY_NAME, COMPANY_JOB_ROLE } from "../../utils/company_data";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { toast } from "react-hot-toast";

// Array of different success slogans
const SUCCESS_SLOGANS = [
  "Session created successfully! 🎉",
  "Awesome! Your session is ready to rock! 🚀",
  "Boom! Interview session created! 💥",
  "Success! Your questions are ready! 📚",
  "Perfect! Session created with excellence! ✨",
  "Great job! Your session is now live! 🌟",
  "Amazing! Your interview prep just got better! 📝"
];

function AdQA() {
  const [step, setStep] = useState(1);
  const [sessionType, setSessionType] = useState("general");
  const [sessionName, setSessionName] = useState("");
  const [branch, setBranch] = useState("");
  const [role, setRole] = useState("");
  const [topic, setTopic] = useState("");
  const [company, setCompany] = useState("");
  const [companyRole, setCompanyRole] = useState("");
  const [difficulty, setDifficulty] = useState("Mixed");
  const [description, setDescription] = useState("");
  const [importType, setImportType] = useState("manual");
  const [questions, setQuestions] = useState([]);
  const [deletesession, setDeleteSession] = useState({
    open: false,
    data: null
  });
  const [newQuestion, setNewQuestion] = useState({ 
    question: "", 
    answer: "", 
    tag: "",
    difficulty: "Medium",
    answerType: "text",
    codeSnippet: ""
  });
  const [editIdx, setEditIdx] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const deletesessionHandler = async (sessiondata) => {
    try {
      // Delete session logic
    } catch (error) {
      // Error handling
    }
  };

  // Handle All Error or required filed warnings.
  const handleNext = () => {
    if (sessionType === "general" && (!branch || !role || !sessionName)) {
      toast.error("Please fill all required fields in Step 1.", { icon: "⚠️" });
    }
    if (sessionType === "company" && (!company || !companyRole || !sessionName)) {
      toast.error("Please fill all required fields in Step 1.", { icon: "⚠️" });
    }
  };

  // Derive available tags based on session type
  const availableTags = React.useMemo(() => {
    if (sessionType === "general") {
      if (role && ROLE_TOPICS[role]) {
        return ROLE_TOPICS[role];
      }
      return [];
    } else if (sessionType === "company") {
      return COMPANY_JOB_ROLE;
    }
    return [];
  }, [sessionType, role]);

  const handleSaveSession = async () => {
    try {
      const response = await axiosInstance.post(API_PATHS.ADSESSION.CREATE, {
        sessionName: sessionName,
        branch,
        role,
        topic,
        company,
        companyRole,
        sessionType,
        difficulty,
        description,
        importType,
        questions: questions.map(q => ({
          question: q.question,
          answer: q.answer,
          tag: q.tag || "",
          difficulty: q.difficulty || "Medium",
          answerType: q.answerType || "text",
        })),
      });
      
      // Get a random slogan
      const randomSlogan = SUCCESS_SLOGANS[Math.floor(Math.random() * SUCCESS_SLOGANS.length)];
      
      // Show success toast with animation and session details
      toast.custom((t) => (
        <div className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="animate-bounce">
                  <FiCheckCircle className="h-10 w-10 text-green-500" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">
                  {randomSlogan}
                </p>
                <div className="mt-1 text-sm text-gray-400">
                  <p><span className="font-semibold">{sessionName}</span> with {questions.length} questions</p>
                  <p className="text-xs mt-1">{sessionType === "general" ? `${branch} - ${role}` : `${company} - ${companyRole}`}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-700">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-300 hover:text-blue-100 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ), {
        duration: 2000,
        position: 'top-center',
      });

      // Reset form after 2 seconds
      setTimeout(() => {
        setStep(1);
        setSessionType("general");
        setSessionName("");
        setBranch("");
        setRole("");
        setTopic("");
        setCompany("");
        setCompanyRole("");
        setDifficulty("Mixed");
        setDescription("");
        setQuestions([]);
      }, 2000);
      
      console.log("Session created:", response.data);
      
    } catch (error) {
      if (error.response) {
        console.error("Server error:", error.response.data);
        toast.error("Failed to create session: " + (error.response.data.message || "Unknown error"));
      } else {
        console.error("Error creating session:", error.message);
        toast.error("Failed to create session: " + error.message);
      }
    }
  };

  // Reset role and topic when branch changes
  React.useEffect(() => {
    if (branch) {
      setRole("");
      setTopic("");
    }
  }, [branch]);

  // Reset topic when role changes
  React.useEffect(() => {
    if (role) {
      setTopic("");
    }
  }, [role]);

  // Mobile Step Navigation
  const MobileStepNav = () => (
    <div className="lg:hidden mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">
          {step === 1 && "Session Details"}
          {step === 2 && "Add Questions"}
          {step === 3 && "Review & Save"}
        </h2>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-gray-700/50 border border-gray-600"
        >
          {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>
      
      {mobileMenuOpen && (
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-gray-700 mb-4">
          <div className="space-y-2">
            <button
              onClick={() => { setStep(1); setMobileMenuOpen(false); }}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${
                step === 1 ? "bg-blue-600/20 border border-blue-600" : "bg-gray-700/50 border border-gray-600"
              }`}
            >
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-sm ${
                step === 1 ? "bg-white text-blue-600" : "bg-gray-600"
              }`}>1</span>
              <span>Session Details</span>
            </button>
            
            <button
              onClick={() => { setStep(2); setMobileMenuOpen(false); }}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${
                step === 2 ? "bg-blue-600/20 border border-blue-600" : "bg-gray-700/50 border border-gray-600"
              }`}
            >
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-sm ${
                step === 2 ? "bg-white text-blue-600" : "bg-gray-600"
              }`}>2</span>
              <span>Add Questions</span>
            </button>
            
            <button
              onClick={() => { setStep(3); setMobileMenuOpen(false); }}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${
                step === 3 ? "bg-blue-600/20 border border-blue-600" : "bg-gray-700/50 border border-gray-600"
              }`}
            >
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-sm ${
                step === 3 ? "bg-white text-blue-600" : "bg-gray-600"
              }`}>3</span>
              <span>Review & Save</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Step 1: Session Info
  const sessionInfoForm = (
    <div className="w-full">
      <h2 className="text-xl lg:text-2xl font-bold mb-6">Step 1: Session Details</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">Session Type *</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition flex-1 ${
              sessionType === "general"
                ? "bg-blue-700/20 border border-blue-600 text-white"
                : "bg-gray-500/20 border border-gray-600 text-gray-300 hover:bg-gray-500/30"
            }`}
            onClick={() => setSessionType("general")}
          >
            <FiUser className="flex-shrink-0" /> 
            <span className="text-sm sm:text-base">General Q&A</span>
          </button>
          <button
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition flex-1 ${
              sessionType === "company"
                ? "bg-blue-700/20 border border-blue-600 text-white"
                : "bg-gray-700/20 border border-gray-600 text-gray-300 hover:bg-gray-700/30"
            }`}
            onClick={() => setSessionType("company")}
          >
            <FiBriefcase className="flex-shrink-0" /> 
            <span className="text-sm sm:text-base">Company Specific</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {sessionType === "general" ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Branch *</label>
              <select
                value={branch}
                onChange={e => setBranch(e.target.value)}
                className="w-full p-3 bg-gray-500/20 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-600/20 focus:border-transparent text-sm sm:text-base"
              >
                <option value="" className="bg-black">Select a branch</option>
                {Object.keys(BRANCH_ROLES).map((branchName, index) => (
                  <option className="bg-black" key={index} value={branchName}>{branchName}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Role *</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                disabled={!branch}
                className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="" className="bg-black">Select a role</option>
                {branch && BRANCH_ROLES[branch].map((roleName, index) => (
                  <option className="bg-black" key={index} value={roleName}>{roleName}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Topic</label>
              <select
                value={topic}
                onChange={e => setTopic(e.target.value)}
                disabled={!role}
                className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="" className="bg-black">Select a topic (optional)</option>
                {role && ROLE_TOPICS[role] && ROLE_TOPICS[role].map((topicName, index) => (
                  <option className="bg-black" key={index} value={topicName}>{topicName}</option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Company *</label>
              <select
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="" className="bg-black">Select a company</option>
                {COMPANY_NAME.map((companyName, index) => (
                  <option className="bg-black" key={index} value={companyName}>{companyName}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Job Role *</label>
              <select
                value={companyRole}
                onChange={e => setCompanyRole(e.target.value)}
                className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="" className="bg-black">Select a job role</option>
                {COMPANY_JOB_ROLE.map((roleName, index) => (
                  <option className="bg-black" key={index} value={roleName}>{roleName}</option>
                ))}
              </select>
            </div>
          </>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-2">Session/Topic Name *</label>
          <input
            type="text"
            placeholder={sessionType === "general" ? "e.g., React Interview Questions" : "e.g., Google Frontend Interview Questions"}
            value={sessionName}
            onChange={e => setSessionName(e.target.value)}
            className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Overall Difficulty</label>
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          >
            <option value="Easy" className="bg-black">Easy</option>
            <option value="Medium" className="bg-black">Medium</option>
            <option value="Hard" className="bg-black">Hard</option>
            <option value="Mixed" className="bg-black">Mixed</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            placeholder="Describe what this session covers..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full p-3 bg-gray-500/20 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            rows="3"
          />
        </div>
      </div>
      
      <button
        className="mt-6 w-full sm:w-auto bg-blue-600/20 border border-blue-600 hover:bg-blue-700/30 px-6 py-3 rounded font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
        onClick={() => setStep(2)}
        disabled={!sessionName || (sessionType === "general" ? (!branch || !role) : (!company || !companyRole))}
      >
        Next <FiPlus />
      </button>
    </div>
  );

  // Step 2: Import Type
  const importTypeForm = (
    <div className="w-full">
      <h2 className="text-xl lg:text-2xl font-bold mb-6">Step 2: Add Questions</h2>
      
      <div className="mb-4 p-4 bg-gray-500/20 border border-gray-600 rounded-lg">
        <h3 className="font-semibold mb-3 text-sm sm:text-base">Session Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
          <div><span className="text-gray-400">Type:</span> {sessionType === "general" ? "General Q&A" : "Company Specific"}</div>
          <div><span className="text-gray-400">Name:</span> {sessionName}</div>
          {sessionType === "general" ? (
            <>
              <div><span className="text-gray-400">Branch:</span> {branch}</div>
              <div><span className="text-gray-400">Role:</span> {role}</div>
              {topic && <div><span className="text-gray-400">Topic:</span> {topic}</div>}
            </>
          ) : (
            <>
              <div><span className="text-gray-400">Company:</span> {company}</div>
              <div><span className="text-gray-400">Job Role:</span> {companyRole}</div>
            </>
          )}
          <div><span className="text-gray-400">Difficulty:</span> {difficulty}</div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <button
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition flex-1 text-sm sm:text-base ${
            importType === "manual"
              ? "bg-blue-600/20 border border-blue-600 text-white"
              : "bg-gray-500/20 border border-gray-600 text-gray-300 hover:bg-gray-600"
          }`}
          onClick={() => setImportType("manual")}
        >
          <FiPlus /> Manual Add
        </button>
        <button
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition flex-1 text-sm sm:text-base ${
            importType === "pdf"
              ? "bg-blue-600/20 border border-blue-600 text-white"
              : "bg-gray-500/20 border border-gray-600 text-gray-300 hover:bg-gray-600"
          }`}
          onClick={() => setImportType("pdf")}
        >
          <FiUpload /> Import PDF
        </button>
        <button
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition flex-1 text-sm sm:text-base ${
            importType === "excel"
              ? "bg-blue-600/20 border border-blue-600 text-white"
              : "bg-gray-500/20 border border-gray-600 text-gray-300 hover:bg-gray-600"
          }`}
          onClick={() => setImportType("excel")}
        >
          <FiUpload /> Import Excel
        </button>
      </div>
      
      {importType === "manual" ? (
        <div className="mb-6 text-white p-4 rounded-lg">
          <h3 className="font-semibold mb-3 text-lg">Add New Question</h3>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">Question *</label>
            <input
              type="text"
              placeholder="Enter the question"
              value={newQuestion.question}
              onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })}
              className="w-full p-3 bg-gray-500/20 rounded border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                value={newQuestion.difficulty}
                onChange={e => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                className="w-full p-3 bg-gray-500/20 rounded border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="Easy" className="bg-black">Easy</option>
                <option value="Medium" className="bg-black">Medium</option>
                <option value="Hard" className="bg-black">Hard</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Tag</label>
              <select
                value={newQuestion.tag}
                onChange={e => setNewQuestion({ ...newQuestion, tag: e.target.value })}
                className="w-full p-3 bg-gray-500/20 rounded border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="" className="bg-black">Select a tag</option>
                {availableTags.map((tag, index) => (
                  <option className="bg-black" key={index} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">Answer Type</label>
            <div className="flex gap-3">
              <button
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded flex-1 text-sm sm:text-base ${
                  newQuestion.answerType === 'text' 
                    ? 'bg-blue-600/20 border border-blue-600' 
                    : 'bg-gray-500/20 border border-gray-600'
                }`}
                onClick={() => setNewQuestion({ ...newQuestion, answerType: 'text' })}
              >
                <FiType /> Text
              </button>
              <button
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded flex-1 text-sm sm:text-base ${
                  newQuestion.answerType === 'code' 
                    ? 'bg-blue-600/20 border border-blue-600' 
                    : 'bg-gray-500/20 border border-gray-600'
                }`}
                onClick={() => setNewQuestion({ ...newQuestion, answerType: 'code' })}
              >
                <FiCode /> Code
              </button>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">Answer *</label>
            {newQuestion.answerType === 'text' ? (
              <textarea
                placeholder="Enter the answer"
                value={newQuestion.answer}
                onChange={e => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                className="w-full p-3 bg-gray-500/20 rounded border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                rows="4"
              />
            ) : (
              <textarea
                placeholder="Enter code snippet"
                value={newQuestion.answer}
                onChange={e => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="6"
              />
            )}
          </div>
          
          <button
            className="w-full bg-green-400/10 border border-green-400 hover:bg-green-700/30 cursor-pointer px-4 py-3 rounded font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
            onClick={() => {
              if (newQuestion.question && newQuestion.answer) {
                setQuestions([...questions, newQuestion]);
                setNewQuestion({ 
                  question: "", 
                  answer: "", 
                  tag: "",
                  difficulty: "Medium",
                  answerType: "text",
                  codeSnippet: ""
                });
              }
            }}
          >
            Add Q&A <FiPlus />
          </button>
        </div>
      ) : (
        <div className="mb-6 bg-gray-500/20 border border-gray-600 p-4 rounded-lg">
          <h3 className="font-semibold mb-3 text-sm sm:text-base">Import from {importType.toUpperCase()}</h3>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            <FiUpload className="text-3xl mx-auto mb-2 text-gray-400" />
            <p className="mb-3 text-sm sm:text-base">Drag and drop your {importType} file here, or click to browse</p>
            <input
              type="file"
              accept={importType === "pdf" ? ".pdf" : ".xlsx,.xls"}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded cursor-pointer inline-block text-sm sm:text-base">
              Browse Files
            </label>
          </div>
          <button className="mt-4 w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base">
            Process File <FiUpload />
          </button>
        </div>
      )}
      
      <div>
        <h3 className="font-semibold mb-3 text-lg">Questions ({questions.length})</h3>
        {questions.length === 0 ? (
          <div className="bg-gray-500/20 border border-gray-600 p-6 rounded-lg text-center">
            <p className="text-gray-400 text-sm sm:text-base">No questions added yet. Start adding questions to your session.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {questions.map((q, idx) => (
              <li key={idx} className="bg-gray-500/20 border border-gray-600 p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold text-sm sm:text-base">{idx + 1}.</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        q.difficulty === 'Easy' ? 'bg-green-700' : 
                        q.difficulty === 'Medium' ? 'bg-yellow-700' : 'bg-red-700'
                      }`}>
                        {q.difficulty}
                      </span>
                      {q.tag && (
                        <span className="bg-blue-600/20 border border-blue-600 px-2 py-1 rounded text-xs">
                          {q.tag}
                        </span>
                      )}
                    </div>
                    <p className="mb-2 text-sm sm:text-base break-words">{q.question}</p>
                  </div>
                  <div className="flex gap-2 self-end sm:self-start">
                    <button
                      className="text-yellow-400 hover:text-yellow-300 flex items-center gap-1 text-sm"
                      onClick={() => {
                        setEditIdx(idx);
                        setNewQuestion(q);
                      }}
                    >
                      <FiEdit2 size={14} /> Edit
                    </button>
                    <button
                      className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm"
                      onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                    >
                      <FiTrash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <span className="font-semibold block mb-1 text-sm sm:text-base">Answer:</span>
                  {q.answerType === 'code' ? (
                    <pre className="bg-gray-900 p-3 rounded overflow-x-auto text-xs sm:text-sm">
                      {q.answer}
                    </pre>
                  ) : (
                    <p className="text-gray-300 text-sm sm:text-base break-words">{q.answer}</p>
                  )}
                </div>
                
                {editIdx === idx && (
                  <div className="bg-gray-900 p-4 rounded-lg mt-3">
                    <h4 className="font-semibold mb-3 text-sm sm:text-base">Edit Q&A</h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Question"
                        value={newQuestion.question}
                        onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })}
                        className="w-full p-3 rounded bg-gray-500/20 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select
                          value={newQuestion.difficulty}
                          onChange={e => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                          className="p-3 rounded bg-gray-500/20 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        >
                          <option value="Easy" className="bg-black">Easy</option>
                          <option value="Medium" className="bg-black">Medium</option>
                          <option value="Hard" className="bg-black">Hard</option>
                        </select>
                        
                        <select
                          value={newQuestion.tag}
                          onChange={e => setNewQuestion({ ...newQuestion, tag: e.target.value })}
                          className="p-3 rounded bg-gray-500/20 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        >
                          <option value="" className="bg-black">Select a tag</option>
                          {availableTags.map((tag, index) => (
                            <option key={index} value={tag} className="bg-black">{tag}</option>
                          ))}
                        </select>
                      </div>
                      
                      <textarea
                        placeholder="Answer"
                        value={newQuestion.answer}
                        onChange={e => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                        className="w-full p-3 rounded bg-gray-500/20 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        rows="4"
                      />
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          className="flex-1 bg-blue-600/20 border border-blue-600 hover:bg-blue-700/30 px-4 py-3 rounded font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                          onClick={() => {
                            const updated = [...questions];
                            updated[editIdx] = newQuestion;
                            setQuestions(updated);
                            setEditIdx(null);
                            setNewQuestion({ 
                              question: "", 
                              answer: "", 
                              tag: "",
                              difficulty: "Medium",
                              answerType: "text",
                              codeSnippet: ""
                            });
                          }}
                        >
                          <FiSave /> Save
                        </button>
                        <button
                          className="flex-1 bg-gray-500/20 border border-gray-500 hover:bg-gray-600/30 px-4 py-3 rounded font-semibold transition-colors text-sm sm:text-base"
                          onClick={() => {
                            setEditIdx(null);
                            setNewQuestion({ 
                              question: "", 
                              answer: "", 
                              tag: "",
                              difficulty: "Medium",
                              answerType: "text",
                              codeSnippet: ""
                            });
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
        <button
          className="w-full sm:w-auto bg-gray-500/20 border border-gray-500 hover:bg-gray-500/30 cursor-pointer px-4 py-3 rounded font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
          onClick={() => setStep(1)}
        >
          <FiArrowLeft /> Back
        </button>
        <button
          className="w-full sm:w-auto bg-blue-600/20 border border-blue-600 hover:bg-blue-700/30 px-6 py-3 rounded font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
          onClick={() => setStep(3)}
          disabled={questions.length === 0}
        >
          Next <FiPlus />
        </button>
      </div>
    </div>
  );

  // Step 3: Review & Save
  const reviewForm = (
    <div className="w-full">
      <h2 className="text-xl lg:text-2xl font-bold mb-6">Step 3: Review & Save</h2>
      
      <div className="bg-gray-500/20 border border-gray-500 p-5 rounded-lg mb-6">
        <h3 className="font-semibold text-lg mb-3">Session Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
          <div>
            <span className="font-semibold text-gray-400">Session Type:</span>
            <p>{sessionType === "general" ? "General Q&A" : "Company Specific"}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-400">Session Name:</span>
            <p>{sessionName}</p>
          </div>
          
          {sessionType === "general" ? (
            <>
              <div>
                <span className="font-semibold text-gray-400">Branch:</span>
                <p>{branch}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-400">Role:</span>
                <p>{role}</p>
              </div>
              {topic && (
                <div>
                  <span className="font-semibold text-gray-400">Topic:</span>
                  <p>{topic}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <span className="font-semibold text-gray-400">Company:</span>
                <p>{company}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-400">Job Role:</span>
                <p>{companyRole}</p>
              </div>
            </>
          )}
          
          <div>
            <span className="font-semibold text-gray-400">Difficulty:</span>
            <p>{difficulty}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-400">Questions:</span>
            <p>{questions.length}</p>
          </div>
          <div className="sm:col-span-2">
            <span className="font-semibold text-gray-400">Description:</span>
            <p className="break-words">{description || "No description provided"}</p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          className="flex-1 bg-green-600/10 border border-green-600 hover:bg-green-600/30 px-4 py-3 rounded font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
          onClick={handleSaveSession}
        >
          <FiSave /> Save Session
        </button>
        <button
          className="flex-1 bg-gray-500/20 border border-gray-500 hover:bg-gray-600/30 px-4 py-3 rounded font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
          onClick={() => setShowPreview(true)}
        >
          <FiEye /> Preview
        </button>
        <button
          className="flex-1 bg-gray-500/20 border border-gray-500 hover:bg-gray-600/30 cursor-pointer px-4 py-3 rounded font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
          onClick={() => setStep(2)}
        >
          <FiArrowLeft /> Back
        </button>
      </div>
      
      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-4 sm:p-6 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold">Preview Q&A Session</h3>
              <button
                className="text-xl sm:text-2xl hover:text-red-400 transition-colors p-2"
                onClick={() => setShowPreview(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-800 rounded-lg">
              <h4 className="font-semibold text-base sm:text-lg mb-2">{sessionName}</h4>
              <p className="text-gray-400 text-sm sm:text-base">{difficulty} • {questions.length} questions</p>
              {description && <p className="mt-2 text-sm sm:text-base break-words">{description}</p>}
            </div>
            
            <ul className="space-y-4 sm:space-y-6">
              {questions.map((q, idx) => (
                <li key={idx} className="bg-gray-800 p-3 sm:p-5 rounded-lg">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="font-bold text-base sm:text-lg">{idx + 1}.</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      q.difficulty === 'Easy' ? 'bg-green-700/20 border border-green-700' : 
                      q.difficulty === 'Medium' ? 'bg-yellow-700/20 border border-yellow-700' : 'bg-red-700/20 border border-red-700'
                    }`}>
                      {q.difficulty}
                    </span>
                    {q.tag && (
                      <span className="bg-blue-600/20 border border-blue-600 px-2 py-1 rounded text-xs">
                        {q.tag}
                      </span>
                    )}
                  </div>
                  <div className="font-bold mb-3 sm:mb-4 text-base sm:text-lg break-words">{q.question}</div>
                  <div className="pt-3 sm:pt-4 border-t border-gray-700">
                    <div className="font-semibold mb-2 text-sm sm:text-base">Answer:</div>
                    {q.answerType === 'code' ? (
                      <pre className="bg-gray-900 p-3 sm:p-4 rounded overflow-x-auto text-xs sm:text-sm">
                        {q.answer}
                      </pre>
                    ) : (
                      <div className="text-gray-300 text-sm sm:text-base break-words">{q.answer}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center mt-15 text-white justify-center p-3 sm:p-4 bg-gradient-to-br bg-black ml-0 lg:ml-33">
      <div className="max-w-4xl w-full text-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-gray-800">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 text-center">Create Interview Session</h1>
        <p className="text-gray-400 text-center mb-6 sm:mb-8 text-sm sm:text-base">Build a collection of questions for interview preparation</p>
        
        {/* Mobile Step Navigation */}
        <MobileStepNav />
        
        {/* Desktop Step Progress */}
        <div className="hidden lg:flex mb-8 gap-4 items-center justify-center">
          <div className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 ${
            step === 1 ? "bg-blue-600/20 border border-blue-600" : "bg-gray-500/20 border border-gray-600"
          }`}>
            <span className={`h-6 w-6 rounded-full flex items-center justify-center ${
              step === 1 ? "bg-white text-blue-600" : "bg-gray-500/20 border border-gray-600"
            }`}>1</span>
            <span>Details</span>
          </div>
          <div className="h-1 w-8 bg-gray-500/20 border border-gray-600"></div>
          <div className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 ${
            step === 2 ? "bg-blue-600/20 border border-blue-600" : "bg-gray-500/20 border border-gray-600"
          }`}>
            <span className={`h-6 w-6 rounded-full flex items-center justify-center ${
              step === 2 ? "bg-white text-blue-600" : "bg-gray-500/20 border border-gray-600"
            }`}>2</span>
            <span>Questions</span>
          </div>
          <div className="h-1 w-8 bg-gray-500/20 border border-gray-600"></div>
          <div className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 ${
            step === 3 ? "bg-blue-600/20 border border-blue-600" : "bg-gray-500/20 border border-gray-600"
          }`}>
            <span className={`h-6 w-6 rounded-full flex items-center justify-center ${
              step === 3 ? "bg-white text-blue-600" : "bg-gray-700"
            }`}>3</span>
            <span>Review</span>
          </div>
        </div>
        
        {step === 1 && sessionInfoForm}
        {step === 2 && importTypeForm}
        {step === 3 && reviewForm}
      </div>
    </div>
  );
}

export default AdQA;