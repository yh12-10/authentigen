# Architecture

AuthentiGen is a single-deployable TypeScript monorepo: a React/Vite front end and an
Express + tRPC back end that share types. In development the Express server mounts Vite as
middleware; in production it serves the pre-built client from `dist/public`.

```
client/   React 19 + Vite + Tailwind v4 front end
server/   Express + tRPC API, humanizer/video pipelines, auth, payments, storage
  _core/  bootstrap (index.ts), env, auth, context, vite/static serving, types
shared/   constants/types shared by client and server
drizzle/  schema.ts + migrations (MySQL via Drizzle ORM)
storage/  local file storage (gitignored; auto-created at runtime)
```

## Request & job flow

```
Client (React)
  │  tRPC over /api/trpc  (type-safe, superjson)
  ▼
Express server (server/_core/index.ts)
  ├─ Stripe webhook (raw body, registered before express.json)
  ├─ /storage/*        static + proxy for stored files
  ├─ /api/batch/:id/download   streams a ZIP of a batch
  └─ tRPC router (server/routers.ts)
        ├─ auth.*      signup / login / logout / me   (JWT cookie)
        ├─ jobs.*      create / status / list
        ├─ credits.*   balance / transactions / claimBonus
        ├─ payments.*  isConfigured / packs / createCheckoutSession
        ├─ batch.*     create / status
        └─ admin.*     stats / users / jobs / grantCredits / dailyRevenue
```

A humanization job is **fire-and-forget async** inside the same process:

1. `jobs.create` stores the uploaded file (base64 → `storage/originals/...`) and inserts a `jobs`
   row with status `pending`, then triggers processing without blocking the response.
2. The processor sets status `processing`, **deducts credits**, runs the pipeline, writes the result
   to `storage/processed/...`, and sets status `completed` with `progress = 100`.
3. On any failure the job is marked `failed` and the credits are **refunded** (a `refund` transaction).
4. The client polls `jobs.status` (~2s) and renders progress, then the before/after view.

Video jobs additionally pass through a **per-user in-process semaphore** so a single user can only
run one video at a time. There is no external queue — this is a single-instance design (see
[SECURITY.md](SECURITY.md) for scaling caveats).

## The humanization pipeline

`server/humanizer.ts` — deterministic, no AI generation. Raw RGB buffer math via `sharp`. Applied in
order, scaled by intensity (Light 20% / Medium 55% / Heavy 100% of the heavy baseline):

1. Decode original → raw RGB
2. Subtle barrel distortion (inverse map + bilinear interpolation)
3. Sobel edge mask + skin-tone mask (so effects spare faces/smooth regions)
4. Edge-aware chromatic aberration (red shifts right, blue left)
5. Shadow crush + highlight clip + horizontal micro-banding
6. Directional motion blur confined to the outer ~15% ring
7. Sensor hot pixels (random bright single-pixel dots)
8. Color-temperature drift (per-channel linear)
9. Focus-falloff Gaussian blur
10. Composite: Gaussian film grain + lens dust + vignette
11. Dark/neon scenes only: atmospheric haze, neon bloom, rain streaks, film halation
12. mozjpeg re-encode (4:2:0 chroma) with fabricated camera EXIF (Make/Model/ISO/etc.)

Each intensity maps to a camera profile (grain σ, CA shift, vignette, blur, JPEG quality, EXIF). See
the `Profile` table and `INTENSITY_SCALE` near the top of the file.

### Video (`server/video.ts`)

1. Download original to a temp dir; `ffprobe` for duration/fps/audio
2. Reject + refund if longer than `VIDEO_MAX_DURATION_SECONDS`
3. `ffmpeg` extracts every `VIDEO_FRAME_SAMPLE_EVERY`-th frame to PNG
4. Each frame runs through the image humanizer; progress updates as frames complete
5. `ffmpeg` reassembles the humanized frames into an H.264 MP4, copying the original audio
6. Upload the MP4; temp dir is always cleaned in `finally` (plus a startup sweep of orphans > 1h)

## Data model (`drizzle/schema.ts`)

- **users** — `id`, `email` (unique), `passwordHash`, `loginMethod`, `role` (`user`/`admin`),
  `credits`, `bonusClaimed`, `stripeCustomerId`, timestamps. `openId` is reserved for future SSO.
- **jobs** — `userId`, `type` (`image`/`video`), `status`, `intensity`, original/processed keys+URLs,
  `progress`, `creditsUsed`, `errorMessage`, `batchId`, plus video fields (`durationSeconds`,
  `frameCount`, `framesProcessed`), timestamps.
- **credit_transactions** — append-only ledger: `userId`, optional `jobId`, signed `amount`,
  `type` (`purchase`/`usage`/`bonus`/`refund`), `description`, unique `stripeSessionId` (webhook
  idempotency key).

## Auth (`server/_core/auth.ts`)

Native email/password. `bcryptjs` hashes; sessions are HS256 JWTs (`jose`) carrying `{ uid }`, stored
in an httpOnly cookie for one year. `JWT_SECRET` signs them (auto-generated in dev, required in prod).
There is no third-party OAuth dependency.

## Payments (`server/payments.ts` + `_core/stripeWebhook`)

Optional. If Stripe env vars are absent, `payments.isConfigured` returns false and the UI hides
checkout. When enabled: `createCheckoutSession` builds a Stripe-hosted checkout for a pack; the webhook
verifies the signature (raw body) and grants credits idempotently via the unique `stripeSessionId`.

## Storage (`server/storage.ts`)

Local filesystem under `storage/`, served at `/storage/*`. Keys get a random suffix; a
`safeAbsolutePath` guard prevents path traversal. Swapping in S3 is the natural first extension point
(the AWS SDK is already a dependency).

## Conventions

- All API surface is tRPC procedures in `server/routers.ts` — add new endpoints there; types flow to
  the client automatically.
- Credit math lives in `getCreditsForJob` (image) / `getCreditsForVideo` (video) and is unit-tested.
- Keep the humanizer **deterministic** — no randomness that can't be reproduced from input + intensity.
