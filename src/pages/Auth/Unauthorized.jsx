import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">403 - Access Denied</h1>
        <p className="text-gray-300 mb-8">You don't have permission to access this page.</p>
        <Link 
          to="/" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Go to Home Page.
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;