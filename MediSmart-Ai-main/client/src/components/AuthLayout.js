import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Brand Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">
            MediSmart-AI
          </h1>
          <p className="text-secondary-600">
            Your Smart Medicine Companion
          </p>
        </div>
        
        {/* Content */}
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
