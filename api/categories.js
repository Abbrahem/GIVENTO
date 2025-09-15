const express = require('express');
const Category = require('./models/Category');
const Product = require('./models/Product');
const auth = require('./middleware/auth');

const router = express.Router();
const connectDB = require('./utils/db');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/categories/:slug/products
// @desc    Get products by category
// @access  Public
router.get('/:slug/products', async (req, res) => {
  try {
    await connectDB();
    const products = await Product.find({ category: req.params.slug }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/categories
// @desc    Create new category
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    await connectDB();
    
    const { name, slug, description } = req.body;
    
    const category = new Category({
      name,
      slug,
      description
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
