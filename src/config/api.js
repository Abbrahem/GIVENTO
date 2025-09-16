// API Configuration - Combined deployment
const BASE_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_URL || 'https://giventoo-eg.vercel.app'  // Fallback to production URL
  : 'http://localhost:5000';

console.log('API Config - NODE_ENV:', process.env.NODE_ENV);
console.log('API Config - BASE_URL:', BASE_URL);

// API endpoints configuration
const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  
  // Product endpoints
  PRODUCTS: '/api/products',
  PRODUCTS_LATEST: '/api/products/latest',
  PRODUCT_BY_ID: (id) => `/api/products/${id}`,
  
  // Category endpoints
  CATEGORIES: '/api/categories',
  CATEGORY_PRODUCTS: (slug) => `/api/categories/${slug}/products`,
  
  // Order endpoints
  ORDERS: '/api/orders',
  ORDER_BY_ID: (id) => `/api/orders/${id}`
};

// Helper function to build complete API URL
export const getApiUrl = (endpoint) => {
  const url = `${BASE_URL}${endpoint}`;
  return url;
};

// Note: getImageUrl has been moved to utils/imageUtils.js
// This file now only handles API configuration

// Export for easy access
export { API_ENDPOINTS, BASE_URL };

const apiConfig = {
  BASE_URL,
  ENDPOINTS: API_ENDPOINTS
};

export default apiConfig;
