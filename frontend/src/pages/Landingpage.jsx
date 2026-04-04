import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import Spline from '@splinetool/react-spline';
import RotatingText from '../components/ReactBits/RotatingText';
import Squares from '../components/ReactBits/Squares';
import KeyBenefits from './Home/keybenifits';
import { UserContext } from '../context/userContext';
import Footer from '../pages/Footer/Footer';
import { ArrowRight, Sparkles, Target, BrainCircuit, Trophy, Zap } from "lucide-react";
import CodingDeveloperModel from '../components/CodingDeveloperModel';
// import Navbar from '../components/layouts/Navbar';
import Navbar from '../components/layouts/Navbar';
import { motion } from 'framer-motion';
import WhatWeOffer from './WhatWeOffer';

function Landingpage() {
  const { darkmode, setDarkmode } = useDarkMode();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [userName, setUserName] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const photo = localStorage.getItem('profileImage');
    if (name) setUserName(name);
    if (photo) setUserPhoto(photo);
  }, [user]);

  // Sharp, fast animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };

  const fadeUpVariant = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "tween", ease: "easeOut", duration: 0.6 } }
  };

  // Refined, subtle floating animations for props
  const floatSlow = {
    y: [-5, 5, -5],
    transition: { duration: 8, repeat: Infinity, ease: "easeInOut" }
  };
  const floatReverse = {
    y: [5, -5, 5],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
  };

  const marqueeItems = [
    "Quantitative Aptitude", "AI Mock Interviews", "Logical Reasoning", 
    "HR Q&A Prep", "Live Leaderboards", "Dynamic Roadmaps", 
    "Verbal Ability", "Performance Analytics"
  ];

  return (
    <>
      {/* High-Contrast Container: Pure black background, applying unique Google Font */}
      <div 
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        className={`relative min-h-[100svh] overflow-hidden flex flex-col bg-white text-black`}
      >
        
        {/* SHARP GRID: High contrast, no blurs. Opacity is low but the orange is pure. */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <Squares 
            speed={0.8}
            squareSize={50}
            direction='diagonal'
            borderColor={!darkmode ? '#ea580c' : '#f97316'}
            hoverFillColor={!darkmode ? '#ea580c' : '#ffedd5'}
          />
        </div>

        {/* STRATEGIC PROPS (Positioned to frame the layout perfectly) */}
        {/* 1. Subtle Target framing the top left of the heading */}
        {/* <motion.div animate={floatSlow} className="absolute top-[18%] left-[8%] text-orange-500/20 z-0 hidden lg:block">
          <Target size={80} strokeWidth={1} />
        </motion.div> */}
        
        {/* 2. Brain Circuit balancing the bottom left near the button */}
        <motion.div animate={floatReverse} className="absolute bottom-[28%] left-[45%] text-orange-500/60 z-0 hidden lg:block">
          <BrainCircuit size={40} strokeWidth={1.5} />
        </motion.div>

        {/* 3. Zap icon adding energy behind the 3D model */}
        <motion.div animate={floatSlow} className="absolute top-[35%] right-[10%] text-amber-500/60 z-0 hidden lg:block">
          <Zap size={120} strokeWidth={0.5} />
        </motion.div>

        {/* Navbar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="fixed z-50 w-full border-b border-white/5 backdrop-blur-md"
        >
          <Navbar />
        </motion.div>

        {/* Main Hero Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex-1 flex flex-col-reverse lg:flex-row items-center justify-between px-6 sm:px-8 lg:px-12 pb-24 max-w-7xl mx-auto w-full"
        >
          {/* Left Column: Text Content */}
          <div className="flex-1 flex flex-col gap-6 w-full mt-8 lg:mt-0 lg:pr-10 z-20">
            
            {/* Sharp Pill Badges */}
            <motion.div variants={fadeUpVariant} className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-orange-500 text-xs font-bold text-orange-600 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-black bg-gray-700/20 text-xs font-bold text-gray-700 uppercase tracking-widest">
                <Trophy className="w-3.5 h-3.5" />
                <span>Placement Partner</span>
              </div>
            </motion.div>
            
            {/* Main Heading - High Contrast White & Orange */}
            <motion.h1 variants={fadeUpVariant} className="text-5xl text-black sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05] text-center lg:text-left">
              Master Every <br /> Interview
              
              <span className="text-3xl sm:text-4xl lg:text-5xl font-semibold mt-4 flex items-center justify-center lg:justify-start gap-3 text-gray-700 tracking-normal">
                with
                <span className="text-orange-400 border-b-2 border-orange-500/30 pb-1">
                  <RotatingText
                    texts={['AI Quizzes', 'Smart Q&A', 'Aptitude Tests', 'Live Roadmaps']}
                    mainClassName="inline-flex whitespace-nowrap overflow-hidden"
                    staggerFrom="last"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '-120%' }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden pb-1"
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                    rotationInterval={3000}
                  />
                </span>
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p variants={fadeUpVariant} className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-xl text-center lg:text-left font-light tracking-wide">
              Stop guessing what recruiters want. <span className="text-black font-medium">Conquer aptitude tests, practice real-world scenarios,</span> and refine your answers with instant AI feedback. 
            </motion.p>

            {/* Call to Actions (CTAs) - Sharp, High-Contrast Buttons */}
            <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row items-center gap-4 mt-6 justify-center lg:justify-start">
              <button 
                onClick={() => user ? navigate('/dashboard') : navigate('/login')}
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-white bg-orange-700/60 border border-orange-500 rounded-sm overflow-hidden transition-all hover:bg-orange-400 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto uppercase tracking-wider shadow-[0_0_30px_-10px_rgba(234,88,12,0.8)]"
              >
                <span>Start Practicing Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => navigate('/modules')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-black bg-gray-700/20 border border-black rounded-sm hover:bg-white/10 transition-all w-full sm:w-auto uppercase tracking-wider"
              >
                Explore Curriculum
              </button>
            </motion.div>
          </div>

          {/* Right Column: 3D Spline */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="flex-1 w-full h-[400px] lg:h-[600px] relative z-10 pointer-events-none flex items-center justify-center overflow-hidden"
          >
            {/* Kept the scale hack to hide the Spline logo */}
            <div className="w-[130%] h-[140%] scale-[1.3] lg:scale-[1.4] translate-x-12 translate-y-16 lg:translate-y-6">
              <Spline
                className="w-full h-full"
                scene="https://prod.spline.design/XPVm5T-HhlGioJ6Y/scene.splinecode"
              />
            </div>
          </motion.div>
        </motion.section>

        {/* Sharp Marquee Strip */}
        <div className="absolute bottom-0 left-0 w-full z-30 border-t border-white/10 bg-black/80 backdrop-blur-md py-3">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
          
          <motion.div 
            className="flex whitespace-nowrap gap-12 px-6 items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 25, ease: "linear", repeat: Infinity }}
          >
            {[...marqueeItems, ...marqueeItems].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 bg-orange-500 rotate-45"></div>
                <span className="text-gray-400 font-bold tracking-widest text-xs uppercase">{item}</span>
              </div>
            ))}
          </motion.div>
        </div>

      </div>

      {/* Rest of the sections */}
      <div className={!darkmode ? 'bg-[#000000]' : 'bg-gray-50'}>
        <WhatWeOffer />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <KeyBenefits />
        </motion.div>
        <Footer />
      </div>
    </>
  );
}

export default Landingpage;




{/* <div class="sketchfab-embed-wrapper"> <iframe title="Office Desk Pack" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/6f2657c2f45c4f71b98a3c0437c42555/embed?transparent=1&ui_hint=0"> </iframe> <p style="font-size: 13px; font-weight: normal; margin: 5px; color: #4A4A4A;"> <a href="https://sketchfab.com/3d-models/office-desk-pack-6f2657c2f45c4f71b98a3c0437c42555?utm_medium=embed&utm_campaign=share-popup&utm_content=6f2657c2f45c4f71b98a3c0437c42555" target="_blank" rel="nofollow" style="font-weight: bold; color: #1CAAD9;"> Office Desk Pack </a> by <a href="https://sketchfab.com/outlier_spa?utm_medium=embed&utm_campaign=share-popup&utm_content=6f2657c2f45c4f71b98a3c0437c42555" target="_blank" rel="nofollow" style="font-weight: bold; color: #1CAAD9;"> Outlier Spa </a> on <a href="https://sketchfab.com?utm_medium=embed&utm_campaign=share-popup&utm_content=6f2657c2f45c4f71b98a3c0437c42555" target="_blank" rel="nofollow" style="font-weight: bold; color: #1CAAD9;">Sketchfab</a></p></div>

this Developer Desk put  */}