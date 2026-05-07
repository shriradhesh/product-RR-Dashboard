import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let errorMessage = 'An unexpected error occurred';
    let errorDetails = null;

    if (error.response) {
      // Server responded with error status
      errorMessage = error.response?.data?.message || error.response?.statusText || errorMessage;
      errorDetails = error.response?.data?.error;
    } else if (error.request) {
      // Request made but no response
      errorMessage = 'No response from server. Please check your connection.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. Please try again.';
    }

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      details: errorDetails,
      originalError: error,
    });
  }
);

export default api;