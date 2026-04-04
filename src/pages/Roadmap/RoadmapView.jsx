// frontend/src/pages/Roadmap/RoadmapView.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  LucideArrowLeft, 
  LucideEdit3,
  LucideClock,
  LucideBookOpen,
  LucideYoutube,
  LucideBriefcase,
  LucidePlus,
  LucideExternalLink
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import Navbar from '../../components/layouts/Navbar';

const RoadmapView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRoadmap();
  }, [id]);

  const fetchRoadmap = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.ROADMAP.GET_ONE(id));
      const roadmapData = response.data.roadmap;
      
      setRoadmap(roadmapData.roadmap || []);
      setCompanies(roadmapData.companies || []);
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      setError('Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoadmap = () => {
    navigate(`/roadmap-edit/${id}`);
  };

  // Flatten all steps for grid view
  const getAllSteps = () => {
    const steps = [];
    if (!roadmap) return steps;
    
    roadmap.forEach((phase, phaseIdx) => {
      if (phase.steps && phase.steps.length > 0) {
        phase.steps.forEach((step, stepIdx) => {
          steps.push({
            ...step,
            phaseTitle: phase.title,
            phaseId: phase._id,
            phaseIndex: phaseIdx,
            stepIndex: stepIdx
          });
        });
      }
    });
    return steps;
  };

  const allSteps = getAllSteps();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/roadmapdashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <LucideArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          
          <button
            onClick={handleEditRoadmap}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
          >
            <LucideEdit3 className="w-4 h-4" />
            Edit Roadmap
          </button>
        </div>

        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {roadmap?.[0]?.field || 'Full Stack Developer'} Roadmap
          </h1>
          <p className="text-gray-400 text-sm mt-2 max-w-2xl mx-auto">
            {roadmap?.[0]?.description || 'This roadmap provides a structured path to becoming a proficient developer.'}
          </p>
          <div className="inline-block mt-3 px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-sm text-blue-300">
            <LucideClock className="w-3 h-3 inline mr-1" />
            Duration: {roadmap?.[0]?.estimatedTime || '12-18 Months'}
          </div>
        </div>

        {/* Create Another Roadmap Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/roadmapgen')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-white transition-colors border border-gray-600"
          >
            <LucidePlus className="w-4 h-4" />
            Create Another Roadmap
          </button>
        </div>

        {/* GRID VIEW - Like your screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allSteps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, #f0f0f0 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }}
            >
              <div className="p-5">
                {/* Phase Badge and Time */}
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                    {step.phaseTitle || 'Core Concept'}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <LucideClock className="w-3 h-3" />
                    {step.estimatedTime || '2-3 weeks'}
                  </span>
                </div>
                
                {/* Step Title */}
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {step.stepTitle}
                </h3>
                
                {/* Description */}
                <p className="text-gray-500 text-sm mb-4">
                  {step.description || 'Learn and master this concept with hands-on practice.'}
                </p>
                
                {/* Resources Links */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {step.resources?.youtube?.slice(0, 2).map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <LucideYoutube className="w-3 h-3" />
                      Video {i + 1}
                    </a>
                  ))}
                  {step.resources?.coursera?.slice(0, 2).map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-500 hover:text-green-600 flex items-center gap-1"
                    >
                      <LucideBookOpen className="w-3 h-3" />
                      Course {i + 1}
                    </a>
                  ))}
                </div>
                
                {/* Learn More Link */}
                <button
                  onClick={() => {
                    // Find phase element and scroll
                    const phaseElement = document.getElementById(`phase-${step.phaseId}`);
                    if (phaseElement) {
                      phaseElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
                >
                  Learn More →
                </button>
              </div>
            </div>
          ))}
        </div>

        {allSteps.length === 0 && (
          <div className="text-center py-12 bg-gray-800/20 rounded-xl">
            <p className="text-gray-400">No roadmap steps available.</p>
          </div>
        )}

        {/* Companies Hiring Section */}
        {companies && companies.length > 0 && (
          <div className="mt-8 bg-gray-800/30 rounded-xl p-5 border border-gray-700">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <LucideBriefcase className="w-4 h-4 text-blue-400" />
              Top Companies Hiring
            </h3>
            <div className="flex flex-wrap gap-2">
              {companies.slice(0, 6).map((company, idx) => (
                <span key={idx} className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-full">
                  {typeof company === 'string' ? (company.length > 40 ? company.substring(0, 40) + '...' : company) : company.name || 'Company'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapView;