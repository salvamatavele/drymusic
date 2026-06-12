/* DryMusic service worker: app shell + media offline com suporte a Range. */
const SHELL_CACHE = "shell-v1";
const MEDIA_CACHE = "media-v1";

const STREAM_RE = /^\/api\/media\/[^/]+\/stream$/;
const COVER_RE = /^\/api\/media\/[^/]+\/cover$/;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(["/downloads"]))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL_CACHE && k !== MEDIA_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function cacheKey(request) {
  const url = new URL(request.url);
  return url.origin + url.pathname;
}

/** Responde a partir de uma resposta completa em cache, com slicing 206. */
async function serveMediaFromCache(request) {
  const cached = await caches.match(cacheKey(request), {
    cacheName: MEDIA_CACHE,
  });
  if (!cached) return null;

  const rangeHeader = request.headers.get("range");
  if (!rangeHeader) return cached.clone();

  const blob = await cached.blob();
  const size = blob.size;
  const m = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
  if (!m || (!m[1] && !m[2])) {
    return new Response(null, {
      status: 416,
      headers: { "content-range": `bytes */${size}` },
    });
  }
  let start, end;
  if (m[1]) {
    start = Number(m[1]);
    end = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
  } else {
    start = Math.max(size - Number(m[2]), 0);
    end = size - 1;
  }
  if (start >= size || start > end) {
    return new Response(null, {
      status: 416,
      headers: { "content-range": `bytes */${size}` },
    });
  }
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: {
      "content-type": cached.headers.get("content-type") || "application/octet-stream",
      "content-range": `bytes ${start}-${end}/${size}`,
      "content-length": String(end - start + 1),
      "accept-ranges": "bytes",
    },
  });
}

async function handleStream(event) {
  const fromCache = await serveMediaFromCache(event.request);
  if (fromCache) return fromCache;
  return fetch(event.request);
}

async function handleCover(event) {
  const cached = await caches.match(cacheKey(event.request), {
    cacheName: MEDIA_CACHE,
  });
  if (cached) return cached.clone();
  return fetch(event.request);
}

async function handleStatic(event) {
  const cached = await caches.match(event.request, { cacheName: SHELL_CACHE });
  if (cached) return cached;
  const res = await fetch(event.request);
  if (res.ok) {
    const cache = await caches.open(SHELL_CACHE);
    cache.put(event.request, res.clone());
  }
  return res;
}

async function handleNavigation(event) {
  try {
    const res = await fetch(event.request);
    // não cachear redirects (ex.: estado deslogado) nem erros
    if (res.ok && res.type === "basic" && !res.redirected) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(cacheKey(event.request), res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(cacheKey(event.request), {
      cacheName: SHELL_CACHE,
    });
    if (cached) return cached;
    const downloads = await caches.match(
      new URL("/downloads", self.location.origin).href,
      { cacheName: SHELL_CACHE },
    );
    if (downloads) return downloads;
    return new Response("Offline", { status: 503 });
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (STREAM_RE.test(url.pathname)) {
    event.respondWith(handleStream(event));
    return;
  }
  if (COVER_RE.test(url.pathname)) {
    event.respondWith(handleCover(event));
    return;
  }
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/")
  ) {
    event.respondWith(handleStatic(event));
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(event));
    return;
  }
  // restantes /api/* GET: rede apenas
});
