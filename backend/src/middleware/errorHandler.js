/**
 * Request/Response Middleware
 * Handles request logging and response formatting
 */

let logger;
try {
  const Logger = require('../utils/logger');
  logger = new Logger('Middleware');
} catch (err) {
  logger = {
    info: console.log,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };
}

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    };
    
    if (res.statusCode >= 400) {
      logger.warn(`Request completed with error`, logData);
    } else {
      logger.debug(`Request completed`, logData);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');
  
  logger.error('Unhandled Error', err, {
    url: req.originalUrl,
    method: req.method,
  });
  
  // Default error response
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.message, stack: err.stack }),
  });
};

/**
 * Async handler wrapper for catching async errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  requestLogger,
  errorHandler,
  asyncHandler,
};
