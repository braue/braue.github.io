const API_BASE = "https://itunes.apple.com/search";
const CACHE_TTL_SECONDS = 60 * 60 * 12;
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const UPSTREAM_HEADERS = {
  Accept: "application/json, text/javascript, */*",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
};

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  const { request } = event;
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== "GET") {
    return withCors("Method not allowed", { status: 405 });
  }

  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term");
  if (!term) {
    return withCors("Missing term query parameter", { status: 400 });
  }

  const targetUrl = new URL(API_BASE);
  targetUrl.search = searchParams.toString();
  if (!targetUrl.searchParams.has("country")) {
    targetUrl.searchParams.set("country", "US");
  }

  const cacheKey = new Request(targetUrl.toString(), request);
  const cachedResponse = await caches.default.match(cacheKey);
  if (cachedResponse) {
    return withCors(cachedResponse, { headers: { "X-Cache": "HIT" } });
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      headers: UPSTREAM_HEADERS,
      cf: {
        cacheEverything: true,
        cacheTtl: CACHE_TTL_SECONDS,
      },
    });
    const body = await response.text();
    const proxiedResponse = withCors(body, {
      status: response.status,
      headers: response.headers,
    });

    if (response.ok) {
      proxiedResponse.headers.set("Cache-Control", `public, max-age=${CACHE_TTL_SECONDS}`);
      proxiedResponse.headers.set("X-Cache", "MISS");
      event.waitUntil(caches.default.put(cacheKey, proxiedResponse.clone()));
    }

    return proxiedResponse;
  } catch (error) {
    return withCors("Unable to proxy the iTunes request", { status: 502 });
  }
}

function withCors(body, init = {}) {
  const sourceResponse = body instanceof Response ? body : null;
  const headers = new Headers(sourceResponse?.headers);
  new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  Object.entries(CORS_HEADERS).forEach(([key, value]) => headers.set(key, value));
  return new Response(sourceResponse ? sourceResponse.body : body, {
    status: init.status || sourceResponse?.status || 200,
    statusText: init.statusText || sourceResponse?.statusText || "",
    headers,
  });
}
