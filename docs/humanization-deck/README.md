# Humanization Results Deck

A self-contained, dark/gold slide deck comparing AuthentiGen's **Light / Medium / Heavy** humanization on three real test subjects — a **portrait**, a **Chanel product shot**, and a **mountain landscape** — with honest per-subject scoring and a plain-spoken limitations slide.

## Open it

Just double-click **`index.html`** (no server, no build step). It opens in any modern browser.

- **Navigate:** `←` / `→` (or `Space`, `PageUp`/`PageDown`), `Home` / `End`, or the on-screen `‹ ›` arrows.
- **Present:** press `F` for fullscreen.
- The deck is a fixed 16:9 stage that scales to fit any window.

## Export to PDF

`Ctrl/Cmd + P` → **Save as PDF**. Set layout to **Landscape**, margins **None**, and enable **Background graphics** so the dark theme and gold accents render. Each slide prints as its own 16:9 page.

## What's inside

`images/` holds optimized (~1400 px, ~100–210 KB) JPEG copies of the actual pipeline output:
`{portrait,product,landscape}-{original,light,medium,heavy}.jpg` — the real before/after results, not mockups.

The effect parameters and findings on the slides are taken straight from the humanizer pipeline (`server/humanizer.ts`), including what it deliberately does **not** do (e.g. it does not repair structural AI tells such as the perfect marble/lake reflections).
