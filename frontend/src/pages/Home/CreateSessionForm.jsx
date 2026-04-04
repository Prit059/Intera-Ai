// frontend/src/pages/CreateSession/CreateSessionForm.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { LuSparkles } from "react-icons/lu";
import { AnimatePresence, motion } from 'framer-motion';
import { BRANCH_ROLES, ROLE_TOPICS } from '../../utils/Role_Data';
import { COMPANY_NAME, COMPANY_JOB_ROLE } from '../../utils/company_data';
import { SaveToggle } from '../../components/SaveToggle/original';
import { Tags } from '../../components/Tags/Tags';
import { 
  LucideFolderOpen, 
  LucideTrash2,
  LucideClock,
  LucideCheckCircle
} from 'lucide-react';

function CreateSessionForm() {
  const [formData, setFormData] = useState({
    role: "",
    topicsFocus: "",
    experience: "",
    description: "",
    company: "",
    job: "",
    jobRole: "",
    customCompany: ""
  });
  
  const [customRole, setCustomRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("CSE");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedTopicTags, setSelectedTopicTags] = useState([]);
  const [customTopic, setCustomTopic] = useState("");
  const [selectionMode, setSelectionMode] = useState("general");
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState([]);
  const navigate = useNavigate();

  // Load drafts on mount
  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = () => {
    const drafts = JSON.parse(localStorage.getItem('interview_drafts') || '[]');
    setSavedDrafts(drafts);
  };

  const handleChange = (key, value) => {
    setFormData(prevData => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleRoleChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, role: value }));
    if (value !== "Other") {
      setCustomRole("");
      setSelectedTopics([]);
      setSelectedTopicTags([]);
      setCustomTopic("");
    }
  };

  const handleBranchClick = (branch) => {
    setSelectedBranch(branch);
    setFormData(prev => ({ ...prev, role: "" }));
    setCustomRole("");
    setSelectedTopics([]);
    setSelectedTopicTags([]);
  };

  const handleCompanyChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, company: value }));
  };

  const handleCompanyJobChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, job: value }));
  };

  // Convert ROLE_TOPICS to Tag format
  const getTopicsAsTags = () => {
    if (!formData.role || formData.role === "Other") return [];
    
    const topics = ROLE_TOPICS[formData.role] || [];
    return topics.map(topic => ({
      id: topic.toLowerCase().replace(/\s+/g, '-'),
      label: topic
    }));
  };

  // Update topicsFocus when selectedTopicTags change
  useEffect(() => {
    const topicsString = selectedTopicTags.map(tag => tag.label).join(", ");
    setFormData(prev => ({ ...prev, topicsFocus: topicsString }));
  }, [selectedTopicTags]);

  // Sync the old selectedTopics array with new tag format
  useEffect(() => {
    if (selectedTopics.length > 0 && selectedTopicTags.length === 0) {
      const tagsFromOld = selectedTopics.map(topic => ({
        id: topic.toLowerCase().replace(/\s+/g, '-'),
        label: topic
      }));
      setSelectedTopicTags(tagsFromOld);
    }
  }, [selectedTopics]);

  // Handle tag changes
  const handleTagsChange = (newTags) => {
    setSelectedTopicTags(newTags);
    // Also update the old selectedTopics for compatibility
    setSelectedTopics(newTags.map(tag => tag.label));
  };

  // Handle custom topic addition
  const handleAddCustomTopic = () => {
    if (customTopic.trim()) {
      const newTag = {
        id: customTopic.toLowerCase().replace(/\s+/g, '-'),
        label: customTopic.trim()
      };
      if (!selectedTopicTags.some(t => t.id === newTag.id)) {
        setSelectedTopicTags([...selectedTopicTags, newTag]);
        setSelectedTopics([...selectedTopics, customTopic.trim()]);
        setCustomTopic("");
      }
    }
  };

  // Save Draft Function
  const handleSaveDraft = async () => {
    const roleValue = formData.role === "Other" ? customRole : formData.role;
    const topicsFocus = selectedTopicTags.length > 0 
      ? selectedTopicTags.map(tag => tag.label).join(", ") 
      : "";
    
    // Validate required fields
    if (!roleValue && selectionMode === "general") {
      setError("Please select a role before saving draft");
      throw new Error("Role required");
    }

    const draftData = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      selectionMode,
      formData: {
        role: roleValue,
        experience: formData.experience,
        topicsFocus: topicsFocus,
        description: formData.description,
        company: formData.company,
        job: formData.job,
        jobRole: formData.jobRole,
        customCompany: formData.customCompany
      },
      selectedBranch,
      selectedTopics: selectedTopicTags.map(tag => tag.label),
      selectedTopicTags,
      customRole,
      customTopic,
      status: 'draft'
    };

    // Get existing drafts
    const existingDrafts = JSON.parse(localStorage.getItem('interview_drafts') || '[]');
    
    // Add new draft
    existingDrafts.unshift(draftData);
    
    // Keep only last 20 drafts
    const trimmedDrafts = existingDrafts.slice(0, 20);
    
    localStorage.setItem('interview_drafts', JSON.stringify(trimmedDrafts));
    
    console.log('✅ Draft saved:', draftData);
    loadDrafts(); // Refresh drafts list
    
    return draftData;
  };

  // Load Draft Function
  const handleLoadDraft = (draft) => {
    // Restore form data
    setFormData({
      role: draft.formData.role || "",
      topicsFocus: draft.formData.topicsFocus || "",
      experience: draft.formData.experience || "",
      description: draft.formData.description || "",
      company: draft.formData.company || "",
      job: draft.formData.job || "",
      jobRole: draft.formData.jobRole || "",
      customCompany: draft.formData.customCompany || ""
    });
    
    setSelectedBranch(draft.selectedBranch || "CSE");
    setSelectedTopics(draft.selectedTopics || []);
    setSelectedTopicTags(draft.selectedTopicTags || []);
    setCustomRole(draft.customRole || "");
    setCustomTopic(draft.customTopic || "");
    setSelectionMode(draft.selectionMode || "general");
    
    setShowDraftsModal(false);
    
    // Show success message
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    toast.innerText = '✅ Draft loaded successfully!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  // Delete Draft Function
  const handleDeleteDraft = (draftId) => {
    const updatedDrafts = savedDrafts.filter(draft => draft.id !== draftId);
    localStorage.setItem('interview_drafts', JSON.stringify(updatedDrafts));
    loadDrafts();
  };

  // Clear all drafts
  const handleClearAllDrafts = () => {
    if (window.confirm('Are you sure you want to delete ALL drafts?')) {
      localStorage.removeItem('interview_drafts');
      loadDrafts();
      setShowDraftsModal(false);
    }
  };

  const handleSaveStatusChange = (status) => {
    console.log('Save button status:', status);
    if (status === 'saved') {
      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.innerText = '✅ Draft saved successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();

    if (selectionMode === "general") {
      // General Q&A Logic
      const roleValue = formData.role === "Other" ? customRole : formData.role;
      
      if (!roleValue || !formData.experience || !formData.description) {
        setError("Please fill Role, Experience, and Description fields.");
        return;
      }

      const topicsFocus = selectedTopicTags.length > 0 
        ? selectedTopicTags.map(tag => tag.label).join(", ") 
        : "General interview topics";
      
      setError("");
      setIsLoading(true);

      try {
        const aiResponse = await axiosInstance.post(API_PATHS.AI.GENERATE_QUESTIONS, {
          role: roleValue,
          experience: formData.experience,
          topicsFocus: topicsFocus,
          numberOfQuestions: 10,
        });

        const generatedQuestions = aiResponse.data;

        const response = await axiosInstance.post(API_PATHS.SESSION.CREATE, {
          role: roleValue,
          experience: formData.experience,
          topicsFocus: topicsFocus,
          description: formData.description,
          questions: generatedQuestions,
          interviewType: "general",
          branch: selectedBranch,
        });

        if (response.data?.session?._id) {
          navigate(`/interview-prep/${response.data.session._id}`);
        }
      } catch (error) {
        console.error("API Error:", error.response?.data || error.message);
        
        if (error.response?.data?.error?.includes("API key") || error.response?.status === 401) {
          setError("Gemini API configuration issue. Please check API key and billing setup.");
        } else if (error.response?.data?.error?.includes("quota") || error.response?.status === 429) {
          setError("API quota exceeded. Please check your Google Cloud billing.");
        } else if (error.response && error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }

    } else {
      // Company-Wise Q&A Logic
      const companyValue = formData.company === "Other" ? formData.customCompany : formData.company;
      const jobRoleValue = formData.job === "Other" ? formData.jobRole : formData.job;
      const { experience, description } = formData;

      if (!companyValue || !jobRoleValue || !experience) {
        setError("Please fill all the required fields: Company, Job Role, and Experience.");
        return;
      }

      setError("");
      setIsLoading(true);

      try {
        const aiResponse = await axiosInstance.post(API_PATHS.AI.GENERATE_COMPANY_QUESTIONS, {
          company: companyValue,
          jobRole: jobRoleValue,
          experience,
          description: description || "General company interview preparation",
          numberOfQuestions: 10,
        });

        const generatedQuestions = aiResponse.data;

        const response = await axiosInstance.post(API_PATHS.SESSION.CREATE, {
          role: jobRoleValue,
          experience,
          topicsFocus: `${companyValue} Interview Preparation`,
          description,
          questions: generatedQuestions,
          interviewType: "company",
          company: companyValue,
          jobRole: jobRoleValue,
          branch: "Company Specific",
        });

        if (response.data?.session?._id) {
          navigate(`/interview-prep/${response.data.session._id}`);
        }
      } catch (error) {
        console.error("Company API Error:", error.response?.data || error.message);
        
        if (error.response?.data?.error?.includes("API key")) {
          setError("Gemini API configuration issue. Please check API key and billing setup.");
        } else if (error.response && error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 sm:p-6">
      {/* Drafts Modal */}
      {showDraftsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-700"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <LucideFolderOpen className="w-5 h-5 text-blue-400" />
                Saved Drafts
                <span className="text-sm text-gray-400 ml-2">({savedDrafts.length})</span>
              </h2>
              <div className="flex gap-2">
                {savedDrafts.length > 0 && (
                  <button
                    onClick={handleClearAllDrafts}
                    className="px-3 py-1.5 text-sm bg-red-600/20 border border-red-600 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowDraftsModal(false)}
                  className="px-3 py-1.5 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto p-4 max-h-[60vh]">
              {savedDrafts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <LucideFolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No saved drafts found</p>
                  <p className="text-sm mt-1">Fill the form and click "Save Draft"</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedDrafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-blue-500 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              draft.selectionMode === 'general' 
                                ? 'bg-blue-600/20 text-blue-400 border border-blue-600' 
                                : 'bg-yellow-600/20 text-yellow-400 border border-yellow-600'
                            }`}>
                              {draft.selectionMode === 'general' ? 'General Q&A' : 'Company Q&A'}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <LucideClock className="w-3 h-3" />
                              {new Date(draft.createdAt).toLocaleString()}
                            </span>
                          </div>
                          
                          <p className="text-white font-medium">
                            {draft.selectionMode === 'general' 
                              ? draft.formData.role || 'No role selected'
                              : `${draft.formData.company || 'No company'} - ${draft.formData.job || 'No role'}`
                            }
                          </p>
                          
                          {draft.formData.experience && (
                            <p className="text-sm text-gray-400 mt-1">
                              📅 Experience: {draft.formData.experience} years
                            </p>
                          )}
                          
                          {draft.formData.topicsFocus && (
                            <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                              📚 Topics: {draft.formData.topicsFocus}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleLoadDraft(draft)}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-1"
                          >
                            <LucideCheckCircle className="w-4 h-4" />
                            Load
                          </button>
                          <button
                            onClick={() => handleDeleteDraft(draft.id)}
                            className="px-3 py-1.5 text-sm bg-red-600/20 border border-red-600 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                          >
                            <LucideTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Form Section */}
      <div className="w-full max-w-xl">
        <div className="bg-gray-700/20 bg-opacity-90 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-600">
          
          {/* Mode Selection Tabs */}
          <div className='text-center border border-gray-700 rounded-lg sm:rounded-xl flex justify-between mb-4 sm:mb-6'>
            <button 
              onClick={() => setSelectionMode("general")} 
              className={`rounded-lg sm:rounded-xl cursor-pointer text-white w-1/2 px-3 sm:px-4 py-2 text-sm sm:text-base ${
                selectionMode === "general" 
                  ? 'bg-blue-600/20 border border-blue-600/40 transition' 
                  : 'hover:bg-gray-600/20'
              }`}
            >
              General Q&A
            </button>
            <button 
              onClick={() => setSelectionMode("company")} 
              className={`rounded-lg sm:rounded-xl cursor-pointer text-white w-1/2 px-3 sm:px-4 py-2 text-sm sm:text-base ${
                selectionMode === "company" 
                  ? 'bg-yellow-600/20 border border-yellow-600/40 transition' 
                  : 'hover:bg-gray-600/20'
              }`}
            >
              Company Q&A
            </button>
          </div>
          
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="font-bold text-xl sm:text-2xl flex items-center justify-center text-white mb-2">
              <LuSparkles className="text-orange-400 mr-2" size={20} />
              Start Your Journey with Intera.AI
            </h3>
            <p className="text-xs sm:text-sm text-gray-400">
              Fill out a few quick details to get started with personalized interview questions!
            </p>
          </div>

          <AnimatePresence mode="wait">
            {selectionMode === "general" && (
              <motion.div
                key="general"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleCreateSession} className="flex flex-col gap-4">
                  {/* Branch selection buttons */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Select Branch
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(BRANCH_ROLES).map(branch => (
                        <button
                          type="button"
                          key={branch}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 text-sm
                            ${selectedBranch === branch
                              ? 'bg-blue-600/20 border border-blue-400 text-white shadow-lg'
                              : 'bg-gray-700/20 border border-gray-700 text-gray-200 hover:bg-gray-600/40'}
                          `}
                          onClick={() => handleBranchClick(branch)}
                        >
                          {branch}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Role Selection */}
                  {selectedBranch && (
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Target Role ({selectedBranch})
                      </label>
                      <select
                        value={formData.role}
                        onChange={handleRoleChange}
                        className="w-full border border-gray-700 rounded-lg p-2.5 bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="">Select a role</option>
                        {BRANCH_ROLES[selectedBranch].map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Custom Role Input */}
                  {formData.role === "Other" && (
                    <Input
                      value={customRole}
                      onChange={({ target }) => setCustomRole(target.value)}
                      label="Custom Role"
                      placeholder="Enter your role"
                      type="text"
                      className="bg-gray-700/20 text-white"
                    />
                  )}

                  {/* Experience Field */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Experience *
                    </label>
                    <input
                      type="number"
                      value={formData.experience}
                      onChange={(e) => handleChange("experience", e.target.value)}
                      placeholder="e.g., 1, 2, 3 years"
                      className="w-full border border-gray-700 rounded-lg p-2.5 bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter your years of experience</p>
                  </div>

                  {/* Topics Selection with Animated Tags */}
                  {formData.role && formData.role !== "Other" && (
                    <div className="mt-2">
                      <Tags
                        tags={getTopicsAsTags()}
                        selectedTags={selectedTopicTags}
                        onTagsChange={handleTagsChange}
                        placeholder="Click on topics below to select them"
                        title="Select Topics (Optional)"
                      />
                    </div>
                  )}

                  {/* Custom Topic Addition */}
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={customTopic}
                      onChange={({ target }) => setCustomTopic(target.value)}
                      label="Add Custom Topic"
                      placeholder="Enter your own topic"
                      type="text"
                      className="flex-1 bg-gray-700/20 text-white"
                    />
                    <button
                      type='button'
                      className='px-4 py-2 rounded-lg text-sm font-medium bg-cyan-600/20 border border-cyan-600 text-white mt-6 hover:bg-cyan-600/30 transition-colors'
                      onClick={handleAddCustomTopic}
                    >
                      ➕ Add Topic
                    </button>
                  </div>

                  {/* Selected Topics Display */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Selected Topics
                    </label>
                    <div className="w-full border border-gray-700 rounded-lg p-2.5 bg-gray-800/50 text-gray-300 min-h-[42px]">
                      {selectedTopicTags.length > 0 
                        ? selectedTopicTags.map(t => t.label).join(", ") 
                        : "No topics selected"}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedTopicTags.length} topic{selectedTopicTags.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>

                  {/* Description Field */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Describe your goals, specific questions, or areas you'd like to focus on..."
                      rows={3}
                      className="w-full border border-gray-700 rounded-lg p-2.5 bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tell us more about what you want to achieve</p>
                  </div>

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  {/* Button Group */}
                  <div className="flex gap-3 mt-2">
                    <SaveToggle
                      size="md"
                      idleText="Save Draft"
                      savedText="Draft Saved!"
                      loadingDuration={1200}
                      successDuration={1000}
                      onSave={handleSaveDraft}
                      onStatusChange={handleSaveStatusChange}
                      className="flex-1"
                    />
                    
                    <button
                      type="submit"
                      className="flex-1 flex justify-center items-center gap-2 bg-blue-700/20 border border-blue-500 text-white p-2.5 rounded-lg hover:bg-blue-700/40 font-bold transition-all duration-200 shadow-lg"
                      disabled={isLoading}
                    >
                      {isLoading && <SpinnerLoader />} 
                      {isLoading ? 'Creating...' : 'Create Session'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {selectionMode === "company" && (
              <motion.div
                key="company"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleCreateSession} className="flex flex-col gap-4">
                  {/* Company Selection */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Select Company *
                    </label>
                    <select
                      value={formData.company}
                      onChange={handleCompanyChange}
                      className="w-full border border-gray-700 rounded-lg p-2.5 bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Select a company</option>
                      {COMPANY_NAME.map(company => (
                        <option key={company} value={company}>{company}</option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Company */}
                  {formData.company === "Other" && (
                    <Input
                      label="Company Name"
                      placeholder="Enter company name"
                      type="text"
                      className="bg-gray-700/20 text-white"
                      value={formData.customCompany || ""}
                      onChange={({ target }) => handleChange("customCompany", target.value)}
                    />
                  )}

                  {/* Job Role Selection */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Select Job Role *
                    </label>
                    <select
                      value={formData.job}
                      onChange={handleCompanyJobChange}
                      className="w-full border border-gray-700 rounded-lg p-2.5 bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Select a role</option>
                      {COMPANY_JOB_ROLE.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Job Role */}
                  {formData.job === "Other" && (
                    <Input
                      label="Job Role"
                      placeholder="e.g., SDE, Data Scientist"
                      type="text"
                      className="bg-gray-700/20 text-white"
                      value={formData.jobRole || ""}
                      onChange={({ target }) => handleChange("jobRole", target.value)}
                    />
                  )}

                  {/* Experience */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Experience (years) *
                    </label>
                    <input
                      type="number"
                      value={formData.experience}
                      onChange={(e) => handleChange("experience", e.target.value)}
                      placeholder="e.g., 1, 2, 3"
                      className="w-full border border-gray-700 rounded-lg p-2.5 bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Any special instructions or focus areas?"
                      rows={3}
                      className="w-full border border-gray-700 rounded-lg p-2.5 bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    />
                  </div>

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  {/* Button Group */}
                  <div className="flex gap-3 mt-2">
                    <SaveToggle
                      size="md"
                      idleText="Save Draft"
                      savedText="Draft Saved!"
                      loadingDuration={1200}
                      successDuration={1000}
                      onSave={handleSaveDraft}
                      onStatusChange={handleSaveStatusChange}
                      className="flex-1"
                    />
                    
                    <button
                      type="submit"
                      className="flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white p-2.5 rounded-lg hover:from-orange-600 hover:to-pink-600 font-bold transition-all duration-200 shadow-lg"
                      disabled={isLoading}
                    >
                      {isLoading && <SpinnerLoader />} 
                      {isLoading ? 'Creating...' : 'Create Session'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* View Saved Drafts Button */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowDraftsModal(true)}
              className="text-sm text-gray-400 hover:text-gray-300 underline flex items-center justify-center gap-1 mx-auto"
            >
              <LucideFolderOpen className="w-3.5 h-3.5" />
              View Saved Drafts ({savedDrafts.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateSessionForm;