const VIDSRC_API_BASE = "https://vidsrc.to/vapi";
const TMDB_API_BASE = "https://api.themoviedb.org/3";
const MAX_PAGES = 25;
const REQUEST_TIMEOUT_MS = 8000;

const APP_LOG_PREFIX = "[CineStream]";

// Optional: paste TMDB credentials directly in these constants.
// This is useful if you do not want to set window vars/localStorage manually.
const HARDCODED_TMDB_API_KEY = "";
const HARDCODED_TMDB_BEARER_TOKEN = "";

const TMDB_API_KEY =
  window.CINESTREAM_TMDB_API_KEY ||
  HARDCODED_TMDB_API_KEY ||
  window.localStorage.getItem("tmdb_api_key") ||
  "";

const TMDB_BEARER_TOKEN =
  window.CINESTREAM_TMDB_BEARER_TOKEN ||
  HARDCODED_TMDB_BEARER_TOKEN ||
  window.localStorage.getItem("tmdb_bearer_token") ||
  "";

const LOCAL_MOVIES = [
  ["Inception", "Dream infiltration thriller.", "tt1375666", 27205, "/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg"],
  ["Interstellar", "Space-time survival journey.", "tt0816692", 157336, "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"],
  ["The Dark Knight", "Batman vs Joker.", "tt0468569", 155, "/qJ2tW6WMUDux911r6m7haRef0WH.jpg"],
  ["Parasite", "Class divide thriller.", "tt6751668", 496243, "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg"],
  ["Dune", "Desert planet power struggle.", "tt1160419", 438631, "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg"],
  ["Top Gun: Maverick", "Elite pilot returns.", "tt1745960", 361743, "/62HCnUTziyWcpDaBO2i1DX17ljH.jpg"],
  ["The Matrix", "Reality is a simulation.", "tt0133093", 603, "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg"],
  ["Oppenheimer", "Story of the atomic bomb.", "tt15398776", 872585, "/ptpr0kGAckfQkJeJIt8st5dglvd.jpg"],
  ["Joker", "Origin of Gotham's villain.", "tt7286456", 475557, "/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg"],
  ["Avatar", "Pandora conflict.", "tt0499549", 19995, "/kyeqWdyUXW608qlYkRqosgbbJyK.jpg"],
  ["The Batman", "Detective noir Batman.", "tt1877830", 414906, "/74xTEgt7R36Fpooo50r9T25onhq.jpg"],
  ["Spider-Man: Across the Spider-Verse", "Miles in the multiverse.", "tt9362722", 569094, "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg"],
];

const LOCAL_TV = [
  ["Breaking Bad", "Teacher turns meth kingpin.", "tt0903747", 1396, "/eSzpy96DwBujGFj0xMbXBcGcfxX.jpg"],
  ["Game of Thrones", "Houses battle for the throne.", "tt0944947", 1399, "/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg"],
  ["Stranger Things", "Supernatural mystery in Hawkins.", "tt4574334", 66732, "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg"],
  ["The Last of Us", "Post-apocalyptic survival.", "tt3581920", 100088, "/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg"],
  ["The Bear", "Chef runs family shop.", "tt14452776", 136315, "/sHFlbKS3WLqMnp9t2ghADIJFnuQ.jpg"],
  ["Wednesday", "Addams mystery at academy.", "tt13443470", 119051, "/9PFonBhy4cQy7Jz20NpMygczOkv.jpg"],
  ["Loki", "God of Mischief time chaos.", "tt9140554", 84958, "/voHUmluYmKyleFkTu3lOXQG702u.jpg"],
  ["The Boys", "Corrupt superheroes exposed.", "tt1190634", 76479, "/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg"],
  ["Dark", "Time-bending German mystery.", "tt5753856", 70523, "/5Lo9Hf7v6Y8jVrw4EZvM4p2M4Rq.jpg"],
  ["Chernobyl", "Nuclear disaster dramatization.", "tt7366338", 87108, "/900tHlUYUkp7Ol04XFSoAaEIXcT.jpg"],
  ["Severance", "Work-life memory split.", "tt11280740", 95396, "/x7PzZxgA0xBJ4Qh5i8LhE7l4Y4f.jpg"],
  ["House of the Dragon", "Targaryen civil war.", "tt11198330", 94997, "/z2yahl2uefxDCl0nogcRBstwruJ.jpg"],
];

const FALLBACK_POSTER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 750'><rect width='100%' height='100%' fill='#0b1420'/><text x='50%' y='50%' fill='#8ea0bb' dominant-baseline='middle' text-anchor='middle' font-size='28' font-family='Arial'>No Poster</text></svg>`
  );

function seedToItems(rows, type) {
  return rows.map(([title, description, imdbId, tmdbId, posterPath]) => ({
    title,
    description,
    imdbId,
    tmdbId,
    poster: posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : FALLBACK_POSTER,
    type,
  }));
}

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
  if (!path) return FALLBACK_POSTER;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:image")) return path;
  return `https://image.tmdb.org/t/p/w500${path}`;
}

function normalizeItem(raw, type) {
  const title = raw.title || raw.name || raw.original_title || raw.original_name;
  const imdbId = raw.imdb_id || raw.imdbId || raw.imdb || null;
  const tmdbId = raw.tmdb_id || raw.tmdbId || raw.id || null;

  if (!title || (!imdbId && !tmdbId)) return null;

  return {
    title,
    description: raw.overview || raw.description || "No description available.",
    poster: normalizePoster(raw.poster || raw.poster_path || raw.image || raw.backdrop_path),
    tmdbId,
    imdbId,
    type,
  };
}


function getTmdbRequestHeaders() {
  if (!TMDB_BEARER_TOKEN) {
    return {};
  }

  return {
    Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
  };
}

function hasTmdbCredentials() {
  return Boolean(TMDB_API_KEY || TMDB_BEARER_TOKEN);
}

function logTmdbSetup() {
  if (!hasTmdbCredentials()) {
    console.warn(
      `${APP_LOG_PREFIX} TMDB is not configured. Set window.CINESTREAM_TMDB_API_KEY, window.CINESTREAM_TMDB_BEARER_TOKEN, localStorage keys (tmdb_api_key/tmdb_bearer_token), or HARDCODED_TMDB_* constants.`
    );
    return;
  }

  if (TMDB_API_KEY) {
    console.info(`${APP_LOG_PREFIX} TMDB API key detected.`);
  }

  if (TMDB_BEARER_TOKEN) {
    console.info(`${APP_LOG_PREFIX} TMDB bearer token detected.`);
  }
}

function extractListFromResponse(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

async function fetchJsonWithTimeout(url) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: url.includes("api.themoviedb.org") ? getTmdbRequestHeaders() : undefined,
    });

    if (!response.ok) {
      const provider = url.includes("api.themoviedb.org") ? "TMDB" : "vidsrc";

      if (provider === "TMDB" && (response.status === 401 || response.status === 403)) {
        console.error(
          `${APP_LOG_PREFIX} TMDB authentication failed (${response.status}). Check TMDB_API_KEY / TMDB_BEARER_TOKEN.`
        );
      } else {
        console.warn(`${APP_LOG_PREFIX} ${provider} request failed with HTTP ${response.status}.`, url);
      }

      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error?.name === "AbortError") {
      console.warn(`${APP_LOG_PREFIX} Request timed out after ${REQUEST_TIMEOUT_MS}ms.`, url);
      throw new Error("Request timeout");
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function fetchFromTmdb(type, page, query = "") {
  if (!hasTmdbCredentials()) {
    if (page === 1 && !query) {
      console.warn(
        `${APP_LOG_PREFIX} TMDB credentials are missing. Add TMDB_API_KEY or TMDB_BEARER_TOKEN. Falling back to other sources/local data.`
      );
    }

    return [];
  }

  const mediaType = type === "movie" ? "movie" : "tv";
  const endpoint = query ? `search/${mediaType}` : `discover/${mediaType}`;
  const params = new URLSearchParams({ page: String(page) });

  if (TMDB_API_KEY) {
    params.set("api_key", TMDB_API_KEY);
  }

  if (query) {
    params.set("query", query);
  } else {
    params.set("sort_by", "popularity.desc");
  }

  const payload = await fetchJsonWithTimeout(`${TMDB_API_BASE}/${endpoint}?${params.toString()}`);
  const list = extractListFromResponse(payload);

  return list
    .map((item) =>
      normalizeItem(
        {
          id: item.id,
          tmdb_id: item.id,
          title: item.title,
          name: item.name,
          overview: item.overview,
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
        },
        type
      )
    )
    .filter(Boolean);
}

async function fetchFromVidsrc(type, page) {
  const apiType = type === "movie" ? "movie" : "tv";
  const url = page > 1 ? `${VIDSRC_API_BASE}/${apiType}/new/${page}` : `${VIDSRC_API_BASE}/${apiType}/new`;
  const payload = await fetchJsonWithTimeout(url);
  const list = extractListFromResponse(payload);
  return list.map((item) => normalizeItem(item, type)).filter(Boolean);
}

async function fetchCatalogPage(type, page, query = "") {
  const errors = [];

  try {
    const tmdbItems = await fetchFromTmdb(type, page, query);
    if (tmdbItems.length > 0) {
      console.info(`${APP_LOG_PREFIX} Loaded ${tmdbItems.length} ${type} items from TMDB (page ${page}).`);
      return { items: tmdbItems, source: "tmdb" };
    }
  } catch (error) {
    errors.push(`tmdb:${error?.message || "unknown"}`);
  }

  if (!query) {
    try {
      const vidsrcItems = await fetchFromVidsrc(type, page);
      if (vidsrcItems.length > 0) {
        console.info(`${APP_LOG_PREFIX} Loaded ${vidsrcItems.length} ${type} items from vidsrc (page ${page}).`);
        return { items: vidsrcItems, source: "vidsrc" };
      }
    } catch (error) {
      errors.push(`vidsrc:${error?.message || "unknown"}`);
    }
  }

  throw new Error(errors.join(" | ") || "No sources returned data");
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
  // Description removed from main screen
  poster.src = item.poster;
  poster.alt = `${item.title} poster`;
  watchLink.href = watchUrl;

  if (!getExternalId(item)) {
    watchLink.textContent = "ID unavailable for playback";
    watchLink.removeAttribute("href");
    watchLink.setAttribute("aria-disabled", "true");
    posterButton.disabled = true;
    return node;
  }

  posterButton.addEventListener("click", () => {
    window.location.href = watchUrl;
  });

  return node;
}

function renderList(items, target, template) {
  if (!target) return;
  target.replaceChildren(...items.map((item) => buildMediaCard(item, template)));
}

function filterItems(items, query) {
  if (!query) return items;
  return items.filter(
    (item) => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
  );
}

function dedupeById(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.type}:${item.imdbId || item.tmdbId || item.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function createCatalogState(type) {
  const seed = type === "movie" ? seedToItems(LOCAL_MOVIES, "movie") : seedToItems(LOCAL_TV, "tv");
  return {
    type,
    page: 0,
    exhausted: false,
    loading: false,
    items: seed,
    source: "local",
    apiFailed: false,
  };
}

async function loadNextPage(state, query = "") {
  if (state.loading || state.exhausted || state.page >= MAX_PAGES) return;

  state.loading = true;
  const nextPage = state.page + 1;

  try {
    const { items: pageItems, source } = await fetchCatalogPage(state.type, nextPage, query);
    state.page = nextPage;
    state.source = source;

    if (pageItems.length === 0) {
      state.exhausted = true;
      return;
    }

    const prioritizeApiItems = state.page === 1 && source === "tmdb";
    state.items = prioritizeApiItems
      ? dedupeById([...pageItems, ...state.items])
      : dedupeById([...state.items, ...pageItems]);
  } catch (error) {
    state.apiFailed = true;
    console.error(
      `${APP_LOG_PREFIX} Unable to load ${state.type} catalog page ${nextPage}. Using available local data.`,
      error
    );
  } finally {
    state.loading = false;
  }
}

async function ensureSearchCoverage(state, query) {
  if (!query || state.page >= MAX_PAGES) return;

  let filtered = filterItems(state.items, query);
  while (filtered.length < 18 && !state.exhausted && state.page < MAX_PAGES) {
    await loadNextPage(state, query);

    if (state.apiFailed) {
      break;
    }

    filtered = filterItems(state.items, query);
  }
}

function updateLoadMoreButton(button, state) {
  if (!button) return;
  button.disabled = state.loading || state.exhausted;

  if (state.exhausted) {
    button.textContent = "No more results";
  } else if (state.loading) {
    button.textContent = "Loading…";
  } else {
    button.textContent = "Load more";
  }
}

function sourceLabel(state) {
  if (state.source === "tmdb") return "TMDB";
  if (state.source === "vidsrc") return "vidsrc";
  return "local";
}

async function initHomePage(template, statusEl, searchEl) {
  const latestMoviesGrid = document.getElementById("latest-movies-grid");
  const latestTvGrid = document.getElementById("latest-tv-grid");
  if (!latestMoviesGrid || !latestTvGrid) return;

  const movieState = createCatalogState("movie");
  const tvState = createCatalogState("tv");

  const render = (query) => {
    const latestMovies = filterItems(movieState.items, query).slice(0, 8);
    const latestTv = filterItems(tvState.items, query).slice(0, 8);
    renderList(latestMovies, latestMoviesGrid, template);
    renderList(latestTv, latestTvGrid, template);
    statusEl.textContent = `Home: ${latestMovies.length} movies + ${latestTv.length} TV shows (source: ${sourceLabel(movieState)}/${sourceLabel(tvState)}).`;
  };

  render("");
  await Promise.all([loadNextPage(movieState), loadNextPage(tvState)]);
  render(searchEl.value.trim().toLowerCase());

  searchEl.addEventListener("input", async (event) => {
    const query = event.target.value.trim().toLowerCase();
    await Promise.all([ensureSearchCoverage(movieState, query), ensureSearchCoverage(tvState, query)]);
    render(query);
  });
}

async function initSingleTypePage(type, gridId, template, statusEl, searchEl, loadMoreButton) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  const state = createCatalogState(type);

  const render = (query) => {
    const filtered = filterItems(state.items, query);
    renderList(filtered, grid, template);

    const label = type === "movie" ? "movie" : "TV show";
    statusEl.textContent = filtered.length
      ? `Showing ${filtered.length} ${label}${filtered.length === 1 ? "" : "s"}. Loaded ${state.items.length}. Source: ${sourceLabel(state)}${state.apiFailed ? " (API issue, local still active)" : ""}.`
      : `No ${label} matches found.`;

    updateLoadMoreButton(loadMoreButton, state);
  };

  render("");
  await loadNextPage(state);
  render(searchEl.value.trim().toLowerCase());

  searchEl.addEventListener("input", async (event) => {
    const query = event.target.value.trim().toLowerCase();
    await ensureSearchCoverage(state, query);
    render(query);
  });

  if (loadMoreButton) {
    loadMoreButton.addEventListener("click", async () => {
      await loadNextPage(state, searchEl.value.trim().toLowerCase());
      render(searchEl.value.trim().toLowerCase());
    });
  }
}

async function initApp() {
  const page = document.body.dataset.page;
  const template = document.getElementById("media-template");
  const searchEl = document.getElementById("search");
  const statusEl = document.getElementById("status");
  const loadMoreButton = document.getElementById("load-more");

  if (!page || !template || !template.content.firstElementChild || !searchEl || !statusEl) return;

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
  logTmdbSetup();
  initApp();
});
