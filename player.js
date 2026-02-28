const TMDB_API_BASE = "https://api.themoviedb.org/3";
const REQUEST_TIMEOUT_MS = 8000;

const HARDCODED_TMDB_API_KEY = "8e8d091a87218e8fa084531dedd4b01c";
const HARDCODED_TMDB_BEARER_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZThkMDkxYTg3MjE4ZThmYTA4NDUzMWRlZGQ0YjAxYyIsIm5iZiI6MTc3MjE4NjM1Mi43NDgsInN1YiI6IjY5YTE2YWYwYmY0MjNhZDAzYjA5ZGI5ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.FygW_6KXrCB9H6tCRznF7YkN54Fd4OyxZu0iNxvryXQ";

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

function buildEmbedUrl(type, id, season = 1, episode = 1) {
  if (type === "tv") {
    return `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
  }

  return `https://vidsrc.to/embed/movie/${id}`;
}

function normalizeMediaType(rawType, params) {
  const value = String(rawType || "").toLowerCase().trim();
  if (value === "tv" || value === "show" || value === "series" || value === "tvshow" || value === "tv-show") {
    return "tv";
  }
  if (params?.has("season") || params?.has("episode")) {
    return "tv";
  }
  return "movie";
}

function getTmdbRequestHeaders() {
  if (!TMDB_BEARER_TOKEN) return {};
  return { Authorization: `Bearer ${TMDB_BEARER_TOKEN}` };
}

function hasTmdbCredentials() {
  return Boolean(TMDB_API_KEY || TMDB_BEARER_TOKEN);
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
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function resolveTmdbTvId(rawId) {
  if (!rawId) return null;

  if (/^\d+$/.test(rawId)) {
    return Number(rawId);
  }

  if (!hasTmdbCredentials()) {
    return null;
  }

  const params = new URLSearchParams({ external_source: "imdb_id" });
  if (TMDB_API_KEY) {
    params.set("api_key", TMDB_API_KEY);
  }

  const payload = await fetchJsonWithTimeout(`${TMDB_API_BASE}/find/${encodeURIComponent(rawId)}?${params.toString()}`);
  const first = payload?.tv_results?.[0];
  return first?.id || null;
}

function setPlayerSource(frame, openPlayerLink, type, id, title, season, episode) {
  const embedUrl = buildEmbedUrl(type, id, season, episode);
  frame.src = embedUrl;
  frame.title = `${title} player`;
  openPlayerLink.href = embedUrl;
  openPlayerLink.textContent = `Open ${title} in a new tab`;
}

function updateQueryParams(type, id, title, description, season, episode) {
  const params = new URLSearchParams(window.location.search);
  params.set("type", type);
  params.set("id", id);
  params.set("title", title);
  params.set("description", description);
  if (type === "tv") {
    params.set("season", String(season));
    params.set("episode", String(episode));
  } else {
    params.delete("season");
    params.delete("episode");
  }
  window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
}

async function initTvControls({ id, title, description, frame, openPlayerLink }) {
  const tvControls = document.getElementById("tv-controls");
  const seasonSelect = document.getElementById("season-select");
  const episodeList = document.getElementById("episode-list");
  const statusEl = document.getElementById("tv-controls-status");

  if (!tvControls || !seasonSelect || !episodeList || !statusEl) return;

  tvControls.hidden = false;

  let activeSeason = Math.max(1, Number.parseInt(new URLSearchParams(window.location.search).get("season") || "1", 10) || 1);
  let activeEpisode = Math.max(1, Number.parseInt(new URLSearchParams(window.location.search).get("episode") || "1", 10) || 1);

  const renderEpisodes = (episodes) => {
    episodeList.replaceChildren(
      ...episodes.map((ep) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "episode-button";
        if (ep.episode_number === activeEpisode) {
          button.classList.add("is-active");
        }
        button.textContent = ep.name
          ? `Ep ${ep.episode_number}: ${ep.name}`
          : `Episode ${ep.episode_number}`;
        button.addEventListener("click", () => {
          activeEpisode = ep.episode_number;
          setPlayerSource(frame, openPlayerLink, "tv", id, title, activeSeason, activeEpisode);
          updateQueryParams("tv", id, title, description, activeSeason, activeEpisode);
          renderEpisodes(episodes);
        });
        return button;
      })
    );
  };

  const showStatus = (message) => {
    statusEl.hidden = false;
    statusEl.textContent = message;
  };

  try {
    if (!hasTmdbCredentials()) {
      showStatus("TMDB credentials missing. Season and episode list unavailable.");
      setPlayerSource(frame, openPlayerLink, "tv", id, title, activeSeason, activeEpisode);
      updateQueryParams("tv", id, title, description, activeSeason, activeEpisode);
      return;
    }

    const tmdbTvId = await resolveTmdbTvId(id);
    if (!tmdbTvId) {
      showStatus("Could not resolve this TV show in TMDB. Season and episode list unavailable.");
      setPlayerSource(frame, openPlayerLink, "tv", id, title, activeSeason, activeEpisode);
      updateQueryParams("tv", id, title, description, activeSeason, activeEpisode);
      return;
    }

    const tvParams = new URLSearchParams();
    if (TMDB_API_KEY) tvParams.set("api_key", TMDB_API_KEY);
    const tvPayload = await fetchJsonWithTimeout(`${TMDB_API_BASE}/tv/${tmdbTvId}?${tvParams.toString()}`);

    const seasons = (tvPayload?.seasons || [])
      .filter((s) => s.season_number > 0)
      .map((s) => ({ season_number: s.season_number, episode_count: s.episode_count || 0 }))
      .sort((a, b) => a.season_number - b.season_number);

    if (seasons.length === 0) {
      showStatus("No seasons found for this TV show.");
      setPlayerSource(frame, openPlayerLink, "tv", id, title, 1, 1);
      updateQueryParams("tv", id, title, description, 1, 1);
      return;
    }

    if (!seasons.some((s) => s.season_number === activeSeason)) {
      activeSeason = seasons[0].season_number;
      activeEpisode = 1;
    }

    seasonSelect.replaceChildren(
      ...seasons.map((season) => {
        const option = document.createElement("option");
        option.value = String(season.season_number);
        option.textContent = `Season ${season.season_number}`;
        if (season.season_number === activeSeason) {
          option.selected = true;
        }
        return option;
      })
    );

    const loadSeasonEpisodes = async (seasonNumber) => {
      episodeList.replaceChildren();
      showStatus("Loading episodes...");

      const seasonParams = new URLSearchParams();
      if (TMDB_API_KEY) seasonParams.set("api_key", TMDB_API_KEY);
      const seasonPayload = await fetchJsonWithTimeout(
        `${TMDB_API_BASE}/tv/${tmdbTvId}/season/${seasonNumber}?${seasonParams.toString()}`
      );
      const episodes = (seasonPayload?.episodes || []).map((ep) => ({
        episode_number: ep.episode_number,
        name: ep.name,
      }));

      if (episodes.length === 0) {
        showStatus("No episodes found for this season.");
        setPlayerSource(frame, openPlayerLink, "tv", id, title, seasonNumber, 1);
        updateQueryParams("tv", id, title, description, seasonNumber, 1);
        return;
      }

      statusEl.hidden = true;
      if (!episodes.some((ep) => ep.episode_number === activeEpisode)) {
        activeEpisode = episodes[0].episode_number;
      }

      setPlayerSource(frame, openPlayerLink, "tv", id, title, seasonNumber, activeEpisode);
      updateQueryParams("tv", id, title, description, seasonNumber, activeEpisode);
      renderEpisodes(episodes);
    };

    seasonSelect.addEventListener("change", async (event) => {
      activeSeason = Math.max(1, Number.parseInt(event.target.value, 10) || 1);
      activeEpisode = 1;
      try {
        await loadSeasonEpisodes(activeSeason);
      } catch {
        showStatus("Failed to load episodes for this season.");
      }
    });

    await loadSeasonEpisodes(activeSeason);
  } catch {
    showStatus("Unable to load TV season and episode data right now.");
    setPlayerSource(frame, openPlayerLink, "tv", id, title, activeSeason, activeEpisode);
    updateQueryParams("tv", id, title, description, activeSeason, activeEpisode);
  }
}

function initPlayerPage() {
  const params = new URLSearchParams(window.location.search);
  const type = normalizeMediaType(params.get("type"), params);
  const id = params.get("id");
  const title = params.get("title") || "Unknown title";
  const description = params.get("description") || "Description unavailable.";

  const frame = document.getElementById("player-frame");
  const playerTitle = document.getElementById("player-title");
  const playerDescription = document.getElementById("player-description");
  const openPlayerLink = document.getElementById("open-player-link");
  const crumbType = document.getElementById("crumb-type");
  const crumbTitle = document.getElementById("crumb-title");
  const tvControls = document.getElementById("tv-controls");

  if (!frame || !playerTitle || !playerDescription || !openPlayerLink || !crumbType || !crumbTitle || !id) {
    return;
  }

  playerTitle.textContent = title;
  playerDescription.textContent = description;
  crumbType.textContent = type === "tv" ? "TV Show" : "Movie";
  crumbTitle.textContent = title;

  if (type === "tv") {
    if (tvControls) tvControls.hidden = false;
    initTvControls({ id, title, description, frame, openPlayerLink });
    return;
  }

  if (tvControls) tvControls.hidden = true;

  setPlayerSource(frame, openPlayerLink, "movie", id, title, 1, 1);
  updateQueryParams("movie", id, title, description, 1, 1);
}

window.addEventListener("DOMContentLoaded", initPlayerPage);
