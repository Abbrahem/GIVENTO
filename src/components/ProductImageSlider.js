import React, { useState, useEffect, useRef } from 'react';
import { getImageUrl } from '../utils/imageUtils';

const ProductImageSlider = ({ images, productName }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false); // Disabled by default for product images
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const sliderRef = useRef(null);

  // Auto-rotate images (optional, can be enabled)
  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentImage < images.length - 1) {
      setCurrentImage(prev => prev + 1);
    }
    if (isRightSwipe && currentImage > 0) {
      setCurrentImage(prev => prev - 1);
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Mouse handlers for desktop drag
  const handleMouseDown = (e) => {
    touchStartX.current = e.clientX;
    setIsAutoPlaying(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e) => {
    if (touchStartX.current === 0) return;
    touchEndX.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (!touchStartX.current || !touchEndX.current) {
      touchStartX.current = 0;
      touchEndX.current = 0;
      if (sliderRef.current) {
        sliderRef.current.style.cursor = 'grab';
      }
      return;
    }

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentImage < images.length - 1) {
      setCurrentImage(prev => prev + 1);
    }
    if (isRightSwipe && currentImage > 0) {
      setCurrentImage(prev => prev - 1);
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
    }
  };

  const goToPrevious = () => {
    if (currentImage > 0) {
      setCurrentImage(prev => prev - 1);
    }
  };

  const goToNext = () => {
    if (currentImage < images.length - 1) {
      setCurrentImage(prev => prev + 1);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square overflow-hidden bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400 font-cairo">No Image Available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image Slider */}
      <div className="relative">
        <div 
          ref={sliderRef}
          className="aspect-square overflow-hidden bg-gray-100 rounded-lg cursor-grab select-none relative group"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Image Container */}
          <div 
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentImage * 100}%)` }}
          >
            {images.map((image, index) => (
              <div key={index} className="min-w-full h-full relative">
                <img
                  src={getImageUrl(image)}
                  alt={`${productName} ${index + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            ))}
          </div>

          {/* Navigation Arrows - Only show if more than 1 image */}
          {images.length > 1 && (
            <>
              {/* Previous Arrow */}
              <button
                onClick={goToPrevious}
                disabled={currentImage === 0}
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black bg-opacity-50 text-white flex items-center justify-center transition-all duration-300 ${
                  currentImage === 0 
                    ? 'opacity-30 cursor-not-allowed' 
                    : 'hover:bg-opacity-75 opacity-0 group-hover:opacity-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Next Arrow */}
              <button
                onClick={goToNext}
                disabled={currentImage === images.length - 1}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black bg-opacity-50 text-white flex items-center justify-center transition-all duration-300 ${
                  currentImage === images.length - 1 
                    ? 'opacity-30 cursor-not-allowed' 
                    : 'hover:bg-opacity-75 opacity-0 group-hover:opacity-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-cairo">
              {currentImage + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Slide Indicators - Only show if more than 1 image */}
        {images.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentImage 
                    ? 'bg-primary scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Images - Only show if more than 1 image */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`flex-shrink-0 w-20 h-20 overflow-hidden border-2 rounded-lg transition-all duration-300 ${
                currentImage === index 
                  ? 'border-primary shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <img
                src={getImageUrl(image)}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageSlider;
