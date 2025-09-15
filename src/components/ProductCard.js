import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../config/api';

const ProductCard = ({ product }) => {
  return (
    <div className="group cursor-pointer">
      <Link to={product.isAvailable ? `/products/${product._id}` : '#'} className={!product.isAvailable ? 'pointer-events-none' : ''}>
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden relative">
          {/* Sold Out Banner */}
          {!product.isAvailable && (
            <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-10">
              <span className="text-sm font-bold font-cairo">SOLD OUT</span>
            </div>
          )}
          
          {/* Product Image */}
          <div className={`aspect-square overflow-hidden ${!product.isAvailable ? 'mt-10' : ''}`}>
            <img
              src={product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : '/placeholder-image.jpg'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          </div>
          
          {/* Product Info */}
          <div className="p-4 space-y-3">
            <h3 className={`font-medium text-sm md:text-base line-clamp-2 font-cairo ${
              product.isAvailable ? 'text-gray-800' : 'text-gray-500 line-through'
            }`}>
              {product.name}
            </h3>
            
            {/* Price */}
            <div className="flex items-center space-x-2">
              {product.originalPrice && product.originalPrice !== product.salePrice && (
                <span className="text-gray-500 line-through text-sm">
                  {product.originalPrice} EGP
                </span>
              )}
              <span className="text-primary font-semibold text-lg">
                {product.salePrice} EGP
              </span>
            </div>
            
            {/* View Product Button */}
            <button 
              className={`w-full mt-3 py-2 px-4 transition-colors duration-200 text-sm font-medium rounded-lg font-cairo ${
                product.isAvailable 
                  ? 'bg-primary text-white hover:bg-red-800 button-split-primary' 
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
              disabled={!product.isAvailable}
            >
              {product.isAvailable ? 'View Product' : 'Sold Out'}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
