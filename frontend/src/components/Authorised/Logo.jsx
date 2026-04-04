import React from 'react';
import { Brain } from 'lucide-react';

export const Logo = () => {
  return (
    <div className="flex items-center space-x-3 mb-8">
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg blur opacity-30 animate-pulse"></div>
      </div>
      <h1 className="text-2xl font-bold text-white">
        Intera<span className="text-blue-400">.AI</span>
      </h1>
    </div>
  );
}; 