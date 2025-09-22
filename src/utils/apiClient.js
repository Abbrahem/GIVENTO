// API Client with automatic token handling
import axios from 'axios';
import { getValidToken } from './auth';

// Create axios instance with fallback URLs
const getBaseURL = () => {
  // Try environment variable first
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Production fallback URLs
  const fallbackUrls = [
    'https://giventoo-eg.vercel.app',
    'https://givento-api.vercel.app',
    'https://givento-backend.vercel.app'
  ];
  
  // Return first fallback for now
  return fallbackUrls[0];
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    
    const token = getValidToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🎫 Token added to request');
    } else {
      console.log('⚠️ No token available for request');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.config?.url);
    console.error('❌ Error details:', error.message);
    
    // Handle network errors
    if (error.code === 'ERR_NAME_NOT_RESOLVED' || error.code === 'ERR_NETWORK') {
      console.error('🌐 Network/DNS Error - Check internet connection and domain');
      
      // Show user-friendly error
      const errorMessage = 'خطأ في الاتصال بالخادم. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى.';
      
      // You can show a toast or alert here
      if (window.showErrorToast) {
        window.showErrorToast(errorMessage);
      } else {
        console.error('Network Error:', errorMessage);
      }
    }
    
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - clearing token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      // Optionally redirect to login
      if (window.location.pathname.includes('/admin') && !window.location.pathname.includes('/login')) {
        window.location.href = '/admin/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // Auth endpoints
  login: (credentials) => apiClient.post('/api/auth/login', credentials),
  
  // Orders endpoints
  getOrders: () => apiClient.get('/api/orders'),
  createOrder: (orderData) => apiClient.post('/api/orders', orderData),
  getOrder: (id) => apiClient.get(`/api/orders/${id}`),
  updateOrderStatus: (id, status) => apiClient.put(`/api/orders/${id}/status`, { status }),
  deleteOrder: (id) => apiClient.delete(`/api/orders/${id}`),
  cleanupOrders: () => apiClient.delete('/api/orders/cleanup'),
  
  // Products endpoints
  getProducts: () => apiClient.get('/api/products'),
  getProduct: (id) => apiClient.get(`/api/products/${id}`),
  createProduct: (product) => apiClient.post('/api/products', product),
  updateProduct: (id, product) => apiClient.put(`/api/products/${id}`, product),
  deleteProduct: (id) => apiClient.delete(`/api/products/${id}`),
  toggleProduct: (id) => apiClient.put(`/api/products/${id}/toggle`),
  
  // Categories endpoints
  getCategories: () => apiClient.get('/api/categories'),
  getCategoryProducts: (slug) => apiClient.get(`/api/categories/${slug}/products`),
  
  // Health check
  health: () => apiClient.get('/api/health'),
  
  // Test endpoints
  test: () => apiClient.get('/api/test'),
  testOrdersSimple: () => apiClient.get('/api/test-orders-simple')
};

export default apiClient;
