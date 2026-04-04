import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const InteraLoader = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsComplete(true);
            onLoadingComplete();
          }, 500); // Delay before hiding loader
          return 100;
        }
        return prev + 2; // Increment by 2 for smooth 50 step loading
      });
    }, 30); // 30ms * 50 steps = 1.5 seconds

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
        >
          <div className="relative flex flex-col items-center">
            {/* Animated Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center"
            >
              <span className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
                Intera.
              </span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-5xl md:text-7xl font-bold text-white"
              >
                AI
              </motion.span>
            </motion.div>

            {/* Underline Loading Bar */}
            <div className="mt-6 w-48 md:w-64 h-[2px] bg-gray-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-gray-400 via-white to-gray-400"
              />
            </div>

            {/* Progress Percentage (optional) */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              className="mt-3 text-sm text-gray-400 font-mono"
            >
              {progress}%
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InteraLoader;