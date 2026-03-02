const API_BASE = "https://itunes.apple.com/search";

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term");
  if (!term) {
    return new Response("Missing term query parameter", { status: 400 });
  }

  const targetUrl = new URL(API_BASE);
  targetUrl.search = searchParams.toString();

  try {
    const response = await fetch(targetUrl.toString());
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET");
    responseHeaders.set("Access-Control-Allow-Headers", "Content-Type");

    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response("Unable to proxy the iTunes request", { status: 502 });
  }
}
