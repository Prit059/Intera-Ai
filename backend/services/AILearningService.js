// backend/services/AILearningService.js
const AdAptitudeAttempt = require('../Models/AdAptitudeAttempt');
const User = require('../Models/User');

class AILearningService {
  
  // Get personalized learning recommendations based on performance
  async getLearningRecommendations(performanceData, userId) {
    try {
      // Backend implementation - direct database access
      const userAttempts = await AdAptitudeAttempt.find({ userId })
        .populate('quizId')
        .sort({ completedAt: -1 })
        .limit(10);

      // Analyze performance and generate recommendations
      const recommendations = this.analyzePerformance(userAttempts, performanceData);
      
      return recommendations;
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      return this.getFallbackRecommendations(performanceData);
    }
  }

  // Generate practice questions for weak areas
  async generatePracticeQuestions(category, difficulty, count = 5) {
    try {
      // Simulate AI question generation
      const questions = this.generateSampleQuestions(category, difficulty, count);
      return questions;
    } catch (error) {
      console.error('Error generating practice questions:', error);
      return [];
    }
  }

  // Create personalized study plan
  async createStudyPlan(performanceAnalysis, availableTime) {
    try {
      const studyPlan = this.generateStudyPlan(performanceAnalysis, availableTime);
      return studyPlan;
    } catch (error) {
      console.error('Error creating study plan:', error);
      return this.getFallbackStudyPlan(performanceAnalysis);
    }
  }

  // Backend analysis logic
  analyzePerformance(userAttempts, performanceData) {
    const weakAreas = Object.entries(performanceData.categoryPerformance || {})
      .filter(([, stats]) => {
        const percentage = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
        return percentage < 60;
      })
      .map(([category]) => category);

    const strongAreas = Object.entries(performanceData.categoryPerformance || {})
      .filter(([, stats]) => {
        const percentage = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
        return percentage >= 80;
      })
      .map(([category]) => category);

    return {
      immediateFocus: weakAreas.slice(0, 2),
      nextLevelTopics: strongAreas.slice(0, 1),
      weeklyPlan: this.generateWeeklyPlan(weakAreas, strongAreas),
      resources: this.getRecommendedResources(weakAreas),
      confidenceScore: 0.8
    };
  }

  generateSampleQuestions(category, difficulty, count) {
    const questions = [];
    for (let i = 1; i <= count; i++) {
      questions.push({
        id: i,
        questionText: `${category} Sample Question ${i} (${difficulty})`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: `This is a sample ${difficulty} question for ${category}`,
        marks: 1,
        difficulty: difficulty
      });
    }
    return questions;
  }

  generateStudyPlan(performanceAnalysis, availableTime) {
    return {
      plan: [
        {
          week: 1,
          focus: 'Foundation Building',
          topics: performanceAnalysis.weakAreas || ['Quantitative Aptitude'],
          activities: ['Basic concepts', 'Practice questions', 'Video tutorials'],
          goals: ['Complete 50 practice questions', 'Achieve 70% accuracy']
        },
        {
          week: 2,
          focus: 'Skill Development',
          topics: performanceAnalysis.mediumAreas || ['Logical Reasoning'],
          activities: ['Mixed practice', 'Timed tests', 'Concept application'],
          goals: ['Improve speed by 20%', 'Score 75% in mock tests']
        }
      ],
      aiGenerated: true
    };
  }

  getFallbackRecommendations(performanceData) {
    return {
      immediateFocus: ['Quantitative Aptitude', 'Logical Reasoning'],
      weeklyPlan: this.generateWeeklyPlan([], []),
      resources: [],
      confidenceScore: 0.7
    };
  }

  getFallbackStudyPlan(performanceAnalysis) {
    return {
      plan: [
        {
          week: 1,
          focus: 'General Practice',
          topics: ['All Topics'],
          activities: ['Practice questions', 'Mock tests'],
          goals: ['Improve overall score']
        }
      ],
      aiGenerated: false
    };
  }

  generateWeeklyPlan(weakAreas, strongAreas) {
    return [
      { day: 'Monday', focus: weakAreas[0] || 'Quantitative Aptitude', duration: '45 minutes' },
      { day: 'Tuesday', focus: weakAreas[1] || 'Logical Reasoning', duration: '45 minutes' },
      { day: 'Wednesday', focus: 'Mixed Practice', duration: '30 minutes' },
      { day: 'Thursday', focus: strongAreas[0] || 'Revision', duration: '20 minutes' },
      { day: 'Friday', focus: weakAreas[0] || 'Practice Test', duration: '60 minutes' },
      { day: 'Saturday', focus: 'All Topics', duration: '40 minutes' },
      { day: 'Sunday', focus: 'Review & Plan', duration: '15 minutes' }
    ];
  }

  getRecommendedResources(topics) {
    const resourceMap = {
      'Quantitative Aptitude': [
        { name: 'Basic Arithmetic Practice', type: 'practice_set', duration: '30 min' },
        { name: 'Data Interpretation Sets', type: 'practice_set', duration: '45 min' }
      ],
      'Logical Reasoning': [
        { name: 'Puzzle Solving Techniques', type: 'video_tutorial', duration: '35 min' },
        { name: 'Logical Deduction Exercises', type: 'practice_set', duration: '50 min' }
      ],
      'Verbal Ability': [
        { name: 'Vocabulary Building Exercises', type: 'flashcards', duration: '20 min' },
        { name: 'Reading Comprehension Passages', type: 'practice_set', duration: '35 min' }
      ]
    };

    return topics.flatMap(topic => resourceMap[topic] || []).slice(0, 3);
  }
}

// ✅ FIX: Export class instance
module.exports = new AILearningService();