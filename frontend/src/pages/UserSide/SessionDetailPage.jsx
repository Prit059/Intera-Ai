import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import {
  FiArrowLeft, FiBookmark, FiClock, FiUsers, 
  FiBriefcase, FiHelpCircle, FiCalendar, FiCode,
  FiType, FiMessageSquare, FiStar, FiBarChart2
} from 'react-icons/fi';

const SessionDetailPage = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(API_PATHS.ADSESSION.GET_ONE(sessionId));
        
        // Handle different API response structures
        let sessionData = response.data;
        if (response.data && response.data.data) {
          sessionData = response.data.data;
          console.log(sessionData);
        } else if (response.data && response.data.session) {
          sessionData = response.data.session;
        }
        
        console.log('Fetched session data:', sessionData); // Debug log
        setSession(sessionData);
        
        // Check if session is bookmarked
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedSessions') || '[]');
        setBookmarked(bookmarks.includes(sessionId));
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to load session details');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedSessions') || '[]');
    let newBookmarks;
    
    if (bookmarked) {
      newBookmarks = bookmarks.filter(id => id !== sessionId);
    } else {
      newBookmarks = [...bookmarks, sessionId];
    }
    
    localStorage.setItem('bookmarkedSessions', JSON.stringify(newBookmarks));
    setBookmarked(!bookmarked);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-600/20 border border-green-600 text-green-100';
      case 'Medium': return 'bg-yellow-600/20 border border-yellow-700 text-yellow-100';
      case 'Hard': return 'bg-red-600/20 border border-red-700 text-red-100';
      default: return 'bg-gray-600/20 border border-gray-700 text-gray-100';
    }
  };

  const getSessionTypeColor = (type) => {
    switch (type) {
      case 'company': return 'bg-blue-700/20 border border-blue-700 text-blue-100';
      case 'general': return 'bg-purple-700/20 border border-purple-700 text-purple-100';
      default: return 'bg-gray-600/20 border border-gray-700 text-gray-100';
    }
  };

  const getAnswerTypeIcon = (type) => {
    return type === 'code' ? <FiCode className="mr-1" /> : <FiType className="mr-1" />;
  };

  // Safely access questions array
  const questions = session?.questions || [];
  const totalQuestions = questions.length;
  const easyQuestions = questions.filter(q => q.difficulty === 'Easy').length;
  const mediumQuestions = questions.filter(q => q.difficulty === 'Medium').length;
  const hardQuestions = questions.filter(q => q.difficulty === 'Hard').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <Link to="/dashboard" className="text-blue-400 hover:text-blue-300">
            <FiArrowLeft className="inline mr-2" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Session not found</div>
          <Link to="/dashboard" className="text-blue-400 hover:text-blue-300">
            <FiArrowLeft className="inline mr-2" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with Back Navigation */}
      <div className="bg-gray-900/20 border-b border-gray-700 py-4">
        <div className="mx-4 sm:mx-6 lg:mx-8">
          <Link 
            to="/userInterviewDashboard" 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors text-sm sm:text-base"
          >
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Session Header */}
        <div className="bg-gray-800/20 border border-gray-700 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white break-words">
              {session.sessionName?.toUpperCase() || 'Untitled Session'}
            </h1>
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-full self-start sm:self-auto ${bookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
            >
              <FiBookmark className={`w-5 h-5 sm:w-6 sm:h-6 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-4 sm:mb-6 break-words">
            {session.description || 'No description available.'}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
            <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getSessionTypeColor(session.sessionType)}`}>
              {session.sessionType === 'company' ? 'Company Session' : 'General Session'}
            </span>
            <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getDifficultyColor(session.difficulty)}`}>
              {session.difficulty || 'Mixed'}
            </span>
            {session.company && (
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gray-700 text-gray-200">
                <FiBriefcase className="mr-1" /> {session.company}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 text-sm sm:text-base text-gray-300">
            {session.branch && (
              <div className="flex items-center">
                <FiUsers className="mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                <span className="break-words">Branch: <span className="text-white">{session.branch}</span></span>
              </div>
            )}
            {session.role && (
              <div className="flex items-center">
                <FiBriefcase className="mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                <span className="break-words">Role: <span className="text-white">{session.role}</span></span>
              </div>
            )}
            {session.companyRole && (
              <div className="flex items-center">
                <FiStar className="mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                <span className="break-words">Company Role: <span className="text-white">{session.companyRole}</span></span>
              </div>
            )}
            {session.topic && (
              <div className="flex items-center">
                <FiBarChart2 className="mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                <span className="break-words">Topic: <span className="text-white">{session.topic}</span></span>
              </div>
            )}
            <div className="flex items-center">
              <FiHelpCircle className="mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
              <span>Questions: <span className="text-white">{totalQuestions}</span></span>
            </div>
            <div className="flex items-center">
              <FiCalendar className="mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
              <span>Created: <span className="text-white">{session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'Unknown date'}</span></span>
            </div>
          </div>
        </div>

        {totalQuestions > 0 && (
          <div className="max-w-4xl mx-auto bg-gray-800/20 border border-gray-700 rounded-lg p-4 sm:p-6 mb-6">
            <h3 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Session Statistics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-400">{totalQuestions}</div>
                <div className="text-xs sm:text-sm text-gray-400">Total Questions</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-400">{easyQuestions}</div>
                <div className="text-xs sm:text-sm text-gray-400">Easy Questions</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-yellow-400">{mediumQuestions}</div>
                <div className="text-xs sm:text-sm text-gray-400">Medium Questions</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-red-400">{hardQuestions}</div>
                <div className="text-xs sm:text-sm text-gray-400">Hard Questions</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Questions Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
            <FiHelpCircle className="mr-2 sm:mr-3 text-blue-400 flex-shrink-0" />
            Interview Questions ({totalQuestions})
          </h2>
          
          {totalQuestions === 0 ? (
            <div className="bg-gray-800/20 border border-gray-700 rounded-lg p-6 sm:p-8 text-center">
              <FiHelpCircle className="text-3xl sm:text-4xl mx-auto text-gray-500 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-white mb-2">No questions available</h3>
              <p className="text-gray-400 text-sm sm:text-base">This session doesn't contain any questions yet.</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {questions.map((question, index) => (
                <div key={index} className="bg-gray-800/20 border border-gray-700 rounded-lg p-4 sm:p-6">
                  <div className="flex items-start mb-4 sm:mb-5">
                    <div className="bg-blue-700 text-white rounded-full h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 text-xs sm:text-sm">
                      {index + 1}
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-medium text-white break-words">
                      {question.question || 'No question text'}
                    </h3>
                  </div>
                  
                  <div className="ml-0 sm:ml-9 lg:ml-12 space-y-4 sm:space-y-5">
                    {/* Answer Section */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-300 mb-3">
                        <div className="flex items-center">
                          <FiMessageSquare className="mr-2 text-blue-400 flex-shrink-0" />
                          <span className="font-medium text-sm sm:text-base">Answer:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium bg-gray-600/20 border border-gray-600 text-gray-300">
                            {getAnswerTypeIcon(question.answerType)}
                            {question.answerType === 'code' ? 'Code' : 'Text'}
                          </span>
                          <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-800/10 rounded-md p-3 sm:p-4 border border-gray-700">
                        {question.answerType === 'code' ? (
                          <pre className="whitespace-pre-wrap text-xs sm:text-sm font-mono text-gray-200 overflow-x-auto">
                            {question.answer || 'No answer provided'}
                          </pre>
                        ) : (
                          <p className="whitespace-pre-wrap text-base sm:text-lg text-gray-200 break-words">
                            {question.answer || 'No answer provided'}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Explanation (if available) */}
                    {question.explanation && (
                      <div>
                        <div className="flex items-center text-gray-300 mb-3">
                          <FiHelpCircle className="mr-2 text-purple-400 flex-shrink-0" />
                          <span className="text-base sm:text-lg md:text-xl">Explanation:</span>
                        </div>
                        <div className="bg-gray-900 rounded-md p-3 sm:p-4 border border-gray-700">
                          <p className="whitespace-pre-wrap text-gray-200 text-base sm:text-lg break-words">
                            {question.explanation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionDetailPage;