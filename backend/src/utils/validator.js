/**
 * Validation Utility
 * Provides input validation functions
 */

class Validator {
  /**
   * Validate pagination parameters
   */
  static validatePagination(page, limit) {
    const errors = [];
    
    if (!Number.isInteger(Number(page)) || Number(page) < 1) {
      errors.push('Page must be a positive integer');
    }
    
    if (!Number.isInteger(Number(limit)) || Number(limit) < 1 || Number(limit) > 100) {
      errors.push('Limit must be a positive integer between 1 and 100');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate sort parameters
   */
  static validateSort(sortBy, sortOrder, allowedFields) {
    const errors = [];
    
    if (!allowedFields.includes(sortBy)) {
      errors.push(`Invalid sort field. Allowed fields: ${allowedFields.join(', ')}`);
    }
    
    if (!['ASC', 'DESC'].includes(sortOrder.toUpperCase())) {
      errors.push('Sort order must be ASC or DESC');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate rating filter
   */
  static validateRating(rating) {
    if (isNaN(rating) || Number(rating) < 0 || Number(rating) > 5) {
      return { isValid: false, error: 'Rating must be a number between 0 and 5' };
    }
    return { isValid: true };
  }

  /**
   * Validate search string
   */
  static validateSearch(search) {
    if (typeof search !== 'string') {
      return { isValid: false, error: 'Search must be a string' };
    }
    if (search.length > 255) {
      return { isValid: false, error: 'Search string cannot exceed 255 characters' };
    }
    return { isValid: true };
  }

  /**
   * Sanitize search string for database queries
   */
  static sanitizeSearch(search) {
    return search.trim().replace(/[%_\\]/g, '\\$&');
  }
}

module.exports = Validator;
