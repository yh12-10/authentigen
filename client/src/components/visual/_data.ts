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
      "AuthentiGen gives our AI mood-board renders this vintage 35mm patina you cannot get any other way. The Heavy preset is our go-to.",
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
      "We humanize lookbook shots in batches of 10, and the results look genuinely camera-shot.",
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
    q: "How does AuthentiGen actually work?",
    a: "It layers the imperfections that real cameras and film stock produce naturally — sensor noise, chromatic aberration, lens distortion, color grading, micro-blur — at three intensity levels. Clean synthetic output lacks these signals; this deterministic pixel-level pipeline puts them back in. Results vary by input and by detector — nothing is guaranteed.",
  },
  {
    q: "What's the difference between Light, Medium, and Heavy?",
    a: "Light keeps the image nearly identical with subtle ISO 200-style grain and faint vignetting. Medium adds organic color grading, lens imperfections, and depth-of-field micro-blur. Heavy delivers a full vintage 35mm cinematic pass with crushed blacks, teal-orange toning, lens flares, and heavy grain.",
  },
  {
    q: "How long do videos take to humanize?",
    a: "Videos are processed frame-sampled (every 3rd frame by default) with the original audio passed through unchanged, then reassembled into a real MP4. Time scales with clip length and resolution. The 30-second cap exists so the wait stays predictable.",
  },
  {
    q: "Are my files private?",
    a: "AuthentiGen is self-hosted: originals and humanized outputs are stored on the server you deploy to (local filesystem by default), under per-user keys. Nothing is sent to a third party, indexed, or used as training data. You can remove a job from the dashboard at any time.",
  },
  {
    q: "How much does it cost?",
    a: "Nothing — AuthentiGen is open-source and self-hosted. There are no credits, usage limits, or fees. You run it on your own server and process as much as you like.",
  },
  {
    q: "Do you offer an API?",
    a: "The whole app runs on a typed tRPC API, so an authenticated endpoint is available today. A REST/GraphQL bridge is on the roadmap — contributions welcome, since the project is open-source.",
  },
  {
    q: "Will detectors update to catch this?",
    a: "Detectors evolve, and no realism technique stays ahead forever. Because AuthentiGen is open-source, the pipeline is fully inspectable and you (or the community) can tune and extend it over time. There are no guarantees about any specific detector.",
  },
];
