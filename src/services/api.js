import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userId', response.data.userId);
      
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Login failed');
    }
  },

  // Register user
  register: async (userData) => {
    try {
      // Validate input
      if (!userData.username || !userData.email || !userData.password) {
        throw new Error('All fields are required');
      }

      const response = await api.post('/auth/register', userData);
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userEmail', userData.email);
      await AsyncStorage.setItem('userId', response.data.user.id);
      await AsyncStorage.setItem('username', userData.username);
      
      return response.data;
    } catch (error) {
      // Log the full error for debugging
      console.log('Registration Error:', error);
      
      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const serverError = error.response.data;
        
        // Handle specific error cases
        switch (serverError.error) {
          case 'USER_EXISTS':
            throw new Error(`User with this ${serverError.existingField} already exists`);
          case 'INCOMPLETE_DATA':
            throw new Error('Please provide all required information');
          case 'VALIDATION_ERROR':
            throw new Error('Registration validation failed');
          default:
            throw new Error(serverError.msg || 'Registration failed');
        }
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error('Error setting up registration request: ' + error.message);
      }
    }
  },

  // Logout user
  logout: async () => {
    try {
      // Retrieve token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      
      // If no token, throw an error
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Set token in headers for the logout request
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Call logout endpoint
      await api.post('/auth/logout');
      
      return { msg: 'Logged out successfully' };
    } catch (error) {
      return handleApiError(error, 'Logout failed');
    }
  },

  // Delete user account
  deleteAccount: async () => {
    try {
      // Retrieve token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      
      // If no token, throw an error
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Set token in headers for the delete request
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Call delete account endpoint
      const response = await api.delete('/auth/delete');
      
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Account deletion failed');
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to process request');
    }
  }
};

// Centralized error handling
const handleApiError = (error, defaultMessage) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return { 
      error: error.response.data.msg || 
             error.response.data.message || 
             defaultMessage 
    };
  } else if (error.request) {
    // The request was made but no response was received
    return { error: 'No response from server. Check your internet connection.' };
  } else {
    // Something happened in setting up the request that triggered an Error
    return { error: 'Error setting up request: ' + error.message };
  }
};

export default api;