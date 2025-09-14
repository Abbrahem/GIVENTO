const mongoose = require('mongoose');

// MongoDB connection
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  
  const connection = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://abrahemelgazaly2:abrahem88@cluster0.vsqqvab.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  cachedDb = connection;
  return connection;
}

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  category: { type: String, required: true, enum: ['t-shirt', 'pants', 'cap', 'zip-up', 'hoodies', 'polo shirts'] },
  sizes: [{ type: String }],
  colors: [{ type: String }],
  images: [{ type: String, required: true }],
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default async function handler(req, res) {
  await connectToDatabase();
  
  if (req.method === 'GET') {
    try {
      if (req.url?.includes('/latest')) {
        const latestProduct = await Product.findOne().sort({ createdAt: -1 });
        return res.json(latestProduct);
      }
      
      const products = await Product.find({ isAvailable: true }).sort({ createdAt: -1 });
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const product = new Product(req.body);
      await product.save();
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      await Product.findByIdAndDelete(id);
      res.json({ message: 'Product deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
