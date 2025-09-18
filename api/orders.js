import mongoose from 'mongoose';

// Define enhanced order schema
const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerPhone2: { type: String }, // Second phone number
  customerAddress: { type: String, required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      productName: { type: String, required: true },
      productImage: { type: String, required: true },
      size: { type: String },
      color: { type: String },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create the model directly here to avoid import issues
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default async function handler(req, res) {
  // Connect to MongoDB
  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  if (req.method === 'GET') {
    try {
      const orders = await Order.find().sort({ createdAt: -1 }).lean().exec();
      return res.status(200).json({
        success: true,
        orders: orders
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { customerName, customerPhone, customerPhone2, customerAddress, items, totalAmount } = req.body;

      const newOrder = new Order({
        customerName,
        customerPhone,
        customerPhone2,
        customerAddress,
        items,
        totalAmount,
        status: 'pending'
      });

      await newOrder.save();

      return res.status(201).json({
        success: true,
        order: newOrder
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { orderId, status } = req.body;
      
      if (!orderId || !status) {
        return res.status(400).json({
          success: false,
          error: 'Order ID and status are required'
        });
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status, updatedAt: new Date() },
        { new: true }
      );

      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      return res.status(200).json({
        success: true,
        order: updatedOrder
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { orderId, deleteAll } = req.body;
      
      if (deleteAll === true) {
        // Delete all orders
        await Order.deleteMany({});
        return res.status(200).json({
          success: true,
          message: 'All orders deleted successfully'
        });
      } else if (orderId) {
        // Delete specific order
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        if (!deletedOrder) {
          return res.status(404).json({
            success: false,
            error: 'Order not found'
          });
        }
        return res.status(200).json({
          success: true,
          message: 'Order deleted successfully'
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Order ID or deleteAll flag required'
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // If not GET, POST, PUT, or DELETE
  return res.status(405).json({ message: 'Method not allowed' });
}
