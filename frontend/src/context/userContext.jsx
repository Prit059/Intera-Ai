// context/UserContext.js
import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      // console.log("Checking auth with token:", token.substring(0, 20) + "...");
      
      const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
      // console.log("Auth response:", response.data);
      
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error("Auth check failed:", err);
      setError(err.response?.data?.message || "Authentication failed");
      
      // Only clear token if it's an authentication error (401)
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        delete axiosInstance.defaults.headers.common['Authorization'];
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    setError(null);
  };

  const clearUser = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem("token");
    delete axiosInstance.defaults.headers.common['Authorization'];
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
    setError(null);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      error,
      login, 
      clearUser, 
      updateUser,
      checkAuth 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;