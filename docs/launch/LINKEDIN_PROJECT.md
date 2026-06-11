# LinkedIn — Projects section entry

Profile → Add profile section → Recommended → Add projects.
Paste each field below. (Description limit is 2,000 characters; the full version fits.)

================================================================
PROJECT NAME
================================================================
AuthentiGen — Open-source AI Image Humanizer

(Alternates:)
• AuthentiGen — AI Image Humanizer (open-source, self-hosted)
• AuthentiGen

================================================================
PROJECT URL
================================================================
https://github.com/yh12-10/authentigen

================================================================
DESCRIPTION — full (paste-ready, ~1,650 chars)
================================================================
AuthentiGen is an open-source, self-hostable web app that makes AI-generated images look like real photographs. AI generators produce output that's statistically "too clean" — AuthentiGen runs each image through a deterministic, 13-step pixel pipeline that reintroduces the imperfections of real photographic capture: sensor grain, chromatic aberration, lens vignetting, color-temperature drift, film halation, and authentic camera EXIF — at three configurable intensities (Light / Medium / Heavy).

I designed and built the full stack end-to-end:
• Backend — Node + Express, tRPC, Drizzle ORM + MySQL, and the sharp imaging engine: a ~1,000-line deterministic pipeline (no AI model, no cloud calls).
• Frontend — React 19, Vite, Tailwind CSS v4: a job dashboard, batch uploads, an interactive before/after comparison slider, and an admin panel.
• Production-readiness — email/password auth (JWT + bcrypt), API rate limiting, server-side input validation, crash-safe job recovery, pluggable local/S3 storage, a one-command Docker deploy, GitHub Actions CI, and Vitest tests.

Principles I held to:
• Honest positioning — no "100% undetectable" claims; the repo ships a candid before/after comparison and is upfront that it adds camera realism without fixing structural AI tells.
• Privacy by design — fully self-hosted; nothing leaves the user's machine.
• Zero monetization — MIT-licensed and free, no credits or paywalls.

Shipped as v3.0.0 with strict TypeScript (0 type errors), passing tests, and CI.

Tech: TypeScript · React · tRPC · Drizzle · MySQL · sharp · Docker.

================================================================
DESCRIPTION — short (paste-ready, ~520 chars)
================================================================
Open-source, self-hostable web app that gives AI-generated images the fingerprint of a real camera — sensor grain, lens optics, film character, and camera EXIF — via a deterministic 13-step pixel pipeline (no AI model, no cloud). I built the full stack: React 19 + Tailwind front end; Node/Express + tRPC + Drizzle/MySQL + sharp back end; auth, rate limiting, crash-safe jobs, Docker, and CI. MIT-licensed, privacy-first, honest by design (no "undetectable" claims). Shipped as v3.0.0.

================================================================
DATES
================================================================
Start date: <month you started, e.g. Apr 2026>
End date:   leave unchecked → tick "I am currently working on this project"
            (or set to Jun 2026 to mark the v3.0.0 release)

================================================================
SKILLS TO ADD (LinkedIn lets you tag a few — pick the strongest)
================================================================
TypeScript · React.js · Node.js · Full-Stack Development · tRPC ·
Docker · MySQL · Image Processing · Computer Vision · Open-Source Software ·
Tailwind CSS · REST/RPC APIs

================================================================
ASSOCIATED WITH
================================================================
Link it to your current role or your education entry (optional but boosts visibility).

================================================================
TIP — make it visual too
================================================================
The Projects section is text-only, but you can showcase the images two ways:
• Featured section: Profile → Add section → Featured → add the launch post (it carries the cards), or upload a PDF one-pager.
• Want a polished 1-page PDF (dark/gold, hero + before/after + highlights) for Featured? I can generate it — just say the word.
