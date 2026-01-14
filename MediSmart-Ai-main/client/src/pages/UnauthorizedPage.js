import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
      <h1 className="text-6xl font-bold text-red-500">403</h1>
      <h2 className="text-2xl font-semibold mt-4 text-gray-800">Access Denied / Forbidden</h2>
      <p className="mt-2 text-gray-600">You do not have permission to view this page.</p>
      <Link 
        to="/" 
        className="mt-6 px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
