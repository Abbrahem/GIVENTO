const express = require('express');
const Product = require('./models/Product');
const auth = require('./middleware/auth');

const router = express.Router();
const connectDB = require('./utils/db');

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    await connectDB();
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
    await connectDB();
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
    await connectDB();
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
router.post('/', auth, async (req, res) => {
  try {
    await connectDB();
    
    const { name, description, originalPrice, salePrice, category, sizes, colors, images } = req.body;
    
    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const product = new Product({
      name,
      description,
      originalPrice: parseFloat(originalPrice),
      salePrice: parseFloat(salePrice),
      category,
      sizes: sizes || [],
      colors: colors || [],
      images: images || []
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
router.put('/:id', auth, async (req, res) => {
  try {
    await connectDB();
    
    const { name, description, originalPrice, salePrice, category, sizes, colors, images } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update product fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.originalPrice = originalPrice ? parseFloat(originalPrice) : product.originalPrice;
    product.salePrice = salePrice ? parseFloat(salePrice) : product.salePrice;
    product.category = category || product.category;
    product.sizes = sizes || product.sizes;
    product.colors = colors || product.colors;
    product.images = images || product.images;

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
    await connectDB();
    
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
