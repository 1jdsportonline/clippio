# Clippio

Turn one long video into 10 short-form clips for TikTok, YouTube Shorts, and
Instagram Reels.

This repo has two parts:

- **`frontend/`** — React + Vite + Tailwind. Landing page, auth screens,
  dashboard, upload/processing flow, results grid, and clip editor. Runs
  fully on mock data out of the box.
- **`backend/`** — Express API. Auth session verification, projects, video
  upload to Supabase Storage, a processing pipeline, clips, and Stripe
  billing. Real for auth/database/storage/payments once you add your keys;
  the AI steps (transcription, clip detection, rendering) are mocked with
  clearly marked swap points — see `backend/README.md`.

## Quick start

```bash
# backend
cd backend && cp .env.example .env && npm install && npm run dev

# frontend (separate terminal)
cd frontend && cp .env.example .env && npm install && npm run dev
```

Then run `backend/src/db/schema.sql` in your Supabase project's SQL editor.

## Status

| Piece | Status |
|---|---|
| Landing page, dashboard, editor UI | Built, mock data |
| Auth (Supabase) | Backend routes ready; frontend not yet wired to call them |
| Database schema + RLS | Ready to run |
| Video upload + storage | Ready |
| Usage limits by plan | Ready |
| Stripe checkout + webhook | Ready (needs Stripe keys + price IDs) |
| Transcription | Mocked |
| AI clip detection | Mocked |
| Video rendering (crop/caption/export) | Not implemented — needs ffmpeg or a hosted renderer |

See `frontend/README.md` and `backend/README.md` for details on each piece.
