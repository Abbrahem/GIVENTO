// API Client with automatic token handling
import axios from 'axios';
import { getValidToken } from './auth';

// Create axios instance
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://giventoo-eg.vercel.app',
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
