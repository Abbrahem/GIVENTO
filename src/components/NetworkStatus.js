import React, { useState, useEffect, useCallback } from 'react';
import { testApiConnection, tryFallbackUrls } from '../config/api';
import { runNetworkDiagnostics } from '../utils/networkUtils';

const NetworkStatus = ({ onStatusChange }) => {
  const [status, setStatus] = useState({
    isOnline: navigator.onLine,
    apiConnected: null,
    lastCheck: null,
    testing: false
  });

  const checkNetworkStatus = useCallback(async () => {
    setStatus(prev => ({ ...prev, testing: true }));
    
    try {
      // Test API connection
      const apiTest = await testApiConnection();
      
      // Run full diagnostics if API fails
      let diagnostics = null;
      if (!apiTest.success) {
        diagnostics = await runNetworkDiagnostics();
      }
      
      const newStatus = {
        isOnline: navigator.onLine,
        apiConnected: apiTest.success,
        apiData: apiTest.data,
        diagnostics,
        lastCheck: new Date().toLocaleTimeString('ar-EG'),
        testing: false
      };
      
      setStatus(newStatus);
      
      // Notify parent component
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
      
    } catch (error) {
      console.error('Network status check failed:', error);
      setStatus(prev => ({
        ...prev,
        testing: false,
        apiConnected: false,
        lastCheck: new Date().toLocaleTimeString('ar-EG')
      }));
    }
  }, [onStatusChange]);

  useEffect(() => {
    // Initial check
    checkNetworkStatus();
    
    // Listen for online/offline events
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      checkNetworkStatus();
    };
    
    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false, apiConnected: false }));
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Periodic check every 30 seconds
    const interval = setInterval(checkNetworkStatus, 30000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [checkNetworkStatus]);

  const getStatusColor = () => {
    if (status.testing) return 'bg-yellow-500';
    if (!status.isOnline) return 'bg-red-500';
    if (status.apiConnected === false) return 'bg-orange-500';
    if (status.apiConnected === true) return 'bg-green-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (status.testing) return 'جاري الفحص...';
    if (!status.isOnline) return 'غير متصل بالإنترنت';
    if (status.apiConnected === false) return 'خطأ في الاتصال بالخادم';
    if (status.apiConnected === true) return 'متصل';
    return 'غير معروف';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[200px]">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${status.testing ? 'animate-pulse' : ''}`}></div>
          <span className="text-sm font-medium text-gray-700 font-cairo">
            {getStatusText()}
          </span>
        </div>
        
        {status.lastCheck && (
          <div className="text-xs text-gray-500 mt-1 font-cairo">
            آخر فحص: {status.lastCheck}
          </div>
        )}
        
        <div className="flex space-x-2 rtl:space-x-reverse mt-2">
          <button
            onClick={checkNetworkStatus}
            disabled={status.testing}
            className="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-2 py-1 rounded font-cairo"
          >
            {status.testing ? 'جاري الفحص...' : 'فحص الآن'}
          </button>
          
          {status.apiConnected === false && (
            <button
              onClick={() => tryFallbackUrls('/api/health')}
              className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded font-cairo"
            >
              جرب بديل
            </button>
          )}
        </div>
        
        {status.diagnostics && !status.diagnostics.internetConnection && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-cairo">
            ⚠️ مشكلة في الاتصال بالإنترنت
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkStatus;
