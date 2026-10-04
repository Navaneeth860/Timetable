const CACHE = "timetable-app-v14";
const ASSETS = ["./", "./index.html", "./style.css", "./data.json", "./manifest.json", "./scripts/time-engine.js", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return Promise.all(
        ASSETS.map(url => {
          return fetch(new Request(url, { cache: "reload" }))
            .then(response => {
              if (!response.ok) throw new Error(`Request failed for ${url}`);
              return cache.put(url, response);
            })
            .catch(err => {
              console.warn(`[SW] Failed to pre-cache ${url}:`, err);
            });
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Stale-while-revalidate strategy for data.json
  if (url.pathname.endsWith("/data.json") || url.pathname.endsWith("data.json")) {
    event.respondWith(
      caches.open(CACHE).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          const fetchPromise = fetch(event.request)
            .then(networkResponse => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {});

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Network-first strategy with ~3s timeout for navigation requests
  if (event.request.mode === "navigate") {
    event.respondWith(
      new Promise(resolve => {
        let timer = setTimeout(() => {
          caches.match("./index.html").then(cached => {
            if (cached) resolve(cached);
          });
        }, 3000);

        fetch(event.request)
          .then(response => {
            clearTimeout(timer);
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put("./index.html", copy));
            resolve(response);
          })
          .catch(() => {
            clearTimeout(timer);
            caches.match("./index.html").then(cached => resolve(cached));
          });
      })
    );
    return;
  }

  // Cache-first fallback for static assets
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});