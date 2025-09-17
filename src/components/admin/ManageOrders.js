import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getApiUrl, API_ENDPOINTS } from '../../config/api';
import { getImageUrl } from '../../utils/imageUtils';
import { makeAuthenticatedRequest, getValidToken } from '../../utils/auth';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('🔍 Fetching orders...');
      
      const result = await makeAuthenticatedRequest(getApiUrl(API_ENDPOINTS.ORDERS));
      
      if (!result.success) {
        if (result.requiresLogin) {
          setOrders([]);
          return;
        }
        throw new Error('Failed to fetch orders');
      }
      
      const data = await result.response.json();
      console.log('📊 Orders data:', data);
      
      // Filter out orders with invalid IDs on frontend as well
      const validOrders = Array.isArray(data) ? data.filter(order => 
        order._id && order._id.length === 24 && /^[0-9a-fA-F]{24}$/.test(order._id)
      ) : [];
      
      console.log('✅ Valid orders found:', validOrders.length);
      setOrders(validOrders);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      setOrders([]);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to load orders. Please try again.',
        icon: 'error',
        confirmButtonColor: '#b71c1c'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const result = await makeAuthenticatedRequest(getApiUrl(`${API_ENDPOINTS.ORDER_BY_ID(orderId)}/status`), {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      if (result.success) {
        fetchOrders(); // Refresh orders
        Swal.fire({
          title: 'Success!',
          text: 'Order status updated successfully',
          icon: 'success',
          confirmButtonColor: '#b71c1c'
        });
      } else if (result.requiresLogin) {
        return; // Auth utility already showed the message
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update order status. Please try again.',
        icon: 'error',
        confirmButtonColor: '#b71c1c'
      });
    }
  };

  const deleteOrder = async (orderId) => {
    const result = await Swal.fire({
      title: 'Delete Order?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const deleteResult = await makeAuthenticatedRequest(getApiUrl(API_ENDPOINTS.ORDER_BY_ID(orderId)), {
          method: 'DELETE'
        });

        if (deleteResult.success) {
          fetchOrders(); // Refresh orders
          Swal.fire({
            title: 'Deleted!',
            text: 'Order has been deleted successfully',
            icon: 'success',
            confirmButtonColor: '#b71c1c'
          });
        } else if (deleteResult.requiresLogin) {
          return; // Auth utility already showed the message
        } else {
          throw new Error('Failed to delete order');
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete order. Please try again.',
          icon: 'error',
          confirmButtonColor: '#b71c1c'
        });
      }
    }
  };

  const cleanupInvalidOrders = async () => {
    const result = await Swal.fire({
      title: 'Clean Database?',
      text: 'This will remove all orders with invalid IDs. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, clean it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const cleanupResult = await makeAuthenticatedRequest(getApiUrl('/api/orders/cleanup'), {
          method: 'DELETE'
        });

        if (cleanupResult.success) {
          const data = await cleanupResult.response.json();
          fetchOrders(); // Refresh orders
          Swal.fire({
            title: 'Cleanup Complete!',
            text: `${data.deletedCount} invalid orders were removed from the database.`,
            icon: 'success',
            confirmButtonColor: '#b71c1c'
          });
        } else if (cleanupResult.requiresLogin) {
          return; // Auth utility already showed the message
        } else {
          throw new Error('Failed to cleanup database');
        }
      } catch (error) {
        console.error('Error cleaning up orders:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to cleanup database. Please try again.',
          icon: 'error',
          confirmButtonColor: '#b71c1c'
        });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 font-cairo">Manage Orders</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Total Orders: {orders.length}
          </div>
          <button
            onClick={cleanupInvalidOrders}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clean Database
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
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
                  
                  {/* Delete Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => deleteOrder(order._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Order
                    </button>
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
