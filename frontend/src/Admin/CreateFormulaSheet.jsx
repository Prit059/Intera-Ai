// components/Admin/FormulaSheets/CreateFormulaSheet.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import AdNavbar from '../Admin/AdNavbar';
import { 
  FiSave, FiX, FiPlus, FiTrash2, FiArrowLeft, 
  FiUpload, FiImage, FiClock, FiTag, FiBookOpen,
  FiAlertCircle, FiZap, FiTrendingUp, FiCheckCircle,
  FiMove, FiEdit2
} from 'react-icons/fi';

const CreateFormulaSheet = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Quantitative Aptitude',
    subCategory: '',
    difficulty: 'Intermediate',
    description: '',
    tags: '',
    estimatedTime: 15,
    formulas: [],
    examples: [],
    concepts: [],
    mistakes: [],
    tips: [],
    images: [],
    metaTitle: '',
    metaDescription: ''
  });

  const categories = [
    'Quantitative Aptitude',
    'Logical Reasoning', 
    'Verbal Aptitude',
    'Data Interpretation'
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  // Image Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formDataImg = new FormData();
    formDataImg.append('image', file);
    
    setUploadingImage(true);
    try {
      const response = await axiosInstance.post('/api/formulas/upload-image', formDataImg, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newImage = {
        url: response.data.data.url,
        publicId: response.data.data.publicId,
        caption: '',
        order: formData.images.length
      };
      
      setFormData({
        ...formData,
        images: [...formData.images, newImage]
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const updateImageCaption = (index, caption) => {
    const updatedImages = [...formData.images];
    updatedImages[index].caption = caption;
    setFormData({ ...formData, images: updatedImages });
  };

  const removeImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
  };

  // Formula Handlers
  const addFormula = () => {
    setFormData({
      ...formData,
      formulas: [...formData.formulas, { name: '', formula: '', explanation: '' }]
    });
  };

  const updateFormula = (index, field, value) => {
    const updated = [...formData.formulas];
    updated[index][field] = value;
    setFormData({ ...formData, formulas: updated });
  };

  const removeFormula = (index) => {
    const updated = formData.formulas.filter((_, i) => i !== index);
    setFormData({ ...formData, formulas: updated });
  };

  // Example Handlers
  const addExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, { question: '', solution: '' }]
    });
  };

  const updateExample = (index, field, value) => {
    const updated = [...formData.examples];
    updated[index][field] = value;
    setFormData({ ...formData, examples: updated });
  };

  const removeExample = (index) => {
    const updated = formData.examples.filter((_, i) => i !== index);
    setFormData({ ...formData, examples: updated });
  };

  // List Handlers (Concepts, Mistakes, Tips)
  const addListItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const updateListItem = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const removeListItem = (field, index) => {
    const updated = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: updated });
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags,
        formulas: JSON.stringify(formData.formulas),
        examples: JSON.stringify(formData.examples),
        concepts: JSON.stringify(formData.concepts),
        mistakes: JSON.stringify(formData.mistakes),
        tips: JSON.stringify(formData.tips),
        images: JSON.stringify(formData.images)
      };
      
      const response = await axiosInstance.post('/api/formulas', payload);
      
      if (response.data.success) {
        alert('Formula sheet created successfully!');
        navigate('/admin/formula-sheets');
      }
    } catch (error) {
      console.error('Create error:', error);
      alert(error.response?.data?.message || 'Error creating formula sheet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <AdNavbar />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/formula-sheets')}
              className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors"
            >
              <FiArrowLeft /> Back
            </button>
            <h1 className="text-2xl font-bold">Create Formula Sheet</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            <FiSave /> {loading ? 'Creating...' : 'Publish Sheet'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ========== BASIC INFORMATION ========== */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiBookOpen className="text-orange-400" />
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Title *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Profit & Loss Mastery"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                  <select
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Difficulty</label>
                  <select
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  >
                    {difficulties.map(diff => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Sub Category (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                  value={formData.subCategory}
                  onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                  placeholder="e.g., Percentages, Profit & Loss, Time & Work"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of what this formula sheet covers..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-1">
                    <FiTag className="text-orange-400" /> Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="profit, loss, discount, percentage"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-1">
                    <FiClock className="text-orange-400" /> Estimated Time (minutes)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({...formData, estimatedTime: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========== IMAGES SECTION ========== */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiImage className="text-orange-400" />
              Images & Diagrams
            </h2>
            
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FiUpload /> {uploadingImage ? 'Uploading...' : 'Upload Image'}
              </label>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
            </div>
            
            {formData.images.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-400">Uploaded Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group bg-gray-800 rounded-lg overflow-hidden">
                      <img src={img.url} alt={`Formula image ${idx + 1}`} className="w-full h-32 object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="p-1.5 bg-red-500 rounded-full hover:bg-red-600"
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Image caption..."
                        className="w-full px-2 py-1.5 text-xs bg-gray-900 border-t border-gray-700 focus:outline-none focus:border-orange-500"
                        value={img.caption}
                        onChange={(e) => updateImageCaption(idx, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========== FORMULAS SECTION ========== */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FiZap className="text-orange-400" />
                Formulas
              </h2>
              <button
                type="button"
                onClick={addFormula}
                className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300"
              >
                <FiPlus /> Add Formula
              </button>
            </div>
            
            {formData.formulas.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border border-dashed border-gray-700 rounded-lg">
                Click "Add Formula" to add formulas
              </div>
            ) : (
              <div className="space-y-4">
                {formData.formulas.map((formula, idx) => (
                  <div key={idx} className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-orange-400">Formula {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeFormula(idx)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Formula Name"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm mb-2"
                      value={formula.name}
                      onChange={(e) => updateFormula(idx, 'name', e.target.value)}
                    />
                    <textarea
                      placeholder="LaTeX Formula (e.g., Profit = SP - CP)"
                      rows="2"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm mb-2 font-mono"
                      value={formula.formula}
                      onChange={(e) => updateFormula(idx, 'formula', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Explanation"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                      value={formula.explanation}
                      onChange={(e) => updateFormula(idx, 'explanation', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========== EXAMPLES SECTION ========== */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FiTrendingUp className="text-orange-400" />
                Examples
              </h2>
              <button
                type="button"
                onClick={addExample}
                className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300"
              >
                <FiPlus /> Add Example
              </button>
            </div>
            
            {formData.examples.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border border-dashed border-gray-700 rounded-lg">
                Click "Add Example" to add solved examples
              </div>
            ) : (
              <div className="space-y-4">
                {formData.examples.map((example, idx) => (
                  <div key={idx} className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-orange-400">Example {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeExample(idx)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    <textarea
                      placeholder="Question"
                      rows="2"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm mb-2"
                      value={example.question}
                      onChange={(e) => updateExample(idx, 'question', e.target.value)}
                    />
                    <textarea
                      placeholder="Solution"
                      rows="3"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                      value={example.solution}
                      onChange={(e) => updateExample(idx, 'solution', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========== IMPORTANT CONCEPTS ========== */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FiBookOpen className="text-orange-400" />
                Important Concepts
              </h2>
              <button
                type="button"
                onClick={() => addListItem('concepts')}
                className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300"
              >
                <FiPlus /> Add Concept
              </button>
            </div>
            
            {formData.concepts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border border-dashed border-gray-700 rounded-lg">
                Click "Add Concept" to add key concepts
              </div>
            ) : (
              <div className="space-y-2">
                {formData.concepts.map((concept, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Cost Price (CP): The price at which an article is purchased"
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                      value={concept}
                      onChange={(e) => updateListItem('concepts', idx, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem('concepts', idx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========== COMMON MISTAKES ========== */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FiAlertCircle className="text-orange-400" />
                Common Mistakes
              </h2>
              <button
                type="button"
                onClick={() => addListItem('mistakes')}
                className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300"
              >
                <FiPlus /> Add Mistake
              </button>
            </div>
            
            {formData.mistakes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border border-dashed border-gray-700 rounded-lg">
                Click "Add Mistake" to add common mistakes to avoid
              </div>
            ) : (
              <div className="space-y-2">
                {formData.mistakes.map((mistake, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Calculating profit/loss percentage on SP instead of CP"
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                      value={mistake}
                      onChange={(e) => updateListItem('mistakes', idx, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem('mistakes', idx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========== TIPS & SHORTCUTS ========== */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FiZap className="text-orange-400" />
                Tips & Shortcuts
              </h2>
              <button
                type="button"
                onClick={() => addListItem('tips')}
                className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300"
              >
                <FiPlus /> Add Tip
              </button>
            </div>
            
            {formData.tips.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border border-dashed border-gray-700 rounded-lg">
                Click "Add Tip" to add helpful tips
              </div>
            ) : (
              <div className="space-y-2">
                {formData.tips.map((tip, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Always calculate profit/loss percentage on Cost Price (CP)"
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                      value={tip}
                      onChange={(e) => updateListItem('tips', idx, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem('tips', idx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========== SEO SECTION ========== */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiCheckCircle className="text-orange-400" />
              SEO Settings
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Meta Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({...formData, metaTitle: e.target.value})}
                  placeholder="SEO title for search engines"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Meta Description</label>
                <textarea
                  rows="2"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({...formData, metaDescription: e.target.value})}
                  placeholder="SEO description for search engines"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/formula-sheets')}
              className="px-6 py-2 bg-gray-800 border border-gray-700 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-500/20 border border-orange-500 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <FiSave /> {loading ? 'Creating...' : 'Publish Formula Sheet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFormulaSheet;