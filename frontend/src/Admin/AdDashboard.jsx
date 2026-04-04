import React, { useState, useEffect } from 'react'
import { AdNavbar } from '../Admin/AdImport/Adimportfile'
import axiosInstance from '../utils/axiosInstance'
import { API_PATHS } from "../utils/apiPaths" 
import { useNavigate } from 'react-router-dom'
import { 
  FiEye, FiUsers, FiBarChart2, FiCalendar, 
  FiArrowRight, FiRefreshCw, FiFilter, FiX,
  FiTrash2, FiEdit2, FiCheck, FiXCircle
} from 'react-icons/fi'

function AdDashboard() {
  const [sessions, setSessions] = useState([])
  const [filteredSessions, setFilteredSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null) // Track which session is being deleted
  const [deleting, setDeleting] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState({ type: '', text: '' })
  const [filters, setFilters] = useState({
    type: 'all',
    difficulty: 'all',
    dateRange: 'all',
    search: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [sessions, filters])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(API_PATHS.ADSESSION.GET_ALL)
      
      let sessionsData = []
      
      if (Array.isArray(response.data)) {
        sessionsData = response.data
      } else if (response.data && Array.isArray(response.data.sessions)) {
        sessionsData = response.data.sessions
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        sessionsData = response.data.data
      }
      
      console.log("Sessions data:", sessionsData)
      setSessions(sessionsData)
    } catch (error) {
      console.error("Error fetching sessions:", error)
      showMessage('error', 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const deleteSession = async (sessionId) => {
    if (!sessionId) return
    
    try {
      setDeleting(true)
      const response = await axiosInstance.delete(`${API_PATHS.ADSESSION.DELETE(sessionId)}`)
      
      if (response.data.success) {
        // Remove from state
        setSessions(prev => prev.filter(session => session._id !== sessionId))
        setDeleteConfirm(null)
        showMessage('success', 'Session deleted successfully')
      } else {
        showMessage('error', response.data.message || 'Failed to delete session')
      }
    } catch (error) {
      console.error("Delete session error:", error)
      showMessage('error', error.response?.data?.message || 'Failed to delete session')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteClick = (sessionId, e) => {
    e.stopPropagation() // Prevent navigation
    setDeleteConfirm(sessionId)
  }

  const cancelDelete = (e) => {
    e?.stopPropagation()
    setDeleteConfirm(null)
  }

  const confirmDelete = (sessionId, e) => {
    e?.stopPropagation()
    deleteSession(sessionId)
  }

  const showMessage = (type, text) => {
    setDeleteMessage({ type, text })
    setTimeout(() => {
      setDeleteMessage({ type: '', text: '' })
    }, 3000)
  }

  const applyFilters = () => {
    let filtered = [...sessions]

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(session => session.sessionType === filters.type)
    }

    // Filter by difficulty
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(session => session.difficulty === filters.difficulty)
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7))
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
      
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.createdAt)
        
        switch (filters.dateRange) {
          case 'today':
            return sessionDate.toDateString() === new Date().toDateString()
          case 'week':
            return sessionDate >= sevenDaysAgo
          case 'month':
            return sessionDate >= thirtyDaysAgo
          default:
            return true
        }
      })
    }

    // Filter by search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(session => 
        session.sessionName.toLowerCase().includes(searchTerm) ||
        (session.description && session.description.toLowerCase().includes(searchTerm)) ||
        (session.branch && session.branch.toLowerCase().includes(searchTerm)) ||
        (session.role && session.role.toLowerCase().includes(searchTerm)) ||
        (session.company && session.company.toLowerCase().includes(searchTerm)) ||
        (session.topic && session.topic.toLowerCase().includes(searchTerm))
      )
    }

    setFilteredSessions(filtered)
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      type: 'all',
      difficulty: 'all',
      dateRange: 'all',
      search: ''
    })
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-700'
      case 'Medium': return 'bg-yellow-700'
      case 'Hard': return 'bg-red-700'
      case 'Mixed': return 'bg-purple-700'
      default: return 'bg-gray-700'
    }
  }

  const getSessionTypeIcon = (type) => {
    return type === 'general' ? <FiUsers className="text-blue-400" /> : <FiBarChart2 className="text-purple-400" />
  }

  // Calculate statistics
  const stats = {
    totalSessions: sessions.length,
    generalSessions: sessions.filter(s => s.sessionType === 'general').length,
    companySessions: sessions.filter(s => s.sessionType === 'company').length,
    totalQuestions: sessions.reduce((total, session) => total + (session.questions?.length || 0), 0),
    filteredSessions: filteredSessions.length
  }

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== 'all' && value !== ''
  ).length

  if (loading) {
    return (
      <div className='bg-black min-h-screen text-white'>
        <AdNavbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-black min-h-screen text-white'>
      <AdNavbar />
      <div className="container mx-auto p-6">
        {/* Delete Message Toast */}
        {deleteMessage.text && (
          <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg ${
            deleteMessage.type === 'success' ? 'bg-green-900 border border-green-700' : 'bg-red-900 border border-red-700'
          }`}>
            <div className="flex items-center gap-2">
              {deleteMessage.type === 'success' ? (
                <FiCheck className="text-green-400" />
              ) : (
                <FiXCircle className="text-red-400" />
              )}
              <span>{deleteMessage.text}</span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Interview Sessions Dashboard</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center bg-gray-600/20 border border-gray-700 hover:bg-gray-500/20 px-4 py-2 rounded transition-colors"
            >
              <FiFilter className="mr-2" /> 
              Filters 
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-blue-600 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button 
              onClick={fetchSessions}
              className="flex items-center bg-blue-600/20 border border-blue-600 hover:bg-blue-500/20 px-4 py-2 rounded transition-colors"
              disabled={deleting}
            >
              <FiRefreshCw className={`mr-2 ${deleting ? 'animate-spin' : ''}`} /> 
              {deleting ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
        
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-600/20 border border-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-white">Total Sessions</h3>
              <FiCalendar className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold mt-2">{stats.totalSessions}</p>
          </div>
          
          <div className="bg-gray-600/20 border border-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-white">General Q&A</h3>
              <FiUsers className="text-green-400" />
            </div>
            <p className="text-2xl font-bold mt-2">{stats.generalSessions}</p>
          </div>
          
          <div className="bg-gray-600/20 border border-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-white">Company Specific</h3>
              <FiBarChart2 className="text-purple-400" />
            </div>
            <p className="text-2xl font-bold mt-2">{stats.companySessions}</p>
          </div>
          
          <div className="bg-gray-600/20 border border-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-white">Total Questions</h3>
              <FiEye className="text-yellow-400" />
            </div>
            <p className="text-2xl font-bold mt-2">{stats.totalQuestions}</p>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-600/20 border border-gray-700 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filter Sessions</h3>
              <div className="flex gap-2">
                {activeFiltersCount > 0 && (
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-gray-400 hover:text-white flex items-center"
                  >
                    <FiX className="mr-1" /> Clear All
                  </button>
                )}
                <button 
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">Session Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="general">General Q&A</option>
                  <option value="company">Company Specific</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Grid Header */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {activeFiltersCount > 0 ? 'Filtered Sessions' : 'All Sessions'}
            <span className="text-gray-400 text-sm ml-2">
              ({stats.filteredSessions} of {stats.totalSessions})
            </span>
          </h2>
          <span className="text-gray-400">{stats.filteredSessions} sessions</span>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="bg-gray-600/20 border border-gray-700 rounded-xl p-8 text-center">
            <FiCalendar className="text-4xl mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {sessions.length === 0 ? 'No sessions yet' : 'No matching sessions found'}
            </h3>
            <p className="text-gray-400">
              {sessions.length === 0 
                ? 'Create your first interview session to get started' 
                : 'Try adjusting your filters to see more results'
              }
            </p>
            {activeFiltersCount > 0 && sessions.length > 0 && (
              <button 
                onClick={clearFilters}
                className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map((session) => (
              <div 
                key={session._id} 
                className={`bg-gray-600/20 border border-gray-700 rounded-xl p-4 hover:bg-gray-400/20 transition-colors cursor-pointer relative ${
                  deleteConfirm === session._id ? 'ring-2 ring-red-500' : ''
                }`}
                onClick={() => deleteConfirm !== session._id && navigate(`/session/${session._id}`)}
              >
                {/* Delete Confirmation Overlay */}
                {deleteConfirm === session._id && (
                  <div className="absolute inset-0 bg-black bg-opacity-90 rounded-xl flex flex-col items-center justify-center p-4 z-10">
                    <FiTrash2 className="text-red-500 text-3xl mb-3" />
                    <h4 className="font-semibold mb-2 text-center">Delete this session?</h4>
                    <p className="text-gray-400 text-sm text-center mb-4">
                      "{session.sessionName}" will be permanently deleted
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={(e) => confirmDelete(session._id, e)}
                        disabled={deleting}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {deleting ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <FiCheck /> Yes, Delete
                          </>
                        )}
                      </button>
                      <button
                        onClick={cancelDelete}
                        disabled={deleting}
                        className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded flex items-center gap-2 transition-colors"
                      >
                        <FiX /> Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-xl truncate">{session.sessionName}</h3>
                  <div className="flex items-center gap-2">
                    {getSessionTypeIcon(session.sessionType)}
                    <button
                      onClick={(e) => handleDeleteClick(session._id, e)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Delete session"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center mb-3 gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(session.difficulty)}`}>
                    {session.difficulty}
                  </span>
                  <span className="text-white text-md">
                    {session.questions?.length || 0} questions
                  </span>
                </div>
                
                <div className="text-sm text-gray-400 mb-3">
                  {session.sessionType === 'general' ? (
                    <p>{session.branch} • {session.role}{session.topic && ` • ${session.topic}`}</p>
                  ) : (
                    <p>{session.company} • {session.companyRole}</p>
                  )}
                </div>
                
                {session.description && (
                  <p className="text-sm text-gray-400 truncate mb-3">{session.description}</p>
                )}
                
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>Created: {new Date(session.createdAt).toLocaleDateString()}</span>
                  <span className="text-blue-400 hover:text-blue-300 flex items-center">
                    View Details <FiArrowRight className="ml-1" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdDashboard