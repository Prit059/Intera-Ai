// pages/VerifyEmail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiMail, FiRefreshCw } from 'react-icons/fi';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error, already_verified
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        console.log("Verifying email with token:", token);
        const response = await axiosInstance.get(API_PATHS.AUTH.VERIFY_EMAIL(token));
        
        console.log("Verification response:", response.data);
        
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message || 'Email verified successfully!');
          
          // Update local storage user data if exists
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            user.emailverified = true;
            localStorage.setItem('user', JSON.stringify(user));
          }
          
          toast.success('Email verified! Redirecting to login...');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Verification failed');
        }
      } catch (error) {
        console.error("Verification error:", error.response?.data);
        
        // Check if the error is because email is already verified
        if (error.response?.data?.message?.toLowerCase().includes('already verified')) {
          setStatus('already_verified');
          setMessage('Your email is already verified. You can login now.');
        } else {
          setStatus('error');
          setMessage(error.response?.data?.message || 'Invalid or expired verification link');
        }
      }
    };

    verifyEmail();
  }, [token, navigate]);

  const handleResendVerification = async () => {
    try {
      // Try to get email from stored user or prompt
      const storedUser = localStorage.getItem('user');
      let userEmail = '';
      
      if (storedUser) {
        const user = JSON.parse(storedUser);
        userEmail = user.email;
      } else {
        // You might want to show a modal to ask for email
        userEmail = prompt('Please enter your email address:');
        if (!userEmail) return;
      }
      
      const response = await axiosInstance.post('/api/auth/resend-verification', { email: userEmail });
      
      if (response.data.success) {
        toast.success('Verification email resent! Please check your inbox.');
        setMessage('A new verification email has been sent. Please check your inbox.');
      } else {
        toast.error(response.data.message || 'Failed to resend email');
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error(error.response?.data?.message || 'Failed to resend verification email');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 text-center"
      >
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiMail className="text-blue-400 text-4xl animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Verifying Email...</h2>
            <p className="text-gray-400">Please wait while we verify your email address.</p>
            <div className="mt-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="text-green-400 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Email Verified!</h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <p className="text-gray-400 text-sm">Redirecting to login...</p>
            <Link
              to="/login"
              className="inline-block mt-4 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Go to Login Now
            </Link>
          </>
        )}

        {status === 'already_verified' && (
          <>
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="text-yellow-400 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Already Verified</h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle className="text-red-400 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Verification Failed</h2>
            <p className="text-gray-300 mb-4">{message}</p>
            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                <FiRefreshCw />
                Resend Verification Email
              </button>
              <Link
                to="/login"
                className="block w-full px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors text-center"
              >
                Go to Login
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;