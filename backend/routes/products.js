const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const { processImageToBase64, validateImageFile } = require('../middleware/upload');
const multer = require('multer');

// Configure multer for memory storage (no file system)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/latest
// @desc    Get latest product
// @access  Public
router.get('/latest', async (req, res) => {
  try {
    const latestProduct = await Product.findOne().sort({ createdAt: -1 });
    res.json(latestProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Admin only)
router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { name, description, originalPrice, salePrice, category, sizes, colors } = req.body;
    
    // Process uploaded images to base64
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Validate image type
        if (!validateImageFile(file.mimetype)) {
          return res.status(400).json({ message: `Invalid file type: ${file.mimetype}. Only JPEG, PNG, WebP, and GIF are allowed.` });
        }
        
        try {
          // Compress and convert to base64
          const base64Image = await processImageToBase64(file.buffer, file.mimetype);
          images.push(base64Image);
        } catch (error) {
          return res.status(400).json({ message: `Failed to process image: ${file.originalname}` });
        }
      }
    }
    
    if (images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    // Parse sizes and colors if they're strings
    const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    const parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;

    const product = new Product({
      name,
      description,
      originalPrice: parseFloat(originalPrice),
      salePrice: parseFloat(salePrice),
      category,
      sizes: parsedSizes || [],
      colors: parsedColors || [],
      images
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Admin only)
router.put('/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { name, description, originalPrice, salePrice, category, sizes, colors } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Process uploaded images to base64
    let images = product.images;
    if (req.files && req.files.length > 0) {
      images = [];
      for (const file of req.files) {
        // Validate image type
        if (!validateImageFile(file.mimetype)) {
          return res.status(400).json({ message: `Invalid file type: ${file.mimetype}. Only JPEG, PNG, WebP, and GIF are allowed.` });
        }
        
        try {
          // Compress and convert to base64
          const base64Image = await processImageToBase64(file.buffer, file.mimetype);
          images.push(base64Image);
        } catch (error) {
          return res.status(400).json({ message: `Failed to process image: ${file.originalname}` });
        }
      }
    }

    // Parse sizes and colors if they're strings
    const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    const parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;

    // Update product fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.originalPrice = originalPrice ? parseFloat(originalPrice) : product.originalPrice;
    product.salePrice = salePrice ? parseFloat(salePrice) : product.salePrice;
    product.category = category || product.category;
    product.sizes = parsedSizes || product.sizes;
    product.colors = parsedColors || product.colors;
    product.images = images;

    await product.save();
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id/toggle
// @desc    Toggle product availability (sold out/available)
// @access  Private (Admin only)
router.put('/:id/toggle', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isAvailable = !product.isAvailable;
    await product.save();

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
