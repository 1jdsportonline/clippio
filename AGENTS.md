# Clippio — Base44 dev notes

Clippio turns long videos into short-form clips. Two parts:

- `frontend/` — React + Vite + Tailwind. **Runs fully on mock data out of the box.**
  `src/App.jsx` does NOT call the backend; `src/lib/api.js` and
  `src/lib/supabaseClient.js` are scaffolding for future wiring. This is the web
  entry point served on host port 3000.
- `backend/` — Express API (auth/projects/clips/billing). Boots without external
  keys (Supabase/Stripe configs warn and routes return 503); exposed on host port
  8000. Not required for the preview since the frontend uses mock data.

## Running here

```
docker compose -f docker-compose.base44.yml up -d --build
```

- Frontend: Vite dev server, bind-mounted at `frontend/`, live reload on edits.
  `vite.config.js` sets `host: true, allowedHosts: true` so the preview's
  external hostname is accepted.
- Backend: nodemon dev server, bind-mounted at `backend/`, live reload on edits.
- Both install deps at container start (anonymous volume keeps `node_modules`
  out of the bind mount).

## Secrets

External credentials (Supabase, Stripe, AI providers) are NOT in the repo.
`.env.base44-defaults` holds empty placeholders so services boot; real values
are delivered by the platform to `/run/base44/app.env` (loaded as the last
`env_file` so they always override). See `.base44/environment.json` for the full
list. The app is demoable with none of these set (frontend mock data).

## Verifying

- Frontend serves on port 3000: `curl -sf -H "Host: x.preview" http://localhost:3000/`
- Backend health: `curl -sf http://localhost:8000/health` → `{"ok":true}`
- After frontend edits, check the browser console for errors (Vite overlay).
