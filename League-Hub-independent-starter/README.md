# League Hub — independent starter

This is a standalone React + TypeScript + Vite version of the League Hub export.
It preserves the existing team, standings, schedule, history, and visual components while removing Monday.com/Vibe runtime dependencies.

## Run locally

1. Install Node.js (current LTS).
2. Open this folder in VS Code.
3. Open the integrated terminal.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open the local URL printed by Vite (normally http://localhost:5173).

To create a production build:

```bash
npm run build
npm run preview
```

## What was removed or replaced

- Removed the Monday/Vibe root providers, tracking, watermark, editor bridge, and error-reporting initialization.
- Removed TanStack Start server-function dependency.
- Replaced the Monday-hosted server function for player names with a direct Sleeper API lookup, cached in memory for the browser session.
- Replaced the generated host entry point with a normal Vite/React entry point.
- Added local Tailwind, TypeScript, and Vite configuration plus the missing `cn` utility.

## External data dependency

The app still uses the public Sleeper API (`https://api.sleeper.app/v1`) for league, matchup, roster, and player information. This is intentional: it is the application's data provider, not a Monday.com dependency. The app also loads player headshots and NFL team logos from Sleeper's CDN.

## Important limitations / next steps

- This is a frontend-only starter. It currently fetches Sleeper data from each visitor's browser; it does not yet have a persistent database or scheduled daily ingestion job.
- Player directory data is large. The current history hook requests it while loading history (including on initial app load) and caches it in memory for the current browser session. This is a known optimization opportunity if you later want to reduce initial network traffic.
- Local team selection is stored in that browser's `localStorage`, so each user chooses their own team.
- No Monday.com code or credentials are required by this starter.
- Before deploying publicly, test the Sleeper API's availability/CORS behavior and review its terms and rate limits.
- For reliable shared daily snapshots, the next phase can add a scheduled Cloudflare Worker and optionally a Supabase database. Those are not required just to run this starter locally.

## Project layout

- `src/main.tsx` — standalone application entry point
- `src/generated/App.tsx` — main League Hub interface
- `src/generated/components/` — existing UI components
- `src/generated/lib/` — Sleeper data and league-history calculations
- `src/generated/theme-tokens.css` — original color and typography tokens
- `src/lib/players.ts` — independent player directory lookup
- `src/lib/utils.ts` — class-name utility
