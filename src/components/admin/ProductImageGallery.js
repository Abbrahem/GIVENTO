import React, { useState } from 'react';
import { getImageUrl } from '../../utils/imageUtils';

const ProductImageGallery = ({ images, productName, onClose }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) {
    return null;
  }

  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
    setIsZoomed(false);
  };

  const handleMainImageClick = () => {
    setIsZoomed(!isZoomed);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Product Name */}
        <div className="text-center mb-4">
          <h3 className="text-white text-xl font-bold font-cairo">{productName}</h3>
          <p className="text-gray-300 text-sm font-cairo">{selectedImageIndex + 1} of {images.length}</p>
        </div>

        {/* Main Image Container */}
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
          <div 
            className="relative cursor-pointer group"
            style={{ height: '70vh' }}
            onClick={handleMainImageClick}
          >
            <img
              src={getImageUrl(images[selectedImageIndex])}
              alt={`${productName} - Image ${selectedImageIndex + 1}`}
              className={`w-full h-full object-contain transition-all duration-500 ${
                isZoomed ? 'scale-150' : 'scale-100 group-hover:scale-105'
              }`}
              onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
            />
          

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="p-4 bg-gray-50">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImageIndex === index
                        ? 'border-red-500 scale-110 shadow-lg'
                        : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${productName} - Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Image Counter Dots */}
        {images.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  selectedImageIndex === index
                    ? 'bg-white scale-125'
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageGallery;
