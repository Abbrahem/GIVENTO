const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

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

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

const handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verify auth token
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.user?.isAdmin) {
      return res.status(401).json({ message: 'Admin access required' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  try {
    // Connect to MongoDB if not connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }

    // GET orders
    if (req.method === 'GET') {
      const orders = await Order.find()
        .select('customerName customerPhone customerAddress items totalAmount status createdAt')
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 })
        .lean();

      return res.json({
        success: true,
        count: orders.length,
        orders: orders
      });
    }

    // POST order
    if (req.method === 'POST') {
      const { customerName, customerPhone, customerAddress, items, totalAmount } = req.body;

      if (!customerName || !customerPhone || !customerAddress || !items || !totalAmount) {
        return res.status(400).json({ message: 'Missing required fields' });
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

      return res.status(201).json(order);
    }

    // PUT order status
    if (req.method === 'PUT') {
      const orderId = req.url.split('/')[3];
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
    }

    return res.status(404).json({ message: 'Endpoint not found' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = handler;