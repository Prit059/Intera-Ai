// SessionDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdNavbar } from '../Admin/AdImport/Adimportfile';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from "../utils/apiPaths";
import { FiArrowLeft, FiUsers, FiBarChart2 } from 'react-icons/fi';

function AdQCard() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${API_PATHS.ADSESSION.GET_ALL}/${sessionId}`);
      
      if (response.data && response.data.success) {
        setSession(response.data.data);
      } else {
        setError('Session not found');
      }
    } catch (err) {
      console.error('Error fetching session details:', err);
      setError('Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-700';
      case 'Medium': return 'bg-yellow-700';
      case 'Hard': return 'bg-red-700';
      case 'Mixed': return 'bg-purple-700';
      default: return 'bg-gray-700';
    }
  };

  const getSessionTypeIcon = (type) => {
    return type === 'general' ? <FiUsers className="text-blue-400" /> : <FiBarChart2 className="text-purple-400" />;
  };

  if (loading) {
    return (
      <div className='bg-black min-h-screen text-white'>
        <AdNavbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-black min-h-screen text-white'>
        <AdNavbar />
        <div className="container mx-auto p-6">
          <button 
            onClick={() => navigate('/AdDash')}
            className="mb-6 flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </button>
          <div className="bg-red-900 p-4 rounded-lg text-center">
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className='bg-black min-h-screen text-white'>
        <AdNavbar />
        <div className="container mx-auto p-6">
          <button 
            onClick={() => navigate('/')}
            className="mb-6 flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </button>
          <div className="bg-gray-900 p-4 rounded-lg text-center">
            <p>Session not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-black min-h-screen text-white'>
      <AdNavbar />
      <div className="container mx-auto p-6">
        <button 
          onClick={() => navigate('/AdDash')}
          className="mb-6 flex items-center text-blue-400 hover:text-blue-300 transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to Dashboard
        </button>
        
        <div className="bg-gray-900 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold">{session.sessionName}</h1>
              <div className="flex items-center mt-2 gap-3">
                <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(session.difficulty)}`}>
                  {session.difficulty}
                </span>
                <span className="text-gray-400 flex items-center">
                  {getSessionTypeIcon(session.sessionType)}
                  <span className="ml-2">
                    {session.sessionType === 'general' ? 'General Q&A' : 'Company Specific'}
                  </span>
                </span>
                <span className="text-gray-400">
                  {session.questions?.length || 0} questions
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Session Details</h3>
              <div className="space-y-2">
                <p><span className="text-gray-400">Created:</span> {new Date(session.createdAt).toLocaleDateString()}</p>
                {session.sessionType === 'general' ? (
                  <>
                    <p><span className="text-gray-400">Branch:</span> {session.branch}</p>
                    <p><span className="text-gray-400">Role:</span> {session.role}</p>
                    {session.topic && <p><span className="text-gray-400">Topic:</span> {session.topic}</p>}
                  </>
                ) : (
                  <>
                    <p><span className="text-gray-400">Company:</span> {session.company}</p>
                    <p><span className="text-gray-400">Job Role:</span> {session.companyRole}</p>
                  </>
                )}
                {session.description && (
                  <p><span className="text-gray-400">Description:</span> {session.description}</p>
                )}
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Questions Preview</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {session.questions?.slice(0, 5).map((q, idx) => (
                  <div key={idx} className="bg-gray-700 p-3 rounded">
                    <p className="font-medium text-sm">{q.question}</p>
                    <div className="flex items-center mt-2">
                      <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty}
                      </span>
                      {q.tag && (
                        <span className="ml-2 bg-blue-700 px-2 py-1 rounded text-xs">
                          {q.tag}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {session.questions?.length > 5 && (
                  <p className="text-gray-400 text-sm">+{session.questions.length - 5} more questions</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdQCard;