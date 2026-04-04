import React, { useEffect, useState, useContext, useMemo } from "react";
import { LuPlus, LuSearch, LuFilter, LuBuilding, LuUsers } from "react-icons/lu";
import { CARD_BG } from "../../utils/data";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import SummaryCard from "../../components/Cards/SummaryCard";
import moment from "moment";
import CreateSessionForm from "./CreateSessionForm";
import Modal from "../../components/Modal";
import DeleteAlertContent from "../../components/DeleteAlertContent";
import { useDarkMode } from "../../context/DarkModeContext";
import { UserContext } from "../../context/userContext";

function Dashboard() {
  const navigate = useNavigate();
  const { darkmode } = useDarkMode();
  const { user } = useContext(UserContext);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionFilter, setSessionFilter] = useState("all"); // "all", "general", "company"
  const [loading, setLoading] = useState(true);

  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null,
  });

  const fetchAllSessions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ALL);
      if (response.data.success) {
        setSessions(response.data.sessions || response.data);
      } else {
        toast.error(response.data.message || "Failed to fetch sessions");
      }
    } catch (err) {
      console.error("Error fetching session data:", err);
      // toast.error(err.response?.data?.message || "Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionData) => {
    try {
      await axiosInstance.delete(API_PATHS.SESSION.DELETE(sessionData?._id));
      toast.success("Session Deleted Successfully.");
      setOpenDeleteAlert({ open: false, data: null });
      fetchAllSessions();
    } catch (error) {
      console.log("Error in Deleting", error);
      toast.error("Failed to delete session");
    }
  };

  // Helper function to determine session type
  const getSessionType = (session) => {
    // If interviewType exists, use it
    if (session.interviewType) {
      return session.interviewType;
    }
    // Fallback: Check if it has company-specific fields
    if (session.company || session.jobRole) {
      return "company";
    }
    // Default to general
    return "general";
  };

  // Filter and search sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const sessionType = getSessionType(session);
      
      // Filter by type
      const matchesFilter = 
        sessionFilter === "all" || 
        (sessionFilter === "general" && sessionType === "general") ||
        (sessionFilter === "company" && sessionType === "company");
      
      // Filter by search term
      const matchesSearch = searchTerm === "" || 
        session.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.topicsFocus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.jobRole?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [sessions, searchTerm, sessionFilter]);

  // Session statistics
  const sessionStats = useMemo(() => {
    const totalSessions = sessions.length;
    const generalSessions = sessions.filter(s => getSessionType(s) === "general").length;
    const companySessions = sessions.filter(s => getSessionType(s) === "company").length;
    
    return {
      total: totalSessions,
      general: generalSessions,
      company: companySessions
    };
  }, [sessions]);

  useEffect(() => {
    fetchAllSessions();
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkmode ? "bg-white text-black" : "bg-black text-white"
      }`}
    >
      <DashboardLayout>
        {/* Header with Stats and Filters */}
        <div className="container mx-auto mt-6 px-4">
          {/* Session Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded-xl border ${
              darkmode ? "bg-gray-50 border-gray-200" : "bg-gray-900 border-gray-700"
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <LuUsers className="text-blue-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Total Sessions</h3>
                  <p className="text-3xl font-bold text-blue-500">{sessionStats.total}</p>
                </div>
              </div>
            </div>
            <div className={`p-4 rounded-xl border ${
              darkmode ? "bg-gray-50 border-gray-200" : "bg-gray-900 border-gray-700"
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <LuUsers className="text-green-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">General Q&A</h3>
                  <p className="text-3xl font-bold text-green-500">{sessionStats.general}</p>
                </div>
              </div>
            </div>
            <div className={`p-4 rounded-xl border ${
              darkmode ? "bg-gray-50 border-gray-200" : "bg-gray-900 border-gray-700"
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <LuBuilding className="text-orange-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Company Sessions</h3>
                  <p className="text-3xl font-bold text-orange-500">{sessionStats.company}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className={`p-4 rounded-xl mb-6 ${
            darkmode ? "bg-gray-50 border border-gray-200" : "bg-gray-900 border border-gray-700"
          }`}>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 w-full md:w-auto">
                <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search sessions by role, topics, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkmode 
                      ? "bg-white border-gray-300 text-black" 
                      : "bg-gray-800 border-gray-600 text-white"
                  }`}
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2">
                <LuFilter className="text-gray-400" size={20} />
                <div className={`flex rounded-lg p-1 ${
                  darkmode ? "bg-gray-200" : "bg-gray-800"
                }`}>
                  {[
                    { key: "all", label: "All Sessions", icon: LuUsers },
                    { key: "general", label: "General Q&A", icon: LuUsers },
                    { key: "company", label: "Company Wise", icon: LuBuilding }
                  ].map((filter) => {
                    const IconComponent = filter.icon;
                    return (
                      <button
                        key={filter.key}
                        onClick={() => setSessionFilter(filter.key)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                          sessionFilter === filter.key
                            ? "bg-blue-600/20 border border-blue-600 text-white shadow-lg"
                            : darkmode 
                              ? "text-gray-700 hover:text-black hover:bg-gray-300"
                              : "text-gray-300 hover:text-white hover:bg-gray-700"
                        }`}
                      >
                        <IconComponent size={16} />
                        <span className="hidden sm:inline">{filter.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sessions Grid */}
          {loading ? (
          <div className='bg-black'>
            <div className='p-5'>  
              <div className="min-h-screen bg-black mt-5 grid grid-cols-3 justify-center p-4">

                <div className="bg-gray-700/20 border border-gray-600 rounded-xl animate-pulse w-113 h-61">
                  <div className="mt-4 ml-3 bg-gray-700/50 border border-gray-600 rounded-xl animate-pulse w-107 h-23">
                    <div className="bg-gray-700 rounded-xl animate-pulse w-14 h-14 mt-4 ml-6"></div>
                    <div className="absolute top-103 left-39 bg-gray-700 rounded-md animate-pulse w-54 h-5"></div>
                    <div className="absolute top-110 left-39 bg-gray-700 rounded-md animate-pulse w-40 h-3"></div>
                  </div>
                </div>

                <div className="bg-gray-700/20 border border-gray-600 rounded-xl animate-pulse w-113 h-61">
                  <div className="mt-4 ml-3 bg-gray-700/50 border border-gray-600 rounded-xl animate-pulse w-107 h-23">
                    <div className="bg-gray-700 rounded-xl animate-pulse w-14 h-14 mt-4 ml-6"></div>
                    <div className="absolute top-103 left-162 bg-gray-700 rounded-md animate-pulse w-54 h-5"></div>
                    <div className="absolute top-110 left-162 bg-gray-700 rounded-md animate-pulse w-40 h-3"></div>
                  </div>
                </div>

                <div className="bg-gray-700/20 border border-gray-600 rounded-xl animate-pulse w-113 h-61">
                  <div className="mt-4 ml-3 bg-gray-700/50 border border-gray-600 rounded-xl animate-pulse w-107 h-23">
                    <div className="bg-gray-700 rounded-xl animate-pulse w-14 h-14 mt-4 ml-6"></div>
                    <div className="absolute top-103 left-285 bg-gray-700 rounded-md animate-pulse w-54 h-5"></div>
                    <div className="absolute top-110 left-285 bg-gray-700 rounded-md animate-pulse w-40 h-3"></div>
                  </div>
                </div>

                {/* <div className="bg-gray-700/20 border border-gray-600 rounded-xl animate-pulse w-113 h-61">
                  <div className="mt-4 ml-3 bg-gray-700/50 border border-gray-600 rounded-xl animate-pulse w-107 h-23">
                    <div className="bg-gray-700 rounded-xl animate-pulse w-14 h-14 mt-4 ml-6"></div>
                    <div className="absolute top-203 left-39 bg-gray-700 rounded-md animate-pulse w-54 h-5"></div>
                    <div className="absolute top-110 left-39 bg-gray-700 rounded-md animate-pulse w-40 h-3"></div>
                  </div>
                </div>

                <div className="bg-gray-700/20 border border-gray-600 rounded-xl animate-pulse w-113 h-61">
                  <div className="mt-4 ml-3 bg-gray-700/50 border border-gray-600 rounded-xl animate-pulse w-107 h-23">
                    <div className="bg-gray-700 rounded-xl animate-pulse w-14 h-14 mt-4 ml-6"></div>
                    <div className="absolute top-103 left-39 bg-gray-700 rounded-md animate-pulse w-54 h-5"></div>
                    <div className="absolute top-110 left-39 bg-gray-700 rounded-md animate-pulse w-40 h-3"></div>
                  </div>
                </div>

                <div className="bg-gray-700/20 border border-gray-600 rounded-xl animate-pulse w-113 h-61">
                  <div className="mt-4 ml-3 bg-gray-700/50 border border-gray-600 rounded-xl animate-pulse w-107 h-23">
                    <div className="bg-gray-700 rounded-xl animate-pulse w-14 h-14 mt-4 ml-6"></div>
                    <div className="absolute top-103 left-39 bg-gray-700 rounded-md animate-pulse w-54 h-5"></div>
                    <div className="absolute top-110 left-39 bg-gray-700 rounded-md animate-pulse w-40 h-3"></div>
                  </div>
                </div> */}

              </div>
            </div>
          </div>
          ) : filteredSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSessions?.map((data, index) => (
                <SummaryCard
                  key={data?._id || data?.id}
                  colors={CARD_BG[index % CARD_BG.length]}
                  role={data?.role || ""}
                  topicsFocus={data?.topicsFocus || ""}
                  experience={data?.experience || ""}
                  description={data?.description || ""}
                  questions={data?.questions || []}
                  interviewType={getSessionType(data)}
                  company={data?.company}
                  jobRole={data?.jobRole}
                  lastUpdatedAt={
                    data?.updatedAt
                      ? moment(data.updatedAt).format("DD MMM YYYY")
                      : ""
                  }
                  onSelect={() =>
                    navigate(`/interview-prep/${data?._id || data?.id}`)
                  }
                  onDelete={() => setOpenDeleteAlert({ open: true, data })}
                />
              ))}
            </div>
          ) : (
            // ✅ Empty State
            <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
              <h2 className="text-3xl font-bold mb-4">
                {searchTerm || sessionFilter !== "all" ? "No Matching Sessions" : "No Sessions Yet"}
              </h2>
              <p className="text-gray-400 mb-6 max-w-md">
                {searchTerm || sessionFilter !== "all" 
                  ? "No sessions match your current search or filter criteria. Try adjusting your filters or search term."
                  : "You haven't created any interview sessions yet. Start your first session to begin preparing smarter!"
                }
              </p>
              {(searchTerm || sessionFilter !== "all") ? (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSessionFilter("all");
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg"
                >
                  Clear Filters
                </button>
              ) : (
                <Link to="/create-session">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-blue-700/20 border border-blue-600 text-white hover:opacity-90 transition-all shadow-lg">
                    <LuPlus size={20} />
                    Create New Session
                  </button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Floating Add Button (always visible) */}
        <Link to="/create-session">
          <button className="h-12 w-auto flex items-center gap-2 justify-center bg-blue-700/20 border border-blue-600 text-white font-bold px-4 rounded-full hover:shadow-2xl hover:shadow-violet-700 fixed bottom-6 right-6 transition z-50">
            <LuPlus size={20} />
            <span className="hidden md:inline">Add New</span>
          </button>
        </Link>

        {/* Create Modal */}
        <Modal
          isOpen={openCreateModal}
          onClose={() => setOpenCreateModal(false)}
          hideHeader
        >
          <CreateSessionForm />
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={openDeleteAlert?.open}
          onClose={() => setOpenDeleteAlert({ open: false, data: null })}
          title="Delete Alert"
        >
          <DeleteAlertContent
            content="Are you sure you want to delete this session detail?"
            onDelete={() => deleteSession(openDeleteAlert.data)}
          />
        </Modal>
      </DashboardLayout>
    </div>
  );
}

export default Dashboard;