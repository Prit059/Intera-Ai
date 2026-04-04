// frontend/src/pages/Roadmap/EditableRoadmapView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LucideArrowLeft,
  LucideSave,
  LucidePlus,
  LucideTrash,
  LucideClock,
  LucideYoutube,
  LucideBookOpen,
  LucideEdit3,
  LucideCheck,
  LucideX,
  LucideExternalLink
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import Navbar from '../../components/layouts/Navbar';

const EditableRoadmapView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [roadmap, setRoadmap] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Edit state
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchRoadmap();
  }, [id]);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.ROADMAP.GET_ONE(id));
      const roadmapData = response.data.roadmap;
      setRoadmap(roadmapData.roadmap || []);
      setCompanies(roadmapData.companies || []);
    } catch (error) {
      console.error('Error fetching roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      await axiosInstance.put(`/api/roadmap/update-roadmap/${id}`, {
        roadmap,
        companies
      });
      alert('Roadmap saved successfully!');
      navigate(`/roadmap-view/${id}`);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // ========== EDIT HANDLERS ==========
  const startEdit = (fieldPath, currentValue) => {
    setEditingField(fieldPath);
    setEditValue(currentValue || '');
  };

  const saveEdit = () => {
    if (!editingField) return;
    
    const { type, phaseIdx, stepIdx, subField } = editingField;
    const newRoadmap = [...roadmap];
    
    if (type === 'phase') {
      if (subField === 'title') newRoadmap[phaseIdx].title = editValue;
      if (subField === 'description') newRoadmap[phaseIdx].description = editValue;
      if (subField === 'estimatedTime') newRoadmap[phaseIdx].estimatedTime = editValue;
    }
    
    if (type === 'step') {
      if (subField === 'stepTitle') newRoadmap[phaseIdx].steps[stepIdx].stepTitle = editValue;
      if (subField === 'description') newRoadmap[phaseIdx].steps[stepIdx].description = editValue;
      if (subField === 'estimatedTime') newRoadmap[phaseIdx].steps[stepIdx].estimatedTime = editValue;
    }
    
    if (type === 'company') {
      const newCompanies = [...companies];
      newCompanies[phaseIdx] = editValue;
      setCompanies(newCompanies);
      setEditingField(null);
      return;
    }
    
    setRoadmap(newRoadmap);
    setEditingField(null);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  // ========== ADD/DELETE HANDLERS ==========
  const addPhase = () => {
    setRoadmap([...roadmap, {
      title: "New Phase",
      description: "Click to add description",
      estimatedTime: "4-6 weeks",
      steps: []
    }]);
  };

  const deletePhase = (phaseIdx) => {
    const newRoadmap = [...roadmap];
    newRoadmap.splice(phaseIdx, 1);
    setRoadmap(newRoadmap);
  };

  const addStep = (phaseIdx) => {
    const newRoadmap = [...roadmap];
    if (!newRoadmap[phaseIdx].steps) newRoadmap[phaseIdx].steps = [];
    newRoadmap[phaseIdx].steps.push({
      stepTitle: "New Topic",
      description: "Click to add description",
      estimatedTime: "2-3 weeks",
      resources: { youtube: [], coursera: [] }
    });
    setRoadmap(newRoadmap);
  };

  const deleteStep = (phaseIdx, stepIdx) => {
    const newRoadmap = [...roadmap];
    newRoadmap[phaseIdx].steps.splice(stepIdx, 1);
    setRoadmap(newRoadmap);
  };

  const addResource = (phaseIdx, stepIdx, type, url) => {
    const newRoadmap = [...roadmap];
    if (!newRoadmap[phaseIdx].steps[stepIdx].resources) {
      newRoadmap[phaseIdx].steps[stepIdx].resources = { youtube: [], coursera: [] };
    }
    newRoadmap[phaseIdx].steps[stepIdx].resources[type].push(url);
    setRoadmap(newRoadmap);
  };

  const deleteResource = (phaseIdx, stepIdx, type, resIdx) => {
    const newRoadmap = [...roadmap];
    newRoadmap[phaseIdx].steps[stepIdx].resources[type].splice(resIdx, 1);
    setRoadmap(newRoadmap);
  };

  const addCompany = () => {
    setCompanies([...companies, "New Company"]);
  };

  const deleteCompany = (idx) => {
    const newCompanies = [...companies];
    newCompanies.splice(idx, 1);
    setCompanies(newCompanies);
  };

  // Flatten steps for grid view
  const getAllSteps = () => {
    const steps = [];
    roadmap.forEach((phase, phaseIdx) => {
      if (phase.steps && phase.steps.length > 0) {
        phase.steps.forEach((step, stepIdx) => {
          steps.push({
            ...step,
            phaseTitle: phase.title,
            phaseIdx,
            stepIdx
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

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <button
            onClick={() => navigate(`/roadmap-view/${id}`)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <LucideArrowLeft className="w-5 h-5" />
            Back to View
          </button>
          
          <button
            onClick={saveChanges}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white transition-colors disabled:opacity-50"
          >
            <LucideSave className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

        {/* Edit Mode Banner */}
        <div className="mb-6 p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg text-center">
          <span className="text-sm text-blue-300">
            ✏️ Edit Mode Active - Click on any text to edit. Click Save when done.
          </span>
        </div>

        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            ✏️ Editing: {roadmap[0]?.field || 'Your'} Roadmap
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Click on any text to edit. Use + buttons to add new phases, steps, and resources.
          </p>
        </div>

        {/* Add Phase Button */}
        <button
          onClick={addPhase}
          className="mb-6 w-full py-3 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:text-blue-400 hover:border-blue-500 transition-colors flex items-center justify-center gap-2"
        >
          <LucidePlus className="w-5 h-5" />
          Add New Phase
        </button>

        {/* Phases List */}
        {roadmap.map((phase, phaseIdx) => (
          <div key={phaseIdx} className="mb-6 bg-gray-900/40 rounded-xl border border-gray-700 overflow-hidden">
            {/* Phase Header */}
            <div className="bg-gray-800/50 p-4 border-b border-gray-700">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Phase Title - Editable */}
                  {editingField?.type === 'phase' && editingField.phaseIdx === phaseIdx && editingField.subField === 'title' ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="text-xl font-bold bg-gray-700 border border-blue-500 rounded px-2 py-1 text-white"
                        autoFocus
                      />
                      <button onClick={saveEdit} className="p-1 bg-green-600 rounded"><LucideCheck className="w-4 h-4" /></button>
                      <button onClick={cancelEdit} className="p-1 bg-red-600 rounded"><LucideX className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <h2 
                      className="text-xl font-bold text-white cursor-pointer hover:text-blue-400 mb-2"
                      onClick={() => startEdit({ type: 'phase', phaseIdx, subField: 'title' }, phase.title)}
                    >
                      {phase.title || `Phase ${phaseIdx + 1}`}
                      <LucideEdit3 className="w-4 h-4 inline ml-2 text-gray-400" />
                    </h2>
                  )}
                  
                  {/* Phase Description - Editable */}
                  {editingField?.type === 'phase' && editingField.phaseIdx === phaseIdx && editingField.subField === 'description' ? (
                    <div className="flex items-start gap-2 mb-2">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="text-sm bg-gray-700 border border-blue-500 rounded px-2 py-1 text-gray-300 w-full"
                        rows={2}
                        autoFocus
                      />
                      <button onClick={saveEdit} className="p-1 bg-green-600 rounded"><LucideCheck className="w-4 h-4" /></button>
                      <button onClick={cancelEdit} className="p-1 bg-red-600 rounded"><LucideX className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <p 
                      className="text-gray-400 text-sm cursor-pointer hover:text-gray-300"
                      onClick={() => startEdit({ type: 'phase', phaseIdx, subField: 'description' }, phase.description)}
                    >
                      {phase.description || 'Click to add description'}
                      <LucideEdit3 className="w-3 h-3 inline ml-1" />
                    </p>
                  )}
                  
                  {/* Phase Time - Editable */}
                  {editingField?.type === 'phase' && editingField.phaseIdx === phaseIdx && editingField.subField === 'estimatedTime' ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="text-xs bg-gray-700 border border-blue-500 rounded px-2 py-1 text-gray-300 w-32"
                        autoFocus
                      />
                      <button onClick={saveEdit} className="p-1 bg-green-600 rounded"><LucideCheck className="w-3 h-3" /></button>
                      <button onClick={cancelEdit} className="p-1 bg-red-600 rounded"><LucideX className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <span 
                      className="text-xs text-gray-500 flex items-center gap-1 mt-2 cursor-pointer hover:text-gray-400"
                      onClick={() => startEdit({ type: 'phase', phaseIdx, subField: 'estimatedTime' }, phase.estimatedTime)}
                    >
                      <LucideClock className="w-3 h-3" />
                      {phase.estimatedTime || '4-6 weeks'}
                      <LucideEdit3 className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                
                {/* Delete Phase Button */}
                <button
                  onClick={() => deletePhase(phaseIdx)}
                  className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg text-red-400 transition-colors"
                >
                  <LucideTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Steps Grid */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold">Learning Steps</h3>
                <button
                  onClick={() => addStep(phaseIdx)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <LucidePlus className="w-3 h-3" />
                  Add Step
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {phase.steps?.map((step, stepIdx) => (
                  <div key={stepIdx} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700 relative group">
                    {/* Delete Step Button */}
                    <button
                      onClick={() => deleteStep(phaseIdx, stepIdx)}
                      className="absolute top-2 right-2 p-1 bg-red-600/20 hover:bg-red-600/40 rounded text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <LucideTrash className="w-3 h-3" />
                    </button>
                    
                    {/* Step Title - Editable */}
                    {editingField?.type === 'step' && editingField.phaseIdx === phaseIdx && editingField.stepIdx === stepIdx && editingField.subField === 'stepTitle' ? (
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-md font-semibold bg-gray-700 border border-blue-500 rounded px-2 py-1 text-white w-full"
                          autoFocus
                        />
                        <button onClick={saveEdit} className="p-1 bg-green-600 rounded"><LucideCheck className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <h4 
                        className="text-white font-semibold text-md mb-2 pr-6 cursor-pointer hover:text-blue-400"
                        onClick={() => startEdit({ type: 'step', phaseIdx, stepIdx, subField: 'stepTitle' }, step.stepTitle)}
                      >
                        {step.stepTitle}
                        <LucideEdit3 className="w-3 h-3 inline ml-1 text-gray-400" />
                      </h4>
                    )}
                    
                    {/* Step Description - Editable */}
                    {editingField?.type === 'step' && editingField.phaseIdx === phaseIdx && editingField.stepIdx === stepIdx && editingField.subField === 'description' ? (
                      <div className="flex items-start gap-2 mb-2">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-xs bg-gray-700 border border-blue-500 rounded px-2 py-1 text-gray-300 w-full"
                          rows={2}
                          autoFocus
                        />
                        <button onClick={saveEdit} className="p-1 bg-green-600 rounded"><LucideCheck className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <p 
                        className="text-gray-400 text-xs mb-2 cursor-pointer hover:text-gray-300"
                        onClick={() => startEdit({ type: 'step', phaseIdx, stepIdx, subField: 'description' }, step.description)}
                      >
                        {step.description || 'Click to add description'}
                        <LucideEdit3 className="w-2.5 h-2.5 inline ml-1" />
                      </p>
                    )}
                    
                    {/* Step Time - Editable */}
                    {editingField?.type === 'step' && editingField.phaseIdx === phaseIdx && editingField.stepIdx === stepIdx && editingField.subField === 'estimatedTime' ? (
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-xs bg-gray-700 border border-blue-500 rounded px-2 py-1 text-gray-300 w-24"
                          autoFocus
                        />
                        <button onClick={saveEdit} className="p-1 bg-green-600 rounded"><LucideCheck className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <span 
                        className="text-xs text-gray-500 flex items-center gap-1 mb-3 cursor-pointer hover:text-gray-400"
                        onClick={() => startEdit({ type: 'step', phaseIdx, stepIdx, subField: 'estimatedTime' }, step.estimatedTime)}
                      >
                        <LucideClock className="w-3 h-3" />
                        {step.estimatedTime || '2-3 weeks'}
                        <LucideEdit3 className="w-2.5 h-2.5" />
                      </span>
                    )}
                    
                    {/* Resources */}
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Resources</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const url = prompt('Enter YouTube URL:');
                              if (url) addResource(phaseIdx, stepIdx, 'youtube', url);
                            }}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            + YouTube
                          </button>
                          <button
                            onClick={() => {
                              const url = prompt('Enter Coursera/Udemy URL:');
                              if (url) addResource(phaseIdx, stepIdx, 'coursera', url);
                            }}
                            className="text-xs text-green-400 hover:text-green-300"
                          >
                            + Course
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {step.resources?.youtube?.map((url, i) => (
                          <div key={i} className="flex items-center gap-1 bg-red-600/20 rounded-full px-2 py-0.5">
                            <LucideYoutube className="w-3 h-3 text-red-400" />
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-red-400 hover:underline truncate max-w-[100px]">
                              Video {i + 1}
                            </a>
                            <button onClick={() => deleteResource(phaseIdx, stepIdx, 'youtube', i)} className="text-red-400 hover:text-red-300">
                              <LucideX className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {step.resources?.coursera?.map((url, i) => (
                          <div key={i} className="flex items-center gap-1 bg-green-600/20 rounded-full px-2 py-0.5">
                            <LucideBookOpen className="w-3 h-3 text-green-400" />
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-400 hover:underline truncate max-w-[100px]">
                              Course {i + 1}
                            </a>
                            <button onClick={() => deleteResource(phaseIdx, stepIdx, 'coursera', i)} className="text-green-400 hover:text-green-300">
                              <LucideX className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {(!phase.steps || phase.steps.length === 0) && (
                <p className="text-gray-500 text-sm text-center py-4">No steps yet. Click "Add Step" to create one.</p>
              )}
            </div>
          </div>
        ))}

        {/* Companies Section */}
        <div className="mt-8 bg-gray-900/40 rounded-xl border border-gray-700 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold">Top Companies Hiring</h3>
            <button onClick={addCompany} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <LucidePlus className="w-3 h-3" />
              Add Company
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {companies.map((company, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-gray-800 rounded-full px-3 py-1 group">
                {editingField?.type === 'company' && editingField.idx === idx ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="text-xs bg-gray-700 border border-blue-500 rounded px-2 py-0.5 text-white"
                      autoFocus
                    />
                    <button onClick={saveEdit} className="text-green-400"><LucideCheck className="w-3 h-3" /></button>
                    <button onClick={cancelEdit} className="text-red-400"><LucideX className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <>
                    <span 
                      className="text-xs text-gray-300 cursor-pointer hover:text-white"
                      onClick={() => startEdit({ type: 'company', idx }, company)}
                    >
                      {typeof company === 'string' ? company : company.name}
                    </span>
                    <button onClick={() => deleteCompany(idx)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <LucideTrash className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {roadmap.length === 0 && (
          <div className="text-center py-12 bg-gray-800/20 rounded-xl">
            <p className="text-gray-400">No roadmap phases available.</p>
            <button onClick={addPhase} className="mt-4 px-4 py-2 bg-blue-600 rounded-lg">
              Create First Phase
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableRoadmapView;