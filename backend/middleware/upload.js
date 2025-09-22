// Simple image to base64 conversion without any processing (keeps original quality)
const processImageToBase64 = async (buffer, mimetype) => {
  try {
    // Convert to base64 without any processing - keep original quality
    const base64String = `data:${mimetype};base64,${buffer.toString('base64')}`;
    return base64String;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
};

// Validate image file
const validateImageFile = (mimetype) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return allowedTypes.includes(mimetype);
};


module.exports = {
  processImageToBase64,
  validateImageFile
};

