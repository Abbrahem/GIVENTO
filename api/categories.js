const mongoose = require('mongoose');

// Product Model (for category operations)
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
    console.log('Categories API called:', req.method, req.url);

    // Handle different URL patterns
    const url = req.url || '';
    const pathParts = url.split('/').filter(Boolean);
    
    // GET /api/categories - Get all categories
    if (req.method === 'GET' && pathParts.length === 0) {
      const categories = await Product.distinct('category');
      const categoryList = categories.map(cat => ({ 
        name: cat, 
        slug: cat.toLowerCase().replace(/\s+/g, '-') 
      }));
      console.log(`Found ${categoryList.length} categories`);
      return res.json(categoryList);
    }

    // GET /api/categories/:slug/products - Get products by category
    if (req.method === 'GET' && pathParts.length === 2 && pathParts[1] === 'products') {
      const categorySlug = pathParts[0];
      const categoryName = categorySlug.replace(/-/g, ' ');
      
      const products = await Product.find({ 
        category: new RegExp(categoryName, 'i') 
      }).sort({ createdAt: -1 });
      
      console.log(`Found ${products.length} products in category: ${categoryName}`);
      return res.json(products);
    }

    return res.status(404).json({ message: 'Route not found' });
  } catch (error) {
    console.error('Categories API Error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
