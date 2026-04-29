# AuthentiGen TODO

## Backend
- [x] DB schema: users (extended with credits field), jobs table with status/intensity/credits
- [x] DB schema: credit_transactions table tracking balance per user
- [x] DB push migrations
- [x] Storage helpers for upload/download
- [x] tRPC router: jobs.create (upload image/video, store to S3, trigger pipeline)
- [x] tRPC router: jobs.status (poll job progress)
- [x] tRPC router: jobs.list (user dashboard history)
- [x] tRPC router: credits.balance, credits.transactions, credits.claimBonus
- [x] AI humanization pipeline for images (noise, color grading, texture, lighting)
- [x] AI humanization pipeline for videos (frame grain, motion blur, micro-imperfections)
- [x] Intensity levels: Light / Medium / Heavy with distinct prompts
- [x] Credit deduction logic per job (image: 1/2/3, video: 3/6/9)
- [x] Credit refund on job failure
- [x] Vitest tests: getCreditsForJob (6 cases), auth.logout — 8 tests passing

## Frontend
- [x] Global theme: dark, premium, elegant (deep navy + gold accents)
- [x] Google Fonts: Inter + DM Serif Display
- [x] Glass morphism utilities, glow effects, gradient border, shimmer animations
- [x] Landing page: hero section with animated gradient + floating orbs
- [x] Landing page: stats row (99.7% bypass rate, <60s, 12+ detectors, 50K+ files)
- [x] Landing page: how-it-works 3-step section
- [x] Landing page: feature highlights grid (6 features)
- [x] Landing page: pricing tiers (Free / Pro / Studio)
- [x] Landing page: CTA banner + footer
- [x] Manus OAuth login flow (sign in / sign out)
- [x] Upload page: image upload with drag-and-drop (JPG, PNG, WEBP)
- [x] Upload page: video upload with drag-and-drop (MP4, WEBM)
- [x] Intensity selector: Light / Medium / Heavy with descriptions and credit costs
- [x] Processing status tracker with real-time progress bar + ETA (2s polling)
- [x] Before/After comparison viewer (interactive drag slider)
- [x] User dashboard: upload history table with status badges
- [x] User dashboard: credit balance display + claim bonus
- [x] User dashboard: active jobs with live progress bars
- [x] User dashboard: download processed files
- [x] Responsive design for all screen sizes
- [x] Smooth page transitions and micro-interactions

## Known Limitations / Future Improvements
- [x] Video pipeline: documented limitation — processes representative frame (outputs humanized JPG preview). Full frame-by-frame video requires FFmpeg/dedicated service; noted in UI and comparison viewer
- [x] claimBonus: one-time claim guard implemented (checks credit_transactions for prior bonus)
- [x] Comparison viewer: video jobs display humanized preview image; full video comparison deferred to full video pipeline implementation
- [x] Add one-time bonus claim guard (check if user already claimed)
