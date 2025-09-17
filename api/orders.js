const mongoose = require('mongoose');
const Order = require('./models/Order');
const jwt = require('jsonwebtoken');

// Database connection with error handling
const connectDB = async () => {
  try {
    console.log('🔍 Current MongoDB state:', mongoose.connection.readyState);
    console.log('🔑 MONGODB_URI exists:', !!process.env.MONGODB_URI);
    if (process.env.MONGODB_URI) {
      console.log('🔑 MONGODB_URI length:', process.env.MONGODB_URI.length);
      console.log('🔑 MONGODB_URI preview:', process.env.MONGODB_URI.substring(0, 20) + '...');
    }

    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB already connected');
      return;
    }

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Connection details:', {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    });
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('❌ Full error:', error);
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

// Authentication middleware
const authenticateAdmin = (req) => {
  try {
    console.log('🔐 Authenticating admin...');
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isValid: false, error: 'No token provided' };
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.user || !decoded.user.isAdmin) {
      return { isValid: false, error: 'Admin access required' };
    }
    
    return { isValid: true, user: decoded.user };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { isValid: false, error: 'Token expired', code: 'TOKEN_EXPIRED' };
    } else if (error.name === 'JsonWebTokenError') {
      return { isValid: false, error: 'Invalid token', code: 'INVALID_TOKEN' };
    }
    return { isValid: false, error: 'Token verification failed', code: 'TOKEN_ERROR' };
  }
};

// Parse request body
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
        reject(error);
      }
    });
    req.on('error', reject);
  });
};

// Main handler
const handler = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Connect to database
    await connectDB();
    
    // Get path from URL
    const path = req.url;
    console.log('🔍 Request path:', path);

    // Parse body for POST/PUT requests
    if ((req.method === 'POST' || req.method === 'PUT') && req.headers['content-type']?.includes('application/json')) {
      try {
        req.body = await parseBody(req);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid JSON in request body' });
      }
    }

    // Match routes
    const statusMatch = path.match(/^\/api\/orders\/([^/]+)\/status$/);
    const deleteMatch = path.match(/^\/api\/orders\/([^/]+)$/);
    const isCleanup = path === '/api/orders/cleanup';

    // Get orders list
    if (path === '/api/orders' && req.method === 'GET') {
      console.log('🔍 Starting GET /api/orders...');
      const auth = authenticateAdmin(req);
      if (!auth.isValid) {
        return res.status(401).json({ message: auth.error });
      }

      console.log('📋 Fetching orders...');
      const orders = await Order.find()
        .select('customerName customerPhone customerAddress items totalAmount status createdAt')
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 })
        .lean();

      console.log(`✅ Found ${orders.length} orders`);
      return res.json({
        success: true,
        count: orders.length,
        orders: orders
      });
    }

    // Create new order
    if (path === '/api/orders' && req.method === 'POST') {
      console.log('📝 Creating new order...');
      const { customerName, customerPhone, customerAddress, items, totalAmount } = req.body;

      if (!customerName || !customerPhone || !customerAddress || !items || !totalAmount) {
        return res.status(400).json({ 
          message: 'Missing required fields' 
        });
      }

      const order = new Order({
        customerName,
        customerPhone,
        customerAddress,
        items,
        totalAmount,
        status: 'pending'
      });

      await order.save();
      await order.populate('items.product', 'name images');
      console.log('✅ Order created successfully');
      return res.status(201).json(order);
    }

    // Update order status
    if (statusMatch && req.method === 'PUT') {
      const auth = authenticateAdmin(req);
      if (!auth.isValid) {
        return res.status(401).json({ message: auth.error });
      }

      const orderId = statusMatch[1];
      const { status } = req.body;

      if (!status || !['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }

      console.log(`📝 Updating order ${orderId} status to ${status}...`);
      const order = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      ).populate('items.product', 'name images');

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      console.log('✅ Order status updated successfully');
      return res.json(order);
    }

    // Delete order
    if (deleteMatch && req.method === 'DELETE') {
      const auth = authenticateAdmin(req);
      if (!auth.isValid) {
        return res.status(401).json({ message: auth.error });
      }

      const orderId = deleteMatch[1];
      console.log(`🗑️ Deleting order ${orderId}...`);
      const order = await Order.findByIdAndDelete(orderId);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      console.log('✅ Order deleted successfully');
      return res.json({ message: 'Order deleted successfully' });
    }

    // Cleanup invalid orders
    if (isCleanup && req.method === 'DELETE') {
      const auth = authenticateAdmin(req);
      if (!auth.isValid) {
        return res.status(401).json({ message: auth.error });
      }

      console.log('🧹 Starting orders cleanup...');
      const orders = await Order.find();
      let deletedCount = 0;

      for (const order of orders) {
        if (!mongoose.Types.ObjectId.isValid(order._id.toString())) {
          await Order.findByIdAndDelete(order._id);
          deletedCount++;
        }
      }

      console.log(`✅ Cleanup completed. Deleted ${deletedCount} orders`);
      return res.json({ 
        message: 'Cleanup completed', 
        deletedCount 
      });
    }

    return res.status(404).json({ message: 'Endpoint not found' });
  } catch (error) {
    console.error('❌ Error handling request:', error.message);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error stack:', error.stack);
    
    if (error.message.includes('MONGODB_URI')) {
      return res.status(500).json({
        message: 'Database configuration error',
        error: 'Missing or invalid database connection string'
      });
    }

    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      return res.status(500).json({
        message: 'Database operation failed',
        error: error.message
      });
    }

    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message,
      type: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = handler;