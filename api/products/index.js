// Load environment variables
require('dotenv').config();

const mongoose = require('mongoose');

// Product Schema
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  category: { type: String, required: true },
  sizes: [{ type: String }],
  colors: [{ type: String }],
  images: [{ type: String, required: true }],
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

let Product;
try {
  Product = mongoose.model('Product');
} catch {
  Product = mongoose.model('Product', ProductSchema);
}

// Database connection
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }
  
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Authentication middleware
const authenticateAdmin = (req) => {
  try {
    console.log('🔐 Authenticating admin in products API...');
    
    // Check for token in multiple places
    const authHeader = req.headers.authorization;
    const xAuthToken = req.headers['x-auth-token'];
    
    console.log('📋 Auth header exists:', !!authHeader);
    console.log('📋 x-auth-token exists:', !!xAuthToken);
    
    let token = null;
    
    // Try x-auth-token first (our preferred method)
    if (xAuthToken) {
      token = xAuthToken;
      console.log('✅ Using x-auth-token');
    } 
    // Fallback to Authorization header
    else if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      console.log('✅ Using Authorization Bearer token');
    }
    
    if (!token) {
      console.log('❌ No token found in headers');
      return { isValid: false, error: 'No token, authorization denied' };
    }
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded successfully');
    console.log('👤 Decoded token:', JSON.stringify(decoded, null, 2));
    
    // Handle different token formats
    let isAdmin = false;
    let userInfo = null;
    
    if (decoded.user && decoded.user.isAdmin) {
      // New format: { user: { isAdmin: true, email: "..." } }
      isAdmin = decoded.user.isAdmin;
      userInfo = decoded.user;
    } else if (decoded.role === 'admin') {
      // Old format: { userId: "...", role: "admin" }
      isAdmin = true;
      userInfo = { id: decoded.userId, isAdmin: true, email: 'admin@givento.com' };
    }
    
    if (!isAdmin) {
      console.log('❌ User is not admin');
      return { isValid: false, error: 'Admin access required' };
    }
    
    console.log('✅ Authentication successful');
    return { isValid: true, user: userInfo };
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    return { isValid: false, error: 'Invalid token' };
  }
};

const handler = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      // Get all products
      const products = await Product.find().sort({ createdAt: -1 });
      return res.json(products);
    }

    if (req.method === 'POST') {
      // Create new product - Admin only
      const auth = authenticateAdmin(req);
      if (!auth.isValid) {
        return res.status(401).json({ message: auth.error });
      }
      
      const { name, description, originalPrice, salePrice, category, sizes, colors, images } = req.body;
      
      // Validate that images are provided and are base64 strings
      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ message: 'At least one image is required' });
      }
      
      // Validate base64 images
      for (const image of images) {
        if (!image.startsWith('data:image/')) {
          return res.status(400).json({ message: 'Invalid image format. Images must be base64 encoded.' });
        }
      }
      
      const product = new Product({
        name, description, originalPrice: parseFloat(originalPrice),
        salePrice: parseFloat(salePrice), category, sizes: sizes || [],
        colors: colors || [], images
      });
      
      await product.save();
      return res.status(201).json(product);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = handler;

