# CineStream

CineStream is a lightweight, Cineby-inspired movie browsing interface with:

- A cinematic dark UI
- A searchable movie grid
- Embedded playback via `vidsrc.to` iframe links

## Project Structure

- `index.html` – page structure and template for movie cards
- `styles.css` – visual styling and responsive layout
- `app.js` – movie data, render logic, search filtering, and embed URL building

## How to Run Locally

Because this is a static site, you can run it with any basic local web server.

### Option 1: Python (recommended)

```bash
python3 -m http.server 4173
```

Then open:

- `http://localhost:4173`

### Option 2: VS Code Live Server

1. Open this folder in VS Code.
2. Install the **Live Server** extension (if needed).
3. Right-click `index.html` and choose **Open with Live Server**.

## Usage

1. Open the site in your browser.
2. Use the search bar to filter movies by title or description.
3. Click play on any embedded player card.

## Notes

- Subtitle/caption availability depends on the upstream stream source inside vidsrc embeds.
- Some networks/browsers may block third-party embeds depending on policy settings.

