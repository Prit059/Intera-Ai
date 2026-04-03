import React from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import DashboardModules from "./DashboardModules";
import DashboardHistory from "./DashboardHistory";
import { useDarkMode } from "../../context/DarkModeContext";
import Navbar from "../../components/layouts/Navbar";

function MainDashboard() {
  const { darkmode } = useDarkMode();
  const dashboardStyle = darkmode
    ? "bg-gray-900 text-white"
    : "bg-black text-white";
  return (
    <div className="bg-black">
        <Navbar />
      <div className={`md:flex md:min-h-screen ${dashboardStyle}`}>
        <Sidebar />
        <main className="md:flex-1 md:p-8">
          <DashboardHeader />
          <DashboardModules />
          <DashboardHistory />
        </main>
      </div>
    </div>
  );
}

export default MainDashboard;