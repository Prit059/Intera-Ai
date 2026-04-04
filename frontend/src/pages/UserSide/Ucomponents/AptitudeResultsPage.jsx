// AptitudeResultsPage.jsx - COMPLETE FIXED VERSION for both General and Teacher tests
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';
import Navbar from '../../../components/layouts/Navbar';
import {
  FiAward, FiCheckCircle, FiXCircle, FiBarChart2,
  FiClock, FiTrendingUp, FiEye, FiDownload,
  FiBook, FiArrowLeft, FiUsers, FiTarget,
  FiPieChart, FiAlertTriangle, FiThumbsUp,
  FiCalendar, FiZap, FiCoffee, FiLogIn
} from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { API_PATHS } from '../../../utils/apiPaths';

const AptitudeResultsPage = () => {
  const { id } = useParams(); // This is attempt ID
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(location.state?.result);
  const [aptitude, setAptitude] = useState(location.state?.aptitudeData);
  const [violations, setViolations] = useState(location.state?.violations || 0);
  const [detailedResults, setDetailedResults] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('summary');
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState(null);
  const [testType, setTestType] = useState(location.state?.testType || 'general');
  const certificateRef = useRef();

  useEffect(() => {
    console.log('Results Page Mounted:', { 
      id,
      testType,
      locationState: location.state 
    });
    
    // If we have data from navigation state, use it
    if (location.state?.result && location.state?.aptitudeData) {
      console.log('Using data from navigation state');
      setResult(location.state.result);
      setAptitude(location.state.aptitudeData);
      fetchDetailedResults(location.state.result._id);
      if (testType === 'general') {
        fetchLeaderboard();
      }
    } else {
      // Otherwise fetch from API
      console.log('Fetching data from API');
      fetchResults();
    }
  }, [id, location.state]);

  const fetchAptitudeDetails = async (quizId) => {
    try {
      console.log('Fetching aptitude details for:', quizId);
      
      let response;
      if (testType === 'teacher') {
        response = await axiosInstance.get(`/api/student/aptitude/joined/${quizId}`);
      } else {
        response = await axiosInstance.get(
          `${API_PATHS.ADAPTITUDE.GET_WITH_ANSWERS.replace(':id', quizId)}`
        );
      }
      
      const aptitudeData = response.data.data || response.data;
      setAptitude(aptitudeData);
      console.log('Aptitude details fetched:', aptitudeData.title);
    } catch (error) {
      console.error('Error fetching aptitude details:', error);
      setError('Failed to load test details');
    }
  };

  const fetchResults = async () => {
    try {
      console.log('Fetching results for attempt ID:', id);
      setLoading(true);
      setError(null);

      let response;
      if (testType === 'teacher') {
        response = await axiosInstance.get(`/api/student/aptitude/attempt/${id}`);
      } else {
        response = await axiosInstance.get(
          API_PATHS.ADAPTITUDE_ATTEMPTS.RESULTS.replace(':id', id)
        );
      }

      const fetchedResult = response.data.data || response.data;
      console.log('Fetched result:', fetchedResult);
      
      if (!fetchedResult) {
        throw new Error('No result data received');
      }

      setResult(fetchedResult);
      
      // Get violation count
      const violationCount = fetchedResult.violations?.length || 
                            fetchedResult.warningsCount || 
                            location.state?.violations || 
                            0;
      setViolations(violationCount);

      // Fetch detailed results and aptitude details
      if (fetchedResult._id) {
        await fetchDetailedResults(fetchedResult._id);
      }
      
      // Get test details
      const testId = fetchedResult.testId || fetchedResult.quizId;
      if (testId) {
        await fetchAptitudeDetails(testId);
      }

    } catch (error) {
      console.error('Error fetching results:', error);
      setError('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

const fetchDetailedResults = async (attemptId) => {
  if (!attemptId) {
    console.error('No attempt ID provided for detailed results');
    return;
  }
  
  try {
    console.log('Fetching detailed results for attempt:', attemptId);
    setError(null);

    let response;
    if (testType === 'teacher') {
      response = await axiosInstance.get(`/api/student/aptitude/attempt/${attemptId}`);
    } else {
      response = await axiosInstance.get(
        API_PATHS.ADAPTITUDE_ATTEMPTS.DETAILED_RESULTS.replace(':attemptId', attemptId)
      );
    }
    
    console.log('Detailed Results API Response:', response.data);
    
    const data = response.data.data || response.data;
    if (!data) {
      throw new Error('No detailed results data received');
    }

    // Format the data for teacher tests
    if (testType === 'teacher') {
      // Handle both populated and non-populated testId
      const testData = data.testId || {};
      const questionsList = Array.isArray(testData.questions) ? testData.questions : [];
      const answersList = Array.isArray(data.answers) ? data.answers : [];
      
      const formattedData = {
        ...data,
        questions: questionsList.map(q => {
          const userAnswer = answersList.find(
            a => a.questionId?.toString() === q._id?.toString()
          );
          
          return {
            ...q,
            userAnswer: userAnswer?.selectedAnswer,
            isCorrect: userAnswer?.isCorrect || false,
            timeSpent: userAnswer?.timeTaken || 0
          };
        })
      };
      setDetailedResults(formattedData);
      generateAnalysisData(formattedData);
    } else {
      setDetailedResults(data);
      generateAnalysisData(data);
    }
    
    console.log('Detailed results set successfully');
  } catch (error) {
    console.error('Error fetching detailed results:', error);
    setError('Failed to load detailed analysis');
  }
};

  const fetchLeaderboard = async () => {
    if (testType === 'teacher') {
      setLeaderboard([]);
      return;
    }
    
    try {
      const response = await axiosInstance.get(
        API_PATHS.ADAPTITUDE_ATTEMPTS.LEADERBOARD.replace(':aptitudeId', id)
      );
      const list = response.data.data || [];
      setLeaderboard(list.slice(0, 10));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
    }
  };

  // Helper functions (keep all your existing helper functions - getStudyPriority, generateLearningPath, etc.)
  const getStudyPriority = (percentage) => {
    if (percentage >= 85) return 'Mastered - Ready for Advanced';
    if (percentage >= 70) return 'Strong - Practice Occasionally';
    if (percentage >= 50) return 'Developing - Regular Practice Needed';
    return 'Critical - Immediate Focus Required';
  };

  const generateLearningPath = (categoryPerformance) => {
    const path = [];
    const sortedCategories = Object.entries(categoryPerformance)
      .sort(([, a], [, b]) => {
        const aPercentage = a.total > 0 ? (a.correct / a.total) * 100 : 0;
        const bPercentage = b.total > 0 ? (b.correct / b.total) * 100 : 0;
        return aPercentage - bPercentage;
      });

    sortedCategories.forEach(([category, stats]) => {
      const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      
      if (percentage < 70) {
        path.push({
          title: `Master ${category}`,
          description: `Build strong foundation in ${category} concepts`,
          priority: percentage < 50 ? 'high' : 'medium',
          duration: percentage < 40 ? '2-3 weeks' : '1-2 weeks',
          resources: [
            'Practice Questions',
            'Video Tutorials',
            'AI Quiz Generator',
            'Concept Cheatsheets'
          ],
          aiModule: true
        });
      }
    });

    sortedCategories.forEach(([category, stats]) => {
      const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      
      if (percentage >= 80) {
        path.push({
          title: `Advanced ${category}`,
          description: `Take your ${category} skills to expert level`,
          priority: 'low',
          duration: '1 week',
          resources: [
            'Advanced Problems',
            'Real-world Applications',
            'Competitive Challenges',
            'AI Mock Tests'
          ],
          aiModule: true
        });
      }
    });

    return path.slice(0, 4);
  };

  const getAIStudyTips = (type, performance) => {
    const tips = {
      'category': {
        low: 'Start with basic concepts and take AI-generated practice tests daily',
        medium: 'Focus on weak areas identified by AI analysis',
        high: 'Challenge yourself with advanced problems and timed tests'
      },
      'difficulty': {
        low: 'Begin with easy questions and gradually increase difficulty',
        medium: 'Mix easy and medium questions to build confidence',
        high: 'Focus on time management and complex problem-solving'
      },
      'time': {
        low: 'Practice with timed quizzes to improve speed',
        medium: 'Work on balancing accuracy and speed',
        high: 'Excellent time management - focus on maintaining consistency'
      }
    };
    
    return tips[type]?.[performance] || 'Use AI practice modules for personalized improvement';
  };

  const getNextLevelTopics = (categoryPerformance) => {
    const nextTopics = [];
    const topicProgression = {
      'Quantitative Aptitude': ['Data Interpretation', 'Advanced Mathematics'],
      'Logical Reasoning': ['Analytical Reasoning', 'Critical Thinking'],
      'Verbal Ability': ['Reading Comprehension', 'Advanced Vocabulary'],
      'Data Interpretation': ['Advanced Charts', 'Statistical Analysis'],
      'Puzzles': ['Complex Puzzles', 'Logical Games'],
      'Non-Verbal Reasoning': ['Spatial Reasoning', 'Pattern Analysis']
    };

    Object.entries(categoryPerformance).forEach(([category, stats]) => {
      const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      
      if (percentage >= 75 && topicProgression[category]) {
        topicProgression[category].forEach(nextTopic => {
          nextTopics.push({
            name: nextTopic,
            reason: `Strong in ${category} - Ready for ${nextTopic}`
          });
        });
      }
    });

    return nextTopics.slice(0, 2);
  };

  const generateWeeklyPlan = (categoryPerformance) => {
    const weakAreas = Object.entries(categoryPerformance)
      .filter(([, stats]) => {
        const percentage = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
        return percentage < 70;
      })
      .map(([category]) => category);

    const strongAreas = Object.entries(categoryPerformance)
      .filter(([, stats]) => {
        const percentage = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
        return percentage >= 70;
      })
      .map(([category]) => category);

    const plan = [
      { focus: weakAreas[0] || 'Basics', intensity: 'high', duration: '45min' },
      { focus: weakAreas[1] || strongAreas[0], intensity: 'high', duration: '45min' },
      { focus: 'Mixed Practice', intensity: 'medium', duration: '30min' },
      { focus: strongAreas[0] || 'Revision', intensity: 'low', duration: '20min' },
      { focus: weakAreas[0] || 'Practice Test', intensity: 'high', duration: '60min' },
      { focus: 'All Topics', intensity: 'medium', duration: '40min' },
      { focus: 'Review & Plan', intensity: 'low', duration: '15min' }
    ];

    return plan;
  };

const generateAnalysisData = (data) => {
  // Handle both direct questions and nested testId.questions
  const questionsList = data.questions || data.testId?.questions || [];
  
  if (!questionsList || questionsList.length === 0) {
    console.log('No questions data for analysis');
    return;
  }

  console.log('Generating analysis data for:', questionsList.length, 'questions');

  // Category Performance Analysis
  const categoryPerformance = {};
  questionsList.forEach(q => {
    const category = q.category || 'General';
    if (!categoryPerformance[category]) {
      categoryPerformance[category] = { correct: 0, total: 0 };
    }
    categoryPerformance[category].total++;
    if (q.isCorrect) {
      categoryPerformance[category].correct++;
    }
  });

  // Difficulty Performance Analysis
  const difficultyPerformance = { 
    Easy: { correct: 0, total: 0 }, 
    Medium: { correct: 0, total: 0 }, 
    Hard: { correct: 0, total: 0 },
    'Very Hard': { correct: 0, total: 0 }
  };
  
  questionsList.forEach(q => {
    const difficulty = q.difficulty || 'Medium';
    if (difficultyPerformance[difficulty]) {
      difficultyPerformance[difficulty].total++;
      if (q.isCorrect) {
        difficultyPerformance[difficulty].correct++;
      }
    }
  });

  const analysis = {
    categoryPerformance,
    difficultyPerformance,
    recommendations: generateRecommendations(categoryPerformance, difficultyPerformance, questionsList)
  };

  console.log('Analysis data generated:', analysis);
  setAnalysisData(analysis);
};

  const generateRecommendations = (categoryPerformance, difficultyPerformance, questions) => {
    const recommendations = [];
    
    Object.entries(categoryPerformance).forEach(([category, stats]) => {
      const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      if (percentage < 70) {
        recommendations.push({
          type: 'category',
          message: `Focus on ${category} concepts (${percentage}% correct)`,
          priority: percentage < 50 ? 'high' : 'medium'
        });
      } else if (percentage === 100 && stats.total >= 2) {
        recommendations.push({
          type: 'strength',
          message: `Excellent performance in ${category} (100% correct)`,
          priority: 'low'
        });
      }
    });

    Object.entries(difficultyPerformance).forEach(([difficulty, stats]) => {
      if (stats.total > 0) {
        const percentage = Math.round((stats.correct / stats.total) * 100);
        if (percentage < 60) {
          recommendations.push({
            type: 'difficulty',
            message: `Practice more ${difficulty} difficulty questions (${percentage}% correct)`,
            priority: difficulty === 'Hard' || difficulty === 'Very Hard' ? 'high' : 'medium'
          });
        }
      }
    });

    const totalTestTime = result?.timeSpent || 0;
    const aptitudeTimeLimit = (aptitude?.timeLimit || 30) * 60;
    
    if (totalTestTime < aptitudeTimeLimit * 0.3 && questions.length > 10) {
      recommendations.push({
        type: 'time',
        message: 'Consider spending more time reading questions carefully',
        priority: 'medium'
      });
    } else if (totalTestTime > aptitudeTimeLimit * 0.9) {
      recommendations.push({
        type: 'time',
        message: 'Work on improving your speed and time management',
        priority: 'medium'
      });
    }

    const accuracy = calculatePercentage();
    if (accuracy < 60) {
      recommendations.push({
        type: 'accuracy',
        message: 'Focus on improving accuracy before attempting speed',
        priority: 'high'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }).slice(0, 5);
  };

  const calculatePercentage = () => {
    if (!result || !aptitude) return 0;
    const totalMarks = result.totalMarks || (aptitude.totalMarks || aptitude.questions?.length);
    return totalMarks > 0 ? Math.round((result.score / totalMarks) * 100) : 0;
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceLabel = (percentage) => {
    if (percentage >= 90) return 'Outstanding';
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 70) return 'Good';
    if (percentage >= 60) return 'Average';
    if (percentage >= 50) return 'Below Average';
    return 'Needs Improvement';
  };

  const getCategoryIcon = (category) => {
    const categoryIcons = {
      'Quantitative Aptitude': '🧮',
      'Logical Reasoning': '🔍',
      'Verbal Ability': '📚',
      'Data Interpretation': '📊',
      'Puzzles': '🧩',
      'Non-Verbal Reasoning': '🔺',
      'Abstract Reasoning': '🎭',
      'Technical Aptitude': '💻'
    };
    return categoryIcons[category] || '📝';
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#000000'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Aptitude_Certificate_${aptitude.title.replace(/\s+/g, '_')}.pdf`);
      
    } catch (error) {
      console.error('Error generating certificate:', error);
      try {
        const canvas = await html2canvas(certificateRef.current, {
          backgroundColor: '#000000',
          scale: 2
        });
        const link = document.createElement('a');
        link.download = `Aptitude_Certificate_${aptitude.title.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } catch (fallbackError) {
        console.error('Fallback download failed:', fallbackError);
        alert('Failed to download certificate. Please try again.');
      }
    }
  };

  const formatAnswer = (answer, options, questionType) => {
    if (answer === null || answer === undefined) return 'Not attempted';
    
    if (Array.isArray(answer)) {
      return answer.map(idx => options?.[idx] || `Option ${idx + 1}`).join(', ');
    }
    
    if (typeof answer === 'number' && options) {
      return options[answer] || `Option ${String.fromCharCode(65 + answer)}`;
    }
    
    return answer.toString();
  };

  const formatTimeSpent = (seconds) => {
    if (!seconds && seconds !== 0) return 'N/A';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading results...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <FiAlertTriangle className="text-red-400 text-4xl mx-auto mb-4" />
          <div className="text-white text-xl mb-4">{error}</div>
          <button 
            onClick={() => navigate('/useraptitudedashboard')}
            className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!result || !aptitude) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Results not available</div>
          <button 
            onClick={() => navigate('/useraptitudedashboard')}
            className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const percentage = calculatePercentage();
  const isPassed = percentage >= (aptitude.scoring?.passingScore || aptitude.passingScore || 60);
  const totalQuestions = aptitude.questions?.length || 0;
  const correctAnswers = result.analysis?.totalCorrect || result.answers?.filter(a => a.isCorrect).length || 0;
  const incorrectAnswers = result.analysis?.totalWrong || (totalQuestions - correctAnswers - (result.analysis?.totalSkipped || 0));
  const skippedAnswers = result.analysis?.totalSkipped || 0;
  const submissionReason = location.state?.submissionReason;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/useraptitudedashboard')}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <FiArrowLeft />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-4">
            {testType === 'teacher' && (
              <span className="px-3 py-1 bg-purple-600/20 border border-purple-500 rounded-full text-sm flex items-center gap-1">
                <FiLogIn className="text-xs" />
                Teacher Test
              </span>
            )}
            <div className="text-right">
              <div className="text-sm text-gray-400">Test Completed</div>
              <div className="text-lg font-semibold">
                {new Date(result.completedAt || result.submittedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Results Header - Rest of your JSX remains the same */}
        <div className="bg-gradient-to-r from-gray-900 to-blue-900/30 rounded-2xl p-8 mb-8 border border-gray-700">
          {/* ... your existing results header JSX ... */}
          <div className="text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isPassed ? 'bg-green-900/50 border-4 border-green-500' : 'bg-red-900/50 border-4 border-red-500'
            }`}>
              {isPassed ? (
                <FiCheckCircle className="text-green-400 text-4xl" />
              ) : (
                <FiXCircle className="text-red-400 text-4xl" />
              )}
            </div>
            
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              {isPassed ? 'Congratulations!' : 'Test Completed'}
            </h1>
            
            <h2 className="text-2xl text-gray-300 mb-2">{aptitude.title}</h2>
            
            <div className={`text-5xl font-bold mb-4 ${getPerformanceColor(percentage)}`}>
              {percentage}%
            </div>
            
            <p className="text-xl text-gray-400 mb-6">
              {isPassed ? 'You have successfully passed the test!' : 'Keep practicing to improve your score.'}
            </p>

            {submissionReason && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-900/30 border border-yellow-600 rounded-full text-yellow-400 text-sm">
                <FiAlertTriangle />
                {submissionReason}
              </div>
            )}
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
              <div className="bg-black/30 p-4 rounded-lg border border-gray-600">
                <div className="text-2xl font-bold text-green-400">{correctAnswers}</div>
                <div className="text-sm text-gray-400">Correct</div>
              </div>
              
              <div className="bg-black/30 p-4 rounded-lg border border-gray-600">
                <div className="text-2xl font-bold text-red-400">{incorrectAnswers}</div>
                <div className="text-sm text-gray-400">Incorrect</div>
              </div>
              
              <div className="bg-black/30 p-4 rounded-lg border border-gray-600">
                <div className="text-2xl font-bold text-blue-400">
                  {Math.floor((result.timeSpent || 0) / 60)}m {(result.timeSpent || 0) % 60}s
                </div>
                <div className="text-sm text-gray-400">Time Spent</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Keep existing tabs but conditionally show leaderboard */}
        <div className="bg-gray-900/50 rounded-xl p-4 mb-8 border border-gray-700">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'summary' ? 'bg-blue-600 shadow-lg shadow-blue-500/25' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <FiAward /> Summary
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'details' ? 'bg-blue-600 shadow-lg shadow-blue-500/25' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <FiEye /> Question Details
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'analysis' ? 'bg-blue-600 shadow-lg shadow-blue-500/25' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <FiBarChart2 /> Performance Analysis
            </button>
            {testType !== 'teacher' && (
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'leaderboard' ? 'bg-blue-600 shadow-lg shadow-blue-500/25' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <FiUsers /> Leaderboard
              </button>
            )}
          </div>
        </div>

        {/* Tab Content - Your existing tab content remains the same */}
        {activeTab === 'summary' && (
          // ... your existing summary JSX ...
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Overview */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <FiTrendingUp className="text-blue-400" />
                Performance Overview
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 p-4 rounded-lg border border-green-600/30">
                    <div className="text-gray-400 text-sm">Overall Score</div>
                    <div className="text-2xl font-bold text-green-400">
                      {result.score} / {result.totalMarks}
                    </div>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg border border-blue-600/30">
                    <div className="text-gray-400 text-sm">Accuracy</div>
                    <div className="text-2xl font-bold text-blue-400">{percentage}%</div>
                  </div>
                </div>
                
                <div className="bg-black/30 p-4 rounded-lg border border-gray-600">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Performance Rating</span>
                    <span className={`font-semibold ${getPerformanceColor(percentage)}`}>
                      {getPerformanceLabel(percentage)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-green-900/20 rounded-lg">
                    <div className="text-green-400 font-bold">{correctAnswers}</div>
                    <div className="text-gray-400 text-sm">Correct</div>
                  </div>
                  <div className="p-3 bg-red-900/20 rounded-lg">
                    <div className="text-red-400 font-bold">{incorrectAnswers}</div>
                    <div className="text-gray-400 text-sm">Incorrect</div>
                  </div>
                  <div className="p-3 bg-gray-700/20 rounded-lg">
                    <div className="text-gray-300 font-bold">{skippedAnswers}</div>
                    <div className="text-gray-400 text-sm">Skipped</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Information */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <FiTarget className="text-purple-400" />
                Test Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                  <span className="text-gray-400">Test Type</span>
                  <span className="font-semibold capitalize">
                    {testType === 'teacher' ? 'Teacher Test' : `${aptitude.contestType} Practice`}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                  <span className="text-gray-400">Difficulty</span>
                  <span className={`font-semibold ${
                    aptitude.difficulty === 'Easy' ? 'text-green-400' :
                    aptitude.difficulty === 'Medium' ? 'text-yellow-400' :
                    aptitude.difficulty === 'Hard' ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {aptitude.difficulty}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                  <span className="text-gray-400">Time Spent</span>
                  <span className="font-semibold">
                    {Math.floor((result.timeSpent || 0) / 60)}m {(result.timeSpent || 0) % 60}s
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                  <span className="text-gray-400">Violations</span>
                  <span className={`font-semibold ${
                    (result.violations?.length || 0) === 0 ? 'text-green-400' : 
                    (result.violations?.length || 0) <= 2 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {(result.violations?.length) || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                  <span className="text-gray-400">Passing Score</span>
                  <span className="font-semibold">{aptitude.scoring?.passingScore || aptitude.passingScore || 60}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                  <span className="text-gray-400">Result</span>
                  <span className={`font-semibold ${isPassed ? 'text-green-400' : 'text-red-400'}`}>
                    {isPassed ? 'Passed' : 'Not Passed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && detailedResults && (
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <FiEye className="text-green-400" />
              Question-wise Analysis
            </h3>
            
            {detailedResults.questions && detailedResults.questions.length > 0 ? (
              <div className="space-y-6">
                {detailedResults.questions.map((q, index) => {
                  const isAnswered = q.userAnswer !== null && q.userAnswer !== undefined;
                  const isCorrect = q.isCorrect;
                  
                  const userAnswerDisplay = formatAnswer(q.userAnswer, q.options, q.questionType);
                  const correctAnswerDisplay = formatAnswer(q.correctAnswer, q.options, q.questionType);

                  return (
                    <div key={q._id || index} className="bg-black/30 p-6 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold">Q.{index + 1}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            q.difficulty === 'Easy' ? 'bg-green-600/20 border border-green-500 text-green-400' :
                            q.difficulty === 'Medium' ? 'bg-yellow-600/20 border border-yellow-500 text-yellow-400' :
                            q.difficulty === 'Hard' ? 'bg-orange-600/20 border border-orange-500 text-orange-400' :
                            'bg-red-600/20 border border-red-500 text-red-400'
                          }`}>
                            {q.difficulty}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {q.marks || 1} mark(s)
                          </span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          !isAnswered ? 'bg-gray-600/20 text-gray-400' :
                          isCorrect ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                        }`}>
                          {!isAnswered ? 'Not Attempted' : isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-lg font-medium mb-3">{q.questionText}</p>
                        {q.imageUrl && (
                          <img 
                            src={q.imageUrl} 
                            alt="Question" 
                            className="max-w-xs h-auto rounded-lg border border-gray-600 mb-3"
                          />
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className={`p-3 rounded-lg border-2 ${
                          !isAnswered ? 'bg-gray-900/20 border-gray-600' :
                          isCorrect ? 'bg-green-900/20 border-green-600' : 'bg-red-900/20 border-red-600'
                        }`}>
                          <div className="text-sm text-gray-400 mb-1">Your Answer</div>
                          <div className="font-medium">
                            {userAnswerDisplay}
                          </div>
                        </div>
                        
                        <div className="bg-green-900/20 p-3 rounded-lg border-2 border-green-600">
                          <div className="text-sm text-gray-400 mb-1">Correct Answer</div>
                          <div className="font-medium">
                            {correctAnswerDisplay}
                          </div>
                        </div>
                      </div>
                      
                      {q.explanation && (
                        <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-600 mb-4">
                          <div className="text-sm text-blue-300 mb-1">Explanation</div>
                          <p className="text-white">{q.explanation}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-600">
                        <div className="flex items-center gap-2">
                          <FiClock className="text-yellow-400" />
                          <span className="text-gray-300">
                            Time spent: <span className="font-semibold text-white">{formatTimeSpent(q.timeSpent)}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiAward className="text-purple-400" />
                          <span className="text-gray-300">
                            Points: <span className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                              {isCorrect ? (q.marks || 1) : 0}/{q.marks || 1}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiCoffee className="text-4xl mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">No question details available</p>
                <p className="text-gray-500 text-sm">Detailed analysis could not be loaded</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analysis' && analysisData && (
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <FiBarChart2 className="text-purple-400" />
              AI-Powered Learning Analysis
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Performance */}
              <div className="bg-black/30 p-6 rounded-lg border border-gray-600">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiPieChart className="text-blue-400" />
                  Topic Mastery Analysis
                </h4>
                <div className="space-y-4">
                  {Object.entries(analysisData.categoryPerformance).map(([category, stats]) => {
                    const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                    const masteryLevel = 
                      percentage >= 90 ? 'Expert' :
                      percentage >= 75 ? 'Proficient' :
                      percentage >= 60 ? 'Intermediate' :
                      percentage >= 40 ? 'Beginner' : 'Needs Focus';
                    
                    return (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="flex items-center gap-2">
                            <span className="text-lg">{getCategoryIcon(category)}</span>
                            <span>{category}</span>
                          </span>
                          <div className="text-right">
                            <span className={`font-semibold ${getPerformanceColor(percentage)}`}>
                              {percentage}%
                            </span>
                            <div className={`text-xs ${
                              masteryLevel === 'Expert' ? 'text-green-400' :
                              masteryLevel === 'Proficient' ? 'text-blue-400' :
                              masteryLevel === 'Intermediate' ? 'text-yellow-400' :
                              masteryLevel === 'Beginner' ? 'text-orange-400' : 'text-red-400'
                            }`}>
                              {masteryLevel}
                            </div>
                          </div>
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
                        <div className="text-xs text-gray-400 mt-1">
                          {stats.correct}/{stats.total} correct • {getStudyPriority(percentage)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI-Powered Learning Path */}
              <div className="bg-black/30 p-6 rounded-lg border border-gray-600">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiTarget className="text-green-400" />
                  Your Learning Journey
                </h4>
                <div className="space-y-4">
                  {generateLearningPath(analysisData.categoryPerformance).map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-600">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-1 ${
                        step.priority === 'high' ? 'bg-red-500' :
                        step.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium mb-1">{step.title}</div>
                        <div className="text-sm text-gray-300 mb-2">{step.description}</div>
                        <div className="flex flex-wrap gap-2">
                          {step.resources.map((resource, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs">
                              {resource}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <FiClock className="text-yellow-400" />
                          Estimated: {step.duration}
                          {step.aiModule && (
                            <span className="ml-2 px-1 bg-purple-900/30 text-purple-300 rounded">AI Powered</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Smart Recommendations */}
            <div className="mt-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-6 rounded-lg border border-purple-600">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiZap className="text-yellow-400" />
                AI-Powered Action Plan
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Immediate Focus Areas */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-yellow-400 flex items-center gap-2">
                    <FiAlertTriangle className="text-yellow-400" />
                    Immediate Focus (This Week)
                  </h5>
                  {analysisData.recommendations
                    .filter(rec => rec.priority === 'high')
                    .slice(0, 3)
                    .map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-yellow-900/20 rounded-lg">
                        <span className="text-yellow-400 mt-1">🔥</span>
                        <div>
                          <div className="font-medium">{rec.message}</div>
                          <div className="text-sm text-yellow-300">
                            {getAIStudyTips(rec.type, rec.performance)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Next Level Preparation */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-green-400 flex items-center gap-2">
                    <FiTrendingUp className="text-green-400" />
                    Next Level Preparation
                  </h5>
                  {getNextLevelTopics(analysisData.categoryPerformance).map((topic, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-green-900/20 rounded-lg">
                      <span className="text-green-400 mt-1">🚀</span>
                      <div>
                        <div className="font-medium">Advance to {topic.name}</div>
                        <div className="text-sm text-green-300">
                          {topic.reason}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Practice Schedule */}
            <div className="mt-6 bg-black/30 p-6 rounded-lg border border-gray-600">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiCalendar className="text-blue-400" />
                7-Day Practice Plan
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                {generateWeeklyPlan(analysisData.categoryPerformance).map((day, index) => (
                  <div key={index} className={`p-3 rounded-lg text-center ${
                    day.intensity === 'high' ? 'bg-red-900/30 border border-red-600' :
                    day.intensity === 'medium' ? 'bg-yellow-900/30 border border-yellow-600' :
                    'bg-green-900/30 border border-green-600'
                  }`}>
                    <div className="font-semibold text-sm">Day {index + 1}</div>
                    <div className="text-xs text-gray-300 mt-1">{day.focus}</div>
                    <div className="text-xs text-gray-400 mt-2">{day.duration}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && testType !== 'teacher' && (
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <FiUsers className="text-purple-400" />
              Top Performers
            </h3>
            
            {leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div key={entry._id} className={`flex items-center justify-between p-4 rounded-lg border ${
                    index === 0 ? 'bg-yellow-900/20 border-yellow-600' :
                    index === 1 ? 'bg-gray-700/20 border-gray-600' :
                    index === 2 ? 'bg-yellow-700/20 border-yellow-700' :
                    'bg-black/30 border-gray-600'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-yellow-700 text-white' :
                        'bg-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{entry.user?.name || 'Anonymous'}</div>
                        <div className="text-sm text-gray-400">
                          Score: {entry.score}/{entry.totalMarks}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {entry.percentage}%
                      </div>
                      <div className="text-sm text-gray-400">
                        {entry.timeSpent ? Math.floor(entry.timeSpent / 60) + 'm' : '--'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiCoffee className="text-4xl mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">No leaderboard data available yet</p>
                <p className="text-gray-500 text-sm">Be the first to set a record!</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <button
            onClick={() => navigate('/useraptitudedashboard')}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            <FiArrowLeft />
            Back to Dashboard
          </button>
          
          {!isPassed && aptitude && (
            <button
              onClick={() => navigate(`/aptitude/${aptitude._id}`)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              <FiZap />
              Try Again
            </button>
          )}
          
          {isPassed && (
            <button
              onClick={downloadCertificate}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
            >
              <FiDownload />
              Download Certificate
            </button>
          )}
        </div>

        {/* Hidden Certificate for Download */}
        {isPassed && (
          <div className="hidden">
            <div ref={certificateRef} className="bg-black text-white p-8" style={{ width: '794px', height: '562px' }}>
              <div className="border-4 border-yellow-500 p-12 text-center h-full flex flex-col justify-center">
                <h1 className="text-5xl font-bold mb-6" style={{ color: '#ffffff' }}>Certificate of Achievement</h1>
                <p className="text-2xl mb-4" style={{ color: '#cccccc' }}>This certifies that</p>
                <h2 className="text-4xl font-bold mb-8" style={{ color: '#60A5FA' }}>Test Taker</h2>
                <p className="text-2xl mb-6" style={{ color: '#cccccc' }}>has successfully completed the</p>
                <h3 className="text-3xl font-bold mb-8" style={{ color: '#ffffff' }}>{aptitude.title}</h3>
                <p className="text-xl mb-2" style={{ color: '#cccccc' }}>with a score of {result.score}/{result.totalMarks}</p>
                <p className="text-xl mb-8" style={{ color: '#cccccc' }}>({percentage}%)</p>
                <div className="flex justify-between mt-12">
                  <div className="text-center">
                    <div className="border-t-2 border-white w-40 mx-auto mb-2"></div>
                    <p style={{ color: '#cccccc' }}>Date</p>
                    <p style={{ color: '#ffffff' }}>{new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="text-center">
                    <div className="border-t-2 border-white w-40 mx-auto mb-2"></div>
                    <p style={{ color: '#cccccc' }}>Test ID</p>
                    <p style={{ color: '#ffffff' }}>{aptitude._id?.substring(0, 8).toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AptitudeResultsPage;