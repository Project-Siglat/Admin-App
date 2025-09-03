import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingScreenProps {
  message?: string;
  variant?: 'fullscreen' | 'overlay' | 'inline';
  showLogo?: boolean;
  className?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  variant = 'fullscreen',
  showLogo = true,
  className = ''
}) => {
  const baseClasses = {
    fullscreen: 'fixed inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col items-center justify-center z-50',
    overlay: 'absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-40',
    inline: 'flex flex-col items-center justify-center py-12'
  };

  return (
    <div className={`${baseClasses[variant]} ${className}`}>
      <div className="text-center space-y-6">
        {/* Logo/Brand Section */}
        {showLogo && (
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-material-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z"/>
                <path d="M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="white"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">SIGLAT</h2>
            <p className="text-sm text-gray-600">Emergency Response System</p>
          </div>
        )}

        {/* Loading Animation */}
        <div className="space-y-4">
          <LoadingSpinner size="xl" variant="primary" thickness="normal" />
          
          {/* Animated Dots */}
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700 mb-2">{message}</p>
          <p className="text-sm text-gray-500">Please wait while we process your request</p>
        </div>

        {/* Progress Bar (optional animated bar) */}
        <div className="w-64 bg-gray-200 rounded-full h-1 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;