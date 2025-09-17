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
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  alternatePhone: { type: String },
  customerAddress: { type: String, required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    size: String,
    color: String,
    image: String
  }],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

// Register models safely
let Product, User, Order;

console.log('📋 Registering mongoose models...');
console.log('📋 Existing models:', Object.keys(mongoose.models));

// Check if models are already registered
if (mongoose.models.Product) {
  Product = mongoose.models.Product;
  console.log('✅ Product model already registered');
} else {
  Product = mongoose.model('Product', ProductSchema);
  console.log('✅ Product model registered');
}

if (mongoose.models.User) {
  User = mongoose.models.User;
  console.log('✅ User model already registered');
} else {
  User = mongoose.model('User', UserSchema);
  console.log('✅ User model registered');
}

if (mongoose.models.Order) {
  Order = mongoose.models.Order;
  console.log('✅ Order model already registered');
} else {
  Order = mongoose.model('Order', OrderSchema);
  console.log('✅ Order model registered');
}

console.log('📋 Final models:', Object.keys(mongoose.models));

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
  try {
    console.log('🔐 Authenticating admin...');
    console.log('🔑 JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('🔑 JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
    
    // Log all headers for debugging (but limit size)
    const headersToLog = { ...req.headers };
    if (headersToLog.authorization) {
      headersToLog.authorization = headersToLog.authorization.substring(0, 20) + '...';
    }
    console.log('📋 Headers:', JSON.stringify(headersToLog, null, 2));
    
    const authHeader = req.headers.authorization;
    console.log('📋 Auth header exists:', !!authHeader);
    console.log('📋 Auth header starts with Bearer:', authHeader ? authHeader.startsWith('Bearer ') : false);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header');
      return { isValid: false, error: 'No token provided' };
    }
    
    const token = authHeader.split(' ')[1];
    console.log('🎫 Token length:', token ? token.length : 0);
    console.log('🎫 Token first 10 chars:', token ? token.substring(0, 10) + '...' : 'None');
    
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET is missing from environment');
      return { isValid: false, error: 'Server configuration error' };
    }
    
    console.log('🔐 Attempting to verify token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded successfully');
    console.log('👤 User exists in token:', !!decoded.user);
    console.log('👤 User email:', decoded.user ? decoded.user.email : 'No user in token');
    console.log('🔒 Is Admin:', decoded.user ? decoded.user.isAdmin : 'No user data');
    
    if (!decoded.user || !decoded.user.isAdmin) {
      console.log('❌ User is not admin');
      return { isValid: false, error: 'Admin access required' };
    }
    
    console.log('✅ Authentication successful');
    return { isValid: true, user: decoded.user };
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    console.error('❌ Authentication error type:', error.name);
    console.error('❌ Authentication error stack:', error.stack);
    
    if (error.name === 'TokenExpiredError') {
      return { isValid: false, error: 'Token expired', code: 'TOKEN_EXPIRED' };
    } else if (error.name === 'JsonWebTokenError') {
      return { isValid: false, error: 'Invalid token', code: 'INVALID_TOKEN' };
    }
    return { isValid: false, error: 'Token verification failed', code: 'TOKEN_ERROR' };
  }
};

// Helper function to parse JSON body for Vercel serverless functions
const parseBody = async (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        if (body) {
          resolve(JSON.parse(body));
        } else {
          resolve({});
        }
      } catch (error) {
        console.error('Error parsing JSON body:', error);
        reject(error);
      }
    });
    req.on('error', reject);
  });
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
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connected successfully');
    console.log('🔍 MongoDB connection state:', mongoose.connection.readyState);
    console.log('🔍 MongoDB connection name:', mongoose.connection.name);
    
    // Parse JSON body for POST/PUT requests
    if ((req.method === 'POST' || req.method === 'PUT') && req.headers['content-type']?.includes('application/json')) {
      try {
        req.body = await parseBody(req);
        console.log('📦 Parsed request body:', req.body);
      } catch (error) {
        console.error('❌ Failed to parse request body:', error);
        return res.status(400).json({ message: 'Invalid JSON in request body' });
      }
    }
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

    // Products endpoints (temporary - back in index.js for immediate fix)
    if (pathname === '/api/products') {
      if (req.method === 'GET') {
        console.log('🔍 Getting products');
        const products = await Product.find().sort({ createdAt: -1 });
        return res.json(products);
      }
      if (req.method === 'POST') {
        console.log('🔍 Creating product - checking authentication');
        
        // Check authentication
        const auth = authenticateAdmin(req);
        if (!auth.isValid) {
          console.log('❌ Authentication failed:', auth.error);
          return res.status(401).json({ message: auth.error });
        }
        
        console.log('✅ Authentication successful for user:', auth.user.email);
        
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

    // Product by ID endpoint
    if (pathname.startsWith('/api/products/') && pathname.split('/').length === 4 && pathname !== '/api/products/latest') {
      const productId = pathname.split('/').pop();
      console.log('🆔 Product ID:', productId);
      
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
        console.log('🔍 Updating product - checking authentication');
        
        // Check authentication
        const auth = authenticateAdmin(req);
        if (!auth.isValid) {
          console.log('❌ Authentication failed:', auth.error);
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
        console.log('🔍 Deleting product - checking authentication');
        
        // Check authentication
        const auth = authenticateAdmin(req);
        if (!auth.isValid) {
          console.log('❌ Authentication failed:', auth.error);
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

    // Product toggle endpoint
    if (pathname.startsWith('/api/products/') && pathname.endsWith('/toggle') && pathname.split('/').length === 5) {
      const productId = pathname.split('/')[3];
      console.log('🔄 Toggle product:', productId);
      
      if (req.method === 'PUT') {
        console.log('🔍 Toggling product - checking authentication');
        
        // Check authentication
        const auth = authenticateAdmin(req);
        if (!auth.isValid) {
          console.log('❌ Authentication failed:', auth.error);
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
          console.error('Error toggling product:', error);
          return res.status(500).json({ message: 'Server error' });
        }
      }
    }

    // Create admin user endpoint (for testing)
    if (pathname === '/api/auth/create-admin') {
      if (req.method === 'POST') {
        console.log('🔧 Creating admin user...');
        
        const { email, password, name } = req.body;
        
        // Check if admin already exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: 'Admin user already exists' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create admin user
        const adminUser = new User({
          name,
          email,
          password: hashedPassword,
          isAdmin: true
        });
        
        await adminUser.save();
        console.log('✅ Admin user created successfully');
        
        return res.status(201).json({ 
          message: 'Admin user created successfully',
          user: { id: adminUser.id, name: adminUser.name, email: adminUser.email, isAdmin: adminUser.isAdmin }
        });
      }
    }

    // Auth endpoints
    if (pathname === '/api/auth/login') {
      if (req.method === 'POST') {
        console.log('🔐 Login request received');
        console.log('🔍 Request body:', req.body);
        console.log('🔍 Content-Type:', req.headers['content-type']);
        
        // Validate request body
        if (!req.body) {
          console.error('❌ No request body found');
          return res.status(400).json({ message: 'Request body is required' });
        }
        
        const { email, password } = req.body;
        
        // Validate required fields
        if (!email || !password) {
          console.error('❌ Missing email or password');
          return res.status(400).json({ message: 'Email and password are required' });
        }
        
        console.log('🔍 Login attempt for email:', email);
        
        let user = await User.findOne({ email });
        
        // Auto-create admin user if it doesn't exist and trying to login with admin credentials
        if (!user && email === 'admin@givento.com' && password === 'admin123') {
          console.log('🔧 Auto-creating admin user...');
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          
          user = new User({
            name: 'Admin',
            email: 'admin@givento.com',
            password: hashedPassword,
            isAdmin: true
          });
          
          await user.save();
          console.log('✅ Admin user auto-created successfully');
        }
        
        if (!user) {
          console.log('❌ User not found:', email);
          return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          console.log('❌ Password mismatch for user:', email);
          return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        console.log('🔐 Creating JWT token for user:', user.email);
        console.log('🔒 User isAdmin:', user.isAdmin);
        console.log('🔑 JWT_SECRET available:', !!process.env.JWT_SECRET);
        
        if (!process.env.JWT_SECRET) {
          console.error('❌ JWT_SECRET is not set in environment variables');
          return res.status(500).json({ message: 'Server configuration error' });
        }
        
        const payload = { 
          user: { 
            id: user.id, 
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin 
          } 
        };
        
        console.log('📦 JWT Payload:', payload);
        
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
          if (err) {
            console.error('❌ JWT signing error:', err);
            return res.status(500).json({ message: 'Failed to create token' });
          }
          
          console.log('✅ JWT token created successfully');
          console.log('🎫 Token length:', token.length);
          
          res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin }
          });
        });
        return;
      }
    }

    // Orders endpoints (temporary - until separate files are deployed)
    if (pathname === '/api/orders') {
      if (req.method === 'GET') {
        console.log('🔍 Getting orders - starting process');
        
        try {
          // Check authentication first
          console.log('🔐 Checking authentication...');
          const auth = authenticateAdmin(req);
          if (!auth.isValid) {
            console.log('❌ Authentication failed:', auth.error);
            return res.status(401).json({ 
              message: auth.error, 
              code: auth.code || 'AUTH_FAILED',
              requiresLogin: true 
            });
          }
          
          console.log('✅ Authentication successful for user:', auth.user.email);
          
          // Try to get orders from database
          console.log('📊 Attempting to fetch orders from database...');
          const orders = await Order.find().sort({ createdAt: -1 }).limit(50);
          console.log('📊 Found orders count:', orders.length);
          
          // Populate product details if orders exist
          if (orders.length > 0) {
            console.log('📊 Populating product details...');
            await Order.populate(orders, { path: 'items.product', select: 'name images' });
          }
          
          console.log('✅ Orders retrieved successfully');
          return res.json(orders);
          
        } catch (error) {
          console.error('❌ Error in orders GET endpoint:', error);
          console.error('❌ Error stack:', error.stack);
          return res.status(500).json({ 
            message: 'Failed to retrieve orders', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
          });
        }
      }
      if (req.method === 'POST') {
        try {
          console.log('📝 Creating new order...');
          const { customerName, customerPhone, alternatePhone, customerAddress, items, totalAmount } = req.body;
          
          // Validate required fields
          if (!customerName || !customerPhone || !customerAddress || !items || !totalAmount) {
            return res.status(400).json({ 
              message: 'Missing required fields: customerName, customerPhone, customerAddress, items, totalAmount' 
            });
          }
          
          if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Items must be a non-empty array' });
          }
          
          const order = new Order({
            customerName,
            customerPhone,
            alternatePhone,
            customerAddress,
            items,
            totalAmount: parseFloat(totalAmount),
            status: 'pending'
          });
          
          console.log('💾 Saving order to database...');
          await order.save();
          console.log('✅ Order saved with ID:', order._id);
          
          // Populate the order with product details
          console.log('📊 Populating product details...');
          await order.populate('items.product', 'name images');
          
          console.log('✅ Order created successfully');
          return res.status(201).json(order);
          
        } catch (error) {
          console.error('❌ Error creating order:', error);
          console.error('❌ Error stack:', error.stack);
          return res.status(500).json({ 
            message: 'Failed to create order', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
          });
        }
      }
    }

    // Update order status
    if (pathname.match(/^\/api\/orders\/[^/]+\/status$/)) {
      if (req.method === 'PUT') {
        try {
          const auth = authenticateAdmin(req);
          if (!auth.isValid) {
            return res.status(401).json({ message: auth.error });
          }

          const orderId = pathname.split('/')[3];
          const { status } = req.body;

          if (!status || !['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
          }

          const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
          ).populate('items.product', 'name images');

          if (!order) {
            return res.status(404).json({ message: 'Order not found' });
          }

          return res.json(order);
        } catch (error) {
          console.error('Error updating order status:', error);
          return res.status(500).json({ message: 'Failed to update order status' });
        }
      }
    }

    // Delete order
    if (pathname.match(/^\/api\/orders\/[^/]+$/)) {
      if (req.method === 'DELETE') {
        try {
          const auth = authenticateAdmin(req);
          if (!auth.isValid) {
            return res.status(401).json({ message: auth.error });
          }

          const orderId = pathname.split('/')[3];
          const order = await Order.findByIdAndDelete(orderId);

          if (!order) {
            return res.status(404).json({ message: 'Order not found' });
          }

          return res.json({ message: 'Order deleted successfully' });
        } catch (error) {
          console.error('Error deleting order:', error);
          return res.status(500).json({ message: 'Failed to delete order' });
        }
      }
    }

    // Orders cleanup endpoint
    if (pathname === '/api/orders/cleanup') {
      if (req.method === 'DELETE') {
        // Temporarily remove auth for debugging
        console.log('🔍 Cleanup orders without auth check');
        
        try {
          // Find all orders
          const allOrders = await Order.find();
          
          let deletedCount = 0;
          const invalidOrders = [];
          
          for (const order of allOrders) {
            // Check if the order ID is invalid
            if (!mongoose.Types.ObjectId.isValid(order._id)) {
              invalidOrders.push(order._id);
              try {
                await Order.deleteOne({ _id: order._id });
                deletedCount++;
              } catch (deleteError) {
                console.error('Error deleting invalid order:', deleteError);
              }
            }
          }
          
          return res.json({ 
            message: `Cleanup completed. Deleted ${deletedCount} invalid orders.`,
            deletedCount,
            invalidOrders
          });
        } catch (error) {
          console.error('Error during cleanup:', error);
          return res.status(500).json({ message: 'Server error during cleanup' });
        }
      }
    }

    // Order by ID endpoint
    if (pathname.match(/^\/api\/orders\/[a-fA-F0-9]{24}$/)) {
      const orderId = pathname.split('/').pop();
      
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID format' });
      }
      
      if (req.method === 'GET') {
        // Temporarily remove auth for debugging
        console.log('🔍 Get order by ID without auth check');
        
        const order = await Order.findById(orderId).populate('items.product', 'name images');
        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }
        return res.json(order);
      }
      if (req.method === 'PUT') {
        // Temporarily remove auth for debugging
        console.log('🔍 Update order without auth check');
        
        const updates = req.body;
        const order = await Order.findByIdAndUpdate(orderId, updates, { new: true });
        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }
        return res.json(order);
      }
      if (req.method === 'DELETE') {
        // Temporarily remove auth for debugging
        console.log('🔍 Delete order without auth check');
        
        try {
          const order = await Order.findById(orderId);
          if (!order) {
            return res.status(404).json({ message: 'Order not found' });
          }

          await Order.findByIdAndDelete(orderId);
          return res.json({ message: 'Order deleted successfully' });
        } catch (error) {
          console.error('Error deleting order:', error);
          return res.status(500).json({ message: 'Server error', error: error.message });
        }
      }
    }

    // Order status update endpoint
    if (pathname.match(/^\/api\/orders\/[a-fA-F0-9]{24}\/status$/)) {
      const orderId = pathname.split('/')[3];
      
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID format' });
      }
      
      if (req.method === 'PUT') {
        // Temporarily remove auth for debugging
        console.log('🔍 Update order status without auth check');
        
        try {
          const { status } = req.body;
          
          const order = await Order.findById(orderId);
          if (!order) {
            return res.status(404).json({ message: 'Order not found' });
          }

          order.status = status;
          await order.save();

          return res.json(order);
        } catch (error) {
          console.error('Error updating order status:', error);
          return res.status(500).json({ message: 'Server error', error: error.message });
        }
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
      try {
        // Test database connection
        const dbTest = await mongoose.connection.db.admin().ping();
        
        return res.json({ 
          status: 'OK', 
          message: 'API is running',
          mongodb: {
            state: mongoose.connection.readyState,
            stateText: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
            name: mongoose.connection.name,
            host: mongoose.connection.host,
            ping: dbTest ? 'Success' : 'Failed'
          },
          environment: {
            nodeEnv: process.env.NODE_ENV || 'development',
            hasMongoUri: !!process.env.MONGODB_URI,
            hasJwtSecret: !!process.env.JWT_SECRET,
            mongoUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Health check error:', error);
        return res.status(500).json({
          status: 'ERROR',
          message: 'Health check failed',
          error: error.message,
          mongodb: {
            state: mongoose.connection.readyState,
            stateText: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
          },
          timestamp: new Date().toISOString()
        });
      }
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

    // Simple orders test endpoint
    if (pathname === '/api/test-orders-simple') {
      if (req.method === 'GET') {
        console.log('🧪 Simple orders test...');
        
        try {
          // Check authentication
          const auth = authenticateAdmin(req);
          if (!auth.isValid) {
            return res.status(401).json({ 
              message: auth.error, 
              code: auth.code || 'AUTH_FAILED',
              requiresLogin: true 
            });
          }
          
          // Just count orders
          const count = await Order.countDocuments();
          console.log('📊 Orders count:', count);
          
          return res.json({
            message: 'Simple orders test successful',
            ordersCount: count,
            user: auth.user.email,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('❌ Simple orders test error:', error);
          return res.status(500).json({
            message: 'Simple orders test failed',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
          });
        }
      }
    }
    
    // Auth test endpoint (no database involved)
    if (pathname === '/api/test-auth') {
      if (req.method === 'GET') {
        console.log('🧪 Auth test...');
        
        try {
          // Check authentication only
          const auth = authenticateAdmin(req);
          if (!auth.isValid) {
            return res.status(401).json({ 
              message: auth.error, 
              code: auth.code || 'AUTH_FAILED',
              requiresLogin: true 
            });
          }
          
          return res.json({
            message: 'Authentication test successful',
            user: {
              email: auth.user.email,
              name: auth.user.name,
              isAdmin: auth.user.isAdmin
            },
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('❌ Auth test error:', error);
          return res.status(500).json({
            message: 'Auth test failed',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
          });
        }
      }
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
    console.log('  - /api/orders/cleanup (DELETE)');
    console.log('  - /api/orders/:id (GET, PUT, DELETE)');
    console.log('  - /api/orders/:id/status (PUT)');
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
        'POST /api/auth/create-admin',
        'POST /api/auth/login',
        'GET /api/orders',
        'POST /api/orders',
        'DELETE /api/orders/cleanup',
        'GET /api/orders/:id',
        'PUT /api/orders/:id',
        'DELETE /api/orders/:id',
        'PUT /api/orders/:id/status',
        'GET /api/categories',
        'GET /api/categories/:slug/products',
        'GET /api/health'
      ]
    });
  } catch (error) {
    console.error('❌ API Error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Request URL:', req.url);
    console.error('❌ Request method:', req.method);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method
    });
  }
};

module.exports = handler;
