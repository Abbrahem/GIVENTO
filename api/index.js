const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// JWT Secret - Generate a secure random secret
const JWT_SECRET = 'givento_jwt_secret_2024_secure_key_a8f9b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/givento', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schemas
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  category: {
    type: String,
    required: true,
    enum: ['t-shirt', 'pants', 'shorts', 'cap', 'zip-up', 'hoodies', 'polo shirts']
  },
  sizes: [String],
  colors: [String],
  images: [String],
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true },
  customerPhone: { type: String, required: true, trim: true },
  alternatePhone: { type: String, trim: true },
  customerAddress: { type: String, required: true, trim: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: String,
    quantity: { type: Number, required: true, min: 1 },
    size: String,
    color: String,
    price: { type: Number, required: true },
    image: String
  }],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  image: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Models
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const Category = mongoose.model('Category', categorySchema);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// ==================== AUTH ROUTES ====================

// Admin login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Simple admin credentials (in production, use database)
    const adminUsername = 'admin';
    const adminPassword = 'admin123';
    
    if (username === adminUsername && password === adminPassword) {
      const token = jwt.sign(
        { id: 'admin', username: adminUsername },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        token,
        user: { id: 'admin', username: adminUsername }
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== PRODUCT ROUTES ====================

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product
app.post('/api/products', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, originalPrice, salePrice, category, sizes, colors, isAvailable } = req.body;
    
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    const product = new Product({
      name,
      description,
      originalPrice: parseFloat(originalPrice),
      salePrice: parseFloat(salePrice),
      category,
      sizes: Array.isArray(sizes) ? sizes : (sizes ? sizes.split(',') : []),
      colors: Array.isArray(colors) ? colors : (colors ? colors.split(',') : []),
      images,
      isAvailable: isAvailable !== 'false'
    });
    
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
app.put('/api/products/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, originalPrice, salePrice, category, sizes, colors, isAvailable } = req.body;
    
    const updateData = {
      name,
      description,
      originalPrice: parseFloat(originalPrice),
      salePrice: parseFloat(salePrice),
      category,
      sizes: Array.isArray(sizes) ? sizes : (sizes ? sizes.split(',') : []),
      colors: Array.isArray(colors) ? colors : (colors ? colors.split(',') : []),
      isAvailable: isAvailable !== 'false',
      updatedAt: Date.now()
    };
    
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => `/uploads/${file.filename}`);
    }
    
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
app.delete('/api/products/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete associated images
    if (product.images && product.images.length > 0) {
      product.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== ORDER ROUTES ====================

// Get all orders
app.get('/api/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order by ID
app.get('/api/orders/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, customerPhone, alternatePhone, customerAddress, items, totalAmount } = req.body;
    
    const order = new Order({
      customerName,
      customerPhone,
      alternatePhone,
      customerAddress,
      items,
      totalAmount
    });

    await order.save();
    
    // Populate the order with product details
    await order.populate('items.product', 'name images');
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status
app.put('/api/orders/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    order.updatedAt = Date.now();
    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete order
app.delete('/api/orders/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== CATEGORY ROUTES ====================

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create category
app.post('/api/categories', auth, async (req, res) => {
  try {
    const { name, slug, description, image } = req.body;
    
    const category = new Category({
      name,
      slug,
      description,
      image
    });
    
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update category
app.put('/api/categories/:id', auth, async (req, res) => {
  try {
    const { name, slug, description, image, isActive } = req.body;
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, slug, description, image, isActive },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category
app.delete('/api/categories/:id', auth, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'GIVENTO API is running',
    timestamp: new Date().toISOString(),
    jwt_secret_configured: !!JWT_SECRET
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 GIVENTO API Server running on port ${PORT}`);
  console.log(`🔑 JWT Secret: ${JWT_SECRET.substring(0, 20)}...`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
