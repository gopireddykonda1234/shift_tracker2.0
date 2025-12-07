/* ============================================================
   SERVICE WORKER – SHIFT TRACKER 2.0
   Enables offline support and caching for PWA install.
============================================================ */

const CACHE_NAME = "shift-tracker-v1";
const FILES_TO_CACHE = [
    "index.html",
    "style.css",
    "app.js",
    "payroll.js",
    "settings.js",
    "manifest.json",
    "icons/icon-192.png",
    "icons/icon-512.png"
];

/* INSTALL SERVICE WORKER */
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

/* ACTIVATE SERVICE WORKER */
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

/* FETCH HANDLER */
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return (
                response ||
                fetch(event.request).catch(() =>
                    caches.match("index.html")
                )
            );
        })
    );
});
