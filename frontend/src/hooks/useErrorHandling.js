import { useState, useCallback } from 'react';
import { showError } from '../utils/errorHandler';

// Custom hook for handling API calls with error handling
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Wrap around API calls to handle errors automatically
  const callApi = useCallback(async (apiFunction, successCallback = null, errorCallback = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction();
      setData(result.data);
      
      if (successCallback) {
        successCallback(result);
      }
      
      return result;
    } catch (err) {
      setError(err);
      if (errorCallback) {
        errorCallback(err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle errors with notification
  const handleError = useCallback((error, customMessage = null, addErrorFunction = null) => {
    const errorInfo = showError(error, customMessage, 'error', addErrorFunction);
    setError(error);
    return errorInfo;
  }, []);

  return {
    loading,
    error,
    data,
    callApi,
    handleError
  };
};

// Custom hook for handling async operations with error notifications
export const useAsyncOperation = (addErrorFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeOperation = useCallback(async (operation, customMessage = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      setError(err);
      showError(err, customMessage, 'error', addErrorFunction);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addErrorFunction]);

  return {
    loading,
    error,
    executeOperation
  };
};