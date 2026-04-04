// import React, { useState, useContext } from "react";
// import { Link, useLocation } from "react-router-dom";
// import {
//   Home,
//   Archive,
//   User,
//   Video,
//   FileQuestionIcon,
//   BookOpen,
//   MapIcon,
//   ComputerIcon,
//   ChevronDown,
//   Trophy,
//   BookAlertIcon,
//   NotebookPen,
//   Menu,
//   X,
//   FileText,
// } from "lucide-react";
// import ProfileInfoCard from "../Cards/ProfileInfoCard";
// import { UserContext } from "../../context/userContext";

// function Navbar() {
//   const location = useLocation();
//   const [openDashboard, setOpenDashboard] = useState(false);
//   const [openAptitude, setOpenAptitude] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState({ dashboard: false, aptitude: false });
//   const { user } = useContext(UserContext);
  
//   // Define modules for each dropdown
//   const aptitudeModules = [
//     { path: "/aptitudeprephome", label: "Preparation & Learning", icon: <BookOpen size={16} /> },
//     { path: "/userAptitudeDashboard", label: "Contests & Tests", icon: <Trophy size={16} /> },
//   ];

//   const dashboardModules = [
//     { path: "/dashboard", label: "Interview Prep Q&A", icon: <FileQuestionIcon size={16} /> },
//     { path: "/main-quiz", label: "AI Quiz", icon: <BookOpen size={16} /> },
//     { path: "/roadmapdashboard", label: "AI Roadmap Generator", icon: <MapIcon size={16} /> },
//     { path: "/mock-interview", label: "AI With Mock Interviews", icon: <ComputerIcon size={16} /> },
//   ];

//   // Get current active module for dropdowns
//   const getActiveModule = (dropdownId) => {
//     const modules = dropdownId === "aptitude" ? aptitudeModules : dashboardModules;
//     return modules.find(module => location.pathname.startsWith(module.path));
//   };

//   // Get dynamic label for dropdown
//   const getDropdownLabel = (dropdownId) => {
//     const activeModule = getActiveModule(dropdownId);
    
//     switch(dropdownId) {
//       case "aptitude":
//         return activeModule ? `${activeModule.label}` : "Aptitude";
//       case "dashboard":
//         return activeModule ? `${activeModule.label}` : "Dashboard";
//       default:
//         return "Menu";
//     }
//   };

//   // Get dropdown icon (show active module's icon)
//   const getDropdownIcon = (dropdownId) => {
//     const activeModule = getActiveModule(dropdownId);
    
//     if (activeModule) {
//       return React.cloneElement(activeModule.icon, { size: 20 });
//     }
    
//     // Default icons
//     switch(dropdownId) {
//       case "aptitude":
//         return <NotebookPen size={20} />;
//       case "dashboard":
//         return <Archive size={20} />;
//       default:
//         return <Archive size={20} />;
//     }
//   };

//   const navItems = [
//     { path: "/", label: "Home", icon: <Home size={20} />, exact: true },
//     { 
//       path: "/main-dashboard", 
//       label: "Dashboard", 
//       icon: <Archive size={20} />, 
//       dropdownId: "dashboard",
//       hasDropdown: true,
//       subPaths: ["/dashboard", "/main-quiz", "/roadmapdashboard", "/roadmapgen", "/mock-interview"]
//     },
//     // { path: "/userprofile", label: "Profile", icon: <User size={20} /> },
//     { path: "/userInterviewDashboard", label: "Interview Prep Q&A", icon: <Trophy size={20} /> },
//     { path: "/userQuizDashboard", label: "Quiz Contest", icon: <BookAlertIcon size={20} /> }, 
//     { 
//       path: "#",
//       label: "Aptitude",
//       icon: <NotebookPen size={20} />,
//       dropdownId: "aptitude",
//       hasDropdown: true,
//       subPaths: ["/aptitudeprephome", "/userAptitudeDashboard"]
//     },
//     { path: "/demo-page", label: "Demo", icon: <Video size={20} /> },
//   ];

//   // Check if a nav item is active
//   const isActive = (item) => {
//     if (item.exact) {
//       return location.pathname === item.path;
//     }
    
//     if (item.hasDropdown && item.subPaths) {
//       return item.subPaths.some(subPath => location.pathname.startsWith(subPath)) || 
//             location.pathname.startsWith(item.path);
//     }
    
//     return location.pathname.startsWith(item.path) && 
//           (item.path === "/" ? location.pathname === "/" : true);
//   };

//   // Get dropdown modules based on dropdownId
//   const getDropdownModules = (dropdownId) => {
//     if (dropdownId === "aptitude") return aptitudeModules;
//     if (dropdownId === "dashboard") return dashboardModules;
//     return [];
//   };

//   // Toggle mobile submenu
//   const toggleMobileSubmenu = (dropdownId) => {
//     setMobileSubmenuOpen(prev => ({
//       ...prev,
//       [dropdownId]: !prev[dropdownId]
//     }));
//   };

//   // Close mobile menu when navigating
//   const handleMobileLinkClick = () => {
//     setMobileMenuOpen(false);
//     setMobileSubmenuOpen({ dashboard: false, aptitude: false });
//   };

//   // Check if user is admin (for showing admin link)
//   const isAdmin = user?.role === "admin" || user?.role === "superadmin";

//   return (
//     // blur in background
//     <nav className={`fixed w-350 left-15 top-3 rounded-full items-center text-center backdrop-blur-2xl shadow-lg shadow-gray-800 border-b border-gray-700 bg-gray-800/50`}>
//       <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
          
//           {/* Logo */}
//           <Link to="/" className="items-start text-left">
//             <h2 className="text-2xl bg-gradient-to-r from-gray-100 to-orange-400 bg-clip-text text-transparent font-bold">
//               Intera.AI
//             </h2>
//           </Link>

//           {/* Desktop Navigation */}
//           {user && (
//             <div className="hidden md:flex items-center space-x-1">
//               {navItems.map((item) => {
//                 // Get dynamic label and icon for dropdown items
//                 const isDropdown = item.hasDropdown;
//                 const displayLabel = isDropdown ? getDropdownLabel(item.dropdownId) : item.label;
//                 const displayIcon = isDropdown ? getDropdownIcon(item.dropdownId) : item.icon;
                
//                 return (
//                   <div key={item.path} className="relative group">
//                     <Link
//                       to={item.path}
//                       onClick={(e) => {
//                         if (item.dropdownId === "dashboard") setOpenDashboard(!openDashboard);
//                         if (item.dropdownId === "aptitude") setOpenAptitude(!openAptitude);
//                       }}
//                       className={`relative flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
//                         isActive(item)
//                           ? "bg-orange-800/40 border border-orange-400/50 text-white"
//                           : `text-white hover:bg-gray-700/40`
//                       }`}
//                     >
//                       <span className="mr-2">{displayIcon}</span>
//                       <span className="truncate max-w-[150px]">
//                         {displayLabel}
//                       </span>
                      
//                       {/* Desktop dropdown arrow */}
//                       {item.hasDropdown && (
//                         <ChevronDown
//                           size={16}
//                           className={`ml-1 transition-transform duration-200 ${
//                             (item.dropdownId === "dashboard" && openDashboard) || 
//                             (item.dropdownId === "aptitude" && openAptitude) 
//                               ? "rotate-180" : ""
//                           }`}
//                         />
//                       )}
//                     </Link>

//                     {/* Desktop dropdown */}
//                     {item.hasDropdown && (
//                       <div 
//                         className={`absolute left-0 top-12 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-56 ${
//                           (item.dropdownId === "dashboard" && openDashboard) || 
//                           (item.dropdownId === "aptitude" && openAptitude) 
//                             ? "opacity-100 visible" : ""
//                         }`}
//                         onMouseLeave={() => {
//                           if (item.dropdownId === "dashboard") setOpenDashboard(false);
//                           if (item.dropdownId === "aptitude") setOpenAptitude(false);
//                         }}
//                       >
//                         <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 py-2 mt-2">
//                           {getDropdownModules(item.dropdownId)
//                             .filter(module => {
//                               // Hide admin link for non-admin users
//                               if (module.path === "/admin/aptitude" && !isAdmin) return false;
//                               return true;
//                             })
//                             .map((module) => (
//                               <Link
//                                 key={module.path}
//                                 to={module.path}
//                                 className={`flex items-center px-4 py-2 text-sm ${
//                                   location.pathname.startsWith(module.path) 
//                                     ? "bg-violet-900/20 text-violet-400"
//                                     : "text-gray-300 hover:bg-gray-700"
//                                 }`}
//                               >
//                                 <span className="mr-3">{module.icon}</span>
//                                 <span>{module.label}</span>
//                                 {location.pathname.startsWith(module.path) && (
//                                   <span className="ml-auto text-violet-400">✓</span>
//                                 )}
//                               </Link>
//                             ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//           {/* Auth Buttons / Profile */}
//           <div className="flex items-center space-x-2">
//             {user ? (
//               <div className="flex items-center space-x-3">
//                 <ProfileInfoCard />
//               </div>
//             ) : (
//               <>
//                 <Link to="/login">
//                   <button className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
//                     Login
//                   </button>
//                 </Link>
//                 <Link to="/signup">
//                   <button className="hidden sm:block bg-blue-700/20 border border-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200">
//                     Sign Up
//                   </button>
//                 </Link>
//               </>
//             )}

//             {/* Mobile menu button */}
//             <button
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-800"
//             >
//               {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Navigation Menu */}
//         {mobileMenuOpen && (
//           <div className="md:hidden absolute top-16 left-0 right-0 bg-gray-900 border-b border-gray-700 shadow-lg">
//             <div className="px-4 py-2 space-y-1">
//               {user ? (
//                 <>
//                   {navItems.map((item) => {
//                     const isDropdown = item.hasDropdown;
//                     const displayLabel = isDropdown ? getDropdownLabel(item.dropdownId) : item.label;
//                     const displayIcon = isDropdown ? getDropdownIcon(item.dropdownId) : item.icon;
                    
//                     return (
//                       <div key={item.path}>
//                         {item.hasDropdown ? (
//                           <>
//                             <button
//                               onClick={() => toggleMobileSubmenu(item.dropdownId)}
//                               className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium transition-colors ${
//                                 isActive(item)
//                                   ? "bg-gradient-to-r from-violet-500/30 to-orange-500/30 text-white"
//                                   : "text-gray-300 hover:bg-gray-800"
//                               }`}
//                             >
//                               <div className="flex items-center">
//                                 <span className="mr-3">{displayIcon}</span>
//                                 <span className="truncate">{displayLabel}</span>
//                               </div>
//                               <ChevronDown
//                                 size={18}
//                                 className={`transition-transform duration-200 ${
//                                   mobileSubmenuOpen[item.dropdownId] ? "rotate-180" : ""
//                                 }`}
//                               />
//                             </button>
                            
//                             {/* Mobile submenu */}
//                             {mobileSubmenuOpen[item.dropdownId] && (
//                               <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-700 pl-4">
//                                 {getDropdownModules(item.dropdownId)
//                                   .filter(module => {
//                                     // Hide admin link for non-admin users
//                                     if (module.path === "/admin/aptitude" && !isAdmin) return false;
//                                     return true;
//                                   })
//                                   .map((module) => (
//                                     <Link
//                                       key={module.path}
//                                       to={module.path}
//                                       onClick={handleMobileLinkClick}
//                                       className={`flex items-center px-3 py-2 rounded-lg text-sm ${
//                                         location.pathname.startsWith(module.path)
//                                           ? "bg-violet-900/20 text-violet-400"
//                                           : "text-gray-300 hover:bg-gray-800"
//                                       }`}
//                                     >
//                                       <span className="mr-3">{module.icon}</span>
//                                       <span className="flex-1">{module.label}</span>
//                                       {location.pathname.startsWith(module.path) && (
//                                         <span className="text-violet-400 ml-2">✓</span>
//                                       )}
//                                     </Link>
//                                   ))}
//                               </div>
//                             )}
//                           </>
//                         ) : (
//                           <Link
//                             to={item.path}
//                             onClick={handleMobileLinkClick}
//                             className={`flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors ${
//                               isActive(item)
//                                 ? "bg-gradient-to-r from-violet-700/20 to-orange-700/20 text-violet-400"
//                                 : "text-gray-300 hover:bg-gray-800"
//                             }`}
//                           >
//                             <span className="mr-3">{item.icon}</span>
//                             {item.label}
//                           </Link>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </>
//               ) : (
//                 <>
//                   <Link
//                     to="/login"
//                     onClick={handleMobileLinkClick}
//                     className="flex items-center px-3 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-gray-800"
//                   >
//                     <span className="mr-3">🔐</span>
//                     Login
//                   </Link>
//                   <Link
//                     to="/signup"
//                     onClick={handleMobileLinkClick}
//                     className="flex items-center px-3 py-3 rounded-lg text-base font-medium bg-gradient-to-r from-violet-500 to-orange-500 text-white justify-center"
//                   >
//                     <span className="mr-3">🚀</span>
//                     Sign Up
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// }

// export default Navbar;

import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Archive,
  User,
  Video,
  FileQuestionIcon,
  BookOpen,
  MapIcon,
  ComputerIcon,
  ChevronDown,
  Trophy,
  BookAlertIcon,
  NotebookPen,
  Menu,
  X,
  FileText,
  BookHeadphones
} from "lucide-react";
import ProfileInfoCard from "../Cards/ProfileInfoCard";
import { UserContext } from "../../context/userContext";

function Navbar() {
  const location = useLocation();
  const [openDashboard, setOpenDashboard] = useState(false);
  const [openAptitude, setOpenAptitude] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState({ dashboard: false, aptitude: false });
  const { user } = useContext(UserContext);
  
  // Define modules for each dropdown
  const aptitudeModules = [
    { path: "/aptitudeprephome", label: "Preparation & Learning", icon: <BookOpen size={16} /> },
    { path: "/userAptitudeDashboard", label: "Contests & Tests", icon: <Trophy size={16} /> },
  ];

  const dashboardModules = [
    { path: "/dashboard", label: "Interview Prep Q&A", icon: <FileQuestionIcon size={16} /> },
    { path: "/main-quiz", label: "AI Quiz", icon: <BookOpen size={16} /> },
    { path: "/roadmapdashboard", label: "AI Roadmap Generator", icon: <MapIcon size={16} /> },
    { path: "/mock-interview", label: "AI With Mock Interviews", icon: <ComputerIcon size={16} /> },
  ];

  // Get current active module for dropdowns
  const getActiveModule = (dropdownId) => {
    const modules = dropdownId === "aptitude" ? aptitudeModules : dashboardModules;
    return modules.find(module => location.pathname.startsWith(module.path));
  };

  // Get dynamic label for dropdown
  const getDropdownLabel = (dropdownId) => {
    const activeModule = getActiveModule(dropdownId);
    
    switch(dropdownId) {
      case "aptitude":
        return activeModule ? `${activeModule.label}` : "Aptitude";
      case "dashboard":
        return activeModule ? `${activeModule.label}` : "Dashboard";
      default:
        return "Menu";
    }
  };

  // Get dropdown icon (show active module's icon)
  const getDropdownIcon = (dropdownId) => {
    const activeModule = getActiveModule(dropdownId);
    
    if (activeModule) {
      return React.cloneElement(activeModule.icon, { size: 20 });
    }
    
    // Default icons
    switch(dropdownId) {
      case "aptitude":
        return <NotebookPen size={20} />;
      case "dashboard":
        return <Archive size={20} />;
      default:
        return <Archive size={20} />;
    }
  };

  const navItems = [
    { path: "/", label: "Home", icon: <Home size={20} />, exact: true },
    { 
      path: "/main-dashboard", 
      label: "Dashboard", 
      icon: <Archive size={20} />, 
      dropdownId: "dashboard",
      hasDropdown: true,
      subPaths: ["/dashboard", "/main-quiz", "/roadmapdashboard", "/roadmapgen", "/mock-interview"]
    },
    // { path: "/userprofile", label: "Profile", icon: <User size={20} /> },
    { path: "/userInterviewDashboard", label: "Interview Prep Q&A", icon: <Trophy size={20} /> },
    { path: "/userQuizDashboard", label: "Quiz Contest", icon: <BookAlertIcon size={20} /> }, 
    { 
      path: "#",
      label: "Aptitude",
      icon: <NotebookPen size={20} />,
      dropdownId: "aptitude",
      hasDropdown: true,
      subPaths: ["/aptitudeprephome", "/userAptitudeDashboard"]
    },
    { path: "/formulas", label: "Formulas", icon: <BookHeadphones size={20} /> },
    // { path: "/demo-page", label: "Demo", icon: <Video size={20} /> },
  ];

  // Check if a nav item is active
  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    
    if (item.hasDropdown && item.subPaths) {
      return item.subPaths.some(subPath => location.pathname.startsWith(subPath)) || 
            location.pathname.startsWith(item.path);
    }
    
    return location.pathname.startsWith(item.path) && 
          (item.path === "/" ? location.pathname === "/" : true);
  };

  // Get dropdown modules based on dropdownId
  const getDropdownModules = (dropdownId) => {
    if (dropdownId === "aptitude") return aptitudeModules;
    if (dropdownId === "dashboard") return dashboardModules;
    return [];
  };

  // Toggle mobile submenu
  const toggleMobileSubmenu = (dropdownId) => {
    setMobileSubmenuOpen(prev => ({
      ...prev,
      [dropdownId]: !prev[dropdownId]
    }));
  };

  // Close mobile menu when navigating
  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
    setMobileSubmenuOpen({ dashboard: false, aptitude: false });
  };

  // Check if user is admin (for showing admin link)
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-lg border-b  border-gray-700`}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-3">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="items-start text-left">
            <h2 className="text-2xl bg-gradient-to-r from-black to-orange-400 bg-clip-text text-transparent font-bold">
              Intera.AI
            </h2>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                // Get dynamic label and icon for dropdown items
                const isDropdown = item.hasDropdown;
                const displayLabel = isDropdown ? getDropdownLabel(item.dropdownId) : item.label;
                const displayIcon = isDropdown ? getDropdownIcon(item.dropdownId) : item.icon;
                
                return (
                  <div key={item.path} className="relative group">
                    <Link
                      to={item.path}
                      onClick={(e) => {
                        if (item.dropdownId === "dashboard") setOpenDashboard(!openDashboard);
                        if (item.dropdownId === "aptitude") setOpenAptitude(!openAptitude);
                      }}
                      className={`relative flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                        isActive(item)
                          ? "bg-orange-600/10 border border-orange-400/50 text-black"
                          : `text-black hover:bg-gray-700/40`
                      }`}
                    >
                      <span className="mr-2">{displayIcon}</span>
                      <span className="truncate max-w-[150px]">
                        {displayLabel}
                      </span>
                      
                      {/* Desktop dropdown arrow */}
                      {item.hasDropdown && (
                        <ChevronDown
                          size={16}
                          className={`ml-1 transition-transform duration-200 ${
                            (item.dropdownId === "dashboard" && openDashboard) || 
                            (item.dropdownId === "aptitude" && openAptitude) 
                              ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </Link>

                    {/* Desktop dropdown */}
                    {item.hasDropdown && (
                      <div 
                        className={`absolute left-0 top-12 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-56 ${
                          (item.dropdownId === "dashboard" && openDashboard) || 
                          (item.dropdownId === "aptitude" && openAptitude) 
                            ? "opacity-100 visible" : ""
                        }`}
                        onMouseLeave={() => {
                          if (item.dropdownId === "dashboard") setOpenDashboard(false);
                          if (item.dropdownId === "aptitude") setOpenAptitude(false);
                        }}
                      >
                        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 py-2 mt-2">
                          {getDropdownModules(item.dropdownId)
                            .filter(module => {
                              // Hide admin link for non-admin users
                              if (module.path === "/admin/aptitude" && !isAdmin) return false;
                              return true;
                            })
                            .map((module) => (
                              <Link
                                key={module.path}
                                to={module.path}
                                className={`flex items-center px-4 py-2 text-sm ${
                                  location.pathname.startsWith(module.path) 
                                    ? "bg-violet-900/20 text-violet-400"
                                    : "text-gray-300 hover:bg-gray-700"
                                }`}
                              >
                                <span className="mr-3">{module.icon}</span>
                                <span>{module.label}</span>
                                {location.pathname.startsWith(module.path) && (
                                  <span className="ml-auto text-violet-400">✓</span>
                                )}
                              </Link>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Auth Buttons / Profile */}
          <div className="flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-3">
                <ProfileInfoCard />
              </div>
            ) : (
              <>
                <Link to="/login">
                  <button className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-300 hover:text-violet-400 transition-colors">
                    Login
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="hidden sm:block bg-blue-700/20 border border-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200">
                    Sign Up
                  </button>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-800"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-gray-900 border-b border-gray-700 shadow-lg">
            <div className="px-4 py-2 space-y-1">
              {user ? (
                <>
                  {navItems.map((item) => {
                    const isDropdown = item.hasDropdown;
                    const displayLabel = isDropdown ? getDropdownLabel(item.dropdownId) : item.label;
                    const displayIcon = isDropdown ? getDropdownIcon(item.dropdownId) : item.icon;
                    
                    return (
                      <div key={item.path}>
                        {item.hasDropdown ? (
                          <>
                            <button
                              onClick={() => toggleMobileSubmenu(item.dropdownId)}
                              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                                isActive(item)
                                  ? "bg-gradient-to-r from-violet-500/30 to-orange-500/30 text-white"
                                  : "text-gray-300 hover:bg-gray-800"
                              }`}
                            >
                              <div className="flex items-center">
                                <span className="mr-3">{displayIcon}</span>
                                <span className="truncate">{displayLabel}</span>
                              </div>
                              <ChevronDown
                                size={18}
                                className={`transition-transform duration-200 ${
                                  mobileSubmenuOpen[item.dropdownId] ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                            
                            {/* Mobile submenu */}
                            {mobileSubmenuOpen[item.dropdownId] && (
                              <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-700 pl-4">
                                {getDropdownModules(item.dropdownId)
                                  .filter(module => {
                                    // Hide admin link for non-admin users
                                    if (module.path === "/admin/aptitude" && !isAdmin) return false;
                                    return true;
                                  })
                                  .map((module) => (
                                    <Link
                                      key={module.path}
                                      to={module.path}
                                      onClick={handleMobileLinkClick}
                                      className={`flex items-center px-3 py-2 rounded-lg text-sm ${
                                        location.pathname.startsWith(module.path)
                                          ? "bg-violet-900/20 text-violet-400"
                                          : "text-gray-300 hover:bg-gray-800"
                                      }`}
                                    >
                                      <span className="mr-3">{module.icon}</span>
                                      <span className="flex-1">{module.label}</span>
                                      {location.pathname.startsWith(module.path) && (
                                        <span className="text-violet-400 ml-2">✓</span>
                                      )}
                                    </Link>
                                  ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <Link
                            to={item.path}
                            onClick={handleMobileLinkClick}
                            className={`flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                              isActive(item)
                                ? "bg-gradient-to-r from-violet-700/20 to-orange-700/20 text-violet-400"
                                : "text-gray-300 hover:bg-gray-800"
                            }`}
                          >
                            <span className="mr-3">{item.icon}</span>
                            {item.label}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={handleMobileLinkClick}
                    className="flex items-center px-3 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-gray-800"
                  >
                    <span className="mr-3">🔐</span>
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={handleMobileLinkClick}
                    className="flex items-center px-3 py-3 rounded-lg text-base font-medium bg-gradient-to-r from-violet-500 to-orange-500 text-white justify-center"
                  >
                    <span className="mr-3">🚀</span>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;