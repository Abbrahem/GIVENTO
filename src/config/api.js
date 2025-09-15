// API Configuration
const API_CONFIG = {
  // Use environment variable or fallback to localhost for development
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  VERSION: '2.0', // Force cache refresh
  
  // API endpoints
  ENDPOINTS: {
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
    ORDER_BY_ID: (id) => `/api/orders/${id}`,
    
    // Upload endpoints
    UPLOAD: '/api/upload'
  }
};

// Helper function to build full API URL
export const getApiUrl = (endpoint) => {
  // Clean base URL and endpoint to avoid duplicates
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/+$/, ''); // Remove trailing slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${baseUrl}${cleanEndpoint}`;
};

// Helper function to get image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('data:')) return imagePath; // For base64 images
  return `${API_CONFIG.BASE_URL}${imagePath}`;
};

// Export endpoints for easy access
export const API_ENDPOINTS = API_CONFIG.ENDPOINTS;

export default API_CONFIG;
