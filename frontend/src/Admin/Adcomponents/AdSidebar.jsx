import React, { useState } from "react";
import { FiGrid, FiCpu, FiPenTool } from "react-icons/fi";
import { useDarkMode } from "../../context/DarkModeContext";
import { Link, useLocation } from "react-router-dom";

const menu = [
  { 
    icon: <FiGrid size={20} />, 
    label: "Interview Q&A", 
    to: "/admin",
    fullLabel: "Create Interview Prep Q&A"
  },
  { 
    icon: <FiCpu size={20} />, 
    label: "Create Quiz", 
    to: "/admin/AdQuiz",
    fullLabel: "Create Quiz"
  },
  { 
    icon: <FiPenTool size={20} />, 
    label: "Aptitude Test", 
    to: "/admin/AdAptitude",
    fullLabel: "Create Aptitude Test"
  },
];

function Sidebar() {
  const { darkmode } = useDarkMode();
  const location = useLocation();
  const [activeHover, setActiveHover] = useState(null);

  const sidebarStyle = !darkmode
    ? "bg-black text-white border-gray-700"
    : "bg-white text-gray-800 border-gray-200";

  const mobileNavStyle = !darkmode
    ? "bg-gray-900 border-gray-700"
    : "bg-white border-gray-200";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block w-72 ${sidebarStyle} border-r min-h-screen flex flex-col py-8 px-4`}>
        <div className="mb-10 flex items-center gap-3">
          <span className="font-bold text-2xl text-white">
            Admin Dashboard
          </span>
        </div>
        <nav className="flex-1">
          {menu.map((item) => {
            const isActive = location.pathname === item.to;

            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-md font-bold mb-1 transition-all duration-300
                  ${
                    isActive
                      ? "hover:scale-103 bg-gradient-to-r from-violet-500/30 to-orange-400/30 text-white shadow-lg"
                      : "hover:text-white hover:border border-gray-500 hover:scale-103 transition-all duration-100"
                  }`}
              >
                {item.icon}
                {item.fullLabel}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 ${mobileNavStyle} border-t shadow-2xl z-50`}>
        <div className="flex justify-around items-center">
          {menu.map((item, index) => {
            const isActive = location.pathname === item.to;
            const isHovered = activeHover === index;

            return (
              <div key={item.label} className="relative flex-1">
                <Link
                  to={item.to}
                  className={`flex flex-col items-center justify-center py-3 transition-all duration-300 relative
                    ${isActive 
                      ? 'text-white' 
                      : darkmode ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  onMouseEnter={() => setActiveHover(index)}
                  onMouseLeave={() => setActiveHover(null)}
                  onTouchStart={() => setActiveHover(index)}
                  onTouchEnd={() => setActiveHover(null)}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gradient-to-r from-violet-500 to-orange-500 rounded-full" />
                  )}

                  {/* Animated Icon Container */}
                  <div className={`
                    relative p-3 rounded-2xl transition-all duration-500 transform
                    ${isActive 
                      ? 'bg-gradient-to-br from-violet-500 to-orange-500 scale-110 shadow-lg' 
                      : isHovered 
                        ? 'bg-gray-700/30 scale-105' 
                        : 'bg-transparent scale-100'
                    }
                  `}>
                    {/* Floating Animation for Active State */}
                    {/* {isActive && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-orange-500 animate-ping opacity-20" />
                    )} */}
                    
                    {/* Icon with Glow Effect */}
                    <div className={`
                      relative transition-all duration-300
                      ${isActive ? 'text-white scale-110' : ''}
                      ${isHovered && !isActive ? 'scale-105' : ''}
                    `}>
                      {item.icon}
                    </div>

                    {/* Notification Dot for Active State */}
                    {/* {isActive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                    )} */}
                  </div>

                  {/* Label with Slide-up Animation */}
                  <span className={`
                    text-xs font-semibold mt-2 transition-all duration-300 transform
                    ${isActive || isHovered 
                      ? 'opacity-100 translate-y-0 text-white' 
                      : 'opacity-70 translate-y-1'
                    }
                    ${isActive ? 'font-bold' : ''}
                  `}>
                    {item.label}
                  </span>
                </Link>

                {/* Hover Tooltip */}
                {isHovered && !isActive && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap shadow-xl">
                    {item.fullLabel}
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                  </div>
                )}

                {/* Active State Pulse Effect */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/10 to-orange-500/10 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        {/* Background Glow Effect for Active State */}
        <div className="absolute inset-0 pointer-events-none">
          {menu.map((item, index) => {
            const isActive = location.pathname === item.to;
            if (!isActive) return null;
            
            return (
              <div
                key={item.label}
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500/30 to-orange-500/30 blur-sm"
                style={{
                  left: `${(index / menu.length) * 100}%`,
                  width: `${100 / menu.length}%`
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-black text-white p-4 z-40 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-violet-500 to-orange-500 bg-clip-text text-transparent">
            Intera AI Admin
          </h1>
          <div className="text-sm text-gray-400">
            {menu.find(item => location.pathname === item.to)?.fullLabel || 'Admin Panel'}
          </div>
        </div>
      </div>

      {/* Spacer for Mobile Content */}
      <div className="lg:hidden h-32" />
    </>
  );
}

export default Sidebar;