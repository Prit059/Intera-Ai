// services/aiLearningService.js
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths'; // Import API paths

class AILearningService {
  
  // Get personalized learning recommendations based on performance
  async getLearningRecommendations(performanceData, userId) {
    try {
      const response = await axiosInstance.post(
        API_PATHS.AI_LEARNING.RECOMMENDATIONS, // Use imported API path
        {
          performanceData,
          userId,
          timestamp: new Date().toISOString()
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      return this.getFallbackRecommendations(performanceData);
    }
  }

  // Generate practice questions for weak areas
  async generatePracticeQuestions(category, difficulty, count = 5) {
    try {
      const response = await axiosInstance.post(
        API_PATHS.AI_LEARNING.PRACTICE_QUESTIONS, // Use imported API path
        {
          category,
          difficulty,
          count,
          type: 'aptitude'
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error generating practice questions:', error);
      return [];
    }
  }

  // Create personalized study plan
  async createStudyPlan(performanceAnalysis, availableTime) {
    try {
      const response = await axiosInstance.post(
        API_PATHS.AI_LEARNING.STUDY_PLAN, // Use imported API path
        {
          performanceAnalysis,
          availableTime,
          goals: ['improve_aptitude', 'competitive_exams'],
          learningStyle: 'adaptive'
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error creating study plan:', error);
      return this.getFallbackStudyPlan(performanceAnalysis);
    }
  }

  // Get user progress analytics
  async getUserProgress(userId) {
    try {
      const response = await axiosInstance.get(
        API_PATHS.AI_LEARNING.USER_PROGRESS.replace(':userId', userId) // Replace parameter in path
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting user progress:', error);
      return {};
    }
  }

  // Update learning path based on recent performance
  async updateLearningPath(userId, recentPerformance) {
    try {
      const response = await axiosInstance.post(
        API_PATHS.AI_LEARNING.UPDATE_LEARNING_PATH,
        {
          userId,
          recentPerformance,
          updatedAt: new Date().toISOString()
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating learning path:', error);
      return null;
    }
  }

  // Generate AI-powered mock test
  async generateMockTest(weakAreas, testDuration = 1800) { // 30 minutes default
    try {
      // Use existing AI API path for question generation
      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUIZ, // Using existing AI quiz generation
        {
          categories: weakAreas,
          difficulty: 'mixed',
          duration: testDuration,
          questionCount: 20,
          type: 'mock_test'
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error generating mock test:', error);
      return null;
    }
  }

  // Get explanation for specific question type
  async getConceptExplanation(topic, difficulty = 'medium') {
    try {
      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION, // Using existing AI explanation
        {
          topic,
          difficulty,
          context: 'aptitude_preparation',
          format: 'detailed'
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting concept explanation:', error);
      return this.getFallbackExplanation(topic);
    }
  }

  // Fallback methods (when AI service is unavailable)
  getFallbackRecommendations(performanceData) {
    const weakAreas = Object.entries(performanceData.categoryPerformance)
      .filter(([, stats]) => {
        const percentage = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
        return percentage < 60;
      })
      .map(([category]) => category);

    const strongAreas = Object.entries(performanceData.categoryPerformance)
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
      confidenceScore: 0.7 // Lower confidence for fallback
    };
  }

  getFallbackStudyPlan(performanceAnalysis) {
    return {
      plan: [
        {
          week: 1,
          focus: 'Foundation Building',
          topics: performanceAnalysis.weakAreas || ['Quantitative Aptitude', 'Logical Reasoning'],
          activities: ['Basic concepts', 'Practice questions', 'Video tutorials'],
          goals: ['Complete 50 practice questions', 'Achieve 70% accuracy']
        },
        {
          week: 2,
          focus: 'Skill Development',
          topics: performanceAnalysis.mediumAreas || ['Verbal Ability', 'Data Interpretation'],
          activities: ['Mixed practice', 'Timed tests', 'Concept application'],
          goals: ['Improve speed by 20%', 'Score 75% in mock tests']
        }
      ],
      aiGenerated: false // Mark as fallback
    };
  }

  getFallbackExplanation(topic) {
    const explanations = {
      'Quantitative Aptitude': 'Focus on basic arithmetic, percentages, ratios, and data interpretation. Practice regularly with timed exercises.',
      'Logical Reasoning': 'Develop pattern recognition and analytical thinking. Solve puzzles and practice deductive reasoning.',
      'Verbal Ability': 'Build vocabulary through reading. Practice comprehension and grammar rules regularly.',
      'Data Interpretation': 'Learn to quickly analyze charts and graphs. Practice calculating percentages and trends.'
    };
    
    return {
      explanation: explanations[topic] || 'Practice regularly and focus on understanding fundamental concepts.',
      examples: [],
      tips: ['Practice daily', 'Time yourself', 'Review mistakes'],
      source: 'fallback'
    };
  }

  generateWeeklyPlan(weakAreas, strongAreas) {
    return [
      { 
        day: 'Monday', 
        focus: weakAreas[0] || 'Quantitative Aptitude', 
        duration: '45 minutes',
        activity: 'Concept learning and basic practice'
      },
      { 
        day: 'Tuesday', 
        focus: weakAreas[1] || strongAreas[0] || 'Logical Reasoning', 
        duration: '45 minutes',
        activity: 'Practice questions and timed exercises'
      },
      { 
        day: 'Wednesday', 
        focus: 'Mixed Practice', 
        duration: '30 minutes',
        activity: 'All topics mixed questions'
      },
      { 
        day: 'Thursday', 
        focus: strongAreas[0] || 'Revision', 
        duration: '20 minutes',
        activity: 'Quick revision and formula practice'
      },
      { 
        day: 'Friday', 
        focus: weakAreas[0] || 'Practice Test', 
        duration: '60 minutes',
        activity: 'Full-length practice test'
      },
      { 
        day: 'Saturday', 
        focus: 'All Topics', 
        duration: '40 minutes',
        activity: 'Weak area focus and mock test'
      },
      { 
        day: 'Sunday', 
        focus: 'Review & Plan', 
        duration: '15 minutes',
        activity: 'Performance review and next week planning'
      }
    ];
  }

  getRecommendedResources(topics) {
    const resourceMap = {
      'Quantitative Aptitude': [
        { 
          name: 'Basic Arithmetic Practice', 
          type: 'practice_set',
          difficulty: 'beginner',
          estimatedTime: '30 min'
        },
        { 
          name: 'Data Interpretation Sets', 
          type: 'practice_set',
          difficulty: 'intermediate',
          estimatedTime: '45 min'
        },
        { 
          name: 'Percentage and Ratio Problems', 
          type: 'video_tutorial',
          difficulty: 'beginner',
          estimatedTime: '25 min'
        }
      ],
      'Logical Reasoning': [
        { 
          name: 'Puzzle Solving Techniques', 
          type: 'video_tutorial',
          difficulty: 'intermediate',
          estimatedTime: '35 min'
        },
        { 
          name: 'Logical Deduction Exercises', 
          type: 'practice_set',
          difficulty: 'advanced',
          estimatedTime: '50 min'
        },
        { 
          name: 'Pattern Recognition Practice', 
          type: 'interactive',
          difficulty: 'intermediate',
          estimatedTime: '40 min'
        }
      ],
      'Verbal Ability': [
        { 
          name: 'Vocabulary Building Exercises', 
          type: 'flashcards',
          difficulty: 'beginner',
          estimatedTime: '20 min'
        },
        { 
          name: 'Reading Comprehension Passages', 
          type: 'practice_set',
          difficulty: 'intermediate',
          estimatedTime: '35 min'
        },
        { 
          name: 'Grammar Practice Sets', 
          type: 'practice_set',
          difficulty: 'beginner',
          estimatedTime: '25 min'
        }
      ]
    };

    return topics.flatMap(topic => resourceMap[topic] || []).slice(0, 3);
  }
}

export default new AILearningService();