const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('./models/Product'); // Import Product model

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

// Register Order model
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

// Database connection
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Authentication middleware
const authenticateAdmin = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return { isValid: false, error: 'No token provided' };
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.user?.isAdmin) {
      return { isValid: false, error: 'Admin access required' };
    }

    return { isValid: true, user: decoded.user };
  } catch (error) {
    return { isValid: false, error: 'Invalid token' };
  }
};

// Main handler for all order routes
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
    
    // Get order ID from URL if present
    const orderId = req.url.split('/orders/')[1]?.split('/')[0];
    const isStatusUpdate = req.url.endsWith('/status');

    // LIST ALL ORDERS
    if (req.method === 'GET' && !orderId) {
      const auth = authenticateAdmin(req);
      if (!auth.isValid) {
        return res.status(401).json({ message: auth.error });
      }

      const orders = await Order.find()
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 });

      return res.json(orders);
    }

    // GET SINGLE ORDER
    if (req.method === 'GET' && orderId) {
      const auth = authenticateAdmin(req);
      if (!auth.isValid) {
        return res.status(401).json({ message: auth.error });
      }

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID' });
      }

      const order = await Order.findById(orderId)
        .populate('items.product', 'name images');

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      return res.json(order);
    }

    // CREATE ORDER
    if (req.method === 'POST' && !orderId) {
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
      await order.populate('items.product', 'name images');

      return res.status(201).json(order);
    }

    // UPDATE ORDER STATUS
    if (req.method === 'PUT' && isStatusUpdate) {
      const auth = authenticateAdmin(req);
      if (!auth.isValid) {
        return res.status(401).json({ message: auth.error });
      }

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID' });
      }

      const { status } = req.body;
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      order.status = status;
      await order.save();

      return res.json(order);
    }

    // DELETE ORDER
    if (req.method === 'DELETE' && orderId) {
      const auth = authenticateAdmin(req);
      if (!auth.isValid) {
        return res.status(401).json({ message: auth.error });
      }

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID' });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      await Order.findByIdAndDelete(orderId);
      return res.json({ message: 'Order deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      type: error.name
    });
  }
};

module.exports = handler;