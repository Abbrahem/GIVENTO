import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { getApiUrl, API_ENDPOINTS } from '../../config/api';

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
      // Convert files to base64 without any processing - keep original quality
      const processedImages = [];
      
      for (const file of files) {
        // Simple validation
        if (file.size > 15 * 1024 * 1024) {
          throw new Error(`الملف ${file.name} كبير جداً. الحد الأقصى 15 ميجابايت`);
        }
        
        // Convert to base64 without any processing
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        processedImages.push(base64);
      }
      
      setImages(processedImages);
      
      Swal.fire({
        icon: 'success',
        title: 'تم تحميل الصور بنجاح',
        text: `تم تحميل ${processedImages.length} صورة بالجودة الأصلية`,
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
      console.log('🔑 Token from localStorage:', token ? 'Token exists' : 'No token found');
      console.log('🔑 Token length:', token?.length || 0);
      console.log('🔑 Actual token value:', token);
      
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Authentication Required',
          text: 'Please login first to add products.',
          confirmButtonColor: '#dc2626'
        });
        return;
      }
      
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

      console.log('🚀 Sending product data:', productData);
      console.log('📡 API URL:', getApiUrl(API_ENDPOINTS.PRODUCTS));
      console.log('🖼️ Images count:', images.length);
      console.log('🖼️ First image preview:', images[0]?.substring(0, 50) + '...');
      
      const headers = {
        'x-auth-token': token,
        'Content-Type': 'application/json'
      };
      
      console.log('📋 Headers being sent:', headers);
      
      const response = await fetch(getApiUrl(API_ENDPOINTS.PRODUCTS), {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(productData),
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

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
        // Get error message from server
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.log('❌ Server error:', errorData);
        
        if (response.status === 401) {
          // Token expired or invalid - redirect to login
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          
          Swal.fire({
            icon: 'warning',
            title: 'Session Expired',
            text: 'Please login again to continue.',
            confirmButtonColor: '#dc2626'
          }).then(() => {
            window.location.href = '/admin/login';
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorData.message || 'Failed to add product. Please try again.',
            confirmButtonColor: '#dc2626'
          });
        }
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
          
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-800 font-cairo">ملاحظة مهمة</h4>
                <p className="text-sm text-blue-700 font-cairo mt-1">
                  • الصورة الأولى ستظهر في كارد المنتج على الصفحة الرئيسية<br/>
                  • باقي الصور ستظهر في صفحة تفاصيل المنتج<br/>
                  • يمكنك رفع عدة صور مرة واحدة
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <label htmlFor="images" className="cursor-pointer">
                  <span className="text-sm font-medium text-gray-700 font-cairo">اضغط لاختيار الصور</span>
                  <span className="text-xs text-gray-500 block mt-1">أو اسحب الصور هنا</span>
                </label>
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Image Preview */}
          {images.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700 font-cairo">
                  الصور المحددة ({images.length})
                </h4>
                <button
                  type="button"
                  onClick={() => setImages([])}
                  className="text-xs text-red-600 hover:text-red-800 font-cairo"
                >
                  حذف جميع الصور
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {index === 0 && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-cairo">
                          صورة الكارد
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full font-cairo">
                        {index + 1}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = images.filter((_, i) => i !== index);
                        setImages(newImages);
                      }}
                      className="absolute inset-0 bg-red-500 bg-opacity-0 hover:bg-opacity-75 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-gray-600 font-cairo">
                    يمكنك إعادة ترتيب الصور بحذف وإعادة رفع. الصورة الأولى ستكون صورة الكارد الرئيسية.
                  </p>
                </div>
              </div>
            </div>
          )}
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
