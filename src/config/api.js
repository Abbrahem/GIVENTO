// API Configuration - Works for both local and Vercel
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://giventoo-eg.vercel.app' 
  : 'http://localhost:5000';

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

// Helper function to get image URL for local development
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/placeholder-image.jpg';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a base64 image, return as is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // For local file uploads, build full URL
  if (imagePath.startsWith('/uploads/')) {
    const imageUrl = `${BASE_URL}${imagePath}`;
    return imageUrl;
  }
  
  // Default fallback
  return '/placeholder-image.jpg';
};

// Export for easy access
export { API_ENDPOINTS, BASE_URL };

export default {
  BASE_URL,
  ENDPOINTS: API_ENDPOINTS
};
