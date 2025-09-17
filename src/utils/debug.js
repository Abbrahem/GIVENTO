// Debug utilities for authentication issues
import { getValidToken, isTokenExpired } from './auth';

export const debugAuth = () => {
  console.log('🔍 === AUTH DEBUG ===');
  
  const token = localStorage.getItem('adminToken');
  console.log('🎫 Token exists:', !!token);
  console.log('🎫 Token length:', token ? token.length : 0);
  
  if (token) {
    console.log('🎫 Token preview:', token.substring(0, 50) + '...');
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('📦 Token payload:', payload);
      console.log('⏰ Token exp:', new Date(payload.exp * 1000));
      console.log('⏰ Current time:', new Date());
      console.log('⏰ Is expired:', isTokenExpired(token));
    } catch (error) {
      console.error('❌ Error parsing token:', error);
    }
  }
  
  const validToken = getValidToken();
  console.log('✅ Valid token:', !!validToken);
  
  console.log('🔍 === END AUTH DEBUG ===');
};

export const testApiCall = async () => {
  console.log('🧪 === API TEST ===');
  
  const token = getValidToken();
  if (!token) {
    console.log('❌ No valid token found');
    return;
  }
  
  try {
    const response = await fetch('https://giventoo-eg.vercel.app/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📦 Response data:', data);
    
  } catch (error) {
    console.error('❌ API test error:', error);
  }
  
  console.log('🧪 === END API TEST ===');
};
