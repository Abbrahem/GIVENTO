import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';

const Checkout = () => {
  const { items, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    alternatePhone: ''
  });

  const shippingCost = 120;
  const subtotal = getCartTotal();
  const total = subtotal + shippingCost;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create order object
      const orderData = {
        customerName: formData.name,
        customerPhone: formData.phone,
        alternatePhone: formData.alternatePhone || '',
        customerAddress: formData.address,
        items: items.map(item => ({
          product: item.id,
          productName: item.title,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: item.price,
          image: item.image
        })),
        totalAmount: total
      };

      // Send order to backend
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        // Show success alert
        await Swal.fire({
          title: 'Order Placed Successfully!',
          text: 'Thank you for your order. We will contact you soon to confirm the details.',
          icon: 'success',
          confirmButtonText: 'Continue Shopping',
          confirmButtonColor: '#b71c1c'
        });

        // Clear cart and redirect
        clearCart();
        navigate('/products');
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to place order. Please try again.',
        icon: 'error',
        confirmButtonColor: '#b71c1c'
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-32 min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">No Items to Checkout</h2>
            <p className="text-gray-600 mb-8">Your cart is empty. Add some products first.</p>
            <button 
              onClick={() => navigate('/products')}
              className="bg-primary text-white px-8 py-3 hover:bg-red-800 transition-colors duration-200 font-semibold rounded-lg"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

        {/* Order Summary - First Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
          
          {/* Order Items */}
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.cartId} className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 pb-4 border-b last:border-b-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-600">
                    {item.color} • {item.size} • Qty: {item.quantity}
                  </p>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <p className="font-semibold text-gray-800">
                    {item.price * item.quantity} EGP
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Totals */}
          <div className="space-y-3 border-t pt-4 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{subtotal} EGP</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">{shippingCost} EGP</span>
            </div>
            
            <div className="flex justify-between text-lg font-semibold border-t pt-3">
              <span>Total</span>
              <span className="text-primary">{total} EGP</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Payment Method</h3>
              <p className="text-sm text-gray-600">
                Cash on Delivery (COD) - Pay when you receive your order
              </p>
            </div>

            {/* Delivery Info */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Delivery Information</h3>
              <p className="text-sm text-gray-600">
                Expected delivery: 2-3 business days
              </p>
            </div>
          </div>
        </div>

        {/* Shipping Information Form - Second Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Shipping Information</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address *
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors resize-vertical"
                placeholder="Enter your complete delivery address"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label htmlFor="alternatePhone" className="block text-sm font-medium text-gray-700 mb-2">
                Alternate Phone Number
              </label>
              <input
                type="tel"
                id="alternatePhone"
                name="alternatePhone"
                value={formData.alternatePhone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
                placeholder="Enter alternate phone number (optional)"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-4 px-6 font-semibold hover:bg-red-800 transition-colors duration-200 text-lg rounded-lg"
            >
              Send Order
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
