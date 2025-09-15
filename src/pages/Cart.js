import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();
  
  const shippingCost = 120;
  const subtotal = getCartTotal();
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="pt-32 min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <svg className="mx-auto w-24 h-24 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link 
              to="/products"
              className="inline-block bg-primary text-white px-8 py-3 hover:bg-red-800 transition-colors duration-200 font-semibold rounded-lg button-split-primary"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {items.map((item) => (
                <div key={item.cartId} className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6 border-b last:border-b-0 gap-4">
                  {/* Product Image */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 sm:ml-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {item.title}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Color: <span className="font-medium">{item.color}</span></p>
                      <p>Size: <span className="font-medium">{item.size}</span></p>
                      <p className="text-primary font-semibold">{item.price} EGP</p>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <button
                      onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors rounded"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors rounded"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="sm:ml-6 text-left sm:text-right w-full sm:w-auto">
                    <p className="text-lg font-semibold text-gray-800">
                      {item.price * item.quantity} EGP
                    </p>
                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="text-red-600 hover:text-red-800 text-sm mt-1 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-32">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{subtotal} EGP</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{shippingCost} EGP</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{total} EGP</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-6 bg-primary text-white py-4 px-6 font-semibold hover:bg-red-800 transition-colors duration-200 rounded-lg button-split-primary"
              >
                Proceed to Checkout
              </button>

              <Link 
                to="/products"
                className="block text-center mt-4 text-primary hover:text-red-800 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
