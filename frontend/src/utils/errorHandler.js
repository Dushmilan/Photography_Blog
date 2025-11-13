// Error handling utility functions
export const handleApiError = (error, customMessage = null) => {
  let errorMessage = customMessage;

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        errorMessage = data.message || 'Bad request. Please check your input.';
        break;
      case 401:
        errorMessage = data.message || 'Unauthorized. Please log in again.';
        break;
      case 403:
        errorMessage = data.message || 'Access forbidden. You do not have permission.';
        break;
      case 404:
        errorMessage = data.message || 'Resource not found.';
        break;
      case 500:
        errorMessage = data.message || 'Server error. Please try again later.';
        break;
      default:
        errorMessage = data.message || `Request failed with status ${status}`;
    }
  } else if (error.request) {
    // Request was made but no response received
    errorMessage = 'Network error. Please check your connection.';
  } else {
    // Something else happened
    errorMessage = error.message || 'An unexpected error occurred.';
  }

  return errorMessage;
};

// Function to log errors (can be connected to logging service)
export const logError = (error, context = '') => {
  console.error(`[${context}]`, error);
  
  // In production, you might want to send errors to a logging service
  // Example: send to Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    // Log to external service in production
    // Example: Sentry.captureException(error);
  }
};