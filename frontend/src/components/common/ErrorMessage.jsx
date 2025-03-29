import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';

const ErrorMessage = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`bg-red-50 border-l-4 border-red-500 p-4 ${className}`} role="alert">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <FiAlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {message}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;