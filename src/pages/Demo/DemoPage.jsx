import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LucideMessageSquare, 
  LucideMap, 
  LucideBookOpen, 
  LucideArrowRight,
  LucideChevronRight,
  LucideCheck,
  LucideHelpCircle
} from 'lucide-react';
import image1 from '../../../public/Interview_Prep.png';
import image2 from '../../../public/AI_ROADMAP.png';
import image3 from '../../../public/AI_QUIZ.png';
import Navbar from '../../components/layouts/Navbar';
import Footer from '../Footer/Footer';

const DemoPage = () => {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState(1);

  const modules = [
    {
      id: 1,
      title: "AI Interview Prep Q&A",
      description: "Generate personalized interview questions and answers using AI based on your role and experience level.",
      icon: <LucideMessageSquare className="w-6 h-6 md:w-8 md:h-8" />,
      color: "blue",
      steps: [
        "Choose between General Q&A or Company-Wise Q&A(Comming Soon)",
        "Select your engineering field (CSE, EC, AI/ML, Civil, EE, Mechanical)",
        "Select your target role from the dropdown",
        "Enter your years of experience",
        "Specify topics to focus on (comma-separated)",
        "Add any specific description or focus areas",
        "Click 'Create Session' to generate your personalized questions"
      ],
      image: image1,
      path: "/dashboard"
    },
    {
      id: 2,
      title: "Roadmap Generator",
      description: "Create customized learning paths for any tech career with structured milestones and resources.",
      icon: <LucideMap className="w-6 h-6 md:w-8 md:h-8" />,
      color: "green",
      steps: [
        "Select one or more tech fields from the popular options",
        "Or enter a custom field in the text input",
        "Specify your learning duration (e.g., 3 months, 6 months, 1 year)",
        "Click 'Generate Roadmap' to create your personalized learning path",
        "View your generated roadmap with milestones and resources",
        "Save or share your roadmap for future reference"
      ],
      image: image2,
      path: "/roadmapgen"
    },
    {
      id: 3,
      title: "AI Quiz Generator",
      description: "Test your knowledge with AI-generated quizzes on various tech topics and track your progress.",
      icon: <LucideBookOpen className="w-6 h-6 md:w-8 md:h-8" />,
      color: "yellow",
      steps: [
        "Select difficulty level (Easy, Medium, Hard)",
        "Enter your topic of interest (e.g., React, DBMS, Python)",
        "Choose the number of questions (5, 10, 15, 20)",
        "Click 'Start Quiz' to begin your assessment",
        "Answer questions and get immediate feedback",
        "Review your results and areas for improvement"
      ],
      image: image3,
      path: "/main-quiz"
    }
  ];

  const handleGetStarted = () => {
    const module = modules.find(m => m.id === activeModule);
    navigate(module.path);
  };

  const colorClasses = {
    blue: {
      bg: 'bg-blue-600/20',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      button: 'bg-blue-600/10 hover:bg-blue-500/20 border-blue-500/50'
    },
    green: {
      bg: 'bg-green-600/20',
      border: 'border-green-500/30',
      text: 'text-green-400',
      button: 'bg-green-600/10 hover:bg-green-500/20 border-green-500/50'
    },
    yellow: {
      bg: 'bg-yellow-600/20',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      button: 'bg-yellow-600/10 hover:bg-yellow-500/20 border-yellow-500/50'
    }
  };

  const currentColor = colorClasses[modules[activeModule-1].color];

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      
      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-orange-100 to-orange-500 bg-clip-text text-transparent">
            Tech Career Hub
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto px-4">
            Your all-in-one platform for tech career development. Follow these simple steps to generate personalized content.
          </p>
        </header>

        {/* Module Selection - Horizontal on desktop, Vertical on mobile */}
        <section className="mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mb-6 md:mb-8">
            {modules.map((module) => {
              const isActive = activeModule === module.id;
              const moduleColor = colorClasses[module.color];
              return (
                <button
                  key={module.id}
                  className={`flex items-center justify-center gap-2 px-4 py-3 md:px-6 md:py-3 rounded-lg transition-all border min-w-0 flex-1 sm:flex-none ${
                    isActive 
                      ? `${moduleColor.bg} ${moduleColor.border} text-white shadow-lg` 
                      : 'bg-gray-700/20 border-gray-500 text-gray-300 hover:bg-gray-600/20'
                  }`}
                  onClick={() => setActiveModule(module.id)}
                >
                  {module.icon}
                  <span className="text-sm md:text-base whitespace-nowrap truncate">
                    {module.title}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step-by-Step Guide */}
        <section className="mb-12 md:mb-16">
          <div className="bg-gray-800/20 backdrop-blur-md rounded-2xl overflow-hidden border border-gray-700">
            <div className="flex flex-col lg:flex-row">
              {/* Content Section */}
              <div className="lg:w-1/2 p-6 md:p-8">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-4 md:mb-6 ${currentColor.bg} border border-gray-500`}>
                  {modules[activeModule-1].icon}
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold mb-4">{modules[activeModule-1].title}</h2>
                <p className="text-gray-300 mb-6 md:mb-8 text-sm md:text-base">
                  {modules[activeModule-1].description}
                </p>
                
                <div className="mb-6 md:mb-8">
                  <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 flex items-center">
                    <LucideHelpCircle className="w-5 h-5 md:w-6 md:h-6 mr-2 text-blue-400" /> 
                    How It Works
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    {modules[activeModule-1].steps.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center mr-3 md:mr-4 ${currentColor.bg} border border-gray-500 flex-shrink-0 mt-0.5`}>
                          <span className="font-semibold text-xs md:text-sm">{index + 1}</span>
                        </div>
                        <p className="text-gray-300 text-sm md:text-base leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={handleGetStarted}
                  className={`w-full sm:w-auto px-6 py-3 rounded-lg ${currentColor.button} text-white font-medium flex items-center justify-center transition-all border`}
                >
                  Try {modules[activeModule-1].title.split(' ')[0]} {/* Show only first word on mobile */}
                  <LucideArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                </button>
              </div>
              
              {/* Image Section */}
              <div className="lg:w-1/2 flex items-center justify-center p-4 md:p-8 bg-gray-900/50">
                <div className="rounded-lg overflow-hidden shadow-2xl border border-gray-700 w-full max-w-md">
                  <img 
                    src={modules[activeModule-1].image} 
                    alt={modules[activeModule-1].title} 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Why Use Our AI Tools?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-gray-800/30 backdrop-blur-md p-4 md:p-6 rounded-xl border border-gray-700">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 md:mb-4">
                <LucideCheck className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Personalized Content</h3>
              <p className="text-gray-300 text-sm md:text-base">
                Get content tailored to your specific role, experience level, and learning goals.
              </p>
            </div>
            
            <div className="bg-gray-800/30 backdrop-blur-md p-4 md:p-6 rounded-xl border border-gray-700">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 md:mb-4">
                <LucideChevronRight className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Step-by-Step Guidance</h3>
              <p className="text-gray-300 text-sm md:text-base">
                Follow clear instructions to generate exactly what you need for your career development.
              </p>
            </div>
            
            <div className="bg-gray-800/30 backdrop-blur-md p-4 md:p-6 rounded-xl border border-gray-700">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3 md:mb-4">
                <LucideArrowRight className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Instant Results</h3>
              <p className="text-gray-300 text-sm md:text-base">
                Generate interview questions, learning roadmaps, or quizzes in seconds, not hours.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-12 md:mb-16 text-center">
          <div className="bg-gradient-to-r from-blue-700/20 to-purple-700/20 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-gray-700">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Accelerate Your Tech Career?</h2>
            <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto">
              Follow the simple steps above to generate personalized interview questions, learning roadmaps, or assessment quizzes.
            </p>
            <Link to="/main-dashboard">
              <button 
                className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-blue-500/20 to-purple-600/30 border border-gray-600 rounded-lg text-base md:text-lg font-semibold hover:shadow-xl transition-all cursor-pointer w-full sm:w-auto"
              >
                Get Started Now
              </button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DemoPage;