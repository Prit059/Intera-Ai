import React from "react";
import { FiMail,FiMic } from "react-icons/fi";
import { Link } from "react-router-dom";
function ModuleCardinterview() {
  return (
    <div className={`rounded-xl shadow p-6 flex flex-col items-start bg-gray-600/20 border border-gray-500`}>
      <div className="mb-3 text-3xl text-indigo-500"><FiMic /></div>
      <div className={`font-bold mb-1 text-xl text-white`}>AI With Mock Interviews</div>
      <div className={`text-sm mb-4 text-gray-400`}>Preparation Interview with AI</div>
      <Link to="/interviewhomepage" className="cursor-pointer">
        <button className={`bg-blue-800/20 border border-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700/30 transition cursor-pointer`}>
          Create Now
        </button>
      </Link>
    </div>
  );
}

export default ModuleCardinterview;