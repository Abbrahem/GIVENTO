import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getApiUrl, API_ENDPOINTS } from '../config/api';

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const categoryNames = {
    't-shirt': 'T-Shirts',
    'pants': 'Pants',
    'shorts': 'Shorts',
    'cap': 'Caps',
    'zip-up': 'Zip-up Jackets',
    'hoodies': 'Hoodies',
    'polo shirts': 'Polo Shirts'
  };

  const categoryName = categoryNames[categorySlug] || 'Products';

  useEffect(() => {
    fetchProducts();
  }, [categorySlug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = async () => {
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.PRODUCTS));
      const data = await response.json();
      
      // Filter products by category
      const categoryProducts = data.filter(product => 
        product.category === categorySlug && product.isAvailable
      );
      
      setProducts(categoryProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center font-cairo">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 min-h-screen bg-gray-50 font-cairo">
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
            <li className="text-gray-800">{categoryName}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{categoryName}</h1>
          <p className="text-gray-600 text-lg">
            Discover our collection of {categoryName.toLowerCase()}
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col items-center">
            {/* Search Input */}
            <div className="w-full max-w-md relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            {searchTerm ? (
              // Show search results message if user is searching
              <>
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search terms</p>
                <button
                  onClick={() => navigate('/products')}
                  className="bg-primary text-white px-8 py-3 hover:bg-red-800 transition-colors duration-200 font-semibold rounded-lg font-cairo button-split-primary"
                >
                  Browse All Products
                </button>
              </>
            ) : (
              // Show "Soon" message if category is empty
              <div className="flex flex-col items-center justify-center">
                <div className="text-8xl font-bold text-gray-300 mb-4 font-cairo">
                  Soon
                </div>
                <p className="text-gray-500 text-lg font-cairo">
                  {categoryName} products coming soon
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
