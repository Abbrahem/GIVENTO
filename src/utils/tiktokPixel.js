// TikTok Pixel utilities with error handling
let tiktokInitialized = false;
const TIKTOK_PIXEL_ID = 'D3CC703C77U89SJ4MG9G';

// Initialize TikTok Pixel with error handling
export const initializeTikTokPixel = () => {
  if (tiktokInitialized) {
    console.log('📈 TikTok Pixel already initialized');
    return;
  }

  try {
    if (typeof window !== 'undefined' && typeof window.ttq !== 'undefined') {
      console.log('📈 TikTok Pixel available, initializing...');
      window.ttq.load(TIKTOK_PIXEL_ID);
      window.ttq.page();
      tiktokInitialized = true;
      console.log('✅ TikTok Pixel initialized successfully');
    } else {
      console.warn('⚠️ TikTok Pixel not loaded yet, will retry...');
      setTimeout(() => {
        if (typeof window.ttq !== 'undefined') {
          window.ttq.load(TIKTOK_PIXEL_ID);
          window.ttq.page();
          tiktokInitialized = true;
          console.log('✅ TikTok Pixel initialized on retry');
        } else {
          console.error('❌ TikTok Pixel failed to load');
        }
      }, 2000);
    }
  } catch (error) {
    console.error('❌ TikTok Pixel initialization error:', error);
  }
};

// Track custom events
export const trackTikTokEvent = (eventName, parameters = {}) => {
  try {
    if (typeof window !== 'undefined' && typeof window.ttq !== 'undefined') {
      window.ttq.track(eventName, parameters);
      console.log(`📈 TikTok event tracked: ${eventName}`, parameters);
    } else {
      console.warn(`⚠️ Cannot track TikTok event ${eventName} - ttq not available`);
    }
  } catch (error) {
    console.error(`❌ Error tracking TikTok event ${eventName}:`, error);
  }
};

// Common e-commerce events helpers
export const ttqAddToCart = ({ content_id, value, currency = 'EGP' }) => {
  trackTikTokEvent('AddToCart', { content_id, value, currency });
};

export const ttqViewContent = ({ content_id, content_type = 'product', value, currency = 'EGP' }) => {
  trackTikTokEvent('ViewContent', { content_id, content_type, value, currency });
};

export const ttqInitiateCheckout = ({ value, currency = 'EGP' }) => {
  trackTikTokEvent('InitiateCheckout', { value, currency });
};

export const ttqPurchase = ({ value, currency = 'EGP', contents = [] }) => {
  trackTikTokEvent('CompletePayment', { value, currency, contents });
};

// Status checker
export const checkTikTokStatus = () => {
  const status = {
    loaded: typeof window !== 'undefined' && typeof window.ttq !== 'undefined',
    initialized: tiktokInitialized,
    pixelId: TIKTOK_PIXEL_ID,
  };
  console.log('📈 TikTok Pixel Status:', status);
  return status;
};

const TikTokPixelUtils = {
  initializeTikTokPixel,
  trackTikTokEvent,
  ttqAddToCart,
  ttqViewContent,
  ttqInitiateCheckout,
  ttqPurchase,
  checkTikTokStatus,
};

export default TikTokPixelUtils;
