import React from 'react';
import { RefreshCw, X, Wifi, WifiOff } from 'lucide-react';
import useServiceWorker from '../hooks/useServiceWorker';

const ServiceWorkerUpdate = () => {
  const { 
    swUpdateAvailable, 
    updateServiceWorker, 
    isOnline,
    swError 
  } = useServiceWorker();

  // Don't render if no update available and no errors
  if (!swUpdateAvailable && !swError && isOnline) {
    return null;
  }

  return (
    <>
      {/* Update Available Notification */}
      {swUpdateAvailable && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <div>
                <h4 className="font-semibold">Update Tersedia</h4>
                <p className="text-sm text-blue-100">
                  Versi baru aplikasi siap diinstal
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={updateServiceWorker}
                className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Update
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-orange-500 text-white p-3 rounded-lg shadow-lg z-50 animate-slide-down">
          <div className="flex items-center space-x-3">
            <WifiOff className="w-5 h-5" />
            <div>
              <h4 className="font-semibold">Mode Offline</h4>
              <p className="text-sm text-orange-100">
                Beberapa fitur mungkin terbatas
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Online Indicator */}
      {isOnline && swUpdateAvailable === false && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-green-500 text-white p-3 rounded-lg shadow-lg z-50 animate-slide-down">
          <div className="flex items-center space-x-3">
            <Wifi className="w-5 h-5" />
            <div>
              <h4 className="font-semibold">Koneksi Online</h4>
              <p className="text-sm text-green-100">
                Semua fitur tersedia
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Service Worker Error */}
      {swError && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <X className="w-5 h-5" />
              <div>
                <h4 className="font-semibold">Service Worker Error</h4>
                <p className="text-sm text-red-100">
                  {swError}
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-700 hover:bg-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Custom CSS untuk animasi */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ServiceWorkerUpdate;
