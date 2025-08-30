import React from 'react';

interface CardProps {
  elevation?: 0 | 1 | 2 | 3 | 4;
  outlined?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ 
  elevation = 1, 
  outlined = false, 
  className = '', 
  children 
}) => {
  const elevationClasses = {
    0: '',
    1: 'shadow-material',
    2: 'shadow-material-lg',
    3: 'shadow-xl',
    4: 'shadow-2xl'
  };

  const cardClasses = [
    'bg-white rounded-lg overflow-hidden transition-shadow duration-200',
    outlined ? 'border border-gray-200' : '',
    elevationClasses[elevation],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};

export default Card;