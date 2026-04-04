// pages/teacher/TestDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  FiArrowLeft, FiCopy, FiUsers, FiBarChart2,
  FiClock, FiAward, FiCheckCircle, FiXCircle,
  FiEdit, FiTrash2, FiRefreshCw, FiDownload,
  FiMail, FiPlus, FiCalendar, FiUserCheck, FiUserX,
  FiUserMinus, FiAlertCircle, FiInfo
} from 'react-icons/fi';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';

// Removal reason options
const REMOVAL_REASONS = [
  { value: 'cheating', label: 'Cheating/Malpractice' },
  { value: 'misconduct', label: 'Misconduct' },
  { value: 'technical_issues', label: 'Technical Issues' },
  { value: 'wrongly_added', label: 'Wrongly Added' },
  { value: 'student_request', label: 'Student Request' },
  { value: 'inactive', label: 'Inactive/Not Participating' },
  { value: 'other', label: 'Other (Manual)' }
];

function TestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddStudents, setShowAddStudents] = useState(false);
  const [studentEmails, setStudentEmails] = useState('');
  const [addingStudents, setAddingStudents] = useState(false);
  const [showJoinCodeMessage, setShowJoinCodeMessage] = useState(location.state?.showJoinCode || false);
  
  // Remove student modal state
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [removalReason, setRemovalReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [removingStudent, setRemovingStudent] = useState(false);
  
  // Show removal history modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    fetchTestDetails();
  }, [id]);

  const fetchTestDetails = async () => {
    try {
      const response = await axiosInstance.get(`/api/teacher/aptitude/test/${id}`);
      setTest(response.data.data);
    } catch (error) {
      console.error('Error fetching test:', error);
      toast.error('Failed to load test details');
    } finally {
      setLoading(false);
    }
  };

  const copyJoinCode = () => {
    navigator.clipboard.writeText(test.joinCode);
    toast.success('Join code copied!');
    setShowJoinCodeMessage(false);
  };

  const handleAddStudents = async () => {
    const emails = studentEmails.split(',').map(e => e.trim()).filter(e => e);
    
    if (emails.length === 0) {
      toast.error('Please enter at least one email');
      return;
    }

    setAddingStudents(true);
    try {
      const response = await axiosInstance.post(`/api/teacher/aptitude/test/${id}/add-students`, {
        emails
      });

      if (response.data.success) {
        const { added, notFound, alreadyExists } = response.data.data;
        
        if (added.length > 0) {
          toast.success(`${added.length} students added successfully`);
        }
        if (notFound.length > 0) {
          toast.error(`Emails not found: ${notFound.join(', ')}`);
        }
        if (alreadyExists.length > 0) {
          toast.info(`${alreadyExists.length} students already in test`);
        }
        
        fetchTestDetails();
        setShowAddStudents(false);
        setStudentEmails('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add students');
    } finally {
      setAddingStudents(false);
    }
  };

  const handleRemoveStudent = async () => {
    if (!selectedStudent) return;
    
    const reason = removalReason === 'other' ? customReason : 
                  REMOVAL_REASONS.find(r => r.value === removalReason)?.label || removalReason;
    
    if (!reason) {
      toast.error('Please provide a reason for removal');
      return;
    }

    // Get the correct student ID
    const studentIdToRemove = selectedStudent.studentId?._id || 
                             selectedStudent.studentId || 
                             selectedStudent._id;

    if (!studentIdToRemove) {
      toast.error('Could not identify student ID');
      return;
    }

    setRemovingStudent(true);
    try {
      const response = await axiosInstance.delete(
        `/api/teacher/aptitude/test/${id}/students/${studentIdToRemove}`,
        {
          data: { 
            reason: reason,
            removedBy: 'teacher'
          }
        }
      );

      if (response.data.success) {
        toast.success('Student removed successfully');
        setShowRemoveModal(false);
        setSelectedStudent(null);
        setRemovalReason('');
        setCustomReason('');
        fetchTestDetails(); // Refresh the list
      }
    } catch (error) {
      console.error('Remove student error:', error);
      toast.error(error.response?.data?.message || 'Failed to remove student');
    } finally {
      setRemovingStudent(false);
    }
  };

  const regenerateJoinCode = async () => {
    if (!window.confirm('Regenerating join code will make the old code invalid. Continue?')) {
      return;
    }

    try {
      const response = await axiosInstance.post(`/api/teacher/aptitude/test/${id}/regenerate-code`);
      if (response.data.success) {
        toast.success('New join code generated!');
        fetchTestDetails();
      }
    } catch (error) {
      toast.error('Failed to regenerate code');
    }
  };

  const handleDeleteTest = async () => {
    if (!window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/api/teacher/aptitude/test/${id}`);
      if (response.data.success) {
        toast.success('Test deleted successfully');
        navigate('/teacher/dashboard');
      }
    } catch (error) {
      toast.error('Failed to delete test');
    }
  };

  const getStatusColor = (status, attemptStatus) => {
    if (status === 'removed') return 'bg-red-600';
    if (attemptStatus === 'completed') return 'bg-green-600';
    if (attemptStatus === 'in_progress') return 'bg-blue-600';
    if (status === 'active') return 'bg-yellow-600';
    return 'bg-gray-600';
  };

  const getStatusText = (student) => {
    if (student.status === 'removed') return 'Removed';
    if (student.attemptStatus === 'completed') return 'Completed';
    if (student.attemptStatus === 'in_progress') return 'In Progress';
    if (student.status === 'active') return 'Not Started';
    return student.status || 'Pending';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'removed': return <FiUserX className="text-red-400" />;
      case 'completed': return <FiCheckCircle className="text-green-400" />;
      case 'in_progress': return <FiClock className="text-blue-400" />;
      default: return <FiUserCheck className="text-yellow-400" />;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date) => {
    if (!date) return 'Not scheduled';
    return new Date(date).toLocaleString();
  };

  const canRemoveStudent = (student) => {
    // Can't remove students who have already completed
    return student.attemptStatus !== 'completed' && student.status !== 'removed';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Test not found</p>
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="bg-blue-600 px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Safe access to students array
  const students = test.allowedStudents || [];
  const completedStudents = students.filter(s => s.attemptStatus === 'completed').length;
  const activeStudents = students.filter(s => s.attemptStatus === 'in_progress').length;
  const notStartedStudents = students.filter(s => s.status === 'active' && s.attemptStatus === 'not_started').length;
  const removedStudents = students.filter(s => s.status === 'removed').length;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Success Message for New Test */}
        {showJoinCodeMessage && (
          <div className="mb-6 bg-green-600/20 border border-green-600 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiCheckCircle className="text-green-400 text-xl" />
              <p className="text-green-400">Test created successfully! Share this join code with your students.</p>
            </div>
            <button
              onClick={() => setShowJoinCodeMessage(false)}
              className="text-gray-400 hover:text-white"
            >
              <FiXCircle />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/teacher/dashboard')}
              className="flex items-center text-blue-400 hover:text-blue-300 mr-4"
            >
              <FiArrowLeft className="mr-2" />
              Back
            </button>
            <h1 className="text-2xl font-bold">{test.title}</h1>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/teacher/aptitude/edit/${test._id}`)}
              className="flex items-center px-4 py-2 bg-yellow-600/20 border border-yellow-600 rounded-lg hover:bg-yellow-600/40"
            >
              <FiEdit className="mr-2" /> Edit
            </button>
            <button
              onClick={() => navigate(`/teacher/aptitude/${test._id}/stats`)}
              className="flex items-center px-4 py-2 bg-purple-600/20 border border-purple-600 rounded-lg hover:bg-purple-600/40"
            >
              <FiBarChart2 className="mr-2" /> Statistics
            </button>
            <button
              onClick={handleDeleteTest}
              className="flex items-center px-4 py-2 bg-red-600/20 border border-red-600 rounded-lg hover:bg-red-600/40"
            >
              <FiTrash2 className="mr-2" /> Delete
            </button>
          </div>
        </div>

        {/* Join Code Card */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-600 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Test Join Code</p>
              <div className="flex items-center gap-3">
                <code className="text-4xl font-mono text-yellow-400">{test.joinCode}</code>
                <button
                  onClick={copyJoinCode}
                  className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  title="Copy join code"
                >
                  <FiCopy size={20} />
                </button>
              </div>
            </div>
            <button
              onClick={regenerateJoinCode}
              className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <FiRefreshCw size={16} /> Regenerate
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Share this code with students to join the test
          </p>
        </div>

        {/* Schedule Information */}
        {test.schedule?.isScheduled && (
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FiCalendar className="text-blue-400" /> Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Start Date & Time</p>
                <p className="font-medium">
                  {formatDateTime(test.schedule.startDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">End Date & Time</p>
                <p className="font-medium">
                  {formatDateTime(test.schedule.endDate)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Test Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Questions</div>
            <div className="text-2xl font-bold">{test.totalQuestions || 0}</div>
          </div>
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Duration</div>
            <div className="text-2xl font-bold">{test.timeLimit} min</div>
          </div>
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Total Marks</div>
            <div className="text-2xl font-bold">{test.totalMarks || 0}</div>
          </div>
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Students</div>
            <div className="text-2xl font-bold">{students.length}</div>
          </div>
        </div>

        {/* Student Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-900/20 border border-yellow-600 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Not Started</p>
                <p className="text-3xl font-bold text-yellow-400">{notStartedStudents}</p>
              </div>
              <FiUserCheck className="text-yellow-400 text-3xl" />
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-600 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-blue-400">{activeStudents}</p>
              </div>
              <FiClock className="text-blue-400 text-3xl" />
            </div>
          </div>

          <div className="bg-green-900/20 border border-green-600 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-400">{completedStudents}</p>
              </div>
              <FiCheckCircle className="text-green-400 text-3xl" />
            </div>
          </div>

          <div className="bg-red-900/20 border border-red-600 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Removed</p>
                <p className="text-3xl font-bold text-red-400">{removedStudents}</p>
              </div>
              <FiUserX className="text-red-400 text-3xl" />
            </div>
          </div>
        </div>

        {/* Students Section */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <FiUsers className="mr-2" /> Students ({students.length})
            </h2>
            <div className="flex gap-3">
              {test.removalHistory?.length > 0 && (
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="flex items-center px-3 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <FiInfo className="mr-2" /> Removal History
                </button>
              )}
              <button
                onClick={() => setShowAddStudents(true)}
                className="flex items-center px-3 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="mr-2" /> Add Students
              </button>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-12">
              <FiUserX className="text-4xl text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No students added yet</p>
              <p className="text-sm text-gray-500 mt-1">Share the join code or add students manually</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Joined</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Score</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                {students.map((student, idx) => {
                  const studentName = student.studentId?.name || student.name || 'N/A';
                  const studentEmail = student.studentId?.email || student.email || 'N/A';
                  const studentId = student.studentId?._id || student.studentId || student._id;
                  
                  return (
                    <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/30">
                      <td className="px-4 py-2">{studentName}</td>
                      <td className="px-4 py-2">{studentEmail}</td>
                      <td className="px-4 py-2">{formatDate(student.addedAt)}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(student.status === 'removed' ? 'removed' : student.attemptStatus)}
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(student.status, student.attemptStatus)}`}>
                            {getStatusText(student)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        {student.score ? `${student.score}/${test.totalMarks}` : '-'}
                      </td>
                      <td className="px-4 py-2">
                        {canRemoveStudent(student) && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Remove button clicked for student:', student);
                              setSelectedStudent(student);
                              setShowRemoveModal(true);
                            }}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-colors"
                            title="Remove Student"
                          >
                            <FiUserMinus size={18} />
                          </button>
                        )}
                        {student.status === 'removed' && student.removalReason && (
                          <div 
                            className="text-xs text-red-400 cursor-help" 
                            title={student.removalReason}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FiAlertCircle className="inline mr-1" />
                            Removed
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Remove Student Modal */}
        {showRemoveModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-red-600/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-600/20 rounded-lg">
                  <FiAlertCircle className="text-red-400 text-xl" />
                </div>
                <h3 className="text-xl font-semibold">Remove Student</h3>
              </div>
              
              <p className="text-gray-300 mb-4">
                Are you sure you want to remove <span className="font-semibold text-white">
                  {selectedStudent.studentId?.name || selectedStudent.name}
                </span> from this test?
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Reason for Removal</label>
                  <select
                    value={removalReason}
                    onChange={(e) => setRemovalReason(e.target.value)}
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                  >
                    <option value="">Select a reason</option>
                    {REMOVAL_REASONS.map(reason => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {removalReason === 'other' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Specify Reason</label>
                    <textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                      rows="3"
                      placeholder="Enter reason..."
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleRemoveStudent}
                  disabled={removingStudent || !removalReason}
                  className="flex-1 bg-red-600 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {removingStudent ? 'Removing...' : 'Remove Student'}
                </button>
                <button
                  onClick={() => {
                    setShowRemoveModal(false);
                    setSelectedStudent(null);
                    setRemovalReason('');
                    setCustomReason('');
                  }}
                  className="flex-1 bg-gray-700 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Removal History Modal */}
        {showHistoryModal && test.removalHistory && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <FiInfo className="text-blue-400" />
                  Removal History
                </h3>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiXCircle size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {test.removalHistory.map((record, index) => (
                  <div key={index} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-white">{record.studentName}</h4>
                        <p className="text-sm text-gray-400">{record.studentEmail}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(record.removedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-gray-400">Reason:</span>
                      <span className="text-red-400 ml-2">{record.reason}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Removed by: {record.removedBy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Students Modal */}
        {showAddStudents && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Add Students</h3>
              <p className="text-sm text-gray-400 mb-2">
                Enter email addresses separated by commas
              </p>
              <textarea
                value={studentEmails}
                onChange={(e) => setStudentEmails(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 mb-4"
                rows="4"
                placeholder="student1@example.com, student2@example.com"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleAddStudents}
                  disabled={addingStudents}
                  className="flex-1 bg-blue-600 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {addingStudents ? 'Adding...' : 'Add Students'}
                </button>
                <button
                  onClick={() => setShowAddStudents(false)}
                  className="flex-1 bg-gray-700 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TestDetails;