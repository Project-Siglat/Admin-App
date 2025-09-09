import React from 'react';

interface ButtonProps {
  variant?: 'contained' | 'outlined' | 'text' | 'secondary' | 'danger';
  color?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large' | 'sm';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  disabled = false,
  type = 'button',
  fullWidth = false,
  className = '',
  onClick,
  children
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ripple';
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    sm: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    contained: {
      primary: 'bg-primary-700 text-white hover:bg-primary-800 focus:ring-primary-500 shadow-material',
      secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-400 shadow-material'
    },
    outlined: {
      primary: 'border-2 border-primary-700 text-primary-700 hover:bg-primary-50 focus:ring-primary-500',
      secondary: 'border-2 border-secondary-500 text-secondary-500 hover:bg-secondary-50 focus:ring-secondary-400'
    },
    text: {
      primary: 'text-primary-700 hover:bg-primary-50 focus:ring-primary-500',
      secondary: 'text-secondary-500 hover:bg-secondary-50 focus:ring-secondary-400'
    },
    secondary: {
      primary: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-400 shadow-material',
      secondary: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-400 shadow-material'
    },
    danger: {
      primary: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-material',
      secondary: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-material'
    }
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed hover:bg-gray-300';

  const buttonClasses = [
    baseClasses,
    sizeClasses[size],
    disabled ? disabledClasses : variantClasses[variant][color],
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={buttonClasses}
      type={type}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;