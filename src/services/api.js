import axios from 'axios';

// Base URL for your backend API
const API_BASE_URL = 'http://192.168.0.175:5000/api'; // Update this with your actual backend URL when deployed

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
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
    throw new Error(error.response.data.message || defaultMessage);
  } else if (error.request) {
    throw new Error('No response from server. Please check your internet connection.');
  } else {
    throw new Error('Error setting up request: ' + error.message);
  }
};

export default api;
