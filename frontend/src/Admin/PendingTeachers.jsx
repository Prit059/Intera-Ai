// pages/admin/PendingTeachers.jsx
import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiEye, FiClock } from 'react-icons/fi';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { AdNavbar } from './AdImport/Adimportfile';

const PendingTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchPendingTeachers();
  }, []);

  const fetchPendingTeachers = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/admin/teachers/pending');
      setTeachers(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch pending teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (teacherId) => {
    if (!window.confirm('Are you sure you want to approve this teacher?')) return;
    
    try {
      const response = await axiosInstance.post(`/api/auth/admin/teachers/approve/${teacherId}`);
      if (response.data.success) {
        toast.success('Teacher approved successfully');
        fetchPendingTeachers();
      }
    } catch (error) {
      toast.error('Failed to approve teacher');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const response = await axiosInstance.post(
        `/api/auth/admin/teachers/reject/${selectedTeacher._id}`,
        { reason: rejectionReason }
      );
      if (response.data.success) {
        toast.success('Teacher rejected');
        setShowRejectModal(false);
        setSelectedTeacher(null);
        setRejectionReason('');
        fetchPendingTeachers();
      }
    } catch (error) {
      toast.error('Failed to reject teacher');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className='bg-black min-h-screen'>
      <AdNavbar />
    <div className="p-6 bg-black min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Pending Teacher Approvals</h1>
      
      {teachers.length === 0 ? (
        <div className="bg-gray-800/50 rounded-lg p-8 text-center">
          <FiClock className="text-4xl text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No pending teacher registrations</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {teachers.map((teacher) => (
            <div key={teacher._id} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{teacher.name}</h3>
                  <p className="text-gray-400">{teacher.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(teacher._id)}
                    className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors"
                    title="Approve"
                  >
                    <FiCheck size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTeacher(teacher);
                      setShowRejectModal(true);
                    }}
                    className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                    title="Reject"
                  >
                    <FiX size={20} />
                  </button>
                  <button
                    onClick={() => setSelectedTeacher(selectedTeacher?._id === teacher._id ? null : teacher)}
                    className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                    title="View Details"
                  >
                    <FiEye size={20} />
                  </button>
                </div>
              </div>

              {selectedTeacher?._id === teacher._id && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">College</p>
                      <p className="text-white">{teacher.teacherProfile.college}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Department</p>
                      <p className="text-white">{teacher.teacherProfile.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Qualification</p>
                      <p className="text-white">{teacher.teacherProfile.qualification}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Experience</p>
                      <p className="text-white">{teacher.teacherProfile.experience} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="text-white">{teacher.teacherProfile.phoneNumber || 'N/A'}</p>
                    </div>
                    {teacher.teacherProfile.subjects?.length > 0 && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-400 mb-2">Subjects</p>
                        <div className="flex flex-wrap gap-2">
                          {teacher.teacherProfile.subjects.map((subject, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-700 rounded-full text-sm text-white">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Reject Teacher Application</h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to reject <span className="font-semibold text-white">{selectedTeacher?.name}</span>?
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white mb-4"
              rows="3"
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm Reject
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedTeacher(null);
                  setRejectionReason('');
                }}
                className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
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
};

export default PendingTeachers;