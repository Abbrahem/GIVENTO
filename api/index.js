const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');

// Import required modules for Vercel serverless
const { parse } = require('url');

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

// Models
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

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    price: Number,
    quantity: Number,
    size: String,
    color: String
  }],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

let Product, User, Order;
try {
  Product = mongoose.model('Product');
  User = mongoose.model('User');
  Order = mongoose.model('Order');
} catch {
  Product = mongoose.model('Product', ProductSchema);
  User = mongoose.model('User', UserSchema);
  Order = mongoose.model('Order', OrderSchema);
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

// Authentication middleware for Vercel
const authenticateAdmin = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isValid: false, error: 'No token provided' };
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.user || !decoded.user.isAdmin) {
      return { isValid: false, error: 'Admin access required' };
    }
    return { isValid: true, user: decoded.user };
  } catch (error) {
    return { isValid: false, error: 'Invalid token' };
  }
};

const handler = async (req, res) => {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();
    const { pathname, query } = parse(req.url, true);
    console.log('🚀 API Request:', req.method, pathname);
    console.log('🔍 Request URL:', req.url);
    console.log('🔍 Parsed pathname:', pathname);
    console.log('🔍 Query params:', query);
    console.log('🌐 Environment:', process.env.NODE_ENV || 'development');
    
    // Test all regex patterns
    console.log('🧪 Testing regex patterns for:', pathname);
    console.log('  - /^\/api\/products\/[a-fA-F0-9]{24}$/ matches:', /^\/api\/products\/[a-fA-F0-9]{24}$/.test(pathname));
    console.log('  - /^\/api\/products\/[a-zA-Z0-9]{20,30}$/ matches:', /^\/api\/products\/[a-zA-Z0-9]{20,30}$/.test(pathname));

    // Products endpoints
    if (pathname === '/api/products') {
      if (req.method === 'GET') {
        const products = await Product.find().sort({ createdAt: -1 });
        return res.json(products);
      }
      if (req.method === 'POST') {
        // Authenticate admin for creating products
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
    }

    if (pathname === '/api/products/latest') {
      if (req.method === 'GET') {
        const latestProduct = await Product.findOne().sort({ createdAt: -1 });
        return res.json(latestProduct);
      }
    }

    // Product by ID endpoint - Match any product ID pattern
    if (pathname.startsWith('/api/products/') && pathname.split('/').length === 4 && pathname !== '/api/products/latest') {
      const productId = pathname.split('/').pop();
      console.log('🆔 Extracted Product ID:', productId);
      console.log('📏 Product ID length:', productId.length);
      console.log('✅ Pattern match successful for product by ID');
      console.log('🔍 Full pathname:', pathname);
      console.log('🔍 Split result:', pathname.split('/'));
      
      // Try to validate ObjectId format but don't fail if invalid
      const isValidObjectId = mongoose.Types.ObjectId.isValid(productId);
      console.log('🧪 ObjectId validation result:', isValidObjectId);
      
      if (!isValidObjectId) {
        console.log('⚠️ Invalid ObjectId format, but continuing anyway:', productId);
        // Don't return error, let's see what happens
      } else {
        console.log('✅ Valid ObjectId format confirmed');
      }
      
      if (req.method === 'GET') {
        try {
          const product = await Product.findById(productId);
          if (!product) {
            return res.status(404).json({ message: 'Product not found' });
          }
          return res.json(product);
        } catch (error) {
          console.error('Error finding product:', error);
          return res.status(500).json({ message: 'Server error' });
        }
      }
      if (req.method === 'PUT') {
        // Authenticate admin for updating products
        const auth = authenticateAdmin(req);
        if (!auth.isValid) {
          return res.status(401).json({ message: auth.error });
        }
        
        try {
          const updates = req.body;
          const product = await Product.findByIdAndUpdate(productId, updates, { new: true });
          if (!product) {
            return res.status(404).json({ message: 'Product not found' });
          }
          return res.json(product);
        } catch (error) {
          console.error('Error updating product:', error);
          return res.status(500).json({ message: 'Server error' });
        }
      }
      if (req.method === 'DELETE') {
        // Authenticate admin for deleting products
        const auth = authenticateAdmin(req);
        if (!auth.isValid) {
          return res.status(401).json({ message: auth.error });
        }
        
        try {
          const product = await Product.findByIdAndDelete(productId);
          if (!product) {
            return res.status(404).json({ message: 'Product not found' });
          }
          return res.json({ message: 'Product deleted successfully' });
        } catch (error) {
          console.error('Error deleting product:', error);
          return res.status(500).json({ message: 'Server error' });
        }
      }
    }

    // Product toggle availability endpoint - Match any product ID with /toggle
    if (pathname.startsWith('/api/products/') && pathname.endsWith('/toggle') && pathname.split('/').length === 5) {
      const productId = pathname.split('/')[3];
      console.log('🔄 Extracted Product ID for toggle:', productId);
      console.log('📏 Product ID length for toggle:', productId.length);
      console.log('✅ Regex match successful for product toggle');
      
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        console.log('❌ Invalid ObjectId format for toggle:', productId);
        return res.status(400).json({ message: 'Invalid product ID format' });
      }
      console.log('✅ Valid ObjectId format confirmed for toggle');
      
      if (req.method === 'PUT') {
        // Authenticate admin for toggling product availability
        const auth = authenticateAdmin(req);
        if (!auth.isValid) {
          return res.status(401).json({ message: auth.error });
        }
        
        try {
          const product = await Product.findById(productId);
          if (!product) {
            return res.status(404).json({ message: 'Product not found' });
          }
          product.isAvailable = !product.isAvailable;
          await product.save();
          return res.json(product);
        } catch (error) {
          console.error('Error toggling product availability:', error);
          return res.status(500).json({ message: 'Server error' });
        }
      }
    }

    // Auth endpoints
    if (pathname === '/api/auth/login') {
      if (req.method === 'POST') {
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }
        const payload = { user: { id: user.id, isAdmin: user.isAdmin } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin }
          });
        });
        return;
      }
    }

    // Orders endpoints
    if (pathname === '/api/orders') {
      if (req.method === 'GET') {
        const orders = await Order.find().sort({ createdAt: -1 });
        return res.json(orders);
      }
      if (req.method === 'POST') {
        const { customerInfo, items, totalAmount, shippingAddress } = req.body;
        const order = new Order({
          customerInfo, items, totalAmount: parseFloat(totalAmount),
          shippingAddress, status: 'pending'
        });
        await order.save();
        return res.status(201).json(order);
      }
    }

    // Order by ID endpoint
    if (pathname.match(/^\/api\/orders\/[a-fA-F0-9]{24}$/)) {
      const orderId = pathname.split('/').pop();
      if (req.method === 'GET') {
        const order = await Order.findById(orderId).populate('items.productId');
        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }
        return res.json(order);
      }
      if (req.method === 'PUT') {
        const updates = req.body;
        const order = await Order.findByIdAndUpdate(orderId, updates, { new: true });
        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }
        return res.json(order);
      }
    }

    // Categories endpoints
    if (pathname === '/api/categories') {
      if (req.method === 'GET') {
        const categories = await Product.distinct('category');
        return res.json(categories.map(cat => ({ name: cat, slug: cat.toLowerCase().replace(/\s+/g, '-') })));
      }
    }

    // Category products endpoint
    if (pathname.match(/^\/api\/categories\/[^\/]+\/products$/)) {
      const categorySlug = pathname.split('/')[3];
      const categoryName = categorySlug.replace(/-/g, ' ');
      if (req.method === 'GET') {
        const products = await Product.find({ 
          category: new RegExp(categoryName, 'i') 
        }).sort({ createdAt: -1 });
        return res.json(products);
      }
    }

    // Image upload endpoint for processing files to base64
    if (pathname === '/api/upload-image') {
      if (req.method === 'POST') {
        try {
          const contentType = req.headers['content-type'];
          if (!contentType || !contentType.includes('multipart/form-data')) {
            return res.status(400).json({ message: 'Content-Type must be multipart/form-data' });
          }
          
          // Parse multipart data manually for Vercel
          const chunks = [];
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', async () => {
            try {
              const buffer = Buffer.concat(chunks);
              const boundary = contentType.split('boundary=')[1];
              
              // Simple multipart parser for single image
              const parts = buffer.toString('binary').split(`--${boundary}`);
              let imageBuffer = null;
              let mimetype = null;
              
              for (const part of parts) {
                if (part.includes('Content-Type: image/')) {
                  const lines = part.split('\r\n');
                  const contentTypeIndex = lines.findIndex(line => line.includes('Content-Type:'));
                  if (contentTypeIndex !== -1) {
                    mimetype = lines[contentTypeIndex].split('Content-Type: ')[1];
                    const dataStartIndex = part.indexOf('\r\n\r\n') + 4;
                    const dataEndIndex = part.lastIndexOf('\r\n');
                    const imageData = part.slice(dataStartIndex, dataEndIndex);
                    imageBuffer = Buffer.from(imageData, 'binary');
                    break;
                  }
                }
              }
              
              if (!imageBuffer || !mimetype) {
                return res.status(400).json({ message: 'No valid image found in request' });
              }
              
              if (!validateImageFile(mimetype)) {
                return res.status(400).json({ message: `Invalid file type: ${mimetype}` });
              }
              
              const base64Image = await processImageToBase64(imageBuffer, mimetype);
              return res.json({ image: base64Image });
              
            } catch (error) {
              console.error('Image processing error:', error);
              return res.status(500).json({ message: 'Failed to process image' });
            }
          });
          
          return; // Don't send response yet, wait for data
        } catch (error) {
          console.error('Upload error:', error);
          return res.status(500).json({ message: 'Upload failed' });
        }
      }
    }

    // Health check
    if (pathname === '/api/health') {
      return res.json({ 
        status: 'OK', 
        message: 'API is running',
        mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    }

    // Test endpoint to verify routing
    if (pathname === '/api/test') {
      return res.json({
        message: 'API routing is working!',
        pathname,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    }

    // Test ObjectId validation
    if (pathname.startsWith('/api/test-objectid/')) {
      const testId = pathname.split('/').pop();
      return res.json({
        testId,
        isValid: mongoose.Types.ObjectId.isValid(testId),
        length: testId.length,
        timestamp: new Date().toISOString()
      });
    }

    // EMERGENCY FALLBACK - Try to handle any products route that didn't match above
    if (pathname.includes('/api/products/') && !pathname.includes('/latest') && req.method === 'GET') {
      console.log('🚨 EMERGENCY FALLBACK - Trying to handle products route');
      const parts = pathname.split('/');
      console.log('🔍 URL parts:', parts);
      
      // Try to extract product ID from any position
      let productId = null;
      for (let i = 0; i < parts.length; i++) {
        if (parts[i] === 'products' && i + 1 < parts.length) {
          productId = parts[i + 1];
          break;
        }
      }
      
      if (productId) {
        console.log('🆔 EMERGENCY - Extracted Product ID:', productId);
        try {
          const product = await Product.findById(productId);
          if (product) {
            console.log('✅ EMERGENCY - Found product:', product.name);
            return res.json(product);
          } else {
            console.log('❌ EMERGENCY - Product not found in DB');
            return res.status(404).json({ message: 'Product not found' });
          }
        } catch (error) {
          console.log('❌ EMERGENCY - Error finding product:', error.message);
          return res.status(500).json({ message: 'Error finding product', error: error.message });
        }
      }
    }

    // CATCH ALL - Log everything that doesn't match
    console.log('❌ Route not found:', pathname);
    console.log('🔍 Request method:', req.method);
    console.log('🔍 Full URL:', req.url);
    console.log('🔍 Pathname length:', pathname.length);
    console.log('🔍 Pathname chars:', pathname.split('').map(c => c.charCodeAt(0)));
    
    // Check if it's a products route that should have matched
    if (pathname.includes('/api/products/')) {
      console.log('🚨 This looks like a products route that should have matched!');
      console.log('  - startsWith /api/products/:', pathname.startsWith('/api/products/'));
      console.log('  - split length:', pathname.split('/').length);
      console.log('  - is not latest:', pathname !== '/api/products/latest');
      console.log('  - split parts:', pathname.split('/'));
    }
    
    console.log('🔍 Available routes checked:');
    console.log('  - /api/products (GET, POST)');
    console.log('  - /api/products/latest (GET)'); 
    console.log('  - /api/products/:id (GET, PUT, DELETE)');
    console.log('  - /api/products/:id/toggle (PUT)');
    console.log('  - /api/auth/login (POST)');
    console.log('  - /api/orders (GET, POST)');
    console.log('  - /api/orders/:id (GET, PUT)');
    console.log('  - /api/categories (GET)');
    console.log('  - /api/categories/:slug/products (GET)');
    console.log('  - /api/health (GET)');
    return res.status(404).json({ 
      message: `Route not found: ${pathname}`,
      method: req.method,
      availableRoutes: [
        'GET /api/products',
        'POST /api/products',
        'GET /api/products/latest',
        'GET /api/products/:id',
        'PUT /api/products/:id',
        'DELETE /api/products/:id',
        'PUT /api/products/:id/toggle',
        'POST /api/auth/login',
        'GET /api/orders',
        'POST /api/orders',
        'GET /api/orders/:id',
        'PUT /api/orders/:id',
        'GET /api/categories',
        'GET /api/categories/:slug/products',
        'GET /api/health'
      ]
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = handler;
