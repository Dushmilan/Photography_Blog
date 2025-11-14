// Error handling utility functions for backend

class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

// Function to handle database errors
const handleDbError = (error) => {
  let message = 'Database error occurred';
  let statusCode = 500;

  // Handle different types of database errors
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique violation
        message = `Duplicate field value entered: ${error.detail || error.message}`;
        statusCode = 400;
        break;
      case '23503': // Foreign key violation
        message = `Foreign key constraint violation: ${error.detail || error.message}`;
        statusCode = 400;
        break;
      case '23502': // Not null violation
        message = `Required field missing: ${error.column || error.message}`;
        statusCode = 400;
        break;
      case '23514': // Check violation
        message = `Check constraint violation: ${error.detail || error.message}`;
        statusCode = 400;
        break;
      case '42P01': // Undefined table
        message = `Table does not exist: ${error.table || error.message}`;
        statusCode = 500;
        break;
      case 'PGRST103': // PostgREST error for single() when multiple rows returned
        message = 'Multiple rows returned when single row was expected';
        statusCode = 500;
        break;
      case 'PGRST116': // PostgREST error for no rows satisfying the query
        message = 'No rows found that satisfy the query';
        statusCode = 404;
        break;
      default:
        // Handle other specific error codes as needed
        message = error.message || 'Database error occurred';
        statusCode = 500;
    }
  } else if (error.message) {
    // Handle errors that don't have error codes but have messages
    if (error.message.includes('Cannot coerce the result to a single JSON object')) {
      message = 'Multiple rows returned when single row was expected - check your query constraints';
      statusCode = 500;
    } else if (error.message.includes('connection') || error.message.includes('timeout')) {
      message = 'Database connection error - please try again later';
      statusCode = 503;
    } else {
      message = error.message;
    }
  } else {
    message = 'Unknown database error occurred';
  }

  return new AppError(message, statusCode);
};

// Function to handle validation errors
const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map(err => err.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Global error handler middleware
const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle different types of errors
  if (err.name === 'CastError') {
    // Mongoose bad ObjectId
    const message = 'Resource not found';
    error = new AppError(message, 404);
  } else if (err.code === 11000) {
    // Mongoose duplicate key
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  } else if (err.name === 'ValidationError') {
    // Mongoose validation error
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  } else if (err.name === 'JsonWebTokenError') {
    // JWT error
    error = new AppError('Invalid token, please log in again', 401);
  } else if (err.name === 'TokenExpiredError') {
    // JWT expired
    error = new AppError('Token has expired, please log in again', 401);
  } else if (err.code && ['23505', '23503', '23502', '23514', '42P01', 'PGRST116', 'PGRST103'].includes(err.code)) {
    // Handle database errors
    error = handleDbError(err);
  } else if (err.type === 'entity.parse.failed') {
    // Body parsing error
    error = new AppError('Invalid request body format', 400);
  } else if (err.code === 'LIMIT_FILE_SIZE' || err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_FIELD_SIZE') {
    // Multer errors
    error = new AppError('File upload error: ' + err.message, 400);
  }

  // Don't expose sensitive error details in production
  const isOperational = error.isOperational || error.statusCode < 500;
  const errorMessage = isOperational ? error.message : 'Something went wrong!';

  res.status(error.statusCode || 500).json({
    success: false,
    error: errorMessage,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      originalError: err.message
    }),
    ...(isOperational && { type: error.status || 'error' })
  });
};

// Catch async errors
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  AppError,
  handleDbError,
  handleValidationError,
  globalErrorHandler,
  catchAsync
};