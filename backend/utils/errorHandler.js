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

  if (error.code) {
    switch (error.code) {
      case '23505': // Unique violation
        message = `Duplicate field value entered: ${error.detail}`;
        statusCode = 400;
        break;
      case '23503': // Foreign key violation
        message = `Foreign key constraint violation: ${error.detail}`;
        statusCode = 400;
        break;
      case '23502': // Not null violation
        message = `Required field missing: ${error.column}`;
        statusCode = 400;
        break;
      case '23514': // Check violation
        message = `Check constraint violation: ${error.detail}`;
        statusCode = 400;
        break;
      case '42P01': // Undefined table
        message = `Table does not exist: ${error.table}`;
        statusCode = 500;
        break;
      default:
        message = error.message || 'Database error occurred';
        statusCode = 500;
    }
  } else {
    message = error.message || message;
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

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  }

  // Handle database errors
  if (err.code && ['23505', '23503', '23502', '23514', '42P01'].includes(err.code)) {
    error = handleDbError(err);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
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