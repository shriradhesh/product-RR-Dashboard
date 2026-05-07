// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Success Messages
const SUCCESS_MESSAGES = {
  DATA_IMPORTED: 'Data imported successfully',
  DATA_RETRIEVED: 'Data retrieved successfully',
  DATA_UPDATED: 'Data updated successfully',
  DATA_DELETED: 'Data deleted successfully',
  FILE_UPLOADED: 'File uploaded successfully',
};

// Error Messages
const ERROR_MESSAGES = {
  DATABASE_CONNECTION_ERROR: 'Database connection error',
  FILE_UPLOAD_ERROR: 'Error uploading file',
  INVALID_FILE_FORMAT: 'Invalid file format. Please upload CSV or Excel file',
  DATA_IMPORT_ERROR: 'Error importing data',
  DATA_RETRIEVAL_ERROR: 'Error retrieving data',
  INVALID_PRODUCT_ID: 'Invalid product ID',
  PRODUCT_NOT_FOUND: 'Product not found',
  NO_DATA_FOUND: 'No data found',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation error',
  DUPLICATE_ENTRY: 'Duplicate entry found',
};

// API Response Messages
const API_RESPONSES = {
  HEALTH_CHECK: 'Product Analytics API is running',
  WELCOME: 'Welcome to Product Analytics API',
};

module.exports = {
  HTTP_STATUS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  API_RESPONSES,
};