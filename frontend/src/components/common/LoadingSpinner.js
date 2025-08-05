import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'md':
        return 'h-8 w-8';
      case 'lg':
        return 'h-12 w-12';
      default:
        return 'h-8 w-8';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'border-green-600';
      case 'blue':
        return 'border-blue-600';
      case 'red':
        return 'border-red-600';
      case 'yellow':
        return 'border-yellow-600';
      default:
        return 'border-blue-600';
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-b-2 ${getSizeClasses()} ${getColorClasses()}`}></div>
    </div>
  );
};

export default LoadingSpinner; 