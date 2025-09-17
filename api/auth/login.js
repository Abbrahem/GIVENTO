const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Model
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

let User;
try {
  User = mongoose.model('User');
} catch {
  User = mongoose.model('User', UserSchema);
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

// Helper function to parse JSON body for Vercel serverless functions
const parseBody = async (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        if (body) {
          resolve(JSON.parse(body));
        } else {
          resolve({});
        }
      } catch (error) {
        console.error('Error parsing JSON body:', error);
        reject(error);
      }
    });
    req.on('error', reject);
  });
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    // Parse JSON body for POST requests
    let body = {};
    if (req.headers['content-type']?.includes('application/json')) {
      try {
        body = await parseBody(req);
        console.log('📦 Parsed request body:', body);
      } catch (error) {
        console.error('❌ Failed to parse request body:', error);
        return res.status(400).json({ message: 'Invalid JSON in request body' });
      }
    }
    
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      console.error('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    console.log('🔍 Login attempt for email:', email);

    // Check if user exists
    let user = await User.findOne({ email });
    
    // Auto-create admin user if it doesn't exist and trying to login with admin credentials
    if (!user && email === 'admin@givento.com' && password === 'admin123') {
      console.log('🔧 Auto-creating admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      user = new User({
        name: 'Admin',
        email: 'admin@givento.com',
        password: hashedPassword,
        isAdmin: true
      });
      
      await user.save();
      console.log('✅ Admin user auto-created successfully');
    }
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Password mismatch for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('🔐 Creating JWT token for user:', user.email);
    console.log('🔒 User isAdmin:', user.isAdmin);
    console.log('🔑 JWT_SECRET available:', !!process.env.JWT_SECRET);
    
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not set in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      }
    };
    
    console.log('📦 JWT Payload:', payload);

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) {
          console.error('❌ JWT signing error:', err);
          return res.status(500).json({ message: 'Failed to create token' });
        }
        
        console.log('✅ JWT token created successfully');
        console.log('🎫 Token length:', token.length);
        
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
          }
        });
      }
    );
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}
