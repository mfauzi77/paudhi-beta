import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
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

  const value = {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
    loading
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}; 