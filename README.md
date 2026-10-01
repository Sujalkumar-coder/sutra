# Sutra Studio — Frontend

A clean, modular frontend-only portfolio for Sutra Studio. It is intentionally structured so content and individual interactions can be changed without rebuilding the whole site.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Build check

```bash
npm run build
```

## Where to edit

- `index.html` — page structure
- `css/` — one stylesheet per section/system
- `js/data/projects.js` — selected work
- `js/data/clients.js` — selected clients
- `js/data/services.js` — services
- `js/components/` — individual interactions
- `public/assets/images/` — images
- `public/assets/videos/` — videos

## Brand colour

The main orange is controlled by `--accent` in `css/variables.css`. Use `var(--accent)` instead of hard-coding the orange in components.

## Footer wordmark, Book-a-call button, header logo

- `js/components/footer-wordmark.js` + `css/footer.css` — the footer SUTRA is painted by a small WebGL shader from a static text mask (letters never move; only the surface inside reacts to the cursor). No idle animation loop. If WebGL is unavailable, the plain text in `index.html` is shown instead — never both.
- `js/components/booking.js` + `css/contact.css` — the orange fill is one `<canvas class="btn-fill">` acting as the button background. Tune `FILL_MS`, `RETRACT_MS`, `CELL` at the top of the JS file.
- `js/components/header.js` — the header SUTRA is a link (`href="#top"`) that smooth-scrolls to the top and keeps the URL clean.
- `index.html` now applies the saved theme before first paint, and `js/main.js` starts each component independently so one failure can't stop the others.
