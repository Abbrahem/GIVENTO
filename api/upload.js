const mongoose = require('mongoose');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

// MongoDB connection
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  
  const connection = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://abrahemelgazaly2:abrahem88@cluster0.vsqqvab.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  cachedDb = connection;
  return connection;
}

// Image Schema for storing compressed images
const imageSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  data: { type: Buffer, required: true },
  contentType: { type: String, required: true },
  size: { type: Number, required: true },
  compressed: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Image = mongoose.models.Image || mongoose.model('Image', imageSchema);

// Simple image compression function
function compressImage(buffer, quality = 0.8) {
  // This is a basic implementation - in production you'd use sharp or jimp
  return buffer; // For now, return as is
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  await connectToDatabase();
  
  if (req.method === 'POST') {
    try {
      const form = formidable({
        maxFileSize: 10 * 1024 * 1024, // 10MB
        filter: ({ mimetype }) => mimetype && mimetype.includes('image'),
      });

      const [fields, files] = await form.parse(req);
      const file = Array.isArray(files.image) ? files.image[0] : files.image;

      if (!file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      // Read and compress the image
      const imageBuffer = fs.readFileSync(file.filepath);
      const compressedBuffer = compressImage(imageBuffer);

      // Save to MongoDB
      const image = new Image({
        filename: `${Date.now()}-${file.originalFilename}`,
        originalName: file.originalFilename,
        data: compressedBuffer,
        contentType: file.mimetype,
        size: compressedBuffer.length,
        compressed: true
      });

      await image.save();

      res.json({
        message: 'Image uploaded successfully',
        imageId: image._id,
        filename: image.filename,
        size: image.size
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Upload failed' });
    }
  } else if (req.method === 'GET') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ message: 'Image ID required' });
      }

      const image = await Image.findById(id);
      if (!image) {
        return res.status(404).json({ message: 'Image not found' });
      }

      res.setHeader('Content-Type', image.contentType);
      res.setHeader('Content-Length', image.size);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.send(image.data);

    } catch (error) {
      res.status(500).json({ message: 'Error retrieving image' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
