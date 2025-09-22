// API Configuration with multiple fallback URLs
const PRODUCTION_URLS = [
  'https://giventoo-eg.vercel.app',
  'https://givento-api.vercel.app', 
  'https://givento-backend.vercel.app'
];

const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    // Use environment variable if available, otherwise use first fallback
    return process.env.REACT_APP_API_URL || PRODUCTION_URLS[0];
  } else {
    // Development mode
    return 'http://localhost:5000';
  }
};

const BASE_URL = getBaseURL();

console.log('API Config - NODE_ENV:', process.env.NODE_ENV);
console.log('API Config - BASE_URL:', BASE_URL);
console.log('API Config - Available fallback URLs:', PRODUCTION_URLS);

// API endpoints configuration
const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  CREATE_ADMIN: '/api/auth/create-admin',
  
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
  console.log('🔗 Building API URL:', url);
  return url;
};

// Function to test API connectivity
export const testApiConnection = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Connection Test Successful:', data);
      return { success: true, data };
    } else {
      console.error('❌ API Connection Test Failed:', response.status);
      return { success: false, status: response.status };
    }
  } catch (error) {
    console.error('❌ API Connection Test Error:', error.message);
    return { success: false, error: error.message };
  }
};

// Function to try fallback URLs if main URL fails
export const tryFallbackUrls = async (endpoint) => {
  for (const url of PRODUCTION_URLS) {
    try {
      console.log(`🔄 Trying fallback URL: ${url}${endpoint}`);
      const response = await fetch(`${url}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });
      
      if (response.ok) {
        console.log(`✅ Fallback URL successful: ${url}`);
        return { success: true, url, response };
      }
    } catch (error) {
      console.log(`❌ Fallback URL failed: ${url} - ${error.message}`);
    }
  }
  
  return { success: false, message: 'All fallback URLs failed' };
};

// Note: getImageUrl has been moved to utils/imageUtils.js
// This file now only handles API configuration

// Export for easy access
export { API_ENDPOINTS, BASE_URL, PRODUCTION_URLS };

const apiConfig = {
  BASE_URL,
  ENDPOINTS: API_ENDPOINTS
};

export default apiConfig;
