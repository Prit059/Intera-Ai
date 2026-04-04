import React from "react";
import { useDarkMode } from '../../context/DarkModeContext';
import { Link } from 'react-router-dom';
import { LuFacebook, LuInstagram, LuLinkedin, LuYoutube } from "react-icons/lu";

function Footer() {
    const { darkmode } = useDarkMode();

    return(
        <div className={`p-4 sm:p-6 flex flex-col lg:flex-row justify-between shadow-2xl shadow-gray-200 ${!darkmode ? 'bg-black text-white' : 'bg-white text-black'}`}>
            <div className="flex-1 mb-6 lg:mb-0">
                <footer className="mb-6 lg:mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Intera.AI</h1>
                    <p className="w-full lg:w-80 mt-2 sm:mt-4 text-sm sm:text-base text-gray-400">
                        The all-in-one platform for mastering Interviews: Practice, Analyze, Track Progress, and Gain Insights—all powered by Intera.AI.
                    </p>
                </footer>
                <p className="text-xs sm:text-sm text-gray-500">© 2025 Intera.AI. All rights reserved.</p>
            </div>

            <div className="lg:flex grid grid-cols-2 sm:flex-row gap-4 sm:gap-8 lg:gap-12 flex-1 justify-between">
                <div className="mb-4 sm:mb-0">
                    <h1 className="underline text-lg sm:text-xl font-semibold mb-2 sm:mb-3">About</h1>
                    <ul className="text-gray-400 cursor-pointer space-y-1 sm:space-y-2 text-sm sm:text-base">
                        <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                        <li><Link to="/main-dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                        <li><Link to="/userprofile" className="hover:text-white transition-colors">Profile</Link></li>
                        <li><Link to="/demo-video" className="hover:text-white transition-colors">Demo-Video</Link></li>
                    </ul>
                </div>
                <div className="mb-4 sm:mb-0">
                    <h1 className="underline text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Dashboard</h1>
                    <ul className="text-gray-400 space-y-1 sm:space-y-2 text-sm sm:text-base">
                        <li><Link to="/dashboard" className="hover:text-white transition-colors">Interview Prep Q&A</Link></li>
                        <li><Link to="/main-quiz" className="hover:text-white transition-colors">AI Quiz</Link></li>
                        <li><Link to="/roadmapgen" className="hover:text-white transition-colors">AI Roadmap Generator</Link></li>
                        <li><Link to="/" className="hover:text-white transition-colors">AI With Mock Interviews</Link></li>
                    </ul>
                </div>
                <div className="mb-4 sm:mb-0">
                    <h1 className="underline text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Policies</h1>
                    <ul className="text-gray-400 space-y-1 sm:space-y-2 text-sm sm:text-base">
                        <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
                        <li className="hover:text-white transition-colors cursor-pointer">Terms</li>
                        <li className="hover:text-white transition-colors cursor-pointer">FAQs</li>
                        <li className="hover:text-white transition-colors cursor-pointer">How it works</li>
                    </ul>
                </div>
            </div>
            
            <div className="flex flex-col justify-center lg:justify-end mt-6 lg:ml-6 lg:h-13">
                <div className="p-3 flex gap-4 sm:gap-6 rounded-xl bg-gray-400/10 hover:bg-gray-600/10 hover:scale-105 transition cursor-pointer border border-gray-800">
                    <LuFacebook size={20} className="sm:w-6 sm:h-6"/>
                    <LuInstagram size={20} className="sm:w-6 sm:h-6"/>
                    <LuLinkedin size={20} className="sm:w-6 sm:h-6"/>
                    <LuYoutube size={20} className="sm:w-6 sm:h-6"/>
                </div>
                <div className="mt-5">
                    <h2 className="text-sm sm:text-base">For Feedback & Queries</h2>
                    <a href="">Connect with us</a>
                </div>
            </div>
        </div>
    );
}

export default Footer;