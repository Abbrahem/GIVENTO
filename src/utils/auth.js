// Authentication utilities
import Swal from 'sweetalert2';

// Check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

// Get valid token (without showing alerts)
export const getValidToken = (showAlerts = false) => {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    if (showAlerts) showLoginRequired();
    return null;
  }
  
  if (isTokenExpired(token)) {
    localStorage.removeItem('adminToken');
    if (showAlerts) showTokenExpired();
    return null;
  }
  
  return token;
};

// Show login required message
export const showLoginRequired = () => {
  Swal.fire({
    title: 'Authentication Required!',
    text: 'Please login as admin first.',
    icon: 'warning',
    confirmButtonColor: '#b71c1c'
  });
};

// Show token expired message
export const showTokenExpired = () => {
  Swal.fire({
    title: 'Session Expired!',
    text: 'Your session has expired. Please login again.',
    icon: 'warning',
    confirmButtonColor: '#b71c1c'
  });
};

// Handle API response with authentication
export const handleApiResponse = async (response) => {
  if (response.status === 401) {
    const errorData = await response.json().catch(() => ({}));
    
    localStorage.removeItem('adminToken');
    
    if (errorData.code === 'TOKEN_EXPIRED') {
      showTokenExpired();
    } else {
      showLoginRequired();
    }
    
    return { success: false, requiresLogin: true };
  }
  
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (parseError) {
      console.log('Could not parse error response:', parseError);
    }
    throw new Error(errorMessage);
  }
  
  return { success: true, response };
};

// Make authenticated API request
export const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = getValidToken(true); // Show alerts when making requests
  
  if (!token) {
    return { success: false, requiresLogin: true };
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    return await handleApiResponse(response);
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};
