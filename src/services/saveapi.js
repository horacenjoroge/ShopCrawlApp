// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL - change this to your actual API URL in production
const API_URL = 'http://192.168.100.54:3000/api';

// Create axios instance with base config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken'); // Note: use 'userToken' not 'token'
    if (token) {
      config.headers['x-auth-token'] = token; // Use x-auth-token instead of Authorization
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// History related API calls
export const historyService = {
  // Get user search history
  getUserHistory: async () => {
    try {
      const response = await api.get('/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  },

  // Add to search history
  addSearchToHistory: async (query) => {
    try {
      const response = await api.post('/history', { query });
      return response.data;
    } catch (error) {
      console.error('Error saving search to history:', error);
      throw error;
    }
  },

  // Delete a history item
  deleteHistoryItem: async (id) => {
    try {
      const response = await api.delete(`/history/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting history item:', error);
      throw error;
    }
  },

  // Clear all history
  clearAllHistory: async () => {
    try {
      const response = await api.delete('/history');
      return response.data;
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  }
};

// Product related API calls
export const savedProductService = {
  // Get all saved products
  getSavedProducts: async () => {
    try {
      const response = await api.get('/products/saved');
      return response.data;
    } catch (error) {
      console.error('Error fetching saved products:', error);
      throw error;
    }
  },

  // Save a product
  saveProduct: async (product) => {
    try {
      // Format product data for API consistency
      const productData = {
        productId: product.id,
        productData: {
          name: product.name || product.title || 'Unknown Product',
          price: product.price || '$0',
          image: product.image || 'https://via.placeholder.com/300',
          store: product.store || 'Amazon',
          description: product.description || product.specs || 'No description available',
          productUrl: product.productUrl || product.product_link || '',
          category: typeof product.category === 'object' 
            ? product.category.name 
            : (product.category || 'Uncategorized')
        }
      };
      
      const response = await api.post('/products/save', productData);
      return response.data;
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  },

  // Delete a saved product
  deleteSavedProduct: async (productId) => {
    try {
      const response = await api.delete(`/products/saved/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting saved product:', error);
      throw error;
    }
  },

  // Clear all saved products
  clearAllSavedProducts: async () => {
    try {
      const response = await api.delete('/products/saved');
      return response.data;
    } catch (error) {
      console.error('Error clearing saved products:', error);
      throw error;
    }
  }
};

export default saveapi;