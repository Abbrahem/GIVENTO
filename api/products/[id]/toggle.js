const mongoose = require('mongoose');

// Product Model
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  category: { type: String, required: true },
  sizes: [{ type: String }],
  colors: [{ type: String }],
  images: [{ type: String, required: true }],
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

let Product;
try {
  Product = mongoose.model('Product');
} catch {
  Product = mongoose.model('Product', ProductSchema);
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

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed. Use PUT.' });
  }

  try {
    await connectDB();
    
    const { id } = req.query;
    console.log('🔄 Toggle product ID from query:', id);
    console.log('🔍 Request method:', req.method);

    if (!id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ Invalid product ID format for toggle:', id);
      return res.status(400).json({ 
        message: 'Invalid product ID format for toggle',
        receivedId: id
      });
    }

    // Find and toggle product
    const product = await Product.findById(id);
    
    if (!product) {
      console.log('❌ Product not found for toggle:', id);
      return res.status(404).json({ 
        message: 'Product not found for toggle',
        requestedId: id
      });
    }
    
    const oldStatus = product.isAvailable;
    product.isAvailable = !product.isAvailable;
    await product.save();
    
    console.log(`✅ Product ${id} toggled from ${oldStatus} to ${product.isAvailable}`);
    return res.json({
      ...product.toObject(),
      message: `Product availability changed from ${oldStatus} to ${product.isAvailable}`
    });

  } catch (error) {
    console.error('❌ Toggle API Error:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.message
    });
  }
};
