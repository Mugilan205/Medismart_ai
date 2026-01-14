import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
      <AlertTriangle className="w-24 h-24 text-red-500 mb-4" />
      <h1 className="text-6xl font-bold text-secondary-800">404</h1>
      <h2 className="text-2xl font-semibold text-secondary-600 mt-2 mb-4">Page Not Found</h2>
      <p className="text-secondary-500 mb-8">Sorry, the page you are looking for does not exist.</p>
      <Link 
        to="/"
        className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors"
      >
        Go Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
