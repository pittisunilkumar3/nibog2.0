"use client"

/**
 * Register the service worker for PWA functionality and offline support
 */
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').then(
        function(registration) {
          // Service Worker registered successfully (silenced in production)
        },
        function(/* err */) {
          // Service Worker registration failed (suppressed in production)
        }
      );
    });
  }
}

/**
 * Check if the app is being used in standalone mode (installed as PWA)
 */
export function isPWA(): boolean {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  }
  return false;
}
