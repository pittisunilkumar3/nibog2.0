// Service Worker for NIBOG (v4 - 20261008)
// FIX: network-first for page navigations, never cache /admin, bumped cache version
const CACHE_NAME = 'nibog-cache-v4-20261008';

// Assets to cache immediately on service worker install
const PRECACHE_ASSETS = [
  '/manifest.json',
  '/favicon.ico',
  '/offline.html'
];

// Install event - precache key assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API requests, auth, payments
  if (event.request.url.includes('/api/') ||
      event.request.url.includes('/auth/') ||
      event.request.url.includes('/payments/')) {
    return;
  }

  // NEVER cache admin/superadmin pages - always go to network
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/superadmin')) {
    return;
  }

  const isNavigation = event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') || '').includes('text/html');

  // Network-first for page navigations (fresh HTML, cache as offline fallback)
  if (isNavigation) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.ok) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
        }
        return response;
      }).catch(() => {
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          if ((event.request.headers.get('accept') || '').includes('text/html')) {
            return caches.match('/offline.html');
          }
          throw new Error('Network unavailable');
        });
      })
    );
    return;
  }

  // Cache-first only for static assets (hashed filenames are immutable)
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(response => {
          if (!response.ok) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
          return response;
        });
      })
  );
});
