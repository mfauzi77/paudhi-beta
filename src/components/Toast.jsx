import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose, 
  show = false 
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    }
  }, [show]);

  const getToastStyles = () => {
    const baseStyles = "max-w-sm w-full transform transition-all duration-300 ease-in-out rounded-lg shadow-lg";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-gradient-to-r from-emerald-500 to-green-600 text-white`;
      case 'error':
        return `${baseStyles} bg-gradient-to-r from-red-500 to-pink-600 text-white`;
      case 'warning':
        return `${baseStyles} bg-gradient-to-r from-yellow-500 to-orange-600 text-white`;
      case 'loading':
        return `${baseStyles} bg-gradient-to-r from-blue-500 to-indigo-600 text-white`;
      default:
        return `${baseStyles} bg-gradient-to-r from-blue-500 to-purple-600 text-white`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center p-4 rounded-lg">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="flex-shrink-0 ml-3 text-white hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Toast Container untuk multiple toasts
export const ToastContainer = ({ toasts = [], onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div key={toast.id} className="animate-fadeIn">
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            show={toast.show}
            onClose={() => onRemove?.(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

// Hook untuk menggunakan toast
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration, show: true };
    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message, duration = 5000) => showToast(message, 'success', duration);
  const error = (message, duration = 5000) => showToast(message, 'error', duration);
  const warning = (message, duration = 5000) => showToast(message, 'warning', duration);
  const info = (message, duration = 5000) => showToast(message, 'info', duration);
  const loading = (message, duration = 3000) => showToast(message, 'loading', duration);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
    loading
  };
};

export default Toast; 