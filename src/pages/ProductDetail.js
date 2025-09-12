import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const product = products.find(p => p.id === parseInt(id));
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity] = useState(1);

  // Set default selections
  useEffect(() => {
    if (product && product.colors.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0]);
    }
    if (product && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product, selectedColor, selectedSize]);

  if (!product) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <button 
            onClick={() => navigate('/products')}
            className="bg-primary text-white px-6 py-3 hover:bg-red-800 transition-colors rounded-lg"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Selection',
        text: 'Please select color and size',
        confirmButtonColor: '#dc2626'
      });
      return;
    }
    addToCart(product, selectedColor, selectedSize, quantity);
    Swal.fire({
      icon: 'success',
      title: 'Added to Cart!',
      text: 'Product has been added to your cart',
      confirmButtonColor: '#dc2626',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleBuyNow = () => {
    if (!selectedColor || !selectedSize) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Selection',
        text: 'Please select color and size',
        confirmButtonColor: '#dc2626'
      });
      return;
    }
    addToCart(product, selectedColor, selectedSize, quantity);
    navigate('/checkout');
  };

  return (
    <div className="pt-32 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <button onClick={() => navigate('/')} className="hover:text-primary">
                Home
              </button>
            </li>
            <li>/</li>
            <li>
              <button onClick={() => navigate('/products')} className="hover:text-primary">
                Products
              </button>
            </li>
            <li>/</li>
            <li className="text-gray-800">{product.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden bg-gray-100">
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-primary' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {product.title}
              </h1>
              
              {/* Price */}
              <div className="flex items-center space-x-3 mb-6">
                {product.oldPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {product.oldPrice} EGP
                  </span>
                )}
                <span className="text-3xl font-bold text-primary">
                  {product.price} EGP
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-8">
                {product.description}
              </p>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <label key={color} className="cursor-pointer">
                    <input
                      type="radio"
                      name="color"
                      value={color}
                      checked={selectedColor === color}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="sr-only"
                    />
                    <span className={`inline-block px-4 py-2 border-2 rounded-lg transition-colors shadow-sm ${
                      selectedColor === color 
                        ? 'border-primary bg-primary text-white shadow-md' 
                        : 'border-gray-300 hover:border-primary hover:shadow-md'
                    }`}>
                      {color}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <label key={size} className="cursor-pointer">
                    <input
                      type="radio"
                      name="size"
                      value={size}
                      checked={selectedSize === size}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="sr-only"
                    />
                    <span className={`inline-block px-4 py-2 border-2 rounded-lg transition-colors shadow-sm ${
                      selectedSize === size 
                        ? 'border-primary bg-primary text-white shadow-md' 
                        : 'border-gray-300 hover:border-primary hover:shadow-md'
                    }`}>
                      {size}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-6">
              <button
                onClick={handleAddToCart}
                className="w-full bg-primary text-white py-4 px-6 text-lg font-semibold hover:bg-red-800 transition-colors duration-200 rounded-lg shadow-lg"
              >
                Add to Cart
              </button>
              
              <button
                onClick={handleBuyNow}
                className="w-full bg-gray-800 text-white py-4 px-6 text-lg font-semibold hover:bg-gray-900 transition-colors duration-200 rounded-lg shadow-lg"
              >
                Buy Now
              </button>
            </div>

            {/* Product Features */}
            <div className="border-t pt-6 mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Quality Guaranteed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>30-Day Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
