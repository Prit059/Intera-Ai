// components/Practice/FeedbackDisplay.jsx
import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiStar, FiTrendingUp } from 'react-icons/fi';

const FeedbackDisplay = ({ feedback, scores }) => {
  if (!feedback) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-900/30';
    if (score >= 60) return 'bg-yellow-900/30';
    return 'bg-red-900/30';
  };

  return (
    <div className="bg-black rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">AI Feedback</h3>
        <div className={`px-4 py-2 rounded-lg ${getScoreBgColor(feedback.overallScore)}`}>
          <span className={`text-2xl font-bold ${getScoreColor(feedback.overallScore)}`}>
            {feedback.overallScore}/100
          </span>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-700/20 border border-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Content</span>
            <FiCheckCircle className="text-blue-400" />
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(feedback.contentScore)}`}>
            {feedback.contentScore}
          </div>
          <div className="h-2 bg-gray-700/20 border border-gray-700 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full ${getScoreColor(feedback.contentScore).replace('text-', 'bg-')}`}
              style={{ width: `${feedback.contentScore}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-900/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Confidence</span>
            <FiTrendingUp className="text-green-400" />
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(feedback.confidenceScore)}`}>
            {feedback.confidenceScore}
          </div>
          <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full ${getScoreColor(feedback.confidenceScore).replace('text-', 'bg-')}`}
              style={{ width: `${feedback.confidenceScore}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-900/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Filler Words</span>
            <FiAlertCircle className="text-red-400" />
          </div>
          <div className={`text-2xl font-bold ${feedback.fillerWordsCount > 5 ? 'text-red-400' : 'text-green-400'}`}>
            {feedback.fillerWordsCount}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {feedback.fillerWordsCount > 5 ? 'Too many' : 'Good'}
          </div>
        </div>

        <div className="bg-gray-900/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Timing</span>
            <FiStar className="text-yellow-400" />
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(feedback.timingScore)}`}>
            {feedback.timingScore}
          </div>
          <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full ${getScoreColor(feedback.timingScore).replace('text-', 'bg-')}`}
              style={{ width: `${feedback.timingScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">Suggestions for Improvement:</h4>
        <div className="space-y-2">
          {feedback.suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start space-x-2 bg-gray-700/20 p-3 rounded-lg">
              <FiAlertCircle className="text-yellow-700 mt-1 flex-shrink-0" />
              <span className="text-gray-300">{suggestion}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      {feedback.strengths && feedback.strengths.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Your Strengths:</h4>
          <div className="flex flex-wrap gap-2">
            {feedback.strengths.map((strength, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-sm"
              >
                {strength}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Common Filler Words */}
      {feedback.fillerWords && feedback.fillerWords.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-white mb-3">Common Filler Words Used:</h4>
          <div className="flex flex-wrap gap-2">
            {feedback.fillerWords.map((word, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-700/20 text-red-400 rounded-full text-sm"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackDisplay;