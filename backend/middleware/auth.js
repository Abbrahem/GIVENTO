const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Check for token in multiple places
    let token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('🔐 Auth middleware - token exists:', !!token);
    console.log('🔐 Auth middleware - x-auth-token:', !!req.header('x-auth-token'));
    console.log('🔐 Auth middleware - Authorization:', !!req.header('Authorization'));
    
    if (!token) {
      console.log('❌ No token found in auth middleware');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 Decoded token:', JSON.stringify(decoded, null, 2));
    
    // Handle different token formats
    if (decoded.role === 'admin') {
      // Old format with role - create a mock user object
      req.user = {
        _id: decoded.userId,
        role: decoded.role,
        username: 'admin'
      };
      console.log('✅ Using token with role format');
    } else if (decoded.userId) {
      // Try to find user in database
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        console.log('❌ User not found in database for userId:', decoded.userId);
        return res.status(401).json({ message: 'Token is not valid' });
      }
      
      req.user = user;
      console.log('✅ Found user in database');
    } else {
      console.log('❌ Invalid token format');
      return res.status(401).json({ message: 'Invalid token format' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
