import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Archive,
  HelpCircle,
  NotebookPen,
  Menu,
  X,
  CreditCard,
  UserCheck
} from "lucide-react";
import { useDarkMode } from "../context/DarkModeContext";
import ProfileInfoCard from "../components/Cards/ProfileInfoCard";

function Navbar() {
  const { darkmode } = useDarkMode();
  const location = useLocation();
  const [openDashboard, setOpenDashboard] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/admin", label: "Home", icon: <Home size={20} /> },
    { path: "/AdDash", label: "Q&A Dashboard", icon: <Archive size={20} />, hasDropdown: true },
    { path: "/AdQuizDashboard", label: "Quiz Dashboard", icon: <HelpCircle size={20} />, hasDropdown: true },
    { path: "/AdAptitudeDashboard", label: "Aptitude Dashboard", icon: <NotebookPen size={20} />, hasDropdown: true },
    { path: "/aptitudepredash", label: "Aptitude Topics", icon: <CreditCard size={20} />, hasDropdown: true },
    { path: "/admin/formula-sheets", label: "Formula Sheets", icon: <UserCheck size={20} />, hasDropdown: false },
    { path: "/admin-approve", label: "Pending Teachers", icon: <UserCheck size={20} />, hasDropdown: false },
  ];

  // const dashboardModules = [
  //   { path: "/dashboard", label: "Interview Prep Q&A", icon: <FileQuestionIcon size={16} /> },
  //   { path: "/main-quiz", label: "AI Quiz", icon: <BookOpen size={16} /> },
  //   { path: "/roadmapgen", label: "AI Roadmap Generator", icon: <MapIcon size={16} /> },
  //   { path: "", label: "AI With Mock Interviews", icon: <ComputerIcon size={16} /> },
  // ];

  // Close mobile menu when route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className={`flex items-center justify-between p-3 sm:p-4 lg:p-0 ${
      darkmode ? "bg-white text-black" : "bg-black text-white"
    }`}>
      {/* Logo */}
      <Link to="/" className="flex-shrink-0">
        <h2 className="text-xl sm:text-2xl lg:text-3xl ml-2 bg-gradient-to-r from-violet-500 to-orange-500 bg-clip-text text-transparent font-bold">
          Intera AI
        </h2>
      </Link>

      {/* Desktop Navbar */}
      <div className={`hidden lg:flex h-16 backdrop-blur-[2px] sticky top-0 z-30 justify-center items-center ${
        darkmode ? "bg-white text-black" : "bg-black text-white"
      }`}>
        <div className="flex items-center gap-4 xl:gap-6 bg-opacity-20 rounded-2xl bg-gray-500/10 px-4 xl:px-6 py-1 border border-gray-900">
          {navItems.map((item) => (
            <div key={item.path} className="relative">
              <Link
                to={item.path}
                className={`relative group p-2 xl:p-3 rounded-xl transition-all duration-300 flex items-center justify-center 
                  ${
                    location.pathname.startsWith(item.path)
                      ? "bg-gradient-to-r from-violet-500 to-orange-500 text-white"
                      : "hover:bg-gray-700/30"
                  }`}
              >
                {item.icon}
                <span className="ml-2 text-sm hidden xl:inline-block">{item.label}</span>
              </Link>

              {/* Dropdown */}
              {/* {item.hasDropdown && openDashboard && (
                <div className="absolute left-0 top-14 bg-gray-900 text-white rounded-lg shadow-lg w-60 py-2 z-40">
                  {dashboardModules.map((module) => (
                    <Link
                      key={module.path}
                      to={module.path}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 transition"
                    >
                      {module.icon}
                      <span>{module.label}</span>
                    </Link>
                  ))}
                </div>
              )} */}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="flex items-center gap-3 lg:hidden">
        {/* Profile for mobile */}
        <div className="sm:mr-2">
          <ProfileInfoCard />
        </div>
        
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`p-2 rounded-lg border ${
            darkmode 
              ? "border-gray-300 bg-white text-black" 
              : "border-gray-700 bg-black text-white"
          }`}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 lg:hidden">
          <div className={`absolute top-0 right-0 h-full w-80 max-w-full ${
            darkmode ? "bg-white text-black" : "bg-gray-900 text-white"
          } shadow-xl`}>
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-700/30"
              >
                <X size={24} />
              </button>
            </div>

            {/* Mobile Navigation Items */}
            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                    location.pathname.startsWith(item.path)
                      ? "bg-gradient-to-r from-violet-500 to-orange-500 text-white"
                      : darkmode 
                        ? "hover:bg-gray-200" 
                        : "hover:bg-gray-700/30"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Additional Mobile Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
              <div className="text-center text-sm text-gray-400">
                Intera AI Admin Panel
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Profile */}
      <div className="hidden lg:block mr-4 xl:mr-6">
        <ProfileInfoCard />
      </div>
    </div>
  );
}

export default Navbar;