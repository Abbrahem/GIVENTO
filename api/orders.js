const express = require('express');
const Order = require('./models/Order');
const auth = require('./middleware/auth');

const router = express.Router();
const connectDB = require('./utils/db');

// @route   GET /api/orders
// @desc    Get all orders (Admin only)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    await connectDB();
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Public
router.post('/', async (req, res) => {
  try {
    await connectDB();
    
    const { customerInfo, items, totalAmount, shippingAddress } = req.body;
    
    const order = new Order({
      customerInfo,
      items,
      totalAmount: parseFloat(totalAmount),
      shippingAddress,
      status: 'pending'
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    await connectDB();
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Admin only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    await connectDB();
    
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
