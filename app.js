const movies = [
  {
    title: "Inception",
    description: "A thief who steals corporate secrets through dream-sharing technology is given one impossible task.",
    poster: "https://image.tmdb.org/t/p/w780/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
    tmdbId: 27205,
    imdbId: "tt1375666",
  },
  {
    title: "Interstellar",
    description: "A team travels through a wormhole in space in an attempt to ensure humanity's survival.",
    poster: "https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    tmdbId: 157336,
    imdbId: "tt0816692",
  },
  {
    title: "The Dark Knight",
    description: "Batman faces the Joker, a criminal mastermind who pushes Gotham toward chaos.",
    poster: "https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    tmdbId: 155,
    imdbId: "tt0468569",
  },
  {
    title: "Parasite",
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between two families.",
    poster: "https://image.tmdb.org/t/p/w780/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    tmdbId: 496243,
    imdbId: "tt6751668",
  },
  {
    title: "Dune",
    description: "Paul Atreides journeys to the most dangerous planet in the universe to secure his family's future.",
    poster: "https://image.tmdb.org/t/p/w780/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    tmdbId: 438631,
    imdbId: "tt1160419",
  },
  {
    title: "Top Gun: Maverick",
    description: "After thirty years, Maverick trains a detachment of TOP GUN graduates for a specialized mission.",
    poster: "https://image.tmdb.org/t/p/w780/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    tmdbId: 361743,
    imdbId: "tt1745960",
  },
];

const tvShows = [
  {
    title: "Breaking Bad",
    description: "A chemistry teacher turned meth producer navigates danger, power, and family fallout.",
    poster: "https://image.tmdb.org/t/p/w780/eSzpy96DwBujGFj0xMbXBcGcfxX.jpg",
    tmdbId: 1396,
    imdbId: "tt0903747",
  },
  {
    title: "Game of Thrones",
    description: "Noble families wage war for control of Westeros while ancient threats gather.",
    poster: "https://image.tmdb.org/t/p/w780/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
    tmdbId: 1399,
    imdbId: "tt0944947",
  },
  {
    title: "Stranger Things",
    description: "A group of kids uncover dark experiments and supernatural forces in their small town.",
    poster: "https://image.tmdb.org/t/p/w780/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    tmdbId: 66732,
    imdbId: "tt4574334",
  },
  {
    title: "The Last of Us",
    description: "In a post-pandemic world, two survivors cross a shattered America.",
    poster: "https://image.tmdb.org/t/p/w780/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
    tmdbId: 100088,
    imdbId: "tt3581920",
  },
  {
    title: "The Bear",
    description: "A young chef returns home to run his family sandwich shop in Chicago.",
    poster: "https://image.tmdb.org/t/p/w780/sHFlbKS3WLqMnp9t2ghADIJFnuQ.jpg",
    tmdbId: 136315,
    imdbId: "tt14452776",
  },
  {
    title: "Wednesday",
    description: "Wednesday Addams investigates a supernatural mystery at Nevermore Academy.",
    poster: "https://image.tmdb.org/t/p/w780/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
    tmdbId: 119051,
    imdbId: "tt13443470",
  },
];

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

function buildMediaCard(item, type, template) {
  const node = template.content.firstElementChild.cloneNode(true);
  const title = node.querySelector(".media-title");
  const description = node.querySelector(".media-description");
  const poster = node.querySelector(".poster");
  const watchLink = node.querySelector(".watch-link");
  const posterButton = node.querySelector(".poster-button");

  if (!title || !description || !poster || !watchLink || !posterButton) {
    return node;
  }

  const watchUrl = buildWatchPageUrl(type, item);

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

function renderList(items, type, target, template) {
  if (!target) {
    return;
  }

  const cards = items.map((item) => buildMediaCard(item, type, template));
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

function initApp() {
  const page = document.body.dataset.page;
  const template = document.getElementById("media-template");
  const searchEl = document.getElementById("search");
  const statusEl = document.getElementById("status");

  if (!page || !template || !template.content.firstElementChild || !searchEl || !statusEl) {
    return;
  }

  const latestMoviesGrid = document.getElementById("latest-movies-grid");
  const latestTvGrid = document.getElementById("latest-tv-grid");
  const moviesGrid = document.getElementById("movies-grid");
  const tvGrid = document.getElementById("tv-grid");

  const render = (query) => {
    if (page === "movies") {
      const filteredMovies = filterItems(movies, query);
      renderList(filteredMovies, "movie", moviesGrid, template);
      statusEl.textContent = filteredMovies.length
        ? `Showing ${filteredMovies.length} movie${filteredMovies.length === 1 ? "" : "s"}.`
        : "No movie matches found.";
      return;
    }

    if (page === "tv") {
      const filteredTv = filterItems(tvShows, query);
      renderList(filteredTv, "tv", tvGrid, template);
      statusEl.textContent = filteredTv.length
        ? `Showing ${filteredTv.length} TV show${filteredTv.length === 1 ? "" : "s"}.`
        : "No TV show matches found.";
      return;
    }

    const latestMovies = filterItems(movies.slice(0, 4), query);
    const latestTv = filterItems(tvShows.slice(0, 4), query);
    renderList(latestMovies, "movie", latestMoviesGrid, template);
    renderList(latestTv, "tv", latestTvGrid, template);
    statusEl.textContent = `Home: ${latestMovies.length} latest movie${latestMovies.length === 1 ? "" : "s"} and ${latestTv.length} latest TV show${latestTv.length === 1 ? "" : "s"}.`;
  };

  render("");
  searchEl.addEventListener("input", (event) => {
    render(event.target.value.trim().toLowerCase());
  });
}

window.addEventListener("DOMContentLoaded", initApp);
