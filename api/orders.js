import mongoose from 'mongoose';

// Define a simple order schema
const orderSchema = new mongoose.Schema({
  customerName: String,
  customerPhone: String,
  customerAddress: String,
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number
    }
  ],
  totalAmount: Number,
  status: String,
  createdAt: { type: Date, default: Date.now }
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
      const orders = await Order.find().lean().exec();
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
      const { customerName, customerPhone, customerAddress, items, totalAmount } = req.body;

      const newOrder = new Order({
        customerName,
        customerPhone,
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

  // If not GET or POST
  return res.status(405).json({ message: 'Method not allowed' });
}
