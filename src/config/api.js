// API Configuration - Combined deployment
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? ''   // production → يضرب على نفس الدومين بتاع Vercel
  : 'http://localhost:5000'; // development → يضرب على الباك إند المحلي

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

// Helper function to get image URL for production and development
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/placeholder-image.jpg';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a base64 image, return as is
  if (imagePath.startsWith('data:image/')) {
    return imagePath;
  }
  
  // If it's a relative path to public folder (static images)
  if (imagePath.startsWith('/') && !imagePath.startsWith('/uploads/')) {
    return imagePath;
  }
  
  // For file uploads in development
  if (imagePath.startsWith('/uploads/')) {
  
      return `${BASE_URL}${imagePath}`;
     }
  
  // If it looks like a filename without path, assume it's in public folder
  if (!imagePath.includes('/') && (imagePath.includes('.jpg') || imagePath.includes('.png') || imagePath.includes('.webp'))) {
    return `/${imagePath}`;
  }
  
  // Default fallback
  return '/placeholder-image.jpg';
};

// Export for easy access
export { API_ENDPOINTS, BASE_URL };

const apiConfig = {
  BASE_URL,
  ENDPOINTS: API_ENDPOINTS
};

export default apiConfig;
