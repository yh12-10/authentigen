# LinkedIn launch — AuthentiGen v3.0.0

Plain text below (no markdown) so it pastes cleanly into LinkedIn.
Attach images in this order: card-hero.png → card-portrait.png → card-landscape.png
(card-product.png is optional — it shows a Chanel bottle, so skip it for a public post.)

================================================================
MAIN POST (copy from the line below)
================================================================

🎞️ AI-generated images always look a little too perfect — no grain, no lens flaws, no film character.

So I built a tool that fixes that — and just open-sourced it.

Meet AuthentiGen: a self-hostable app that gives AI images the fingerprint of a real camera.

It runs each image through a deterministic, 13-step pixel pipeline that adds back what generators leave out:

• Sensor grain & hot pixels
• Chromatic aberration & lens vignetting
• Color-temperature drift & film halation
• Real camera EXIF metadata

…at three intensities — Light, Medium, Heavy (think ISO 200 phone → ISO 3200 35 mm film).

What I cared about while building it:

🔸 Honest, not hype. Zero "100% undetectable" claims. The UI shows the actual effect profile, and the repo ships a candid before/after comparison.
🔸 Real processing, not AI. Pure, deterministic pixel math — no model, no cloud, nothing leaves your machine.
🔸 Yours to run. Self-hosted, MIT-licensed, one command with Docker. No accounts, no credits, no fees.

It's honest about its limits, too: it adds camera realism — it doesn't fix structural AI tells like impossible reflections or anatomy.

👉 Swipe for real before/after results.

⭐ Code + one-command setup: https://github.com/yh12-10/authentigen

Built with React 19, tRPC, Drizzle + MySQL, and sharp. Stars and feedback very welcome 🙏

What would you use it for — a film look, portfolio shots, more realistic datasets? Curious to hear.

#opensource #AI #computervision #imageprocessing #typescript #selfhosted #buildinpublic #generativeAI

================================================================
FIRST COMMENT (post right after — keeps extra links out of the main post)
================================================================

More for the curious 👇
• Release notes (v3.0.0): https://github.com/yh12-10/authentigen/releases/tag/v3.0.0
• How the pipeline works (documented honestly): https://github.com/yh12-10/authentigen/blob/main/ARCHITECTURE.md
• Quick start: clone → `docker compose up` → http://localhost:3000

================================================================
SHORT VARIANT (if you want something punchier)
================================================================

Open-sourced a weekend rabbit hole turned real project: AuthentiGen 🎞️

It gives AI-generated images the fingerprint of a real camera — sensor grain, lens optics, film character, camera EXIF — via a deterministic pixel pipeline. No AI, no cloud, nothing leaves your machine. Self-hosted, MIT, one-command Docker.

No hype: it adds camera realism, it doesn't fix structural AI tells, and there are zero "undetectable" claims.

⭐ https://github.com/yh12-10/authentigen

#opensource #AI #imageprocessing #buildinpublic

================================================================
POSTING CHECKLIST
================================================================

1. (One-time) Cut the GitHub Release so the release link works:
   GitHub → Releases → Draft a new release → choose tag v3.0.0 →
   title "AuthentiGen v3.0.0" → paste RELEASE_NOTES_v3.0.0.md → Publish.
2. New LinkedIn post → upload the 3 cards (hero, portrait, landscape) in order.
3. Paste the MAIN POST text. Post.
4. Immediately add the FIRST COMMENT with the extra links.
5. Tip: the hook (first ~2 lines) is what shows before "…see more" — it's already
   front-loaded. Best time to post: Tue–Thu morning, your timezone.
