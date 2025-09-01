// Service Worker for Mobile Dev Agent Interface
// Provides offline functionality and caching

const CACHE_NAME = 'dev-agent-mobile-v1';
const urlsToCache = [
    '/',
    '/phone_dev_agent.html',
    // Add other static assets as needed
];

// Install event - cache resources
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Dev Agent Mobile: Cache opened');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', function(event) {
    // Only handle GET requests to our own domain
    if (event.request.method !== 'GET' || 
        !event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Return cached version if available
                if (response) {
                    return response;
                }
                
                // Otherwise fetch from network
                return fetch(event.request).then(function(response) {
                    // Don't cache API calls or if response is not ok
                    if (!response || response.status !== 200 || 
                        event.request.url.includes('/api/') ||
                        event.request.url.includes(':8889')) {
                        return response;
                    }
                    
                    // Clone response for caching
                    var responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
            .catch(function() {
                // Return offline message for API calls when offline
                if (event.request.url.includes('localhost:8889')) {
                    return new Response(
                        JSON.stringify({
                            error: 'Offline',
                            message: 'Dev agent is currently offline'
                        }), 
                        {
                            headers: { 'Content-Type': 'application/json' }
                        }
                    );
                }
            })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Dev Agent Mobile: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for queued messages when back online
self.addEventListener('sync', function(event) {
    if (event.tag === 'dev-agent-message') {
        event.waitUntil(processQueuedMessages());
    }
});

function processQueuedMessages() {
    // This would process any messages that were queued while offline
    // Implementation depends on your specific offline strategy
    return Promise.resolve();
}