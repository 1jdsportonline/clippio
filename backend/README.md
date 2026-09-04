# Clippio backend

Express API backing the Clippio frontend: auth session verification, projects,
video upload, the (mocked) AI processing pipeline, clips, and Stripe billing.

## Stack

- Express (Node 18+)
- Supabase (Postgres + Auth + Storage)
- Stripe (subscriptions)

## Setup

```bash
cp .env.example .env    # fill in Supabase + Stripe keys
npm install
npm run dev              # http://localhost:4000
```

1. Create a Supabase project, then run `src/db/schema.sql` in the SQL editor
   to create tables, RLS policies, and plan limits.
2. Create a Storage bucket named `clippio-uploads` (or set
   `VIDEO_STORAGE_BUCKET` to match an existing one).
3. In Stripe, create two recurring Prices (Creator $9.99/mo, Pro $19.99/mo)
   and put their price IDs in `.env`. Point a webhook at
   `POST /api/billing/webhook` for `checkout.session.completed` and
   `customer.subscription.deleted`.

## What's real vs. mocked

Auth, the database, file storage, usage-limit enforcement, and Stripe
checkout/webhooks are fully wired to real services once you add your keys.

The AI video pipeline is **mocked** — clearly marked in `src/services/`:

- `transcription.js` — fabricates a timestamped transcript instead of calling
  a speech-to-text API.
- `aiClipDetection.js` — scores/selects clip candidates with randomized but
  plausible values instead of an LLM/highlight-detection model.
- `videoProcessing.js` — orchestrates the pipeline and writes clip rows to
  the database, but does not actually cut, crop, or caption-burn video files.
  That step needs a real renderer (ffmpeg on a worker/queue, or a hosted API
  like Shotstack/Remotion) — the spot to plug it in is marked in the file.

Each mock function documents exactly what to swap in and keeps the same
input/output shape, so replacing them shouldn't require touching the routes.

## API overview

| Route | Description |
|---|---|
| `POST /api/auth/bootstrap-profile` | Create a `profiles` row after sign up |
| `GET /api/auth/me` | Current user's profile |
| `GET /api/projects` | List the user's projects |
| `POST /api/projects/upload` | Upload a video, creates a project, starts processing |
| `GET /api/projects/:id` | Project + its clips |
| `GET /api/clips` | All of the user's clips |
| `PATCH /api/clips/:id` | Update clip title/trim/format/captions |
| `POST /api/clips/:id/export` | Queue export (mocked) |
| `POST /api/billing/create-checkout-session` | Start a Stripe Checkout session |
| `POST /api/billing/webhook` | Stripe webhook receiver |

All routes except the webhook expect `Authorization: Bearer <supabase-access-token>`.
