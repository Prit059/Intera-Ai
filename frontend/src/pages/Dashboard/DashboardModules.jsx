import React from "react";
import ModuleCard from "./modules/ModuleCardQA";
import ModuleCardResume from "./modules/ModuleCardResume";
import ModuleCardRoadmap from "./modules/ModuleCardRoadmap";
import ModuleCardinterview from "./modules/ModuleCardinterview";
import { useDarkMode } from "../../context/DarkModeContext";

function DashboardModules() {
  const { darkmode } = useDarkMode();
  return (
    <section className="mb-10">
      <h3 className="items-center text-center text-3xl md:text-2xl font-semibold mb-4 md:items-start md:text-left">Available AI Tools</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 md:gap-6 items-center gap-3 w-102 ml-2.5 md:w-full md:ml-0">
        <ModuleCardRoadmap />
        <ModuleCard />
        <ModuleCardResume />
        <ModuleCardinterview />
      </div>
    </section>
  );
}

export default DashboardModules;