import React from 'react';
import { Brain, BookOpen, Target, Zap, Users, Award, TrendingUp, Lightbulb } from 'lucide-react';

export const AIPreparationScene = () => {
  return (
    <div className="relative h-full flex flex-col items-center justify-center w-full overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-radial from-blue-500 to-transparent rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-gradient-radial from-purple-500 to-transparent rounded-full animate-pulse-delayed-slow"></div>
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-radial from-cyan-400 to-transparent rounded-full animate-pulse opacity-20"></div>
      </div>
            {/* Main Logo */}
            <div className="relative z-10 mb-12">
        <div className="flex items-center space-x-4 mb-8">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-purple-500 to-cyan-400 rounded-2xl flex items-center justify-center">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-br from-blue-400 via-purple-500 to-cyan-400 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">
              Intera<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">.AI</span>
            </h1>
            <p className="text-blue-300 text-lg font-medium">Your AI Placement Buddy</p>
          </div>
        </div>
      </div>
      {/* 3D AI Preparation Elements */}
      <div className="relative z-10 grid grid-cols-2 gap-8 max-w-md">
        {/* AI Brain Processing */}
        <div className="relative group">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center transform rotate-6 group-hover:rotate-12 transition-transform duration-500 animate-float">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          <p className="text-center text-white/80 text-sm mt-3 font-medium">AI Learning</p>
        </div>
        {/* Study Materials */}
        <div className="relative group">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center transform -rotate-6 group-hover:-rotate-12 transition-transform duration-500 animate-float-delayed">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          <p className="text-center text-white/80 text-sm mt-3 font-medium">Smart Study</p>
        </div>
        {/* Target Achievement */}
        <div className="relative group">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center transform rotate-12 group-hover:rotate-6 transition-transform duration-500 animate-float">
            <Target className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          <p className="text-center text-white/80 text-sm mt-3 font-medium">Goal Tracking</p>
        </div>
        {/* Performance Boost */}
        <div className="relative group">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-violet-600 rounded-3xl flex items-center justify-center transform -rotate-12 group-hover:-rotate-6 transition-transform duration-500 animate-float-delayed">
            <Zap className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-br from-pink-500 to-violet-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          <p className="text-center text-white/80 text-sm mt-3 font-medium">AI Boost</p>
        </div>
      </div>
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-8 h-8 opacity-30">
        <div className="w-full h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-float">
          <Users className="w-4 h-4 text-white m-2" />
        </div>
      </div>
      <div className="absolute bottom-32 right-16 w-10 h-10 opacity-25">
        <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg transform rotate-45 animate-float-delayed">
          <Award className="w-5 h-5 text-white m-2.5 transform -rotate-45" />
        </div>
      </div>
      <div className="absolute top-1/3 right-12 w-6 h-6 opacity-35">
        <div className="w-full h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-float">
          <TrendingUp className="w-3 h-3 text-white m-1.5" />
        </div>
      </div>
      <div className="absolute bottom-1/4 left-16 w-7 h-7 opacity-30">
        <div className="w-full h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg transform rotate-12 animate-float-delayed">
          <Lightbulb className="w-4 h-4 text-white m-1.5 transform -rotate-12" />
        </div>
      </div>
      {/* Circuit Lines */}
      <div className="absolute top-1/4 left-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-40 animate-pulse transform -rotate-12"></div>
      <div className="absolute bottom-1/3 right-1/3 w-24 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-30 animate-pulse-delayed transform rotate-45"></div>
    </div>
  );
}; 