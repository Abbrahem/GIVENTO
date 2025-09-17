import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getApiUrl, API_ENDPOINTS } from '../../config/api';
import { getImageUrl } from '../../utils/imageUtils';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('🔍 Fetching products...');
      const response = await fetch(getApiUrl(API_ENDPOINTS.PRODUCTS));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Products data:', data);
      console.log('📊 Products count:', data.length);
      
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to load products. Please try again.',
        icon: 'error',
        confirmButtonColor: '#b71c1c'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    const result = await Swal.fire({
      title: 'Delete Product',
      text: 'Are you sure you want to delete this product?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('adminToken');
      const deleteUrl = getApiUrl(API_ENDPOINTS.PRODUCT_BY_ID(productId));
      console.log('🗑️ DELETE URL:', deleteUrl);
      console.log('🆔 Product ID:', productId);
      console.log('🔗 API_ENDPOINTS.PRODUCT_BY_ID(productId):', API_ENDPOINTS.PRODUCT_BY_ID(productId));
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        console.log('✅ Product deleted successfully');
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Product has been deleted successfully.',
          confirmButtonColor: '#dc2626'
        });
        fetchProducts();
      } else {
        console.log('❌ Delete failed:', response.status, response.statusText);
        const errorData = await response.text();
        console.log('❌ Delete error response:', errorData);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to delete product. Status: ${response.status}`,
          confirmButtonColor: '#dc2626'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Please check your connection and try again.',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  const handleToggleAvailability = async (productId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const toggleUrl = getApiUrl(`${API_ENDPOINTS.PRODUCT_BY_ID(productId)}/toggle`);
      console.log('🔄 TOGGLE URL:', toggleUrl);
      console.log('🆔 Product ID:', productId);
      console.log('🔗 API_ENDPOINTS.PRODUCT_BY_ID(productId):', API_ENDPOINTS.PRODUCT_BY_ID(productId));
      
      const response = await fetch(toggleUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        console.log('✅ Product availability toggled successfully');
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Product availability updated successfully.',
          confirmButtonColor: '#dc2626',
          timer: 2000,
          showConfirmButton: false
        });
        fetchProducts();
      } else {
        console.log('❌ Toggle failed:', response.status, response.statusText);
        const errorData = await response.text();
        console.log('❌ Toggle error response:', errorData);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to update product availability. Status: ${response.status}`,
          confirmButtonColor: '#dc2626'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Please check your connection and try again.',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct({
      _id: product._id,
      name: product.name,
      description: product.description,
      originalPrice: product.originalPrice,
      salePrice: product.salePrice,
      category: product.category,
      sizes: product.sizes || [],
      colors: product.colors || [],
      images: product.images || [],
      isAvailable: product.isAvailable
    });
  };

  const handleSaveEdit = async (updatedProduct) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const productData = {
        name: updatedProduct.name,
        description: updatedProduct.description,
        originalPrice: updatedProduct.originalPrice,
        salePrice: updatedProduct.salePrice,
        category: updatedProduct.category,
        sizes: updatedProduct.sizes,
        colors: updatedProduct.colors
      };

      const updateUrl = getApiUrl(API_ENDPOINTS.PRODUCT_BY_ID(updatedProduct._id));
      console.log('✏️ UPDATE URL:', updateUrl);
      console.log('🆔 Product ID:', updatedProduct._id);
      console.log('🔗 API_ENDPOINTS.PRODUCT_BY_ID(updatedProduct._id):', API_ENDPOINTS.PRODUCT_BY_ID(updatedProduct._id));
      
      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product._id === updatedProduct._id ? updatedData : product
          )
        );
        
        Swal.fire({
          icon: 'success',
          title: 'تم التحديث!',
          text: 'تم تحديث المنتج بنجاح.',
          confirmButtonColor: '#dc2626',
          timer: 2000,
          showConfirmButton: false
        });
        
        setEditingProduct(null);
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: errorData.message || 'فشل في تحديث المنتج.',
          confirmButtonColor: '#dc2626'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Please check your connection and try again.',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <span className="ml-3 text-gray-600 font-cairo">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 sm:p-6 border border-gray-200">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-cairo">Manage Products</h2>
        <p className="text-gray-600 text-sm mt-1">View and manage your product inventory</p>
      </div>

      <div className="overflow-x-auto">
        <div className="hidden sm:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-cairo">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-cairo">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-cairo">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-cairo">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-cairo">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-xl object-cover shadow-sm"
                          src={product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : '/placeholder-image.jpg'}
                          alt={product.name}
                          onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900 font-cairo">{product.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-cairo capitalize">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 font-cairo">${product.salePrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full font-cairo ${product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleEdit(product)} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-lg transition-colors font-cairo">Edit</button>
                    <button onClick={() => handleToggleAvailability(product._id)} className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-3 py-1 rounded-lg transition-colors font-cairo">{product.isAvailable ? 'Hide' : 'Show'}</button>
                    <button onClick={() => handleDelete(product._id)} className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg transition-colors font-cairo">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="sm:hidden space-y-4">
          {products.map((product) => (
            <div key={product._id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-start space-x-4">
                <img
                  className="h-16 w-16 rounded-xl object-cover shadow-sm"
                  src={product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : '/placeholder-image.jpg'}
                  alt={product.name}
                  onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 font-cairo truncate">{product.name}</h3>
                  <p className="text-sm text-gray-600 font-cairo capitalize">{product.category}</p>
                  <p className="text-lg font-bold text-gray-900 font-cairo">${product.salePrice}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full font-cairo mt-2 ${product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.isAvailable ? 'Available' : 'Unavailable'}</span>
                </div>
              </div>
              <div className="mt-4 flex flex-col space-y-2">
                <button onClick={() => handleEdit(product)} className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200 py-2 rounded-lg transition-colors font-cairo font-semibold">Edit Product</button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleToggleAvailability(product._id)} className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 py-2 rounded-lg transition-colors font-cairo font-semibold">{product.isAvailable ? 'Hide' : 'Show'}</button>
                  <button onClick={() => handleDelete(product._id)} className="bg-red-100 text-red-700 hover:bg-red-200 py-2 rounded-lg transition-colors font-cairo font-semibold">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingProduct && (
        <EditProductModal 
          product={editingProduct} 
          onSave={handleSaveEdit} 
          onCancel={() => setEditingProduct(null)} 
        />
      )}
    </div>
  );
};

// --------------------
// EditProductModal Component
// --------------------
const EditProductModal = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    originalPrice: product?.originalPrice || '',
    salePrice: product?.salePrice || '',
    category: product?.category || '',
    sizes: product?.sizes || [],
    colors: product?.colors || []
  });

const categories = ['t-shirt', 'pants', 'cap', 'zip-up', 'hoodies', 'polo shirts'];

const sizeOptions = {
  't-shirt': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'pants': ['28', '30', '32', '34', '36', '38', '40'],
  'cap': ['One Size'],
  'zip-up': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'hoodies': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'polo shirts': ['XS', 'S', 'M', 'L', 'XL', 'XXL']
};

const colorOptions = [
  'Off-white', 'Gray', 'Mint gray', 'Baby blue', 'White', 'Black', 
  'Green', 'Blue', 'Beige', 'Red', 'Brown', 'Pink'
];

const getSizeOptions = () => {
  if (formData.category === 'pants') return sizeOptions.pants;
  if (formData.category === 'cap') return sizeOptions.cap;
  if (formData.category === 't-shirt') return sizeOptions['t-shirt'];
  if (formData.category === 'zip-up') return sizeOptions['zip-up'];
  if (formData.category === 'hoodies') return sizeOptions['hoodies'];
  if (formData.category === 'polo shirts') return sizeOptions['polo shirts'];
  return [];
};

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};

const handleSizeChange = (e) => {
  const size = e.target.value;
  const updatedSizes = formData.sizes.includes(size)
    ? formData.sizes.filter(s => s !== size)
    : [...formData.sizes, size];
  
  setFormData({
    ...formData,
    sizes: updatedSizes
  });
};

const handleColorChange = (e) => {
  const color = e.target.value;
  const updatedColors = formData.colors.includes(color)
    ? formData.colors.filter(c => c !== color)
    : [...formData.colors, color];
  
  setFormData({
    ...formData,
    colors: updatedColors
  });
};

const handleSubmit = (e) => {
  e.preventDefault();
  onSave({ ...product, ...formData });
};

return (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div className="relative top-10 mx-auto p-8 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-xl rounded-2xl bg-white border-gray-100">
      <div className="border-b border-gray-200 pb-6 mb-8">
        <h3 className="text-2xl font-bold text-gray-900 font-cairo">Edit Product</h3>
        <p className="text-gray-600 mt-2">Update the product details below</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 font-cairo">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            placeholder="Enter product name"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 font-cairo">Original Price ($)</label>
            <input
              type="number"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 font-cairo">Sale Price ($)</label>
            <input
              type="number"
              name="salePrice"
              value={formData.salePrice}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 font-cairo">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            placeholder="Enter product description"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 font-cairo">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {formData.category && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 font-cairo">Available Sizes</label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {getSizeOptions().map((size) => (
                <label key={size} className="flex items-center space-x-2 p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    value={size}
                    checked={formData.sizes.includes(size)}
                    onChange={handleSizeChange}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm font-cairo">{size}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 font-cairo">Available Colors</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {colorOptions.map((color) => (
              <label key={color} className="flex items-center space-x-2 p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  value={color}
                  checked={formData.colors.includes(color)}
                  onChange={handleColorChange}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-cairo">{color}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex space-x-4 pt-6">
          <button
            type="submit"
            className="flex-1 py-3 px-6 rounded-md font-semibold transition-colors font-cairo bg-red-600 hover:bg-red-700 text-white"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-6 rounded-md font-semibold transition-colors font-cairo bg-gray-500 hover:bg-gray-600 text-white"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
);
};

export default ManageProducts;
