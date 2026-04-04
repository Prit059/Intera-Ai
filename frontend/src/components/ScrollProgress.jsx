// components/ScrollProgress.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.scrollY / totalScroll) * 100;
      setScrollProgress(currentProgress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 z-50"
      style={{ width: `${scrollProgress}%`, originX: 0 }}
      animate={{ width: `${scrollProgress}%` }}
      transition={{ type: "tween", ease: "easeOut", duration: 0.1 }}
    />
  );
};

export default ScrollProgress;