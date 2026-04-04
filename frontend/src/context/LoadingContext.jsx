import React, { createContext, useContext, useState } from 'react';
import { PageLoader } from '../components/Loader.jsx';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const showLoading = (message = 'Loading...') => {
    setLoadingMessage(message);
    setLoading(true);
  };

  const hideLoading = () => {
    setLoading(false);
    setLoadingMessage('Loading...');
  };

  return (
    <LoadingContext.Provider value={{ loading, showLoading, hideLoading, loadingMessage }}>
      {children}
      {loading && <GlobalLoader message={loadingMessage} />}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

const GlobalLoader = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm mx-4">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
          <div className="absolute inset-2 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        
        <h3 className="text-white text-center text-lg font-semibold mb-2">
          {message}
        </h3>
        
        <div className="flex justify-center space-x-1">
          {[1, 2, 3].map((dot) => (
            <div
              key={dot}
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${dot * 0.1}s` }}
            ></div>
          ))}
        </div>
        
        <p className="text-gray-400 text-center text-sm mt-4">
          {getRandomTip()}
        </p>
      </div>
    </div>
  );
};

const tips = [
  "Did you know? Regular practice improves problem-solving skills!",
  "Pro tip: Take breaks between study sessions for better retention",
  "Fun fact: The brain learns better with visual aids",
  "Remember: Consistency is key to mastering any skill",
  "Tip: Stay hydrated for better concentration"
];

const getRandomTip = () => {
  return tips[Math.floor(Math.random() * tips.length)];
};