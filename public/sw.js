// A new cache version removes previously cached API responses on activation.
const STATIC_CACHE = 'paud-hi-static-v1.0.3';
const DYNAMIC_CACHE = 'paud-hi-dynamic-v1.0.3';

const STATIC_ASSETS = [
  '/index.html',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(STATIC_CACHE);
      for (const url of STATIC_ASSETS) {
        const resp = await fetch(url, { cache: 'no-cache' });
        if (!resp.ok) throw new Error(`Failed to fetch ${url}: ${resp.status}`);
        await cache.put(url, resp.clone());
      }
      await self.skipWaiting();
    } catch (error) {
      console.error('❌ Failed to cache static assets:', error);
    }
  })());
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API and authenticated responses must never be replayed from a shared cache.
  if (isApiRequest(request) || request.headers.has('Authorization')) {
    return;
  }

  // 1. CRITICAL BYPASS: Jangan biarkan Service Worker menyentuh API Gemini
  // Ini mencegah "Zombi Request" dan retry otomatis yang menyebabkan limit 429
  if (url.hostname.includes('generativelanguage.googleapis.com')) {
    return; // Browser menangani request ini secara langsung
  }

  // Skip non-GET dan non-http requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Skip development scripts
  if (url.pathname.includes('.jsx') || (url.pathname.includes('.js') && !url.pathname.includes('node_modules'))) {
    return;
  }

  // Routing Strategy
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    const networkResponse = await fetch(request, { cache: 'no-cache' });
    if (networkResponse.ok) {
      const ct = networkResponse.headers.get('content-type') || '';
      if (!ct.includes('text/html')) {
        const cache = await caches.open(cacheName);
        await cache.put(request, networkResponse.clone());
      }
    }
    return networkResponse;
  } catch (error) {
    return new Response('Network error', { status: 503 });
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request, { cache: 'no-cache' });
    if (networkResponse.ok) {
      const ct = networkResponse.headers.get('content-type') || '';
      // Pastikan API eksternal (selain Gemini) tidak di-cache jika berupa HTML
      if (!ct.includes('text/html')) {
        const cache = await caches.open(cacheName);
        await cache.put(request, networkResponse.clone());
      }
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    if (request.mode === 'navigate') return caches.match('/index.html');
    return new Response('Offline', { status: 503 });
  }
}

// Message handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
