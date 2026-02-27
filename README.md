# CineStream

CineStream is a lightweight, movie browsing interface with:

- A cinematic dark UI
- Separate pages for `Home`, `Movies`, and `TV Shows`
- Dual-source catalogs: TMDB (when configured) + vidsrc + local seed fallback
- Dedicated watch pages for playback (`player.html`)

## Project Structure

- `index.html` – Home page with latest movies and latest TV shows
- `movies.html` – Movies-only page (API + search + load more)
- `tv.html` – TV-shows-only page (API + search + load more)
- `player.html` – dedicated player page for a selected movie/show
- `styles.css` – styling for catalog and player layouts
- `app.js` – procedural API fetching, normalization, rendering, search, pagination
- `player.js` – player-page URL parsing and embed setup

## How to Run Locally

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.


## Usage

1. Open the site.
2. Use the top nav to go to **Home**, **Movies**, or **TV Shows**.
3. Movies/TV pages fetch entries procedurally from the API and allow searching + loading more pages.
4. Click a poster or "Open watch page" to open the dedicated player page.

## Notes

- Catalog data is fetched from `https://vidsrc.to/vapi` endpoints.
- Streams come from third-party embeds (`vidsrc.to`) and may be blocked by network/ad-blocking/browser policies.
- IDs prefer IMDb format for compatibility, with TMDB fallback.


## Optional TMDB Configuration

TMDB is not hardcoded in the repo. Set your key in the browser before using TMDB-backed catalog loading:

```js
localStorage.setItem("tmdb_api_key", "YOUR_TMDB_V3_API_KEY")
localStorage.setItem("tmdb_bearer_token", "YOUR_TMDB_READ_ACCESS_TOKEN")
location.reload()
```

You can also set `window.CINESTREAM_TMDB_API_KEY` and `window.CINESTREAM_TMDB_BEARER_TOKEN` before loading `app.js`.

You can also manually edit `app.js` at `TMDB_API_KEY` and `TMDB_BEARER_TOKEN` defaults if you prefer hardcoding locally.