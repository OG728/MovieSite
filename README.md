# CineStream

CineStream is a lightweight movie/TV browsing interface with:

- A cinematic dark UI
- A `Home` page and `Search` page for discovering content
- Dual-source catalogs: TMDB (when configured) + vidsrc + local seed fallback
- A dedicated watch page (`player.html`) for playback

## Project Structure

- `index.html` - Home page with hero slideshow, latest movies, and latest TV shows
- `search.html` - Search page for movies and TV shows
- `player.html` - Player page for the selected movie/show
- `styles.css` - Shared styles for home, search, player, and TV episode controls
- `app.js` - Catalog fetching, normalization, rendering, search, and hero slideshow logic
- `player.js` - Player URL parsing, embed setup, and TV season/episode controls

## How to Run Locally

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Usage

1. Open the site.
2. Use the top nav to go to **Home** or **Search**.
3. Browse or search entries fetched from API/local fallback sources.
4. Click a poster to open the dedicated player page.
5. For TV shows, use the season dropdown and episode buttons on the player page.

## Notes

- Catalog data is fetched from `https://vidsrc.to/vapi` endpoints.
- Streams come from third-party embeds (`vidsrc.to`) and may be blocked by network/ad-blocking/browser policies.
- IDs prefer IMDb format for compatibility, with TMDB fallback.

## Optional TMDB Configuration

Set TMDB credentials in the browser before using TMDB-backed catalog loading:

```js
localStorage.setItem("tmdb_api_key", "YOUR_TMDB_V3_API_KEY")
localStorage.setItem("tmdb_bearer_token", "YOUR_TMDB_READ_ACCESS_TOKEN")
location.reload()
```

You can also set `window.CINESTREAM_TMDB_API_KEY` and `window.CINESTREAM_TMDB_BEARER_TOKEN` before loading `app.js`.

You can also manually edit `app.js` defaults if you prefer hardcoding locally.
