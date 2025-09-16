// Image utility functions for handling base64 conversion and compression

// Convert file to base64 with compression
export const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions (max 800px)
        const maxSize = 800;
        let { width, height } = img;
        
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
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        const compressedBase64 = canvas.toDataURL(file.type, 0.8);
        resolve(compressedBase64);
      };
      
      img.onerror = reject;
      img.src = event.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Validate image file
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`نوع الملف غير مدعوم: ${file.type}. الأنواع المدعومة: JPEG, PNG, WebP, GIF`);
  }
  
  if (file.size > maxSize) {
    throw new Error('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت');
  }
  
  return true;
};

// Process multiple files to base64
export const processMultipleFiles = async (files) => {
  const processedImages = [];
  
  for (const file of files) {
    try {
      validateImageFile(file);
      const base64 = await convertFileToBase64(file);
      processedImages.push(base64);
    } catch (error) {
      throw new Error(`خطأ في معالجة الصورة ${file.name}: ${error.message}`);
    }
  }
  
  return processedImages;
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
