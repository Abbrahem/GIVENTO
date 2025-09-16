import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';
import { getApiUrl, API_ENDPOINTS } from '../config/api';
import { getImageUrl } from '../utils/imageUtils';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity] = useState(1);
  const [showDescription, setShowDescription] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Function to get the correct size chart image based on category
  const getSizeChartImage = (category) => {
    const sizeChartMap = {
      't-shirt': '/chart-sirt.png',
      'cap': '/cap.jpg',
      'pants': '/pants.webp',
      'shorts': '/short.webp',
      'zip-up': '/zip-up.jpg',
      'hoodies': '/Size_Charthoodies.webp',
      'polo shirts': '/Polo-T-shirt-Size-Chart.jpg'
    };
    
    return sizeChartMap[category] || '/chart-sirt.png'; // Default to t-shirt chart if category not found
  };

  useEffect(() => {
    fetchProduct();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProduct = async () => {
    if (!id) {
      setProduct(null);
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.PRODUCT_BY_ID(id)));
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        // Set default selections
        if (data.colors.length > 0) setSelectedColor(data.colors[0]);
        if (data.sizes.length > 0) setSelectedSize(data.sizes[0]);
      } else {
        setProduct(null);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-center font-cairo">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 font-cairo">Product Not Found</h2>
          <button 
            onClick={() => navigate('/products')}
            className="bg-primary text-white px-6 py-3 hover:bg-red-800 transition-colors rounded-lg font-cairo"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product.isAvailable) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 font-cairo">Out of Stock</h2>
          <p className="text-gray-600 mb-4 font-cairo">This product is currently unavailable</p>
          <button 
            onClick={() => navigate('/products')}
            className="bg-primary text-white px-6 py-3 hover:bg-red-800 transition-colors rounded-lg font-cairo"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.sizes.length > 0 && !selectedSize) {
      Swal.fire({
        icon: 'warning',
        title: 'Selection Required',
        text: 'Please select size and color',
        confirmButtonColor: '#dc2626'
      });
      return;
    }
    if (product.colors.length > 0 && !selectedColor) {
      Swal.fire({
        icon: 'warning',
        title: 'Selection Required',
        text: 'Please select color',
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
    if (product.sizes.length > 0 && !selectedSize) {
      Swal.fire({
        icon: 'warning',
        title: 'Selection Required',
        text: 'Please select size and color',
        confirmButtonColor: '#dc2626'
      });
      return;
    }
    if (product.colors.length > 0 && !selectedColor) {
      Swal.fire({
        icon: 'warning',
        title: 'Selection Required',
        text: 'Please select color',
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
          <ol className="flex items-center space-x-2 text-sm text-gray-500 font-cairo">
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
            <li className="text-gray-800">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden bg-gray-100 rounded-lg">
              <img
                src={getImageUrl(product.images[selectedImage])}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 overflow-hidden border-2 rounded-lg transition-colors ${
                    selectedImage === index ? 'border-primary' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4 font-cairo">
                {product.name}
              </h1>
              
              {/* Price */}
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-xl text-gray-500 line-through">
                  {product.originalPrice} EGP
                </span>
                <span className="text-3xl font-bold text-primary">
                  {product.salePrice} EGP
                </span>
              </div>
            </div>

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 font-cairo">Available Colors</h3>
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
                      <span className={`inline-block px-4 py-2 border-2 rounded-lg transition-all duration-300 shadow-sm font-cairo ${
                        selectedColor === color 
                          ? 'border-primary bg-primary text-white shadow-md transform scale-105' 
                          : 'border-gray-300 hover:border-primary hover:shadow-md hover:scale-105'
                      }`}>
                        {color}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 font-cairo">Available Sizes</h3>
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
                      <span className={`inline-block px-4 py-2 border-2 rounded-lg transition-all duration-300 shadow-sm font-cairo ${
                        selectedSize === size 
                          ? 'border-primary bg-primary text-white shadow-md transform scale-105' 
                          : 'border-gray-300 hover:border-primary hover:shadow-md hover:scale-105'
                      }`}>
                        {size}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Description Dropdown */}
            <div className="border-t pt-6">
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="w-full flex justify-between items-center py-4 text-left font-cairo"
              >
                <span className="text-lg font-semibold text-gray-800">Description</span>
                <svg
                  className={`w-5 h-5 transform transition-transform ${showDescription ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showDescription && (
                <div className="pb-4">
                  <p className="text-gray-600 leading-relaxed font-cairo whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Size Chart Dropdown */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="border-t">
                <button
                  onClick={() => setShowSizeChart(!showSizeChart)}
                  className="w-full flex justify-between items-center py-4 text-left font-cairo"
                >
                  <span className="text-lg font-semibold text-gray-800">Size Chart</span>
                  <svg
                    className={`w-5 h-5 transform transition-transform ${showSizeChart ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showSizeChart && (
                  <div className="pb-4">
                    <div className="flex justify-center">
                      <img
                        src={getSizeChartImage(product.category)}
                        alt={`${product.category} Size Chart`}
                        className="max-w-full h-auto max-h-96 rounded-lg shadow-md object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <p className="text-gray-600 text-sm mt-3 font-cairo text-center">
                      Please refer to the size chart to choose the right size
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-800 transition-colors duration-200 font-cairo button-split-primary"
              >
                Add to Cart
              </button>
              
              <button
                onClick={handleBuyNow}
                className="w-full bg-gray-800 text-white py-4 px-6 text-lg font-semibold hover:bg-gray-900 transition-all duration-300 rounded-lg shadow-lg button-split-secondary font-cairo"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
