import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';
import { API_PATHS } from '../../../utils/apiPaths';
import Navbar from '../../../components/layouts/Navbar';
import {
  FiAward, FiCheckCircle, FiXCircle, FiBarChart2,
  FiClock, FiTrendingUp, FiEye, FiDownload,
  FiBook, FiCpu, FiGlobe, FiDatabase, FiArrowLeft
} from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const QuizResultsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(location.state?.result);
  const [quiz, setQuiz] = useState(location.state?.quizData);
  const [detailedResults, setDetailedResults] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [analysisData, setAnalysisData] = useState(null);
  const certificateRef = useRef();

  useEffect(() => {
    if (!result) {
      fetchResults();
    } else {
      fetchDetailedResults();
    }
  }, [id, result]);

  const fetchResults = async () => {
    try {
      const response = await axiosInstance.get(`${API_PATHS.QUIZ_ATTEMPTS.RESULTS}/${id}`);
      setResult(response.data);

      const quizRes = await axiosInstance.get(`${API_PATHS.ADQUIZ.GET_ALL}/${id}`);
      setQuiz(quizRes.data.data || quizRes.data);

      fetchDetailedResults();
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const fetchDetailedResults = async () => {
    try {
      const response = await axiosInstance.get(`${API_PATHS.QUIZ_ATTEMPTS.DETAILED_RESULTS}/${id}`);
      setDetailedResults(response.data);
      generateAnalysisData(response.data);
    } catch (error) {
      console.error('Error fetching detailed results:', error);
    }
  };

  // Helper function to format answer display
  const formatAnswerDisplay = (question, answer) => {
    if (!answer && answer !== 0) return 'Not attempted';
    
    const answerStr = String(answer).trim();
    
    if (question.questionType === 'Multiple Response') {
      // For multiple response, show selected options
      const indices = answerStr.split(',').filter(a => a !== '');
      if (indices.length === 0) return 'Not attempted';
      
      return indices.map(idx => {
        const optionIndex = parseInt(idx);
        if (question.options && question.options[optionIndex]) {
          return question.options[optionIndex];
        }
        return `Option ${idx}`;
      }).join(', ');
    }
    
    if (question.questionType === 'MCQ' || question.questionType === 'True/False') {
      // For MCQ or True/False, show the option text
      const optionIndex = parseInt(answerStr);
      if (!isNaN(optionIndex) && question.options && question.options[optionIndex]) {
        return question.options[optionIndex];
      }
      return answerStr; // Fallback to the raw answer
    }
    
    // For text input or code questions
    return answerStr;
  };

  const generateAnalysisData = (data) => {
    if (!data || !data.questions) return;

    // Category performance analysis
    const categoryPerformance = {};
    data.questions.forEach(q => {
      const category = q.category || 'General';
      if (!categoryPerformance[category]) {
        categoryPerformance[category] = { correct: 0, total: 0 };
      }
      categoryPerformance[category].total++;
      if (q.correct) categoryPerformance[category].correct++;
    });

    // Difficulty performance analysis
    const difficultyPerformance = { 
      Easy: { correct: 0, total: 0 }, 
      Medium: { correct: 0, total: 0 }, 
      Hard: { correct: 0, total: 0 } 
    };
    
    data.questions.forEach(q => {
      const difficulty = q.difficulty || 'Medium';
      if (difficultyPerformance[difficulty]) {
        difficultyPerformance[difficulty].total++;
        if (q.correct) difficultyPerformance[difficulty].correct++;
      }
    });

    setAnalysisData({
      categoryPerformance,
      difficultyPerformance,
      recommendations: generateRecommendations(categoryPerformance, difficultyPerformance)
    });
  };

  const generateRecommendations = (categoryPerformance, difficultyPerformance) => {
    const recommendations = [];
    
    // Category-based recommendations
    Object.entries(categoryPerformance).forEach(([category, stats]) => {
      const percentage = Math.round((stats.correct / stats.total) * 100);
      if (percentage < 60) {
        recommendations.push(`Focus on ${category} concepts (${percentage}% correct)`);
      } else if (percentage > 80) {
        recommendations.push(`Excellent in ${category}! Keep up the good work`);
      }
    });

    // Difficulty-based recommendations
    Object.entries(difficultyPerformance).forEach(([difficulty, stats]) => {
      if (stats.total > 0) {
        const percentage = Math.round((stats.correct / stats.total) * 100);
        if (percentage < 50 && difficulty === 'Hard') {
          recommendations.push(`Practice more ${difficulty} difficulty questions (${percentage}% correct)`);
        }
      }
    });

    // General recommendations based on overall score
    const overallPercentage = calculatePercentage();
    if (overallPercentage < 70) {
      recommendations.push('Review fundamental concepts and try again');
    } else if (overallPercentage >= 90) {
      recommendations.push('Excellent performance! Consider more challenging quizzes');
    }

    return recommendations.slice(0, 3); // Return top 3 recommendations
  };

  const calculatePercentage = () => {
    if (!result || !quiz) return 0;
    const totalPossible = quiz.totalQuestions * (quiz.pointsPerQuestion || 1);
    return totalPossible > 0 ? Math.round((result.score / totalPossible) * 100) : 0;
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'programming': return <FiCpu className="inline mr-2" />;
      case 'web development': return <FiGlobe className="inline mr-2" />;
      case 'database': return <FiDatabase className="inline mr-2" />;
      default: return <FiBook className="inline mr-2" />;
    }
  };

  const getOptionLetter = (index) => {
    return String.fromCharCode(65 + index); // 0->A, 1->B, etc.
  };

  if (!result || !quiz) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  const percentage = calculatePercentage();
  const isPassed = percentage >= quiz.passingScore;
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          className="flex items-center gap-2 hover:underline transition cursor-pointer text-white font-bold py-2 px-4 rounded-lg mb-6"
          onClick={() => navigate('/userQuizDashboard')}
        >
          <FiArrowLeft /> Back to Dashboard
        </button>

        {/* Results Header */}
        <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isPassed ? 'bg-green-900' : 'bg-red-900'
            }`}>
              {isPassed ? (
                <FiCheckCircle className="text-green-400 text-3xl" />
              ) : (
                <FiXCircle className="text-red-400 text-3xl" />
              )}
            </div>
            
            <h1 className="text-3xl font-bold mb-2">Quiz Results</h1>
            <h2 className="text-xl text-gray-400 mb-6">{quiz.title}</h2>
            
            <div className={`text-4xl font-bold mb-2 ${getPerformanceColor(percentage)}`}>
              {percentage}%
            </div>
            
            <p className="text-gray-400 mb-6">
              {isPassed ? 'Congratulations! You passed the quiz.' : 'You did not pass the quiz. Try again!'}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md mx-auto">
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-2xl font-bold">{result.score}</div>
                <div className="text-sm text-gray-400">Score</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-2xl font-bold">{result.correctAnswers}</div>
                <div className="text-sm text-gray-400">Correct</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-2xl font-bold">{quiz.totalQuestions - result.correctAnswers}</div>
                <div className="text-sm text-gray-400">Incorrect</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-2xl font-bold">{Math.floor(result.timeSpent / 60)}m</div>
                <div className="text-sm text-gray-400">Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-900 rounded-xl p-4 mb-6 border border-gray-700">
          <div className="flex space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'summary' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <FiAward className="inline mr-2" /> Summary
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'details' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <FiEye className="inline mr-2" /> Question Details
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'analysis' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <FiBarChart2 className="inline mr-2" /> Analysis
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Summary */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-blue-400" />
                Performance Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-400">Total Questions</span>
                  <span className="font-semibold">{quiz.totalQuestions || quiz.questions?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-400">Attempted</span>
                  <span className="font-semibold">{result.attemptedQuestions}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-900 rounded-lg">
                  <span className="text-green-400">Correct Answers</span>
                  <span className="font-semibold">{result.correctAnswers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-900 rounded-lg">
                  <span className="text-red-400">Wrong Answers</span>
                  <span className="font-semibold">{(quiz.totalQuestions || quiz.questions?.length || 0) - result.correctAnswers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-400">Time Spent</span>
                  <span className="font-semibold">
                    {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-400">Violations</span>
                  <span className="font-semibold">{result.violations || 0}</span>
                </div>
              </div>
            </div>

            {/* Score Distribution */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiAward className="text-yellow-400" />
                Score Distribution
              </h3>
              
              <div className="space-y-4">
                <div className="w-full bg-gray-800 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-1000"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-center">{percentage}%</div>
                    <div className="text-sm text-gray-400 text-center">Your Score</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-center">{quiz.passingScore}%</div>
                    <div className="text-sm text-gray-400 text-center">Passing Score</div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Performance Rating</div>
                  <div className={`text-lg font-semibold ${getPerformanceColor(percentage)}`}>
                    {percentage >= 80 ? 'Excellent' : 
                     percentage >= 60 ? 'Good' : 
                     'Needs Improvement'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && detailedResults && detailedResults.questions && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FiEye className="text-green-400" />
              Question-wise Details
            </h3>
            
            <div className="space-y-6">
              {detailedResults.questions.map((qDetail, index) => {
                const userAnswerDisplay = formatAnswerDisplay(qDetail, qDetail.userAnswer);
                const correctAnswerDisplay = formatAnswerDisplay(qDetail, qDetail.correctAnswer);
                
                return (
                  <div key={index} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold">Question {index + 1}</span>
                        <span className={`px-2 py-1 rounded text-sm ${
                          qDetail.correct ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                        }`}>
                          {qDetail.correct ? 'Correct' : 'Incorrect'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          qDetail.difficulty === 'Easy' ? 'bg-green-700' : 
                          qDetail.difficulty === 'Medium' ? 'bg-yellow-700' : 'bg-red-700'
                        }`}>
                          {qDetail.difficulty}
                        </span>
                      </div>
                      <span className="text-gray-400">{qDetail.points} point{qDetail.points !== 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="font-medium mb-2">{qDetail.questionText}</p>
                      {qDetail.imageUrl && (
                        <img 
                          src={qDetail.imageUrl} 
                          alt="Question" 
                          className="max-w-xs h-auto rounded-lg mb-3"
                        />
                      )}
                    </div>
                    
                    {/* Display options for MCQ or Multiple Response */}
                    {(qDetail.questionType === 'MCQ' || qDetail.questionType === 'Multiple Response') && qDetail.options && qDetail.options.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-400 mb-2">Options:</div>
                        <div className="space-y-2">
                          {qDetail.options.map((option, optIdx) => (
                            <div key={optIdx} className={`p-2 rounded ${
                              String(qDetail.correctAnswer).split(',').includes(String(optIdx)) 
                                ? 'bg-green-900 border border-green-700' 
                                : 'bg-gray-700'
                            }`}>
                              <span className="font-medium mr-2">{getOptionLetter(optIdx)}.</span>
                              {option}
                              {String(qDetail.userAnswer).split(',').includes(String(optIdx)) && (
                                <span className="ml-2 text-blue-300">← Your choice</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-700 p-3 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Your Answer</div>
                        <div className="font-medium">
                          {userAnswerDisplay}
                        </div>
                      </div>
                      
                      <div className="bg-green-900 p-3 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Correct Answer</div>
                        <div className="font-medium">
                          {correctAnswerDisplay}
                        </div>
                      </div>
                    </div>
                    
                    {qDetail.explanation && (
                      <div className="mt-4 p-3 bg-blue-900 rounded-lg">
                        <div className="text-sm text-blue-300 mb-1">Explanation</div>
                        <p className="text-white">{qDetail.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}


        {activeTab === 'analysis' && analysisData && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FiBarChart2 className="text-purple-400" />
              Performance Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category-wise Performance */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Category Performance</h4>
                <div className="space-y-3">
                  {Object.entries(analysisData.categoryPerformance).map(([category, stats]) => {
                    const percentage = Math.round((stats.correct / stats.total) * 100);
                    return (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{getCategoryIcon(category)}{category}</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              percentage >= 80 ? 'bg-green-500' :
                              percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty-wise Performance */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Difficulty Performance</h4>
                <div className="space-y-3">
                  {Object.entries(analysisData.difficultyPerformance).map(([difficulty, stats]) => {
                    if (stats.total === 0) return null;
                    const percentage = Math.round((stats.correct / stats.total) * 100);
                    return (
                      <div key={difficulty}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{difficulty}</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              percentage >= 80 ? 'bg-green-500' :
                              percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-6 bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Recommendations</h4>
              <ul className="space-y-2 text-sm">
                {analysisData.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <FiCheckCircle className="text-green-400" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {isPassed && (
          <div className="hidden">
            <div ref={certificateRef} className="bg-black text-white p-8" style={{ width: '794px', height: '562px' }}>
              <div className="border-2 border-yellow-500 p-12 text-center flex flex-col justify-center h-full">
                <h1 className="text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>Certificate of Achievement</h1>
                <p className="text-xl mb-2" style={{ color: '#cccccc' }}>This certifies that</p>
                <h2 className="text-3xl font-bold mb-6" style={{ color: '#60A5FA' }}>[User Name]</h2>
                <p className="text-xl mb-4" style={{ color: '#cccccc' }}>has successfully completed the</p>
                <h3 className="text-2xl font-bold mb-6" style={{ color: '#ffffff' }}>{quiz.title}</h3>
                <p className="text-lg mb-2" style={{ color: '#cccccc' }}>with a score of {result.score}/{quiz.questions.length * (quiz.pointsPerQuestion || 1)}</p>
                <p className="text-lg mb-6" style={{ color: '#cccccc' }}>({percentage}%)</p>
                <div className="flex justify-between mt-12">
                  <div className="text-center">
                    <div className="border-t-2 border-white w-32 mx-auto mb-2"></div>
                    <p style={{ color: '#cccccc' }}>Date</p>
                    <p style={{ color: '#ffffff' }}>{new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="text-center">
                    <div className="border-t-2 border-white w-32 mx-auto mb-2"></div>
                    <p style={{ color: '#cccccc' }}>Quiz ID</p>
                    <p style={{ color: '#ffffff' }}>{id.substring(0, 8)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
<div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => navigate('/userQuizDashboard')}
            className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Dashboard
          </button>
          
          {!isPassed && quiz.maxAttempts > (result.attemptNumber || 1) && (
            <button
              onClick={() => navigate(`/quiz/${id}`)}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
          )}
          
          {isPassed && (
            <button
              onClick={() => {}} // Add your download function here
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <FiDownload /> Download Certificate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResultsPage;