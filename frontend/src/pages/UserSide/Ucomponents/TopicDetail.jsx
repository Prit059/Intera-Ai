import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAptitudeTopic } from '../../../context/useAptitudeTopic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiChevronLeft, FiBook, FiClipboard, 
  FiCheckCircle, FiAlertCircle, FiDownload,
  FiEye, FiEyeOff, FiPlay, FiCode, FiTrendingUp,
  FiStar, FiHeart, FiBookmark, FiClock, FiTarget,
  FiChevronDown, FiChevronUp, FiCopy, FiShare2,
  FiThumbsUp, FiThumbsDown
} from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

const TopicDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { 
    fetchTopicBySlug, 
    loading, 
    error,
    toggleBookmark,
    rateTopic,
    userProgress,
    fetchUserProgress,
    bookmarks
  } = useAptitudeTopic();
  
  const [topic, setTopic] = useState(null);
  const [activeTab, setActiveTab] = useState('concept');
  const [showAnswers, setShowAnswers] = useState({});
  const [userRating, setUserRating] = useState(0);
  const [expandedFormula, setExpandedFormula] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(0);

  useEffect(() => {
    loadTopic();
  }, [slug]);

  useEffect(() => {
    if (topic?.averageRating) {
      setUserRating(Math.round(topic.averageRating));
    }
  }, [topic]);

  const loadTopic = async () => {
    try {
      const data = await fetchTopicBySlug(slug);
      setTopic(data);
      await fetchUserProgress();
    } catch (err) {
      console.error('Error loading topic:', err);
    }
  };

  const handleBookmark = async () => {
    try {
      await toggleBookmark(topic._id);
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const handleRateTopic = async (rating) => {
    try {
      await rateTopic(topic._id, rating);
      setUserRating(rating);
      const data = await fetchTopicBySlug(slug);
      setTopic(data);
    } catch (err) {
      console.error('Error rating topic:', err);
    }
  };

  const handleStartPractice = () => {
    navigate(`/userAptitudeDashboard`);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getProgressForTopic = () => {
    if (!userProgress || !topic) return null;
    return userProgress.topicsProgress?.find(tp => tp.topicId === topic._id);
  };

  const progress = getProgressForTopic();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Topic</h2>
          <p className="text-gray-400">{error || "Topic not found"}</p>
          <button 
            onClick={() => navigate('/aptitudeprephome')}
            className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Back to Topics
          </button>
        </div>
      </div>
    );
  }

  const getColorClass = (colorScheme) => {
    const colors = {
      blue: 'bg-blue-500/20 border-blue-500 text-blue-300',
      green: 'bg-green-500/20 border-green-500 text-green-300',
      purple: 'bg-purple-500/20 border-purple-500 text-purple-300',
      orange: 'bg-orange-500/20 border-orange-500 text-orange-300',
      red: 'bg-red-500/20 border-red-500 text-red-300'
    };
    return colors[colorScheme] || colors.blue;
  };

  const tabs = [
    { id: 'concept', label: 'Concept', icon: <FiBook size={14} /> },
    { id: 'formulas', label: 'Formulas', icon: <FiBook size={14} /> },
    { id: 'examples', label: 'Examples', icon: <FiClipboard size={14} /> },
    { id: 'questions', label: 'Practice', icon: <FiTarget size={14} /> },
    { id: 'mistakes', label: 'Mistakes', icon: <FiAlertCircle size={14} /> },
    { id: 'tricks', label: 'Tricks', icon: <FiTrendingUp size={14} /> }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ENLARGED HEADER SECTION */}
      <div className="border-b border-gray-800 bg-gradient-to-b from-gray-900/30 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {/* Top Navigation Row */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => navigate('/aptitude-preparation')}
              className="flex items-center text-gray-400 hover:text-white"
            >
              <FiChevronLeft size={18} className="mr-1" /> Back to Topics
            </button>

            {/* Practice Button - Top Right */}
            <button
              onClick={handleStartPractice}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-purple-600/70 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium"
            >
              <FiPlay size={16} />
              Start Practice Test
            </button>
          </div>

          {/* Title and Bookmark Row */}
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-2xl md:text-3xl font-bold">{topic.title}</h1>
            <button
              onClick={handleBookmark}
              className="p-2 hover:bg-gray-800/50 rounded-lg"
            >
              <FiBookmark 
                size={20}
                className={bookmarks.some(b => b._id === topic._id) 
                  ? "text-yellow-400 fill-yellow-400" 
                  : "text-gray-400"
                } 
              />
            </button>
          </div>

          {/* Description */}
          <p className="text-gray-400 mb-4 text-base">{topic.description}</p>

          {/* Stats Cards - Enlarged */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-400">{topic.totalFormulas}</div>
              <div className="text-xs text-gray-400">Formulas</div>
            </div>
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-400">{topic.totalExamples}</div>
              <div className="text-xs text-gray-400">Examples</div>
            </div>
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-yellow-400">{topic.totalQuestions}</div>
              <div className="text-xs text-gray-400">Questions</div>
            </div>
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-purple-400">{topic.estimatedPreparationTime}</div>
              <div className="text-xs text-gray-400">Minutes</div>
            </div>
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-red-400">{topic.views}</div>
              <div className="text-xs text-gray-400">Views</div>
            </div>
          </div>

          {/* Tags and Rating Row */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getColorClass(topic.colorScheme)}`}>
              {topic.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              topic.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
              topic.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
              'bg-red-500/20 text-red-300'
            }`}>
              {topic.difficulty}
            </span>
            
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => handleRateTopic(star)} className="text-base">
                    <FiStar className={star <= userRating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"} />
                  </button>
                ))}
              </div>
              <span className="text-gray-400 text-sm">
                {topic.averageRating?.toFixed(1)} ({topic.ratingCount} ratings)
              </span>
            </div>

            {/* Progress Bar */}
            {progress && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-400">Progress:</span>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${progress.accuracy}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-blue-400">{progress.accuracy.toFixed(0)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Compact */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Tabs - Compact */}
        <div className="flex flex-wrap gap-1.5 mb-5 border-b border-gray-800 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* CONCEPT TAB */}
            {activeTab === 'concept' && (
              <div className="space-y-4">
                <div className="bg-gray-800/20 border border-gray-700 rounded-lg p-5">
                  <h3 className="text-lg font-semibold mb-3">Concept Summary</h3>
                  <p className="text-gray-300 mb-4">{topic.conceptExplanation.summary}</p>
                  
                  <h4 className="text-base font-semibold mb-2">Detailed Explanation</h4>
                  <div className="text-sm prose prose-invert max-w-none">
                    <ReactMarkdown>
                      {topic.conceptExplanation.detailedExplanation}
                    </ReactMarkdown>
                  </div>
                </div>

                {topic.conceptExplanation.keyPoints?.length > 0 && (
                  <div className="bg-gray-800/20 border border-gray-700 rounded-lg p-5">
                    <h3 className="text-lg font-semibold mb-3">Key Points</h3>
                    <ul className="space-y-2">
                      {topic.conceptExplanation.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <FiCheckCircle size={16} className="text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                          <span className="text-gray-300">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* FORMULAS TAB */}
            {activeTab === 'formulas' && (
              <div className="space-y-4">
                {topic.importantFormulas?.map((formula, index) => (
                  <div key={formula._id} className="bg-gray-800/20 border border-gray-700 rounded-lg p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold">Formula {index + 1}</h3>
                      <button onClick={() => copyToClipboard(formula.formula)} className="p-1.5 hover:bg-gray-700 rounded">
                        <FiCopy size={16} className="text-gray-400" />
                      </button>
                    </div>
                    
                    <div className="font-mono text-lg bg-gray-900 px-4 py-3 rounded border border-gray-700 mb-4">
                      {formula.formula}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Explanation</h4>
                        <p className="text-gray-300 text-sm">{formula.explanation}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Example</h4>
                        <div className="bg-gray-900/50 p-3 rounded border-l-2 border-blue-500 text-sm">
                          <p className="mb-1"><strong>Problem:</strong> {formula.example.problem}</p>
                          <p><strong>Solution:</strong> {formula.example.solution}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* EXAMPLES TAB */}
            {activeTab === 'examples' && (
              <div className="space-y-4">
                {topic.solvedExamples?.map((example, index) => (
                  <div key={example._id} className="bg-gray-800/20 border border-gray-700 rounded-lg p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold">Example {index + 1}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        example.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
                        example.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {example.difficulty}
                      </span>
                    </div>

                    <div className="mb-3">
                      <h4 className="font-semibold mb-2 text-sm">Question</h4>
                      <p className="text-gray-300">{example.question}</p>
                    </div>

                    <div className="mb-3">
                      <h4 className="font-semibold mb-2 text-sm">Solution Steps</h4>
                      <div className="space-y-1.5">
                        {example.solutionSteps?.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-start">
                            <div className="bg-gray-900 text-white h-6 w-6 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 text-xs font-bold">
                              {stepIndex + 1}
                            </div>
                            <p className="text-gray-300 text-sm">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Explanation</h4>
                      <p className="text-gray-300 text-sm">{example.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PRACTICE QUESTIONS TAB */}
            {activeTab === 'questions' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Practice Questions</h3>
                  <div className="text-gray-400 text-sm">
                    {selectedQuestion + 1} of {topic.practiceQuestions?.length}
                  </div>
                </div>

                {topic.practiceQuestions?.length > 0 && (
                  <div className="bg-gray-800/20 border border-gray-700 rounded-lg p-5">
                    {/* Question Navigation */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {topic.practiceQuestions?.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedQuestion(idx)}
                          className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center ${
                            selectedQuestion === idx
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    {/* Current Question */}
                    {topic.practiceQuestions[selectedQuestion] && (
                      <div>
                        <div className="mb-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-base font-semibold">Question {selectedQuestion + 1}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              topic.practiceQuestions[selectedQuestion].difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
                              topic.practiceQuestions[selectedQuestion].difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {topic.practiceQuestions[selectedQuestion].difficulty}
                            </span>
                          </div>
                          <p className="text-gray-300">{topic.practiceQuestions[selectedQuestion].question}</p>
                        </div>

                        {/* Options */}
                        <div className="space-y-2.5 mb-5">
                          {['A', 'B', 'C', 'D'].map((option, idx) => (
                            <div
                              key={idx}
                              className="p-3 border border-gray-700 rounded-lg hover:border-blue-500/30 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center">
                                <div className="bg-gray-800 text-white h-7 w-7 rounded-full flex items-center justify-center mr-3 text-sm font-medium">
                                  {option}
                                </div>
                                <span>{topic.practiceQuestions[selectedQuestion].options[idx]}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Solution Toggle */}
                        <button
                          onClick={() => setShowAnswers({...showAnswers, [selectedQuestion]: !showAnswers[selectedQuestion]})}
                          className="flex items-center text-blue-400 hover:text-blue-300 text-sm mb-3"
                        >
                          {showAnswers[selectedQuestion] ? <FiEyeOff size={14} className="mr-1.5" /> : <FiEye size={14} className="mr-1.5" />}
                          {showAnswers[selectedQuestion] ? 'Hide Solution' : 'View Solution'}
                        </button>

                        {/* Solution */}
                        {showAnswers[selectedQuestion] && (
                          <div className="bg-gray-900/50 p-3 rounded border border-gray-600">
                            <h5 className="font-semibold mb-1 text-sm">Solution:</h5>
                            <p className="text-gray-300 text-sm">{topic.practiceQuestions[selectedQuestion].solution}</p>
                            {topic.practiceQuestions[selectedQuestion].hint && (
                              <div className="mt-2 p-2 bg-blue-900/20 rounded border border-blue-500/30 text-sm">
                                <strong>Hint:</strong> {topic.practiceQuestions[selectedQuestion].hint}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* COMMON MISTAKES TAB */}
            {activeTab === 'mistakes' && (
              <div className="space-y-3">
                {topic.commonMistakes?.map((mistake, index) => (
                  <div key={index} className="bg-gray-800/20 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-start">
                      <FiAlertCircle size={16} className="text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">{mistake}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TIME-SAVING TRICKS TAB */}
            {activeTab === 'tricks' && (
              <div className="space-y-3">
                {topic.timeSavingTricks?.map((trick, index) => (
                  <div key={index} className="bg-gray-800/20 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-start">
                      <FiTrendingUp size={16} className="text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">{trick}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TopicDetail;