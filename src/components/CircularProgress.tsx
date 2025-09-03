import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface CircularProgressProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  variant?: 'primary' | 'secondary' | 'white' | 'gray';
}

const CircularProgress: React.FC<CircularProgressProps> = ({ 
  size = 'medium', 
  className = '',
  variant = 'primary'
}) => {
  // Map old size names to new component sizes
  const sizeMapping = {
    small: 'sm' as const,
    medium: 'md' as const,
    large: 'lg' as const
  };

  return (
    <LoadingSpinner 
      size={sizeMapping[size]} 
      variant={variant}
      className={className}
    />
  );
};

export default CircularProgress;