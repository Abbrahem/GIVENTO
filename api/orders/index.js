const mongoose = require('mongoose');

// Order Schema
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

let Order;
try {
  Order = mongoose.model('Order');
} catch {
  Order = mongoose.model('Order', OrderSchema);
}

// Database connection
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }
  
  try {
    console.log('Attempting MongoDB connection...');
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined!');
      throw new Error('MongoDB connection string is missing');
    }
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
  console.log('🔐 Authentication check started');
  console.log('🔍 Headers:', req.headers);
  console.log('🔍 JWT_SECRET exists:', !!process.env.JWT_SECRET);
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No valid authorization header');
    return { isValid: false, error: 'No token provided' };
  }
  
  const token = authHeader.split(' ')[1];
  console.log('🎫 Token received:', token ? 'Token exists' : 'No token');
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', decoded);
    
    if (!decoded.user || !decoded.user.isAdmin) {
      console.log('❌ User is not admin:', decoded.user);
      return { isValid: false, error: 'Admin access required' };
    }
    
    console.log('✅ Admin authentication successful');
    return { isValid: true, user: decoded.user };
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    return { isValid: false, error: 'Invalid token' };
  }
};

const handler = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      // Get all orders - Admin only
      const auth = authenticateAdmin(req);
      if (!auth.isValid) {
        return res.status(401).json({ message: auth.error });
      }
      
      const orders = await Order.find()
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 });
      
      // Filter out orders with invalid IDs
      const validOrders = orders.filter(order => {
        return mongoose.Types.ObjectId.isValid(order._id);
      });
      
      return res.json(validOrders);
    }

    if (req.method === 'POST') {
      // Create new order
      const { customerName, customerPhone, alternatePhone, customerAddress, items, totalAmount } = req.body;
      
      const order = new Order({
        customerName,
        customerPhone,
        alternatePhone,
        customerAddress,
        items,
        totalAmount: parseFloat(totalAmount),
        status: 'pending'
      });
      
      await order.save();
      
      // Populate the order with product details
      await order.populate('items.product', 'name images');
      
      return res.status(201).json(order);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      type: error.name
    });
  }
};

module.exports = handler;
