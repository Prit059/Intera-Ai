import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { Link } from 'react-router-dom';
import CardSwap, { Card } from '../../components/CardSwap';
import { motion, AnimatePresence } from 'framer-motion';
import TextType from '../../components/TextType';
import questionImg from "../images/question.png";
import questionGenImg from "../images/question-gen.png";
import roadmapImg from "../images/roadmap.png";
import aptitudeImg from "../images/aptitude.png";
import { toast } from 'react-hot-toast';
import { FiUser, FiPhone, FiCheckCircle, FiMail, FiHome } from 'react-icons/fi';

function SignUp({ setCurrentPage }) {
  // Common state
  const [userType, setUserType] = useState('student'); // 'student' or 'teacher'
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  // Student form state (with password)
  const [studentForm, setStudentForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Teacher form state (NO PASSWORD FIELDS)
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    college: '',
    department: '',
    qualification: '',
    experience: '',
    phoneNumber: '',
  });

  const handleStudentChange = (e) => {
    setStudentForm({
      ...studentForm,
      [e.target.name]: e.target.value
    });
  };

  const handleTeacherChange = (e) => {
    setTeacherForm({
      ...teacherForm,
      [e.target.name]: e.target.value
    });
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!studentForm.firstname || !studentForm.lastname || !studentForm.email || !studentForm.password || !studentForm.confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (studentForm.password !== studentForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!validateEmail(studentForm.email)) {
      toast.error("Please enter a valid Email ID.");
      return;
    }

    if (studentForm.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        firstname: studentForm.firstname,
        lastname: studentForm.lastname,
        email: studentForm.email,
        password: studentForm.password,
      });

      console.log("Registration response:", response.data);

      // Check if registration was successful
      if (response.data.success) {
        // Clear the form
        setStudentForm({
          firstname: '',
          lastname: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        
        // Store email for the success page
        localStorage.setItem('pendingVerificationEmail', studentForm.email);
        
        // Show success message
        toast.success('Registration successful! Please check your email for verification.');
        
        // Navigate to verification pending page
        navigate('/verify-email-pending', { 
          state: { email: studentForm.email } 
        });
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error('Signup error:', err.response?.data);
      
      if (err.response?.data?.message === 'User already exists') {
        toast.error('User already exists. Please login instead.');
        navigate('/login');
      } else {
        const errorMsg = err.response?.data?.message || "Signup failed. Please try again.";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

const handleTeacherSubmit = async (e) => {
  e.preventDefault();

  // Validation checks
  if (!teacherForm.name || !teacherForm.email || 
      !teacherForm.college || !teacherForm.department || !teacherForm.qualification || 
      !teacherForm.experience) {
    toast.error("Please fill in all required fields.");
    return;
  }

  if (!validateEmail(teacherForm.email)) {
    toast.error("Please enter a valid Email ID.");
    return;
  }

  setError("");
  setIsLoading(true);

  try {
    // Generate a random password for teacher
    // This will be temporary - they will change it on first login
    const generateTempPassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
      let password = '';
      for (let i = 0; i < 10; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const tempPassword = generateTempPassword();
    
    // Split name into firstname and lastname
    const nameParts = teacherForm.name.trim().split(' ');
    const firstname = nameParts[0] || '';
    const lastname = nameParts.slice(1).join(' ') || '';

    // Prepare data according to backend expectations
    const teacherData = {
      firstname: firstname,
      lastname: lastname,
      email: teacherForm.email.trim().toLowerCase(),
      password: tempPassword, // Backend requires password
      college: teacherForm.college.trim(),
      department: teacherForm.department,
      qualification: teacherForm.qualification.trim(),
      experience: parseInt(teacherForm.experience) || 0,
      phoneNumber: teacherForm.phoneNumber?.trim() || ""
    };

    console.log("Sending teacher registration data:", { ...teacherData, password: '[HIDDEN]' });

    const response = await axiosInstance.post('/api/auth/teacher/register', teacherData);

    console.log("Teacher registration response:", response.data);

    if (response.data.success) {
      // Store the temporary password (you might want to show it to the user)
      // For security, you could also email it to them
      toast.success(response.data.message || "Registration submitted successfully! Please check your email for verification.");
      
      // Clear form
      setTeacherForm({
        name: '',
        email: '',
        college: '',
        department: '',
        qualification: '',
        experience: '',
        phoneNumber: '',
      });
      
      // Navigate to success page or show temporary password
      navigate('/teacher/registration-success', { 
        state: { 
          email: teacherForm.email,
          tempPassword: tempPassword // Only if you want to show it
        } 
      });
    } else {
      toast.error(response.data.message || "Registration failed");
    }
  } catch (err) {
    console.error('Teacher signup error:', err.response?.data);
    
    let errorMessage = "Registration failed. Please try again.";
    
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.response?.data?.errors) {
      const errors = err.response.data.errors;
      errorMessage = Object.values(errors).join(", ");
    }
    
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

  // 4 Cards for CardSwap
  const cardContent = [
    {
      title: "Interview Prep Q&A",
      description: "Practice with AI that thinks like a real interviewer",
      features: ["Real-time feedback", "Voice enabled", "Multiple scenarios"],
      icon: "🤖",
      color: "from-orange-500 to-red-500",
      image: questionImg,
    },
    {
      title: "AI Interview Question Generator",
      description: "Smart questions tailored to your role",
      features: ["Role specific", "Difficulty based", "Trending topics"],
      icon: "❓",
      color: "from-blue-500 to-cyan-500",
      image: questionGenImg
    },
    {
      title: "AI Roadmap Creator",
      description: "Personalized learning paths to mastery",
      features: ["Step by step", "Resources", "Track progress"],
      icon: "🗺️",
      color: "from-purple-500 to-pink-500",
      image: roadmapImg
    },
    {
      title: "Aptitude Contest",
      description: "Dynamic quizzes that identify weak areas",
      features: ["Adaptive difficulty", "Topic wise", "Performance analysis"],
      icon: "🎮",
      color: "from-green-500 to-emerald-500",
      image: aptitudeImg
    }
  ];

  return (
    <div className="min-h-screen flex overflow-hidden bg-white">
      {/* Left Side - Sign Up Form (40%) - White Background */}
      <div className="w-[40%] bg-white flex items-start justify-center p-8 relative overflow-y-auto" style={{ maxHeight: '100vh' }}>
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-50 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-100 rounded-full filter blur-3xl opacity-30"></div>
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10 py-6"
        >
          {/* Logo */}
          <div className="mb-1">
            <h1 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-orange-900 to-orange-600 bg-clip-text text-transparent">
                Intera.
              </span>
              <span className="text-gray-900">AI</span>
            </h1>
            <p className="text-gray-500 text-lg mt-1">Your AI Placement Partner.</p>
          </div>

          {/* Form Container */}
          <div className="bg-gray-700/10 rounded-3xl p-6 shadow-2xl shadow-gray-600/60 border border-gray-400/60">
            {/* Header with Role Toggle */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              
              {/* Role Toggle */}
              <div className="flex mt-6 bg-gray-200 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setUserType('student')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    userType === 'student' 
                      ? 'bg-white text-orange-600 shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('teacher')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    userType === 'teacher' 
                      ? 'bg-white text-orange-600 shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Teacher
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                {error}
              </div>
            )}

            {/* Animated Form Switching */}
            <AnimatePresence mode="wait">
              {userType === 'student' ? (
                <motion.form
                  key="student-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleStudentSubmit}
                  className="space-y-5"
                >
                  {/* Student Form with Password */}
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="First Name"
                      type="text"
                      name="firstname"
                      placeholder="Shyam"
                      value={studentForm.firstname}
                      onChange={handleStudentChange}
                      labelClassName="text-gray-700 font-medium text-sm"
                      inputClassName="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900 placeholder-gray-400"
                      required
                    />
                    <Input
                      label="Last Name"
                      type="text"
                      name="lastname"
                      placeholder="Patel"
                      value={studentForm.lastname}
                      onChange={handleStudentChange}
                      labelClassName="text-gray-700 font-medium text-sm"
                      inputClassName="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900 placeholder-gray-400"
                      required
                    />
                  </div>

                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={studentForm.email}
                    onChange={handleStudentChange}
                    labelClassName="text-gray-700 font-medium text-sm"
                    inputClassName="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900 placeholder-gray-400"
                    required
                  />

                  <Input
                    label="Password"
                    type="password"
                    name="password"
                    placeholder="Minimum 8 characters"
                    value={studentForm.password}
                    onChange={handleStudentChange}
                    labelClassName="text-gray-700 font-medium text-sm"
                    inputClassName="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900 placeholder-gray-400"
                    required
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={studentForm.confirmPassword}
                    onChange={handleStudentChange}
                    labelClassName="text-gray-700 font-medium text-sm"
                    inputClassName="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900 placeholder-gray-400"
                    required
                  />

                  {studentForm.confirmPassword && studentForm.password !== studentForm.confirmPassword && (
                    <div className="text-red-500 text-xs">
                      Passwords do not match
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-lg shadow-orange-500/25 mt-2"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Creating Account...</span>
                      </div>
                    ) : 'Sign Up as Student'}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="teacher-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleTeacherSubmit}
                  className="space-y-4"
                >
                  {/* Teacher Form - NO PASSWORD FIELDS */}
                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-1">Full Name *</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={teacherForm.name}
                        onChange={handleTeacherChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900 placeholder-gray-400"
                        placeholder="Dr. John Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-1">Email Address *</label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={teacherForm.email}
                        onChange={handleTeacherChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900 placeholder-gray-400"
                        placeholder="teacher@college.edu"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-1">College/University *</label>
                    <div className="relative">
                      <FiHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="college"
                        value={teacherForm.college}
                        onChange={handleTeacherChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900 placeholder-gray-400"
                        placeholder="Stanford University"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-medium text-sm mb-1">Department *</label>
                      <select
                        name="department"
                        value={teacherForm.department}
                        onChange={handleTeacherChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900"
                        required
                      >
                        <option value="">Select</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Engineering">Engineering</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium text-sm mb-1">Experience (Years) *</label>
                      <input
                        type="number"
                        name="experience"
                        value={teacherForm.experience}
                        onChange={handleTeacherChange}
                        min="0"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900"
                        placeholder="Years"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-1">Qualification *</label>
                    <input
                      type="text"
                      name="qualification"
                      value={teacherForm.qualification}
                      onChange={handleTeacherChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900"
                      placeholder="Ph.D. in Computer Science"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-1">Phone Number</label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={teacherForm.phoneNumber}
                        onChange={handleTeacherChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-lg shadow-orange-500/25 mt-2"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Submitting...</span>
                      </div>
                    ) : 'Register as Teacher'}
                  </button>

                  {/* Info Message about Password */}
                  <div className="bg-blue-50 p-3 rounded-xl text-xs text-blue-700">
                    <FiCheckCircle className="inline mr-1" />
                    <strong>No password needed!</strong> You'll receive login credentials via email after admin approval.
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Login Link */}
            <div className="text-center mt-6">
              <span className="text-gray-500 text-md">Already have an account? </span>
              <button
                type="button"
                onClick={() => setCurrentPage('login')}
                className="text-orange-500 hover:text-orange-600 font-semibold text-md"
              >
                <Link to="/login">Login</Link>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - CardSwap (60%) - Black Background */}
      <div className="w-[60%] bg-black relative overflow-hidden flex items-center justify-center">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Quote Overlay with TextType Animation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute top-7 left-5 z-20 text-left"
        >
          <div className="text-5xl font-medium text-white/60">
            <TextType 
              text={["Your journey to"]}
              typingSpeed={50}
              pauseDuration={2000}
              showCursor={false}
              loop={false}
              initialDelay={500}
            />
          </div>
          
          <div className="text-7xl font-bold text-white mt-1">
            <TextType 
              text={["Interview Success"]}
              typingSpeed={50}
              pauseDuration={2000}
              showCursor={false}
              loop={false}
              initialDelay={1500}
            />
          </div>
          
          <div className="text-2xl text-orange-500 mt-2">
            <TextType 
              text={["Starts Here"]}
              typingSpeed={50}
              pauseDuration={2000}
              showCursor={true}
              cursorCharacter="_"
              cursorClassName="text-orange-500"
              loop={false}
              initialDelay={3000}
            />
          </div>
        </motion.div>

        {/* CardSwap Container - Centered */}
        <div className="relative w-full h-full flex items-center justify-center">
          <CardSwap
            width={620}
            height={550}
            cardDistance={70}
            verticalDistance={80}
            delay={4000}
            pauseOnHover={true}
            skewAmount={4}
            easing="elastic"
          >
            {cardContent.map((card, index) => (
              <Card key={index}>
                <div className="relative w-full h-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-white/10">
                  <img 
                    src={card.image} 
                    alt={card.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  
                  <div className="absolute inset-0">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/30 rounded-full animate-ping"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 2}s`,
                          animationDuration: `${2 + Math.random() * 3}s`
                        }}
                      />
                    ))}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">
                        {card.icon}
                      </div>
                      
                      <h3 className="text-3xl font-bold text-white mb-2">
                        {card.title}
                      </h3>
                      
                      <p className="text-white/70 mb-6 text-lg">
                        {card.description}
                      </p>

                      <div className="flex flex-wrap gap-3">
                        {card.features.map((feature, i) => (
                          <span 
                            key={i}
                            className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm border border-white/10"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
                </div>
              </Card>
            ))}
          </CardSwap>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
      </div>
    </div>
  );
}

export default SignUp;