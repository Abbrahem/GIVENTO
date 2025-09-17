import Order from '../../backend/models/Order.js';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Check MongoDB connection
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    // Connect to MongoDB if not connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }

    // Fetch orders
    const orders = await Order.find()
      .select('customerName customerPhone customerAddress items totalAmount status createdAt')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .lean();

    // Return success response
    return res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders
    });

  } catch (error) {
    // Log the error server-side
    console.error('Orders API Error:', {
      message: error.message,
      stack: error.stack,
      mongoState: mongoose.connection.readyState
    });

    // Return error response
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      mongoState: mongoose.connection.readyState
    });
  }
}