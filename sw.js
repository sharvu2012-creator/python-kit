const CACHE = 'python-kit-v38'; // AI-generated quizzes + enriched lessons
const ASSETS = [
'/', '/index.html', '/style.css', '/app.js', '/lessons.js',
'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js'
];

self.addEventListener('install', e => {
e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
self.skipWaiting();
});

self.addEventListener('activate', e => {
e.waitUntil(
caches.keys().then(keys => Promise.all(
keys.filter(k => k !== CACHE).map(k => caches.delete(k))
))
);
self.clients.claim();
});

self.addEventListener('fetch', e => {
if (!e.request.url.startsWith('http')) return; // skip chrome-extension:// etc.
if (e.request.url.includes('/api/')) return; // Never cache API calls
if (e.request.url.includes('/__/auth/')) return; // Never cache Firebase auth handler
e.respondWith(
caches.open(CACHE).then(async c => {
const hit = await c.match(e.request);
if (hit) return hit;
try {
const res = await fetch(e.request);
if (res.ok) c.put(e.request, res.clone());
return res;
} catch { return new Response('Offline', { status: 503 }); }
})
);
});