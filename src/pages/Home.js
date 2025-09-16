import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImageSlider from '../components/ImageSlider';
import TikTokSection from '../components/TikTokSection';
import { getApiUrl, API_ENDPOINTS } from '../config/api';
import { getImageUrl } from '../utils/imageUtils';

const Home = () => {
  const [latestProduct, setLatestProduct] = useState(null);

  const categories = [
    { name: 'T-Shirt', image: '/t-shirt.JPG', slug: 't-shirt' },
    { name: 'Pants', image: '/pantss.JPG', slug: 'pants' },
    { name: 'Shorts', image: '/pantss.JPG', slug: 'shorts' },
    { name: 'Cap', image: '/t-shirt.JPG', slug: 'cap' },
    { name: 'Zip-up', image: '/t-shirt.JPG', slug: 'zip-up' },
    { name: 'Hoodies', image: '/t-shirt.JPG', slug: 'hoodies' },
    { name: 'Polo Shirts', image: '/t-shirt.JPG', slug: 'polo shirts' }
  ];

  useEffect(() => {
    fetchLatestProduct();
  }, []);

  const fetchLatestProduct = async () => {
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.PRODUCTS_LATEST));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const data = await response.json();
      setLatestProduct(data);
    } catch (error) {
      console.error('Error fetching latest product:', error);
      // Set to null to hide the section if there's an error
      setLatestProduct(null);
    }
  };

  return (
    <div className="pt-32 font-cairo">
      {/* Hero Section with Video */}
      <section id="hero" className="relative h-screen overflow-hidden">
        <video 
          ref={(video) => {
            if (video) {
              video.currentTime = 15; // Start from 15 seconds
            }
          }}
          autoPlay 
          loop 
          muted 
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover hero-video"
          style={{ filter: 'brightness(1.1) contrast(1.05)' }}
          onLoadedData={(e) => {
            e.target.currentTime = 15; // Ensure it starts from 15 seconds
          }}
          onTimeUpdate={(e) => {
            // Loop from 15 seconds to end, then restart at 15 seconds
            if (e.target.currentTime < 15) {
              e.target.currentTime = 15;
            }
          }}
        >
          <source src="/home.mp4" type="video/mp4" />
          {/* Fallback to image if video doesn't load */}
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
               style={{
                 backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(/hero.webp)'
               }}>
          </div>
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <div className="text-center">
            <Link 
              to="/products"
              className="inline-block bg-primary text-white px-8 py-4 text-lg font-semibold hover:bg-red-800 transition-all duration-300 rounded-full shadow-lg transform hover:scale-105 button-split-primary whitespace-nowrap"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4 font-cairo">Shop by Category</h2>
            <p className="text-gray-600 text-lg font-cairo">Discover our wide range of products</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-8 max-w-6xl mx-auto">
            {categories.map((category, index) => (
              <div key={index} className="group relative rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden h-48 sm:h-56 lg:h-64">
                {/* Full Background Image */}
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300 category-image"
                  style={{ imageRendering: 'high-quality' }}
                  loading="lazy"
                />
                {/* Dark Overlay for better text visibility */}
                <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all duration-300"></div>
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 p-4">
                  {/* Category Name - Lower Position */}
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 font-cairo text-center drop-shadow-lg">
                    {category.name}
                  </h3>
                  
                  {/* Simple Text Button - Even Lower Position */}
                  <Link 
                    to={`/category/${category.slug}`}
                    className="text-white font-semibold transition-all duration-300 hover:scale-105 font-cairo text-sm sm:text-base drop-shadow-lg whitespace-nowrap"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Slider Section */}
      <ImageSlider />

      {/* New Collection Section */}
      {latestProduct && (
        <section id="new-collection" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-cairo">
                New Collection
              </h2>
              <p className="text-gray-600 text-lg font-cairo">
                Discover our latest addition to the collection
              </p>
            </div>

            <div className="flex justify-center">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden max-w-md relative">
                {/* Sold Out Banner */}
                {!latestProduct.isAvailable && (
                  <div className="absolute top-4 left-4 z-20">
                    <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold font-cairo transform -rotate-12 shadow-lg">
                      SOLD OUT
                    </div>
                  </div>
                )}
                
                <div className="relative overflow-hidden">
                  <img 
                    src={latestProduct.images && latestProduct.images.length > 0 ? getImageUrl(latestProduct.images[0]) : '/placeholder-image.jpg'} 
                    alt={latestProduct.name}
                    className={`w-full h-80 object-cover transition-transform duration-300 ${latestProduct.isAvailable ? 'hover:scale-110' : 'grayscale'}`}
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                  {!latestProduct.isAvailable && (
                    <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 font-cairo">{latestProduct.name}</h3>
                  
                  {/* Available Sizes */}
                  {latestProduct.sizes && latestProduct.sizes.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2 font-cairo">Available Sizes:</p>
                      <div className="flex flex-wrap gap-2">
                        {latestProduct.sizes.map((size, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-cairo">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Available Colors */}
                  {latestProduct.colors && latestProduct.colors.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2 font-cairo">Available Colors:</p>
                      <div className="flex flex-wrap gap-2">
                        {latestProduct.colors.map((color, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-cairo">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {latestProduct.originalPrice > latestProduct.salePrice && (
                        <span className="text-gray-400 line-through font-cairo text-lg">
                          {latestProduct.originalPrice} EGP
                        </span>
                      )}
                      <span className="text-2xl font-bold text-primary font-cairo">
                        {latestProduct.salePrice} EGP
                      </span>
                    </div>
                  </div>
                  <Link 
                    to={latestProduct.isAvailable ? `/products/${latestProduct._id}` : '#'}
                    className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 font-cairo block text-center ${
                      latestProduct.isAvailable 
                        ? 'bg-primary hover:bg-red-800 text-white transform hover:scale-105 button-split-primary' 
                        : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    }`}
                    onClick={!latestProduct.isAvailable ? (e) => e.preventDefault() : undefined}
                  >
                    {latestProduct.isAvailable ? 'View Product' : 'Sold Out'}
                  </Link>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link 
                to="/products"
                className="bg-primary text-white px-8 py-4 hover:bg-red-800 transition-colors duration-200 font-semibold text-lg rounded-lg font-cairo button-split-primary"
              >
                View All Products
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* TikTok Videos Section */}
      <TikTokSection />
    </div>
  );
};

export default Home;
