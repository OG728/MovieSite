const API_BASE = "https://vidsrc.to/vapi";
const MAX_PAGES = 25;

const API_TYPE_MAP = {
  movie: "movie",
  tv: "tv",
};


const FALLBACK_MOVIES = [
  { title: "Inception", description: "A thief who steals corporate secrets through dream-sharing technology is given one impossible task.", poster: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg", imdbId: "tt1375666", tmdbId: 27205, type: "movie" },
  { title: "Interstellar", description: "A team travels through a wormhole in space in an attempt to ensure humanity's survival.", poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", imdbId: "tt0816692", tmdbId: 157336, type: "movie" },
  { title: "The Dark Knight", description: "Batman faces the Joker, a criminal mastermind who pushes Gotham toward chaos.", poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", imdbId: "tt0468569", tmdbId: 155, type: "movie" },
];

const FALLBACK_TV = [
  { title: "Breaking Bad", description: "A chemistry teacher turned meth producer navigates danger, power, and family fallout.", poster: "https://image.tmdb.org/t/p/w500/eSzpy96DwBujGFj0xMbXBcGcfxX.jpg", imdbId: "tt0903747", tmdbId: 1396, type: "tv" },
  { title: "Game of Thrones", description: "Noble families wage war for control of Westeros while ancient threats gather.", poster: "https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg", imdbId: "tt0944947", tmdbId: 1399, type: "tv" },
  { title: "Stranger Things", description: "A group of kids uncover dark experiments and supernatural forces in their small town.", poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg", imdbId: "tt4574334", tmdbId: 66732, type: "tv" },
];

const FALLBACK_POSTER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 750'><rect width='100%' height='100%' fill='#0b1420'/><text x='50%' y='50%' fill='#8ea0bb' dominant-baseline='middle' text-anchor='middle' font-size='28' font-family='Arial'>No Poster</text></svg>`
  );

function getExternalId(item) {
  return item.imdbId || item.tmdbId;
}

function buildWatchPageUrl(type, item) {
  const params = new URLSearchParams({
    type,
    id: String(getExternalId(item)),
    title: item.title,
    description: item.description,
  });

  return `player.html?${params.toString()}`;
}

function normalizePoster(path) {
  if (!path) {
    return FALLBACK_POSTER;
  }

  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:image")) {
    return path;
  }

  return `https://image.tmdb.org/t/p/w500${path}`;
}

function normalizeItem(raw, type) {
  const title = raw.title || raw.name || raw.original_title || raw.original_name;
  const imdbId = raw.imdb_id || raw.imdbId || raw.imdb || null;
  const tmdbId = raw.tmdb_id || raw.tmdbId || raw.id || null;

  if (!title || (!imdbId && !tmdbId)) {
    return null;
  }

  return {
    title,
    description: raw.overview || raw.description || "No description available.",
    poster: normalizePoster(raw.poster || raw.poster_path || raw.image || raw.backdrop_path),
    tmdbId,
    imdbId,
    type,
  };
}

function extractListFromResponse(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.result)) {
    return payload.result;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

async function fetchCatalogPage(type, page) {
  const apiType = API_TYPE_MAP[type];
  const url = page > 1 ? `${API_BASE}/${apiType}/new/${page}` : `${API_BASE}/${apiType}/new`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${type} page ${page} (${response.status})`);
  }

  const payload = await response.json();
  const list = extractListFromResponse(payload);

  return list
    .map((item) => normalizeItem(item, type))
    .filter(Boolean);
}

function buildMediaCard(item, template) {
  const node = template.content.firstElementChild.cloneNode(true);
  const title = node.querySelector(".media-title");
  const description = node.querySelector(".media-description");
  const poster = node.querySelector(".poster");
  const watchLink = node.querySelector(".watch-link");
  const posterButton = node.querySelector(".poster-button");

  if (!title || !description || !poster || !watchLink || !posterButton) {
    return node;
  }

  const watchUrl = buildWatchPageUrl(item.type, item);

  title.textContent = item.title;
  description.textContent = item.description;
  poster.src = item.poster;
  poster.alt = `${item.title} poster`;
  watchLink.href = watchUrl;

  posterButton.addEventListener("click", () => {
    window.location.href = watchUrl;
  });

  return node;
}

function renderList(items, target, template) {
  if (!target) {
    return;
  }

  const cards = items.map((item) => buildMediaCard(item, template));
  target.replaceChildren(...cards);
}

function filterItems(items, query) {
  if (!query) {
    return items;
  }

  return items.filter(
    (item) => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
  );
}

function dedupeById(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.type}:${item.imdbId || item.tmdbId}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function createCatalogState(type) {
  return {
    type,
    page: 0,
    exhausted: false,
    loading: false,
    items: [],
  };
}

async function loadNextPage(state) {
  if (state.loading || state.exhausted) {
    return;
  }

  if (state.page >= MAX_PAGES) {
    state.exhausted = true;
    return;
  }

  state.loading = true;
  const nextPage = state.page + 1;

  try {
    const pageItems = await fetchCatalogPage(state.type, nextPage);
    state.page = nextPage;

    if (pageItems.length === 0) {
      state.exhausted = true;
      return;
    }

    state.items = dedupeById([...state.items, ...pageItems]);
  } finally {
    state.loading = false;
  }
}

async function ensureSearchCoverage(state, query) {
  if (!query) {
    return;
  }

  let filtered = filterItems(state.items, query);

  while (filtered.length < 18 && !state.exhausted && state.page < MAX_PAGES) {
    await loadNextPage(state);
    filtered = filterItems(state.items, query);
  }
}

function updateLoadMoreButton(button, state) {
  if (!button) {
    return;
  }

  button.disabled = state.loading || state.exhausted;
  button.textContent = state.exhausted ? "No more results" : state.loading ? "Loading…" : "Load more";
}

async function initHomePage(template, statusEl, searchEl) {
  const latestMoviesGrid = document.getElementById("latest-movies-grid");
  const latestTvGrid = document.getElementById("latest-tv-grid");

  if (!latestMoviesGrid || !latestTvGrid) {
    return;
  }

  const movieState = createCatalogState("movie");
  const tvState = createCatalogState("tv");

  try {
    await Promise.all([loadNextPage(movieState), loadNextPage(tvState)]);
    const render = (query) => {
      const latestMovies = filterItems(movieState.items, query).slice(0, 8);
      const latestTv = filterItems(tvState.items, query).slice(0, 8);
      renderList(latestMovies, latestMoviesGrid, template);
      renderList(latestTv, latestTvGrid, template);
      statusEl.textContent = `Home: ${latestMovies.length} latest movie${latestMovies.length === 1 ? "" : "s"} and ${latestTv.length} latest TV show${latestTv.length === 1 ? "" : "s"}.`;
    };

    render("");
    searchEl.addEventListener("input", async (event) => {
      const query = event.target.value.trim().toLowerCase();
      await Promise.all([ensureSearchCoverage(movieState, query), ensureSearchCoverage(tvState, query)]);
      render(query);
    });
  } catch {
    movieState.items = FALLBACK_MOVIES;
    tvState.items = FALLBACK_TV;
    renderList(movieState.items, latestMoviesGrid, template);
    renderList(tvState.items, latestTvGrid, template);
    statusEl.textContent = "API unavailable right now. Showing fallback catalog.";
  }
}

async function initSingleTypePage(type, gridId, template, statusEl, searchEl, loadMoreButton) {
  const grid = document.getElementById(gridId);
  if (!grid) {
    return;
  }

  const state = createCatalogState(type);

  const render = (query) => {
    const filtered = filterItems(state.items, query);
    renderList(filtered, grid, template);

    const label = type === "movie" ? "movie" : "TV show";
    statusEl.textContent = filtered.length
      ? `Showing ${filtered.length} ${label}${filtered.length === 1 ? "" : "s"}. Loaded ${state.items.length} from API.`
      : `No ${label} matches found in loaded results.`;

    updateLoadMoreButton(loadMoreButton, state);
  };

  try {
    await loadNextPage(state);
    render("");

    searchEl.addEventListener("input", async (event) => {
      const query = event.target.value.trim().toLowerCase();
      await ensureSearchCoverage(state, query);
      render(query);
    });

    if (loadMoreButton) {
      loadMoreButton.addEventListener("click", async () => {
        await loadNextPage(state);
        render(searchEl.value.trim().toLowerCase());
      });
    }
  } catch {
    state.items = type === "movie" ? FALLBACK_MOVIES : FALLBACK_TV;
    state.exhausted = true;
    renderList(state.items, grid, template);
    statusEl.textContent = `API unavailable right now. Showing fallback ${type === "movie" ? "movies" : "TV shows"}.`;
    updateLoadMoreButton(loadMoreButton, state);
  }
}

async function initApp() {
  const page = document.body.dataset.page;
  const template = document.getElementById("media-template");
  const searchEl = document.getElementById("search");
  const statusEl = document.getElementById("status");
  const loadMoreButton = document.getElementById("load-more");

  if (!page || !template || !template.content.firstElementChild || !searchEl || !statusEl) {
    return;
  }
}

  if (page === "movies") {
    await initSingleTypePage("movie", "movies-grid", template, statusEl, searchEl, loadMoreButton);
    return;
  }

  if (page === "tv") {
    await initSingleTypePage("tv", "tv-grid", template, statusEl, searchEl, loadMoreButton);
    return;
  }

  await initHomePage(template, statusEl, searchEl);
}

window.addEventListener("DOMContentLoaded", () => {
  initApp();
});
