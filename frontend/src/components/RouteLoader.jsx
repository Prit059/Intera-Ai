import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RouteLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [location]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-700 z-50">
      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 animate-progress relative">
        <div className="absolute right-0 top-0 w-20 h-full bg-white/20 skew-x-12"></div>
      </div>
    </div>
  );
};

export default RouteLoader;