// pages/FormulaSheetView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Navbar from '../../components/layouts/Navbar';
import { 
  FiDownload, FiClock, FiEye, FiBookOpen, FiTrendingUp, 
  FiArrowLeft, FiShare2, FiPrinter, FiTag, FiStar, 
  FiUsers, FiChevronRight, FiCheckCircle, FiCopy,
  FiFileText, FiAward, FiBarChart2
} from 'react-icons/fi';

const FormulaSheetView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [formula, setFormula] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchFormula();
  }, [slug]);

  const fetchFormula = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/formulas/${slug}`);
      setFormula(response.data.data);
    } catch (err) {
      setError('Formula sheet not found');
    } finally {
      setLoading(false);
    }
  };

const handleDownload = async () => {
  if (!slug) {
    alert('Invalid formula sheet');
    return;
  }
  
  setDownloading(true);
  
  try {
    // Using axios to handle errors properly
    const response = await axiosInstance.get(`/api/formulas/${slug}/download`, {
      responseType: 'blob'
    });
    
    // Check if response is PDF
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('pdf')) {
      // If not PDF, it's an error JSON
      const text = await response.data.text();
      const error = JSON.parse(text);
      throw new Error(error.message || 'Download failed');
    }
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${slug}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
  } catch (err) {
    console.error('Download error:', err);
    alert(err.message || 'Failed to download. Please try again.');
  } finally {
    setDownloading(false);
  }
};

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading formula sheet...</p>
        </div>
      </div>
    );
  }

  if (error || !formula) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <FiFileText className="text-6xl text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Formula Sheet Not Found</h1>
          <p className="text-gray-400 mb-6">The formula sheet you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/aptitude')} 
            className="px-6 py-2 bg-orange-600 rounded-lg text-white hover:bg-orange-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header Actions */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors"
          >
            <FiArrowLeft /> Back
          </button>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleCopyLink} 
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition-colors"
            >
              {copied ? <FiCheckCircle className="text-green-400" /> : <FiCopy />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button 
              onClick={handlePrint} 
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition-colors"
            >
              <FiPrinter /> Print
            </button>
            <button 
              onClick={handleDownload} 
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
            >
              <FiDownload /> Download PDF
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 mb-8 border border-gray-700">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {formula.category}
            </span>
            <span className={`text-xs px-3 py-1 rounded-full border ${
              formula.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
              formula.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
              'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
              {formula.difficulty}
            </span>
            {formula.subCategory && (
              <span className="text-xs px-3 py-1 rounded-full bg-gray-700 text-gray-300">
                {formula.subCategory}
              </span>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{formula.title}</h1>
          <p className="text-gray-400 text-lg mb-6 leading-relaxed">{formula.description}</p>
          
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <FiClock className="text-orange-400" />
              <span className="text-gray-400">Est. Time:</span>
              <span className="font-semibold">{formula.estimatedTime} min</span>
            </div>
            <div className="flex items-center gap-2">
              <FiEye className="text-orange-400" />
              <span className="text-gray-400">Views:</span>
              <span className="font-semibold">{formula.views?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiDownload className="text-orange-400" />
              <span className="text-gray-400">Downloads:</span>
              <span className="font-semibold">{formula.downloads?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiStar className="text-orange-400" />
              <span className="text-gray-400">Rating:</span>
              <span className="font-semibold">{formula.rating?.average || 0} / 5</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Formulas Section */}
            {formula.formulas && formula.formulas.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FiBookOpen className="text-orange-400" />
                  Key Formulas
                </h2>
                <div className="space-y-4">
                  {formula.formulas.map((f, idx) => (
                    <div key={idx} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700 hover:border-orange-500/50 transition-colors">
                      <h3 className="font-semibold text-orange-400 mb-2">{f.name}</h3>
                      <div className="bg-black/50 rounded-lg p-3 font-mono text-sm overflow-x-auto">
                        <code className="text-green-400">{f.formula}</code>
                      </div>
                      <p className="text-gray-400 text-sm mt-2">{f.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Examples Section */}
            {formula.examples && formula.examples.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FiTrendingUp className="text-orange-400" />
                  Solved Examples
                </h2>
                <div className="space-y-5">
                  {formula.examples.map((ex, idx) => (
                    <div key={idx} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-start gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <p className="text-white font-medium flex-1">{ex.question}</p>
                      </div>
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <p className="text-green-400 text-sm font-medium mb-1">Solution:</p>
                        <p className="text-gray-300 text-sm whitespace-pre-line">{ex.solution}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important Concepts */}
            {formula.concepts && formula.concepts.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FiAward className="text-orange-400" />
                  Important Concepts
                </h2>
                <ul className="space-y-2">
                  {formula.concepts.map((concept, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300">
                      <FiChevronRight className="text-orange-400 mt-1 flex-shrink-0" />
                      <span>{concept}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Reference Card */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 sticky top-24">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <FiFileText className="text-orange-400" />
                Quick Reference
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Title</span>
                  <span className="font-medium">{formula.title}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Category</span>
                  <span className="text-orange-400">{formula.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Difficulty</span>
                  <span className={formula.difficulty === 'Beginner' ? 'text-green-400' : formula.difficulty === 'Intermediate' ? 'text-yellow-400' : 'text-red-400'}>
                    {formula.difficulty}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Est. Time</span>
                  <span>{formula.estimatedTime} min</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Version</span>
                  <span>v{formula.version}</span>
                </div>
              </div>
            </div>

            {/* Tags Section */}
            {formula.tags && formula.tags.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <FiTag className="text-orange-400" />
                  Related Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {formula.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs px-3 py-1 bg-gray-800 rounded-full text-gray-300 hover:bg-orange-500/20 hover:text-orange-400 transition-colors cursor-pointer">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Download Card */}
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-6 text-center">
              <FiDownload className="text-3xl text-orange-400 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Download PDF</h3>
              <p className="text-xs text-gray-400 mb-4">Save this formula sheet for offline revision</p>
              <button
                onClick={handleDownload}
                className="w-full py-2 bg-orange-600 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
              >
                Download Now
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-xs text-gray-500">
          <p>Generated by Intera-ai • Last updated: {new Date(formula.updatedAt).toLocaleDateString()}</p>
          <p className="mt-1">For any corrections or suggestions, please contact support</p>
        </div>
      </div>
    </div>
  );
};

export default FormulaSheetView;