/**
 * Validation Middleware
 * Validates input parameters for various endpoints
 */

const Validator = require('../utils/validator');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');

/**
 * Validate product query parameters
 */
const validateProductQuery = (req, res, next) => {
  const { page = 1, limit = 20, sortBy = 'rating', sortOrder = 'DESC', search = '' } = req.query;
  
  // Validate pagination
  const paginationValidation = Validator.validatePagination(page, limit);
  if (!paginationValidation.isValid) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      errors: paginationValidation.errors,
    });
  }
  
  // Validate sort
  const allowedSortFields = ['rating', 'rating_count', 'discount_percentage', 'actual_price', 'createdAt'];
  const sortValidation = Validator.validateSort(sortBy, sortOrder, allowedSortFields);
  if (!sortValidation.isValid) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      errors: sortValidation.errors,
    });
  }
  
  // Validate search
  if (search) {
    const searchValidation = Validator.validateSearch(search);
    if (!searchValidation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        error: searchValidation.error,
      });
    }
  }
  
  next();
};

/**
 * Validate rating filter
 */
const validateRatingFilter = (req, res, next) => {
  const { minRating } = req.query;
  
  if (minRating !== undefined) {
    const validation = Validator.validateRating(minRating);
    if (!validation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        error: validation.error,
      });
    }
  }
  
  next();
};

module.exports = {
  validateProductQuery,
  validateRatingFilter,
};
