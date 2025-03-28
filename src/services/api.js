import axios from 'axios';

// Base URL for your backend API
const API_BASE_URL = 'http://192.168.100.54:3000/api'; 

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

// Authentication services
export const authService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Login failed');
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Registration failed');
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to process request');
    }
  },
};

// Centralized error handling
const handleApiError = (error, defaultMessage) => {
  if (error.response) {
    return { error: error.response.data.message || defaultMessage };
  } else if (error.request) {
    return { error: 'No response from server. Check your internet connection.' };
  } else {
    return { error: 'Error setting up request: ' + error.message };
  }
};


export default api;
