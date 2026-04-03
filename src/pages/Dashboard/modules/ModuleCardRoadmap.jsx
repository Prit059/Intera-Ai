import React from "react";
import { FiTrendingUp } from "react-icons/fi";
import { Link } from "react-router-dom";

function ModuleCardRoadmap() {
  return (
    <div className="bg-gray-700/20 border border-gray-500 rounded-xl shadow p-6 flex flex-col items-start">
      <div className="mb-3 text-3xl text-indigo-500"><FiTrendingUp /></div>
      <div className="font-bold text-white text-xl mb-1">AI Roadmap Generator</div>
      <div className="text-gray-400 text-sm mb-4">Build your roadmap</div>
      <Link to="/roadmapdashboard">
        <button className="bg-blue-800/20 border border-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700/30 transition cursor-pointer">
          Generate Now
        </button>
      </Link>
    </div>
  );
}

export default ModuleCardRoadmap;