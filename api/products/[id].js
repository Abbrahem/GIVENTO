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

  try {
    await connectDB();
    
    const { id } = req.query;
    console.log('🆔 Product ID from query:', id);
    console.log('🔍 Request method:', req.method);
    console.log('🔍 Full URL:', req.url);

    if (!id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Handle special cases
    if (id === 'latest') {
      if (req.method === 'GET') {
        const latestProduct = await Product.findOne().sort({ createdAt: -1 });
        return res.json(latestProduct);
      }
    }

    if (id === 'debug') {
      if (req.method === 'GET') {
        const products = await Product.find({}, '_id name isAvailable createdAt').sort({ createdAt: -1 });
        return res.json({
          message: 'Debug info for products',
          totalProducts: products.length,
          products: products.map(p => ({
            id: p._id.toString(),
            name: p.name,
            isAvailable: p.isAvailable,
            createdAt: p.createdAt
          }))
        });
      }
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ Invalid product ID format:', id);
      const allProducts = await Product.find({}, '_id name').limit(5);
      return res.status(400).json({ 
        message: 'Invalid product ID format',
        receivedId: id,
        validFormat: 'Must be a valid MongoDB ObjectId (24 hex characters)',
        existingProducts: allProducts.map(p => ({ id: p._id.toString(), name: p.name }))
      });
    }

    // GET /api/products/[id] - Get product by ID
    if (req.method === 'GET') {
      console.log('🔍 Looking for product with ID:', id);
      const product = await Product.findById(id);
      
      if (!product) {
        console.log('❌ Product not found in database:', id);
        const allProducts = await Product.find({}, '_id name').limit(5);
        const totalProducts = await Product.countDocuments();
        return res.status(404).json({ 
          message: 'Product not found',
          requestedId: id,
          totalProductsInDB: totalProducts,
          existingProducts: allProducts.map(p => ({ id: p._id.toString(), name: p.name }))
        });
      }
      
      console.log('✅ Product found successfully:', product.name);
      return res.json(product);
    }

    // PUT /api/products/[id] - Update product
    if (req.method === 'PUT') {
      const updates = req.body;
      const product = await Product.findByIdAndUpdate(id, updates, { new: true });
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      return res.json(product);
    }

    // DELETE /api/products/[id] - Delete product
    if (req.method === 'DELETE') {
      console.log('🗑️ Trying to delete product:', id);
      const product = await Product.findByIdAndDelete(id);
      
      if (!product) {
        console.log('❌ Product not found for delete:', id);
        return res.status(404).json({ 
          message: 'Product not found for delete',
          requestedId: id
        });
      }
      
      console.log('✅ Product deleted successfully:', product.name);
      return res.json({ 
        message: 'Product deleted successfully',
        deletedProduct: {
          id: product._id,
          name: product.name
        }
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('❌ Product API Error:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
