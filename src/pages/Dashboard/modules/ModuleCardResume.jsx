import React from "react";
import { FiFileText } from "react-icons/fi";
import { useDarkMode } from "../../../context/DarkModeContext";
import { Link } from "react-router-dom";

function ModuleCardResume() {
  const { darkmode } = useDarkMode();
  return (
    <div className={`rounded-xl shadow p-6 flex flex-col items-start bg-gray-700/20 border border-gray-500`}>
      <div className="mb-3 text-3xl text-indigo-500"><FiFileText /></div>
      <div className={`font-bold mb-1 text-white text-xl`}>AI Quiz</div>
      <div className={`text-sm mb-4 text-gray-400`}>Improve your skills with AI Quiz.</div>
        <Link to="/main-quiz" className="cursor-pointer">
          <button className={`bg-blue-800/20 border border-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700/30 transition cursor-pointer`}>
              Generate Quiz
          </button>
        </Link>
    </div>
  );
}

export default ModuleCardResume;