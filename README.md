# Music Downloader PWA

This repository now hosts **Music Downloader**, a progressive web app that surfaces the top albums and songs for a query, links directly into Tidal or Amazon Music, and already includes a “Download on Lucida” action whenever a streaming link exists. The PWA can live on any phone’s home screen and stays deployable from Linux (no Mac or iPhone needed).

## Features

- Native-feeling interface with search form, cards, and streaming chips.
- Song.link integration for Tidal and Amazon Music URLs.
- “Download on Lucida” button that automatically enables only when a streaming link is present.
- Web App Manifest so Safari/Chrome can add it to the home screen.

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

- The iTunes Search and Song.link APIs are hit directly from the browser, so you do not need a server-side component.
- To update the app, push a new commit to GitHub (or run `git push`), and GitHub Pages will refresh the hosted copy instantly—no action required on your dad’s phone.
