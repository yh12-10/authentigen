<div align="center">

# AuthentiGen

**Give AI-generated images and video the fingerprint of a real camera.**

AuthentiGen is a self-hostable web app that runs images and short videos through a
deterministic, pixel-level pipeline — sensor grain, lens optics, color grading, JPEG/codec
artefacts, and camera EXIF — so the output carries the statistical signatures of real
photographic capture instead of clean synthetic output.

[Quick start](#quick-start) · [How it works](#how-it-works) · [Architecture](ARCHITECTURE.md) · [Contributing](CONTRIBUTING.md) · [Intended use](#intended-use)

</div>

---

## What it is

A full-stack TypeScript SaaS, complete and runnable on your own machine:

- **Real processing, not AI generation.** The core ([`server/humanizer.ts`](server/humanizer.ts)) is a
  ~1000-line deterministic pipeline built on [`sharp`](https://sharp.pixelplumbing.com/) and raw
  buffer math. The output looks nearly identical to the input — it just no longer looks
  *computer-clean*.
- **Images and video.** Images are processed in one pass; short videos are decoded frame-by-frame
  with `ffmpeg`, humanized per frame, and re-encoded to a real MP4 with the original audio.
- **Three intensity levels** — Light / Medium / Heavy — mapped to plausible camera profiles
  (e.g. ISO 200 phone → ISO 3200 35mm film).
- **Everything around it is built:** email/password auth, a credit system with refunds, optional
  Stripe checkout, batch uploads, a job dashboard with live progress, and an admin panel.

## Features

| Area | What's included |
|------|-----------------|
| **Humanization** | 12-step image pipeline + frame-by-frame video pipeline (30s cap), Light/Medium/Heavy intensity |
| **Auth** | Email + password, bcrypt hashing, JWT session cookie (1-year) |
| **Credits** | Per-job deduction, automatic refund on failure, one-time welcome bonus |
| **Payments** | Optional Stripe checkout (3 credit packs) with idempotent webhooks — disabled gracefully if unconfigured |
| **Jobs** | Async processing, progress polling, batch upload (1–10 files) with ZIP download |
| **UI** | React 19 + Tailwind v4 dark theme, before/after comparison slider, synced video pair, dashboard, admin |
| **Quality** | Strict TypeScript (0 errors), 20 passing Vitest tests, Prettier |

## Tech stack

- **Client:** React 19, Vite 7, TypeScript, Tailwind CSS v4, tRPC + React Query, Wouter, Framer Motion, three.js, shadcn/ui (Radix)
- **Server:** Node + Express, tRPC, Drizzle ORM, MySQL 8, `sharp`, `ffmpeg-static`/`ffprobe-static`, `jose` (JWT), `bcryptjs`, Stripe
- **Tooling:** pnpm, esbuild, Vitest, Prettier

---

## Quick start

### Option A — Docker (recommended)

Requires Docker + Docker Compose. This spins up MySQL and the app together, runs migrations,
and serves the app.

```bash
git clone <your-fork-url> authentigen
cd authentigen
cp .env.example .env          # defaults work as-is for local Docker
docker compose up --build
```

Then open the URL printed in the logs (default **http://localhost:3000**). Sign up, claim the
free welcome credits, and upload an image.

### Option B — Manual (local Node + MySQL)

Requires Node 20+, pnpm, and a running MySQL 8 instance.

```bash
git clone <your-fork-url> authentigen
cd authentigen
pnpm install
cp .env.example .env          # then edit DATABASE_URL to point at your MySQL
pnpm db:push                  # create tables
pnpm dev                      # starts on http://localhost:3000 (auto-picks next free port)
```

`ffmpeg`/`ffprobe` are bundled via `ffmpeg-static` / `ffprobe-static` — no system install needed.

### Production build

```bash
pnpm build      # client → dist/public, server → dist/index.js
pnpm start      # NODE_ENV=production
```

---

## Configuration

Copy `.env.example` to `.env`. Summary:

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | ✅ | MySQL connection string. Docker Compose supplies this automatically. |
| `JWT_SECRET` | ✅ (prod) | 32+ char random string for signing sessions. Auto-generated and written to `.env` on first dev run. |
| `APP_BASE_URL` | for Stripe | Public origin used in Stripe success/cancel redirects. |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | optional | Leave blank to disable paid checkout — the UI shows a friendly notice instead. |
| `STRIPE_PRICE_STARTER` / `STRIPE_PRICE_PRO` / `STRIPE_PRICE_STUDIO` | optional | Stripe Price IDs for the three packs. |
| `VIDEO_MAX_DURATION_SECONDS` | optional | Hard cap on input video length (default 30); over-limit jobs auto-refund. |
| `VIDEO_FRAME_SAMPLE_EVERY` | optional | Humanize every Nth frame (default 3). |

### Enabling Stripe (optional)

1. Create three [Stripe Prices](https://dashboard.stripe.com/test/products) and put their IDs in `.env`.
2. Set `STRIPE_SECRET_KEY` and `APP_BASE_URL`.
3. Point a Stripe webhook at `POST {APP_BASE_URL}/api/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET`.

Default packs: **Starter** 50 credits / $4.99 · **Pro** 200 / $14.99 · **Studio** 500 / $29.99.

---

## How it works

A request flows: **upload → tRPC `jobs.create` → async humanizer → local storage → client polls `jobs.status` → before/after view → download.**

The image pipeline applies, in order: barrel distortion → Sobel edge + skin-tone masking →
edge-aware chromatic aberration → shadow crush / highlight clip / micro-banding → ring motion blur →
sensor hot pixels → color-temperature drift → focus-falloff blur → film grain + lens dust + vignette →
mozjpeg re-encode with fake-camera EXIF. Dark/neon scenes additionally get haze, neon bloom, and rain
streaks. Video reuses the same per-frame engine and reassembles with `ffmpeg`.

Credit costs: **image** 1 / 2 / 3 (Light/Medium/Heavy) · **video** 3 / 6 / 9. New users start with 10
credits and can claim a one-time 10-credit welcome bonus.

Full details — data model, job lifecycle, and pipeline internals — are in **[ARCHITECTURE.md](ARCHITECTURE.md)**.

---

## Testing

```bash
pnpm check      # TypeScript (no emit)
pnpm test       # Vitest
pnpm format     # Prettier write
```

## Project structure

```
client/        React + Vite front end (pages, components, hooks)
server/        Express + tRPC API, humanizer & video pipelines, auth, payments, storage
  _core/       Server bootstrap, env, auth, context, vite/static serving
shared/        Constants/types shared between client and server
drizzle/       Drizzle schema + migrations (MySQL)
storage/       Local file storage for uploads and processed output (gitignored)
```

---

## Intended use

AuthentiGen exists to add **authentic photographic and cinematic characteristics** to digital media —
useful for film-look grading, restoring camera realism to synthetic renders, creative/VFX work, and
research into how image-provenance detectors respond to camera-domain noise.

Please use it responsibly and legally. It is **not** intended for academic dishonesty, fraud,
disinformation, defeating content-provenance/watermarking where that is deceptive or unlawful, or
misrepresenting synthetic media as authentic in contexts where authenticity matters. You are
responsible for complying with the laws and platform policies that apply to you. Detector-evasion
outcomes are not guaranteed and vary by input and detector.

## Roadmap

Not yet implemented (contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md)):

- Pluggable object storage (S3) alongside the local filesystem backend
- Rate limiting and abuse protection
- Real email notifications (currently a `console.log` stub)
- A distributed job queue for multi-instance deployments
- Front-end test coverage

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities and current hardening limitations.

## License

[MIT](LICENSE) © 2026 Yousef Ferwana
