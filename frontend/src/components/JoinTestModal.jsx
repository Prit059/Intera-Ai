// components/JoinTestModal.jsx
import React, { useState } from 'react';
import { FiX, FiLogIn, FiClock, FiBook, FiAward } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';

const JoinTestModal = ({ isOpen, onClose, onSuccess }) => {
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [testPreview, setTestPreview] = useState(null);
  const [step, setStep] = useState('input'); // input, preview

  const handleVerifyCode = async () => {
    if (!joinCode.trim()) {
      toast.error('Please enter a join code');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/student/aptitude/join/${joinCode.toUpperCase()}`);
      
      if (response.data.success) {
        setTestPreview(response.data.data);
        setStep('preview');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid join code');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTest = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/student/aptitude/join', {
        joinCode: joinCode.toUpperCase()
      });

      if (response.data.success) {
        toast.success('Test joined successfully!');
        onSuccess(response.data.data);
        onClose();
        // Reset state
        setJoinCode('');
        setTestPreview(null);
        setStep('input');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join test');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setJoinCode('');
    setTestPreview(null);
    setStep('input');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Join Test with Code</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'input' ? (
            // Step 1: Enter Code
            <div>
              <p className="text-gray-400 mb-4">
                Enter the join code provided by your teacher
              </p>
              
              <div className="mb-6">
                <label className="block text-sm text-gray-300 mb-2">
                  Join Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g., X7K9M2"
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-2xl font-mono uppercase"
                  maxLength="10"
                  autoFocus
                />
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={loading || !joinCode.trim()}
                className="w-full py-3 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <FiLogIn /> Verify Code
                  </>
                )}
              </button>
            </div>
          ) : (
            // Step 2: Test Preview
            testPreview && (
              <div>
                <div className="bg-green-600/20 border border-green-600 rounded-lg p-4 mb-6">
                  <p className="text-green-400 text-center">✓ Code verified successfully!</p>
                </div>

                {/* Test Preview Card */}
                <div className="bg-gray-700/30 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold text-white mb-3">{testPreview.title}</h3>
                  
                  {testPreview.description && (
                    <p className="text-gray-400 text-sm mb-4">{testPreview.description}</p>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-2">
                        <FiBook /> Questions:
                      </span>
                      <span className="text-white font-semibold">{testPreview.totalQuestions}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-2">
                        <FiClock /> Duration:
                      </span>
                      <span className="text-white font-semibold">{testPreview.timeLimit} minutes</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-2">
                        <FiAward /> Total Marks:
                      </span>
                      <span className="text-white font-semibold">{testPreview.totalMarks}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Difficulty:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        testPreview.difficulty === 'Easy' ? 'bg-green-600' :
                        testPreview.difficulty === 'Medium' ? 'bg-yellow-600' :
                        testPreview.difficulty === 'Hard' ? 'bg-orange-600' : 'bg-red-600'
                      }`}>
                        {testPreview.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Schedule if available */}
                  {testPreview.schedule?.isScheduled && (
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <p className="text-sm text-gray-400 mb-2">Schedule:</p>
                      <p className="text-xs text-gray-300">
                        Starts: {new Date(testPreview.schedule.startDate).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-300">
                        Ends: {new Date(testPreview.schedule.endDate).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('input')}
                    className="flex-1 py-3 bg-gray-700 rounded-lg text-white font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleJoinTest}
                    disabled={loading}
                    className="flex-1 py-3 bg-green-600 rounded-lg text-white font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Joining...' : 'Join Test'}
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-900/50 rounded-b-xl">
          <p className="text-xs text-gray-500 text-center">
            Ask your teacher for the join code. Each test has a unique code.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinTestModal;