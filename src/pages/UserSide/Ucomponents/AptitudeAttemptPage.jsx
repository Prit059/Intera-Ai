import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';
import {
  FiClock, FiAlertTriangle, FiChevronLeft, FiChevronRight,
  FiFlag, FiCheckCircle, FiMaximize2, FiX, FiSave, FiRefreshCw,
  FiShield, FiMonitor, FiEye, FiEyeOff, FiAlertCircle,
  FiList, FiInfo
} from 'react-icons/fi';
import { API_PATHS } from '../../../utils/apiPaths';

// Local storage keys for recovery
const STORAGE_KEYS = {
  ATTEMPT: 'aptitude_attempt_',
  ANSWERS: 'aptitude_answers_',
  LAST_ACTIVE: 'aptitude_last_active_',
  PENDING_SUBMIT: 'aptitude_pending_',
  VIOLATIONS: 'aptitude_violations_'
};

// Security configuration
const SECURITY_CONFIG = {
  VIOLATION_DEBOUNCE_MS: 5000,
  AUTO_SAVE_INTERVAL: 30000,
  RECOVERY_TIME_LIMIT: 30 * 60 * 1000,
  WARNING_DURATION: 3000,
  FULLSCREEN_REQUIRED_TYPES: ['friday', 'general']
};

const AptitudeAttemptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [aptitude, setAptitude] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Violation history
  const [violationHistory, setViolationHistory] = useState([]);
  const [showViolationHistory, setShowViolationHistory] = useState(false);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFullscreenAlert, setShowFullscreenAlert] = useState(false);
  const [isTestActive, setIsTestActive] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('online');
  const [showConnectionAlert, setShowConnectionAlert] = useState(false);

  // Refs
  const fullscreenRef = useRef(null);
  const violationDebounceRef = useRef({});
  const screenSizeRef = useRef({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const autoSaveTimerRef = useRef(null);
  const warningTimerRef = useRef(null);

  // Check for recovery on mount
  useEffect(() => {
    checkRecovery();
    
    // Monitor connection status
    const handleOnline = () => {
      setConnectionStatus('online');
      setShowConnectionAlert(false);
      syncPendingAnswers();
    };
    
    const handleOffline = () => {
      setConnectionStatus('offline');
      setShowConnectionAlert(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkRecovery = async () => {
    const storedAttempt = localStorage.getItem(STORAGE_KEYS.ATTEMPT + id);
    const storedAnswers = localStorage.getItem(STORAGE_KEYS.ANSWERS + id);
    const storedViolations = localStorage.getItem(STORAGE_KEYS.VIOLATIONS + id);
    const lastActive = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE + id);
    
    if (storedAttempt && storedAnswers && lastActive) {
      const timeDiff = Date.now() - parseInt(lastActive);
      if (timeDiff < SECURITY_CONFIG.RECOVERY_TIME_LIMIT) {
        const recover = window.confirm(
          'We found an interrupted test session. Would you like to continue where you left off?'
        );
        if (recover) {
          await handleRecovery(storedAttempt, storedAnswers, storedViolations);
        } else {
          cleanupRecoveryData();
          initializeNewAttempt();
        }
      } else {
        cleanupRecoveryData();
        initializeNewAttempt();
      }
    } else {
      initializeNewAttempt();
    }
  };

  const handleRecovery = async (storedAttempt, storedAnswers, storedViolations) => {
    setRecoveryMode(true);
    const parsedAttempt = JSON.parse(storedAttempt);
    const parsedAnswers = JSON.parse(storedAnswers);
    
    setAttemptId(parsedAttempt.attemptId);
    setUserAnswers(parsedAnswers);
    setTimeLeft(parsedAttempt.timeLeft || parsedAttempt.duration * 60);
    
    if (storedViolations) {
      setViolationHistory(JSON.parse(storedViolations));
    }
    
    try {
      await axiosInstance.post(API_PATHS.ADAPTITUDE_ATTEMPTS.RESUME, {
        attemptId: parsedAttempt.attemptId,
        resumeTime: new Date().toISOString()
      });
      
      syncPendingAnswers(parsedAttempt.attemptId);
      
    } catch (error) {
      console.error('Failed to resume test:', error);
    }
    
    setLoading(false);
  };

  const initializeNewAttempt = () => {
    fetchTestData();
  };

  const syncPendingAnswers = async (attemptIdToUse = attemptId) => {
    const pendingAnswers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANSWERS + id + '_pending') || '[]');
    if (pendingAnswers.length > 0 && navigator.onLine) {
      for (const answer of pendingAnswers) {
        try {
          await axiosInstance.post(API_PATHS.ADAPTITUDE_ATTEMPTS.SUBMIT_ANSWER, {
            attemptId: attemptIdToUse,
            questionId: answer.questionId,
            selectedAnswer: answer.answerIndex,
            timestamp: answer.timestamp
          });
        } catch (error) {
          console.error('Failed to sync pending answer:', error);
        }
      }
      localStorage.removeItem(STORAGE_KEYS.ANSWERS + id + '_pending');
    }
  };

  const checkForExistingAttempt = async () => {
    try {
      console.log('🔍 Checking for existing active attempt...');
      
      const response = await axiosInstance.get(
        `/api/AdAptitude/attempt/active/${id}`
      );
      
      if (response.data.success && response.data.data) {
        const existingAttempt = response.data.data;
        
        console.log('✅ Found existing attempt:', existingAttempt._id);
        
        const resume = window.confirm(
          'We found an incomplete test from a previous session. Would you like to resume it?'
        );
        
        if (resume) {
          await resumeExistingAttempt(existingAttempt._id);
          return true;
        }
      }
      return false;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('ℹ️ No existing attempt found');
      } else {
        console.error('Error checking for existing attempt:', error);
      }
      return false;
    }
  };

  const resumeExistingAttempt = async (attemptId) => {
    try {
      console.log('🔄 Resuming attempt:', attemptId);
      
      const response = await axiosInstance.post('/api/AdAptitude/attempt/resume', {
        attemptId,
        deviceInfo: {
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
      
      if (response.data.success) {
        const attemptData = response.data.data;
        
        setAttemptId(attemptData._id);
        
        const answersObj = {};
        attemptData.answers.forEach(ans => {
          answersObj[ans.questionId] = ans.selectedAnswer;
        });
        setUserAnswers(answersObj);
        
        const quiz = attemptData.quizId;
        const elapsedSeconds = Math.floor((Date.now() - new Date(attemptData.startedAt)) / 1000);
        const totalSeconds = quiz.timeLimit * 60;
        const remaining = Math.max(0, totalSeconds - elapsedSeconds);
        setTimeLeft(remaining);
        
        console.log('✅ Successfully resumed attempt');
        alert('Test resumed successfully! You can continue from where you left off.');
        
        return true;
      }
    } catch (error) {
      console.error('Error resuming attempt:', error);
      alert('Failed to resume test. Please try starting a new attempt.');
      return false;
    }
  };

const fetchTestData = async () => {
  try {
    setLoading(true);
    
    // Check if this is a teacher test by looking at the ID format or location state
    const isTeacherTest = location.state?.testType === 'teacher' || 
                         id.startsWith('teacher_'); // Adjust based on your ID format
    
    console.log('Is teacher test:', isTeacherTest);
    
    if (isTeacherTest) {
      // Use teacher test API
      const response = await axiosInstance.get(`/api/student/aptitude/joined/${id}`);
      const aptitudeData = response.data.data || response.data;
      setAptitude(aptitudeData);
      setQuestions(aptitudeData.questions || []);
      
      const totalSeconds = aptitudeData.timeLimit * 60;
      setTimeLeft(totalSeconds);
      
      // Start teacher test attempt
      const startResponse = await axiosInstance.post('/api/student/aptitude/attempt/start', {
        testId: id,
        startTime: new Date().toISOString()
      });
      
      const newAttemptId = startResponse.data.data?._id || startResponse.data.data?.id;
      setAttemptId(newAttemptId);
      
      localStorage.setItem(STORAGE_KEYS.ATTEMPT + id, JSON.stringify({
        attemptId: newAttemptId,
        timeLeft: aptitudeData.timeLimit * 60,
        duration: aptitudeData.timeLimit,
        startTime: new Date().toISOString()
      }));
      
      setLoading(false);
      return;
    }
    
    // Original general test code
    const hasExisting = await checkForExistingAttempt();
    
    if (hasExisting) {
      const response = await axiosInstance.get(
        API_PATHS.ADAPTITUDE.GET_WITH_ANSWERS.replace(':id', id)
      );
      const aptitudeData = response.data.data || response.data;
      setAptitude(aptitudeData);
      setQuestions(aptitudeData.questions || []);
      setLoading(false);
      return;
    }
    
    const response = await axiosInstance.get(
      API_PATHS.ADAPTITUDE.GET_WITH_ANSWERS.replace(':id', id)
    );
    const aptitudeData = response.data.data || response.data;
    setAptitude(aptitudeData);
    setQuestions(aptitudeData.questions || []);
    
    const totalSeconds = aptitudeData.timeLimit * 60;
    setTimeLeft(totalSeconds);
    
    await startAttempt(aptitudeData);
    
  } catch (error) {
    console.error('Error fetching test data:', error);
    handleInitializationError();
  } finally {
    setLoading(false);
  }
};
  const startAttempt = async (aptitudeData) => {
    try {
      const startResponse = await axiosInstance.post(API_PATHS.ADAPTITUDE_ATTEMPTS.START, {
        quizId: id,
        startTime: new Date().toISOString(),
        deviceInfo: {
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
      
      if (startResponse.data.data?.existingAttempt) {
        const resume = window.confirm(
          'You have an existing test session. Would you like to resume it?'
        );
        if (resume) {
          await resumeExistingAttempt(startResponse.data.data.attemptId);
          return;
        }
      }
      
      const newAttemptId = startResponse.data.data?._id || startResponse.data.data?.id;
      if (!newAttemptId) throw new Error('No attempt ID received');
      
      setAttemptId(newAttemptId);
      
      localStorage.setItem(STORAGE_KEYS.ATTEMPT + id, JSON.stringify({
        attemptId: newAttemptId,
        timeLeft: aptitudeData.timeLimit * 60,
        duration: aptitudeData.timeLimit,
        startTime: new Date().toISOString()
      }));
      
      localStorage.setItem(STORAGE_KEYS.VIOLATIONS + id, JSON.stringify([]));
      
      if (SECURITY_CONFIG.FULLSCREEN_REQUIRED_TYPES.includes(aptitudeData.contestType)) {
        setTimeout(() => {
          enterFullscreen();
          setShowFullscreenAlert(true);
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error starting attempt:', error);
      throw error;
    }
  };

  const handleInitializationError = () => {
    if (!navigator.onLine) {
      alert('No internet connection. Please check your connection and try again.');
    } else {
      alert('Failed to start test. Please try again.');
    }
    navigate('/useraptitudedashboard');
  };

  // Timer with auto-save
  useEffect(() => {
    if (timeLeft <= 0 || !attemptId || !isTestActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAutoSubmit('Time expired');
          return 0;
        }
        
        if (prev % 30 === 0) {
          autoSaveProgress();
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, attemptId, isTestActive]);

  // Security monitoring
  useEffect(() => {
    if (!attemptId || !aptitude || !isTestActive) return;
    
    const cleanups = setupSecurityMonitoring();
    
    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }, [attemptId, aptitude, isTestActive]);

  // Auto-save interval
  useEffect(() => {
    if (!attemptId || !isTestActive) return;

    autoSaveTimerRef.current = setInterval(() => {
      autoSaveProgress();
    }, SECURITY_CONFIG.AUTO_SAVE_INTERVAL);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [attemptId, isTestActive, userAnswers]);

  // Activity tracking
  useEffect(() => {
    const handleActivity = () => {
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE + id, Date.now().toString());
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [id]);

  const setupSecurityMonitoring = () => {
    const cleanups = [];
    
    const handleVisibilityChange = () => {
      if (document.hidden && isTestActive && !isSubmitting) {
        handleViolation('Tab/window switch', 'Tab or window was switched');
      }
    };

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (SECURITY_CONFIG.FULLSCREEN_REQUIRED_TYPES.includes(aptitude?.contestType) && 
          !isCurrentlyFullscreen && isTestActive && !isSubmitting) {
        setShowFullscreenAlert(true);
        enterFullscreen();
        handleViolation('Fullscreen exited', 'Test was taken out of fullscreen mode');
      }
    };

    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      const original = screenSizeRef.current;
      
      if ((newWidth < original.width * 0.9 || newHeight < original.height * 0.9) && 
          isTestActive && !isSubmitting) {
        handleViolation('Window resize', 'Window size was reduced (possible split-screen)');
      }
    };

    const handleBlur = () => {
      if (isTestActive && !isSubmitting) {
        setTimeout(() => {
          if (!document.hasFocus() && isTestActive && !isSubmitting) {
            handleViolation('Window focus lost', 'Test window lost focus');
          }
        }, 100);
      }
    };

    const handleKeyDown = (e) => {
      if (!isTestActive || isSubmitting) return;
      
      if (e.key.startsWith('F') && e.key !== 'F12') {
        e.preventDefault();
        handleViolation(`Function key: ${e.key}`, `Function key ${e.key} was pressed`);
      }
      
      if ((e.ctrlKey || e.metaKey) && (
          ['c', 'v', 'x', 'a', 's', 'p', 'u'].includes(e.key.toLowerCase()) ||
          e.keyCode === 44
        )) {
        e.preventDefault();
        const action = e.key === 'c' ? 'Copy' : 
                      e.key === 'v' ? 'Paste' : 
                      e.key === 'x' ? 'Cut' : 
                      e.key === 'a' ? 'Select All' : 
                      e.key === 's' ? 'Save' : 
                      e.key === 'p' ? 'Print' : 
                      e.key === 'u' ? 'View Source' : 'Screenshot';
        handleViolation(`Keyboard shortcut: ${e.ctrlKey ? 'Ctrl+' : 'Cmd+'}${e.key.toUpperCase()}`, 
                       `${action} shortcut was attempted`);
      }
      
      if (e.altKey && ['tab', 'f4', 'left', 'right'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        handleViolation(`Alt+${e.key}`, `Alt+${e.key} combination was pressed`);
      }
    };

    const handleContextMenu = (e) => {
      if (isTestActive && !isSubmitting) {
        e.preventDefault();
        handleViolation('Right-click', 'Right-click context menu was attempted');
      }
    };

    const handleCopyPaste = (e) => {
      if (isTestActive && !isSubmitting) {
        e.preventDefault();
        const type = e.type === 'copy' ? 'Copy' : e.type === 'paste' ? 'Paste' : 'Cut';
        handleViolation(`${type} operation`, `${type} operation was attempted`);
      }
    };

    const handleKeyUp = (e) => {
      if (!isTestActive || isSubmitting) return;
      
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        handleViolation('Screenshot', 'Screenshot was attempted');
      }
    };

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && isTestActive && !isSubmitting) {
        handleViolation('Mouse left window', 'Mouse cursor left the test window');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    window.addEventListener('resize', handleResize);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('keydown', handleKeyDown, { passive: false });
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('mouseleave', handleMouseLeave);

    const removeEvents = () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
    
    cleanups.push(removeEvents);
    return cleanups;
  };

  const handleViolation = useCallback((reason, detailedMessage, immediate = false) => {
    if (isSubmitting || !isTestActive) return;

    const now = Date.now();
    const violationKey = reason.split(':')[0];
    const lastViolation = violationDebounceRef.current[violationKey];
    
    if (!immediate && lastViolation && (now - lastViolation < SECURITY_CONFIG.VIOLATION_DEBOUNCE_MS)) {
      return;
    }
    
    violationDebounceRef.current[violationKey] = now;
    
    const violation = {
      id: `v_${now}_${Math.random().toString(36).substr(2, 9)}`,
      type: reason,
      message: detailedMessage,
      timestamp: new Date().toISOString(),
      timeSinceStart: formatTime(Math.floor((aptitude?.timeLimit * 60 - timeLeft) / 60) || 0),
      questionNumber: currentQuestionIndex + 1
    };
    
    setViolationHistory(prev => {
      const newHistory = [violation, ...prev];
      localStorage.setItem(STORAGE_KEYS.VIOLATIONS + id, JSON.stringify(newHistory));
      return newHistory;
    });

    setWarningMessage(detailedMessage);
    setShowWarning(true);
    
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(false);
    }, SECURITY_CONFIG.WARNING_DURATION);

    logViolation(violation);
    
  }, [isSubmitting, isTestActive, aptitude, timeLeft, currentQuestionIndex, id]);

  const logViolation = async (violation) => {
    try {
      if (!attemptId || !isTestActive) return;
      
      await axiosInstance.post(API_PATHS.ADAPTITUDE_ATTEMPTS.LOG_VIOLATION, {
        attemptId,
        reason: violation.type,
        detailedMessage: violation.message,
        timestamp: violation.timestamp,
        questionNumber: violation.questionNumber,
        timeSinceStart: violation.timeSinceStart,
        isFullscreen: !!document.fullscreenElement,
        windowSize: { width: window.innerWidth, height: window.innerHeight }
      });
    } catch (error) {
      console.error('Error logging violation:', error);
    }
  };

  const autoSaveProgress = useCallback(async () => {
    if (!attemptId || !isTestActive) return;
    
    try {
      const saveData = {
        attemptId,
        answers: userAnswers,
        currentQuestionIndex,
        timeLeft,
        violationHistory,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEYS.ANSWERS + id, JSON.stringify(userAnswers));
      localStorage.setItem(STORAGE_KEYS.VIOLATIONS + id, JSON.stringify(violationHistory));
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE + id, Date.now().toString());
      
      if (navigator.onLine) {
        await axiosInstance.post(API_PATHS.ADAPTITUDE_ATTEMPTS.AUTO_SAVE, saveData);
        setLastSaved(new Date());
      }
      
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [attemptId, isTestActive, userAnswers, currentQuestionIndex, timeLeft, violationHistory, id]);

  const handleAutoSubmit = useCallback(async (reason) => {
    if (isSubmitting || !isTestActive) return;
    
    await submitAttempt(reason);
  }, [attemptId, isSubmitting]);

  const submitAttempt = useCallback(async (reason) => {
    try {
      setIsSubmitting(true);
      setIsTestActive(false);

      await autoSaveProgress();

      const submitResponse = await axiosInstance.post(
        API_PATHS.ADAPTITUDE_ATTEMPTS.COMPLETE,
        { 
          attemptId,
          submissionReason: reason,
          finalAnswers: userAnswers,
          timeRemaining: timeLeft,
          violationHistory,
          flaggedQuestions
        }
      );

      cleanupRecoveryData();
      await exitFullscreenSafely();

      navigate(`/aptitude/${id}/results`, {
        state: {
          result: submitResponse.data.data,
          aptitudeData: aptitude,
          submissionReason: reason,
          violationHistory,
          timeLeft,
          answers: userAnswers,
          flaggedQuestions
        },
        replace: true
      });

    } catch (error) {
      console.error('Submit error:', error);
      
      if (!navigator.onLine) {
        localStorage.setItem(STORAGE_KEYS.PENDING_SUBMIT + id, JSON.stringify({
          attemptId,
          answers: userAnswers,
          submissionTime: new Date().toISOString(),
          reason,
          violationHistory,
          flaggedQuestions
        }));
        
        alert('Submission failed due to network error. Your answers have been saved locally. Please contact support.');
      }
      
      navigate('/useraptitudedashboard');
    }
  }, [attemptId, userAnswers, timeLeft, violationHistory, id, aptitude, navigate, flaggedQuestions]);

  const exitFullscreenSafely = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
      setIsFullscreen(false);
    } catch (error) {
      console.log('Fullscreen exit error:', error);
    }
  };

  const cleanupRecoveryData = () => {
    localStorage.removeItem(STORAGE_KEYS.ATTEMPT + id);
    localStorage.removeItem(STORAGE_KEYS.ANSWERS + id);
    localStorage.removeItem(STORAGE_KEYS.VIOLATIONS + id);
    localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVE + id);
    localStorage.removeItem(STORAGE_KEYS.ANSWERS + id + '_pending');
    localStorage.removeItem(STORAGE_KEYS.PENDING_SUBMIT + id);
  };

  const enterFullscreen = async () => {
    try {
      const element = fullscreenRef.current || document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (error) {
      console.log('Fullscreen error:', error);
    }
  };

  const handleManualSubmit = async () => {
    if (isSubmitting || !isTestActive) return;
    
    const unansweredCount = questions.length - Object.keys(userAnswers).length;
    let confirmMessage = 'Are you sure you want to submit your test?';
    
    if (unansweredCount > 0) {
      confirmMessage = `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`;
    }
    
    const confirmSubmit = window.confirm(confirmMessage);
    if (confirmSubmit) {
      setIsTestActive(false);
      await submitAttempt('Manual submission');
    }
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    if (!isTestActive) return;
    
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));

    if (attemptId && navigator.onLine) {
      saveAnswer(questionId, answerIndex);
    } else if (!navigator.onLine) {
      const pendingAnswers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANSWERS + id + '_pending') || '[]');
      pendingAnswers.push({ questionId, answerIndex, timestamp: Date.now() });
      localStorage.setItem(STORAGE_KEYS.ANSWERS + id + '_pending', JSON.stringify(pendingAnswers));
    }
  };

  const handleClearAnswer = (questionId) => {
    if (!isTestActive) return;
    
    setUserAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[questionId];
      return newAnswers;
    });

    if (attemptId && navigator.onLine) {
      saveAnswer(questionId, null);
    }
  };

  const toggleFlagQuestion = (questionId) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const saveAnswer = async (questionId, answerIndex) => {
    try {
      await axiosInstance.post(API_PATHS.ADAPTITUDE_ATTEMPTS.SUBMIT_ANSWER, {
        attemptId,
        questionId,
        selectedAnswer: answerIndex,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleQuestionNavigation = (direction) => {
    if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const jumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeStatus = () => {
    const percentage = (timeLeft / (aptitude?.timeLimit * 60)) * 100;
    if (percentage < 10) return 'critical';
    if (percentage < 25) return 'warning';
    return 'normal';
  };

  const formatViolationTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <FiShield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400 text-2xl" />
          </div>
          <div className="text-white text-xl font-semibold mb-2">
            {recoveryMode ? 'Resuming Your Test' : 'Loading Test Environment'}
          </div>
          <div className="text-gray-400 text-sm">Please do not refresh the page</div>
          {recoveryMode && (
            <div className="mt-6 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg inline-flex items-center gap-3">
              <FiRefreshCw className="text-yellow-400 animate-spin" />
              <span className="text-yellow-300">Recovery mode active - restoring your session</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!aptitude || !questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="text-red-400 text-5xl mx-auto mb-4" />
          <div className="text-white text-xl">Test not available</div>
          <button
            onClick={() => navigate('/useraptitudedashboard')}
            className="mt-6 px-6 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;
  const timeStatus = getTimeStatus();

  return (
    <div ref={fullscreenRef} className="min-h-screen bg-white text-black select-none">
      {/* Connection Alert */}
      {showConnectionAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[70] animate-slideDown">
          <div className="bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 border border-red-400">
            <FiAlertCircle className="text-xl" />
            <span>You are offline. Answers will be saved locally and synced when connection restores.</span>
          </div>
        </div>
      )}

      {/* Security Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/30 to-black/70 backdrop-blur-sm"></div>
          
          <div className="relative bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <FiAlertTriangle className="text-yellow-400 text-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Security Notice</h3>
                <div className="text-sm text-gray-400">Violation recorded</div>
              </div>
            </div>
            
            <p className="text-gray-200 mb-4 leading-relaxed">
              {warningMessage}
            </p>
            
            <div className="px-4 py-3 bg-yellow-500/10 rounded-lg text-center border border-yellow-500/30">
              <p className="text-yellow-300 text-sm">
                This has been logged. The test will continue normally.
              </p>
            </div>
            
            <button
              onClick={() => setShowWarning(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Alert */}
      {showFullscreenAlert && SECURITY_CONFIG.FULLSCREEN_REQUIRED_TYPES.includes(aptitude.contestType) && (
        <div className="fixed inset-0 bg-black/98 z-[60] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-blue-500 rounded-2xl p-8 max-w-md text-center shadow-2xl">
            <div className="relative mb-6">
              <FiMaximize2 className="text-blue-400 text-6xl mx-auto animate-pulse" />
              <FiShield className="absolute top-0 right-1/2 transform translate-x-12 text-green-400 text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Fullscreen Mode Required</h3>
            <p className="text-gray-300 mb-6">
              This test must be taken in fullscreen mode to ensure test integrity and prevent any malpractice.
            </p>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6 text-left">
              <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                <FiShield />
                Security Features Active:
              </h4>
              <ul className="text-sm text-gray-300 space-y-2">
                <li className="flex items-center gap-2">
                  <FiEye className="text-green-400" />
                  Tab/window switch detection
                </li>
                <li className="flex items-center gap-2">
                  <FiMonitor className="text-green-400" />
                  Split-screen monitoring
                </li>
                <li className="flex items-center gap-2">
                  <FiEyeOff className="text-green-400" />
                  Keyboard shortcut prevention
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                enterFullscreen();
                setShowFullscreenAlert(false);
              }}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 mx-auto"
            >
              <FiMaximize2 />
              Enter Fullscreen to Continue
            </button>
            <div className="mt-6 text-sm text-gray-400">
              Note: You can exit fullscreen only after test submission
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border border-gray-700/50 p-4 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-black">{aptitude.title}</h1>
            {aptitude.contestType === 'friday' && (
              <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full text-sm font-medium shadow-lg flex items-center gap-1">
                <FiShield className="text-xs" />
                Friday Contest
              </span>
            )}
            {recoveryMode && (
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-full text-sm font-medium shadow-lg">
                Recovery Mode
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            {lastSaved && (
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                <FiSave />
                <span>Saved: {new Date(lastSaved).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            )}
            
            {/* Timer */}
            <div className="flex items-center gap-2">
              <FiClock className={`text-lg ${
                timeStatus === 'critical' ? 'text-red-700 animate-pulse' :
                timeStatus === 'warning' ? 'text-yellow-800' : 'text-green-700'
              }`} />
              <div className={`text-2xl font-mono font-bold ${
                timeStatus === 'critical' ? 'text-red-700 animate-pulse' :
                timeStatus === 'warning' ? 'text-yellow-800' : 'text-green-800'
              }`}>
                {formatTime(timeLeft)}
              </div>
            </div>
            
            {/* Violation History Button */}
            <div className="relative">
              <button
                onClick={() => setShowViolationHistory(!showViolationHistory)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  violationHistory.length > 0 
                    ? 'bg-yellow-500/20 text-yellow-700 border border-gray-700 hover:bg-yellow-500/30' 
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                }`}
              >
                <FiList />
                <span className="hidden sm:inline">History</span>
                {violationHistory.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-yellow-500 rounded-full text-xs text-white">
                    {violationHistory.length}
                  </span>
                )}
              </button>
              
              {/* Violation History Dropdown */}
              {showViolationHistory && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden z-50">
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3 border-b border-gray-700">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <FiAlertTriangle className="text-yellow-400" />
                      Violation History
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {violationHistory.length} violation{violationHistory.length !== 1 ? 's' : ''} recorded
                    </p>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {violationHistory.length > 0 ? (
                      violationHistory.map((violation, index) => (
                        <div 
                          key={violation.id || index}
                          className="px-4 py-3 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-1">
                              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">
                                {violation.type}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {violation.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <span>{formatViolationTime(violation.timestamp)}</span>
                                <span>•</span>
                                <span>Q{violation.questionNumber}</span>
                                <span>•</span>
                                <span>{violation.timeSinceStart}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <FiShield className="text-3xl text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No violations recorded</p>
                        <p className="text-xs text-gray-500 mt-1">Test integrity maintained</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-900/50 px-4 py-2 text-xs text-gray-400 border-t border-gray-700">
                    All violations are logged for review
                  </div>
                </div>
              )}
            </div>
            
            {/* Fullscreen Status */}
            {isFullscreen ? (
              <div className="hidden md:flex items-center gap-2 text-sm text-green-700 bg-green-500/30 border border-green-600 px-3 py-1 rounded-lg">
                <FiMaximize2 />
                <span>Fullscreen Active</span>
              </div>
            ) : SECURITY_CONFIG.FULLSCREEN_REQUIRED_TYPES.includes(aptitude.contestType) && (
              <button
                onClick={enterFullscreen}
                className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-all"
              >
                <FiMaximize2 />
                Enter Fullscreen
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Questions Sidebar */}
          <div className="lg:col-span-1 bg-white backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-black">Question Navigator</h3>
              <div className="text-sm">
                <span className="text-blue-400">{answeredCount}</span>
                <span className="text-gray-400">/{questions.length}</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 bg-gray-700/20 rounded-full mb-6 overflow-hidden">
              <div 
                className="h-full bg-green-600/60 border border-green-600 transition-all duration-300"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-5 gap-2 max-h-[400px] overflow-y-auto p-1">
              {questions.map((question, index) => {
                const isAnswered = userAnswers[question._id] !== undefined;
                const isFlagged = flaggedQuestions[question._id];
                const isCurrent = currentQuestionIndex === index;
                
                return (
                  <button
                    key={question._id}
                    onClick={() => jumpToQuestion(index)}
                    disabled={!isTestActive}
                    className={`relative w-11 h-11 rounded-xl flex items-center justify-center text-sm font-semibold transition-all transform hover:scale-105 active:scale-95 ${
                      isCurrent
                        ? 'bg-gradient-to-br from-blue-600/40 to-blue-700/40 text-black border-2 border-blue-400 shadow-lg'
                        : isAnswered
                        ? 'bg-gradient-to-br from-green-600/30 to-green-700/20 text-black border border-green-500/50'
                        : 'bg-gray-800/20 text-black border border-gray-600/50 hover:border-gray-500'
                    }`}
                  >
                    {index + 1}
                    {isFlagged && (
                      <FiFlag className="absolute -top-1 -right-1 text-yellow-400 text-md font-bold" />
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-gray-700/50">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500/50 rounded"></div>
                  <span className="text-black">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-black">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-700 rounded"></div>
                  <span className="text-black">Unanswered</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiFlag className="text-yellow-400 text-xs" />
                  <span className="text-black">Flagged</span>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              onClick={handleManualSubmit}
              disabled={isSubmitting || !isTestActive}
              className="w-full mt-3 py-3 bg-green-600/50 border border-green-700 rounded-xl text-black font-semibold hover:bg-green-700/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <FiCheckCircle />
              {isSubmitting ? 'Submitting...' : 'Submit Test'}
            </button>
            
            {/* Test Info */}
            <div className="mt-6 pt-6 border-t border-gray-700/50">
              <div className="space-y-2 text-md">
                <div className="flex justify-between">
                  <span className="text-black">Duration:</span>
                  <span className="text-black font-semibold">{aptitude.timeLimit} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Questions:</span>
                  <span className="text-black font-semibold">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Type:</span>
                  <span className="text-black font-semibold capitalize">{aptitude.contestType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Violations:</span>
                  <span className={`font-semibold ${violationHistory.length > 0 ? 'text-yellow-700' : 'text-green-700'}`}>
                    {violationHistory.length}
                  </span>
                </div>
                {recoveryMode && (
                  <div className="flex justify-between">
                    <span className="text-black">Status:</span>
                    <span className="text-yellow-400 font-semibold">Resumed</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Question Area */}
          <div className="lg:col-span-3 bg-gradient-to-b from-gray-300/70 to-gray-300/40 backdrop-blur-sm text-black rounded-xl p-6 border border-gray-700/50 shadow-xl">
            {/* Question Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-black">
                  Q.{currentQuestionIndex + 1}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  currentQuestion.difficulty === 'Easy' 
                    ? 'bg-gradient-to-r from-green-500/20 to-green-600/10 text-black border border-gray-700' :
                  currentQuestion.difficulty === 'Medium' 
                    ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 text-black border border-gray-700' :
                    'bg-gradient-to-r from-red-500/20 to-red-600/10 text-black border border-gray-700'
                }`}>
                  {currentQuestion.difficulty}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {userAnswers[currentQuestion._id] !== undefined && (
                  <button
                    onClick={() => handleClearAnswer(currentQuestion._id)}
                    className="text-sm text-red-600 hover:text-red-500 px-3 py-1.5 bg-red-500/30 rounded-lg hover:bg-red-500/20 transition-all"
                  >
                    Clear Answer
                  </button>
                )}
                <button
                  onClick={() => toggleFlagQuestion(currentQuestion._id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                    flaggedQuestions[currentQuestion._id]
                      ? 'bg-yellow-500/20 text-black border border-gray-700'
                      : 'bg-gray-800/20 text-black text-lg border border-gray-600 hover:bg-gray-700/50'
                  }`}
                >
                  <FiFlag className={flaggedQuestions[currentQuestion._id] ? 'fill-yellow-400' : ''} />
                  {flaggedQuestions[currentQuestion._id] ? 'Flagged' : 'Flag'}
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-8 p-4 rounded-xl bg-gray-700/20 border border-gray-700">
              <p className="text-xl font-medium leading-relaxed text-black">
                {currentQuestion.questionText}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-4 mb-8">
              {currentQuestion.options.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    userAnswers[currentQuestion._id] === optionIndex 
                      ? 'bg-gradient-to-r from-blue-600/20 to-blue-700/10 border-blue-500 shadow-lg'
                      : ' border-gray-600/50 hover:border-gray-500/70 hover:bg-gray-800/20'
                  }`}
                >
                  <div className="flex items-center w-full">
                    <div className={`text-sm font-medium px-3 py-1 rounded transition-all mr-2 ${
                      userAnswers[currentQuestion._id] === optionIndex
                      ? 'bg-blue-500 text-black'
                      : 'border border-gray-700 text-black'
                    }`}>
                      {String.fromCharCode(65 + optionIndex)}
                    </div>
                    
                    <span className="text-black text-lg flex-1">{option}</span>

                    <div className={`w-8 h-8 rounded-lg border-2 mr-4 flex items-center justify-center flex-shrink-0 transition-all ${
                      userAnswers[currentQuestion._id] === optionIndex
                        ? 'border-blue-400 bg-blue-400'
                        : 'border-gray-400'
                    }`}>
                      {userAnswers[currentQuestion._id] === optionIndex && (
                        <div className="w-4 h-4 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                  <input
                    type="radio"
                    name={`question-${currentQuestion._id}`}
                    checked={userAnswers[currentQuestion._id] === optionIndex}
                    onChange={() => handleAnswerSelect(currentQuestion._id, optionIndex)}
                    className="hidden"
                    disabled={!isTestActive}
                  />
                </label>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t text-black border-gray-700/50">
              <button
                onClick={() => handleQuestionNavigation('prev')}
                disabled={currentQuestionIndex === 0 || !isTestActive}
                className="flex items-center gap-2 px-6 py-3 border border-gray-600 rounded-xl text-lg text-black disabled:opacity-50 hover:bg-gray-700/50 transition-all"
              >
                <FiChevronLeft />
                Previous
              </button>
              
              <div className="flex items-center gap-4">
                <span className="text-black text-md hidden sm:block">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                
                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={() => handleQuestionNavigation('next')}
                    disabled={!isTestActive}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600/60 border border-blue-700 rounded-xl text-black font-semibold hover:bg-blue-600/30 disabled:opacity-50 transition-all"
                  >
                    Next
                    <FiChevronRight />
                  </button>
                ) : (
                  <button
                    onClick={handleManualSubmit}
                    disabled={isSubmitting || !isTestActive}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600/20 border border-green-500 rounded-xl text-white font-semibold hover:bg-green-600/30 disabled:opacity-50 transition-all"
                  >
                    <FiCheckCircle />
                    {isSubmitting ? 'Submitting...' : 'Final Submit'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 text-black">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                !isTestActive ? 'bg-black' :
                connectionStatus === 'offline' ? 'bg-red-500' :
                violationHistory.length === 0 ? 'bg-green-500 animate-pulse' :
                violationHistory.length < 3 ? 'bg-yellow-500' :
                'bg-orange-500'
              }`}></div>
              <span className="text-black">
                {!isTestActive ? 'Test Inactive' : 
                 connectionStatus === 'offline' ? 'Offline Mode' : 
                 violationHistory.length === 0 ? 'Clean Record' :
                 `${violationHistory.length} Violation${violationHistory.length !== 1 ? 's' : ''}`}
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-1">
                <FiMonitor className="text-black" size={14} />
                <span className={isFullscreen ? 'text-green-400' : 'text-red-400'}>
                  {isFullscreen ? 'Fullscreen' : 'Fullscreen Required'}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <FiEye className="text-black" size={14} />
                <span className="text-black">Monitoring Active</span>
              </div>
            </div>
          </div>
          
          <div className="text-black text-center text-xs md:text-sm">
            {!isTestActive 
              ? 'Test submission in progress...'
              : connectionStatus === 'offline'
              ? 'Working offline - Answers will be synced when connection restores'
              : violationHistory.length > 0
              ? `⚠️ ${violationHistory.length} violation(s) recorded - All activities are logged`
              : 'Do not switch tabs/windows or use keyboard shortcuts'
            }
          </div>
        </div>
      </div>

      {/* Add required animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AptitudeAttemptPage;