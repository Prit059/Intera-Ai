// pages/TeacherRegistrationSuccess.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiCheckCircle, FiClock } from 'react-icons/fi';

const TeacherRegistrationSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 text-center"
      >
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle className="text-green-400 text-4xl" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">Registration Submitted!</h2>
        
        <p className="text-gray-300 mb-6">
          Thank you for registering as a teacher. Your application has been received and is pending admin approval.
        </p>
        
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <FiMail className="text-blue-400 text-xl flex-shrink-0 mt-1" />
            <div className="text-left">
              <p className="text-blue-400 font-medium mb-1">Check your email</p>
              <p className="text-gray-300 text-sm">
                We've sent a confirmation email. You'll receive another email with login credentials once your account is approved.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <FiClock className="text-yellow-400 text-xl flex-shrink-0 mt-1" />
            <div className="text-left">
              <p className="text-yellow-400 font-medium mb-1">What happens next?</p>
              <ul className="text-gray-300 text-sm list-disc list-inside">
                <li>Admin reviews your application (24-48 hours)</li>
                <li>You'll receive email with login credentials</li>
                <li>Login and change your password</li>
                <li>Start creating aptitude tests!</li>
              </ul>
            </div>
          </div>
        </div>
        
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
        >
          Return to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default TeacherRegistrationSuccess;