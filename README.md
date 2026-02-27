# CineStream

CineStream is a lightweight, Cineby-inspired browsing interface with:

- A cinematic dark UI
- A top navigation bar (`Home`, `Movies`, `TV Shows`)
- A home feed split into **Latest Movies** and **Latest TV Shows**
- Dedicated watch pages (player moved off the homepage)

## Project Structure

- `index.html` – main catalog page with top nav and list sections
- `player.html` – dedicated player page for a selected movie/show
- `styles.css` – styling for catalog and player layouts
- `app.js` – catalog data, rendering, search, and navigation state
- `player.js` – player-page URL parsing and embed setup

## How to Run Locally

Because this is a static site, run any local web server.

### Option 1: Python (recommended)

```bash
python3 -m http.server 4173
```

Then open:

- `http://localhost:4173`

## Usage

1. Open the site in your browser.
2. Use the top bar to switch between Home, Movies, and TV Shows.
3. Click a poster or "Open watch page" to go to a dedicated player page.
4. On the player page, use the fallback "Open ... in a new tab" link if needed.

## Notes

- Streams come from third-party embeds (`vidsrc.to`) and may be blocked by network/ad-blocking/browser policies.
- IDs prefer IMDb format for compatibility, with TMDB fallback.
