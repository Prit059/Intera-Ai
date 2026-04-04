import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useNavigate } from 'react-router-dom';

// Enhanced Topic mappings with Placement and Competitive exams
const TOPIC_MAPPINGS = {
  cse: {
    mainTopics: ['Frontend Development', 'Backend Development', 'Database Management', 'Algorithms & Data Structures', 'Networking & Security', 'Mobile Development', 'Cloud Computing', 'DevOps', 'Operating Systems', 'Compiler Design'],
    subTopics: {
      'Frontend Development': ['HTML5', 'CSS3', 'JavaScript ES6+', 'React.js', 'Vue.js', 'Angular', 'TypeScript', 'SASS/SCSS', 'Webpack', 'Responsive Design'],
      'Backend Development': ['Node.js', 'Python Django', 'Python Flask', 'Java Spring', 'PHP Laravel', 'Ruby on Rails', 'Express.js', 'REST APIs', 'GraphQL', 'Microservices'],
      'Database Management': ['SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Database Design', 'ORM', 'Indexing', 'Transactions', 'Normalization'],
      'Algorithms & Data Structures': ['Sorting Algorithms', 'Search Algorithms', 'Graph Theory', 'Dynamic Programming', 'Tree Structures', 'Big O Notation', 'Recursion', 'Hashing', 'Greedy Algorithms'],
      'Networking & Security': ['TCP/IP', 'HTTP/HTTPS', 'DNS', 'Web Security', 'OAuth', 'JWT', 'CORS', 'Firewalls', 'Encryption', 'VPN'],
      'Operating Systems': ['Process Management', 'Memory Management', 'File Systems', 'Scheduling', 'Deadlocks', 'Threads', 'Synchronization'],
      'Compiler Design': ['Lexical Analysis', 'Syntax Analysis', 'Semantic Analysis', 'Code Generation', 'Optimization']
    }
  },
  ec: {
    mainTopics: ['Digital Electronics', 'Analog Circuits', 'Signals & Systems', 'Communication Systems', 'VLSI Design', 'Embedded Systems', 'Control Systems', 'Power Electronics'],
    subTopics: {
      'Digital Electronics': ['Logic Gates', 'Boolean Algebra', 'Combinational Circuits', 'Sequential Circuits', 'Flip Flops', 'Counters', 'Registers', 'ADC/DAC'],
      'Analog Circuits': ['Diodes', 'Transistors', 'OP-AMPs', 'Amplifiers', 'Oscillators', 'Filters', 'Voltage Regulators'],
      'Signals & Systems': ['Fourier Transform', 'Laplace Transform', 'Z-Transform', 'Convolution', 'Filter Design', 'Signal Processing'],
      'Communication Systems': ['Modulation Techniques', 'Demodulation', 'Antennas', 'Wireless Communication', 'Satellite Communication', '5G Technology'],
      'VLSI Design': ['CMOS Technology', 'VHDL/Verilog', 'FPGA', 'ASIC Design', 'Layout Design'],
      'Embedded Systems': ['Microcontrollers', 'ARM Architecture', 'RTOS', 'Embedded C', 'IoT Protocols']
    }
  },
  mechanical: {
    mainTopics: ['Thermodynamics', 'Fluid Mechanics', 'Solid Mechanics', 'Manufacturing', 'Machine Design', 'Heat Transfer', 'Automobile Engineering', 'Robotics'],
    subTopics: {
      'Thermodynamics': ['Laws of TD', 'Heat Engines', 'Refrigeration', 'Psychrometry', 'Combustion'],
      'Fluid Mechanics': ['Bernoulli Equation', 'Viscosity', 'Turbulence', 'Pumps', 'Hydraulics'],
      'Solid Mechanics': ['Stress-Strain', 'Beam Theory', 'Torsion', 'Failure Theories', 'Finite Element Analysis'],
      'Manufacturing': ['Casting', 'Welding', 'Machining', 'CNC', '3D Printing', 'Sheet Metal'],
      'Machine Design': ['Gears', 'Bearings', 'Shafts', 'Springs', 'Design Standards']
    }
  },
  ai_ml: {
    mainTopics: ['Machine Learning', 'Deep Learning', 'Natural Language Processing', 'Computer Vision', 'Reinforcement Learning', 'Data Science', 'AI Ethics', 'Big Data'],
    subTopics: {
      'Machine Learning': ['Supervised Learning', 'Unsupervised Learning', 'Regression', 'Classification', 'Clustering', 'SVMs', 'Decision Trees', 'Random Forest'],
      'Deep Learning': ['Neural Networks', 'CNN', 'RNN', 'LSTM', 'GAN', 'Transformers', 'Attention Mechanism'],
      'Natural Language Processing': ['Tokenization', 'Word Embeddings', 'BERT', 'GPT', 'Sentiment Analysis', 'NER', 'Text Classification'],
      'Computer Vision': ['Image Processing', 'Object Detection', 'Image Segmentation', 'Face Recognition', 'OpenCV', 'YOLO'],
      'Data Science': ['Data Preprocessing', 'EDA', 'Statistical Analysis', 'Data Visualization', 'Pandas/Numpy', 'Feature Engineering']
    }
  },
  placement: {
    mainTopics: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Data Interpretation', 'Technical Interview', 'HR Interview', 'Group Discussion', 'Coding Problems'],
    subTopics: {
      'Quantitative Aptitude': ['Percentages', 'Profit & Loss', 'Time & Work', 'Speed Distance Time', 'Averages', 'Ratios', 'Probability', 'Permutations', 'Number System', 'Algebra'],
      'Logical Reasoning': ['Blood Relations', 'Direction Sense', 'Coding-Decoding', 'Puzzles', 'Seating Arrangement', 'Syllogisms', 'Data Sufficiency', 'Series Completion'],
      'Verbal Ability': ['Reading Comprehension', 'Grammar', 'Vocabulary', 'Sentence Correction', 'Para Jumbles', 'Cloze Test', 'Synonyms/Antonyms'],
      'Data Interpretation': ['Bar Graphs', 'Pie Charts', 'Line Graphs', 'Tables', 'Caselets', 'Mixed Graphs'],
      'Technical Interview': ['Data Structures', 'Algorithms', 'DBMS', 'OS', 'Networking', 'OOPS', 'System Design', 'Programming Concepts'],
      'Coding Problems': ['Array Problems', 'String Manipulation', 'Linked Lists', 'Trees', 'Dynamic Programming', 'Recursion', 'Sorting Algorithms']
    }
  },
  competitive: {
    mainTopics: ['General Awareness', 'Current Affairs', 'Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'Banking Awareness', 'Static GK', 'Computer Knowledge'],
    subTopics: {
      'Quantitative Aptitude': ['Simplification', 'Number Series', 'Data Interpretation', 'Quadratic Equations', 'Arithmetic', 'Mensuration', 'Trigonometry'],
      'Reasoning Ability': ['Puzzles', 'Seating Arrangement', 'Blood Relations', 'Direction Sense', 'Coding-Decoding', 'Inequalities', 'Syllogisms'],
      'English Language': ['Reading Comprehension', 'Cloze Test', 'Error Spotting', 'Fill in the Blanks', 'Para Jumbles', 'Sentence Improvement'],
      'General Awareness': ['History', 'Geography', 'Polity', 'Economics', 'Science', 'Sports', 'Awards', 'Books'],
      'Current Affairs': ['National News', 'International News', 'Business News', 'Technology Updates', 'Schemes & Policies'],
      'Banking Awareness': ['RBI Functions', 'Banking Regulations', 'Financial Terms', 'Currency', 'Payment Systems', 'NBFC'],
      'Computer Knowledge': ['Hardware', 'Software', 'Internet', 'MS Office', 'Cyber Security', 'Database Basics']
    }
  },
  other: {
    mainTopics: ['General Knowledge', 'Mathematics', 'Science', 'Aptitude', 'Current Affairs', 'Business', 'Soft Skills', 'Programming Fundamentals'],
    subTopics: {
      'General Knowledge': ['History', 'Geography', 'Politics', 'Sports', 'Awards', 'Books & Authors'],
      'Mathematics': ['Algebra', 'Calculus', 'Statistics', 'Probability', 'Geometry', 'Trigonometry'],
      'Science': ['Physics', 'Chemistry', 'Biology', 'Environmental Science', 'Scientific Discoveries'],
      'Aptitude': ['Quantitative', 'Logical Reasoning', 'Verbal Ability', 'Data Interpretation', 'Puzzles']
    }
  }
};

const QuizStarter = () => {
  const [formData, setFormData] = useState({
    branch: 'cse',
    customBranch: '',
    mainTopic: '',
    subTopics: [{ topic: '', difficulty: 'medium', weightage: 100 }],
    totalQuestions: 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const availableMainTopics = TOPIC_MAPPINGS[formData.branch]?.mainTopics || [];
  const availableSubTopics = TOPIC_MAPPINGS[formData.branch]?.subTopics[formData.mainTopic] || [];

  const handleStartQuiz = async () => {
    if (!formData.mainTopic || formData.subTopics.some(st => !st.topic)) {
      setError("Please fill all required fields.");
      return;
    }

    const totalWeight = formData.subTopics.reduce((sum, st) => sum + parseInt(st.weightage), 0);
    if (totalWeight !== 100) {
      setError("Total weightage must equal 100%");
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await axiosInstance.post(API_PATHS.QUIZ.GENERATE, formData);
      
      navigate('/quizplayer', {
        state: {
          quizId: res.data.quizId,
          questions: res.data.questions,
          timeLimit: res.data.timeLimit,
          topic: res.data.topic,
          level: res.data.level
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addSubTopic = () => {
    if (formData.subTopics.length >= 5) return;
    setFormData(prev => ({
      ...prev,
      subTopics: [...prev.subTopics, { topic: '', difficulty: 'medium', weightage: 0 }]
    }));
    setError('');
  };

  const updateSubTopic = (index, field, value) => {
    const updated = [...formData.subTopics];
    updated[index][field] = value;
    
    if (field === 'weightage') {
      const totalWeight = updated.reduce((sum, st, i) => 
        i === index ? sum + parseInt(value) : sum + parseInt(st.weightage), 0);
      
      if (totalWeight > 100) {
        setError("Total weightage cannot exceed 100%");
        return;
      }
      
      if (updated.length > 1) {
        const remainingWeight = 100 - parseInt(value);
        const otherTopicsCount = updated.length - 1;
        const avgWeight = Math.floor(remainingWeight / otherTopicsCount);
        
        updated.forEach((st, i) => {
          if (i !== index) {
            st.weightage = avgWeight;
          }
        });
        
        const currentTotal = updated.reduce((sum, st) => sum + parseInt(st.weightage), 0);
        if (currentTotal < 100) {
          updated[updated.length - 1].weightage += (100 - currentTotal);
        }
      }
    }
    
    setFormData(prev => ({ ...prev, subTopics: updated }));
    setError('');
  };

  const removeSubTopic = (index) => {
    if (formData.subTopics.length <= 1) return;
    
    setFormData(prev => {
      const updated = prev.subTopics.filter((_, i) => i !== index);
      const newWeight = Math.floor(100 / updated.length);
      updated.forEach(st => st.weightage = newWeight);
      
      return { ...prev, subTopics: updated };
    });
  };

  const calculateTotalWeight = () => {
    return formData.subTopics.reduce((sum, st) => sum + parseInt(st.weightage), 0);
  };

  const getBranchIcon = (branch) => {
    const icons = {
      cse: "💻", ec: "📡", mechanical: "⚙️", ai_ml: "🤖", placement: "🎯", competitive: "🏆", other: "📚"
    };
    return icons[branch] || "📚";
  };

  const getBranchName = (branch) => {
    const names = {
      cse: "Computer Science", ec: "Electronics & Communication", mechanical: "Mechanical Engineering",
      ai_ml: "AI & Machine Learning", placement: "Placement Preparation", competitive: "Competitive Exams", other: "Other Field"
    };
    return names[branch] || branch;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br bg-black p-4">
      <div className="w-full max-w-2xl bg-black backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700">
        <h2 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Create Your AI Quiz
        </h2>
        <p className="text-gray-400 text-center mb-8">Customize your quiz with topics, difficulty levels, and weightage</p>
        
        <div className="space-y-6">
          {/* Branch Selection */}
          <div className="bg-gray-700/20 rounded-xl p-6 border border-gray-700">
            <label className="block text-lg font-semibold mb-3 text-white">
              Select Category {getBranchIcon(formData.branch)}
            </label>
            <select
              className="w-full bg-gray-800/20 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={formData.branch}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                branch: e.target.value,
                mainTopic: '',
                subTopics: [{ topic: '', difficulty: 'medium', weightage: 100 }]
              }))}
            >
              <option value="cse" className='bg-black'>💻 Computer Science & Engineering</option>
              <option value="ec" className='bg-black'>📡 Electronics & Communication</option>
              <option value="mechanical" className='bg-black'>⚙️ Mechanical Engineering</option>
              <option value="ai_ml" className='bg-black'>🤖 AI & Machine Learning</option>
              <option value="placement" className='bg-black'>🎯 Placement Preparation</option>
              <option value="competitive" className='bg-black'>🏆 Competitive Exams</option>
              <option value="other" className='bg-black'>📚 Other Field</option>
            </select>
            
            {formData.branch === 'other' && (
              <input
                type="text"
                placeholder="Specify your field (e.g., Civil Engineering, Biotechnology...)"
                className="w-full mt-3 bg-gray-700/20 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.customBranch}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, customBranch: e.target.value 
                }))}
              />
            )}
          </div>

          {/* Main Topic */}
          <div className="bg-gray-700/20 rounded-xl p-6 border border-gray-700">
            <label className="block text-lg font-semibold mb-3 text-white">
              Main Topic
            </label>
            <select
              className="w-full bg-gray-700/20 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.mainTopic}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                mainTopic: e.target.value,
                subTopics: [{ topic: '', difficulty: 'medium', weightage: 100 }]
              }))}
            >
              <option value="" className='bg-black'>Select a Main Topic</option>
              {availableMainTopics.map(topic => (
                <option className='bg-black' key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>

          {/* Sub-topics with difficulties */}
          {formData.mainTopic && (
            <div className="bg-gray-700/20 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-lg font-semibold text-white">
                  Sub-topics & Weightage
                </label>
                <span className={`text-sm ${calculateTotalWeight() === 100 ? 'text-green-400' : 'text-red-400'}`}>
                  Total: {calculateTotalWeight()}%
                </span>
              </div>
              
              {formData.subTopics.map((subTopic, index) => (
                <div key={index} className="flex gap-3 mb-4 items-center">
                  <select
                    className="flex-1 bg-gray-700/20 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={subTopic.topic}
                    onChange={(e) => updateSubTopic(index, 'topic', e.target.value)}
                  >
                    <option value="" className='bg-black'>Select Sub-topic</option>
                    {availableSubTopics.map(topic => (
                      <option className='bg-black' key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                  
                  <select
                    className="w-32 bg-gray-700/20 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={subTopic.difficulty}
                    onChange={(e) => updateSubTopic(index, 'difficulty', e.target.value)}
                  >
                    <option value="easy" className='bg-black'>Easy</option>
                    <option value="medium" className='bg-black'>Medium</option>
                    <option value="hard" className='bg-black'>Hard</option>
                  </select>
                  
                  <div className="relative w-24">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-full bg-gray-700/20 border border-gray-600 rounded-lg p-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={subTopic.weightage}
                      onChange={(e) => updateSubTopic(index, 'weightage', e.target.value)}
                    />
                    <span className="absolute right-3 top-3 text-white">%</span>
                  </div>
                  
                  {formData.subTopics.length > 1 && (
                    <button
                      type="button"
                      className="px-4 py-3 bg-red-600/20 border border-red-500 hover:bg-red-700 text-white rounded-lg transition"
                      onClick={() => removeSubTopic(index)}
                      title="Remove subtopic"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              
              {formData.subTopics.length < 5 && (
                <button
                  type="button"
                  className="w-full py-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  onClick={addSubTopic}
                >
                  + Add Another Sub-topic
                </button>
              )}
            </div>
          )}

          {/* Total Questions */}
          <div className="bg-gray-700/20 rounded-xl p-6 border border-gray-700">
            <label className="block text-lg font-semibold mb-3 text-white">
              Number of Questions (5-50)
            </label>
            <input 
              type="number"
              min={5}
              max={50}
              value={formData.totalQuestions}
              className="w-full bg-gray-700/20 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData(prev => ({ 
                ...prev, totalQuestions: parseInt(e.target.value) 
              }))}
            />
            <p className="text-gray-500 text-sm mt-2">
              ⏱️ Estimated time: ~{Math.round(formData.totalQuestions * 1.2)} minutes
            </p>
          </div>

          {error && (
            <div className="bg-red-600/20 border border-red-600 rounded-lg p-4">
              <p className="text-red-400 font-semibold">⚠️ {error}</p>
            </div>
          )}

          <button
            className={`w-full py-3 bg-blue-700/20 border border-blue-500 hover:bg-blue-700/40 text-white font-bold rounded-xl text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:scale-101 shadow-2xl"
            }`}
            onClick={handleStartQuiz}
            disabled={loading || !formData.mainTopic}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating Your Quiz...
              </>
            ) : (
              <>
                🚀 Start AI Quiz
                <span className="text-sm opacity-80">({formData.totalQuestions} questions)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizStarter;