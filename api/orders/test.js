const mongoose = require('mongoose');

// Define Order Schema
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
let Order;
try {
  Order = mongoose.model('Order');
} catch {
  Order = mongoose.model('Order', OrderSchema);
}

const handler = async (req, res) => {
  console.log('🔍 Request received:', req.method);
  
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Log MongoDB connection state
    console.log('📊 MongoDB State:', mongoose.connection.readyState);
    
    if (mongoose.connection.readyState !== 1) {
      console.log('🔌 Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }

    // Simple query to test connection
    const count = await Order.countDocuments();
    
    return res.json({
      success: true,
      message: 'Connection test successful',
      ordersCount: count
    });
  } catch (error) {
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({
      success: false,
      error: error.message,
      type: error.name
    });
  }
};

module.exports = handler;