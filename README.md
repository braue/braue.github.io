# Music Downloader PWA

This repository now hosts **Music Downloader**, a progressive web app that surfaces the top albums and songs for a query, links directly into Tidal or Amazon Music, and already includes a “Download on Lucida” action whenever a streaming link exists. The PWA can live on any phone’s home screen and stays deployable from Linux (no Mac or iPhone needed).

## Features

- Native-feeling interface with search form, cards, and streaming chips.
- Song.link integration for Tidal and Amazon Music URLs.
- “Download on Lucida” button that automatically enables only when a streaming link is present.
- Web App Manifest so Safari/Chrome can add it to the home screen.
- Searches now return the top five albums and the top five songs for a query, keeping the most relevant results while reducing Song.link calls.

## Testing locally

1. Serve the folder with any static server (from repo root):  
   `python3 -m http.server 4173`  
2. Open `http://127.0.0.1:4173` in your browser and try searching for a track or album.  
3. Use the browser dev tools to simulate mobile if desired; reload after each change so the latest `main.js` is used.

## Deploying to GitHub Pages

1. Commit your files to the branch you want to publish.  
2. In your GitHub repo settings under **Pages**, select the branch (e.g., `main`) and root folder.  
3. Wait for GitHub to finish the deploy step (it will print the deployment URL).  
4. Share that URL with your dad; he can open it in Safari, tap **Share → Add to Home Screen**, and the PWA behaves like a standalone app.

## Notes

- The iTunes Search flow will call `window.ITUNES_PROXY_URL` when it’s set (leave it empty to hit Apple directly). Deploy and configure the proxy worker in `workers/itunes-proxy` so you can route around blockers, then update `config.js` with its domain before pushing.
- Song.link already requires a proxy worker; follow the steps in `workers/songlink-proxy/README.md` and keep `window.SONGLINK_PROXY_URL` pointing at that domain.
- To update the app, push a new commit to GitHub (or run `git push`), and GitHub Pages will refresh the hosted copy instantly—no action required on your dad’s phone.

## Configuring the iTunes proxy

1. Deploy the worker in `workers/itunes-proxy` (see that folder’s README for the basic Wrangler workflow). The script proxies the `term`, `entity`, `limit`, and other query parameters straight to `https://itunes.apple.com/search` while adding CORS headers.
2. Update `config.js` so `window.ITUNES_PROXY_URL` points at the worker’s domain (e.g., `https://itunes-search-proxy.your-subdomain.workers.dev`) and push the change.
3. Your GitHub Pages build will now load the proxy URL before `main.js`, and every search will hit your worker instead of calling Apple directly.

## Configuring the Song.link proxy

1. Deploy the sample worker in `workers/songlink-proxy` (or host a similar endpoint) so it can safely attach your Song.link API key (if you have one) and forward the JSON payload. The worker README includes a minimal Cloudflare Wrangler setup plus instructions for `wrangler secret put SONGLINK_API_KEY`.
2. Edit `config.js` so `window.SONGLINK_PROXY_URL` equals your worker’s URL (e.g., `https://my-songlink-proxy.workers.dev`). This script loads before `main.js`, so the client can read the proxy URL at runtime.
3. Commit the updated `config.js` and push. The PWA on GitHub Pages will then call your proxy instead of hitting Song.link directly, and the Tidal/Amazon chips should populate again (expect the public rate limit if no API key is configured on the worker).
