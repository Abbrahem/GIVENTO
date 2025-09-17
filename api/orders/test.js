const mongoose = require('mongoose');

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
    const count = await mongoose.model('Order').countDocuments();
    
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