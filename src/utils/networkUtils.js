// Network utilities for handling connection issues
import axios from 'axios';

// Check if URL is reachable
export const checkUrlReachability = async (url, timeout = 5000) => {
  try {
    const response = await axios.get(url, { 
      timeout,
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    return { reachable: true, status: response.status };
  } catch (error) {
    console.error(`URL ${url} is not reachable:`, error.message);
    return { 
      reachable: false, 
      error: error.message,
      code: error.code 
    };
  }
};

// Test multiple API endpoints
export const testApiEndpoints = async () => {
  const endpoints = [
    'https://giventoo-eg.vercel.app/api/health',
    'https://giventoo-eg.vercel.app/api/products',
    'https://giventoo-eg.vercel.app/api/categories'
  ];

  const results = {};
  
  for (const endpoint of endpoints) {
    results[endpoint] = await checkUrlReachability(endpoint);
  }
  
  return results;
};

// Check internet connectivity
export const checkInternetConnection = async () => {
  try {
    // Try to reach a reliable service
    await axios.get('https://www.google.com', { timeout: 3000 });
    return true;
  } catch (error) {
    console.error('No internet connection:', error.message);
    return false;
  }
};

// Network diagnostics
export const runNetworkDiagnostics = async () => {
  console.log('🔍 Running network diagnostics...');
  
  const diagnostics = {
    internetConnection: await checkInternetConnection(),
    apiEndpoints: await testApiEndpoints(),
    timestamp: new Date().toISOString()
  };
  
  console.log('📊 Network Diagnostics Results:', diagnostics);
  return diagnostics;
};

// Retry function with exponential backoff
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export default {
  checkUrlReachability,
  testApiEndpoints,
  checkInternetConnection,
  runNetworkDiagnostics,
  retryWithBackoff
};
