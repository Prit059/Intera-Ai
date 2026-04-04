import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Set token for API calls
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch fresh user data from backend
      const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
      
      if (response.data) {
        const userData = response.data.data || response.data;
        console.log("✅ User data from backend:", userData);
        setUser(userData);
        setIsAuthenticated(true);
        // Store in localStorage for consistency
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("❌ Auth check failed:", error);
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axiosInstance.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password
      });

      console.log("✅ Login response:", response.data);

      if (response.data.token) {
        const { token, ...userData } = response.data;
        
        // Store token and user data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, message: 'Login successful!', user: userData };
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const signup = async (name, email, password, role = "user") => {
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name,
        email,
        password,
        role
      });

      console.log("✅ Signup response:", response.data);

      if (response.data.token) {
        const { token, ...userData } = response.data;
        
        // Store token and user data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, message: 'Signup successful!', user: userData };
      }
    } catch (error) {
      console.error("❌ Signup error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axiosInstance.defaults.headers.common['Authorization'];
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const clearUser = () => {
    logout();
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading,
      login, 
      signup, 
      logout, 
      clearUser,
      updateUser,
      checkAuth
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};