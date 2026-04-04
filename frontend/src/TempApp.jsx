import React from 'react';
import { FiClock, FiZap, FiHeart, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';

function TempApp() {
  return (
    <div className='min-h-screen bg-black text-white overflow-hidden'>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20"></div>
      </div>

      <div className='relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12'>
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className='max-w-4xl text-center'
        >
          {/* Icon/Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className='mb-8'
          >
            <div className='text-5xl font-semibold'>
              Intera.AI
            </div>
          </motion.div>

          {/* Main Message */}
          <h1 className='text-3xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent'>
            Exciting Update Coming!
          </h1>
          
          <div className='mb-8'>
            <p className='text-2xl md:text-3xl text-gray-200 mb-4'>
              We're upgrading your experience with something amazing
            </p>
            <div className='h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6'></div>
          </div>

          {/* Feature Highlights */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-10'>
            <div className='p-6 rounded-xl bg-gray-900/30 border border-gray-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300'>
              {/* <FiRocket className='text-3xl text-blue-400 mb-4 mx-auto' /> */}
              <h3 className='text-xl font-semibold mb-2'>Enhanced Performance</h3>
              <p className='text-gray-300'>Faster, smarter, and more intuitive</p>
            </div>
            
            <div className='p-6 rounded-xl bg-gray-900/30 border border-gray-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300'>
              <FiStar className='text-3xl text-purple-400 mb-4 mx-auto' />
              <h3 className='text-xl font-semibold mb-2'>New Features</h3>
              <p className='text-gray-300'>Cutting-edge tools you'll love</p>
            </div>
            
            <div className='p-6 rounded-xl bg-gray-900/30 border border-gray-700/50 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300'>
              <FiHeart className='text-3xl text-cyan-400 mb-4 mx-auto' />
              <h3 className='text-xl font-semibold mb-2'>Improved Experience</h3>
              <p className='text-gray-300'>Smoother workflow for everyone</p>
            </div>
          </div>

          {/* Countdown/Status */}
          <div className='mb-10 p-6 rounded-2xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 backdrop-blur-sm'>
            <div className='flex items-center justify-center gap-4 mb-4'>
              <FiClock className='text-2xl text-blue-400 animate-pulse' />
              <span className='text-xl font-medium'>Launching Soon</span>
            </div>
            <p className='text-gray-300 mb-2'>
              Our team is working tirelessly to bring you the best version yet
            </p>
            
          </div>

          {/* Call to Action */}
          <div className='space-y-6'>
            <div className='space-y-3'>
              <p className='text-lg'>
                Stay connected for updates and be the first to experience the new Intera.AI
              </p>
              
            </div>
          </div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className='mt-5 pt-6 border-t border-gray-800'
          >
            <p className='text-gray-400 text-sm'>
              Thank you for your patience and continued support. 
              <span className='block mt-1 text-cyan-300'>The future of Intera.AI is just around the corner! ✨</span>
            </p>
          </motion.div>
        </motion.div>

        {/* Floating Elements */}
        <div className='absolute bottom-10 left-10 text-gray-500/30 animate-bounce'>
          <div className='text-sm'>🚀</div>
        </div>
        <div className='absolute top-10 right-10 text-gray-500/30 animate-bounce delay-300'>
          <div className='text-sm'>⚡</div>
        </div>
        <div className='absolute top-1/4 left-10 text-gray-500/30 animate-pulse delay-700'>
          <div className='text-sm'>💫</div>
        </div>
      </div>
    </div>
  );
}

export default TempApp;