import React from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-white/30 backdrop-blur-md z-50 transition-all duration-300 ease-out"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-out scale-100 opacity-100"
          style={{
            animation: 'modalSlideIn 0.3s ease-out'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <LogOut className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Konfirmasi Keluar
                </h3>
                <p className="text-sm text-gray-500">
                  Anda akan keluar dari sistem
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start space-x-3 mb-6">
              <div className="flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-gray-700 leading-relaxed">
                  Apakah Anda yakin ingin keluar dari sistem? 
                  <br />
                  <span className="text-sm text-gray-500">
                    Semua data yang belum disimpan akan hilang.
                  </span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2.5 text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 shadow-lg hover:shadow-xl"
              >
                Ya, Keluar
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Anda sedang login sebagai admin</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default LogoutConfirmModal;
