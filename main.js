const searchForm = document.getElementById("searchForm");
const queryInput = document.getElementById("query");
const resultsEl = document.getElementById("results");
const statusEl = document.getElementById("status");
let latestSearchId = 0;
const SONG_LINK_PROXY_URL = (window.SONGLINK_PROXY_URL || "").trim();

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runSearch(queryInput.value);
});

queryInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && queryInput.value.trim()) {
    event.preventDefault();
  }
});

async function runSearch(rawQuery) {
  const query = rawQuery.trim();
  latestSearchId += 1;
  const searchId = latestSearchId;

  if (!query) {
    statusEl.textContent = "Please type an artist, album, or song.";
    resultsEl.innerHTML = "";
    return;
  }

  statusEl.textContent = "Searching…";
  resultsEl.innerHTML = "";

  try {
    const { albums, songs } = await searchItunes(query);
    if (searchId !== latestSearchId) return;

    const hasResults = albums.length || songs.length;
    if (!hasResults) {
      statusEl.textContent = `No results for “${query}”.`;
      return;
    }

    statusEl.textContent = `Top results for “${query}”`;
    renderResults({ albums, songs });
  } catch (error) {
    statusEl.textContent = error.message || "Something went wrong.";
  }
}

async function searchItunes(query) {
  const [albums, songs] = await Promise.all([
    fetchItunesEntity(query, "album", 5),
    fetchItunesEntity(query, "song", 5),
  ]);

  return { albums, songs };
}

async function fetchItunesEntity(query, entity, limit) {
  const response = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=${entity}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error("Unable to reach the music service.");
  }

  const data = await response.json();
  const items = (data.results || [])
    .map((item) => buildItem(entity, item))
    .filter(Boolean);

  return Promise.all(
    items.map(async (item) => {
      const links = await fetchLinks(item.sourceUrl);
      const primaryLink = links.tidal || links.amazon;
      return {
        ...item,
        ...links,
        lucida: primaryLink
          ? `https://lucida.to/?url=${encodeURIComponent(primaryLink)}`
          : null,
      };
    })
  );
}

function buildItem(entity, item) {
  const sourceUrl =
    entity === "album" ? item.collectionViewUrl : item.trackViewUrl || item.collectionViewUrl;
  const name =
    entity === "album" ? item.collectionName : item.trackName || item.collectionName;
  if (!item.artistName || !name || !sourceUrl) {
    return null;
  }

  return {
    id: `${entity}-${item.collectionId || item.trackId || Math.random()}`,
    name,
    artist: item.artistName,
    type: entity,
    artwork: item.artworkUrl100?.replace("100x100bb.jpg", "300x300bb.jpg"),
    sourceUrl,
  };
}

async function fetchLinks(sourceUrl) {
  if (!SONG_LINK_PROXY_URL) {
    throw new Error("Song.link proxy not configured. Add window.SONGLINK_PROXY_URL in config.js.");
  }
  try {
    const url = `${SONG_LINK_PROXY_URL}?url=${encodeURIComponent(sourceUrl)}&userCountry=US`;
    const response = await fetch(url);
    if (!response.ok) {
      return { tidal: null, amazon: null };
    }

    const data = await response.json();
    const links = data.linksByPlatform || {};
    return {
      tidal: links.tidal?.url || null,
      amazon: links.amazonMusic?.url || null,
    };
  } catch {
    return { tidal: null, amazon: null };
  }
}

function renderResults({ albums, songs }) {
  resultsEl.innerHTML = "";

  if (albums.length) {
    resultsEl.appendChild(createSection("Albums", albums));
  }

  if (songs.length) {
    resultsEl.appendChild(createSection("Songs", songs));
  }

  if (!albums.length && !songs.length) {
    const empty = document.createElement("p");
    empty.className = "status";
    empty.textContent = "No results found.";
    resultsEl.appendChild(empty);
  }
}

function createSection(title, items) {
  const section = document.createElement("section");
  section.className = "results-section";

  const heading = document.createElement("h2");
  heading.textContent = title;
  section.appendChild(heading);

  items.forEach((item) => section.appendChild(createCard(item)));
  return section;
}

function createCard(item) {
  const article = document.createElement("article");
  article.className = "result-card";
  article.dataset.type = item.type;

  const header = document.createElement("header");
  const img = document.createElement("img");
  img.src = item.artwork || "/icons/icon-192.png";
  img.alt = `${item.name} artwork`;
  img.loading = "lazy";

  const info = document.createElement("div");
  const typeLabel = document.createElement("p");
  typeLabel.className = "type";
  typeLabel.textContent = item.type;
  const heading = document.createElement("h2");
  heading.textContent = item.name;
  const artist = document.createElement("p");
  artist.textContent = item.artist;

  info.append(typeLabel, heading, artist);

  const links = document.createElement("div");
  links.className = "links";

  const streamingChips = document.createElement("div");
  streamingChips.className = "chips-row";
  streamingChips.append(linkChip("Tidal", item.tidal), linkChip("Amazon Music", item.amazon));
  links.append(streamingChips);

  const downloadBtn = document.createElement("button");
  downloadBtn.type = "button";
  downloadBtn.className = "chip download";
  downloadBtn.textContent = "⬇️ Download on Lucida";
  if (item.lucida) {
    downloadBtn.dataset.lucida = item.lucida;
  } else {
    downloadBtn.disabled = true;
    downloadBtn.classList.add("ghost");
    downloadBtn.textContent = "Download unavailable";
  }

  links.appendChild(downloadBtn);

  header.append(img, info);
  article.append(header, links);
  return article;
}

function linkChip(title, url) {
  if (!url) {
    const ghost = document.createElement("button");
    ghost.type = "button";
    ghost.className = "chip ghost";
    ghost.textContent = `${title} unavailable`;
    ghost.disabled = true;
    return ghost;
  }

  const link = document.createElement("a");
  link.className = "chip";
  link.href = url;
  link.target = "_blank";
  link.rel = "noreferrer";

  const span = document.createElement("span");
  span.textContent = title;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("viewBox", "0 0 24 24");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "M14.7 9.3a1 1 0 0 1 1.41 0l3.59 3.6a1 1 0 0 1 0 1.41l-3.59 3.59a1 1 0 0 1-1.41-1.41L16.17 14H9a5 5 0 0 1 0-10h1a1 1 0 0 1 0 2H9a3 3 0 0 0 0 6h7.17l-1.46-1.46a1 1 0 0 1 0-1.41z"
  );
  svg.appendChild(path);

  link.append(span, svg);
  return link;
}

document.addEventListener("click", (event) => {
  const button = event.target.closest(".download");
  if (!button || button.disabled) {
    return;
  }
  const lucidaUrl = button.dataset.lucida;
  if (!lucidaUrl) {
    return;
  }
  window.open(lucidaUrl, "_blank", "noopener,noreferrer");
});
