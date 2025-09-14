const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// MongoDB connection
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  
  const connection = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://abrahemelgazaly2:abrahem88@cluster0.vsqqvab.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  cachedDb = connection;
  return connection;
}

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Auth handler
export default async function handler(req, res) {
  await connectToDatabase();
  
  if (req.method === 'POST') {
    const { username, password, action } = req.body;
    
    if (action === 'login' || !action) {
      try {
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
          { userId: user._id, role: user.role },
          process.env.JWT_SECRET || 'your_jwt_secret_key_here',
          { expiresIn: '7d' }
        );
        
        res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
      } catch (error) {
        res.status(500).json({ message: 'Server error' });
      }
    } else if (action === 'register') {
      try {
        const { role = 'user' } = req.body;
        
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
        }
        
        const user = new User({ username, password, role });
        await user.save();
        
        const token = jwt.sign(
          { userId: user._id, role: user.role },
          process.env.JWT_SECRET || 'your_jwt_secret_key_here',
          { expiresIn: '7d' }
        );
        
        res.status(201).json({ token, user: { id: user._id, username: user.username, role: user.role } });
      } catch (error) {
        res.status(500).json({ message: 'Server error' });
      }
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
