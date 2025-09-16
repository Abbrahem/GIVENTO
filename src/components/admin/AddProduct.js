import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { getApiUrl, API_ENDPOINTS } from '../../config/api';
import { processMultipleFiles, validateImageFile } from '../../utils/imageUtils';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    originalPrice: '',
    salePrice: '',
    category: '',
    sizes: [],
    colors: []
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = ['t-shirt', 'pants', 'shorts', 'cap', 'zip-up', 'hoodies', 'polo shirts'];
  
  const sizeOptions = {
    't-shirt': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'pants': ['28', '30', '32', '34', '36', '38', '40'],
    'shorts': ['28', '30', '32', '34', '36', '38', '40'],
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
    if (formData.category === 'shorts') return sizeOptions.shorts;
    if (formData.category === 'cap') return sizeOptions.cap;
    if (formData.category === 't-shirt') return sizeOptions['t-shirt'];
    if (formData.category === 'zip-up') return sizeOptions['zip-up'];
    if (formData.category === 'hoodies') return sizeOptions['hoodies'];
    if (formData.category === 'polo shirts') return sizeOptions['polo shirts'];
    return [];
  };

  const getColorOptions = () => {
    return colorOptions;
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

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    
    try {
      // Validate and process images to base64
      const processedImages = await processMultipleFiles(files);
      setImages(processedImages);
      
      Swal.fire({
        icon: 'success',
        title: 'تم تحميل الصور بنجاح',
        text: `تم معالجة ${processedImages.length} صورة وضغطها`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ في تحميل الصور',
        text: error.message,
        confirmButtonColor: '#dc2626'
      });
      setImages([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.originalPrice || !formData.salePrice || !formData.category || images.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all required fields and upload at least one image.',
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      
      // Send JSON data with base64 images
      const productData = {
        name: formData.name,
        description: formData.description,
        originalPrice: formData.originalPrice,
        salePrice: formData.salePrice,
        category: formData.category,
        sizes: formData.sizes,
        colors: formData.colors,
        images: images // Already base64 strings
      };

      const response = await fetch(getApiUrl(API_ENDPOINTS.PRODUCTS), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Product added successfully!',
          confirmButtonColor: '#dc2626'
        });
        setFormData({
          name: '',
          description: '',
          originalPrice: '',
          salePrice: '',
          category: '',
          sizes: [],
          colors: []
        });
        setImages([]);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to add product. Please try again.',
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
      <div className="border-b border-gray-200 pb-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 font-cairo">Add New Product</h2>
        <p className="text-gray-600 mt-2">Fill in the product details below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 font-cairo">
            Product Name
          </label>
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
            <label className="block text-sm font-medium text-gray-700 font-cairo">
              Original Price ($)
            </label>
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
            <label className="block text-sm font-medium text-gray-700 font-cairo">
              Sale Price ($)
            </label>
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
          <label className="block text-sm font-medium text-gray-700 font-cairo">
            Description
          </label>
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
          <label className="block text-sm font-medium text-gray-700 font-cairo">
            Category
          </label>
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
            <label className="block text-sm font-medium text-gray-700 font-cairo">
              Available Sizes
            </label>
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
          <label className="block text-sm font-medium text-gray-700 font-cairo">
            Available Colors
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {getColorOptions().map((color) => (
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

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 font-cairo">
            Product Images
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
              required
            />
            {images.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-700 font-cairo">
                  {images.length} image{images.length > 1 ? 's' : ''} selected
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg transition-colors duration-200 font-semibold font-cairo ${
            loading
              ? 'bg-gray-400 cursor-not-allowed text-gray-600'
              : 'bg-primary hover:bg-red-800 text-white button-split-primary'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Adding Product...</span>
            </div>
          ) : (
            'Add Product'
          )}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
