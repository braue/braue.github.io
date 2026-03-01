# Song.link proxy worker

1. Install [Cloudflare Wrangler](https://developers.cloudflare.com/workers/cli-wrangler/) (if needed) and log in.
2. Copy this folder to a new Worker project (or import the script) and add a `wrangler.toml` that points at `workers/songlink-proxy/worker.js`.
3. (Optional) Store your Song.link API key as a secret named `SONGLINK_API_KEY` before deploying; without it the worker will still proxy but you are subject to the public 10 requests/minute rate limit:
   ```bash
   wrangler secret put SONGLINK_API_KEY
   wrangler publish
   ```
4. In your worker's route settings note the generated domain (e.g., `https://my-songlink-proxy.your-subdomain.workers.dev`).
5. Update `config.js` in this repo (or your own copy on GitHub Pages) to assign that domain to `window.SONGLINK_PROXY_URL`.
6. Push the updated `config.js` so GitHub Pages can load the proxy URL before `main.js`.

CORS headers are already configured so the static site can call this worker from any origin.
