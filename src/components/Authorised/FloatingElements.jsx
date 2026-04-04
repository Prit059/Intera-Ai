import React from 'react';

export const FloatingElements = () => {
  return (
    <>
      {/* Floating AI Brain */}
      <div className="absolute top-20 left-10 w-12 h-12 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-pulse">
          <div className="absolute inset-2 bg-gradient-to-tr from-cyan-300 to-blue-400 rounded-full animate-spin-slow">
            <div className="absolute inset-1 bg-gradient-to-bl from-purple-300 to-pink-400 rounded-full"></div>
          </div>
        </div>
      </div>
      {/* Floating Cubes */}
      <div className="absolute top-32 right-16 w-8 h-8 opacity-15">
        <div className="w-full h-full bg-gradient-to-r from-cyan-400 to-blue-500 transform rotate-12 animate-float">
          <div className="absolute inset-1 bg-gradient-to-l from-blue-300 to-purple-400 transform -rotate-6"></div>
        </div>
      </div>
      <div className="absolute bottom-32 left-20 w-6 h-6 opacity-20">
        <div className="w-full h-full bg-gradient-to-t from-purple-400 to-pink-500 transform rotate-45 animate-float-delayed">
          <div className="absolute inset-0.5 bg-gradient-to-b from-cyan-300 to-blue-400 transform rotate-12"></div>
        </div>
      </div>
      {/* AI Circuit Lines */}
      <div className="absolute top-1/4 right-8 w-24 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-30 animate-pulse"></div>
      <div className="absolute top-1/3 left-12 w-16 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-25 animate-pulse-delayed"></div>
      {/* Background Mesh */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-radial from-blue-500 to-transparent rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gradient-radial from-purple-500 to-transparent rounded-full animate-pulse-delayed-slow"></div>
      </div>
    </>
  );
}; 