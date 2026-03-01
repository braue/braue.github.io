const API_BASE = "https://api.song.link/v1-alpha.1/links";
const API_KEY = globalThis.SONGLINK_API_KEY;

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");
  if (!targetUrl) {
    return new Response("Missing url query parameter", { status: 400 });
  }

  const userCountry = searchParams.get("userCountry") || "US";
  const pluginUrl = new URL(API_BASE);
  pluginUrl.searchParams.set("url", targetUrl);
  pluginUrl.searchParams.set("userCountry", userCountry);

  try {
    const authHeaders = {};
    if (API_KEY) {
      authHeaders.Authorization = `Bearer ${API_KEY}`;
    }

    const response = await fetch(pluginUrl.toString(), {
      headers: authHeaders,
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET");
    responseHeaders.set("Access-Control-Allow-Headers", "Authorization");

    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response("Unable to proxy the Song.link request", { status: 502 });
  }
}
