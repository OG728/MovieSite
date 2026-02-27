function buildEmbedUrl(type, id) {
  if (type === "tv") {
    return `https://vidsrc.to/embed/tv/${id}/1/1`;
  }

  return `https://vidsrc.to/embed/movie/${id}`;
}

function initPlayerPage() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") === "tv" ? "tv" : "movie";
  const id = params.get("id");
  const title = params.get("title") || "Unknown title";
  const description = params.get("description") || "Description unavailable.";

  const frame = document.getElementById("player-frame");
  const playerTitle = document.getElementById("player-title");
  const playerDescription = document.getElementById("player-description");
  const openPlayerLink = document.getElementById("open-player-link");
  const crumbType = document.getElementById("crumb-type");
  const crumbTitle = document.getElementById("crumb-title");

  if (!frame || !playerTitle || !playerDescription || !openPlayerLink || !crumbType || !crumbTitle || !id) {
    return;
  }

  const embedUrl = buildEmbedUrl(type, id);
  frame.src = embedUrl;
  frame.title = `${title} player`;

  playerTitle.textContent = title;
  playerDescription.textContent = description;
  openPlayerLink.href = embedUrl;
  openPlayerLink.textContent = `Open ${title} in a new tab`;

  crumbType.textContent = type === "tv" ? "TV Show" : "Movie";
  crumbTitle.textContent = title;
}

window.addEventListener("DOMContentLoaded", initPlayerPage);
