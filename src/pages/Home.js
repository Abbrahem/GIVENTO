import React from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import ComplainSection from '../components/ComplainSection';

const Home = () => {
  // Get first 3 products for preview
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="pt-32">
      {/* Hero Section */}
      <section id="hero" className="h-screen bg-cover bg-center bg-no-repeat relative" 
               style={{
                 backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(/hero.webp)',
                 height: '80vh'
               }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to<br/>GIVENTO
            </h1>
            <Link 
              to="/products"
              className="inline-block bg-primary text-white px-8 py-4 text-lg font-semibold hover:bg-red-800 transition-colors duration-200 rounded-full shadow-lg"
            >
              Shop New
            </Link>
          </div>
        </div>
      </section>

      {/* Products Preview Section */}
      <section id="products" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Products
            </h2>
          </div>

          {/* Products Grid - Desktop: 3 columns, Mobile: 1 column */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* View All Products Button */}
          <div className="text-center mt-12">
            <Link 
              to="/products"
              className="inline-block bg-primary text-white px-8 py-3 hover:bg-red-800 transition-colors duration-200 font-semibold"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Make a Complain Section */}
      <ComplainSection />
    </div>
  );
};

export default Home;
