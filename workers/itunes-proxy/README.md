# iTunes proxy worker

1. Install [Cloudflare Wrangler](https://developers.cloudflare.com/workers/cli-wrangler/) and log in if you haven’t already.
2. Copy this folder to a worker project (or reuse it directly) and make sure `wrangler.toml` points to `worker.js`.
3. Deploy the worker with `wrangler publish`.
4. The worker listens for the query parameters your app already sends (`term`, `entity`, `limit`, etc.) and forwards them to `https://itunes.apple.com/search` while adding permissive CORS headers.
5. After a successful deploy note the generated domain (for example `https://itunes-search-proxy.example.workers.dev`). Update `config.js` so `window.ITUNES_PROXY_URL` holds that URL.
6. Push the new `config.js` to GitHub so GitHub Pages loads your proxy URL before `main.js` runs.

CORS headers are already configured, so the static site can call this worker from any origin.
