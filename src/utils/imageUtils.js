// Image utility functions for handling base64 conversion and compression

// Convert file to base64 with minimal processing (high quality)
export const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      // For high quality, we'll do minimal processing on frontend
      // and let the backend handle optimization
      const img = new Image();
      img.onload = () => {
        // Create canvas for high-quality processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Keep original dimensions up to 2048px (very high quality)
        const maxSize = 2048;
        let { width, height } = img;
        
        // Only resize if image is extremely large
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw image with high quality
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with high quality (0.95 = 95% quality)
        const highQualityBase64 = canvas.toDataURL(file.type, 0.95);
        resolve(highQualityBase64);
      };
      
      img.onerror = reject;
      img.src = event.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Convert file to base64 without any compression (original quality)
export const convertFileToBase64Original = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      // Return original file as base64 without any processing
      resolve(event.target.result);
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Validate image file
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 15 * 1024 * 1024; // Increased to 15MB for high quality images
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`نوع الملف غير مدعوم: ${file.type}. الأنواع المدعومة: JPEG, PNG, WebP, GIF`);
  }
  
  if (file.size > maxSize) {
    throw new Error('حجم الملف كبير جداً. الحد الأقصى 15 ميجابايت');
  }
  
  return true;
};

// Process multiple files to base64 with quality options
export const processMultipleFiles = async (files, useOriginalQuality = false) => {
  const processedImages = [];
  
  for (const file of files) {
    try {
      validateImageFile(file);
      // Use original quality or high quality processing
      const base64 = useOriginalQuality 
        ? await convertFileToBase64Original(file)
        : await convertFileToBase64(file);
      processedImages.push(base64);
    } catch (error) {
      throw new Error(`خطأ في معالجة الصورة ${file.name}: ${error.message}`);
    }
  }
  
  return processedImages;
};

// Process single file with quality options
export const processSingleFile = async (file, useOriginalQuality = false) => {
  try {
    validateImageFile(file);
    return useOriginalQuality 
      ? await convertFileToBase64Original(file)
      : await convertFileToBase64(file);
  } catch (error) {
    throw new Error(`خطأ في معالجة الصورة ${file.name}: ${error.message}`);
  }
};

// Get image URL for display (already base64, so return as is)
export const getImageUrl = (imageData) => {
  // If it's already a base64 string, return it
  if (typeof imageData === 'string' && imageData.startsWith('data:image/')) {
    return imageData;
  }
  
  // If it's a legacy file path, return placeholder
  if (typeof imageData === 'string' && imageData.startsWith('/uploads/')) {
    return '/placeholder-image.jpg';
  }
  
  // Default placeholder
  return '/placeholder-image.jpg';
};
