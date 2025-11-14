// Error handling utility functions
export const handleApiError = (error, customMessage = null) => {
  let errorMessage = customMessage;
  let errorType = 'general';

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;

    switch (status) {
      case 400:
        errorMessage = data.message || data.error || 'Bad request. Please check your input.';
        errorType = 'validation';
        break;
      case 401:
        errorMessage = data.message || data.error || 'Unauthorized. Please log in again.';
        errorType = 'auth';
        break;
      case 403:
        errorMessage = data.message || data.error || 'Access forbidden. You do not have permission.';
        errorType = 'forbidden';
        break;
      case 404:
        errorMessage = data.message || data.error || 'Resource not found.';
        errorType = 'not-found';
        break;
      case 409:
        errorMessage = data.message || data.error || 'Conflict occurred. Please try again.';
        errorType = 'conflict';
        break;
      case 429:
        errorMessage = data.message || data.error || 'Too many requests. Please try again later.';
        errorType = 'rate-limit';
        break;
      case 500:
        errorMessage = data.message || data.error || 'Server error. Please try again later.';
        errorType = 'server';
        break;
      case 502:
        errorMessage = data.message || data.error || 'Bad gateway. Please try again later.';
        errorType = 'server';
        break;
      case 503:
        errorMessage = data.message || data.error || 'Service unavailable. Please try again later.';
        errorType = 'server';
        break;
      default:
        errorMessage = data.message || data.error || `Request failed with status ${status}`;
        errorType = 'unknown';
    }
  } else if (error.request) {
    // Request was made but no response received
    if (error.code === 'ECONNABORTED' || error.code === 'TIMEOUT') {
      errorMessage = 'Request timeout. The server took too long to respond.';
      errorType = 'timeout';
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Network error. Unable to connect to the server.';
      errorType = 'network';
    } else {
      errorMessage = 'Network error. Please check your connection.';
      errorType = 'network';
    }
  } else {
    // Something else happened
    errorMessage = error.message || 'An unexpected error occurred.';
    errorType = 'unexpected';
  }

  // Log the error for debugging
  logError(error, `API_ERROR_${errorType.toUpperCase()}`, {
    message: errorMessage,
    status: error.response?.status,
    url: error.config?.url,
    method: error.config?.method
  });

  return { message: errorMessage, type: errorType };
};

// Function to log errors (can be connected to logging service)
export const logError = (error, context = '', additionalInfo = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    context,
    message: error.message || error,
    stack: error.stack,
    additionalInfo,
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  console.error(errorLog);

  // In production, you might want to send errors to a logging service
  // Example: send to Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    // Log to external service in production
    // Example: Sentry.captureException(error);
  }
};

// Function to format error messages consistently
export const formatError = (error, fallbackMessage = 'An error occurred') => {
  if (typeof error === 'string') {
    return { message: error, type: 'custom' };
  }

  if (error && typeof error === 'object' && error.message) {
    return { message: error.message, type: 'object' };
  }

  return { message: fallbackMessage, type: 'fallback' };
};

// Function to handle unexpected errors gracefully
export const handleUnexpectedError = (error, context = 'general') => {
  const errorInfo = formatError(error);
  logError(error, `UNEXPECTED_ERROR_${context.toUpperCase()}`, {
    originalMessage: errorInfo.message,
    context
  });

  return {
    message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    type: 'unexpected'
  };
};