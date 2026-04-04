import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../../context/userContext";

const PrivateRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useContext(UserContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is not logged in, redirect to login with return url
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required and user doesn't have it
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on role, but don't redirect if already there
    if (user.role === "admin" && !location.pathname.startsWith('/admin')) {
      return <Navigate to="/AdDash" replace />;
    } else if (user.role === "user" && !location.pathname.startsWith('/main-dashboard')) {
      return <Navigate to="/main-dashboard" replace />;
    }
    // If user is already on a page they have access to, allow it
  }

  return children;
};

export default PrivateRoute;