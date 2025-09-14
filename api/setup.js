const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  
  const connection = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://abrahemelgazaly2:abrahem88@cluster0.vsqqvab.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  cachedDb = connection;
  return connection;
}

// Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    // Create admin user
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const admin = new User({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
    }

    // Create categories
    const categories = [
      { name: 'T-Shirts', slug: 't-shirt', image: '/api/placeholder/300/200', description: 'Comfortable cotton t-shirts' },
      { name: 'Pants', slug: 'pants', image: '/api/placeholder/300/200', description: 'Stylish pants for all occasions' },
      { name: 'Caps', slug: 'cap', image: '/api/placeholder/300/200', description: 'Trendy caps and hats' },
      { name: 'Zip-up Jackets', slug: 'zip-up', image: '/api/placeholder/300/200', description: 'Warm zip-up jackets' },
      { name: 'Hoodies', slug: 'hoodies', image: '/api/placeholder/300/200', description: 'Cozy hoodies for casual wear' },
      { name: 'Polo Shirts', slug: 'polo shirts', image: '/api/placeholder/300/200', description: 'Classic polo shirts' }
    ];

    for (const categoryData of categories) {
      const exists = await Category.findOne({ slug: categoryData.slug });
      if (!exists) {
        const category = new Category(categoryData);
        await category.save();
      }
    }

    res.json({ message: 'Database setup completed successfully' });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ message: 'Setup failed', error: error.message });
  }
}
