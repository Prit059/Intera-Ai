// frontend/src/components/SaveToggle/original.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideCheck, LucideLoader2, LucideBookmark } from 'lucide-react';

export const SaveToggle = ({
  size = "md",
  idleText = "Save",
  savedText = "Saved",
  loadingDuration = 1200,
  successDuration = 1000,
  onStatusChange,
  onSave,
  initialSaved = false,
  className = ""
}) => {
  const [status, setStatus] = useState(initialSaved ? 'saved' : 'idle');
  const [isHovered, setIsHovered] = useState(false);

  const sizes = {
    sm: { button: "px-3 py-1.5 text-sm", icon: "w-3.5 h-3.5", gap: "gap-1.5" },
    md: { button: "px-4 py-2 text-base", icon: "w-4 h-4", gap: "gap-2" },
    lg: { button: "px-6 py-3 text-lg", icon: "w-5 h-5", gap: "gap-2.5" },
  };

  const handleClick = async () => {
    if (status === 'loading' || status === 'saved') return;
    
    setStatus('loading');
    onStatusChange?.('loading');

    if (onSave) {
      try {
        await onSave();
        setStatus('saved');
        onStatusChange?.('saved');
        setTimeout(() => {
          setStatus('idle');
          onStatusChange?.('idle');
        }, successDuration);
      } catch (error) {
        setStatus('idle');
        onStatusChange?.('idle');
        console.error('Save failed:', error);
      }
    } else {
      setTimeout(() => {
        setStatus('saved');
        onStatusChange?.('saved');
        setTimeout(() => {
          setStatus('idle');
          onStatusChange?.('idle');
        }, successDuration);
      }, loadingDuration);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-xl font-medium transition-all duration-300 ${sizes[size].button} ${sizes[size].gap} ${className} ${
        status === 'saved' 
          ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' 
          : status === 'loading'
          ? 'bg-blue-600 text-white'
          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/30'
      }`}
      whileTap={{ scale: 0.97 }}
      animate={{
        scale: isHovered && status === 'idle' ? 1.02 : 1,
      }}
    >
      <AnimatePresence mode="wait">
        {status === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            <LucideLoader2 className={`${sizes[size].icon} animate-spin`} />
            <span>Saving...</span>
          </motion.div>
        )}
        
        {status === 'saved' && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            <LucideCheck className={sizes[size].icon} />
            <span>{savedText}</span>
          </motion.div>
        )}
        
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            <LucideBookmark className={sizes[size].icon} />
            <span>{idleText}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};