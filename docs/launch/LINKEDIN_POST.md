# LinkedIn post — AuthentiGen v3.0.0

Attach the images in this order: card-hero.png → card-portrait.png → card-landscape.png
(→ card-product.png optional; see note).

---

🎞️ I just open-sourced **AuthentiGen** — a self-hostable tool that gives AI-generated images the fingerprint of a real camera.

AI image generators produce output that's *too* clean — no sensor noise, no lens imperfections, no film character. AuthentiGen runs an image through a deterministic, 13-step pixel pipeline that puts those back: grain, chromatic aberration, lens vignette, color-temperature drift, film halation, and real camera EXIF — at three intensities (Light / Medium / Heavy).

A few things I cared about building it:

🔸 **Honest, not hype.** No "100% undetectable" claims. The UI shows the actual effect profile, and the repo ships a candid before/after comparison.
🔸 **Real processing, not AI.** Pure, deterministic pixel math (sharp) — no model, no cloud calls, no data leaving your server.
🔸 **Yours to run.** Self-hosted, MIT-licensed, one command with Docker. No accounts, no credits, no fees.

It's honest about its limits, too: it adds camera realism — it doesn't fix structural AI tells like impossible reflections or anatomy.

Swipe for real before/after examples 👉

⭐ Code + docs: github.com/yh12-10/authentigen

#opensource #AI #computervision #imageprocessing #typescript #selfhosted #buildinpublic

---

## Shorter variant

Open-sourced a weekend-rabbit-hole-turned-real-project: **AuthentiGen** 🎞️

It gives AI-generated images the fingerprint of a real camera — sensor grain, lens optics, film character, camera EXIF — via a deterministic pixel pipeline (no AI, no cloud). Self-hosted, MIT, one-command Docker.

No hype: it adds camera realism, it doesn't fix structural AI tells, and there are zero "undetectable" claims.

⭐ github.com/yh12-10/authentigen

#opensource #AI #imageprocessing #buildinpublic
