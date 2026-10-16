# Invite Creators — prototype

Clickable HTML/CSS/JS prototype of Benable's two-step **Invite Creators** modal, built from the Figma designs.

- **Step 1 — Creators you know:** add creators to the shortlist, star them for priority, filter by "For you" tag, hover a name for their profile card.
- **Step 2 — New suggestions:** a swipeable deck of suggested creators (Add, star, Not a Fit, ‹ › to browse).
- The right panel and the "Your list" meter update live from a fake in-memory backend (`mock-api.js`). Everything resets on reload.

## Run it

No build step. Serve the folder with any static server, for example:

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173 (add `#step2` to open straight on step 2).
