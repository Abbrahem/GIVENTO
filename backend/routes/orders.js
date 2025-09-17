const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    
    // Filter out orders with invalid IDs
    const validOrders = orders.filter(order => {
      return mongoose.Types.ObjectId.isValid(order._id);
    });
    
    res.json(validOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private (Admin only)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
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
    const { customerName, customerPhone, customerAddress, items, totalAmount } = req.body;
    
    const order = new Order({
      customerName,
      customerPhone,
      customerAddress,
      items,
      totalAmount
    });

    await order.save();
    
    // Populate the order with product details
    await order.populate('items.product', 'name images');
    
    res.status(201).json(order);
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
    const { status } = req.body;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/orders/cleanup
// @desc    Clean up invalid orders from database
// @access  Private (Admin only)
router.delete('/cleanup', auth, async (req, res) => {
  try {
    // Find all orders
    const allOrders = await Order.find();
    
    let deletedCount = 0;
    const invalidOrders = [];
    
    for (const order of allOrders) {
      // Check if the order ID is invalid
      if (!mongoose.Types.ObjectId.isValid(order._id)) {
        invalidOrders.push(order._id);
        try {
          await Order.deleteOne({ _id: order._id });
          deletedCount++;
        } catch (deleteError) {
          console.error('Error deleting invalid order:', deleteError);
        }
      }
    }
    
    res.json({ 
      message: `Cleanup completed. Deleted ${deletedCount} invalid orders.`,
      deletedCount,
      invalidOrders
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ message: 'Server error during cleanup' });
  }
});

module.exports = router;
