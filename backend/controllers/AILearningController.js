// controllers/AILearningController.js
const User = require('../Models/User');
const AdAptitudeAttempt = require('../Models/AdAptitudeAttempt');
const AILearningService = require('../services/AILearningService');

class AILearningController {
  // Get personalized learning recommendations
  async getLearningRecommendations(req, res) {
    try {
      const { performanceData, userId } = req.body;
      
      // Get user's historical performance
      const userAttempts = await AdAptitudeAttempt.find({ userId })
        .populate('quizId')
        .sort({ completedAt: -1 })
        .limit(10);

      // Analyze learning patterns
      const learningPatterns = this.analyzeLearningPatterns(userAttempts);
      
      // Generate AI-powered recommendations
      const recommendations = await AILearningService.getLearningRecommendations(
        performanceData, 
        userId
      );

      res.json({
        success: true,
        data: {
          recommendations,
          learningPatterns,
          suggestedSchedule: this.generateStudySchedule(recommendations),
          resources: this.getPersonalizedResources(recommendations.focusAreas)
        }
      });
    } catch (error) {
      console.error('Error generating learning recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating learning recommendations',
        error: error.message
      });
    }
  }

  // Generate practice questions for weak areas
  async generatePracticeQuestions(req, res) {
    try {
      const { category, difficulty, count, type } = req.body;
      
      const questions = await AILearningService.generatePracticeQuestions(
        category,
        difficulty,
        count
      );

      res.json({
        success: true,
        data: questions
      });
    } catch (error) {
      console.error('Error generating practice questions:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating practice questions',
        error: error.message
      });
    }
  }

  // Create personalized study plan
  async createStudyPlan(req, res) {
    try {
      const { performanceAnalysis, availableTime, goals, learningStyle } = req.body;
      
      const studyPlan = await AILearningService.createStudyPlan(
        performanceAnalysis,
        availableTime
      );

      // Save study plan to user profile
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          studyPlans: {
            plan: studyPlan,
            createdAt: new Date(),
            active: true
          }
        }
      });

      res.json({
        success: true,
        data: studyPlan
      });
    } catch (error) {
      console.error('Error creating study plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating study plan',
        error: error.message
      });
    }
  }

  // Get user progress analytics
  async getUserProgress(req, res) {
    try {
      const { userId } = req.params;
      
      const attempts = await AdAptitudeAttempt.find({ userId })
        .populate('quizId')
        .sort({ completedAt: 1 });

      const progress = this.calculateProgressMetrics(attempts);
      
      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      console.error('Error getting user progress:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting user progress',
        error: error.message
      });
    }
  }

  // Update learning path
  async updateLearningPath(req, res) {
    try {
      const { userId, recentPerformance } = req.body;
      
      // Update user's learning path based on recent performance
      await User.findByIdAndUpdate(userId, {
        $set: {
          learningPath: recentPerformance,
          updatedAt: new Date()
        }
      });

      res.json({
        success: true,
        message: 'Learning path updated successfully'
      });
    } catch (error) {
      console.error('Error updating learning path:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating learning path',
        error: error.message
      });
    }
  }

  // Helper methods
  analyzeLearningPatterns(attempts) {
    const patterns = {
      improvementAreas: [],
      consistentStrengths: [],
      timeManagement: {},
      accuracyTrends: []
    };

    const recentAttempts = attempts.slice(0, 5);
    
    recentAttempts.forEach(attempt => {
      if (attempt.analysis) {
        patterns.accuracyTrends.push(attempt.analysis.accuracy);
        
        Object.entries(attempt.analysis.categoryWisePerformance || {}).forEach(([category, stats]) => {
          if (stats.correct / stats.total >= 0.8) {
            if (!patterns.consistentStrengths.includes(category)) {
              patterns.consistentStrengths.push(category);
            }
          }
        });
      }
    });

    return patterns;
  }

  calculateProgressMetrics(attempts) {
    if (attempts.length === 0) return {};

    const firstAttempt = attempts[0];
    const latestAttempt = attempts[attempts.length - 1];
    
    return {
      overallImprovement: this.calculateImprovement(firstAttempt, latestAttempt),
      consistencyScore: this.calculateConsistency(attempts),
      learningVelocity: this.calculateLearningVelocity(attempts),
      predictedScore: this.predictNextScore(attempts)
    };
  }

  calculateImprovement(firstAttempt, latestAttempt) {
    const firstScore = firstAttempt.percentage || 0;
    const latestScore = latestAttempt.percentage || 0;
    return latestScore - firstScore;
  }

  calculateConsistency(attempts) {
    if (attempts.length < 2) return 100;
    
    const scores = attempts.map(attempt => attempt.percentage || 0);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - average, 2), 0) / scores.length;
    
    return Math.max(0, 100 - Math.sqrt(variance));
  }

  calculateLearningVelocity(attempts) {
    if (attempts.length < 2) return 0;
    
    const improvements = [];
    for (let i = 1; i < attempts.length; i++) {
      const improvement = (attempts[i].percentage || 0) - (attempts[i-1].percentage || 0);
      improvements.push(improvement);
    }
    
    return improvements.reduce((a, b) => a + b, 0) / improvements.length;
  }

  predictNextScore(attempts) {
    if (attempts.length < 2) return null;
    
    const recentScores = attempts.slice(-3).map(attempt => attempt.percentage || 0);
    const averageRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const learningVelocity = this.calculateLearningVelocity(attempts);
    
    return Math.min(100, Math.max(0, averageRecent + learningVelocity * 0.5));
  }

  generateStudySchedule(recommendations) {
    return {
      morning: recommendations.focusAreas?.slice(0, 1) || ['General Practice'],
      afternoon: recommendations.practiceAreas?.slice(0, 2) || ['Mixed Questions'],
      evening: ['Revision', 'Mock Tests'],
      weeklyGoals: this.generateWeeklyGoals(recommendations)
    };
  }

  generateWeeklyGoals(recommendations) {
    return [
      `Improve ${recommendations.focusAreas?.[0] || 'key areas'} by 15%`,
      'Complete 3 practice sessions',
      'Take 2 full-length tests',
      'Review all incorrect answers'
    ];
  }

  getPersonalizedResources(focusAreas) {
    const resourceMap = {
      'Quantitative Aptitude': [
        { type: 'video', title: 'Advanced Math Concepts', duration: '45min', aiRecommended: true },
        { type: 'practice', title: 'DI Practice Set', count: 25, difficulty: 'Medium' }
      ],
      'Logical Reasoning': [
        { type: 'video', title: 'Puzzle Solving Techniques', duration: '30min', aiRecommended: true },
        { type: 'practice', title: 'Logical Puzzles', count: 20, difficulty: 'Varied' }
      ],
      'Verbal Ability': [
        { type: 'video', title: 'Vocabulary Building', duration: '25min', aiRecommended: true },
        { type: 'practice', title: 'Reading Comprehension', count: 15, difficulty: 'Advanced' }
      ]
    };

    return (focusAreas || []).flatMap(area => resourceMap[area] || []);
  }
}

// ✅ FIX: Export class instance properly
module.exports = new AILearningController();