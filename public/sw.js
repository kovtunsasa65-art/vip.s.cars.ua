const CACHE_NAME = 'vips-cars-cache-v1';
const DATA_CACHE_NAME = 'vips-cars-data-cache-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch events
self.addEventListener('fetch', (event) => {
  // Кешування запитів до Supabase (API деталей авто)
  if (event.request.url.includes('/rest/v1/cars')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            if (response.status === 200) {
              // Зберігаємо тільки деталі конкретних авто, не весь каталог
              if (event.request.url.includes('id=eq.')) {
                cache.put(event.request.url, response.clone());
                
                // Обмежуємо кеш до 20 останніх авто
                limitCacheSize(DATA_CACHE_NAME, 20);
              }
            }
            return response;
          })
          .catch(() => {
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  // Звичайне кешування для статики
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Функція для обмеження розміру кешу
function limitCacheSize(name, maxItems) {
  caches.open(name).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(() => limitCacheSize(name, maxItems));
      }
    });
  });
}
