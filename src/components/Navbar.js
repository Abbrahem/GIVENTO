import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { getCartItemsCount } = useCart();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const marqueeMessages = [
    "Welcome to Givento",
    "SIGN UP FOR 50ٍ% OFF YOUR FIRST PURCHASE",
    "SHOP THE SUMMER COLLECTION"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => 
        (prevIndex + 1) % marqueeMessages.length
      );
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(interval);
  }, [marqueeMessages.length]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      {/* Message Slider */}
      <div className="py-4 border-b border-gray-200" style={{backgroundColor: '#f0ffde', color: '#dc2626'}}>
        <div className="text-center text-sm font-medium leading-relaxed transition-all duration-500">
          {marqueeMessages[currentMessageIndex]}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-primary px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">
          {/* Left Side - Logo */}
          <Link to="/" className="flex items-center">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <img src="/logo.jpg" alt="GIVENTO Logo" className="w-full h-full object-cover" />
            </div>
          </Link>

          {/* Center - Website Name */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-xl font-bold text-white m-0 p-0 font-cairo">GIVENTO</h1>
          </div>

          {/* Right Side - Cart Only */}
          <Link to="/cart" className="relative p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            {getCartItemsCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-primary text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getCartItemsCount()}
              </span>
            )}
          </Link>

        </div>

      </div>

      {/* Announcement Bar */}
      <div className="bg-white py-1 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <h5 className="text-center text-xs font-medium text-primary">
            Not Just Fabric It's GIVENTO
          </h5>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
