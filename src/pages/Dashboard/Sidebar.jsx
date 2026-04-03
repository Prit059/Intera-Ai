import React from "react";
import { FiGrid, FiCpu, FiClock, FiCreditCard, FiUser } from "react-icons/fi";
import { useDarkMode } from "../../context/DarkModeContext";
import { Link } from "react-router-dom";

const menu = [
  { icon: <FiClock />, label: "AI Roadmap Generator", to: "/roadmapdashboard" },
  { icon: <FiGrid />, label: "Interview Prep Q&A", to: "/dashboard" },
  { icon: <FiCpu />, label: "AI Quiz" , to:"/main-quiz" },
  { icon: <FiCreditCard />, label: "AI With Mock Interviews", to: "/main-dashboard" },
];

function Sidebar() {
  const { darkmode } = useDarkMode();
  const sidebarStyle = !darkmode
    ? "bg-black text-white border-gray-700"
    : "bg-white text-gray-800 border-gray-200";

  return (
    <aside className={`w-64 ${sidebarStyle} border-r flex flex-col py-8 px-4`}>
      {/* <div className="mb-10 flex items-center gap-3">
        <span className="font-bold text-2xl text-white">
          <Link to="/">
            Intera.AI
          </Link>
        </span>
      </div> */}
      <nav className="md:flex-1">
        {menu.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium mb-1 transition-colors
              ${darkmode 
                ? 'text-gray-800 hover:bg-gray-100 hover:text-blue-600'
                : 'text-white hover:bg-gray-700 hover:text-blue-300'
              }`
            }
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;