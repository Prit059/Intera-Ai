import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import axiosInstance from '../../utils/axiosInstance';
import { getPasswordStrength } from '../../utils/helper';
import toast from 'react-hot-toast';

const TeacherChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordStrength, setPasswordStrength] = useState({ strength: "none", score: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);

  // Check if user is logged in and is teacher
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'teacher') {
      navigate('/login');
    }
  }, [navigate]);

  // Update password strength
  useEffect(() => {
    setPasswordStrength(getPasswordStrength(formData.newPassword));
    validateNewPassword(formData.newPassword);
  }, [formData.newPassword]);

  const validateNewPassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("One number");
    if (!/[!@#$%^&*]/.test(password)) errors.push("One special character (!@#$%^&*)");
    setPasswordErrors(errors);
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      case 'very strong': return 'bg-green-600';
      default: return 'bg-gray-300';
    }
  };

  const getStrengthText = (strength) => {
    switch (strength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      case 'very strong': return 'Very Strong';
      default: return 'None';
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordErrors.length > 0) {
      toast.error("Please meet all password requirements");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/api/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (response.data.success) {
        // Update token in localStorage
        localStorage.setItem('token', response.data.token);
        
        toast.success("Password changed successfully!");
        
        // Redirect to teacher dashboard after 2 seconds
        setTimeout(() => {
          navigate('/teacher/dashboard');
        }, 1000);
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLock className="text-orange-500 text-4xl" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Change Password</h1>
          <p className="text-gray-400">
            You're using a temporary password. Please set a new password to continue.
          </p>
        </div>

        {/* Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-gray-300 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white pr-12 focus:outline-none focus:border-orange-500"
                  placeholder="Enter your current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.current ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-gray-300 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white pr-12 focus:outline-none focus:border-orange-500"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.new ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Password Strength:</span>
                    <span className={`text-sm font-medium ${
                      passwordStrength.strength === 'weak' ? 'text-red-400' :
                      passwordStrength.strength === 'medium' ? 'text-yellow-400' :
                      passwordStrength.strength === 'strong' ? 'text-green-400' :
                      passwordStrength.strength === 'very strong' ? 'text-green-500' : 'text-gray-400'
                    }`}>
                      {getStrengthText(passwordStrength.strength)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.strength)}`}
                      style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                    ></div>
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-gray-700/50 rounded-lg p-3 mt-2">
                    <p className="text-xs text-gray-400 mb-2">Password must contain:</p>
                    <ul className="space-y-1">
                      {[
                        { text: "At least 8 characters", test: formData.newPassword.length >= 8 },
                        { text: "One uppercase letter (A-Z)", test: /[A-Z]/.test(formData.newPassword) },
                        { text: "One lowercase letter (a-z)", test: /[a-z]/.test(formData.newPassword) },
                        { text: "One number (0-9)", test: /[0-9]/.test(formData.newPassword) },
                        { text: "One special character (!@#$%^&*)", test: /[!@#$%^&*]/.test(formData.newPassword) }
                      ].map((req, index) => (
                        <li key={index} className="flex items-center gap-2 text-xs">
                          {req.test ? (
                            <FiCheckCircle className="text-green-400" size={12} />
                          ) : (
                            <FiAlertCircle className="text-gray-500" size={12} />
                          )}
                          <span className={req.test ? "text-green-400" : "text-gray-400"}>
                            {req.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-gray-300 mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white pr-12 focus:outline-none focus:border-orange-500"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.confirm ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2">
                  {formData.newPassword === formData.confirmPassword ? (
                    <p className="text-green-400 text-xs flex items-center gap-1">
                      <FiCheckCircle size={12} />
                      Passwords match
                    </p>
                  ) : (
                    <p className="text-red-400 text-xs flex items-center gap-1">
                      <FiAlertCircle size={12} />
                      Passwords do not match
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (formData.confirmPassword && formData.newPassword !== formData.confirmPassword)}
              className="w-full py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Changing Password...
                </div>
              ) : (
                'Change Password'
              )}
            </button>

            {/* Info Box */}
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-300 flex items-start gap-2">
                <FiAlertCircle className="flex-shrink-0 mt-0.5" />
                <span>
                  For security reasons, you're required to change your temporary password. 
                  Choose a strong password that you haven't used before.
                </span>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherChangePassword;