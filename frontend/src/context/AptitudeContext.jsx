import React, { createContext, useState, useCallback } from 'react';
import { aptitudeService } from '../services/aptitudeService';

export const AptitudeContext = createContext();

export const AptitudeProvider = ({ children }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [userProgress, setUserProgress] = useState(null);

  // Fetch all topics
  const fetchTopics = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await aptitudeService.getAllTopics(params);
      setTopics(response.data);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to fetch topics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch topic by slug
  const fetchTopicBySlug = useCallback(async (slug) => {
    setLoading(true);
    setError(null);
    try {
      const response = await aptitudeService.getTopicBySlug(slug);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch topic');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await aptitudeService.getCategories();
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user progress
  const fetchUserProgress = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await aptitudeService.getUserProgress();
      setUserProgress(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch user progress');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch bookmarks
  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await aptitudeService.getBookmarks();
      setBookmarks(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch bookmarks');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Bookmark topic
  const toggleBookmark = useCallback(async (topicId) => {
    try {
      const response = await aptitudeService.bookmarkTopic(topicId);
      await fetchBookmarks(); // Refresh bookmarks
      return response;
    } catch (err) {
      setError(err.message || 'Failed to toggle bookmark');
      throw err;
    }
  }, [fetchBookmarks]);

  // Update question attempt
  const updateQuestionAttempt = useCallback(async (data) => {
    try {
      const response = await aptitudeService.updateQuestionAttempt(data);
      await fetchUserProgress(); // Refresh progress
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update attempt');
      throw err;
    }
  }, [fetchUserProgress]);

  // Rate topic
  const rateTopic = useCallback(async (topicId, rating, review) => {
    try {
      const response = await aptitudeService.rateTopic(topicId, rating, review);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to rate topic');
      throw err;
    }
  }, []);

  // Search topics
  const searchTopics = useCallback(async (query, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await aptitudeService.searchTopics(query);
      setTopics(response.data);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to search topics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    topics,
    loading,
    error,
    bookmarks,
    userProgress,
    fetchTopics,
    fetchTopicBySlug,
    fetchCategories,
    fetchUserProgress,
    fetchBookmarks,
    toggleBookmark,
    updateQuestionAttempt,
    rateTopic,
    searchTopics,
    setError
  };

  return (
    <AptitudeContext.Provider value={value}>
      {children}
    </AptitudeContext.Provider>
  );
};