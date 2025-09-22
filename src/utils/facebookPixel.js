// Facebook Pixel utilities with error handling
let pixelInitialized = false;
let pixelId = '1365750232217759';

// Initialize Facebook Pixel with error handling
export const initializeFacebookPixel = () => {
  if (pixelInitialized) {
    console.log('📊 Facebook Pixel already initialized');
    return;
  }

  try {
    // Check if fbq is available
    if (typeof window !== 'undefined' && typeof window.fbq !== 'undefined') {
      console.log('📊 Facebook Pixel is available, initializing...');
      
      // Initialize pixel
      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
      
      pixelInitialized = true;
      console.log('✅ Facebook Pixel initialized successfully');
    } else {
      console.warn('⚠️ Facebook Pixel not loaded yet, will retry...');
      
      // Retry after a short delay
      setTimeout(() => {
        if (typeof window.fbq !== 'undefined') {
          window.fbq('init', pixelId);
          window.fbq('track', 'PageView');
          pixelInitialized = true;
          console.log('✅ Facebook Pixel initialized on retry');
        } else {
          console.error('❌ Facebook Pixel failed to load');
        }
      }, 2000);
    }
  } catch (error) {
    console.error('❌ Facebook Pixel initialization error:', error);
  }
};

// Track custom events with error handling
export const trackPixelEvent = (eventName, parameters = {}) => {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq !== 'undefined') {
      window.fbq('track', eventName, parameters);
      console.log(`📊 Pixel event tracked: ${eventName}`, parameters);
    } else {
      console.warn(`⚠️ Cannot track event ${eventName} - Pixel not available`);
    }
  } catch (error) {
    console.error(`❌ Error tracking pixel event ${eventName}:`, error);
  }
};

// Track specific e-commerce events
export const trackPurchase = (value, currency = 'EGP', contentIds = []) => {
  trackPixelEvent('Purchase', {
    value: value,
    currency: currency,
    content_ids: contentIds,
    content_type: 'product'
  });
};

export const trackAddToCart = (contentId, value, currency = 'EGP') => {
  trackPixelEvent('AddToCart', {
    content_ids: [contentId],
    content_type: 'product',
    value: value,
    currency: currency
  });
};

export const trackViewContent = (contentId, contentName, value, currency = 'EGP') => {
  trackPixelEvent('ViewContent', {
    content_ids: [contentId],
    content_name: contentName,
    content_type: 'product',
    value: value,
    currency: currency
  });
};

export const trackInitiateCheckout = (value, currency = 'EGP', contentIds = []) => {
  trackPixelEvent('InitiateCheckout', {
    value: value,
    currency: currency,
    content_ids: contentIds,
    content_type: 'product'
  });
};

// Check if pixel is working
export const checkPixelStatus = () => {
  const status = {
    loaded: typeof window !== 'undefined' && typeof window.fbq !== 'undefined',
    initialized: pixelInitialized,
    pixelId: pixelId
  };
  
  console.log('📊 Facebook Pixel Status:', status);
  return status;
};

export default {
  initializeFacebookPixel,
  trackPixelEvent,
  trackPurchase,
  trackAddToCart,
  trackViewContent,
  trackInitiateCheckout,
  checkPixelStatus
};
