export const DETECTORS = [
  "Hive AI",
  "Illuminarty",
  "AI or Not",
  "Hugging Face",
  "Sightengine",
  "Optic AI",
  "Reality Defender",
  "GPTZero",
  "Originality.ai",
  "AIornot.com",
];

export const TESTIMONIALS = [
  {
    name: "Sofia Reyes",
    role: "Creative Director, Atlas Studio",
    initials: "SR",
    quote:
      "AuthentiGen took our AI mood-board renders past every detector our agency uses. The Heavy preset gives them this vintage 35mm patina you cannot get any other way.",
    rating: 5,
  },
  {
    name: "Daniel Kim",
    role: "Indie Filmmaker",
    initials: "DK",
    quote:
      "I shot a 30-second teaser frame-by-frame through the Heavy pipeline. Color grading, grain, micro-shake — it looks like it came out of an Arri.",
    rating: 5,
  },
  {
    name: "Mei Tanaka",
    role: "E-commerce, Lumière",
    initials: "MT",
    quote:
      "We humanize lookbook shots in batches of 10. The credit system makes the cost predictable and the results pass every platform's content checks.",
    rating: 5,
  },
  {
    name: "Marcus Leblanc",
    role: "Photographer",
    initials: "ML",
    quote:
      "The Light preset is so close to the original it just adds the imperfections that make a photo feel real. My favorite secret weapon.",
    rating: 5,
  },
  {
    name: "Priya Chowdhury",
    role: "Brand Strategist",
    initials: "PC",
    quote:
      "Side-by-side slider on the comparison view sells the result instantly to clients. The before/after is the demo.",
    rating: 5,
  },
  {
    name: "Jonas Weber",
    role: "Agency Producer",
    initials: "JW",
    quote:
      "Studio plan + batch processing = we cleared 800 assets in a single afternoon. The ZIP export is the final cherry.",
    rating: 5,
  },
];

export const FAQ_ITEMS = [
  {
    q: "How does AuthentiGen actually defeat AI detectors?",
    a: "We layer cinematographic imperfections that human cameras and film stock produce naturally — sensor noise, chromatic aberration, lens distortion, color grading, micro-blur — at three intensity levels. Detectors look for the absence of these signals; we put them back in.",
  },
  {
    q: "What's the difference between Light, Medium, and Heavy?",
    a: "Light keeps the image nearly identical with subtle ISO 200-style grain and faint vignetting. Medium adds organic color grading, lens imperfections, and depth-of-field micro-blur. Heavy delivers a full vintage 35mm cinematic pass with crushed blacks, teal-orange toning, lens flares, and heavy grain.",
  },
  {
    q: "How long do videos take to humanize?",
    a: "Videos are processed frame-sampled (every 3rd frame) with the original audio passed through unchanged. A 30-second clip on Heavy runs ~5–15 minutes depending on Forge load. The 30-second cap exists so the wait stays predictable.",
  },
  {
    q: "Are my files private?",
    a: "Originals and humanized outputs are stored in a per-user S3 bucket via signed URLs. Nothing is shared, indexed, or used as training data. You can delete a job from the dashboard at any time.",
  },
  {
    q: "What credits cost what?",
    a: "Image: Light 1, Medium 2, Heavy 3. Video: Light 3, Medium 6, Heavy 9. Credits are deducted at job start and refunded automatically if processing fails.",
  },
  {
    q: "Do you offer an API?",
    a: "An authenticated tRPC endpoint is available today. A typed REST/GraphQL bridge is on the Studio plan roadmap. Email us if you need it sooner.",
  },
  {
    q: "Can I refund unused credits?",
    a: "Credits don't expire. Failed jobs auto-refund. We don't process partial refunds for unused balances — we'd rather you keep them and humanize something later.",
  },
  {
    q: "Will detectors update to catch this?",
    a: "Detectors retrain. Our prompts retrain. Your active subscription includes prompt updates as the cat-and-mouse evolves. We track the major detectors weekly.",
  },
];

export const PRICING_BACK_BULLETS: Record<string, string[]> = {
  Free: [
    "10 welcome credits",
    "Image humanization (Light/Medium/Heavy)",
    "Single video preview",
    "Standard processing queue",
    "Community support",
  ],
  Pro: [
    "Everything in Free",
    "Real frame-by-frame video",
    "Batch upload (up to 10)",
    "Priority Forge queue",
    "Email support",
    "Detector update channel",
  ],
  Studio: [
    "Everything in Pro",
    "Highest priority processing",
    "Concurrent video jobs",
    "Custom intensity prompts",
    "Dedicated success manager",
    "Onboarding & training",
  ],
};
