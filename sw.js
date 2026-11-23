// Offline support. This worker only stores the app's own files so it opens with no signal.
// It never sees, stores or sends anyone's plan. Bump CACHE when any file changes.
const CACHE = "space-pass-v1";
const ASSETS = [
  "./",
  "index.html",
  "app.css",
  "app.js",
  "manifest.webmanifest",
  "fonts/atkinson-400.woff2",
  "fonts/atkinson-700.woff2",
  "fonts/lexend-500.woff2",
  "fonts/lexend-700.woff2",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).catch(() =>
        e.request.mode === "navigate" ? caches.match("index.html") : Response.error()
      );
    })
  );
});
