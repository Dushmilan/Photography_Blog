import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiX, FiInfo, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const ErrorNotification = ({ message, type = 'error', isVisible, onClose, duration = 5000 }) => {
  const [show, setShow] = useState(false);

  // Handle visibility changes
  useEffect(() => {
    if (isVisible) {
      setShow(true);
    }
  }, [isVisible]);

  // Auto-close notification after duration
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => onClose(), 300); // Allow transition to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, onClose, duration]);

  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="text-green-500" />;
      case 'warning':
        return <FiAlertTriangle className="text-yellow-500" />;
      case 'info':
        return <FiInfo className="text-blue-500" />;
      default:
        return <FiXCircle className="text-red-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-red-800';
    }
  };

  return (
    <div className="fixed top-24 right-4 z-[9999]">
      <div
        className={`max-w-sm w-full rounded-lg shadow-lg border ${getBgColor()} transform transition-all duration-300 ease-in-out ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="ml-3 flex-1">
              <p className={`text-sm font-medium ${getTextColor()}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </p>
              <p className={`mt-1 text-sm ${getTextColor()}`}>
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => {
                  setShow(false);
                  setTimeout(() => onClose(), 300);
                }}
                className={`inline-flex rounded-md ${getTextColor()} hover:${getTextColor()} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-25 transition-colors`}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorNotification;