const express = require('express');
const Category = require('../models/Category');
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

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/categories
// @desc    Create new category
// @access  Private (Admin only)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Category image is required' });
    }

    // Validate image type
    if (!validateImageFile(req.file.mimetype)) {
      return res.status(400).json({ message: `Invalid file type: ${req.file.mimetype}. Only JPEG, PNG, WebP, and GIF are allowed.` });
    }
    
    // Process image to base64
    const base64Image = await processImageToBase64(req.file.buffer, req.file.mimetype);

    const category = new Category({
      name,
      description,
      image: base64Image
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private (Admin only)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update image if new one is uploaded
    let image = category.image;
    if (req.file) {
      // Validate image type
      if (!validateImageFile(req.file.mimetype)) {
        return res.status(400).json({ message: `Invalid file type: ${req.file.mimetype}. Only JPEG, PNG, WebP, and GIF are allowed.` });
      }
      
      // Process image to base64
      image = await processImageToBase64(req.file.buffer, req.file.mimetype);
    }

    category.name = name || category.name;
    category.description = description || category.description;
    category.image = image;

    await category.save();
    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
