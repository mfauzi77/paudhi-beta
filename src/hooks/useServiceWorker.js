import { useState, useEffect } from 'react';

const useServiceWorker = () => {
  const [swRegistration, setSwRegistration] = useState(null);
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);
  const [swError, setSwError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Register service worker
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      console.log('🔧 Registering service worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      setSwRegistration(registration);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setSwUpdateAvailable(true);
              console.log('🔄 New service worker available');
            }
          });
        }
      });

      // Handle controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service worker controller changed');
        window.location.reload();
      });

      console.log('✅ Service worker registered successfully');
    } catch (error) {
      console.error('❌ Service worker registration failed:', error);
      setSwError(error.message);
    }
  };

  const updateServiceWorker = () => {
    if (swRegistration && swRegistration.waiting) {
      // Tell the waiting service worker to skip waiting
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setSwUpdateAvailable(false);
    }
  };

  const clearCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('🗑️ All caches cleared');
      }
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
    }
  };

  const getCacheInfo = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const cacheInfo = await Promise.all(
          cacheNames.map(async (cacheName) => {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            return {
              name: cacheName,
              size: keys.length
            };
          })
        );
        return cacheInfo;
      }
      return [];
    } catch (error) {
      console.error('❌ Failed to get cache info:', error);
      return [];
    }
  };

  return {
    swRegistration,
    swUpdateAvailable,
    swError,
    isOnline,
    updateServiceWorker,
    clearCache,
    getCacheInfo
  };
};

export default useServiceWorker;
