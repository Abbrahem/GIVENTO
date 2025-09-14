const mongoose = require('mongoose');

// MongoDB connection
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  
  const connection = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://abrahemelgazaly2:abrahem88@cluster0.vsqqvab.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  cachedDb = connection;
  return connection;
}

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export default async function handler(req, res) {
  await connectToDatabase();
  
  if (req.method === 'GET') {
    try {
      const categories = await Category.find({ isActive: true }).sort({ createdAt: 1 });
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const category = new Category(req.body);
      await category.save();
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      await Category.findByIdAndDelete(id);
      res.json({ message: 'Category deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
