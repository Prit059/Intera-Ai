import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useNavigate, Link } from 'react-router-dom';
import RoadmapDisplay from '../../components/RoadmapDisplay';
import { 
  LucideLayoutGrid, 
  LucideLoader, 
  LucideSparkles,
  LucideRocket,
  LucideX,
  LucideArrowLeft,
  LucideFolderOpen
} from '../../components/Icons';
import { API_PATHS } from '../../utils/apiPaths';
import Navbar from '../../components/layouts/Navbar';
import axiosInstance from '../../utils/axiosInstance';
import { SaveToggle } from '../../components/SaveToggle/original'; // Import SaveToggle

// ... (keep all your techFieldsByBranch data exactly as is) ...
// 🏗️ Comprehensive Engineering Branches with Trending Fields (2025-26)
const techFieldsByBranch = {
  'Computer Science & IT': {
    fields: {
      'Software Development': ['MERN Stack', 'MEAN Stack', 'PERN Stack', 'Full Stack Development', 'Microservices Architecture', 'Cloud-Native Development', 'Low-Code/No-Code Platforms'],
      'AI & Machine Learning': ['Generative AI', 'Deep Learning', 'Computer Vision', 'Natural Language Processing', 'AI Ethics & Responsible AI', 'MLOps'],
      'Data Science & Analytics': ['Big Data Analytics', 'Data Engineering', 'Business Intelligence', 'Real-time Analytics', 'Data Visualization', 'Predictive Analytics'],
      'Cyber Security': ['Cloud Security', 'DevSecOps', 'Zero Trust Architecture', 'IoT Security', 'Blockchain Security', 'Threat Intelligence'],
      'Cloud Computing': ['Multi-Cloud Strategy', 'Serverless Computing', 'Kubernetes & Docker', 'Edge Computing', 'Cloud AI/ML Services', 'FinOps'],
      'Web Development': ['React.js', 'Vue.js', 'Next.js', 'Progressive Web Apps', 'Web3 Development', 'Jamstack Architecture'],
      'Mobile Development': ['React Native', 'Flutter', 'iOS Swift', 'Android Kotlin', 'Cross-Platform Development', 'Mobile AI Integration'],
      'DevOps & SRE': ['Infrastructure as Code', 'CI/CD Pipelines', 'Site Reliability Engineering', 'GitOps', 'Observability', 'Performance Engineering'],
      'Blockchain & Web3': ['Smart Contracts', 'DeFi Development', 'NFT Platforms', 'DAO Development', 'Web3 Security', 'Blockchain Interoperability']
    },
    icon: '💻'
  },
  'Electronics & Communication': {
    fields: {
      'VLSI & Chip Design': ['ASIC Design', 'FPGA Development', 'SoC Architecture', 'Analog/Mixed-Signal Design', 'Physical Design', 'Verification Engineering'],
      'Embedded Systems': ['RTOS Development', 'IoT Device Programming', 'Automotive Embedded Systems', 'Firmware Development', 'Embedded Linux', 'Edge AI'],
      '5G/6G Technology': ['Network Architecture', 'Signal Processing', 'Wireless Protocols', 'Network Slicing', 'Open RAN', 'Satellite Communication'],
      'IoT & Smart Devices': ['Industrial IoT', 'Smart Home Systems', 'Wearable Technology', 'Sensor Networks', 'IoT Security', 'Edge Computing'],
      'Robotics & Automation': ['Industrial Robotics', 'Autonomous Systems', 'Computer Vision for Robotics', 'Motion Planning', 'ROS Development', 'Collaborative Robots'],
      'Telecommunications': ['Network Security', 'Optical Communication', 'Mobile Networks', 'VoIP Systems', 'Network Virtualization', '5G Core Networks']
    },
    icon: '📡'
  },
  'Electrical Engineering': {
    fields: {
      'Power Systems': ['Smart Grid Technology', 'Renewable Energy Integration', 'Power Electronics', 'Energy Storage Systems', 'Grid Modernization', 'Microgrids'],
      'Electric Vehicles': ['EV Powertrain Design', 'Battery Management Systems', 'Charging Infrastructure', 'Motor Control Systems', 'Vehicle-to-Grid Technology', 'Autonomous Driving'],
      'Renewable Energy': ['Solar Power Systems', 'Wind Energy', 'Hydrogen Fuel Cells', 'Energy Harvesting', 'Green Hydrogen', 'Sustainable Energy Systems'],
      'Control Systems': ['Industrial Automation', 'PLC Programming', 'SCADA Systems', 'Digital Twins', 'Predictive Control', 'System Identification'],
      'Smart Cities': ['Intelligent Transportation', 'Energy Management Systems', 'Urban IoT', 'Sustainable Infrastructure', 'Digital City Planning', 'Smart Utilities']
    },
    icon: '⚡'
  },
  'Mechanical Engineering': {
    fields: {
      'Automotive Engineering': ['Electric Vehicle Design', 'Autonomous Vehicles', 'Lightweight Materials', 'Vehicle Dynamics', 'Thermal Management', 'Advanced Driver Assistance'],
      'Robotics & Mechatronics': ['Industrial Robotics', 'Humanoid Robots', 'Mechatronic Systems', 'Precision Engineering', 'Automation Systems', 'Digital Manufacturing'],
      'Additive Manufacturing': ['3D Printing', 'Rapid Prototyping', 'Metal Additive Manufacturing', 'Bioprinting', 'Design for Additive Manufacturing', 'Advanced Materials'],
      'Thermal Engineering': ['Computational Fluid Dynamics', 'Heat Transfer Systems', 'HVAC Design', 'Energy Efficiency', 'Thermal Management', 'Refrigeration Systems'],
      'CAD/CAM/CAE': ['Generative Design', 'Finite Element Analysis', 'Digital Twin Technology', 'Product Lifecycle Management', 'Simulation-Driven Design', 'Virtual Prototyping']
    },
    icon: '🔧'
  },
  'Civil Engineering': {
    fields: {
      'Smart Infrastructure': ['Building Information Modeling', 'Smart Cities Development', 'Sustainable Construction', 'Digital Twins for Infrastructure', 'Intelligent Transportation', 'Green Buildings'],
      'Structural Engineering': ['Earthquake-Resistant Design', 'Advanced Materials', 'Structural Health Monitoring', 'Bridge Engineering', 'Tall Building Design', 'Retrofitting Techniques'],
      'Environmental Engineering': ['Water Treatment', 'Waste Management', 'Air Quality Control', 'Environmental Impact Assessment', 'Sustainable Development', 'Climate Resilience'],
      'Construction Technology': ['Prefabricated Construction', 'Robotics in Construction', 'Construction Management Software', 'Safety Technologies', 'Project Planning', 'Quality Control'],
      'Geotechnical Engineering': ['Soil Mechanics', 'Foundation Engineering', 'Slope Stability', 'Ground Improvement Techniques', 'Geosynthetics', 'Underground Construction']
    },
    icon: '🏗️'
  },
  'Chemical Engineering': {
    fields: {
      'Process Engineering': ['Process Optimization', 'Plant Design', 'Process Safety', 'Quality Control', 'Scale-up Processes', 'Process Intensification'],
      'Biotechnology': ['Pharmaceutical Manufacturing', 'Bioprocess Engineering', 'Fermentation Technology', 'Vaccine Production', 'Tissue Engineering', 'Bioinformatics'],
      'Sustainable Energy': ['Biofuels', 'Carbon Capture', 'Hydrogen Production', 'Waste-to-Energy', 'Green Chemistry', 'Circular Economy'],
      'Materials Science': ['Nanomaterials', 'Polymer Engineering', 'Composite Materials', 'Advanced Ceramics', 'Smart Materials', 'Biomaterials'],
      'Environmental Technology': ['Water Treatment Processes', 'Air Pollution Control', 'Waste Valorization', 'Environmental Remediation', 'Sustainable Manufacturing', 'Green Processes']
    },
    icon: '🧪'
  },
  'Aerospace Engineering': {
    fields: {
      'Aircraft Design': ['Aerodynamic Optimization', 'Composite Structures', 'Flight Control Systems', 'Aircraft Systems Engineering', 'Structural Analysis', 'Propulsion Systems'],
      'Space Technology': ['Satellite Systems', 'Spacecraft Design', 'Orbital Mechanics', 'Launch Vehicle Technology', 'Space Mission Planning', 'Space Robotics'],
      'Drone Technology': ['UAV Design', 'Autonomous Navigation', 'Drone Swarm Technology', 'Aerial Imaging', 'Delivery Drones', 'Drone Regulations'],
      'Avionics': ['Flight Control Systems', 'Navigation Systems', 'Communication Systems', 'Radar Technology', 'Electronic Warfare', 'Cockpit Systems'],
      'Propulsion Systems': ['Jet Engine Design', 'Rocket Propulsion', 'Electric Propulsion', 'Hybrid Systems', 'Propulsion Control', 'Fuel Systems']
    },
    icon: '✈️'
  },
  'Automobile Engineering': {
    fields: {
      'Electric Vehicles': ['Battery Technology', 'Power Electronics', 'Motor Design', 'Charging Systems', 'Vehicle Control Systems', 'Thermal Management'],
      'Autonomous Vehicles': ['Sensor Fusion', 'Path Planning', 'Computer Vision', 'Vehicle-to-Everything', 'Decision Making Algorithms', 'Safety Systems'],
      'Vehicle Dynamics': ['Ride and Handling', 'Suspension Design', 'Brake Systems', 'Steering Systems', 'Noise Vibration Harshness', 'Vehicle Testing'],
      'Automotive Electronics': ['ADAS Systems', 'Infotainment Systems', 'Body Control Modules', 'Network Architecture', 'Diagnostic Systems', 'Embedded Software'],
      'Alternative Fuels': ['Hydrogen Vehicles', 'Biofuel Technology', 'Hybrid Systems', 'Fuel Cell Technology', 'Emission Control', 'Sustainable Mobility']
    },
    icon: '🚗'
  },
  'Information Technology': {
    fields: {
      'Cloud Architecture': ['Multi-Cloud Solutions', 'Cloud Security', 'Serverless Computing', 'Containerization', 'Cloud Migration', 'Cost Optimization'],
      'Network Engineering': ['Software-Defined Networking', 'Network Security', 'Wireless Networks', 'Network Automation', 'Cloud Networking', '5G Integration'],
      'Database Management': ['Big Data Systems', 'NoSQL Databases', 'Data Warehousing', 'Database Security', 'Data Governance', 'Real-time Databases'],
      'IT Infrastructure': ['Virtualization', 'Storage Systems', 'Data Center Management', 'Disaster Recovery', 'IT Service Management', 'Infrastructure Automation'],
      'Cyber Security': ['Network Security', 'Application Security', 'Identity Management', 'Security Operations', 'Vulnerability Management', 'Compliance']
    },
    icon: '🌐'
  },
  'Mechatronics Engineering': {
    fields: {
      'Industrial Automation': ['PLC Systems', 'SCADA', 'Industrial Robotics', 'Process Control', 'Automation Systems', 'Smart Manufacturing'],
      'Robotic Systems': ['Mobile Robotics', 'Manipulator Design', 'Sensor Integration', 'Motion Control', 'Robot Programming', 'Human-Robot Interaction'],
      'Control Systems': ['Digital Control', 'System Identification', 'Adaptive Control', 'Fuzzy Logic', 'Neural Networks', 'Optimal Control'],
      'Smart Systems': ['IoT Integration', 'Cyber-Physical Systems', 'Embedded Systems', 'Real-time Systems', 'System Integration', 'Diagnostic Systems'],
      'Advanced Manufacturing': ['Industry 4.0', 'Digital Twins', 'Additive Manufacturing', 'Precision Engineering', 'Quality Control', 'Supply Chain Automation']
    },
    icon: '🤖'
  }
};

const RoadmapGenerator = () => {
  const canvasRef = useRef();
  const navigate = useNavigate();

  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFields, setSelectedFields] = useState([]);
  const [techField, setTechField] = useState('');
  const [duration, setDuration] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [companies, setCompanies] = useState(null);
  const [flowchart, setFlowchart] = useState(null);
  const [emergingTrends, setEmergingTrends] = useState(null);
  const [salaryRange, setSalaryRange] = useState(null);
  const [jobRoles, setJobRoles] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [roadmapId, setRoadmapId] = useState(null);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState([]);

  // Load drafts on mount
  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = () => {
    const drafts = JSON.parse(localStorage.getItem('roadmap_drafts') || '[]');
    setSavedDrafts(drafts);
  };

  // 🎯 Handle branch selection
  const handleBranchSelect = (branchName) => {
    setSelectedBranch(branchName);
    setSelectedCategory('');
    setSelectedFields([]);
    setTechField('');
  };

  // 🎯 Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedFields([]);
    setTechField('');
  };

  // 🎯 Handle field selection
  const handleFieldSelect = (field) => {
    let newSelected;
    if (selectedFields.includes(field)) {
      newSelected = selectedFields.filter(f => f !== field);
    } else {
      newSelected = [...selectedFields, field];
    }
    setSelectedFields(newSelected);
    setTechField(newSelected.join(", "));
  };

  // 🧹 Clear all selections
  const handleClearAll = () => {
    setSelectedBranch('');
    setSelectedCategory('');
    setSelectedFields([]);
    setTechField('');
    setDuration('');
  };

  // 💾 Save Draft Function
  const handleSaveDraft = async () => {
    const fieldsToUse = selectedFields.length > 0 ? selectedFields.join(", ") : techField;
    
    if (!fieldsToUse && !selectedBranch && !selectedCategory) {
      setError("Please select at least some fields before saving draft");
      throw new Error("No data to save");
    }

    const draftData = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      selectedBranch,
      selectedCategory,
      selectedFields,
      techField,
      duration,
      status: 'draft'
    };

    // Get existing drafts
    const existingDrafts = JSON.parse(localStorage.getItem('roadmap_drafts') || '[]');
    
    // Add new draft
    existingDrafts.unshift(draftData);
    
    // Keep only last 20 drafts
    const trimmedDrafts = existingDrafts.slice(0, 20);
    
    localStorage.setItem('roadmap_drafts', JSON.stringify(trimmedDrafts));
    
    console.log('✅ Roadmap draft saved:', draftData);
    loadDrafts(); // Refresh drafts list
    
    return draftData;
  };

  // 📂 Load Draft Function
  const handleLoadDraft = (draft) => {
    setSelectedBranch(draft.selectedBranch || '');
    setSelectedCategory(draft.selectedCategory || '');
    setSelectedFields(draft.selectedFields || []);
    setTechField(draft.techField || '');
    setDuration(draft.duration || '');
    
    setShowDraftsModal(false);
    
    // Show success message
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    toast.innerText = '✅ Draft loaded successfully!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  // 🗑️ Delete Draft Function
  const handleDeleteDraft = (draftId) => {
    const updatedDrafts = savedDrafts.filter(draft => draft.id !== draftId);
    localStorage.setItem('roadmap_drafts', JSON.stringify(updatedDrafts));
    loadDrafts();
  };

  // 🧹 Clear all drafts
  const handleClearAllDrafts = () => {
    if (window.confirm('Are you sure you want to delete ALL roadmap drafts?')) {
      localStorage.removeItem('roadmap_drafts');
      loadDrafts();
      setShowDraftsModal(false);
    }
  };

  const handleSaveStatusChange = (status) => {
    console.log('Save button status:', status);
    if (status === 'saved') {
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.innerText = '✅ Roadmap draft saved!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }
  };

  // 📡 Enhanced API request with detailed prompt
  const generateRoadmap = async (prompt) => {
    setIsLoading(true);
    setError(null);

    try {
      const enhancedPrompt = `
        Generate a comprehensive learning roadmap for ${prompt}.
        
        Context:
        - Branch: ${selectedBranch}
        - Category: ${selectedCategory}
        - Specific Fields: ${selectedFields.join(', ')}
        - Duration: ${duration}
        
        Requirements for 2025-26 job market:
        - Focus on trending and in-demand technologies
        - Include future-proof skills
        - Provide practical, industry-relevant content
        - Include both fundamental and advanced topics
        - Suggest real-world projects
        - Include emerging technologies and tools
        
        Generate a detailed, structured roadmap that will help secure high-paying jobs in this field.
      `;

      const res = await axiosInstance.post(
        API_PATHS.ROADMAP.ROADMAP_GENERATE,
        { prompt: enhancedPrompt }
      );

      const data = res.data;

      setRoadmap(data.roadmap || []);
      setCompanies(data.companies || []);
      setFlowchart(data.flowchart || []);
      setEmergingTrends(data.emergingTrends || []);
      setSalaryRange(data.salaryRange || '');
      setJobRoles(data.jobRoles || []);
      setRoadmapId(data._id);
      setShowPreview(true);
    } catch (error) {
      setError(error.response?.data?.error || error.message);
      setTimeout(() => {  
        setError(null);
      }, 4000);
    } finally {
      setIsLoading(false);
    }
  };

  // 📋 Form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const fieldsToUse = selectedFields.length > 0 ? selectedFields.join(", ") : techField;

    if (!fieldsToUse || !duration) {
      setError("Please select fields and enter duration.");
      return;
    }

    const prompt = `${selectedBranch} - ${selectedCategory}: ${fieldsToUse} for ${duration}`;
    generateRoadmap(prompt);
  };

  const handleViewFullScreen = (id) => {
    localStorage.setItem('generatedRoadmap', JSON.stringify({
      roadmap,
      companies,
      flowchart,
      emergingTrends,
      salaryRange,
      jobRoles,
      techField: `${selectedBranch} - ${selectedCategory}: ${selectedFields.join(', ')}`,
      duration
    }));
    
    navigate(`/roadmap-view/${id}`);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Navbar />
      
      {/* Drafts Modal */}
      {showDraftsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-700">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <LucideFolderOpen className="w-5 h-5 text-blue-400" />
                Saved Roadmap Drafts
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
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <LucideFolderOpen className="w-3 h-3" />
                              {new Date(draft.createdAt).toLocaleString()}
                            </span>
                          </div>
                          
                          <p className="text-white font-medium">
                            {draft.selectedBranch || 'No branch'} → {draft.selectedCategory || 'No category'}
                          </p>
                          
                          {draft.selectedFields.length > 0 && (
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                              📚 Fields: {draft.selectedFields.join(', ')}
                            </p>
                          )}
                          
                          {draft.duration && (
                            <p className="text-sm text-gray-400 mt-1">
                              ⏱️ Duration: {draft.duration}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleLoadDraft(draft)}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-1"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDeleteDraft(draft.id)}
                            className="px-3 py-1.5 text-sm bg-red-600/20 border border-red-600 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Three.js Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 opacity-30"
        style={{ background: 'transparent' }}
      ></canvas>
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 z-1 bg-gradient-to-br from-blue-900/10 via-purple-900/5 to-indigo-900/10 animate-pulse-slow"></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/roadmapdashboard">
            <div className='text-white flex items-center gap-2 underline font-medium text-lg'>
              <LucideArrowLeft />Back to Dashboard
            </div>
          </Link>
          
          {/* View Drafts Button */}
          <button
            onClick={() => setShowDraftsModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700/40 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700/60 transition-colors"
          >
            <LucideFolderOpen className="w-4 h-4" />
            Drafts ({savedDrafts.length})
          </button>
        </div>
        
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
            <LucideRocket className="w-12 h-12" /> 
            Roadmap Generator
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Select your engineering branch and trending fields to generate a personalized learning roadmap for 2025-26 job market.
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form Section */}
          <div className="lg:w-4/5">
            <div className="bg-gray-700/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-gray-700">
              <div className="flex items-center gap-2 mb-6">
                <LucideSparkles className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Create Your Career Roadmap</h2>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Branch Selection */}
                <div className="mb-6">
                  <label className="block text-gray-300 mb-3 font-medium">Select Engineering Branch</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
                    {Object.entries(techFieldsByBranch).map(([branch, { icon }]) => (
                      <button
                        type="button"
                        key={branch}
                        onClick={() => handleBranchSelect(branch)}
                        className={`p-3 rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                          selectedBranch === branch 
                            ? 'bg-purple-700/10 border border-purple-500 text-white shadow-lg' 
                            : 'bg-gray-700/60 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <span className="text-lg">{icon}</span>
                        <span className="text-xs">{branch}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Selection (Conditional) */}
                {selectedBranch && (
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-3 font-medium">
                      Select Category in {selectedBranch}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(techFieldsByBranch[selectedBranch].fields).map(category => (
                        <button
                          type="button"
                          key={category}
                          onClick={() => handleCategorySelect(category)}
                          className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                            selectedCategory === category 
                              ? 'bg-blue-700/20 border border-blue-600 text-white shadow-lg' 
                              : 'bg-gray-700/60 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Field Selection (Conditional) */}
                {selectedCategory && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-gray-300 font-medium">
                        Select Specific Technologies in {selectedCategory}
                      </label>
                      <span className="text-sm text-gray-400">
                        {selectedFields.length} selected
                      </span>
                    </div>
                    
                    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600/50">
                      <div className="flex flex-wrap gap-2">
                        {techFieldsByBranch[selectedBranch].fields[selectedCategory].map(field => (
                          <button
                            type="button"
                            key={field}
                            onClick={() => handleFieldSelect(field)}
                            className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                              selectedFields.includes(field) 
                                ? 'bg-blue-700/20 border border-blue-600 text-white shadow-lg' 
                                : 'bg-gray-700/60 text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            {field}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom Input (Fallback) */}
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2 font-medium">
                    Or Enter Custom Field
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="e.g., Quantum Computing, Advanced Robotics, etc."
                    value={techField}
                    onChange={(e) => { 
                      setTechField(e.target.value); 
                      setSelectedFields([]);
                      setSelectedCategory("");
                      setSelectedBranch("");
                    }}
                  />
                </div>

                {/* Duration Input */}
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2 font-medium">Learning Duration</label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="e.g., 3 months, 6 months, 1 year, 2 years"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>

                {/* Action Buttons - Added SaveToggle here */}
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={handleClearAll}
                    className="flex-1 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
                  >
                    Clear All
                  </button>
                  
                  {/* SaveToggle Button - Saves draft */}
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
                    disabled={isLoading}
                    className="flex-1 py-3 rounded-lg bg-blue-700/20 border border-blue-600 hover:bg-blue-500/40 text-white font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-blue-500/20 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <LucideLoader className="animate-spin w-5 h-5" /> 
                        Generating...
                      </>
                    ) : (
                      <>
                        <LucideLayoutGrid className="w-5 h-5" /> 
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-900/40 border border-red-700/50 text-red-200">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:w-96">
            {showPreview && roadmap ? (
              <div className="bg-gray-700/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <LucideSparkles className="w-5 h-5 text-blue-400" />
                    Your Generated Roadmap
                  </h2>
                  <button
                    onClick={() => handleViewFullScreen(roadmapId)}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
                  >
                    View Full Screen
                  </button>
                </div>
                
                <div className="max-h-96 overflow-y-auto pr-2">
                  <RoadmapDisplay 
                    roadmap={roadmap} 
                    companies={companies} 
                    flowchart={flowchart} 
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-700/10 backdrop-blur-sm rounded-2xl border border-gray-700 border-dashed p-8">
                <div className="text-center text-gray-500">
                  <LucideLayoutGrid className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Your roadmap will appear here</p>
                  <p className="text-sm mt-1">Select branch, category, fields and generate</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapGenerator;