import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Spline from '@splinetool/react-spline';

const faqs = [
  {
    question: "How do I start a new quiz?",
    answer: "From the dashboard, click the 'Start Quiz' button, select your branch, topics, and number of questions, then begin."
  },
  {
    question: "Can I review my answers after finishing a quiz?",
    answer: "Yes. Once you submit a quiz, you can view all questions, your answers, and the correct solutions in the results page."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. All quiz results and user data are stored securely on our servers with encrypted communication."
  },
  {
    question: "Can I create custom questions for practice?",
    answer: "Yes, you can create your own practice sets by adding custom questions and saving them for future sessions."
  }
];

function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-black text-white h-110 lg:min-h-screen py-6 sm:py-8 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* 3D Text Header */}
        <motion.h1 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20 relative z-10"
          style={{
            color: '#FFD700',
            textShadow: `
              2px 2px 0px #FF6B00,
              4px 4px 0px #FF0080,
              6px 6px 0px #00D4FF,
              8px 8px 15px rgba(0,0,0,0.8)
            `,
            transform: 'perspective(1000px) rotateX(15deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          FAQs
        </motion.h1>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
          {/* Spline 3D Model */}
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="w-full lg:w-1/2 h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] relative order-2 lg:order-1"
          >
            <Spline
              className="hidden w-full h-full rounded-xl sm:rounded-2xl shadow-2xl shadow-gray-400/30"
              scene="https://prod.spline.design/f5TzkZhkgrdNOOm9/scene.splinecode"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none"></div>
          </motion.div>

          {/* FAQ Items */}
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="w-full lg:w-1/2 space-y-4 sm:space-y-6 relative z-10 order-1 lg:order-2"
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 border border-gray-600/30 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm hover:border-amber-400/50 transition-all duration-300 hover:shadow-amber-500/20">
                  <button
                    className="flex justify-between items-center w-full px-4 sm:px-6 py-3 sm:py-5 text-left focus:outline-none hover:bg-gray-700/20 transition-colors duration-300"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="text-base sm:text-lg md:text-xl font-semibold text-white group-hover:text-amber-300 transition-colors duration-300 pr-4 flex-1">
                      {faq.question}
                    </span>
                    <motion.span
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0 ml-2 sm:ml-4 p-1 sm:p-2 bg-gray-700/50 rounded-full group-hover:bg-amber-500/30 transition-colors duration-300 border border-gray-600/50"
                    >
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                    </motion.span>
                  </button>
                  
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="border-t border-gray-600/30"
                      >
                        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-br from-gray-800/60 to-gray-900/70">
                          <p className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/30 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 0.5, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
          
          <div className="absolute top-1/4 -left-10 sm:-left-20 w-48 sm:w-72 h-48 sm:h-72 bg-purple-500/10 rounded-full blur-2xl sm:blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-10 sm:-right-20 w-48 sm:w-72 h-48 sm:h-72 bg-cyan-500/10 rounded-full blur-2xl sm:blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}

export default FAQs;