import React, { useState, useEffect, useRef } from 'react';
import { getImageUrl } from '../utils/imageUtils';

const ProductImageSlider = ({ images, productName }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false); // Disabled by default for product images
  const [isZoomed, setIsZoomed] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
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

  const handleImageClick = () => {
    // Remove fullscreen functionality - keep images in place
  };

  const handleZoomToggle = () => {
    setIsZoomed(!isZoomed);
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
          className="overflow-hidden bg-gray-100 rounded-2xl cursor-grab select-none relative group shadow-xl"
          style={{ height: '70vh', minHeight: '400px' }}
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
                  className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-105`}
                  draggable={false}
                />
              </div>
            ))}
          </div>

          {/* Swipe Indicator */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-full text-sm font-cairo opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l3-3m0 0l3 3m-3-3v6m0-6V4" />
            </svg>
            اسحب للتنقل
          </div>


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


    </div>
  );
};

export default ProductImageSlider;
