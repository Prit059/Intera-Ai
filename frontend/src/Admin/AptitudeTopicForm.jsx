import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiSave, FiX, FiChevronDown, FiChevronUp, FiAlertCircle } from 'react-icons/fi';

const AptitudeTopicForm = ({ topic, onSave, onCancel }) => {
const [formData, setFormData] = useState({
  title: '',
  slug: '',
  category: '',
  subCategory: '',
  description: '',
  icon: '📊',
  colorScheme: 'blue',
  
  conceptExplanation: {
    summary: '',
    detailedExplanation: '', // THIS WAS MISSING
    keyPoints: ['']
  },
  
  importantFormulas: [{
    id: Date.now(),
    formula: '',
    explanation: '', // Required
    variables: [{ 
      name: '', // Required
      description: '' // Required
    }],
    example: { 
      problem: '', // Required
      solution: '' // Required
    },
    usage: '' // Required
  }],
  
  solvedExamples: [{
    id: Date.now() + 1,
    question: '',
    solutionSteps: [''],
    explanation: '', // Required
    difficulty: 'Easy',
    timeRequired: '30 seconds', // Add default
    formulaUsed: ''
  }],
  
  practiceQuestions: [{
    id: Date.now() + 2,
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    solution: '',
    difficulty: 'Easy',
    category: '',
    hint: '',
    timeLimit: 60
  }],
  
  commonMistakes: [''],
  timeSavingTricks: [''],
  
  difficulty: 'Medium',
  estimatedPreparationTime: 120,
  prerequisiteTopics: [],
  tags: [],
  isPublished: true
});

  const [activeSection, setActiveSection] = useState('basic');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize with topic data if editing
  useEffect(() => {
    if (topic) {
      setFormData(topic);
    }
  }, [topic]);

  if (errors) {
    return (
      <div className="p-6 bg-red-900 text-white rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Error in Form</h2>
        <pre className="bg-black p-4 rounded overflow-auto">
          {errors.toString()}
        </pre>
        <button
          onClick={() => setErrors(null)}
          className="mt-4 px-4 py-2 bg-blue-600 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }
  // Validate form
const validateForm = () => {
  const newErrors = {};
  
  // Basic info validation
  if (!formData.title.trim()) newErrors.title = 'Title is required';
  if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
  if (!formData.category) newErrors.category = 'Category is required';
  if (!formData.description.trim()) newErrors.description = 'Description is required';
  if (!formData.subCategory.trim()) newErrors.subCategory = 'Sub-category is required';
  
  // Concept explanation validation
  if (!formData.conceptExplanation.summary.trim()) {
    newErrors.conceptSummary = 'Concept summary is required';
  }
  if (!formData.conceptExplanation.detailedExplanation.trim()) {
    newErrors.detailedExplanation = 'Detailed explanation is required';
  }
  
  // Check if all key points are not empty
  const emptyKeyPoints = formData.conceptExplanation.keyPoints.filter(kp => !kp.trim());
  if (emptyKeyPoints.length > 0) {
    newErrors.keyPoints = 'All key points must be filled';
  }
  
  // Formulas validation
  formData.importantFormulas.forEach((formula, index) => {
    if (!formula.formula.trim()) {
      newErrors[`formula_${index}_formula`] = `Formula ${index + 1}: Formula text is required`;
    }
    if (!formula.explanation.trim()) {
      newErrors[`formula_${index}_explanation`] = `Formula ${index + 1}: Explanation is required`;
    }
    if (!formula.usage.trim()) {
      newErrors[`formula_${index}_usage`] = `Formula ${index + 1}: Usage is required`;
    }
    
    // Check variables
    formula.variables.forEach((variable, varIndex) => {
      if (!variable.name.trim()) {
        newErrors[`formula_${index}_var${varIndex}_name`] = `Formula ${index + 1}: Variable ${varIndex + 1} name is required`;
      }
      if (!variable.description.trim()) {
        newErrors[`formula_${index}_var${varIndex}_desc`] = `Formula ${index + 1}: Variable ${varIndex + 1} description is required`;
      }
    });
    
    // Check example
    if (!formula.example.problem.trim()) {
      newErrors[`formula_${index}_problem`] = `Formula ${index + 1}: Example problem is required`;
    }
    if (!formula.example.solution.trim()) {
      newErrors[`formula_${index}_solution`] = `Formula ${index + 1}: Example solution is required`;
    }
  });
  
  // Practice questions validation
  formData.practiceQuestions.forEach((question, index) => {
    if (!question.question.trim()) {
      newErrors[`question_${index}`] = `Question ${index + 1} text is required`;
    }
    if (!question.correctAnswer) {
      newErrors[`answer_${index}`] = `Correct answer for question ${index + 1} is required`;
    }
    if (!question.solution.trim()) {
      newErrors[`solution_${index}`] = `Solution for question ${index + 1} is required`;
    }
    
    // Check if options are filled
    const emptyOptions = question.options.filter(opt => !opt.trim());
    if (emptyOptions.length > 0) {
      newErrors[`options_${index}`] = `All options for question ${index + 1} must be filled`;
    }
  });
  
  // Solved examples validation
  formData.solvedExamples.forEach((example, index) => {
    if (!example.question.trim()) {
      newErrors[`example_${index}_question`] = `Example ${index + 1} question is required`;
    }
    if (!example.explanation.trim()) {
      newErrors[`example_${index}_explanation`] = `Example ${index + 1} explanation is required`;
    }
  });
  
  return newErrors;
};

  // Handle basic input changes
  const handleBasicChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle nested object changes
  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
    // Clear error for this field
    const errorKey = `${parent}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: undefined }));
    }
  };

  // Handle array field changes
  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    if (Array.isArray(newArray[index])) {
      const nestedArray = [...newArray];
      nestedArray[index] = value;
      setFormData(prev => ({ ...prev, [field]: nestedArray }));
    } else {
      newArray[index] = { ...newArray[index], ...value };
      setFormData(prev => ({ ...prev, [field]: newArray }));
    }
    // Clear error for this field
    const errorKey = `${field}_${index}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: undefined }));
    }
  };

  // Add new item to array
  const addArrayItem = (field, template) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], { ...template, id: Date.now() + prev[field].length }]
    }));
  };

  // Remove item from array
  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  // Add new key point
  const addKeyPoint = () => {
    setFormData(prev => ({
      ...prev,
      conceptExplanation: {
        ...prev.conceptExplanation,
        keyPoints: [...prev.conceptExplanation.keyPoints, '']
      }
    }));
  };

  // Add new mistake
  const addMistake = () => {
    setFormData(prev => ({
      ...prev,
      commonMistakes: [...prev.commonMistakes, '']
    }));
  };

  // Add new trick
  const addTrick = () => {
    setFormData(prev => ({
      ...prev,
      timeSavingTricks: [...prev.timeSavingTricks, '']
    }));
  };

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Show error message
      alert(`Please fix the following errors:\n${Object.values(validationErrors).join('\n')}`);
      
      // Scroll to first error
      const firstErrorKey = Object.keys(validationErrors)[0];
      const errorElement = document.querySelector(`[data-error="${firstErrorKey}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Auto-generate slug if empty
      if (!formData.slug && formData.title) {
        formData.slug = generateSlug(formData.title);
      }
      
      // Filter out empty items
      const cleanedData = {
        ...formData,
        conceptExplanation: {
          ...formData.conceptExplanation,
          keyPoints: formData.conceptExplanation.keyPoints.filter(kp => kp.trim() !== '')
        },
        commonMistakes: formData.commonMistakes.filter(m => m.trim() !== ''),
        timeSavingTricks: formData.timeSavingTricks.filter(t => t.trim() !== ''),
        importantFormulas: formData.importantFormulas.map(formula => ({
          ...formula,
          variables: formula.variables.filter(v => v.name.trim() !== '')
        })),
        solvedExamples: formData.solvedExamples.map(example => ({
          ...example,
          solutionSteps: example.solutionSteps.filter(step => step.trim() !== '')
        }))
      };
      
      await onSave(cleanedData);
    } catch (error) {
      console.error('Error saving topic:', error);
      // Error is handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category options
  const categories = [
    'Quantitative Aptitude',
    'Logical Reasoning',
    'Verbal Ability',
    'Data Interpretation',
    'General Awareness'
  ];

  const subCategories = {
    'Quantitative Aptitude': ['Arithmetic', 'Algebra', 'Geometry', 'Trigonometry', 'Statistics'],
    'Logical Reasoning': ['Analytical', 'Deductive', 'Inductive', 'Critical Thinking'],
    'Verbal Ability': ['Grammar', 'Vocabulary', 'Comprehension', 'Error Detection']
  };

  // Color scheme options
  const colorSchemes = [
    { value: 'blue', label: 'Blue', bg: 'bg-blue-500' },
    { value: 'green', label: 'Green', bg: 'bg-green-500' },
    { value: 'purple', label: 'Purple', bg: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', bg: 'bg-orange-500' },
    { value: 'red', label: 'Red', bg: 'bg-red-500' }
  ];

  // Icon options
  const iconOptions = ['📊', '🧮', '📈', '📉', '🔢', '➕', '➖', '✖️', '➗', '📐', '📏', '🎯', '💡', '⚡'];

  // Render error message
  const renderError = (errorKey) => {
    if (errors[errorKey]) {
      return (
        <div className="mt-1 text-red-400 text-sm flex items-center">
          <FiAlertCircle className="mr-1" /> {errors[errorKey]}
        </div>
      );
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-black text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {topic ? 'Edit Topic' : 'Add New Topic'}
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-700"
            disabled={isSubmitting}
          >
            <FiX className="mr-2" /> Cancel
          </button>
          <button
            type="submit"
            className="flex items-center bg-blue-700/20 border border-blue-700 hover:bg-blue-700/50 px-4 py-2 rounded-lg disabled:bg-blue-700/50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            <FiSave className="mr-2" /> 
            {isSubmitting ? 'Saving...' : 'Save Topic'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700 pb-2">
        {['basic', 'concept', 'formulas', 'examples', 'questions', 'mistakes', 'tricks', 'settings'].map(section => (
          <button
            key={section}
            type="button"
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 rounded-lg capitalize ${
              activeSection === section
                ? 'bg-blue-700/20 border border-blue-700 text-white'
                : 'bg-gray-700/20 border border-gray-700 text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* BASIC INFORMATION */}
        {activeSection === 'basic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div data-error="title">
                <label className="block text-sm font-medium mb-2">
                  Topic Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  className={`w-full px-4 py-2 bg-gray-900 border rounded-lg ${
                    errors.title ? 'border-red-500' : 'border-gray-700'
                  }`}
                  value={formData.title}
                  onChange={(e) => {
                    handleBasicChange('title', e.target.value);
                    if (!formData.slug) {
                      handleBasicChange('slug', generateSlug(e.target.value));
                    }
                  }}
                  placeholder="e.g., Percentages"
                />
                {renderError('title')}
              </div>
              
              <div data-error="slug">
                <label className="block text-sm font-medium mb-2">
                  Slug <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  className={`w-full px-4 py-2 bg-gray-900 border rounded-lg ${
                    errors.slug ? 'border-red-500' : 'border-gray-700'
                  }`}
                  value={formData.slug}
                  onChange={(e) => handleBasicChange('slug', e.target.value)}
                  placeholder="e.g., percentages"
                />
                <p className="text-xs text-gray-400 mt-1">URL-friendly identifier</p>
                {renderError('slug')}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div data-error="category">
                <label className="block text-sm font-medium mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  className={`w-full px-4 py-2 bg-gray-900 border rounded-lg ${
                    errors.category ? 'border-red-500' : 'border-gray-700'
                  }`}
                  value={formData.category}
                  onChange={(e) => handleBasicChange('category', e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {renderError('category')}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Sub-category</label>
                <select
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
                  value={formData.subCategory}
                  onChange={(e) => handleBasicChange('subCategory', e.target.value)}
                >
                  <option value="">Select Sub-category</option>
                  {formData.category && subCategories[formData.category]?.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            <div data-error="description">
              <label className="block text-sm font-medium mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows="3"
                className={`w-full px-4 py-2 bg-gray-900 border rounded-lg ${
                  errors.description ? 'border-red-500' : 'border-gray-700'
                }`}
                value={formData.description}
                onChange={(e) => handleBasicChange('description', e.target.value)}
                placeholder="Brief description of the topic"
              />
              {renderError('description')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => handleBasicChange('icon', icon)}
                      className={`p-2 text-2xl rounded-lg ${formData.icon === icon ? 'bg-blue-700/20 border border-blue-700' : 'bg-gray-700/20 border-gray-500 hover:bg-gray-700/50'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  className="w-full mt-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
                  value={formData.icon}
                  onChange={(e) => handleBasicChange('icon', e.target.value)}
                  placeholder="Or type emoji/icon"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Color Scheme</label>
                <div className="flex flex-wrap gap-2">
                  {colorSchemes.map(scheme => (
                    <button
                      key={scheme.value}
                      type="button"
                      onClick={() => handleBasicChange('colorScheme', scheme.value)}
                      className={`flex items-center px-3 py-2 rounded-lg ${formData.colorScheme === scheme.value ? 'ring-2 ring-white' : ''} ${scheme.bg}`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white mr-2"></div>
                      {scheme.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONCEPT EXPLANATION */}
        {activeSection === 'concept' && (
          <div className="space-y-6">
            <div data-error="conceptSummary">
              <label className="block text-sm font-medium mb-2">
                Concept Summary <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows="3"
                className={`w-full px-4 py-2 bg-gray-700/20 border rounded-lg ${
                  errors.conceptSummary ? 'border-red-500' : 'border-gray-700'
                }`}
                value={formData.conceptExplanation.summary}
                onChange={(e) => handleNestedChange('conceptExplanation', 'summary', e.target.value)}
                placeholder="2-3 line summary of the concept"
              />
              {renderError('conceptSummary')}
            </div>

            <div data-error="detailedExplanation">
              <label className="block text-sm font-medium mb-2">
                Detailed Explanation <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows="6"
                className={`w-full px-4 py-2 bg-gray-700/20 border rounded-lg ${
                  errors.detailedExplanation ? 'border-red-500' : 'border-gray-700'
                }`}
                value={formData.conceptExplanation.detailedExplanation}
                onChange={(e) => handleNestedChange('conceptExplanation', 'detailedExplanation', e.target.value)}
                placeholder="Detailed explanation with examples and important points"
              />
              {renderError('detailedExplanation')}
            </div>

            <div data-error="keyPoints">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">
                  Key Points <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={addKeyPoint}
                  className="flex items-center text-sm text-blue-400 hover:text-blue-300"
                >
                  <FiPlus className="mr-1" /> Add Point
                </button>
              </div>
              
              {formData.conceptExplanation.keyPoints.map((point, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <span className="text-gray-400">{index + 1}.</span>
                  <input
                    type="text"
                    className={`flex-grow px-4 py-2 bg-gray-900 border rounded-lg ${
                      errors.keyPoints ? 'border-red-500' : 'border-gray-700'
                    }`}
                    value={point}
                    onChange={(e) => {
                      const newPoints = [...formData.conceptExplanation.keyPoints];
                      newPoints[index] = e.target.value;
                      handleNestedChange('conceptExplanation', 'keyPoints', newPoints);
                    }}
                    placeholder="Key point about the concept"
                  />
                  {formData.conceptExplanation.keyPoints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newPoints = formData.conceptExplanation.keyPoints.filter((_, i) => i !== index);
                        handleNestedChange('conceptExplanation', 'keyPoints', newPoints);
                      }}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              ))}
              {renderError('keyPoints')}
            </div>
          </div>
        )}

        {/* FORMULAS */}
        {activeSection === 'formulas' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Important Formulas</h3>
              <button
                type="button"
                onClick={() => addArrayItem('importantFormulas', {
                  id: Date.now(),
                  formula: '',
                  explanation: '',
                  variables: [{ name: '', description: '' }],
                  example: { problem: '', solution: '' },
                  usage: ''
                })}
                className="flex items-center bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
              >
                <FiPlus className="mr-2" /> Add Formula
              </button>
            </div>

            {formData.importantFormulas.map((formula, index) => (
              <div key={formula.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold">Formula #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('importantFormulas', index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                <div className="space-y-4">
                  <div data-error={`formula_${index}`}>
                    <label className="block text-sm font-medium mb-1">
                      Formula <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className={`w-full px-4 py-2 bg-gray-800 border rounded-lg font-mono ${
                        errors[`formula_${index}`] ? 'border-red-500' : 'border-gray-700'
                      }`}
                      value={formula.formula}
                      onChange={(e) => handleArrayChange('importantFormulas', index, { formula: e.target.value })}
                      placeholder="e.g., A = πr²"
                    />
                    {renderError(`formula_${index}`)}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Explanation</label>
                    <textarea
                      rows="2"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                      value={formula.explanation}
                      onChange={(e) => handleArrayChange('importantFormulas', index, { explanation: e.target.value })}
                      placeholder="Explain what this formula calculates"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Variables</label>
                    {formula.variables.map((variable, varIndex) => (
                      <div key={varIndex} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          className="w-1/3 px-3 py-1 bg-gray-800 border border-gray-700 rounded"
                          placeholder="Variable name"
                          value={variable.name}
                          onChange={(e) => {
                            const newVars = [...formula.variables];
                            newVars[varIndex] = { ...newVars[varIndex], name: e.target.value };
                            handleArrayChange('importantFormulas', index, { variables: newVars });
                          }}
                        />
                        <input
                          type="text"
                          className="w-2/3 px-3 py-1 bg-gray-800 border border-gray-700 rounded"
                          placeholder="Description"
                          value={variable.description}
                          onChange={(e) => {
                            const newVars = [...formula.variables];
                            newVars[varIndex] = { ...newVars[varIndex], description: e.target.value };
                            handleArrayChange('importantFormulas', index, { variables: newVars });
                          }}
                        />
                        {formula.variables.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newVars = formula.variables.filter((_, i) => i !== varIndex);
                              handleArrayChange('importantFormulas', index, { variables: newVars });
                            }}
                            className="px-2 text-red-400"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newVars = [...formula.variables, { name: '', description: '' }];
                        handleArrayChange('importantFormulas', index, { variables: newVars });
                      }}
                      className="text-sm text-blue-400 hover:text-blue-300 mt-2"
                    >
                      + Add Variable
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Example Problem</label>
                      <textarea
                        rows="2"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                        value={formula.example.problem}
                        onChange={(e) => handleArrayChange('importantFormulas', index, { 
                          example: { ...formula.example, problem: e.target.value }
                        })}
                        placeholder="Example problem statement"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Solution</label>
                      <textarea
                        rows="2"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                        value={formula.example.solution}
                        onChange={(e) => handleArrayChange('importantFormulas', index, { 
                          example: { ...formula.example, solution: e.target.value }
                        })}
                        placeholder="Step-by-step solution"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Usage</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                      value={formula.usage}
                      onChange={(e) => handleArrayChange('importantFormulas', index, { usage: e.target.value })}
                      placeholder="When to use this formula"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SOLVED EXAMPLES */}
        {activeSection === 'examples' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Solved Examples</h3>
              <button
                type="button"
                onClick={() => addArrayItem('solvedExamples', {
                  id: Date.now(),
                  question: '',
                  solutionSteps: [''],
                  explanation: '',
                  difficulty: 'Easy',
                  timeRequired: '',
                  formulaUsed: ''
                })}
                className="flex items-center bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
              >
                <FiPlus className="mr-2" /> Add Example
              </button>
            </div>

            {formData.solvedExamples.map((example, index) => (
              <div key={example.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold">Example #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('solvedExamples', index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Question *</label>
                    <textarea
                      required
                      rows="2"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                      value={example.question}
                      onChange={(e) => handleArrayChange('solvedExamples', index, { question: e.target.value })}
                      placeholder="Example question"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Solution Steps</label>
                    {example.solutionSteps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex gap-2 mb-2">
                        <span className="text-gray-400 mt-2">{stepIndex + 1}.</span>
                        <textarea
                          rows="1"
                          className="flex-grow px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                          value={step}
                          onChange={(e) => {
                            const newSteps = [...example.solutionSteps];
                            newSteps[stepIndex] = e.target.value;
                            handleArrayChange('solvedExamples', index, { solutionSteps: newSteps });
                          }}
                          placeholder="Step description"
                        />
                        {example.solutionSteps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newSteps = example.solutionSteps.filter((_, i) => i !== stepIndex);
                              handleArrayChange('solvedExamples', index, { solutionSteps: newSteps });
                            }}
                            className="px-2 text-red-400 mt-2"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newSteps = [...example.solutionSteps, ''];
                        handleArrayChange('solvedExamples', index, { solutionSteps: newSteps });
                      }}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      + Add Step
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Explanation</label>
                    <textarea
                      rows="2"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                      value={example.explanation}
                      onChange={(e) => handleArrayChange('solvedExamples', index, { explanation: e.target.value })}
                      placeholder="Explanation of the solution"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Difficulty</label>
                      <select
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                        value={example.difficulty}
                        onChange={(e) => handleArrayChange('solvedExamples', index, { difficulty: e.target.value })}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Time Required</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                        value={example.timeRequired}
                        onChange={(e) => handleArrayChange('solvedExamples', index, { timeRequired: e.target.value })}
                        placeholder="e.g., 30 seconds"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Formula Used</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                        value={example.formulaUsed}
                        onChange={(e) => handleArrayChange('solvedExamples', index, { formulaUsed: e.target.value })}
                        placeholder="Which formula is used"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}


        {/* PRACTICE QUESTIONS - Updated with validation */}
        {activeSection === 'questions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Practice Questions</h3>
              <button
                type="button"
                onClick={() => addArrayItem('practiceQuestions', {
                  id: Date.now(),
                  question: '',
                  options: ['', '', '', ''],
                  correctAnswer: '',
                  solution: '',
                  difficulty: 'Easy',
                  category: '',
                  hint: '',
                  timeLimit: 60
                })}
                className="flex items-center bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
              >
                <FiPlus className="mr-2" /> Add Question
              </button>
            </div>

            {formData.practiceQuestions.map((question, index) => (
              <div key={question.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold">Question #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('practiceQuestions', index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                <div className="space-y-4">
                  <div data-error={`question_${index}`}>
                    <label className="block text-sm font-medium mb-1">
                      Question <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      required
                      rows="2"
                      className={`w-full px-4 py-2 bg-gray-800 border rounded-lg ${
                        errors[`question_${index}`] ? 'border-red-500' : 'border-gray-700'
                      }`}
                      value={question.question}
                      onChange={(e) => handleArrayChange('practiceQuestions', index, { question: e.target.value })}
                      placeholder="Question text"
                    />
                    {renderError(`question_${index}`)}
                  </div>

                  <div data-error={`options_${index}`}>
                    <label className="block text-sm font-medium mb-1">
                      Options <span className="text-red-400">*</span>
                    </label>
                    {['A', 'B', 'C', 'D'].map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2 mb-2">
                        <span className="w-6 text-center">{option})</span>
                        <input
                          type="text"
                          required
                          className={`flex-grow px-4 py-2 bg-gray-800 border rounded-lg ${
                            errors[`options_${index}`] ? 'border-red-500' : 'border-gray-700'
                          }`}
                          value={question.options[optIndex]}
                          onChange={(e) => {
                            const newOptions = [...question.options];
                            newOptions[optIndex] = e.target.value;
                            handleArrayChange('practiceQuestions', index, { options: newOptions });
                          }}
                          placeholder={`Option ${option}`}
                        />
                      </div>
                    ))}
                    {renderError(`options_${index}`)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div data-error={`answer_${index}`}>
                      <label className="block text-sm font-medium mb-1">
                        Correct Answer <span className="text-red-400">*</span>
                      </label>
                      <select
                        required
                        className={`w-full px-4 py-2 bg-gray-800 border rounded-lg ${
                          errors[`answer_${index}`] ? 'border-red-500' : 'border-gray-700'
                        }`}
                        value={question.correctAnswer}
                        onChange={(e) => handleArrayChange('practiceQuestions', index, { correctAnswer: e.target.value })}
                      >
                        <option value="">Select correct option</option>
                        {question.options.map((opt, optIndex) => (
                          opt.trim() && <option key={optIndex} value={opt}>{opt}</option>
                        ))}
                      </select>
                      {renderError(`answer_${index}`)}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Difficulty</label>
                      <select
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                        value={question.difficulty}
                        onChange={(e) => handleArrayChange('practiceQuestions', index, { difficulty: e.target.value })}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div data-error={`solution_${index}`}>
                    <label className="block text-sm font-medium mb-1">
                      Solution <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      required
                      rows="3"
                      className={`w-full px-4 py-2 bg-gray-800 border rounded-lg ${
                        errors[`solution_${index}`] ? 'border-red-500' : 'border-gray-700'
                      }`}
                      value={question.solution}
                      onChange={(e) => handleArrayChange('practiceQuestions', index, { solution: e.target.value })}
                      placeholder="Detailed solution with steps"
                    />
                    {renderError(`solution_${index}`)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                        value={question.category}
                        onChange={(e) => handleArrayChange('practiceQuestions', index, { category: e.target.value })}
                        placeholder="e.g., Percentage Application"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Time Limit (seconds)</label>
                      <input
                        type="number"
                        min="10"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                        value={question.timeLimit}
                        onChange={(e) => handleArrayChange('practiceQuestions', index, { timeLimit: parseInt(e.target.value) || 60 })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Hint (Optional)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                      value={question.hint}
                      onChange={(e) => handleArrayChange('practiceQuestions', index, { hint: e.target.value })}
                      placeholder="Hint for the question"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* COMMON MISTAKES */}
        {activeSection === 'mistakes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Common Mistakes</h3>
              <button
                type="button"
                onClick={addMistake}
                className="flex items-center bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
              >
                <FiPlus className="mr-2" /> Add Mistake
              </button>
            </div>

            {formData.commonMistakes.map((mistake, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-red-400">⚠️</span>
                <input
                  type="text"
                  className="flex-grow px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
                  value={mistake}
                  onChange={(e) => {
                    const newMistakes = [...formData.commonMistakes];
                    newMistakes[index] = e.target.value;
                    handleBasicChange('commonMistakes', newMistakes);
                  }}
                  placeholder="Common mistake students make"
                />
                {formData.commonMistakes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newMistakes = formData.commonMistakes.filter((_, i) => i !== index);
                      handleBasicChange('commonMistakes', newMistakes);
                    }}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TIME-SAVING TRICKS */}
        {activeSection === 'tricks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Time-Saving Tricks</h3>
              <button
                type="button"
                onClick={addTrick}
                className="flex items-center bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
              >
                <FiPlus className="mr-2" /> Add Trick
              </button>
            </div>

            {formData.timeSavingTricks.map((trick, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-yellow-400">⚡</span>
                <input
                  type="text"
                  className="flex-grow px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
                  value={trick}
                  onChange={(e) => {
                    const newTricks = [...formData.timeSavingTricks];
                    newTricks[index] = e.target.value;
                    handleBasicChange('timeSavingTricks', newTricks);
                  }}
                  placeholder="Shortcut or time-saving trick"
                />
                {formData.timeSavingTricks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newTricks = formData.timeSavingTricks.filter((_, i) => i !== index);
                      handleBasicChange('timeSavingTricks', newTricks);
                    }}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SETTINGS */}
        {activeSection === 'settings' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty Level *</label>
                <select
                  required
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
                  value={formData.difficulty}
                  onChange={(e) => handleBasicChange('difficulty', e.target.value)}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Estimated Prep Time (minutes)</label>
                <input
                  type="number"
                  min="10"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
                  value={formData.estimatedPreparationTime}
                  onChange={(e) => handleBasicChange('estimatedPreparationTime', parseInt(e.target.value) || 120)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Prerequisite Topics</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
                value={formData.prerequisiteTopics.join(', ')}
                onChange={(e) => handleBasicChange('prerequisiteTopics', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                placeholder="Comma-separated topic slugs"
              />
              <p className="text-xs text-gray-400 mt-1">e.g., basic-arithmetic, fractions, decimals</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
                value={formData.tags.join(', ')}
                onChange={(e) => handleBasicChange('tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                placeholder="Comma-separated tags"
              />
              <p className="text-xs text-gray-400 mt-1">e.g., percentage, quantitative, aptitude</p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                className="mr-3 h-5 w-5"
                checked={formData.isPublished}
                onChange={(e) => handleBasicChange('isPublished', e.target.checked)}
              />
              <label htmlFor="isPublished" className="text-sm font-medium">
                Publish this topic (visible to users)
              </label>
            </div>
          </div>
        )}
      </div>

     {/* Form Footer */}
      <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-700/20 border border-blue-700 hover:bg-blue-700/50 rounded-lg font-medium disabled:bg-blue-700/20 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (topic ? 'Update Topic' : 'Create Topic')}
        </button>
      </div>
    </form>
  );
};

export default AptitudeTopicForm;