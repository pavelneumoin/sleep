const CACHE_NAME = 'sonotracker-v5';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/login.html',
    '/register.html',
    '/sleep-phases.html',
    '/sleep-quiz.html',
    '/sleep-science.html',
    '/sleep-statistics.html',
    '/sleep-tips.html',
    '/ai-helper.html',
    '/relax.html',
    '/parent.html',
    '/css/styles.css',
    '/js/api.js',
    '/js/main.js',
    '/js/tracker.js',
    '/js/gamification.js',
    '/js/quiz.js',
    '/js/statistics.js',
    '/js/ai-helper.js',
    '/js/parent.js',
    '/manifest.json'
];

self.addEventListener('install', event => {
    // Принудительно устанавливаем новую версию, не ожидая закрытия старых вкладок
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching all assets');
                return Promise.allSettled(
                    ASSETS_TO_CACHE.map(url => cache.add(url).catch(err => console.warn(`[SW] Failed ${url}`)))
                );
            })
    );
});

self.addEventListener('activate', event => {
    // Захватываем все открытые вкладки немедленно
    event.waitUntil(self.clients.claim());
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Removing old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('/api/')) return;

    // Стратегия: Network First, Fallback to Cache
    // Это гарантирует, что при разработке и обновлении вы всегда видите свежую версию файлов!
    event.respondWith(
        fetch(event.request).then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
            }
            
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
            });
            
            return networkResponse;
        }).catch(() => {
            return caches.match(event.request);
        })
    );
});
