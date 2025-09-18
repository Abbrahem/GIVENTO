import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getImageUrl } from '../../utils/imageUtils';

function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId, status: newStatus })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order status');
      }

      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));

      Swal.fire({
        icon: 'success',
        title: 'Status Updated!',
        text: `Order status changed to ${newStatus}`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err.message || 'Failed to update order status'
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const deleteOrder = async (orderId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This order will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch('/api/orders', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ orderId })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to delete order');
        }

        // Remove from local state
        setOrders(orders.filter(order => order._id !== orderId));

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Order has been deleted.',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (err) {
        console.error('Error deleting order:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: err.message || 'Failed to delete order'
        });
      }
    }
  };

  const deleteAllOrders = async () => {
    const result = await Swal.fire({
      title: 'Delete All Orders?',
      text: 'This will permanently delete ALL orders! This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete all!',
      input: 'text',
      inputPlaceholder: 'Type "DELETE ALL" to confirm',
      inputValidator: (value) => {
        if (value !== 'DELETE ALL') {
          return 'You must type "DELETE ALL" to confirm';
        }
      }
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch('/api/orders', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ deleteAll: true })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to delete all orders');
        }

        // Clear local state
        setOrders([]);

        Swal.fire({
          icon: 'success',
          title: 'All Orders Deleted!',
          text: 'All orders have been permanently deleted.',
          timer: 3000,
          showConfirmButton: false
        });
      } catch (err) {
        console.error('Error deleting all orders:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: err.message || 'Failed to delete all orders'
        });
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-purple-100 text-purple-800 border-purple-200',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2 font-cairo">No Orders Found</h3>
          <p className="text-gray-600 mb-6 font-cairo">There are currently no orders in the system.</p>
          <button
            onClick={fetchOrders}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-cairo"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-cairo">Orders Management</h1>
          <p className="text-gray-600 font-cairo">Total Orders: {orders.length}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-cairo flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
          {orders.length > 0 && (
            <button
              onClick={deleteAllOrders}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-cairo flex items-center space-x-2"
            >
              <span>🗑️</span>
              <span>Delete All</span>
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Order Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 font-cairo">
                    Order #{order._id.slice(-6).toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-600 font-cairo">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)} font-cairo`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <button
                    onClick={() => deleteOrder(order._id)}
                    className="text-red-600 hover:text-red-800 transition-colors p-1"
                    title="Delete Order"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800 font-cairo mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <p className="font-cairo">
                      <span className="font-medium text-gray-700">Name:</span>
                      <span className="ml-2 text-gray-900">{order.customerName}</span>
                    </p>
                    <p className="font-cairo">
                      <span className="font-medium text-gray-700">Phone:</span>
                      <span className="ml-2 text-gray-900">{order.customerPhone}</span>
                    </p>
                    {order.customerPhone2 && (
                      <p className="font-cairo">
                        <span className="font-medium text-gray-700">Phone 2:</span>
                        <span className="ml-2 text-gray-900">{order.customerPhone2}</span>
                      </p>
                    )}
                    <p className="font-cairo">
                      <span className="font-medium text-gray-700">Address:</span>
                      <span className="ml-2 text-gray-900">{order.customerAddress}</span>
                    </p>
                  </div>
                </div>

                {/* Order Status Management */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 font-cairo mb-3">Order Status</h3>
                  <div className="space-y-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      disabled={updatingStatus === order._id}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-cairo"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {updatingStatus === order._id && (
                      <p className="text-sm text-blue-600 font-cairo">Updating status...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 font-cairo mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      {/* Product Image */}
                      <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={getImageUrl(item.productImage)}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 font-cairo">{item.productName}</h4>
                        <div className="flex flex-wrap items-center space-x-4 mt-1 text-sm text-gray-600 font-cairo">
                          {item.size && (
                            <span className="bg-white px-2 py-1 rounded border">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="bg-white px-2 py-1 rounded border">
                              Color: {item.color}
                            </span>
                          )}
                          <span className="bg-white px-2 py-1 rounded border">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-medium text-gray-800 font-cairo">
                          {item.price} EGP × {item.quantity}
                        </p>
                        <p className="text-lg font-bold text-primary font-cairo">
                          {item.price * item.quantity} EGP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-end">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-800 font-cairo">
                      Total Amount:
                    </p>
                    <p className="text-2xl font-bold text-primary font-cairo">
                      {order.totalAmount} EGP
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageOrders;