export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: (token) => `/api/auth/reset-password/${token}`,
    VERIFY_EMAIL: (token) => `/api/auth/verify-email/${token}`,
    REFRESH_TOKEN: "/api/auth/refresh-token",
    LOGOUT: "/api/auth/logout",
    CHANGE_PASSWORD: "/api/auth/change-password",
    TEACHER_REGISTER: "/api/auth/teacher/register",
  },

  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image", //Upload profile picture
  },

  AI: {
    GENERATE_QUESTIONS: "/api/ai/generate-questions", // Generate interview question
    GENERATE_EXPLANATION: "/api/ai/generate-explanation",
    GENERATE_QUIZ: "/api/ai/generate-quiz",
    GENERATE_COMPANY_QUESTIONS: "/api/ai/generate-company-questions"
  },

  QUIZ: {
    GENERATE: '/api/quizzes/generate',
    SUBMIT: '/api/quizzes/submit',
    HISTORY: '/api/quizzes/history',
    ANALYTICS: '/api/quizzes/analytics',
    RESULT: (quizId) => `/api/quizzes/result/${quizId}`,
    GET_BY_ID: (quizId) => `/api/quizzes/${quizId}`,
    DELETE: (quizId) => `/api/quizzes/${quizId}`
  },

  SESSION: {
    CREATE: "/api/sessions/create", // create a new interview session with question
    GET_ALL: "/api/sessions/my-session", //get all user sessions
    GET_BY_TYPE: (type) => `/api/sessions/type/${type}`,
    GET_ONE: (id) => `/api/sessions/${id}`, //get session details with question.
    DELETE: (id) => `/api/sessions/${id}`, // delete a session
  },

  QUESTION: {
    ADD_TO_SEESION: "/api/questions/add", // add more question to a session
    PIN: (id) => `/api/questions/${id}/pin`, //pin or unpin a question
    UPDATE_NOTE: (id) => `/api/questions/${id}/note`, // Update/Add a note to a question
  },

  // QUIZ: {
  //   GET_ALL: "/api/quizzes/my-quiz", //get all user sessions
  //   GET_ONE: (id) => `/api/quizzes/${id}`, //get session details with question.
  //   DELETE: (id) => `/api/quizzes/${id}`, // delete a session
  // },

  ROADMAP: {
    ROADMAP_GENERATE: "/api/roadmap/generate-roadmap",
    GET_ALL: "/api/roadmap/getallroadmap",
    GET_ONE: (id) => `/api/roadmap/getRoadmapById/${id}`,
    DELETE: (id) => `/api/roadmap/deleteroadmap/${id}`,
    UPDATE_PROGRESS: "/api/roadmap/progress",
    GET_PROGRESS: (roadmapId) => `/api/roadmap/progress/${roadmapId}`,
    GET_BADGES: (roadmapId) => `/api/roadmap/badges/${roadmapId}`,
    SKILL_GAP_SCAN: "/api/roadmap/skill-gap-scan",
    FIX_PROGRESS: "/api/roadmap/fix-progress", // ✅ ADD THIS
    SKILL_GAP_AI: "/api/roadmap/analyze-skill-gaps"
  },

  ADSESSION: {
    CREATE: "/api/Adsessions/create", // create a new interview session with question
    GET_ALL: "/api/Adsessions", //get all user sessions
    GET_ONE: (id) => `/api/Adsessions/${id}`, //get session details with question.
    DELETE: (id) => `/api/Adsessions/delete/${id}`, // delete a session
  },
  
  ADQUIZ: {
    CREATE: '/api/Adquizzes/create-quiz',
    GET_ALL: '/api/Adquizzes',
    GET_ACTIVE: '/api/Adquizzes/active',
    GET_MY: '/api/Adquizzes/my/quizzes',
    GET_ONE: '/api/Adquizzes/:id',
    UPDATE: '/api/Adquizzes/:id',
    DELETE: '/api/Adquizzes/:id'
  },

  QUIZ_ATTEMPTS: {
    SUBMIT: '/api/quiz-attempts/submit',
    USER_ATTEMPTS: '/api/quiz-attempts/user-attempts',
    LEADERBOARD: '/api/quiz-attempts/leaderboard',
    RESULTS: '/api/quiz-attempts/results',
    DETAILED_RESULTS: '/api/quiz-attempts/detailed-results'
  },

  ADAPTITUDE: {
    GET_ALL: '/api/AdAptitude',
    GET_ONE: '/api/AdAptitude/:id',
    GET_MY: '/api/AdAptitude/my/aptitudes',
    CREATE: '/api/AdAptitude/create-aptitude',
    UPDATE: '/api/AdAptitude/:id',
    DELETE: '/api/AdAptitude/:id',
    TOGGLE_STATUS: '/api/AdAptitude/:id/toggle-status',
    GET_WITH_ANSWERS: '/api/AdAptitude/:id/with-answers',

    FRIDAY_ALL: '/api/AdAptitude/friday/all',
    FRIDAY_ACTIVE: '/api/AdAptitude/friday/active',
    FRIDAY_UPCOMING: '/api/AdAptitude/friday/upcoming',
    FRIDAY_STATS: '/api/AdAptitude/friday', // + /:contestId/stats
    FRIDAY_CLONE: '/api/AdAptitude/friday', // + /:contestId/clone
    FRIDAY_USER_HISTORY: '/api/AdAptitudeAttempt/friday/history'
  },

  ADAPTITUDE_ATTEMPTS: {
    START: '/api/AdAptitude/attempt/start',
    SUBMIT_ANSWER: '/api/AdAptitude/attempt/answer',
    COMPLETE: '/api/AdAptitude/attempt/complete',
    USER_ATTEMPTS: '/api/AdAptitude/attempts/user',
    USER_APTITUDE_ATTEMPTS: '/api/AdAptitude/attempts/user/:aptitudeId',
    RESULTS: '/api/AdAptitude/attempt/results/:id',
    LEADERBOARD: '/api/AdAptitude/leaderboard/:aptitudeId',
    DETAILED_RESULTS: '/api/AdAptitude/attempt/detailed-results/:attemptId',
    LOG_VIOLATION: '/api/AdAptitude/attempt/violation', // Add this
    GET_ATTEMPT: '/api/AdAptitude/attempt/results/:id', // Use existing endpoint
    FRIDAY_HISTORY: '/api/AdAptitudeAttempt/friday/history'
  },

  // Add to API_PATHS object
  AI_LEARNING: {
    RECOMMENDATIONS: '/api/ai/learning-recommendations',
    PRACTICE_QUESTIONS: '/api/ai/generate-practice-questions',
    STUDY_PLAN: '/api/ai/create-study-plan',
    USER_PROGRESS: '/api/ai/user-progress/:userId',
    UPDATE_LEARNING_PATH: '/api/ai/update-learning-path'
  },

  PRACTICE: {
    START: "/api/practice/start",
    SUBMIT_RECORDING: "/api/practice/submit-recording",
    NEXT_QUESTION: (id) => `/api/practice/next-question/${id}`,
    GET_SESSION: (id) => `/api/practice/session/${id}`
  },

  APTITUDETOPIC: {
    GET_ALL: "/api/aptitude/topics",
    GET_BY_SLUG: (slug) => `/api/aptitude/topics/${slug}`,
    GET_CATEGORIES: "/api/aptitude/categories",
    GET_FEATURED: "/api/aptitude/featured",
    GET_POPULAR: "/api/aptitude/popular",
    GET_SEARCH: "/api/aptitude/search",
    RATE_TOPIC: (id) => `/api/aptitude/topics/${id}/rate`,
    PROGRESS: "/api/aptitude/progress",
    UPDATE_ATTEMPT: "/api/aptitude/progress/attempt",
    BOOKMARK_TOPIC: (topicId) => `/api/aptitude/progress/bookmark/${topicId}`,
    BOOKMARKS: "/api/aptitude/progress/bookmarks",
  },

  ADAPTITUDETOPIC: {
    CREATE: "/api/admin/aptitudetopic/createtopics",
    GET_ALL: "/api/admin/aptitudetopic/topics",
    GET_BY_ID: (id) => `/api/admin/aptitudetopic/topics/${id}`,
    UPDATE: (id) => `/api/admin/aptitudetopic/topics/${id}`,
    DELETE: (id) => `/api/admin/aptitudetopic/topics/${id}`,
    TOGGLE_PUBLISH: (id) => `/api/admin/aptitudetopic/topics/${id}/publish`,
    TOGGLE_FEATURED: (id) => `/api/admin/aptitudetopic/topics/${id}/feature`,
    BULK_UPDATE: "/api/admin/aptitudetopic/topics/bulk",
    ADMIN_STATS: "/api/admin/aptitudetopic/stats"
  }
};    