/* Offline support: keeps the app's own files on the device. */
const CACHE = "becoming-v3";
const FILES = [
  "./", "index.html", "manifest.webmanifest", "css/app.css",
  "js/content.js", "js/growth.js", "js/store.js", "js/art.js", "js/pad.js", "js/app.js",
  "fonts/Fraunces-Italic.woff2", "fonts/Fraunces-LightItalic.woff2", "fonts/Fraunces-SemiBold.woff2",
  "fonts/DMSans-Regular.woff2", "fonts/DMSans-Medium.woff2", "fonts/DMSans-Bold.woff2",
  "fonts/Caveat-Medium.woff2", "fonts/Caveat-Bold.woff2",
  "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-32.png"
];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  // Network first so updates arrive; fall back to the saved copy offline.
  e.respondWith(
    fetch(e.request, { cache: "no-store" }).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("index.html")))
  );
});
