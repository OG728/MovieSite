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
    title: "The Matrix",
    description: "A hacker learns the shocking truth about reality and his role in the war against its controllers.",
    poster: "https://image.tmdb.org/t/p/w780/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    tmdbId: 603,
    imdbId: "tt0133093",
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
  {
    title: "Spider-Man: Across the Spider-Verse",
    description: "Miles Morales catapults across the multiverse where he meets a team of Spider-People.",
    poster: "https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    tmdbId: 569094,
    imdbId: "tt9362722",
  },
];

function buildEmbedUrl(movie) {
  const preferredId = movie.imdbId || movie.tmdbId;
  return `https://vidsrc.to/embed/movie/${preferredId}`;
}

function buildMovieCard(movie, template) {
  const node = template.content.firstElementChild.cloneNode(true);
  const title = node.querySelector(".media-title");
  const description = node.querySelector(".media-description");
  const poster = node.querySelector(".poster");
  const title = node.querySelector(".movie-title");
  const description = node.querySelector(".movie-description");
  const frame = node.querySelector(".movie-frame");
  const openLink = node.querySelector(".open-player");

  title.textContent = movie.title;
  description.textContent = movie.description;
  poster.src = movie.poster;
  poster.alt = `${movie.title} poster`;

  const embedUrl = buildEmbedUrl(movie);
  frame.src = embedUrl;
  frame.title = `${movie.title} player`;

  openLink.href = embedUrl;
  openLink.textContent = `Open ${movie.title} player in new tab`;

  return node;
}

function renderMovies(items, elements) {
  const { grid, statusEl, template } = elements;
  const cards = items.map((movie) => buildMovieCard(movie, template));
  grid.replaceChildren(...cards);

  if (items.length === 0) {
    statusEl.textContent = "No matches found. Try a different title or keyword.";
    return;
  }

  statusEl.textContent = `Showing ${items.length} movie${items.length === 1 ? "" : "s"}. If the in-page player is blocked, use the 'Open player' link.`;
}

function setView(view, elements) {
  const { panels, navLinks, viewTitle, viewDescription } = elements;

  panels.forEach((panel) => {
    panel.hidden = panel.dataset.view !== view;
  });

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.viewLink === view);
  });

  if (view === "movies") {
    viewTitle.textContent = "Movies";
    viewDescription.textContent = "Browse our movie collection and open each title on its own watch page.";
  } else if (view === "tv") {
    viewTitle.textContent = "TV Shows";
    viewDescription.textContent = "Browse TV shows and open each series in a dedicated player page.";
  } else {
    viewTitle.textContent = "Home";
    viewDescription.textContent = "Browse the latest movies and TV shows, then open a dedicated watch page.";
  }
}

function getFilteredItems(items, query) {
  if (!query) {
    return items;
  }

  return items.filter(
    (item) => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
  );
}

window.addEventListener("DOMContentLoaded", initApp);
