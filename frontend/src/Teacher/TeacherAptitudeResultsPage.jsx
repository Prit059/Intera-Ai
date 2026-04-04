// pages/teacher/TeacherAptitudeResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Navbar from '../components/layouts/Navbar';
import {
  FiAward, FiCheckCircle, FiXCircle, FiBarChart2,
  FiClock, FiTrendingUp, FiEye, FiDownload,
  FiBook, FiArrowLeft, FiUsers, FiTarget,
  FiAlertTriangle, FiLogIn
} from 'react-icons/fi';

const TeacherAptitudeResultsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(location.state?.result);
  const [aptitude, setAptitude] = useState(location.state?.aptitudeData);
  const [violations, setViolations] = useState(location.state?.violations || 0);
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location.state?.result && location.state?.aptitudeData) {
      setResult(location.state.result);
      setAptitude(location.state.aptitudeData);
    } else {
      fetchResults();
    }
  }, [id, location.state]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/student/aptitude/attempt/${id}`);
      const fetchedResult = response.data.data || response.data;
      setResult(fetchedResult);
      
      if (fetchedResult.testId) {
        const testResponse = await axiosInstance.get(`/api/student/aptitude/joined/${fetchedResult.testId}`);
        setAptitude(testResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = () => {
    if (!result || !aptitude) return 0;
    const totalMarks = result.totalMarks || aptitude.totalMarks;
    return totalMarks > 0 ? Math.round((result.score / totalMarks) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !result || !aptitude) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <FiAlertTriangle className="text-red-400 text-4xl mx-auto mb-4" />
          <h2 className="text-2xl text-white mb-4">Results not available</h2>
          <button
            onClick={() => navigate('/useraptitudedashboard')}
            className="bg-blue-600 px-6 py-2 rounded-lg text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const percentage = calculatePercentage();
  const isPassed = percentage >= (aptitude.scoring?.passingScore || 60);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/useraptitudedashboard')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>

        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-8 mb-8 border border-purple-700">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <FiLogIn className="text-purple-400 text-2xl" />
              <span className="px-3 py-1 bg-purple-600/20 border border-purple-500 rounded-full text-sm">
                Teacher Test
              </span>
            </div>
            
            <h1 className="text-4xl font-bold mb-4">{aptitude.title}</h1>
            
            <div className={`text-5xl font-bold mb-4 ${percentage >= 60 ? 'text-green-400' : 'text-red-400'}`}>
              {percentage}%
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
              <div className="bg-black/30 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{result.score}</div>
                <div className="text-sm">Score</div>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{result.totalMarks}</div>
                <div className="text-sm">Total Marks</div>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">
                  {Math.floor((result.timeSpent || 0) / 60)}m
                </div>
                <div className="text-sm">Time Spent</div>
              </div>
            </div>

            <div className="mt-6">
              <span className={`px-4 py-2 rounded-full text-lg ${
                isPassed ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
              }`}>
                {isPassed ? '✓ Passed' : '✗ Failed'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAptitudeResultsPage;