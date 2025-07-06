/**
 * Service Worker for Hydrogen-like Performance
 * Provides advanced caching strategies
 */

const CACHE_NAME = 'dawn-hydrogen-v1';
const STATIC_CACHE = 'dawn-static-v1';
const PAGE_CACHE = 'dawn-pages-v1';
const API_CACHE = 'dawn-api-v1';

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only'
};

// Static assets to cache - using actual paths, not Liquid
const STATIC_ASSETS = [
  // Will be populated dynamically, don't hardcode Liquid paths
];

// API endpoints to cache
const API_PATTERNS = [
  /\/products\.json/,
  /\/collections\/.*\.json/,
  /\/search/,
  /\/cart\.js/
];

// Pages to cache
const PAGE_PATTERNS = [
  /\/$/,
  /\/collections\//,
  /\/products\//,
  /\/pages\//,
  /\/blogs\//
];

self.addEventListener('install', (event) => {
  console.log('💾 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      cleanupOldCaches(),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Only handle same-origin requests
  if (url.origin !== location.origin) return;
  
  // Determine cache strategy
  let strategy = getCacheStrategy(request);
  
  event.respondWith(
    handleRequest(request, strategy)
  );
});

/**
 * Determine cache strategy based on request
 */
function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  // Static assets - cache first
  if (isStaticAsset(url.pathname)) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  // API calls - network first with cache fallback
  if (isApiCall(url.pathname)) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }
  
  // Pages - stale while revalidate
  if (isPageRequest(request)) {
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  }
  
  // Default - network only
  return CACHE_STRATEGIES.NETWORK_ONLY;
}

/**
 * Handle request with appropriate strategy
 */
async function handleRequest(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request);
    
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request);
    
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request);
    
    case CACHE_STRATEGIES.NETWORK_ONLY:
    default:
      return fetch(request);
  }
}

/**
 * Cache first strategy
 */
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('Cache first failed:', error);
    throw error;
  }
}

/**
 * Network first strategy
 */
async function networkFirst(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('Network first fallback to cache:', error);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

/**
 * Stale while revalidate strategy
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(PAGE_CACHE);
  const cached = await cache.match(request);
  
  // Fetch in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(error => {
    console.warn('Background fetch failed:', error);
  });
  
  // Return cached version immediately if available
  if (cached) {
    // Don't await fetchPromise - let it update cache in background
    fetchPromise;
    return cached;
  }
  
  // No cached version, wait for network
  return fetchPromise;
}

/**
 * Check if request is for static asset
 */
function isStaticAsset(pathname) {
  return pathname.startsWith('/assets/') || 
         pathname.endsWith('.css') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.svg') ||
         pathname.endsWith('.png') ||
         pathname.endsWith('.jpg') ||
         pathname.endsWith('.webp') ||
         pathname.includes('shopifycdn.com');
}

/**
 * Check if request is for API
 */
function isApiCall(pathname) {
  return API_PATTERNS.some(pattern => pattern.test(pathname));
}

/**
 * Check if request is for page
 */
function isPageRequest(request) {
  return request.method === 'GET' && 
         request.headers.get('accept')?.includes('text/html');
}

/**
 * Clean up old caches
 */
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const validCaches = [CACHE_NAME, STATIC_CACHE, PAGE_CACHE, API_CACHE];
  
  return Promise.all(
    cacheNames
      .filter(name => !validCaches.includes(name))
      .map(name => caches.delete(name))
  );
}

// Background sync for cart updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'cart-update') {
    event.waitUntil(syncCartUpdates());
  }
});

/**
 * Sync cart updates when online
 */
async function syncCartUpdates() {
  try {
    // Get pending cart updates from IndexedDB
    const updates = await getPendingCartUpdates();
    
    for (const update of updates) {
      try {
        await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(update.data)
        });
        
        // Remove from pending updates
        await removePendingCartUpdate(update.id);
        
      } catch (error) {
        console.warn('Failed to sync cart update:', error);
      }
    }
  } catch (error) {
    console.warn('Cart sync failed:', error);
  }
}

// Message handling for cache management
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  }
  
  if (event.data?.type === 'PRELOAD_PAGES') {
    event.waitUntil(preloadPages(event.data.urls));
  }
});

/**
 * Clear all caches
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(name => caches.delete(name))
  );
}

/**
 * Preload pages
 */
async function preloadPages(urls) {
  const cache = await caches.open(PAGE_CACHE);
  
  return Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.warn(`Failed to preload ${url}:`, error);
      }
    })
  );
}

// IndexedDB helpers for cart sync
async function getPendingCartUpdates() {
  // Implement IndexedDB logic for cart updates
  return [];
}

async function removePendingCartUpdate(id) {
  // Implement IndexedDB logic
}

// Performance monitoring
self.addEventListener('fetch', (event) => {
  // Track performance metrics
  const startTime = performance.now();
  
  event.respondWith(
    handleRequest(event.request, getCacheStrategy(event.request))
      .then(response => {
        const duration = performance.now() - startTime;
        
        // Report to analytics if needed
        if (duration > 1000) {
          console.warn(`Slow request: ${event.request.url} (${duration}ms)`);
        }
        
        return response;
      })
  );
});