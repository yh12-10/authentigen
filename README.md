<div align="center">

# AuthentiGen

**Give AI-generated images the fingerprint of a real camera.**

AuthentiGen is a self-hostable web app that runs AI-generated images through a
deterministic, pixel-level pipeline — sensor grain, lens optics, color grading, JPEG
artefacts, and camera EXIF — so the output carries the statistical signatures of real
photographic capture instead of clean synthetic output.

[Quick start](#quick-start) · [How it works](#how-it-works) · [Architecture](ARCHITECTURE.md) · [Contributing](CONTRIBUTING.md) · [Intended use](#intended-use)

</div>

---

## What it is

A full-stack TypeScript web app, complete and runnable on your own machine:

- **Real processing, not AI generation.** The core ([`server/humanizer.ts`](server/humanizer.ts)) is a
  ~1000-line deterministic pipeline built on [`sharp`](https://sharp.pixelplumbing.com/) and raw
  buffer math. The output looks nearly identical to the input — it just no longer looks
  _computer-clean_.
- **Images.** Each upload is processed in one pass through the deterministic pixel pipeline
  (JPG / PNG / WEBP, up to 20 MB).
- **Three intensity levels** — Light / Medium / Heavy — mapped to plausible camera profiles
  (e.g. ISO 200 phone → ISO 3200 35mm film).
- **Free and unlimited.** Self-hosted with no credits, paywalls, or usage limits — run it on your own
  server and process as much as you like.
- **Everything around it is built:** email/password auth, batch uploads, a job dashboard with live
  progress, and an admin panel.

## Features

| Area             | What's included                                                                     |
| ---------------- | ----------------------------------------------------------------------------------- |
| **Humanization** | 13-step deterministic image pipeline, Light/Medium/Heavy intensity                  |
| **Auth**         | Email + password, bcrypt hashing, JWT session cookie (1-year)                       |
| **Jobs**         | Async processing, progress polling, batch upload (1–10 files) with ZIP download     |
| **UI**           | React 19 + Tailwind v4 dark theme, before/after comparison slider, dashboard, admin |
| **Quality**      | Strict TypeScript (0 errors), passing Vitest tests (server + client), Prettier      |

## Tech stack

- **Client:** React 19, Vite 7, TypeScript, Tailwind CSS v4, tRPC + React Query, Wouter, Framer Motion, three.js, shadcn/ui (Radix)
- **Server:** Node + Express, tRPC, Drizzle ORM, MySQL 8, `sharp`, `jose` (JWT), `bcryptjs`
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

Then open the URL printed in the logs (default **http://localhost:3000**). Sign up and upload an image.

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

### Production build

```bash
pnpm build      # client → dist/public, server → dist/index.js
pnpm start      # NODE_ENV=production
```

---

## Configuration

Copy `.env.example` to `.env`. Summary:

| Variable                                                                  | Required  | Notes                                                                                                                                           |
| ------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                            | ✅        | MySQL connection string. Docker Compose supplies this automatically.                                                                            |
| `JWT_SECRET`                                                              | ✅ (prod) | 32+ char random string for signing sessions. Auto-generated and written to `.env` on first dev run.                                             |
| `APP_BASE_URL`                                                            | optional  | Public origin used in links (e.g. job-completion emails).                                                                                       |
| `STORAGE_BACKEND`                                                         | optional  | `local` (default) or `s3`. See [Storage backends](#storage-backends).                                                                           |
| `S3_BUCKET` / `S3_REGION` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | for S3    | Required when `STORAGE_BACKEND=s3`. `S3_ENDPOINT` + `S3_FORCE_PATH_STYLE` enable R2/MinIO/B2; `S3_PUBLIC_URL` serves long-lived URLs via a CDN. |
| `SMTP_HOST` / `SMTP_FROM` / `SMTP_*`                                      | optional  | Enable email; blank disables it (logs to console). See [Email](#email). `OWNER_EMAIL` receives admin notifications.                             |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX`                                 | optional  | API rate limit (default 100 req / 60s). Set `TRUST_PROXY` behind a proxy.                                                                       |
| `MAX_CONCURRENT_IMAGE_JOBS`                                               | optional  | Cap on simultaneous image humanizations (default 4).                                                                                            |

### Storage backends

By default, uploads and processed output are stored on the local filesystem under `storage/` and served
via the `/storage` route. To use object storage, set `STORAGE_BACKEND=s3` plus `S3_BUCKET`, `S3_REGION`,
and AWS credentials. It works with any S3-compatible service — set `S3_ENDPOINT` (and
`S3_FORCE_PATH_STYLE=true` for MinIO) for Cloudflare R2, MinIO, or Backblaze B2. Set `S3_PUBLIC_URL` to a
public/CDN base for long-lived links; otherwise the app issues presigned URLs (max 7-day expiry). The
Compose `dev` profile includes a MinIO service for local testing — see below.

### Email

Email is optional and off unless configured — `notifyOwner` and job-completion notices fall back to
console logging. Set `SMTP_HOST`, `SMTP_FROM` (and `SMTP_USER`/`SMTP_PASSWORD` if your provider needs
auth) for any SMTP provider. For local testing, `docker compose --profile dev up` starts
[Mailhog](http://localhost:8025) — point `SMTP_HOST=mailhog`, `SMTP_PORT=1025`.

---

## How it works

A request flows: **upload → tRPC `jobs.create` → async humanizer → local storage → client polls `jobs.status` → before/after view → download.**

The image pipeline applies, in order: barrel distortion → Sobel edge + skin-tone masking →
edge-aware chromatic aberration → shadow crush / highlight clip / micro-banding → ring motion blur →
sensor hot pixels → color-temperature drift → focus-falloff blur → film grain + lens dust + vignette →
mozjpeg re-encode with fake-camera EXIF. Dark/neon scenes additionally get haze, neon bloom, and rain
streaks.

Processing is free and unlimited — there are no credits or per-job costs.

Full details — data model, job lifecycle, and pipeline internals — are in **[ARCHITECTURE.md](ARCHITECTURE.md)**.

---

## Testing

```bash
pnpm check      # TypeScript (no emit)
pnpm test       # Vitest — server (node) + client (jsdom) projects
pnpm format     # Prettier write
```

## Project structure

```
client/        React + Vite front end (pages, components, hooks)
server/        Express + tRPC API, humanizer pipeline, auth, storage
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

Done recently: pluggable S3 storage, SMTP email, API rate limiting, crash-recovery for jobs, and a
front-end test project. Still open (contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md)):

- A distributed job queue (e.g. Redis/BullMQ) for multi-instance deployments
- On-read presigned URLs so S3 links never expire without a CDN
- Broader front-end and integration test coverage
- Email verification on signup

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities and current hardening limitations.

## License

[MIT](LICENSE) © 2026 Yousef Ferwana
