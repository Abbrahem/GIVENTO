import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';

import Swal from 'sweetalert2';import Swal from 'sweetalert2';

import { getApiUrl, API_ENDPOINTS } from '../../config/api';import { getApiUrl, API_ENDPOINTS } from '../../config/api';

import { getImageUrl } from '../../utils/imageUtils';import { getImageUrl } from '../../utils/imageUtils';

import { api } from '../../utils/apiClient';import { makeAuthenticatedRequest, getValidToken } from '../../utils/auth';

import { debugAuth } from '../../utils/debug';

const ManageOrders = () => {import { api } from '../../utils/apiClient';

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);const ManageOrders = () => {

  const [orders, setOrders] = useState([]);

  useEffect(() => {  const [loading, setLoading] = useState(true);

    fetchOrders();

  }, []);  useEffect(() => {

    fetchOrders();

  const fetchOrders = async () => {  }, []);

    try {

      console.log('🔍 Fetching orders...');  const fetchOrders = async () => {

          try {

      const response = await fetch(getApiUrl(API_ENDPOINTS.ORDERS), {      console.log('🔍 Fetching orders...');

        headers: {      

          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,      // Debug authentication

          'Content-Type': 'application/json'      debugAuth();

        }      

      });      // Get token manually as fallback

            const token = getValidToken();

      const data = await response.json();      console.log('🎫 Manual token check:', !!token);

      console.log('📊 Orders data:', data);      

            const response = await api.getOrders();

      if (data.success && Array.isArray(data.orders)) {      const { orders: orderData } = response.data;

        setOrders(data.orders);      

      } else {      console.log('📊 Orders data:', response.data);

        setOrders([]);      

      }      // Filter out orders with invalid IDs on frontend as well

    } catch (error) {      const validOrders = Array.isArray(orderData) ? orderData.filter(order => 

      console.error('❌ Error fetching orders:', error);        order._id && order._id.length === 24 && /^[0-9a-fA-F]{24}$/.test(order._id)

      setOrders([]);      ) : [];

            

      Swal.fire({      console.log('✅ Valid orders found:', validOrders.length);

        title: 'Error!',      setOrders(validOrders);

        text: 'Failed to load orders. Please try again.',    } catch (error) {

        icon: 'error',      console.error('❌ Error fetching orders:', error);

        confirmButtonColor: '#b71c1c'      setOrders([]);

      });      

    } finally {      let errorMessage = 'Failed to load orders. Please try again.';

      setLoading(false);      if (error.response?.status === 401) {

    }        errorMessage = 'Session expired. Please login again.';

  };      } else if (error.response?.data?.message) {

        errorMessage = error.response.data.message;

  const getStatusColor = (status) => {      }

    switch (status) {      

      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';      Swal.fire({

      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';        title: 'Error!',

      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';        text: errorMessage,

      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';        icon: 'error',

      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';        confirmButtonColor: '#b71c1c'

      default: return 'bg-gray-100 text-gray-800 border-gray-200';      });

    }    } finally {

  };      setLoading(false);

    }

  const formatDate = (dateString) => {  };

    const date = new Date(dateString);

    return date.toLocaleDateString('en-US', {  const updateOrderStatus = async (orderId, newStatus) => {

      year: 'numeric',    try {

      month: 'short',      await api.updateOrderStatus(orderId, newStatus);

      day: 'numeric',      

      hour: '2-digit',      fetchOrders(); // Refresh orders

      minute: '2-digit'      Swal.fire({

    });        title: 'Success!',

  };        text: 'Order status updated successfully',

        icon: 'success',

  if (loading) {        confirmButtonColor: '#b71c1c'

    return (      });

      <div className="flex items-center justify-center py-16">    } catch (error) {

        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>      console.error('Error updating order:', error);

      </div>      

    );      let errorMessage = 'Failed to update order status. Please try again.';

  }      if (error.response?.status === 401) {

        errorMessage = 'Session expired. Please login again.';

  return (      } else if (error.response?.data?.message) {

    <div className="space-y-6">        errorMessage = error.response.data.message;

      <div className="flex justify-between items-center">      }

        <h2 className="text-2xl font-bold text-gray-800 font-cairo">Manage Orders</h2>      

        <div className="flex items-center gap-4">      Swal.fire({

          <div className="text-sm text-gray-600">        title: 'Error!',

            Total Orders: {orders.length}        text: errorMessage,

          </div>        icon: 'error',

        </div>        confirmButtonColor: '#b71c1c'

      </div>      });

    }

      {orders.length === 0 ? (  };

        <div className="text-center py-16">

          <svg className="mx-auto w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">  const deleteOrder = async (orderId) => {

            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />    const result = await Swal.fire({

          </svg>      title: 'Delete Order?',

          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Found</h3>      text: 'This action cannot be undone!',

          <p className="text-gray-500">Orders will appear here when customers place them</p>      icon: 'warning',

        </div>      showCancelButton: true,

      ) : (      confirmButtonColor: '#dc2626',

        <div className="grid gap-6">      cancelButtonColor: '#6b7280',

          {orders.map((order) => (      confirmButtonText: 'Yes, delete it!',

            <div key={order._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">      cancelButtonText: 'Cancel'

              {/* Order Header */}    });

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">    if (result.isConfirmed) {

                  <div>      try {

                    <h3 className="text-lg font-semibold text-gray-800 font-cairo">        await api.deleteOrder(orderId);

                      Order #{order._id.slice(-8).toUpperCase()}        

                    </h3>        fetchOrders(); // Refresh orders

                    <p className="text-sm text-gray-600">        Swal.fire({

                      {formatDate(order.createdAt)}          title: 'Deleted!',

                    </p>          text: 'Order has been deleted successfully',

                  </div>          icon: 'success',

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">          confirmButtonColor: '#b71c1c'

                    <div className="flex items-center gap-3">        });

                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>      } catch (error) {

                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}        console.error('Error deleting order:', error);

                      </span>        

                    </div>        let errorMessage = 'Failed to delete order. Please try again.';

                    <div className="text-center sm:text-right">        if (error.response?.status === 401) {

                      <p className="text-lg font-bold text-primary">{order.totalAmount} EGP</p>          errorMessage = 'Session expired. Please login again.';

                      <p className="text-xs text-gray-500">Total Amount</p>        } else if (error.response?.data?.message) {

                    </div>          errorMessage = error.response.data.message;

                  </div>        }

                </div>        

              </div>        Swal.fire({

          title: 'Error!',

              {/* Customer Info */}          text: errorMessage,

              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">          icon: 'error',

                <h4 className="text-sm font-semibold text-gray-700 mb-3 font-cairo">Customer Information</h4>          confirmButtonColor: '#b71c1c'

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">        });

                  <div>      }

                    <p className="text-sm mb-2"><span className="font-medium text-gray-700">Name:</span> {order.customerName}</p>    }

                    <p className="text-sm mb-2">  };

                      <span className="font-medium text-gray-700">Phone 1:</span> 

                      <a href={`tel:${order.customerPhone}`} className="text-blue-600 hover:text-blue-800 underline ml-1">  const cleanupInvalidOrders = async () => {

                        {order.customerPhone}    const result = await Swal.fire({

                      </a>      title: 'Clean Database?',

                    </p>      text: 'This will remove all orders with invalid IDs. This action cannot be undone!',

                    <p className="text-sm mb-2">      icon: 'warning',

                      <span className="font-medium text-gray-700">Phone 2:</span>       showCancelButton: true,

                      {order.alternatePhone && order.alternatePhone.trim() !== '' ? (      confirmButtonColor: '#dc2626',

                        <a href={`tel:${order.alternatePhone}`} className="text-blue-600 hover:text-blue-800 underline ml-1">      cancelButtonColor: '#6b7280',

                          {order.alternatePhone}      confirmButtonText: 'Yes, clean it!',

                        </a>      cancelButtonText: 'Cancel'

                      ) : (    });

                        <span className="text-gray-500 ml-1">Not provided</span>

                      )}    if (result.isConfirmed) {

                    </p>      try {

                  </div>        const response = await api.cleanupOrders();

                  <div>        const data = response.data;

                    <p className="text-sm font-medium text-gray-700 mb-1">Address:</p>        

                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words">{order.customerAddress}</p>        fetchOrders(); // Refresh orders

                  </div>        Swal.fire({

                </div>          title: 'Cleanup Complete!',

              </div>          text: `${data.deletedCount} invalid orders were removed from the database.`,

          icon: 'success',

              {/* Order Items */}          confirmButtonColor: '#b71c1c'

              <div className="px-6 py-4">        });

                <h4 className="text-lg font-semibold text-gray-700 mb-4 font-cairo">Order Items</h4>      } catch (error) {

                <div className="space-y-4">        console.error('Error cleaning up orders:', error);

                  {order.items.map((item, index) => (        

                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">        let errorMessage = 'Failed to cleanup database. Please try again.';

                      <div className="flex flex-col md:flex-row gap-4">        if (error.response?.status === 401) {

                        {/* Product Image */}          errorMessage = 'Session expired. Please login again.';

                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-300 mx-auto md:mx-0">        } else if (error.response?.data?.message) {

                          <img          errorMessage = error.response.data.message;

                            src={item.image || '/placeholder-image.jpg'}        }

                            alt={item.productName}        

                            className="w-full h-full object-cover"        Swal.fire({

                            onError={(e) => {          title: 'Error!',

                              e.target.src = '/placeholder-image.jpg';          text: errorMessage,

                            }}          icon: 'error',

                          />          confirmButtonColor: '#b71c1c'

                        </div>        });

                              }

                        {/* Product Details */}    }

                        <div className="flex-1">  };

                          <h5 className="text-lg font-bold text-gray-800 mb-3 font-cairo text-center md:text-left">{item.productName}</h5>

                            const getStatusColor = (status) => {

                          {/* Product Info Grid */}    switch (status) {

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';

                            {item.color && (      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';

                              <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 text-center">      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';

                                <span className="text-xs font-medium text-blue-700 block">Color</span>      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';

                                <p className="text-sm text-blue-800 font-semibold mt-1">{item.color}</p>      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';

                              </div>      default: return 'bg-gray-100 text-gray-800 border-gray-200';

                            )}    }

                            {item.size && (  };

                              <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200 text-center">

                                <span className="text-xs font-medium text-green-700 block">Size</span>  const formatDate = (dateString) => {

                                <p className="text-sm text-green-800 font-semibold mt-1">{item.size}</p>    const date = new Date(dateString);

                              </div>    return date.toLocaleDateString('en-US', {

                            )}      year: 'numeric',

                            <div className="bg-orange-50 px-3 py-2 rounded-lg border border-orange-200 text-center">      month: 'short',

                              <span className="text-xs font-medium text-orange-700 block">Quantity</span>      day: 'numeric',

                              <p className="text-sm text-orange-800 font-semibold mt-1">{item.quantity} pieces</p>      hour: '2-digit',

                            </div>      minute: '2-digit'

                            <div className="bg-purple-50 px-3 py-2 rounded-lg border border-purple-200 text-center">    });

                              <span className="text-xs font-medium text-purple-700 block">Unit Price</span>  };

                              <p className="text-sm text-purple-800 font-semibold mt-1">{item.price} EGP</p>

                            </div>  if (loading) {

                          </div>    return (

                                <div className="flex items-center justify-center py-16">

                          {/* Total Price */}        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>

                          <div className="mt-3 bg-red-50 px-4 py-3 rounded-lg border border-red-200 text-center">      </div>

                            <span className="text-sm font-medium text-red-700 block">Item Total</span>    );

                            <p className="text-xl font-bold text-red-800 mt-1">{item.price * item.quantity} EGP</p>  }

                          </div>

                        </div>  return (

                      </div>    <div className="space-y-6">

                    </div>      <div className="flex justify-between items-center">

                  ))}        <h2 className="text-2xl font-bold text-gray-800 font-cairo">Manage Orders</h2>

                </div>        <div className="flex items-center gap-4">

              </div>          <div className="text-sm text-gray-600">

            </div>            Total Orders: {orders.length}

          ))}          </div>

        </div>          

      )}

    </div>        </div>

  );      </div>

};

      {orders.length === 0 ? (

export default ManageOrders;        <div className="text-center py-16">
          <svg className="mx-auto w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Found</h3>
          <p className="text-gray-500">Orders will appear here when customers place them</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Order Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 font-cairo">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="text-lg font-bold text-primary">{order.totalAmount} EGP</p>
                      <p className="text-xs text-gray-500">Total Amount</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 font-cairo">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm mb-2"><span className="font-medium text-gray-700">Name:</span> {order.customerName}</p>
                    <p className="text-sm mb-2">
                      <span className="font-medium text-gray-700">Phone 1:</span> 
                      <a href={`tel:${order.customerPhone}`} className="text-blue-600 hover:text-blue-800 underline ml-1">
                        {order.customerPhone}
                      </a>
                    </p>
                    <p className="text-sm mb-2">
                      <span className="font-medium text-gray-700">Phone 2:</span> 
                      {order.alternatePhone && order.alternatePhone.trim() !== '' ? (
                        <a href={`tel:${order.alternatePhone}`} className="text-blue-600 hover:text-blue-800 underline ml-1">
                          {order.alternatePhone}
                        </a>
                      ) : (
                        <span className="text-gray-500 ml-1">Not provided</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Address:</p>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words">{order.customerAddress}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 font-cairo">Order Items</h4>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Product Image */}
                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-300 mx-auto md:mx-0">
                          <img
                            src={item.image && item.image !== 'undefined' && item.image !== null && item.image !== '' ? getImageUrl(item.image) : '/placeholder-image.jpg'}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1">
                          <h5 className="text-lg font-bold text-gray-800 mb-3 font-cairo text-center md:text-left">{item.productName}</h5>
                          
                          {/* Product Info Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {item.color && (
                              <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 text-center">
                                <span className="text-xs font-medium text-blue-700 block">Color</span>
                                <p className="text-sm text-blue-800 font-semibold mt-1">{item.color}</p>
                              </div>
                            )}
                            {item.size && (
                              <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200 text-center">
                                <span className="text-xs font-medium text-green-700 block">Size</span>
                                <p className="text-sm text-green-800 font-semibold mt-1">{item.size}</p>
                              </div>
                            )}
                            <div className="bg-orange-50 px-3 py-2 rounded-lg border border-orange-200 text-center">
                              <span className="text-xs font-medium text-orange-700 block">Quantity</span>
                              <p className="text-sm text-orange-800 font-semibold mt-1">{item.quantity} pieces</p>
                            </div>
                            <div className="bg-purple-50 px-3 py-2 rounded-lg border border-purple-200 text-center">
                              <span className="text-xs font-medium text-purple-700 block">Unit Price</span>
                              <p className="text-sm text-purple-800 font-semibold mt-1">{item.price} EGP</p>
                            </div>
                          </div>
                          
                          {/* Total Price */}
                          <div className="mt-3 bg-red-50 px-4 py-3 rounded-lg border border-red-200 text-center">
                            <span className="text-sm font-medium text-red-700 block">Item Total</span>
                            <p className="text-xl font-bold text-red-800 mt-1">{item.price * item.quantity} EGP</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update and Delete Button */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <label className="text-sm font-medium text-gray-700 font-cairo">Update Status:</label>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
