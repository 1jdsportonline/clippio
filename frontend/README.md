# Clippio frontend

React + Vite + Tailwind. This is the same UI you saw as a Claude artifact,
now set up as a normal deployable project.

## Setup

```bash
cp .env.example .env
npm install
npm run dev     # http://localhost:5173
```

## Current state

`src/App.jsx` runs fully on mock data (uploads, processing, clip generation)
so the app is usable and demoable with zero backend configured — this is
exactly what you already saw in the chat artifact.

`src/lib/api.js` and `src/lib/supabaseClient.js` are scaffolding for wiring
this UI to the real backend: they're not called from `App.jsx` yet. The
integration work still to do is replacing the mock handlers in `App.jsx`
(`handleUpload`, `handleAuth`, `handleProcessingDone`, etc.) with calls to
`uploadVideo()`, `apiGet()`, and `supabase.auth.*` from `lib/`, and polling
or subscribing to `GET /api/projects/:id` for live processing status instead
of the local timer.
