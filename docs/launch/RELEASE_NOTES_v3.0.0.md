# AuthentiGen v3.0.0 — open-source AI image humanizer 🎞️

Give AI-generated **images** the fingerprint of a real camera. AuthentiGen runs your images
through a deterministic, pixel-level pipeline — sensor grain, lens optics, chromatic aberration,
color grading, film halation, plus JPEG + camera EXIF — so the output carries the statistical
signatures of real photographic capture instead of looking computer-clean.

Self-hostable. No accounts-as-a-service, no credits, no fees. Clone it and run it.

## ✨ What's new in 3.0.0

- **Image-only & focused.** Removed the experimental video pipeline (and its ffmpeg dependencies)
  to ship a tight, reliable, image-first tool.
- **No monetization.** Stripe, credits, and billing are gone — it's free and open-source.
- **Production-hardened.** Server-side upload size limits, an image-dimension guard (no OOM on
  pathological inputs), and fail-fast on missing secrets in production.
- **Honest by design.** No fake "detection score" — the UI shows the actual per-intensity effect
  profile (grain / warmth / vignette) straight from the real pipeline.
- **Three intensities** — Light / Medium / Heavy — mapped to plausible camera profiles
  (ISO 200 phone → ISO 3200 35 mm film).
- Batch uploads, a job dashboard, admin panel, before/after comparison slider, email/password auth.

## 🚀 Quick start (Docker)

```bash
git clone https://github.com/yh12-10/authentigen
cd authentigen
cp .env.example .env
docker compose up --build
# open http://localhost:3000
```

Or run locally with Node 20+ and MySQL 8 — see the README.

## 🧱 Stack

React 19 · Vite 7 · Tailwind v4 · tRPC · Drizzle + MySQL 8 · sharp · Node/Express.
Strict TypeScript (0 errors), Vitest tests, Prettier, GitHub Actions CI, MIT licensed.

## ⚖️ Honest limitations

It adds real camera/film character at the pixel level — it does **not** repair structural AI tells
(anatomy, geometry, impossible reflections). Results vary by input and by detector; nothing is
guaranteed. A candid Light/Medium/Heavy comparison ships in `docs/humanization-deck/`.

**Full changelog:** v2.0.0…v3.0.0
