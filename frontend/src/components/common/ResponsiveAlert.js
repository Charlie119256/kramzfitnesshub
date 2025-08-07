'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ResponsiveAlert = ({ 
  type = 'info', 
  message = '', 
  onClose, 
  fullScreen = false,
  autoClose = false,
  autoCloseDelay = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (message) {
      setIsAnimating(true);
      setTimeout(() => setIsVisible(true), 10);
      
      if (autoClose && !fullScreen) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [message, autoClose, autoCloseDelay, fullScreen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, 200);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-8 w-8 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-8 w-8 text-blue-500" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-white',
          border: 'border-green-200',
          text: 'text-gray-800',
          icon: 'text-green-500',
          button: 'bg-green-500 hover:bg-green-600 text-white'
        };
      case 'error':
        return {
          bg: 'bg-white',
          border: 'border-red-200',
          text: 'text-gray-800',
          icon: 'text-red-500',
          button: 'bg-red-500 hover:bg-red-600 text-white'
        };
      case 'warning':
        return {
          bg: 'bg-white',
          border: 'border-yellow-200',
          text: 'text-gray-800',
          icon: 'text-yellow-500',
          button: 'bg-yellow-500 hover:bg-yellow-600 text-white'
        };
      case 'info':
      default:
        return {
          bg: 'bg-white',
          border: 'border-blue-200',
          text: 'text-gray-800',
          icon: 'text-blue-500',
          button: 'bg-blue-500 hover:bg-blue-600 text-white'
        };
    }
  };

  const styles = getStyles();

  if (!message || !isVisible) {
    return null;
  }

  // Sweet Alert Style Modal
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className={`relative max-w-sm w-full ${styles.bg} ${styles.border} rounded-xl shadow-2xl border p-6 mx-4 transform transition-all duration-300 pointer-events-auto ${
            isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
          
          {/* Content */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {getIcon()}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {type === 'success' && 'Success!'}
              {type === 'error' && 'Error!'}
              {type === 'warning' && 'Warning!'}
              {type === 'info' && 'Information'}
            </h3>
            <p className={`text-sm ${styles.text} leading-relaxed`} style={{ fontFamily: 'Poppins, sans-serif' }}>
              {message}
            </p>
          </div>
          
          {/* Action Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleClose}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${styles.button}`}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular Container Alert
  return (
    <div className={`mb-4 ${styles.bg} ${styles.border} rounded-lg border p-4`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${styles.text}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
            {message}
          </p>
        </div>
        {onClose && (
          <div className="flex-shrink-0">
            <button
              onClick={handleClose}
              className={`inline-flex ${styles.text} hover:${styles.text.replace('text-', 'text-').replace('-800', '-900')} transition-colors`}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsiveAlert; 