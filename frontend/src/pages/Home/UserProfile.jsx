import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import NavBar from "../../components/layouts/Navbar";
import {
  FiUser, FiMail, FiBriefcase, FiAward, FiBook,
  FiGitBranch, FiLinkedin, FiGithub, FiGlobe,
  FiEdit, FiSave, FiX, FiPlus, FiBarChart2,
  FiClock, FiTrendingUp, FiTarget, FiDownload,
  FiHeart, FiCode, FiBookOpen, FiMapPin,
  FiCalendar, FiExternalLink, FiStar
} from "react-icons/fi";

const UserProfile = () => {
  const { user, clearUser, updateUser } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(user);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchRecentAttempts();
      fetchUserStats();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
      setUserData(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserData(user);
    }
  };

  const fetchRecentAttempts = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.ADAPTITUDE_ATTEMPTS.USER_ATTEMPTS);
      setRecentAttempts(response.data.data?.slice(0, 3) || []);
    } catch (error) {
      console.error("Error fetching attempts:", error);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Mock stats - replace with actual API calls
      setStats({
        totalQuizzes: 15,
        averageScore: 78,
        totalTimeSpent: 1250,
        skillsMastered: 12,
        completedAptitudes: 8,
        highestScore: 92
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await axiosInstance.put("/api/auth/profile", userData);
      updateUser(userData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    // localStorage.removeItem("token");
    clearUser();
    navigate("/login", { replace: true });
  };

  const addNewItem = (field) => {
    const newItem = getDefaultItem(field);
    setUserData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), newItem]
    }));
  };

  const removeItem = (field, index) => {
    setUserData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateItem = (field, index, key, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => 
        i === index ? { ...item, [key]: value } : item
      )
    }));
  };

  const getDefaultItem = (field) => {
    const defaults = {
      education: { school: "", degree: "", field: "", year: "", location: "" },
      experience: { company: "", position: "", duration: "", description: "", location: "" },
      skills: { name: "", level: "Intermediate" },
      projects: { title: "", description: "", link: "", tech: [], github: "", demo: "" },
      interests: { name: "", category: "" },
      certifications: { name: "", issuer: "", date: "", link: "" }
    };
    return defaults[field] || {};
  };

  const downloadResume = () => {
    // Generate or download resume
    alert("Resume download functionality would be implemented here");
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
        <NavBar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Profile Dashboard
          </h1>
          <div className="flex gap-4">
            <button
              onClick={downloadResume}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiDownload />
              Download Resume
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FiEdit />
              {isEditing ? 'Cancel Editing' : 'Edit Profile'}
            </button>
            {isEditing && (
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-600 rounded-lg hover:bg-blue-700/40 transition-colors"
              >
                <FiSave />
                Save Changes
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="text-center">
                <img
                  src={userData.profileImageUrl || "/default-avatar.png"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-blue-500"
                />
                <h2 className="text-2xl font-bold mb-2">{userData.name}</h2>
                <p className="text-gray-400 mb-4 flex items-center justify-center gap-2">
                  <FiMail className="text-blue-400" />
                  {userData.email}
                </p>
                
                {isEditing ? (
                  <input
                    type="text"
                    value={userData.title || ""}
                    onChange={(e) => setUserData({...userData, title: e.target.value})}
                    placeholder="Your title (e.g., Full Stack Developer)"
                    className="w-full p-3 mb-4 rounded-lg border border-gray-700 bg-gray-800 text-center"
                  />
                ) : (
                  userData.title && <p className="text-blue-400 font-semibold mb-6">{userData.title}</p>
                )}

                {/* Location */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 justify-center">
                    <FiMapPin className="text-green-400" />
                    Location
                  </h3>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData.location || ""}
                      onChange={(e) => setUserData({...userData, location: e.target.value})}
                      placeholder="Your location"
                      className="w-full p-2 rounded border border-gray-700 bg-gray-800 text-center"
                    />
                  ) : (
                    <p className="text-gray-300">{userData.location || "Not specified"}</p>
                  )}
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FiUser className="text-purple-400" />
                    About
                  </h3>
                  {isEditing ? (
                    <textarea
                      value={userData.bio || ""}
                      onChange={(e) => setUserData({...userData, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800"
                      rows="4"
                    />
                  ) : (
                    <p className="text-sm text-gray-300 text-center">{userData.bio || "No bio added yet."}</p>
                  )}
                </div>

                {/* Social Links */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FiGlobe className="text-yellow-400" />
                    Connect With Me
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: 'github', icon: FiGithub, label: 'GitHub', color: 'text-gray-300' },
                      { key: 'linkedin', icon: FiLinkedin, label: 'LinkedIn', color: 'text-blue-400' },
                      { key: 'portfolio', icon: FiGlobe, label: 'Portfolio', color: 'text-green-400' },
                      { key: 'leetcode', icon: FiCode, label: 'LeetCode', color: 'text-yellow-400' }
                    ].map(({ key, icon: Icon, label, color }) => {
                      const link = userData.links?.[key];
                      return isEditing ? (
                        
                        <input
                          key={key}
                          type="url"
                          placeholder={`Your ${label} URL`}
                          value={link || ""}
                          onChange={(e) => setUserData({
                            ...userData, 
                            links: {...userData.links, [key]: e.target.value}
                          })}
                          className="w-full p-2 rounded border border-gray-700 bg-gray-800 text-sm"
                        />
                      ) : link ? (
                        
                        <a
                          key={key}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                        >
                          <Icon className={`${color} text-lg`} />
                          <span>{label}</span>
                          <FiExternalLink className="text-gray-400 ml-auto" />
                        </a>
                      ) : 
                      <div className="flex">
                        <div>
                          <Icon className={`${color} text-lg inline-block mr-2`} />
                          <span className="text-gray-500">No {label} link</span>
                        </div>
                        <FiExternalLink className="text-gray-400 ml-auto" />

                      </div>;
                    })}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400">Quizzes Taken</span>
                    <span className="font-bold text-blue-400">{stats.totalQuizzes || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400">Avg Score</span>
                    <span className="font-bold text-green-400">{stats.averageScore || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400">Skills</span>
                    <span className="font-bold text-purple-400">{stats.skillsMastered || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Right Side */}
          <div className="lg:col-span-3">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: FiBarChart2, label: "Total Quizzes", value: stats.totalQuizzes, color: "blue" },
                { icon: FiTrendingUp, label: "Average Score", value: `${stats.averageScore}%`, color: "green" },
                { icon: FiClock, label: "Learning Hours", value: Math.floor((stats.totalTimeSpent || 0) / 60), color: "yellow" },
                { icon: FiTarget, label: "Skills Mastered", value: stats.skillsMastered, color: "purple" }
              ].map(({ icon: Icon, label, value, color }, index) => (
                <div key={index} className="bg-gray-900 rounded-2xl p-6 text-center border border-gray-800 hover:border-gray-700 transition-colors">
                  <Icon className={`text-${color}-400 text-2xl mx-auto mb-3`} />
                  <div className="text-2xl font-bold text-white mb-1">{value}</div>
                  <div className="text-gray-400 text-sm">{label}</div>
                </div>
              ))}
            </div>

            {/* Tabs Navigation */}
            <div className="bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-800">
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  'overview', 'education', 'experience', 'projects', 
                  'skills', 'interests', 'certifications', 'performance'
                ].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg capitalize transition-all ${
                      activeTab === tab 
                        ? 'bg-blue-600/20 border border-blue-600 text-white shadow-lg shadow-blue-500/25 cursor-pointer' 
                        : 'bg-gray-700/20 border border-gray-600 hover:bg-gray-700/40 cursor-pointer'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                  <OverviewTab 
                    userData={userData}
                    recentAttempts={recentAttempts}
                    stats={stats}
                  />
                )}

                {activeTab === 'education' && (
                  <EducationSection 
                    education={userData.education || []}
                    isEditing={isEditing}
                    onAdd={() => addNewItem('education')}
                    onRemove={(index) => removeItem('education', index)}
                    onUpdate={(index, field, value) => updateItem('education', index, field, value)}
                  />
                )}

                {activeTab === 'experience' && (
                  <ExperienceSection 
                    experience={userData.experience || []}
                    isEditing={isEditing}
                    onAdd={() => addNewItem('experience')}
                    onRemove={(index) => removeItem('experience', index)}
                    onUpdate={(index, field, value) => updateItem('experience', index, field, value)}
                  />
                )}

                {activeTab === 'projects' && (
                  <ProjectsSection 
                    projects={userData.projects || []}
                    isEditing={isEditing}
                    onAdd={() => addNewItem('projects')}
                    onRemove={(index) => removeItem('projects', index)}
                    onUpdate={(index, field, value) => updateItem('projects', index, field, value)}
                  />
                )}

                {activeTab === 'skills' && (
                  <SkillsSection 
                    skills={userData.skills || []}
                    isEditing={isEditing}
                    onAdd={() => addNewItem('skills')}
                    onRemove={(index) => removeItem('skills', index)}
                    onUpdate={(index, field, value) => updateItem('skills', index, field, value)}
                  />
                )}

                {activeTab === 'interests' && (
                  <InterestsSection 
                    interests={userData.interests || []}
                    isEditing={isEditing}
                    onAdd={() => addNewItem('interests')}
                    onRemove={(index) => removeItem('interests', index)}
                    onUpdate={(index, field, value) => updateItem('interests', index, field, value)}
                  />
                )}

                {activeTab === 'certifications' && (
                  <CertificationsSection 
                    certifications={userData.certifications || []}
                    isEditing={isEditing}
                    onAdd={() => addNewItem('certifications')}
                    onRemove={(index) => removeItem('certifications', index)}
                    onUpdate={(index, field, value) => updateItem('certifications', index, field, value)}
                  />
                )}

                {activeTab === 'performance' && (
                  <PerformanceSection 
                    stats={stats}
                    recentAttempts={recentAttempts}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const OverviewTab = ({ userData, recentAttempts, stats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiClock className="text-blue-400" />
          Recent Activity
        </h3>
        {recentAttempts.length > 0 ? (
          <div className="space-y-4">
            {recentAttempts.map((attempt, index) => (
              <div key={index} className="p-4 rounded-lg bg-gray-700/50 border border-gray-600">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm">{attempt.quizId?.title || 'Aptitude Test'}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    attempt.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {attempt.percentage}%
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{new Date(attempt.completedAt).toLocaleDateString()}</span>
                  <span>Score: {attempt.score}/{attempt.totalMarks}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No recent activity</p>
        )}
      </div>

      {/* Skills Preview */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiAward className="text-yellow-400" />
          Top Skills
        </h3>
        <div className="space-y-3">
          {(userData.skills || []).slice(0, 5).map((skill, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm">{skill.name}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                skill.level === 'Expert' ? 'bg-green-500/20 text-green-400' :
                skill.level === 'Advanced' ? 'bg-blue-500/20 text-blue-400' :
                skill.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {skill.level}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Quick Stats */}
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-semibold mb-4">Performance Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gray-700/50 rounded-lg">
          <div className="text-2xl font-bold text-blue-400">{stats.highestScore || 0}%</div>
          <div className="text-gray-400 text-sm">Highest Score</div>
        </div>
        <div className="text-center p-4 bg-gray-700/50 rounded-lg">
          <div className="text-2xl font-bold text-green-400">{stats.completedAptitudes || 0}</div>
          <div className="text-gray-400 text-sm">Tests Completed</div>
        </div>
        <div className="text-center p-4 bg-gray-700/50 rounded-lg">
          <div className="text-2xl font-bold text-purple-400">{Math.floor((stats.totalTimeSpent || 0) / 60)}h</div>
          <div className="text-gray-400 text-sm">Total Learning</div>
        </div>
        <div className="text-center p-4 bg-gray-700/50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-400">{stats.skillsMastered || 0}</div>
          <div className="text-gray-400 text-sm">Skills Mastered</div>
        </div>
      </div>
    </div>
  </div>
);

const EducationSection = ({ education, isEditing, onAdd, onRemove, onUpdate }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <FiBook className="text-green-400" />
        Education
      </h3>
      {isEditing && (
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-600 rounded-lg hover:bg-blue-700/40">
          <FiPlus /> Add Education
        </button>
      )}
    </div>
    <div className="space-y-4">
      {education.map((edu, index) => (
        <div key={index} className="p-6 rounded-xl bg-gray-800 border border-gray-700">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="School/University"
                value={edu.school}
                onChange={(e) => onUpdate(index, 'school', e.target.value)}
                className="p-3 rounded-lg border border-gray-600 bg-gray-700"
              />
              <input
                type="text"
                placeholder="Degree"
                value={edu.degree}
                onChange={(e) => onUpdate(index, 'degree', e.target.value)}
                className="p-3 rounded-lg border border-gray-600 bg-gray-700"
              />
              <input
                type="text"
                placeholder="Field of Study"
                value={edu.field}
                onChange={(e) => onUpdate(index, 'field', e.target.value)}
                className="p-3 rounded-lg border border-gray-600 bg-gray-700"
              />
              <input
                type="text"
                placeholder="Location"
                value={edu.location}
                onChange={(e) => onUpdate(index, 'location', e.target.value)}
                className="p-3 rounded-lg border border-gray-600 bg-gray-700"
              />
              <input
                type="text"
                placeholder="Year (e.g., 2020-2024)"
                value={edu.year}
                onChange={(e) => onUpdate(index, 'year', e.target.value)}
                className="p-3 rounded-lg border border-gray-600 bg-gray-700"
              />
              <button
                onClick={() => onRemove(index)}
                className="p-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 flex items-center gap-2 justify-center"
              >
                <FiX /> Remove
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-lg">{edu.school}</h4>
                <p className="text-blue-400">{edu.degree} in {edu.field}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <FiMapPin /> {edu.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiCalendar /> {edu.year}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      {education.length === 0 && !isEditing && (
        <div className="text-center py-12">
          <FiBook className="text-4xl text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No education information added</p>
        </div>
      )}
    </div>
  </div>
);

const ExperienceSection = ({ experience, isEditing, onAdd, onRemove, onUpdate }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <FiBriefcase className="text-yellow-400" />
        Work Experience
      </h3>
      {isEditing && (
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
          <FiPlus /> Add Experience
        </button>
      )}
    </div>
    <div className="space-y-4">
      {experience.map((exp, index) => (
        <div key={index} className="p-6 rounded-xl bg-gray-800 border border-gray-700">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) => onUpdate(index, 'company', e.target.value)}
                  className="p-3 rounded-lg border border-gray-600 bg-gray-700"
                />
                <input
                  type="text"
                  placeholder="Position"
                  value={exp.position}
                  onChange={(e) => onUpdate(index, 'position', e.target.value)}
                  className="p-3 rounded-lg border border-gray-600 bg-gray-700"
                />
                <input
                  type="text"
                  placeholder="Duration"
                  value={exp.duration}
                  onChange={(e) => onUpdate(index, 'duration', e.target.value)}
                  className="p-3 rounded-lg border border-gray-600 bg-gray-700"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={exp.location}
                  onChange={(e) => onUpdate(index, 'location', e.target.value)}
                  className="p-3 rounded-lg border border-gray-600 bg-gray-700"
                />
              </div>
              <textarea
                placeholder="Description"
                value={exp.description}
                onChange={(e) => onUpdate(index, 'description', e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700"
                rows="3"
              />
              <button
                onClick={() => onRemove(index)}
                className="p-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 flex items-center gap-2 justify-center"
              >
                <FiX /> Remove
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-lg">{exp.position}</h4>
                  <p className="text-blue-400">{exp.company}</p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400">{exp.duration}</p>
                  <p className="text-sm text-gray-400">{exp.location}</p>
                </div>
              </div>
              <p className="text-gray-300 mt-3">{exp.description}</p>
            </div>
          )}
        </div>
      ))}
      {experience.length === 0 && !isEditing && (
        <div className="text-center py-12">
          <FiBriefcase className="text-4xl text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No experience information added</p>
        </div>
      )}
    </div>
  </div>
);

const ProjectsSection = ({ projects, isEditing, onAdd, onRemove, onUpdate }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <FiCode className="text-purple-400" />
        Projects
      </h3>
      {isEditing && (
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-600 rounded-lg hover:bg-blue-700/40">
          <FiPlus /> Add Project
        </button>
      )}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {projects.map((project, index) => (
        <div key={index} className="p-6 rounded-xl bg-gray-700/20 border border-gray-700 hover:border-gray-700/40 transition-colors">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Project Title"
                value={project.title}
                onChange={(e) => onUpdate(index, 'title', e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700"
              />
              <textarea
                placeholder="Project Description"
                value={project.description}
                onChange={(e) => onUpdate(index, 'description', e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700"
                rows="3"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="url"
                  placeholder="GitHub URL"
                  value={project.github}
                  onChange={(e) => onUpdate(index, 'github', e.target.value)}
                  className="p-3 rounded-lg border border-gray-600 bg-gray-700"
                />
                <input
                  type="url"
                  placeholder="Live Demo URL"
                  value={project.demo}
                  onChange={(e) => onUpdate(index, 'demo', e.target.value)}
                  className="p-3 rounded-lg border border-gray-600 bg-gray-700"
                />
              </div>
              <input
                type="text"
                placeholder="Technologies (comma separated)"
                value={project.tech?.join(', ') || ""}
                onChange={(e) => onUpdate(index, 'tech', e.target.value.split(',').map(t => t.trim()))}
                className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700"
              />
              <button
                onClick={() => onRemove(index)}
                className="w-full p-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 flex items-center gap-2 justify-center"
              >
                <FiX /> Remove Project
              </button>
            </div>
          ) : (
            <div>
              <h4 className="font-semibold text-lg mb-2">{project.title}</h4>
              <p className="text-gray-300 text-sm mb-4">{project.description}</p>
              
              {project.tech && project.tech.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech, techIndex) => (
                    <span key={techIndex} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex gap-4">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
                  >
                    <FiGithub /> Code
                  </a>
                )}
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
                  >
                    <FiExternalLink /> Live Demo
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
      {projects.length === 0 && !isEditing && (
        <div className="col-span-2 text-center py-12">
          <FiCode className="text-4xl text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No projects added yet</p>
        </div>
      )}
    </div>
  </div>
);

const SkillsSection = ({ skills, isEditing, onAdd, onRemove, onUpdate }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <FiAward className="text-yellow-400" />
        Skills & Technologies
      </h3>
      {isEditing && (
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
          <FiPlus /> Add Skill
        </button>
      )}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {skills.map((skill, index) => (
        <div key={index} className="p-4 rounded-xl bg-gray-800 border border-gray-700">
          {isEditing ? (
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={skill.name}
                onChange={(e) => onUpdate(index, 'name', e.target.value)}
                className="flex-1 p-3 rounded-lg border border-gray-600 bg-gray-700"
                placeholder="Skill name"
              />
              <select
                value={skill.level}
                onChange={(e) => onUpdate(index, 'level', e.target.value)}
                className="p-3 rounded-lg border border-gray-600 bg-gray-700"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
              <button
                onClick={() => onRemove(index)}
                className="p-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
              >
                <FiX />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="font-medium">{skill.name}</span>
              <div className="flex items-center gap-3">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      skill.level === 'Beginner' ? 'bg-red-400 w-1/4' :
                      skill.level === 'Intermediate' ? 'bg-yellow-400 w-1/2' :
                      skill.level === 'Advanced' ? 'bg-blue-400 w-3/4' :
                      'bg-green-400 w-full'
                    }`}
                  ></div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  skill.level === 'Expert' ? 'bg-green-500/20 text-green-400' :
                  skill.level === 'Advanced' ? 'bg-blue-500/20 text-blue-400' :
                  skill.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {skill.level}
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
      {skills.length === 0 && !isEditing && (
        <div className="col-span-2 text-center py-12">
          <FiAward className="text-4xl text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No skills added yet</p>
        </div>
      )}
    </div>
  </div>
);

const InterestsSection = ({ interests, isEditing, onAdd, onRemove, onUpdate }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <FiHeart className="text-red-400" />
        Interests & Hobbies
      </h3>
      {isEditing && (
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-600 rounded-lg hover:bg-blue-700/40">
          <FiPlus /> Add Interest
        </button>
      )}
    </div>
    <div className="flex flex-wrap gap-3">
      {interests.map((interest, index) => (
        <div key={index} className="relative group">
          {isEditing ? (
            <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
              <input
                type="text"
                value={interest.name}
                onChange={(e) => onUpdate(index, 'name', e.target.value)}
                className="bg-transparent border-none outline-none"
                placeholder="Interest"
              />
              <button
                onClick={() => onRemove(index)}
                className="text-red-400 hover:text-red-300"
              >
                <FiX />
              </button>
            </div>
          ) : (
            <div className="px-4 py-2 bg-gray-800 rounded-full border border-gray-700 hover:border-blue-500 transition-colors">
              {interest.name}
            </div>
          )}
        </div>
      ))}
      {interests.length === 0 && !isEditing && (
        <div className="text-center w-full py-12">
          <FiHeart className="text-4xl text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No interests added yet</p>
        </div>
      )}
    </div>
  </div>
);

const CertificationsSection = ({ certifications, isEditing, onAdd, onRemove, onUpdate }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <FiBookOpen className="text-green-400" />
        Certifications
      </h3>
      {isEditing && (
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-600 rounded-lg hover:bg-blue-700/40">
          <FiPlus /> Add Certification
        </button>
      )}
    </div>
    <div className="space-y-4">
      {certifications.map((cert, index) => (
        <div key={index} className="p-4 rounded-xl bg-gray-800 border border-gray-700">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Certification Name"
                value={cert.name}
                onChange={(e) => onUpdate(index, 'name', e.target.value)}
                className="p-3 rounded-lg border border-gray-600 bg-gray-700"
              />
              <input
                type="text"
                placeholder="Issuing Organization"
                value={cert.issuer}
                onChange={(e) => onUpdate(index, 'issuer', e.target.value)}
                className="p-3 rounded-lg border border-gray-600 bg-gray-700"
              />
              <input
                type="text"
                placeholder="Date (e.g., March 2024)"
                value={cert.date}
                onChange={(e) => onUpdate(index, 'date', e.target.value)}
                className="p-3 rounded-lg border border-gray-600 bg-gray-700"
              />
              <input
                type="url"
                placeholder="Certificate URL"
                value={cert.link}
                onChange={(e) => onUpdate(index, 'link', e.target.value)}
                className="p-3 rounded-lg border border-gray-600 bg-gray-700"
              />
              <button
                onClick={() => onRemove(index)}
                className="p-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 flex items-center gap-2 justify-center"
              >
                <FiX /> Remove
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold">{cert.name}</h4>
                <p className="text-blue-400 text-sm">{cert.issuer}</p>
                <p className="text-gray-400 text-sm">{cert.date}</p>
              </div>
              {cert.link && (
                <a
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
                >
                  <FiExternalLink />
                  View Certificate
                </a>
              )}
            </div>
          )}
        </div>
      ))}
      {certifications.length === 0 && !isEditing && (
        <div className="text-center py-12">
          <FiBookOpen className="text-4xl text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No certifications added yet</p>
        </div>
      )}
    </div>
  </div>
);

const PerformanceSection = ({ stats, recentAttempts }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Skill Distribution</h3>
        <div className="space-y-4">
          {[
            { skill: 'Quantitative Aptitude', percentage: 75, color: 'bg-blue-500/20 border border-blue-500' },
            { skill: 'Logical Reasoning', percentage: 68, color: 'bg-green-500/20 border border-green-500' },
            { skill: 'Verbal Ability', percentage: 82, color: 'bg-yellow-500/20 border border-yellow-500' },
            { skill: 'Data Interpretation', percentage: 59, color: 'bg-purple-500/20 border border-purple-500' },
            { skill: 'Technical Aptitude', percentage: 71, color: 'bg-red-500/20 border border-red-500' }
          ].map((item, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{item.skill}</span>
                <span className="text-sm text-gray-400">{item.percentage}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${item.color} transition-all duration-1000`}
                  style={{width: `${item.percentage}%`}}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Recent Performance</h3>
        {recentAttempts.length > 0 ? (
          <div className="space-y-4">
            {recentAttempts.map((attempt, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    attempt.passed ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <div>
                    <p className="font-medium text-sm">{attempt.quizId?.title || 'Quiz'}</p>
                    <p className="text-xs text-gray-400">{new Date(attempt.completedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{attempt.percentage}%</p>
                  <p className="text-xs text-gray-400">{attempt.score}/{attempt.totalMarks}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No quiz attempts yet</p>
        )}
      </div>
    </div>

    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-semibold mb-4">Learning Progress</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4">
          <div className="text-3xl font-bold text-blue-400 mb-2">{stats.totalQuizzes || 0}</div>
          <div className="text-gray-400">Quizzes Completed</div>
        </div>
        <div className="text-center p-4">
          <div className="text-3xl font-bold text-green-400 mb-2">{stats.averageScore || 0}%</div>
          <div className="text-gray-400">Average Score</div>
        </div>
        <div className="text-center p-4">
          <div className="text-3xl font-bold text-purple-400 mb-2">{Math.floor((stats.totalTimeSpent || 0) / 60)}h</div>
          <div className="text-gray-400">Total Learning Time</div>
        </div>
      </div>
    </div>
  </div>
);

export default UserProfile;