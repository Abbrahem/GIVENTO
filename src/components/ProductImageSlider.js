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
    const isLeftSwipe = distance > 80;
    const isRightSwipe = distance < -80;

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
    const isLeftSwipe = distance > 80;
    const isRightSwipe = distance < -80;

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
    setShowFullscreen(true);
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
          className="overflow-hidden bg-gray-100 rounded-2xl cursor-pointer select-none relative group shadow-xl"
          style={{ height: '75vh', minHeight: '450px' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleImageClick}
        >
          {/* Image Container */}
          <div 
            className="flex transition-transform duration-500 ease-in-out h-full w-full"
            style={{ transform: `translateX(-${currentImage * 100}%)` }}
          >
            {images.map((image, index) => (
              <div key={index} className="w-full h-full flex-shrink-0 overflow-hidden">
                <img
                  src={getImageUrl(image)}
                  alt={`${productName} ${index + 1}`}
                  className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105`}
                  draggable={false}
                />
              </div>
            ))}
          </div>


          {/* Beautiful Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                disabled={currentImage === 0}
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-white transition-all duration-300 ${
                  currentImage === 0 
                    ? 'opacity-30 cursor-not-allowed' 
                    : 'opacity-0 group-hover:opacity-80 hover:opacity-100 hover:scale-110'
                }`}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                disabled={currentImage === images.length - 1}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-white transition-all duration-300 ${
                  currentImage === images.length - 1 
                    ? 'opacity-30 cursor-not-allowed' 
                    : 'opacity-0 group-hover:opacity-80 hover:opacity-100 hover:scale-110'
                }`}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}


          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-cairo">
              {currentImage + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Beautiful Slide Indicators */}
        {images.length > 1 && (
          <div className="flex justify-center mt-6 space-x-3">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 shadow-md ${
                  index === currentImage 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-125 shadow-lg' 
                    : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Beautiful Thumbnail Images */}
      {images.length > 1 && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl shadow-inner">
          <h4 className="text-center text-gray-600 font-semibold mb-4">All Photos</h4>
          <div className="flex space-x-4 overflow-x-auto pb-3 justify-center">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`flex-shrink-0 w-20 h-20 overflow-hidden rounded-2xl transition-all duration-300 shadow-md hover:shadow-xl ${
                  currentImage === index 
                    ? 'ring-4 ring-gradient-to-r ring-purple-500 shadow-2xl scale-110 transform rotate-1' 
                    : 'hover:scale-105 hover:-rotate-1 border-2 border-gray-200 hover:border-purple-300'
                }`}
              >
                <img
                  src={getImageUrl(image)}
                  alt={`${productName} صورة ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Responsive Fullscreen Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-y-auto">
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="text-center p-4 sm:p-6">
              <h3 className="text-white text-lg sm:text-2xl lg:text-3xl font-bold font-cairo">{productName}</h3>
              <p className="text-gray-300 text-sm sm:text-base font-cairo mt-1">{currentImage + 1} من {images.length}</p>
            </div>

            {/* Main Image Container - Responsive */}
            <div className="flex-1 flex items-center justify-center px-4 py-2">
              <div className="relative w-full max-w-4xl">
                <div 
                  className="relative cursor-pointer group bg-white rounded-lg sm:rounded-2xl overflow-hidden shadow-xl"
                  style={{ 
                    height: 'calc(100vh - 200px)',
                    minHeight: '300px',
                    maxHeight: '80vh'
                  }}
                  onClick={handleZoomToggle}
                >
                  <img
                    src={getImageUrl(images[currentImage])}
                    alt={`${productName} - صورة ${currentImage + 1}`}
                    className={`w-full h-full object-contain transition-all duration-500 ${
                      isZoomed ? 'scale-150' : 'scale-100 group-hover:scale-105'
                    }`}
                    onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                  />
                  
                  {/* Close Button - Over Image */}
                  <button
                    onClick={() => setShowFullscreen(false)}
                    className="absolute top-4 right-4 z-10 text-red-500 hover:text-red-600 transition-all duration-200 hover:scale-110"
                  >
                    <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>


                  {/* Responsive Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); goToPrevious(); setIsZoomed(false); }}
                        disabled={currentImage === 0}
                        className={`absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-white transition-all duration-300 ${
                          currentImage === 0 
                            ? 'opacity-30 cursor-not-allowed' 
                            : 'opacity-70 hover:opacity-100 hover:scale-110'
                        }`}
                      >
                        <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); goToNext(); setIsZoomed(false); }}
                        disabled={currentImage === images.length - 1}
                        className={`absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 text-white transition-all duration-300 ${
                          currentImage === images.length - 1 
                            ? 'opacity-30 cursor-not-allowed' 
                            : 'opacity-70 hover:opacity-100 hover:scale-110'
                        }`}
                      >
                        <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Section - Responsive Thumbnails and Dots */}
            <div className="p-4 sm:p-6">
              {/* Responsive Thumbnails */}
              {images.length > 1 && (
                <div className="mb-4">
                  <div className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-2 px-2">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => { setCurrentImage(index); setIsZoomed(false); }}
                        className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg border-2 ${
                          currentImage === index
                            ? 'border-blue-400 scale-105 sm:scale-110 shadow-xl ring-2 ring-blue-400/50'
                            : 'border-white/30 hover:border-blue-400/70 hover:scale-105'
                        }`}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`${productName} - مصغرة ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsive Image Counter Dots */}
              {images.length > 1 && (
                <div className="flex justify-center space-x-2 sm:space-x-3">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => { setCurrentImage(index); setIsZoomed(false); }}
                      className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 border-2 border-white/30 ${
                        currentImage === index
                          ? 'bg-blue-500 scale-125 shadow-lg'
                          : 'bg-white/50 hover:bg-white/70 hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageSlider;
