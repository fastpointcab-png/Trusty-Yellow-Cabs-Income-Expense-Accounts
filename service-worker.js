self.addEventListener("install", () => {
  console.log("Service Worker Installed");
});

self.addEventListener("activate", () => {
  console.log("Service Worker Activated");
});

// Basic offline cache example (optional)
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request).catch(() => caches.match("/offline.html")));
});
