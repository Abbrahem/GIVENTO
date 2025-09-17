import Order from '../../backend/models/Order.js';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  try {
    // Connect to MongoDB if not connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // GET orders - only show orders, no updates
    if (req.method === 'GET') {
      const orders = await Order.find()
        .select('customerName customerPhone customerAddress items totalAmount status createdAt')
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        count: orders.length,
        orders: orders
      });
    }

    // For any other HTTP method, return 405 Method Not Allowed
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('Orders API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}