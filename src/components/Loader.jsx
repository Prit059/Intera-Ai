import React from 'react';

export const PageLoader = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo/Icon */}
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto animate-pulse"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
        </div>
        
        {/* Loading Text with Animation */}
        <h2 className="text-2xl font-bold text-white mb-4 animate-pulse">
          Preparing Your Experience
        </h2>
        
        {/* Progress Bar */}
        <div className="w-64 h-2 bg-gray-700 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-progress"></div>
        </div>
        
        {/* Loading Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {[1, 2, 3].map((dot) => (
            <div
              key={dot}
              className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${dot * 0.2}s` }}
            ></div>
          ))}
        </div>
        
        {/* Subtle Message */}
        <p className="text-gray-400 mt-6 text-sm">
          Loading amazing content just for you...
        </p>
      </div>
    </div>
  );
};

export const ContentLoader = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex space-x-4">
        <div className="rounded-full bg-gray-700 h-12 w-12"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-700 rounded w-4/6"></div>
      </div>
    </div>
  );
};

export const SkeletonLoader = ({ type = 'card' }) => {
  const loaders = {
    card: (
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 animate-pulse">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-700 rounded"></div>
          <div className="h-3 bg-gray-700 rounded w-5/6"></div>
          <div className="h-3 bg-gray-700 rounded w-4/6"></div>
        </div>
      </div>
    ),
    list: (
      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded">
            <div className="w-10 h-10 bg-gray-700 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  };

  return loaders[type] || loaders.card;
};