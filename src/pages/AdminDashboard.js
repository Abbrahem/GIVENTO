import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddProduct from '../components/admin/AddProduct';
import ManageProducts from '../components/admin/ManageProducts';
import ManageOrders from '../components/admin/ManageOrders';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('add-product');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const tabs = [
    { id: 'add-product', label: 'Add Product', icon: '➕', component: AddProduct },
    { id: 'manage-products', label: 'Manage Products', icon: '📦', component: ManageProducts },
    { id: 'manage-orders', label: 'Manage Orders', icon: '📋', component: ManageOrders }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50 font-cairo">
      {/* Header */}
      <header className="bg-white shadow border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 text-sm">Manage your GIVENTO store</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors w-full sm:w-auto"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:space-x-1 space-y-1 sm:space-y-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center sm:justify-start space-x-2 py-4 px-6 border-b-3 sm:border-b-3 border-l-0 sm:border-l-0 font-semibold text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-red-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
