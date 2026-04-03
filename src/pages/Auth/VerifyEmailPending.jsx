// pages/VerifyEmailPending.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiCheckCircle, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import axiosInstance from '../../utils/axiosInstance';

const VerifyEmailPending = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('idle'); // idle, loading, success, error
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    // Get email from location state or localStorage
    const pendingEmail = location.state?.email || localStorage.getItem('pendingVerificationEmail');
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      // If no email, redirect to signup
      navigate('/signup');
    }
  }, [location, navigate]);

  const handleResendEmail = async () => {
    if (!email) return;
    
    setResendStatus('loading');
    setResendMessage('');
    
    try {
      const response = await axiosInstance.post('/api/auth/resend-verification', { email });
      
      if (response.data.success) {
        setResendStatus('success');
        setResendMessage('Verification email resent! Please check your inbox.');
      } else {
        setResendStatus('error');
        setResendMessage(response.data.message || 'Failed to resend email');
      }
    } catch (error) {
      setResendStatus('error');
      setResendMessage(error.response?.data?.message || 'Failed to resend verification email');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 text-center"
      >
        {/* Icon */}
        <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiMail className="text-orange-400 text-4xl" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-4">Verify Your Email</h2>
        
        {/* Message */}
        <p className="text-gray-300 mb-4">
          We've sent a verification email to:
        </p>
        <p className="text-orange-400 font-medium mb-6 break-all">
          {email}
        </p>
        
        <p className="text-gray-400 text-sm mb-6">
          Please check your inbox and click the verification link to activate your account.
          If you don't see the email, check your spam folder.
        </p>

        {/* Resend Section */}
        <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
          <p className="text-gray-300 text-sm mb-3">
            Didn't receive the email?
          </p>
          <button
            onClick={handleResendEmail}
            disabled={resendStatus === 'loading'}
            className="w-full py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {resendStatus === 'loading' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <FiRefreshCw />
                <span>Resend Verification Email</span>
              </>
            )}
          </button>
          
          {resendMessage && (
            <p className={`text-sm mt-2 ${
              resendStatus === 'success' ? 'text-green-400' : 'text-red-400'
            }`}>
              {resendMessage}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/login"
            className="block w-full py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Go to Login
          </Link>
          
          <Link
            to="/signup"
            className="block w-full py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <FiArrowLeft />
            Back to Sign Up
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-gray-500 text-xs mt-6">
          The verification link expires in 24 hours. If you still have issues, please contact support.
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPending;