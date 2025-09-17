import Order from '../../backend/models/Order.js';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  console.log('🚀 Orders API called');
  
  try {
    console.log('🔌 MongoDB State:', mongoose.connection.readyState);
    
    if (mongoose.connection.readyState !== 1) {
      console.log('📡 Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB Connected');
    }

    console.log('📦 Fetching orders...');
    const orders = await Order.find().lean();
    console.log(`✨ Found ${orders.length} orders`);

    return res.status(200).json({ success: true, orders });

  } catch (error) {
    console.error('❌ Error in orders API:', error);
    console.error('Stack:', error.stack);
    
    return res.status(500).json({ 
      success: false,
      message: error.message,
      type: error.name,
      mongoState: mongoose.connection.readyState
    });
  }
}