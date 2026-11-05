import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Memuat...', 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Outer Ring */}
        <motion.div 
          className={`${sizeClasses[size]} border-4 border-blue-100 rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        {/* Animated Arc */}
        <motion.div 
          className={`${sizeClasses[size]} border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full absolute top-0 left-0`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      {text && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium text-slate-600 mt-4 tracking-wide"
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-8 shadow-2xl flex items-center justify-center min-w-[200px]"
        >
          {spinner}
        </motion.div>
      </motion.div>
    );
  }

  return spinner;
};

export default LoadingSpinner; 