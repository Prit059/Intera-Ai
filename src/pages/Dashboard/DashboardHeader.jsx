import React from "react";
import { FaArrowCircleRight } from "react-icons/fa"
import { Link } from 'react-router-dom';

function DashboardHeader() {
  return (
    <div className="rounded-xl bg-gradient-to-r from-pink-600/20 via-purple-500/20 to-indigo-500/20 p-7 mb-8 shadow flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-white text-2xl font-bold mb-2">AI With Fun And Creativity</h2>
        <p className="text-white/90 text-sm">
          Unlock your full potential with AI-powered mock interviews, AI Powered Quiz, progress tracking, AI-RoadMap, and AI Powered Q&A insights—all in one seamless platform.
        </p>
      </div>
        <Link to="/demo-page">
          <button className="mt-4 w-40 md:mt-0 border border-gray-600 bg-gray-600/30 text-white flex items-center text-center font-semibold gap-1 px-6 py-2 rounded-lg shadow hover:bg-gray-400/40 cursor-pointer transition">
            <FaArrowCircleRight className="text-white w-5" />
              See Demo
          </button>
        </Link>
    </div>
  );
}

export default DashboardHeader;