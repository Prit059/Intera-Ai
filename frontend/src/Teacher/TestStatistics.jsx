// pages/teacher/TestStatistics.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiBarChart2, FiUsers, FiClock,
  FiCheckCircle, FiXCircle, FiTrendingUp,
  FiDownload, FiRefreshCw, FiAward, FiPieChart,
  FiFileText
} from 'react-icons/fi';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function TestStatistics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // all, week, month

  useEffect(() => {
    fetchStatistics();
  }, [id, timeRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/teacher/aptitude/test/${id}/stats?timeRange=${timeRange}`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = () => {
    if (!stats) return;

    try {
      // Create new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Set colors
      const primaryColor = [37, 99, 235]; // Blue
      const successColor = [34, 197, 94]; // Green
      const warningColor = [234, 179, 8]; // Yellow
      const dangerColor = [239, 68, 68]; // Red
      
      // Add header background
      doc.setFillColor(17, 24, 39); // Dark background
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Add title
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('Test Statistics Report', pageWidth / 2, 25, { align: 'center' });
      
      // Test Information
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('Test Information', 14, 50);
      
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      
      const testInfo = [
        ['Test Title:', stats.test?.title || 'N/A'],
        ['Join Code:', stats.test?.joinCode || 'N/A'],
        ['Total Questions:', stats.test?.totalQuestions?.toString() || '0'],
        ['Total Marks:', stats.test?.totalMarks?.toString() || '0'],
        ['Time Limit:', (stats.test?.timeLimit || '0') + ' minutes'],
        ['Report Generated:', new Date().toLocaleString()]
      ];
      
      let yPos = 60;
      testInfo.forEach(([label, value]) => {
        doc.setTextColor(100, 100, 100);
        doc.text(label, 14, yPos);
        doc.setTextColor(0, 0, 0);
        doc.text(value, 60, yPos);
        yPos += 8;
      });

      // Overall Statistics Section
      yPos += 10;
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('Overall Statistics', 14, yPos);
      
      yPos += 10;
      
      // Statistics cards layout
      const statsCards = [
        { label: 'Total Attempts', value: stats.stats?.totalAttempts || 0, color: primaryColor },
        { label: 'Completed', value: stats.stats?.completedAttempts || 0, color: successColor },
        { label: 'Pass Rate', value: (stats.stats?.passRate || 0) + '%', color: warningColor },
        { label: 'Avg Score', value: stats.stats?.averageScore || 0, color: primaryColor }
      ];
      
      const cardWidth = (pageWidth - 40) / 2;
      let cardX = 14;
      let cardY = yPos;
      
      statsCards.forEach((card, index) => {
        if (index === 2) {
          cardY = yPos + 35;
          cardX = 14;
        }
        
        // Card background
        doc.setFillColor(249, 250, 251);
        doc.roundedRect(cardX, cardY, cardWidth - 7, 30, 3, 3, 'F');
        
        // Card content
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(card.label, cardX + 5, cardY + 10);
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(card.color[0], card.color[1], card.color[2]);
        doc.text(card.value.toString(), cardX + 5, cardY + 25);
        
        cardX += cardWidth;
      });
      
      yPos += 70;

      // Score Distribution
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('Score Distribution', 14, yPos);
      
      yPos += 10;
      
      const passedCount = stats.stats?.passedCount || 0;
      const failedCount = (stats.stats?.completedAttempts || 0) - passedCount;
      const totalCompleted = stats.stats?.completedAttempts || 0;
      
      // Pass/Fail visualization
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      
      doc.text('Passed:', 14, yPos);
      doc.text(passedCount.toString(), 45, yPos);
      
      // Progress bar for passed
      doc.setFillColor(34, 197, 94);
      const passedWidth = totalCompleted > 0 ? (passedCount / totalCompleted) * 100 : 0;
      doc.roundedRect(60, yPos - 4, passedWidth, 6, 2, 2, 'F');
      
      // Background for failed portion
      doc.setFillColor(229, 231, 235);
      doc.roundedRect(60 + passedWidth, yPos - 4, 100 - passedWidth, 6, 2, 2, 'F');
      
      yPos += 15;
      
      doc.text('Failed:', 14, yPos);
      doc.text(failedCount.toString(), 45, yPos);
      doc.setTextColor(239, 68, 68);
      doc.text(`${totalCompleted > 0 ? ((failedCount / totalCompleted) * 100).toFixed(1) : 0}%`, 170, yPos);
      
      yPos += 20;
      
      // Additional stats
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text(`Highest Score: ${stats.stats?.highestScore || 0}`, 14, yPos);
      doc.text(`Average Score: ${stats.stats?.averageScore || 0}`, 100, yPos);
      
      yPos += 15;
      
      // Question-wise Analysis Table
      if (stats.questionAnalysis && stats.questionAnalysis.length > 0) {
        // Check if we need a new page
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('Question-wise Performance', 14, yPos);
        
        yPos += 10;
        
        const questionTableData = stats.questionAnalysis.map((q, idx) => [
          `Q${idx + 1}`,
          q.questionText || `Question ${idx + 1}`,
          `${q.correctPercentage?.toFixed(1) || 0}%`,
          `${q.correctCount || 0}/${q.totalAttempts || 0}`
        ]);
        
        // Use autoTable properly
        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Question', 'Success Rate', 'Correct/Total']],
          body: questionTableData,
          theme: 'grid',
          headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 10, cellPadding: 5 },
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 30, halign: 'center' },
            3: { cellWidth: 35, halign: 'center' }
          }
        });
        
        // Get the final Y position after the table
        yPos = doc.lastAutoTable.finalY + 15;
      }

      // Recent Attempts Table
      if (stats.recentAttempts && stats.recentAttempts.length > 0) {
        // Check if we need a new page
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('Recent Attempts', 14, yPos);
        
        yPos += 10;
        
        const attemptsTableData = stats.recentAttempts.map(attempt => [
          attempt.studentName || 'Unknown',
          attempt.studentEmail || 'N/A',
          (attempt.score || 0).toString(),
          `${attempt.percentage || 0}%`,
          attempt.passed ? 'Passed' : 'Failed',
          attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : 'N/A'
        ]);
        
        // Use autoTable properly
        autoTable(doc, {
          startY: yPos,
          head: [['Student', 'Email', 'Score', 'Percentage', 'Status', 'Date']],
          body: attemptsTableData,
          theme: 'grid',
          headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 9, cellPadding: 4 },
          columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 45 },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 25, halign: 'center' },
            4: { cellWidth: 22, halign: 'center' },
            5: { cellWidth: 30, halign: 'center' }
          },
          // Add custom styling for status column
          didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 4) {
              const status = data.cell.raw;
              if (status === 'Passed') {
                doc.setTextColor(34, 197, 94);
                doc.setFont('helvetica', 'bold');
              } else if (status === 'Failed') {
                doc.setTextColor(239, 68, 68);
                doc.setFont('helvetica', 'bold');
              }
            }
          }
        });
      }

      // Add footer with page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - 30,
          pageHeight - 10
        );
        doc.text(
          `Generated on ${new Date().toLocaleString()}`,
          14,
          pageHeight - 10
        );
      }

      // Save the PDF
      const fileName = `test-${stats.test?.joinCode || 'statistics'}-report.pdf`;
      doc.save(fileName);
      
      toast.success('PDF Report downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">No statistics available</p>
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="bg-blue-600 px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate(`/teacher/aptitude/${id}`)}
              className="flex items-center text-blue-400 hover:text-blue-300 mr-4"
            >
              <FiArrowLeft className="mr-2" />
              Back to Test
            </button>
            <h1 className="text-2xl font-bold">Test Statistics</h1>
          </div>

          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
            >
              <option value="all">All Time</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
            
            <button
              onClick={fetchStatistics}
              className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700"
              title="Refresh"
            >
              <FiRefreshCw />
            </button>
            
            <button
              onClick={generatePDFReport}
              className="flex items-center px-4 py-2 bg-blue-600/20 border border-blue-600 rounded-lg hover:bg-blue-600/40"
            >
              <FiFileText className="mr-2" /> Download PDF Report
            </button>
          </div>
        </div>

        {/* Test Info Card */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-600 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold mb-2">{stats.test?.title || 'Untitled Test'}</h2>
              <div className="flex gap-4 text-sm text-gray-400 flex-wrap">
                <span>Join Code: <code className="text-yellow-400">{stats.test?.joinCode || 'N/A'}</code></span>
                <span>Questions: {stats.test?.totalQuestions || 0}</span>
                <span>Total Marks: {stats.test?.totalMarks || 0}</span>
                {stats.test?.schedule?.isScheduled && (
                  <span>
                    Schedule: {stats.test.schedule.startDate ? new Date(stats.test.schedule.startDate).toLocaleDateString() : 'N/A'} - {stats.test.schedule.endDate ? new Date(stats.test.schedule.endDate).toLocaleDateString() : 'N/A'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <FiUsers className="text-blue-400 text-xl" />
              <span className="text-2xl font-bold">{stats.stats?.totalAttempts || 0}</span>
            </div>
            <p className="text-gray-400 text-sm">Total Attempts</p>
          </div>

          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <FiCheckCircle className="text-green-400 text-xl" />
              <span className="text-2xl font-bold">{stats.stats?.completedAttempts || 0}</span>
            </div>
            <p className="text-gray-400 text-sm">Completed</p>
          </div>

          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <FiAward className="text-yellow-400 text-xl" />
              <span className="text-2xl font-bold">{stats.stats?.passRate || 0}%</span>
            </div>
            <p className="text-gray-400 text-sm">Pass Rate</p>
          </div>

          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <FiTrendingUp className="text-purple-400 text-xl" />
              <span className="text-2xl font-bold">{stats.stats?.averageScore || 0}</span>
            </div>
            <p className="text-gray-400 text-sm">Average Score</p>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FiPieChart className="mr-2 text-blue-400" /> Score Distribution
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Passed</span>
                  <span className="text-green-400">{stats.stats?.passedCount || 0} students</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${stats.stats?.completedAttempts > 0 ? ((stats.stats?.passedCount || 0) / stats.stats?.completedAttempts) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Failed</span>
                  <span className="text-red-400">{(stats.stats?.completedAttempts || 0) - (stats.stats?.passedCount || 0)} students</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${stats.stats?.completedAttempts > 0 ? (((stats.stats?.completedAttempts || 0) - (stats.stats?.passedCount || 0)) / stats.stats?.completedAttempts) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex justify-between text-sm">
                <span>Highest Score</span>
                <span className="font-bold text-yellow-400">{stats.stats?.highestScore || 0}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>Average Score</span>
                <span className="font-bold text-blue-400">{stats.stats?.averageScore || 0}</span>
              </div>
            </div>
          </div>

          {/* Question-wise Analysis */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FiBarChart2 className="mr-2 text-purple-400" /> Question-wise Performance
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.questionAnalysis && stats.questionAnalysis.length > 0 ? (
                stats.questionAnalysis.map((q, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Q{idx + 1}</span>
                      <span className={q.correctPercentage >= 70 ? 'text-green-400' : q.correctPercentage >= 40 ? 'text-yellow-400' : 'text-red-400'}>
                        {q.correctPercentage?.toFixed(1) || 0}% correct
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          q.correctPercentage >= 70 ? 'bg-green-600' : 
                          q.correctPercentage >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${q.correctPercentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-4">No question data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiClock className="mr-2 text-green-400" /> Recent Attempts
          </h3>
          
          {!stats.recentAttempts || stats.recentAttempts.length === 0 ? (
            <p className="text-center text-gray-400 py-4">No attempts yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left">Student</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Score</th>
                    <th className="px-4 py-2 text-left">Percentage</th>
                    <th className="px-4 py-2 text-left">Time Spent</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAttempts.map((attempt, idx) => (
                    <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/30">
                      <td className="px-4 py-2">
                        <div>
                          <div className="font-medium">{attempt.studentName || 'Unknown'}</div>
                          <div className="text-sm text-gray-400">{attempt.studentEmail || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-4 py-2">{attempt.studentEmail || 'N/A'}</td>
                      <td className="px-4 py-2 font-medium">{attempt.score || 0}</td>
                      <td className="px-4 py-2">
                        <span className={attempt.percentage >= 60 ? 'text-green-400' : 'text-red-400'}>
                          {attempt.percentage || 0}%
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {Math.floor((attempt.timeSpent || 0) / 60)}m {(attempt.timeSpent || 0) % 60}s
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          attempt.passed ? 'bg-green-600/20 text-green-400 border border-green-600' : 'bg-red-600/20 text-red-400 border border-red-600'
                        }`}>
                          {attempt.passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-400">
                        {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestStatistics;