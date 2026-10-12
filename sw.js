// Offline support. Code and data: network first (fresh when online), cache when offline.
// Audio, photos, fonts and map tiles: cache first.
const VERSION = '2026-10-12b'; // bump to clear old offline copies of the app shell
const SHELL = 'shell-' + VERSION;
const MEDIA = 'media-v1';
const TILES = 'tiles-v1';
const SHELL_FILES = [
  './', 'index.html', 'css/app.css', 'manifest.webmanifest', 'img/icon-192.png',
  'js/app.js', 'js/util.js', 'js/sync.js', 'js/player.js', 'js/weather.js', 'js/ui.js',
  'js/views/days.js', 'js/views/food.js', 'js/views/more.js', 'js/views/expenses.js', 'js/views/settings.js', 'js/views/map.js',
  'data/config.js', 'data/plans.js', 'data/places.js', 'data/info.js', 'data/food.js', 'data/restaurants.js',
  'data/stories.js', 'data/quiz.js', 'data/cheats.js', 'data/mymap.js', 'data/durations.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('shell-') && k !== SHELL).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await Promise.race([fetch(req), new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), 4000))]);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (e) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    fetch(req).then(r => r.ok && cache.put(req, r.clone())).catch(() => {});
    throw e;
  }
}

async function cacheFirst(req, cacheName, limit) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') {
    cache.put(req, res.clone());
    if (limit) cache.keys().then(k => { if (k.length > limit) k.slice(0, k.length - limit).forEach(x => cache.delete(x)); });
  }
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('script.google.com') || url.hostname.endsWith('googleusercontent.com')) return; // shared data: handled by the app
  if (url.origin === location.origin) {
    if (/\.(mp3|webp|jpg|png)$/.test(url.pathname) && !url.pathname.includes('/icon-')) e.respondWith(cacheFirst(req, MEDIA));
    else e.respondWith(networkFirst(req, SHELL));
  } else if (url.hostname === 'tile.openstreetmap.org') {
    e.respondWith(cacheFirst(req, TILES, 3000));
  } else if (/fonts\.(googleapis|gstatic)\.com|unpkg\.com/.test(url.hostname)) {
    e.respondWith(cacheFirst(req, MEDIA));
  }
});
