import React from 'react';
import { FiLoader } from 'react-icons/fi';

const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div 
      className={`flex justify-center items-center ${className}`}
      role="status"
      aria-label="Loading"
    >
      <FiLoader 
        className={`animate-spin text-gray-700 ${sizeClasses[size]}`} 
        aria-hidden="true"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;