const { HTTP_STATUS, ERROR_MESSAGES } = require('../constants');
const logger = require('../services/logger');

class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, HTTP_STATUS.BAD_REQUEST);
    this.errors = errors;
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, HTTP_STATUS.NOT_FOUND);
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, HTTP_STATUS.CONFLICT);
  }
}

const handleAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const handleDatabaseError = (error) => {
  logger.logError(error, { type: 'database' });
  
  if (error.code === 11000) {
    return new ConflictError('Duplicate entry found');
  }
  
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    return new ValidationError('Validation failed', errors);
  }
  
  return new AppError(ERROR_MESSAGES.DATABASE_ERROR);
};

const handleAiServiceError = (error) => {
  logger.logError(error, { type: 'ai_service' });
  
  if (error.response?.status === 429) {
    return new AppError('AI service rate limit exceeded', HTTP_STATUS.TOO_MANY_REQUESTS);
  }
  
  if (error.response?.status === 401) {
    return new AppError('AI service authentication failed', HTTP_STATUS.UNAUTHORIZED);
  }
  
  return new AppError(ERROR_MESSAGES.AI_SERVICE_ERROR);
};

const sendErrorResponse = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  logger.logError(err, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  if (err.name === 'CastError') {
    const message = 'Invalid ID format';
    error = new ValidationError(message);
  }

  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ConflictError(message);
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    const message = `Invalid input data: ${errors.join('. ')}`;
    error = new ValidationError(message, errors);
  }

  res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

const sendSuccessResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message
  };
  
  if (data) {
    response.data = data;
  }
  
  res.status(statusCode).json(response);
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  handleAsync,
  handleDatabaseError,
  handleAiServiceError,
  sendErrorResponse,
  sendSuccessResponse
};
