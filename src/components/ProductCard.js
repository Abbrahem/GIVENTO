import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <div className="group cursor-pointer">
      <Link to={`/products/${product.id}`}>
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Product Info */}
          <div className="p-4 space-y-3">
            <h3 className="text-gray-800 font-medium text-sm md:text-base line-clamp-2">
              {product.title}
            </h3>
            
            {/* Price */}
            <div className="flex items-center space-x-2">
              {product.oldPrice && (
                <span className="text-gray-500 line-through text-sm">
                  {product.oldPrice} EGP
                </span>
              )}
              <span className="text-primary font-semibold text-lg">
                {product.price} EGP
              </span>
            </div>
            
            {/* View Product Button */}
            <button className="w-full mt-3 bg-primary text-white py-2 px-4 hover:bg-red-800 transition-colors duration-200 text-sm font-medium rounded-lg">
              View Product
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
