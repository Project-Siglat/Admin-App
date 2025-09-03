import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  transparent?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Loading...',
  transparent = false,
  children,
  className = ''
}) => {
  if (!isVisible) return <>{children}</>;

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className={`absolute inset-0 flex flex-col items-center justify-center z-30 ${
        transparent ? 'bg-white bg-opacity-70' : 'bg-white bg-opacity-90'
      } backdrop-blur-sm`}>
        <div className="text-center space-y-4 p-6 bg-white rounded-xl shadow-material max-w-sm">
          <LoadingSpinner size="lg" variant="primary" />
          <div>
            <p className="text-gray-700 font-medium">{message}</p>
            <p className="text-sm text-gray-500 mt-1">Please wait...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;