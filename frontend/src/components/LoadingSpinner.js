import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-4 border-[#FF6F61] border-t-transparent ${sizeClasses[size]}`}></div>
      <p className="mt-2 text-[#001F3F] font-light">{message}</p>
    </div>
  );
};

export default LoadingSpinner;