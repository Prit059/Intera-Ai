import React from "react";
import { Link } from "react-router-dom";
import { useDarkMode } from "../../../context/DarkModeContext";
import { FiMessageSquare } from "react-icons/fi";

function ModuleCardQA() {
  const { darkmode } = useDarkMode();
  return (
    <div className={` rounded-xl p-6 flex flex-col items-start bg-gray-700/20 border border-gray-500`}>
      <div className="mb-3 text-3xl text-indigo-500"><FiMessageSquare /></div>
      <div className="font-bold mb-1 text-xl">Interview Prep Q&A</div>
      <div className="text-gray-400 text-sm mb-4">Ask Interview questions</div>
        <Link to={"/dashboard"} className="cursor-pointer">
          <button className="bg-blue-800/20 border border-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700/30 transition cursor-pointer">
              Ask Now
          </button>
        </Link>
    </div>
  );
}
  
export default ModuleCardQA;