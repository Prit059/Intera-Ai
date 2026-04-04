import axiosInstance from '../utils/axiosInstance';
import {API_PATHS} from "../utils/apiPaths"
// User Services
export const aptitudeService = {
  // Get all published topics
  getAllTopics: async (params = {}) => {
    try {
      const response = await axiosInstance.get(API_PATHS.APTITUDETOPIC.GET_ALL, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get topic by slug
  getTopicBySlug: async (slug) => {
    try {
      const response = await axiosInstance.get(`/api/aptitude/topics/${slug}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      const response = await axiosInstance.get('/aptitude/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get featured topics
  getFeaturedTopics: async () => {
    try {
      const response = await axiosInstance.get('/aptitude/featured');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get popular topics
  getPopularTopics: async () => {
    try {
      const response = await axiosInstance.get('/aptitude/popular');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Search topics
  searchTopics: async (query) => {
    try {
      const response = await axiosInstance.get('/aptitude/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Rate topic
  rateTopic: async (topicId, rating, review = '') => {
    try {
      const response = await axiosInstance.post(`/aptitude/topics/${topicId}/rate`, {
        rating,
        review
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user progress
  getUserProgress: async () => {
    try {
      const response = await axiosInstance.get('/api/aptitude/progress');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update question attempt
  updateQuestionAttempt: async (data) => {
    try {
      const response = await axiosInstance.post('/aptitude/progress/attempt', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Bookmark topic
  bookmarkTopic: async (topicId) => {
    try {
      const response = await axiosInstance.post(`/aptitude/progress/bookmark/${topicId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark formula as mastered
  markFormulaMastered: async (data) => {
    try {
      const response = await axiosInstance.post('/aptitude/progress/master-formula', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get bookmarks
  getBookmarks: async () => {
    try {
      const response = await axiosInstance.get('/aptitude/progress/bookmarks');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Admin Services
export const adminAptitudeService = {
  // Create topic
  createTopic: async (topicData) => {
    try {
      const response = await axiosInstance.post(API_PATHS.ADAPTITUDETOPIC.CREATE, topicData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all topics (admin)
  getAllTopicsAdmin: async (params = {}) => {
    try {
      const response = await axiosInstance.get(API_PATHS.ADAPTITUDETOPIC.GET_ALL, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get topic by ID (admin)
  getTopicByIdAdmin: async (id) => {
    try {
      const response = await axiosInstance.get(API_PATHS.ADAPTITUDETOPIC.GET_BY_ID(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update topic
  updateTopic: async (id, topicData) => {
    try {
      const response = await axiosInstance.put(API_PATHS.ADAPTITUDETOPIC.UPDATE(id), topicData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete topic
  deleteTopic: async (id) => {
    try {
      const response = await axiosInstance.delete(API_PATHS.ADAPTITUDETOPIC.DELETE(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Toggle publish status
  togglePublish: async (id) => {
    try {
      const response = await axiosInstance.put(API_PATHS.ADAPTITUDETOPIC.TOGGLE_PUBLISH(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Toggle featured status
  toggleFeatured: async (id) => {
    try {
      const response = await axiosInstance.put(API_PATHS.ADAPTITUDETOPIC.TOGGLE_FEATURED(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Bulk update topics
  bulkUpdateTopics: async (data) => {
    try {
      const response = await axiosInstance.put(API_PATHS.ADAPTITUDETOPIC.BULK_UPDATE, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get admin stats
  getAdminStats: async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.ADAPTITUDETOPIC.ADMIN_STATS);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};