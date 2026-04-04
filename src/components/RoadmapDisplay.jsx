import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LucideArrowRight,
  LucideScrollText,
  LucideClock,
  LucideList,
  LucideYoutube,
  LucideCheck,
  LucideCheckCircle,
  LucideCircle,
  LucideChevronDown,
  LucideChevronUp
} from 'lucide-react';

const RoadmapDisplay = ({ roadmap, companies, flowchart, userProgress, onStepCompletionChange }) => {
  const [expandedPhases, setExpandedPhases] = useState({});

  // Toggle phase expansion
  const togglePhase = (phaseIndex) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseIndex]: !prev[phaseIndex]
    }));
  };

  // Check if a step is completed
  const isStepCompleted = (stepId) => {
    return userProgress?.completedSteps?.includes(stepId);
  };

  // Check if a phase is completed
  const isPhaseCompleted = (phase) => {
    return phase.steps.every(step => isStepCompleted(step._id || step.stepTitle));
  };

  // Calculate phase progress
  const calculatePhaseProgress = (phase) => {
    if (!phase.steps.length) return 0;
    const completedSteps = phase.steps.filter(step => 
      isStepCompleted(step._id || step.stepTitle)
    ).length;
    return Math.round((completedSteps / phase.steps.length) * 100);
  };

  // Handle step completion toggle - UPDATED
  const handleStepToggle = (stepId, completed) => {
    console.log("Toggling step:", stepId, "completed:", completed);
    if (onStepCompletionChange) {
      onStepCompletionChange(stepId, !completed);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* Companies Section */}
      {companies && companies.length > 0 && (
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-4xl underline font-bold text-gray-200 mb-6">
            Companies that hire for this role
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {companies.map((company, index) => (
              <motion.img
                key={index}
                src={`https://placehold.co/150x50/111827/ffffff?text=${encodeURIComponent(company)}`}
                alt={`${company} logo`}
                className="rounded-lg shadow-md cursor-pointer"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 100 }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Progress Overview */}
      {/* {userProgress && (
        <motion.div 
          className="mb-8 p-6 bg-gray-800 rounded-xl border border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-white mb-4">Your Progress</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>Overall Completion</span>
                <span>{userProgress.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${userProgress.progress || 0}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {userProgress.completedSteps?.length || 0}
              </div>
              <div className="text-xs text-gray-400">Steps completed</div>
            </div>
          </div>
        </motion.div>
      )} */}

      {/* Dual-View Layout */}
      <div className="flex flex-col md:flex-row gap-10">
        {/* Roadmap Section */}
        <div className="md:w-1/2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-400 mb-10 text-center">
            Detailed Roadmap
          </h2>
          <div className="relative flex flex-col items-start gap-12">
            {roadmap.map((phase, index) => {
              const phaseProgress = calculatePhaseProgress(phase);
              const isCompleted = isPhaseCompleted(phase);
              const isExpanded = expandedPhases[index] !== false; // Default to expanded

              return (
                <motion.div
                  key={index}
                  className="w-full"
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  {/* Phase Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-indigo-800/20 text-white p-5 rounded-xl shadow-lg border border-indigo-500 cursor-pointer"
                    onClick={() => togglePhase(index)}
                  >
                    <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <LucideCheckCircle className="w-6 h-6 text-green-300" />
                        ) : (
                          <LucideScrollText className="w-6 h-6" />
                        )}
                        <h3 className="text-xl font-bold">{phase.title}</h3>
                      </div>
                      <p className="text-sm font-medium flex items-center gap-1 text-gray-200 mt-1">
                        <LucideClock className="w-4 h-4" />
                        {phase.estimatedTime}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePhase(index);
                      }}
                      className="p-2 hover:bg-indigo-700 rounded-lg"
                    >
                      {isExpanded ? (
                        <LucideChevronUp className="w-5 h-5" />
                      ) : (
                        <LucideChevronDown className="w-5 h-5" />
                      )}
                    </button>
                      <div className="text-right">
                        <div className="text-sm text-gray-300 mb-1">Progress</div>
                        <div className="text-lg font-bold text-white">{phaseProgress}%</div>
                      </div>
                    </div>
                    
                    {/* Phase progress bar */}
                    <div className="mt-3 w-full bg-indigo-700/20 rounded-full h-2">
                      <div 
                        className="bg-green-800/90 border border-green-600  h-2 rounded-full transition-all duration-500"
                        style={{ width: `${phaseProgress}%` }}
                      ></div>
                    </div>
                  </motion.div>

                  {/* Steps - Conditionally rendered */}
                  {isExpanded && (
                    <div className="space-y-6 relative ml-6 mt-6">
                      {/* Vertical line */}
                      {index < roadmap.length && (
                        <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-gradient-to-b from-blue-400 to-gray-600"></div>
                      )}
                      {phase.steps.map((step, stepIndex) => {
                        const stepId = step._id || step.stepTitle;
                        const isStepDone = isStepCompleted(stepId);
                        
                        return (
                          <motion.div
                            key={stepIndex}
                            className="bg-gray-800/30 p-4 rounded-lg shadow-inner border border-gray-700 relative pl-10 group hover:bg-gray-700/40 transition"
                            whileHover={{ scale: 1.01 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: stepIndex * 0.1 }}
                          >
                           {/* Checkbox - UPDATED */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const stepId = step._id?.toString() || step.stepTitle;
                                handleStepToggle(stepId, isStepDone);
                              }}
                              className={`absolute left-0 top-1/2 -translate-y-1/2 -ml-3 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                isStepDone 
                                  ? 'bg-green-800/80 border-green-500 hover:bg-green-600' 
                                  : 'border-blue-500 hover:border-blue-400 hover:bg-blue-500/20'
                              } transition-colors`}
                              title={isStepDone ? "Mark as incomplete" : "Mark as complete"}
                            >
                              {isStepDone && <LucideCheck className="w-4 h-4 text-white" />}
                            </button>

                            <h4 className="text-lg font-semibold mb-1 text-blue-300 flex items-center gap-2">
                              <LucideList className="w-4 h-4" />
                              {step.stepTitle}
                              {isStepDone && (
                                <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full">
                                  Completed
                                </span>
                              )}
                            </h4>
                            <p className="text-gray-300 mb-2 text-sm">
                              {step.description}
                            </p>

                            {/* Resources */}
                            {step.resources && (
                              <div className="mt-3 space-y-2 text-sm">
                                <span className="font-semibold text-gray-400 block">
                                  Resources:
                                </span>
                                {step.resources.youtube?.length > 0 && (
                                  <a
                                    href={step.resources.youtube[0]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-red-400 hover:underline flex items-center gap-1 hover:text-red-300"
                                  >
                                    <LucideYoutube className="w-4 h-4 inline-block" />
                                    YouTube Course
                                  </a>
                                )}
                                {step.resources.coursera?.length > 0 && (
                                  <a
                                    href={step.resources.coursera[0]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-300 hover:underline flex items-center gap-1 hover:text-blue-200"
                                  >
                                    <LucideScrollText className="w-4 h-4 inline-block" />
                                    Coursera Course
                                  </a>
                                )}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Arrow */}
                  {index < roadmap.length - 1 && (
                    <div className="flex justify-start ml-6 my-6">
                      <LucideArrowRight className="w-10 h-10 text-gray-400 transform rotate-90" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Flowchart Section */}
        <div className="md:w-1/2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-purple-600/90  mb-10 text-center">
            Learning Flowchart
          </h2>
          <div className="relative flex flex-col items-center gap-6">
            {flowchart &&
              flowchart.map((step, index) => (
                <React.Fragment key={index}>
                  <motion.div
                    className="bg-purple-800/20 text-white p-5 rounded-xl shadow-lg border border-purple-500 text-center w-full max-w-sm"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                  >
                    {step}
                  </motion.div>
                  {index < flowchart.length - 1 && (
                    <motion.div
                      className="flex flex-col items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.3 }}
                    >
                      <LucideArrowRight className="w-8 h-8 text-gray-400 transform rotate-90" />
                    </motion.div>
                  )}
                </React.Fragment>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapDisplay;