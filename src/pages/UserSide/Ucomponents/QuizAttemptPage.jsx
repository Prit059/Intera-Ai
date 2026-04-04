import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';
import { API_PATHS } from '../../../utils/apiPaths';
import {
  FiClock, FiAlertCircle, FiChevronLeft, 
  FiChevronRight, FiFlag, FiCheckCircle,
  FiEye, FiEyeOff, FiMaximize2
} from 'react-icons/fi';

const QuizAttemptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [warning, setWarning] = useState('');
  const [markedQuestions, setMarkedQuestions] = useState(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0]));
  
  const timerRef = useRef();
  const violationCheckRef = useRef();
  const quizContainerRef = useRef();
  const warningTimerRef = useRef();

  useEffect(() => {
    initializeQuiz();
    setupAntiCheat();
    
    return () => {
      cleanupQuiz();
    };
  }, [id]);

  const initializeQuiz = async () => {
    try {
      const response = await axiosInstance.get(`${API_PATHS.ADQUIZ.GET_ONE.replace(':id', id)}`);
      const quizData = response.data.data || response.data;
      setQuiz(quizData);
      setTimeLeft(quizData.duration * 60);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error initializing quiz:', error);
      navigate('/quiz-dashboard');
    }
  };

  const setupAntiCheat = () => {
    // Set up event listeners for anti-cheat
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Request fullscreen
    requestFullscreen();
    
    // Periodic violation check
    violationCheckRef.current = setInterval(() => {
      if (!document.fullscreenElement) {
        handleViolation('Fullscreen exited');
      }
    }, 2000);
  };

  const requestFullscreen = () => {
    const element = quizContainerRef.current || document.documentElement;
    const requestMethod = element.requestFullscreen || 
                         element.webkitRequestFullscreen || 
                         element.msRequestFullscreen;
    
    if (requestMethod) {
      requestMethod.call(element)
        .then(() => setFullscreen(true))
        .catch(() => {
          setFullscreen(false);
          showWarning('Fullscreen is required for this quiz. Please enable it to continue.');
        });
    } else {
      showWarning('Fullscreen is not supported by your browser. Quiz may not function properly.');
    }
  };

  const cleanupQuiz = () => {
    clearInterval(timerRef.current);
    clearInterval(violationCheckRef.current);
    clearTimeout(warningTimerRef.current);
    
    // Remove event listeners
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleWindowBlur);
    window.removeEventListener('contextmenu', handleContextMenu);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    
    // Exit fullscreen if we're in it
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const showWarning = (message) => {
    setWarning(message);
    clearTimeout(warningTimerRef.current);
    warningTimerRef.current = setTimeout(() => {
      setWarning('');
    }, 5000);
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      handleViolation('Tab switched');
    }
  };

  const handleWindowBlur = () => {
    handleViolation('Window focus lost');
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    handleViolation('Right-click attempted');
  };

  const handleKeyDown = (e) => {
    // Block copy/cut/paste/select-all/save/print/devtools combos
    if ((e.ctrlKey || e.metaKey) && 
        ["c", "x", "v", "a", "s", "p", "u", "i", "j"].includes(e.key.toLowerCase())) {
      e.preventDefault();
      handleViolation(`Keyboard shortcut attempted: ${e.key}`);
    }
    
    // Block F12, Ctrl+Shift+I, Ctrl+Shift+J
    if (e.keyCode === 123 || 
        (e.ctrlKey && e.shiftKey && ["i", "j"].includes(e.key.toLowerCase()))) {
      e.preventDefault();
      handleViolation('DevTools access attempted');
    }
  };

  const handleBeforeUnload = (e) => {
    if (!submitting) {
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  };

  const handleViolation = (reason) => {
    setViolations(prev => {
      const newViolations = prev + 1;
      const warningsLeft = 3 - newViolations;
      
      showWarning(`${reason}. Warning ${newViolations}/3. ${warningsLeft > 0 ? `${warningsLeft} warnings left before auto-submission.` : 'Submitting quiz...'}`);
      
      if (newViolations >= 3) {
        handleSubmitQuiz(true, 'Too many violations');
      }
      
      return newViolations;
    });
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleQuestionNavigate = (direction) => {
    setCurrentQuestion(prev => {
      const newIndex = direction === 'next' ? prev + 1 : prev - 1;
      const validIndex = Math.max(0, Math.min(quiz.questions.length - 1, newIndex));
      
      // Mark question as visited
      setVisitedQuestions(prev => new Set([...prev, validIndex]));
      
      return validIndex;
    });
  };

  const handleMarkForReview = () => {
    setMarkedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion);
      } else {
        newSet.add(currentQuestion);
      }
      return newSet;
    });
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestion(index);
    setVisitedQuestions(prev => new Set([...prev, index]));
  };

  const handleSubmitQuiz = async (forced = false, reason = '') => {
    if (submitting) return;
    
    setSubmitting(true);
    clearInterval(timerRef.current);
    clearInterval(violationCheckRef.current);

    try {
      const submission = {
        quizId: id,
        answers,
        timeSpent: (quiz.duration * 60) - timeLeft,
        violations,
        forced,
        reason
      };

      const response = await axiosInstance.post(API_PATHS.QUIZ_ATTEMPTS.SUBMIT, submission);
      
      navigate(`/quiz/${id}/results`, { 
        state: { 
          result: response.data,
          quizData: quiz
        } 
      });
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestionOptions = (question, questionIndex) => {
    switch (question.questionType) {
      case 'MCQ':
        return (
          <div className="space-y-3 mb-4">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-600/50 transition-colors border border-gray-600">
                <input
                  type="radio"
                  name={`question-${questionIndex}`}
                  checked={answers[questionIndex] === index.toString()}
                  onChange={() => handleAnswerSelect(questionIndex, index.toString())}
                  className="h-4 w-4 text-blue-500 focus:ring-blue-500"
                />
                <span className="flex-1">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'Multiple Response':
        return (
          <div className="space-y-3 mb-4">
            {question.options.map((option, index) => {
              const currentAnswers = answers[questionIndex] ? answers[questionIndex].split(',') : [];
              const isChecked = currentAnswers.includes(index.toString());
              
              return (
                <label key={index} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-600/50 transition-colors border border-gray-600">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      if (isChecked) {
                        const newAnswers = currentAnswers.filter(a => a !== index.toString());
                        handleAnswerSelect(questionIndex, newAnswers.join(','));
                      } else {
                        handleAnswerSelect(questionIndex, [...currentAnswers, index.toString()].join(','));
                      }
                    }}
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="flex-1">{option}</span>
                </label>
              );
            })}
          </div>
        );

      case 'True/False':
        return (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => handleAnswerSelect(questionIndex, 'true')}
              className={`p-4 rounded-lg border-2 flex items-center justify-center gap-2 ${
                answers[questionIndex] === 'true' 
                  ? 'bg-green-600/30 border-green-500 text-green-200' 
                  : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              <FiCheckCircle size={20} />
              True
            </button>
            <button
              onClick={() => handleAnswerSelect(questionIndex, 'false')}
              className={`p-4 rounded-lg border-2 flex items-center justify-center gap-2 ${
                answers[questionIndex] === 'false' 
                  ? 'bg-red-600/30 border-red-500 text-red-200' 
                  : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              <FiAlertCircle size={20} />
              False
            </button>
          </div>
        );

      case 'Text Input':
        return (
          <div className="mb-4">
            <input
              type="text"
              value={answers[questionIndex] || ''}
              onChange={(e) => handleAnswerSelect(questionIndex, e.target.value)}
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type your answer here..."
            />
          </div>
        );

      case 'Code':
        return (
          <div className="mb-4">
            <textarea
              value={answers[questionIndex] || ''}
              onChange={(e) => handleAnswerSelect(questionIndex, e.target.value)}
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="8"
              placeholder="Write your code here..."
            />
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  if (!quiz) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const totalQuestions = quiz.questions.length;
  const answeredQuestions = Object.keys(answers).length;

  return (
    <div ref={quizContainerRef} className="min-h-screen bg-black text-white">
      {/* Warning Message */}
      {warning && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white px-4 py-2 rounded-lg z-50 flex items-center gap-2">
          <FiAlertCircle />
          {warning}
        </div>
      )}

      {/* Fullscreen Requirement Overlay */}
      {!fullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-40 flex items-center justify-center p-4">
          <div className="text-center p-6 bg-gray-800 rounded-xl border border-yellow-600 max-w-md">
            <FiMaximize2 className="text-yellow-500 text-4xl mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Fullscreen Required</h2>
            <p className="text-gray-300 mb-4">This quiz must be taken in fullscreen mode to prevent cheating</p>
            <button
              onClick={requestFullscreen}
              className="bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto"
            >
              <FiMaximize2 /> Enable Fullscreen
            </button>
            <p className="text-gray-400 text-sm mt-4">
              If fullscreen doesn't activate automatically, click the button above
            </p>
          </div>
        </div>
      )}

      {/* Quiz Content - Only show when in fullscreen */}
      {fullscreen && (
        <>
          {/* Quiz Header */}
          <div className="bg-gray-800/50 border-b border-gray-700 p-4 sticky top-0 z-30 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-white">{quiz.title}</h1>
                <div className="flex items-center gap-2 text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded-full">
                  <FiAlertCircle size={16} />
                  <span className="text-sm">Violations: {violations}/3</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-red-400 bg-red-900/30 px-3 py-1 rounded-full">
                  <FiClock size={16} />
                  <span className="font-mono">{formatTime(timeLeft)}</span>
                </div>
                
                <div className="hidden md:flex items-center gap-2 text-green-400 bg-green-900/30 px-3 py-1 rounded-full">
                  {answeredQuestions > 0 ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                  <span className="text-sm">
                    {answeredQuestions}/{totalQuestions} answered
                  </span>
                </div>
                
                <button
                  onClick={() => handleSubmitQuiz()}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Questions Navigation Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 sticky top-20">
                  <h3 className="font-semibold mb-4 text-white">Questions Navigation</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {quiz.questions.map((_, index) => {
                      const isAnswered = answers[index] !== undefined;
                      const isMarked = markedQuestions.has(index);
                      const isVisited = visitedQuestions.has(index);
                      const isCurrent = currentQuestion === index;
                      
                      let bgColor = 'bg-gray-700';
                      if (isCurrent) bgColor = 'bg-blue-600';
                      else if (isAnswered) bgColor = 'bg-green-600';
                      else if (isMarked) bgColor = 'bg-orange-600';
                      else if (isVisited) bgColor = 'bg-gray-600';
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleQuestionSelect(index)}
                          className={`w-8 h-8 rounded text-sm font-medium flex items-center justify-center transition-all ${bgColor} ${
                            isCurrent ? 'ring-2 ring-blue-400' : ''
                          }`}
                          title={`Question ${index + 1}${isMarked ? ' (Marked)' : ''}${isAnswered ? ' (Answered)' : ''}`}
                        >
                          {index + 1}
                          {isMarked && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-600 rounded"></div>
                      <span className="text-gray-300">Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-600 rounded"></div>
                      <span className="text-gray-300">Current</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-600 rounded"></div>
                      <span className="text-gray-300">Marked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-600 rounded"></div>
                      <span className="text-gray-300">Visited</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-700 rounded"></div>
                      <span className="text-gray-300">Not visited</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Area */}
              <div className="lg:col-span-3">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  {/* Question Header */}
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-400">Question {currentQuestion + 1} of {totalQuestions}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">{currentQ.points} points</span>
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                        {currentQ.questionType}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        currentQ.difficulty === 'Easy' ? 'bg-green-700' : 
                        currentQ.difficulty === 'Medium' ? 'bg-yellow-700' : 'bg-red-700'
                      }`}>
                        {currentQ.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-4 text-white">{currentQ.questionText}</h2>
                    {currentQ.imageUrl && (
                      <img 
                        src={currentQ.imageUrl} 
                        alt="Question" 
                        className="max-w-full h-auto rounded-lg mb-4 border border-gray-600"
                      />
                    )}
                  </div>

                  {/* Options/Answer Area */}
                  {renderQuestionOptions(currentQ, currentQuestion)}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                    <button
                      onClick={() => handleQuestionNavigate('prev')}
                      disabled={currentQuestion === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      <FiChevronLeft /> Previous
                    </button>
                    
                    <button
                      onClick={handleMarkForReview}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        markedQuestions.has(currentQuestion)
                          ? 'bg-orange-600 hover:bg-orange-700'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      <FiFlag /> {markedQuestions.has(currentQuestion) ? 'Unmark' : 'Mark for Review'}
                    </button>
                    
                    <button
                      onClick={() => handleQuestionNavigate('next')}
                      disabled={currentQuestion === totalQuestions - 1}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      Next <FiChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuizAttemptPage;