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
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isValid: false, error: 'No token provided' };
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const jwt = require('jsonwebtoken');
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
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    if (req.method === 'DELETE') {
      // Cleanup invalid orders - Admin only
      const auth = authenticateAdmin(req);
      if (!auth.isValid) {
        return res.status(401).json({ message: auth.error });
      }
      
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
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = handler;
