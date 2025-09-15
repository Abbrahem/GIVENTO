const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Models
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

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    price: Number,
    quantity: Number,
    size: String,
    color: String
  }],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

let Product, User, Order;
try {
  Product = mongoose.model('Product');
  User = mongoose.model('User');
  Order = mongoose.model('Order');
} catch {
  Product = mongoose.model('Product', ProductSchema);
  User = mongoose.model('User', UserSchema);
  Order = mongoose.model('Order', OrderSchema);
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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();
    const { url } = req;

    // Products endpoints
    if (url === '/api/products') {
      if (req.method === 'GET') {
        const products = await Product.find().sort({ createdAt: -1 });
        return res.json(products);
      }
      if (req.method === 'POST') {
        const { name, description, originalPrice, salePrice, category, sizes, colors, images } = req.body;
        const product = new Product({
          name, description, originalPrice: parseFloat(originalPrice),
          salePrice: parseFloat(salePrice), category, sizes: sizes || [],
          colors: colors || [], images: images || []
        });
        await product.save();
        return res.status(201).json(product);
      }
    }

    if (url === '/api/products/latest') {
      if (req.method === 'GET') {
        const latestProduct = await Product.findOne().sort({ createdAt: -1 });
        return res.json(latestProduct);
      }
    }

    // Auth endpoints
    if (url === '/api/auth/login') {
      if (req.method === 'POST') {
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }
        const payload = { user: { id: user.id, isAdmin: user.isAdmin } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin }
          });
        });
        return;
      }
    }

    // Orders endpoints
    if (url === '/api/orders') {
      if (req.method === 'GET') {
        const orders = await Order.find().sort({ createdAt: -1 });
        return res.json(orders);
      }
      if (req.method === 'POST') {
        const { customerInfo, items, totalAmount, shippingAddress } = req.body;
        const order = new Order({
          customerInfo, items, totalAmount: parseFloat(totalAmount),
          shippingAddress, status: 'pending'
        });
        await order.save();
        return res.status(201).json(order);
      }
    }

    // Health check
    if (url === '/api/health') {
      return res.json({ status: 'OK', message: 'API is running' });
    }

    return res.status(404).json({ message: 'Route not found' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}
