const sharp = require('sharp');

// Image compression and base64 conversion utility
const processImageToBase64 = async (buffer, mimetype) => {
  try {
    let processedBuffer;
    
    // Compress and resize image using Sharp
    if (mimetype.includes('jpeg') || mimetype.includes('jpg')) {
      processedBuffer = await sharp(buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    } else if (mimetype.includes('png')) {
      processedBuffer = await sharp(buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .png({ quality: 80 })
        .toBuffer();
    } else if (mimetype.includes('webp')) {
      processedBuffer = await sharp(buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
    } else {
      // Convert other formats to JPEG
      processedBuffer = await sharp(buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    }
    
    // Convert to base64
    const base64String = `data:${mimetype};base64,${processedBuffer.toString('base64')}`;
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
