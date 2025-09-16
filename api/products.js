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
    console.log('Products API called:', req.method, req.url);

    // Handle different URL patterns for Vercel serverless
    const url = req.url || '';
    console.log('Full URL received:', url);
    
    // Remove query parameters and clean the URL
    const cleanUrl = url.split('?')[0];
    // Remove /api/products prefix for serverless routing - handle multiple patterns
    let apiPath = cleanUrl;
    if (apiPath.startsWith('/api/products/')) {
      apiPath = apiPath.replace('/api/products/', '');
    } else if (apiPath.startsWith('/api/products')) {
      apiPath = apiPath.replace('/api/products', '');
    } else if (apiPath.startsWith('/products/')) {
      apiPath = apiPath.replace('/products/', '');
    } else if (apiPath.startsWith('/products')) {
      apiPath = apiPath.replace('/products', '');
    }
    
    // Clean leading slash
    if (apiPath.startsWith('/')) {
      apiPath = apiPath.substring(1);
    }
    
    const pathParts = apiPath.split('/').filter(Boolean);
    console.log('Path parts after cleaning:', pathParts);
    console.log('API Path:', apiPath);
    
    // GET /api/products - Get all products
    if (req.method === 'GET' && pathParts.length === 0) {
      const products = await Product.find().sort({ createdAt: -1 });
      console.log(`Found ${products.length} products`);
      
      // Ensure we always return an array
      if (!Array.isArray(products)) {
        return res.json([]);
      }
      
      return res.json(products);
    }

    // GET /api/products/latest - Get latest product
    if (req.method === 'GET' && pathParts[0] === 'latest') {
      const latestProduct = await Product.findOne().sort({ createdAt: -1 });
      return res.json(latestProduct);
    }

    // GET /api/products/:id - Get product by ID
    if (req.method === 'GET' && pathParts.length === 1 && pathParts[0] !== 'latest') {
      const productId = pathParts[0];
      console.log('Trying to get product with ID:', productId);
      console.log('Full URL path parts:', pathParts);
      
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        console.log('Invalid product ID format:', productId);
        // Let's also show what products exist for debugging
        const allProducts = await Product.find({}, '_id name').limit(5);
        return res.status(400).json({ 
          message: 'Invalid product ID format',
          receivedId: productId,
          validFormat: 'Must be a valid MongoDB ObjectId (24 hex characters)',
          existingProducts: allProducts.map(p => ({ id: p._id.toString(), name: p.name }))
        });
      }
      
      const product = await Product.findById(productId);
      if (!product) {
        console.log('Product not found in database:', productId);
        // Let's also check what products exist for debugging
        const allProducts = await Product.find({}, '_id name').limit(5);
        const totalProducts = await Product.countDocuments();
        return res.status(404).json({ 
          message: 'Product not found',
          requestedId: productId,
          totalProductsInDB: totalProducts,
          existingProducts: allProducts.map(p => ({ id: p._id.toString(), name: p.name }))
        });
      }
      
      console.log('Product found successfully:', product.name);
      return res.json(product);
    }

    // PUT /api/products/:id/toggle - Toggle product availability
    if (req.method === 'PUT' && pathParts.length === 2 && pathParts[1] === 'toggle') {
      const productId = pathParts[0];
      console.log('Trying to toggle product:', productId);
      
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        console.log('Invalid product ID for toggle:', productId);
        return res.status(400).json({ 
          message: 'Invalid product ID format for toggle',
          receivedId: productId
        });
      }
      
      const product = await Product.findById(productId);
      if (!product) {
        console.log('Product not found for toggle:', productId);
        return res.status(404).json({ 
          message: 'Product not found for toggle',
          requestedId: productId
        });
      }
      
      const oldStatus = product.isAvailable;
      product.isAvailable = !product.isAvailable;
      await product.save();
      
      console.log(`Product ${productId} toggled from ${oldStatus} to ${product.isAvailable}`);
      return res.json({
        ...product.toObject(),
        message: `Product availability changed from ${oldStatus} to ${product.isAvailable}`
      });
    }

    // PUT /api/products/:id - Update product
    if (req.method === 'PUT' && pathParts.length === 1) {
      const productId = pathParts[0];
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid product ID' });
      }
      
      const updates = req.body;
      const product = await Product.findByIdAndUpdate(productId, updates, { new: true });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      return res.json(product);
    }

    // DELETE /api/products/:id - Delete product
    if (req.method === 'DELETE' && pathParts.length === 1) {
      const productId = pathParts[0];
      console.log('Trying to delete product:', productId);
      
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        console.log('Invalid product ID for delete:', productId);
        return res.status(400).json({ 
          message: 'Invalid product ID format for delete',
          receivedId: productId
        });
      }
      
      const product = await Product.findByIdAndDelete(productId);
      if (!product) {
        console.log('Product not found for delete:', productId);
        return res.status(404).json({ 
          message: 'Product not found for delete',
          requestedId: productId
        });
      }
      
      console.log('Product deleted successfully:', product.name);
      return res.json({ 
        message: 'Product deleted successfully',
        deletedProduct: {
          id: product._id,
          name: product.name
        }
      });
    }

    // POST /api/products - Create new product
    if (req.method === 'POST' && pathParts.length === 0) {
      const { name, description, originalPrice, salePrice, category, sizes, colors, images } = req.body;
      
      console.log('Creating product with data:', { name, category, images: images?.length });
      
      if (!images || images.length === 0) {
        return res.status(400).json({ message: 'At least one image is required' });
      }

      const product = new Product({
        name,
        description,
        originalPrice: parseFloat(originalPrice),
        salePrice: parseFloat(salePrice),
        category,
        sizes: sizes || [],
        colors: colors || [],
        images: images || []
      });

      await product.save();
      console.log('Product created successfully:', product._id);
      return res.status(201).json(product);
    }

    // GET /api/products/debug - Debug endpoint to see all product IDs
    if (req.method === 'GET' && pathParts[0] === 'debug') {
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

    console.log('No matching route found for:', req.method, apiPath, pathParts);
    return res.status(404).json({ 
      message: 'Route not found',
      method: req.method,
      path: apiPath,
      pathParts: pathParts,
      availableRoutes: [
        'GET /api/products',
        'GET /api/products/latest',
        'GET /api/products/debug',
        'GET /api/products/:id',
        'POST /api/products',
        'PUT /api/products/:id',
        'PUT /api/products/:id/toggle',
        'DELETE /api/products/:id'
      ]
    });
  } catch (error) {
    console.error('Products API Error:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
