# CineStream

CineStream is a lightweight, Cineby-inspired browsing interface with:

- A cinematic dark UI
- Separate pages for `Home`, `Movies`, and `TV Shows`
- A home feed split into **Latest Movies** and **Latest TV Shows**
- Dedicated watch pages for playback (`player.html`)

## Project Structure

- `index.html` – Home page with latest movies and latest TV shows
- `movies.html` – Movies-only page
- `tv.html` – TV-shows-only page
- `player.html` – dedicated player page for a selected movie/show
- `styles.css` – styling for catalog and player layouts
- `app.js` – catalog data, rendering, and per-page search behavior
- `player.js` – player-page URL parsing and embed setup

## How to Run Locally

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Usage

1. Open the site.
2. Use the top nav to go to **Home**, **Movies**, or **TV Shows**.
3. Movies page shows only movies, TV Shows page shows only TV series.
4. Click a poster or "Open watch page" to open the dedicated player page.

## Notes

- Streams come from third-party embeds (`vidsrc.to`) and may be blocked by network/ad-blocking/browser policies.
- IDs prefer IMDb format for compatibility, with TMDB fallback.
