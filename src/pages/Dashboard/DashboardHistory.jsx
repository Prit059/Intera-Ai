import React, { useEffect, useState } from "react";
import { FiFileText, FiTrendingUp, FiMap, FiUserCheck } from "react-icons/fi";
import { useDarkMode } from "../../context/DarkModeContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";

// Define your 4 modules here
const MODULES = [
  {
    key: "interview",
    label: "Interview Prep Q&A",
    icon: <FiFileText className="text-xl mr-2 text-blue-500" />,
    category: "Interview Prep Q&A",
    apiPath: API_PATHS.SESSION.GET_ALL,
    dataKey: "interviewhistory"
  },
  {
    key: "quiz",
    label: "AI Quiz",
    icon: <FiTrendingUp className="text-xl mr-2 text-green-500" />,
    category: "AI Quiz",
    apiPath: API_PATHS.QUIZ.GET_ALL,
    dataKey: "quizhistory"
  },
  {
    key: "roadmap",
    label: "AI Roadmap",
    icon: <FiMap className="text-xl mr-2 text-purple-500" />,
    category: "AI Roadmap",
    apiPath: API_PATHS.ROADMAP.GET_ALL,
    dataKey: "roadmaphistory"
  },
  {
    key: "interview_ai",
    label: "AI with Interview",
    icon: <FiUserCheck className="text-xl mr-2 text-pink-500" />,
    category: "AI with Interview",
    apiPath: API_PATHS.SESSION.GET_ALL, // Adjust this if you have separate API for AI interviews
    dataKey: "interviewaihistory"
  },
];

function DashboardHistory() {
  const { darkmode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState(MODULES[0].key);
  
  // State for each module's history
  const [interviewhistory, setInterviewHistory] = useState([]);
  const [quizhistory, setQuizHistory] = useState([]);
  const [roadmaphistory, setRoadmapHistory] = useState([]);
  const [interviewaihistory, setInterviewAiHistory] = useState([]);

  // Fetch data for all modules
// In your DashboardHistory component, update the quiz API call:
const fetchAllHistory = async () => {
  setLoading(true);
  try {
    // Fetch interview sessions
    const sessionResponse = await axiosInstance.get(API_PATHS.SESSION.GET_ALL);
    setInterviewHistory(sessionResponse.data?.sessions || sessionResponse.data || []);

    // Fetch quiz history - handle different response structures
    const quizResponse = await axiosInstance.get(API_PATHS.QUIZ.GET_ALL);
    setQuizHistory(quizResponse.data?.quizzes || quizResponse.data || []);

    // Fetch roadmap history
    const roadmapResponse = await axiosInstance.get(API_PATHS.ROADMAP.GET_ALL);
    setRoadmapHistory(roadmapResponse.data?.roadmaps || roadmapResponse.data || []);

    // For interview AI, using the same sessions for now
    setInterviewAiHistory(sessionResponse.data?.sessions || sessionResponse.data || []);

  } catch (error) {
    console.error("Error fetching history:", error);
    // Set empty arrays on error
    setInterviewHistory([]);
    setQuizHistory([]);
    setRoadmapHistory([]);
    setInterviewAiHistory([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchAllHistory();
  }, []);

  // Get data for active module
  const getActiveModuleData = () => {
    const activeMod = MODULES.find(mod => mod.key === activeModule);
    if (!activeMod) return [];
    
    switch (activeMod.key) {
      case "interview":
        return interviewhistory;
      case "quiz":
        return quizhistory;
      case "roadmap":
        return roadmaphistory;
      case "interview_ai":
        return interviewaihistory;
      default:
        return [];
    }
  };

  // Get display text based on module type
  const getDisplayField = (item, moduleKey) => {
    switch (moduleKey) {
      case "interview":
        return item?.role || "—";
      case "quiz":
        return item?.mainTopic || "—";
      case "roadmap":
        return item?.field || item?.title || "—";
      case "interview_ai":
        return "—";
      default:
        return "—";
    }
  };

  // Get date field based on module type
  const getDateField = (item) => {
    return item?.updatedAt || item?.createdAt || item?.completedAt || "-";
  };

  const activeData = getActiveModuleData();

  return (
    <section>
      <h3 className="md:text-2xl md:font-semibold md:mb-4 items-center text-center mb-5 text-3xl md:items-start md:text-left">Previous History</h3>
      
      {/* Module Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-thin">
        {MODULES.map((mod) => (
          <button
            key={mod.key}
            onClick={() => setActiveModule(mod.key)}
            className={`flex items-center px-4 ml-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap
              ${activeModule === mod.key 
                ? 'bg-blue-600/20 text-white border border-blue-500' 
                : 'bg-gray-600/20 border border-gray-500 text-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white
              hover:scale-102 hover:shadow-lg
            `}
          >
            {mod.icon}
            {mod.label}
          </button>
        ))}
      </div>

      {/* History Table with Animation */}
      <div
        className={`rounded-xl shadow p-6 transition-colors bg-gray-700/20 text-white border border-gray-500 md:w-full w-102 ml-2.5`}
      >
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.table
              key={activeModule}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="w-full text-left border-collapse"
            >
              <thead>
                <tr>
                  <th className="pb-2 text-sm">
                    {activeModule === "quiz" ? "Main Topic" : 
                     activeModule === "roadmap" ? "Field / Title" : 
                     "Role / Main Topic"}
                  </th>
                  <th className="pb-2 text-sm">
                    Date & Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeData.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-6 text-center text-gray-400">
                      No history found for this module.
                    </td>
                  </tr>
                ) : (
                  activeData.map((item) => (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-600 hover:bg-gray-100/10 transition"
                    >
                      <td className="py-3">
                        {getDisplayField(item, activeModule)}
                      </td>
                      <td className="py-3">
                        {moment(getDateField(item)).format("DD MMM YYYY, hh:mm A")}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </motion.table>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}

export default DashboardHistory;