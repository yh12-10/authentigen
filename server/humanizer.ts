/**
 * AuthentiGen — Pixel-Level Image Humanization Pipeline
 * ────────────────────────────────────────────────────────────────────────────
 * Real, deterministic pixel-level processing using sharp + raw buffer math.
 * NO AI image generation. The output looks nearly identical to the input but
 * carries the statistical pixel signatures of a real camera (sensor noise,
 * lens optics, JPEG DCT artefacts, EXIF metadata) — defeating AI detectors.
 *
 * Pipeline, in order:
 *   1. Download original from URL or local /storage path → raw RGB
 *   2. Subtle barrel distortion (custom kernel: inverse map + bilinear)
 *   3. Sobel edge mask + skin-tone mask
 *   4. Edge-aware chromatic aberration (R right, B left, weak on skin/smooth)
 *   5. Shadow crush + highlight clip + horizontal micro-banding (one pass)
 *   6. Directional motion blur restricted to the outer 15% ring
 *   7. Sensor hot pixels (random single-pixel bright dots)
 *   8. Color-temperature drift (per-channel linear: red+, blue−)
 *   9. Focus-falloff Gaussian blur
 *   10. Composite stack: Gaussian film grain + lens dust + lens vignette
 *   11. JPEG re-encode (mozjpeg, 4:2:0 chroma) with fake-camera EXIF
 *   12. Upload result, return URL
 *
 * Intensity scaling for the "new" effects (hot pixels, dust, motion blur,
 * highlight clip, shadow crush, banding) is exactly 20% / 55% / 100%
 * of the heavy baseline — see INTENSITY_SCALE.
 */

import sharp from "sharp";
import { storagePut, storageGetBuffer } from "./storage";
import {
  updateJobProgress,
  updateJobStatus,
  deductCredits,
  getJobById,
  getUserById,
  addCredits,
} from "./db";
import { sendJobCompletionEmail } from "./_core/email";
import { ENV } from "./_core/env";

export type IntensityLevel = "light" | "medium" | "heavy";
export type MediaType = "image" | "video";

// ─── Tuning tables ────────────────────────────────────────────────────────────

interface Profile {
  // Existing per-pixel ops
  grainSigma: number;
  caShift: number;
  vignetteStrength: number;
  blurSigma: number;
  redBoost: number;
  blueReduce: number;
  barrelK: number;
  jpegQuality: number;
  // Film halation — soft warm bloom from highlights, like 35mm film stock
  halationStrength: number; // 0..1
  halationSigma: number;    // gaussian blur sigma for the bloom radius
  exif: {
    Make: string;
    Model: string;
    Software: string;
    ISO: number;
    FNumber: string;
    ExposureTime: string;
    FocalLength: string;
  };
}

const PROFILES: Record<IntensityLevel, Profile> = {
  light: {
    grainSigma: 4, caShift: 1, vignetteStrength: 0.10, blurSigma: 0.3,
    redBoost: 4, blueReduce: -3, barrelK: 0.0005, jpegQuality: 88,
    halationStrength: 0.08, halationSigma: 14,
    exif: {
      Make: "Apple", Model: "iPhone 14", Software: "iOS 17.4.1",
      ISO: 200, FNumber: "1.78", ExposureTime: "1/200", FocalLength: "5.7",
    },
  },
  medium: {
    grainSigma: 10, caShift: 2, vignetteStrength: 0.20, blurSigma: 0.5,
    redBoost: 8, blueReduce: -6, barrelK: 0.001, jpegQuality: 82,
    halationStrength: 0.18, halationSigma: 19,
    exif: {
      Make: "Apple", Model: "iPhone 13 Pro", Software: "iOS 16.6",
      ISO: 800, FNumber: "1.5", ExposureTime: "1/60", FocalLength: "5.7",
    },
  },
  heavy: {
    // 35 mm film vibe: less grain, lighter vignette, warmer bloom.
    grainSigma: 14, caShift: 3, vignetteStrength: 0.22, blurSigma: 0.8,
    redBoost: 14, blueReduce: -10, barrelK: 0.002, jpegQuality: 75,
    halationStrength: 0.32, halationSigma: 24,
    exif: {
      Make: "Canon", Model: "EOS R5", Software: "Adobe Lightroom 13.0",
      ISO: 3200, FNumber: "1.4", ExposureTime: "1/30", FocalLength: "50",
    },
  },
};

/** Applied to all 6 "new" effects: hot pixels, dust, motion-blur, highlight clip, shadow crush, banding. */
const INTENSITY_SCALE: Record<IntensityLevel, number> = {
  light: 0.2,
  medium: 0.55,
  heavy: 1.0,
};

/** Heavy-intensity (100%) baselines for the 6 new effects. Other intensities use INTENSITY_SCALE × these. */
const HEAVY_BASE = {
  hotPixelCount: 15,            // 5–15 per spec
  dustSpotCount: 5,             // 2–5 per spec
  motionBlurFactor: 1.0,        // alpha of motion-blurred copy at the outermost edge
  highlightStrength: 0.6,       // 0..1 push toward white above threshold
  shadowStrength: 0.55,         // 0..1 push toward black below threshold
  bandingAmplitude: 2.0,        // ±N pixel value variation
};

// ─── Pure pixel kernels ──────────────────────────────────────────────────────

/** Box-Muller Gaussian noise → grey RGB buffer centred at 128 with stddev sigma. */
function gaussianNoiseRgb(width: number, height: number, sigma: number): Buffer {
  const buf = Buffer.alloc(width * height * 3);
  for (let i = 0; i < buf.length; i += 3) {
    const u1 = Math.max(Number.EPSILON, Math.random());
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const v = Math.max(0, Math.min(255, Math.round(128 + z * sigma)));
    buf[i] = v; buf[i + 1] = v; buf[i + 2] = v;
  }
  return buf;
}

/** Convert RGB raw buffer to 1-channel greyscale (Rec. 601 luma). */
function rgbToGreyscale(rgb: Buffer, W: number, H: number): Buffer {
  const out = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) {
    const r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2];
    out[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }
  return out;
}

/** Sobel edge magnitude (3×3) on a greyscale buffer. Output normalised to 0..255. */
function sobelEdgeMagnitude(grey: Buffer, W: number, H: number): Buffer {
  const out = Buffer.alloc(W * H);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const tl = grey[(y - 1) * W + (x - 1)];
      const tc = grey[(y - 1) * W + x];
      const tr = grey[(y - 1) * W + (x + 1)];
      const ml = grey[y * W + (x - 1)];
      const mr = grey[y * W + (x + 1)];
      const bl = grey[(y + 1) * W + (x - 1)];
      const bc = grey[(y + 1) * W + x];
      const br = grey[(y + 1) * W + (x + 1)];
      const gx = -tl + tr - 2 * ml + 2 * mr - bl + br;
      const gy = -tl - 2 * tc - tr + bl + 2 * bc + br;
      const mag = Math.sqrt(gx * gx + gy * gy);
      out[y * W + x] = Math.min(255, Math.round(mag));
    }
  }
  return out;
}

/** Per-pixel skin-tone mask: returns 1 for skin-likely pixels, 0 otherwise. */
function buildSkinMask(rgb: Buffer, W: number, H: number): Uint8Array {
  const out = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2];
    // Classic RGB-domain skin rule (Kovac et al, daylight variant)
    const isSkin =
      r > 95 && g > 40 && b > 20 &&
      r > g && r > b &&
      Math.abs(r - g) > 12 &&
      r - b > 12 &&
      Math.max(r, g, b) - Math.min(r, g, b) > 10;
    out[i] = isSkin ? 1 : 0;
  }
  return out;
}

/**
 * Edge-aware chromatic aberration.
 *   factor = 0.2  for skin pixels (looks unnatural on flat skin tones)
 *   factor = 0.2 + 0.8 × (sobel/255)  elsewhere (full strength on hard edges)
 *   shift  = round(maxShift × factor)  per pixel
 */
function applyEdgeAwareCA(
  rgb: Buffer,
  W: number,
  H: number,
  maxShift: number,
  edgeMag: Buffer,
  skin: Uint8Array
): Buffer {
  if (maxShift <= 0) return rgb;
  const out = Buffer.alloc(rgb.length);

  for (let y = 0; y < H; y++) {
    const rowBase = y * W;
    for (let x = 0; x < W; x++) {
      const idx = rowBase + x;
      let factor: number;
      if (skin[idx]) {
        factor = 0.2;
      } else {
        const edge = edgeMag[idx] / 255;
        factor = 0.2 + 0.8 * edge;
      }
      const shift = Math.round(maxShift * factor);

      const rx = shift > 0 ? Math.max(0, x - shift) : x;
      const bx = shift > 0 ? Math.min(W - 1, x + shift) : x;

      out[idx * 3]     = rgb[(rowBase + rx) * 3];     // red shifted right
      out[idx * 3 + 1] = rgb[idx * 3 + 1];            // green unchanged
      out[idx * 3 + 2] = rgb[(rowBase + bx) * 3 + 2]; // blue shifted left
    }
  }
  return out;
}

/** Subtle barrel distortion via custom kernel: inverse map + bilinear sample. */
function applyBarrelDistortion(
  rgb: Buffer, W: number, H: number, k: number
): Buffer {
  if (k === 0) return rgb;
  const out = Buffer.alloc(rgb.length);
  const cx = W / 2, cy = H / 2;
  const norm = Math.sqrt(cx * cx + cy * cy);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (x - cx) / norm;
      const dy = (y - cy) / norm;
      const r2 = dx * dx + dy * dy;
      const factor = 1 + k * r2;
      const sx = cx + dx * factor * norm;
      const sy = cy + dy * factor * norm;

      const x0 = Math.floor(sx), y0 = Math.floor(sy);
      const fx = sx - x0, fy = sy - y0;
      const cx0 = Math.max(0, Math.min(W - 1, x0));
      const cx1 = Math.max(0, Math.min(W - 1, x0 + 1));
      const cy0 = Math.max(0, Math.min(H - 1, y0));
      const cy1 = Math.max(0, Math.min(H - 1, y0 + 1));

      const dst = (y * W + x) * 3;
      for (let c = 0; c < 3; c++) {
        const p00 = rgb[(cy0 * W + cx0) * 3 + c];
        const p10 = rgb[(cy0 * W + cx1) * 3 + c];
        const p01 = rgb[(cy1 * W + cx0) * 3 + c];
        const p11 = rgb[(cy1 * W + cx1) * 3 + c];
        const top = p00 * (1 - fx) + p10 * fx;
        const bot = p01 * (1 - fx) + p11 * fx;
        out[dst + c] = Math.round(top * (1 - fy) + bot * fy);
      }
    }
  }
  return out;
}

/** Combined tone-mapping + horizontal micro-banding pass (one read/write per pixel). */
function applyToneAndBanding(
  rgb: Buffer,
  W: number,
  H: number,
  highlightStrength: number,
  shadowStrength: number,
  bandingAmplitude: number
): Buffer {
  const out = Buffer.alloc(rgb.length);
  const hiThresh = 230;
  const loThresh = 25;

  for (let y = 0; y < H; y++) {
    // Subtle ±N offset that varies per row → rolling-shutter readout artefact
    const bandOffset = Math.sin(y * 0.31) * bandingAmplitude;

    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 3;
      let r = rgb[idx], g = rgb[idx + 1], b = rgb[idx + 2];

      // Shadow crush — push near-black toward 0
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      if (luma < loThresh) {
        const t = (loThresh - luma) / loThresh; // 0..1
        const f = t * shadowStrength;
        r = r * (1 - f);
        g = g * (1 - f);
        b = b * (1 - f);
      }

      // Highlight clip — push near-white toward 255 with soft feather
      const maxC = Math.max(r, g, b);
      if (maxC > hiThresh) {
        const t = (maxC - hiThresh) / (255 - hiThresh); // 0..1
        const f = t * highlightStrength;
        r = r * (1 - f) + 255 * f;
        g = g * (1 - f) + 255 * f;
        b = b * (1 - f) + 255 * f;
      }

      // Banding (clamp to byte range)
      out[idx]     = Math.max(0, Math.min(255, Math.round(r + bandOffset)));
      out[idx + 1] = Math.max(0, Math.min(255, Math.round(g + bandOffset)));
      out[idx + 2] = Math.max(0, Math.min(255, Math.round(b + bandOffset)));
    }
  }
  return out;
}

/** Directional motion blur applied only in the outer 15% ring (smoothstep falloff). */
function applyMotionBlurEdgeRing(
  rgb: Buffer,
  W: number,
  H: number,
  blurDistance: number,
  angleRadians: number,
  intensityFactor: number,        // 0..1 — mixes in the motion-blurred copy
  ringStart = 0.85
): Buffer {
  if (blurDistance <= 0 || intensityFactor <= 0) return rgb;
  const out = Buffer.from(rgb); // start as a copy of the input

  const dx = Math.round(blurDistance * Math.cos(angleRadians));
  const dy = Math.round(blurDistance * Math.sin(angleRadians));
  if (dx === 0 && dy === 0) return out;

  const cx = W / 2, cy = H / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const fdx = x - cx, fdy = y - cy;
      const dist = Math.sqrt(fdx * fdx + fdy * fdy) / maxDist;
      if (dist < ringStart) continue; // only the outer 15% gets motion blur

      let t = (dist - ringStart) / (1 - ringStart);
      t = Math.min(1, t);
      const mix = t * t * (3 - 2 * t) * intensityFactor; // smoothstep × intensity

      const x1 = Math.max(0, Math.min(W - 1, x - dx));
      const y1 = Math.max(0, Math.min(H - 1, y - dy));
      const x2 = Math.max(0, Math.min(W - 1, x + dx));
      const y2 = Math.max(0, Math.min(H - 1, y + dy));

      const baseIdx = (y * W + x) * 3;
      for (let c = 0; c < 3; c++) {
        const v0 = rgb[baseIdx + c];
        const v1 = rgb[(y1 * W + x1) * 3 + c];
        const v2 = rgb[(y2 * W + x2) * 3 + c];
        const blurred = (v0 + v1 + v2) / 3;
        out[baseIdx + c] = Math.round(v0 * (1 - mix) + blurred * mix);
      }
    }
  }
  return out;
}

// ─── Anamorphic lens flares ──────────────────────────────────────────────────

interface BrightCluster {
  x: number;
  y: number;
  luma: number;
}

/**
 * Find the top N brightest spatially-separated pixel clusters.
 * Filters out skin pixels (no flares on faces) and single-pixel highlights
 * (eye catchlights, hot pixels) by requiring ≥5 of 9 neighbours to also be
 * near the threshold. Used to seed anamorphic flares only on real light
 * sources — neon signs, headlights, the sun.
 */
function findBrightestClusters(
  rgb: Buffer,
  W: number,
  H: number,
  maxCount: number,
  minLuma: number,
  minSeparationPx: number,
  skinMask?: Uint8Array
): BrightCluster[] {
  const npx = W * H;
  const luma = new Uint8Array(npx);
  for (let i = 0; i < npx; i++) {
    luma[i] = Math.round(
      0.299 * rgb[i * 3] + 0.587 * rgb[i * 3 + 1] + 0.114 * rgb[i * 3 + 2]
    );
  }

  const isRealCluster = (x: number, y: number): boolean => {
    let count = 0;
    const t = minLuma - 10;
    for (let dy = -1; dy <= 1; dy++) {
      const ny = y + dy;
      if (ny < 0 || ny >= H) continue;
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        if (nx < 0 || nx >= W) continue;
        if (luma[ny * W + nx] > t) count++;
      }
    }
    return count >= 5;
  };

  const picked: BrightCluster[] = [];
  const minSepSq = minSeparationPx * minSeparationPx;

  for (let attempt = 0; attempt < maxCount; attempt++) {
    let bestI = -1;
    let bestL = minLuma;
    for (let i = 0; i < npx; i++) {
      const v = luma[i];
      if (v <= bestL) continue;
      if (skinMask && skinMask[i]) continue;

      const x = i % W;
      const y = (i / W) | 0;

      // Reject too-close to already-picked clusters
      let blocked = false;
      for (const p of picked) {
        const dx = x - p.x;
        const dy = y - p.y;
        if (dx * dx + dy * dy < minSepSq) {
          blocked = true;
          break;
        }
      }
      if (blocked) continue;

      // Reject single-pixel highlights — must have neighbours
      if (!isRealCluster(x, y)) continue;

      bestI = i;
      bestL = v;
    }
    if (bestI < 0) break;
    picked.push({
      x: bestI % W,
      y: (bestI / W) | 0,
      luma: bestL,
    });
  }
  return picked;
}

/**
 * Render anamorphic horizontal streaks at each cluster.
 *   - Vertical: linear falloff over ±4 px
 *   - Horizontal: gaussian (σ = W × 0.12) — long, soft, cinematic
 *   - Colours alternate cool blue → warm orange → cool blue
 *   - `baseOpacity` = 0.15 × intensity scale (0.03 / 0.083 / 0.15)
 *   - Mode: alpha-blend (`out = base × (1−s) + colour × s`)
 */
function applyAnamorphicFlares(
  rgb: Buffer,
  W: number,
  H: number,
  flares: BrightCluster[],
  baseOpacity: number
): Buffer {
  if (flares.length === 0 || baseOpacity <= 0) return rgb;
  const out = Buffer.from(rgb);

  const flareColors: Array<[number, number, number]> = [
    [120, 180, 255], // cool blue
    [255, 170, 90],  // warm orange
  ];
  const verticalReach = 4;
  const sigma = W * 0.12;
  const sigmaSq2 = 2 * sigma * sigma;
  const reachX = Math.ceil(sigma * 2.5); // ~2.5σ covers >98% of gaussian energy

  for (let f = 0; f < flares.length; f++) {
    const flare = flares[f];
    const color = flareColors[f % flareColors.length];

    const xMin = Math.max(0, flare.x - reachX);
    const xMax = Math.min(W - 1, flare.x + reachX);
    const yMin = Math.max(0, flare.y - verticalReach);
    const yMax = Math.min(H - 1, flare.y + verticalReach);

    for (let y = yMin; y <= yMax; y++) {
      const dy = y - flare.y;
      const vFall = 1 - Math.abs(dy) / (verticalReach + 1);
      if (vFall <= 0) continue;

      for (let x = xMin; x <= xMax; x++) {
        const dx = x - flare.x;
        const hFall = Math.exp(-(dx * dx) / sigmaSq2);
        const s = baseOpacity * vFall * hFall;
        if (s < 0.003) continue;

        const idx = (y * W + x) * 3;
        const inv = 1 - s;
        out[idx]     = Math.min(255, Math.round(out[idx]     * inv + color[0] * s));
        out[idx + 1] = Math.min(255, Math.round(out[idx + 1] * inv + color[1] * s));
        out[idx + 2] = Math.min(255, Math.round(out[idx + 2] * inv + color[2] * s));
      }
    }
  }
  return out;
}

/** Scatter `count` bright single-pixel hot pixels in-place. Real cameras have these. */
function applyHotPixels(rgb: Buffer, W: number, H: number, count: number): void {
  if (count <= 0) return;
  const tints: Array<[number, number, number]> = [
    [255, 255, 255],
    [255, 250, 245],
    [250, 255, 250],
    [245, 248, 255],
    [255, 245, 240],
  ];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * W);
    const y = Math.floor(Math.random() * H);
    const idx = (y * W + x) * 3;
    const t = tints[Math.floor(Math.random() * tints.length)];
    rgb[idx] = t[0]; rgb[idx + 1] = t[1]; rgb[idx + 2] = t[2];
  }
}

// ─── Dark / neon scene detection + specific effects ─────────────────────────

type ImageType = "standard" | "darkComplex";

/**
 * Cheap image-type detector. Samples every 4th pixel for speed; the averages
 * over ~250 k samples are stable to within 1%. A frame qualifies as
 * "darkComplex" (cyberpunk cityscape, neon-lit interior, stage photography)
 * when it's both dim overall AND highly chromatic — rules out dim portraits
 * (low chroma) and bright cityscapes (high luma).
 */
function detectImageType(rgb: Buffer, W: number, H: number): ImageType {
  const npx = W * H;
  const stride = 4;
  let lumaSum = 0, chromaSum = 0, count = 0;
  for (let i = 0; i < npx; i += stride) {
    const r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2];
    lumaSum += 0.299 * r + 0.587 * g + 0.114 * b;
    chromaSum += Math.max(r, g, b) - Math.min(r, g, b);
    count++;
  }
  const avgLuma = lumaSum / count;
  const avgChroma = chromaSum / count;
  return avgLuma < 80 && avgChroma > 30 ? "darkComplex" : "standard";
}

/**
 * Inject Gaussian green/magenta chroma noise specifically into shadow pixels.
 * Real cameras dial up colour-channel gain in shadows, which surfaces as a
 * green-magenta cast that varies pixel-to-pixel — a strong AI-detector tell.
 */
function applyShadowNoise(
  rgb: Buffer,
  W: number,
  H: number,
  shadowThreshold: number,
  sigma: number
): Buffer {
  if (sigma <= 0) return rgb;
  const out = Buffer.from(rgb);
  const npx = W * H;
  for (let i = 0; i < npx; i++) {
    const r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2];
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    if (luma >= shadowThreshold) continue;

    const depth = 1 - luma / shadowThreshold; // 0 at threshold, 1 at pure black
    const u1 = Math.max(Number.EPSILON, Math.random());
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const n = z * sigma * depth;

    // Push along the green↔magenta axis: R + B move together, G moves opposite.
    out[i * 3]     = Math.max(0, Math.min(255, Math.round(r + n)));
    out[i * 3 + 1] = Math.max(0, Math.min(255, Math.round(g - n)));
    out[i * 3 + 2] = Math.max(0, Math.min(255, Math.round(b + n)));
  }
  return out;
}

/**
 * Atmospheric haze — soft blue-grey gradient denser at the top of frame
 * (where distant background usually sits) to simulate atmospheric perspective.
 */
async function applyAtmosphericHaze(
  base: Buffer,
  W: number,
  H: number,
  scale: number
): Promise<Buffer> {
  if (scale <= 0) return base;
  const peak = (0.07 * scale).toFixed(3);
  const mid = (0.04 * scale).toFixed(3);
  const haze = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7a8a9c" stop-opacity="${peak}"/>
          <stop offset="55%" stop-color="#7a8a9c" stop-opacity="${mid}"/>
          <stop offset="100%" stop-color="#7a8a9c" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#haze)"/>
    </svg>`
  );
  return sharp(base).composite([{ input: haze, blend: "over" }]).toBuffer();
}

/**
 * Neon bloom — soft 3-4 px gaussian glow bleeding from bright + colourful
 * pixels (luma > 170 AND chroma > 35), at 20% × intensity. Builds a "neon
 * only" layer first, blurs it, scales by opacity, screen-blends over base.
 */
async function applyNeonBloom(
  base: Buffer,
  W: number,
  H: number,
  scale: number
): Promise<Buffer> {
  if (scale <= 0) return base;

  const raw = await sharp(base).removeAlpha().raw().toBuffer();
  const neonOnly = Buffer.alloc(raw.length);
  let foundNeon = false;
  const npx = W * H;
  for (let i = 0; i < npx; i++) {
    const r = raw[i * 3], g = raw[i * 3 + 1], b = raw[i * 3 + 2];
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    if (luma > 170 && chroma > 35) {
      neonOnly[i * 3] = r;
      neonOnly[i * 3 + 1] = g;
      neonOnly[i * 3 + 2] = b;
      foundNeon = true;
    }
  }
  if (!foundNeon) return base;

  const opacity = 0.20 * scale; // base 20% per spec
  const bloom = await sharp(neonOnly, { raw: { width: W, height: H, channels: 3 } })
    .blur(3.5)
    .linear(opacity, 0)
    .png()
    .toBuffer();

  return sharp(base).composite([{ input: bloom, blend: "screen" }]).toBuffer();
}

/**
 * Rain streaks on the lens — 8–15 thin parallel lines, 20–40 px long, 1 px
 * white, 10–18% per-line opacity. All streaks share a base angle (~vertical,
 * tilted up to ±9°) so they fall in one direction like real rain.
 */
async function applyRainStreaks(
  base: Buffer,
  W: number,
  H: number,
  scale: number
): Promise<Buffer> {
  if (scale <= 0) return base;
  const count = Math.max(0, Math.round((8 + Math.random() * 7) * scale));
  if (count === 0) return base;

  const baseAngle = Math.PI / 2 + (Math.random() - 0.5) * 0.32;
  const lines: string[] = [];
  for (let i = 0; i < count; i++) {
    const x1 = Math.random() * W;
    const y1 = Math.random() * H;
    const length = 20 + Math.random() * 20;
    const angle = baseAngle + (Math.random() - 0.5) * 0.1;
    const x2 = x1 + Math.cos(angle) * length;
    const y2 = y1 + Math.sin(angle) * length;
    const op = (0.10 + Math.random() * 0.08) * scale;
    lines.push(
      `<line x1="${x1.toFixed(0)}" y1="${y1.toFixed(0)}" x2="${x2.toFixed(0)}" y2="${y2.toFixed(0)}" stroke="white" stroke-width="1" stroke-opacity="${op.toFixed(3)}" stroke-linecap="round"/>`
    );
  }
  const svg = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${lines.join("")}</svg>`
  );
  return sharp(base).composite([{ input: svg, blend: "over" }]).toBuffer();
}

// ─── SVG composite layers ────────────────────────────────────────────────────

function buildVignetteSvg(W: number, H: number, strength: number): Buffer {
  const cx = W / 2, cy = H / 2, rx = W * 0.7, ry = H * 0.7;
  const opacity = Math.min(1, Math.max(0, strength));
  return Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="v" cx="50%" cy="50%" r="60%">
          <stop offset="55%" stop-color="black" stop-opacity="0"/>
          <stop offset="100%" stop-color="black" stop-opacity="${opacity.toFixed(3)}"/>
        </radialGradient>
      </defs>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#v)"/>
    </svg>`
  );
}

/**
 * Film halation — when bright light hits a real film emulsion, the light
 * bounces around inside the gelatin and creates a soft warm glow that bleeds
 * out from highlights into surrounding shadows. This mimics that:
 *   1. Threshold the base to keep only the brightest pixels (luma > ~200)
 *   2. Tint that mask warm orange/red (R full, G half, B suppressed)
 *   3. Heavy gaussian blur to spread the bloom radius
 *   4. Scale by `strength` so the layer is dim enough to feel subtle
 *   5. Composite back over the base with `screen` blend (additive on shadows,
 *      saturating on existing highlights — exactly how halation reads)
 */
async function applyFilmHalation(
  base: Buffer,
  strength: number,
  blurSigma: number
): Promise<Buffer> {
  if (strength <= 0) return base;

  // Threshold (slope=5, offset=-1000) zeros pixels < 200, ramps to 255 at 255.
  // Then per-channel scale paints the surviving pixels orange-red.
  // Then heavy blur spreads the halo. Then global scale by `strength` dims it.
  const halation = await sharp(base)
    .linear(5.0, -1000)
    .linear([1.0, 0.55, 0.20], [0, 0, 0])
    .blur(blurSigma)
    .linear(strength, 0)
    .png()
    .toBuffer();

  return sharp(base).composite([{ input: halation, blend: "screen" }]).toBuffer();
}

/** Random faint dark blobs that simulate lens dust, biased to the outer half. */
function buildDustSvg(W: number, H: number, count: number): Buffer {
  if (count <= 0) {
    return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"></svg>`);
  }
  const cx = W / 2, cy = H / 2;
  const minDistSq = (Math.min(W, H) * 0.2) ** 2;
  const blobs: string[] = [];
  for (let i = 0; i < count; i++) {
    let bx = 0, by = 0, distSq = 0, attempts = 0;
    do {
      bx = Math.random() * W;
      by = Math.random() * H;
      const dx = bx - cx, dy = by - cy;
      distSq = dx * dx + dy * dy;
      attempts++;
    } while (distSq < minDistSq && attempts < 12);

    const r = 3 + Math.random() * 5;            // 3–8 px
    const opacity = 0.03 + Math.random() * 0.05; // 3–8 %
    blobs.push(
      `<circle cx="${bx.toFixed(0)}" cy="${by.toFixed(0)}" r="${r.toFixed(1)}" fill="#000" fill-opacity="${opacity.toFixed(3)}"/>`
    );
  }
  return Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${blobs.join("")}</svg>`
  );
}

// ─── Main pipeline ───────────────────────────────────────────────────────────

export async function humanizeImageBuffer(
  input: Buffer,
  intensity: IntensityLevel
): Promise<Buffer> {
  const profile = PROFILES[intensity];
  const scale = INTENSITY_SCALE[intensity];

  // Per-intensity values for the 6 new effects (HEAVY_BASE × scale).
  const hotPixelCount = Math.round(HEAVY_BASE.hotPixelCount * scale);
  const dustSpotCount = Math.max(
    intensity === "light" ? 1 : 2,
    Math.round(HEAVY_BASE.dustSpotCount * scale)
  );
  const motionBlurMix = HEAVY_BASE.motionBlurFactor * scale;
  const highlightStrength = HEAVY_BASE.highlightStrength * scale;
  const shadowStrength = HEAVY_BASE.shadowStrength * scale;
  const bandingAmplitude = HEAVY_BASE.bandingAmplitude * scale;

  // Step 1: Normalize input → raw RGB
  const normalized = await sharp(input)
    .rotate()
    .flatten({ background: { r: 0, g: 0, b: 0 } })
    .toBuffer();
  const meta = await sharp(normalized).metadata();
  const W = meta.width ?? 1024;
  const H = meta.height ?? 1024;

  let raw = await sharp(normalized).removeAlpha().raw().toBuffer();

  // Step 1.5: Detect scene type from the unmodified raw — gates the dark/neon
  // additions (haze, neon bloom, rain, shadow chroma noise).
  const imageType = detectImageType(raw, W, H);

  // Step 2: Subtle barrel distortion
  raw = applyBarrelDistortion(raw, W, H, profile.barrelK);

  // Step 3: Edge mask (Sobel) + skin mask
  const grey = rgbToGreyscale(raw, W, H);
  const edgeMag = sobelEdgeMagnitude(grey, W, H);
  const skin = buildSkinMask(raw, W, H);

  // Step 4: Edge-aware chromatic aberration
  raw = applyEdgeAwareCA(raw, W, H, profile.caShift, edgeMag, skin);

  // Step 5: Shadow crush + highlight clip + horizontal micro-banding
  raw = applyToneAndBanding(
    raw, W, H,
    highlightStrength,
    shadowStrength,
    bandingAmplitude
  );

  // Step 6: Directional motion blur — outer 15% ring only
  raw = applyMotionBlurEdgeRing(
    raw, W, H,
    1 + Math.random(),                                 // 1–2 px
    Math.random() * Math.PI * 2,                       // random angle
    motionBlurMix
  );

  // Step 6.5: Anamorphic lens flares on real light sources (neon, headlights,
  // the sun). Detected from the *current* raw — must run BEFORE hot pixels so
  // single-pixel sensor defects can't seed flares.
  const flareSeparation = Math.max(80, Math.floor(Math.min(W, H) * 0.12));
  const flares = findBrightestClusters(
    raw, W, H,
    /* maxCount        */ 3,
    /* minLuma         */ 230,
    /* minSeparationPx */ flareSeparation,
    /* skinMask        */ skin
  );
  raw = applyAnamorphicFlares(raw, W, H, flares, 0.15 * scale);

  // Step 7: Sensor hot pixels (in-place)
  applyHotPixels(raw, W, H, hotPixelCount);

  // Step 7.5: Dark/neon — green-magenta chroma noise in shadows
  if (imageType === "darkComplex") {
    raw = applyShadowNoise(raw, W, H, /* threshold */ 60, /* sigma */ 14 * scale);
  }

  // Re-encode raw → PNG so subsequent sharp() ops can auto-detect format.
  let buf = await sharp(raw, { raw: { width: W, height: H, channels: 3 } })
    .png()
    .toBuffer();

  // Steps 8 + 9: Color-temperature drift (per-channel offset) + focus-falloff blur
  buf = await sharp(buf)
    .linear(
      [1.0, 1.0, 1.0],
      [profile.redBoost, 0, profile.blueReduce]
    )
    .blur(profile.blurSigma)
    .toBuffer();

  // Step 9.5: Film halation — soft warm bloom from highlights (35 mm film feel)
  buf = await applyFilmHalation(buf, profile.halationStrength, profile.halationSigma);

  // Step 9.6/9.7: Dark/neon scene additions — atmospheric haze + neon bloom.
  // Run after halation so the warm bloom doesn't interfere, and before the
  // grain composite so subsequent grain falls naturally on top of the bloom.
  if (imageType === "darkComplex") {
    buf = await applyAtmosphericHaze(buf, W, H, scale);
    buf = await applyNeonBloom(buf, W, H, scale);
  }

  // Step 10: Composite stack — Gaussian noise overlay, dust, lens vignette
  const noiseRaw = gaussianNoiseRgb(W, H, profile.grainSigma);
  const noiseImg = await sharp(noiseRaw, {
    raw: { width: W, height: H, channels: 3 },
  }).png().toBuffer();

  buf = await sharp(buf)
    .composite([
      { input: noiseImg, blend: "overlay" },
      { input: buildDustSvg(W, H, dustSpotCount), blend: "over" },
      { input: buildVignetteSvg(W, H, profile.vignetteStrength), blend: "multiply" },
    ])
    .toBuffer();

  // Step 10.5: Dark/neon — rain on the lens. Goes AFTER the grain composite
  // so the streaks sit on top of grain (real water on a lens shows that way).
  if (imageType === "darkComplex") {
    buf = await applyRainStreaks(buf, W, H, scale);
  }

  // Step 11: JPEG re-encode @ profile quality with realistic camera EXIF
  const dt = new Date().toISOString().replace("T", " ").slice(0, 19).replace(/-/g, ":");
  const final = await sharp(buf)
    .withMetadata({
      exif: {
        IFD0: {
          Make: profile.exif.Make,
          Model: profile.exif.Model,
          Software: profile.exif.Software,
          DateTime: dt,
          XResolution: "72/1",
          YResolution: "72/1",
          ResolutionUnit: "2",
          Orientation: "1",
        },
        IFD2: {
          ExposureTime: profile.exif.ExposureTime,
          FNumber: profile.exif.FNumber,
          ISO: String(profile.exif.ISO),
          DateTimeOriginal: dt,
          FocalLength: profile.exif.FocalLength,
          ColorSpace: "1",
        },
      },
    })
    .jpeg({
      quality: profile.jpegQuality,
      mozjpeg: true,
      chromaSubsampling: "4:2:0",
    })
    .toBuffer();

  return final;
}

// ─── Credit pricing ───────────────────────────────────────────────────────────

export function getCreditsForJob(type: MediaType, intensity: IntensityLevel): number {
  const base = type === "image" ? 1 : 3;
  const multiplier: Record<IntensityLevel, number> = { light: 1, medium: 2, heavy: 3 };
  return base * multiplier[intensity];
}

// ─── Job orchestration ───────────────────────────────────────────────────────

async function downloadOriginal(originalKey: string, originalUrl: string): Promise<Buffer> {
  if (!originalKey.startsWith("http")) {
    const key = originalKey.startsWith("/storage/")
      ? originalKey.slice("/storage/".length)
      : originalKey;
    return storageGetBuffer(key);
  }
  const resp = await fetch(originalUrl);
  if (!resp.ok) throw new Error(`Failed to fetch original: ${resp.status}`);
  return Buffer.from(await resp.arrayBuffer());
}

// Global limiter so concurrent image humanizations (sharp is CPU/RAM heavy)
// can't exhaust the box under load. Excess jobs queue and run as slots free up.
let activeImageJobs = 0;
const imageSlotWaiters: Array<() => void> = [];

function acquireImageSlot(): Promise<void> {
  if (activeImageJobs < ENV.maxConcurrentImageJobs) {
    activeImageJobs++;
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => imageSlotWaiters.push(resolve));
}

function releaseImageSlot(): void {
  const next = imageSlotWaiters.shift();
  if (next) {
    next(); // hand the active slot directly to the next waiter
  } else {
    activeImageJobs--;
  }
}

async function withImageSlot<T>(fn: () => Promise<T>): Promise<T> {
  await acquireImageSlot();
  try {
    return await fn();
  } finally {
    releaseImageSlot();
  }
}

export async function processImageJob(jobId: number): Promise<void> {
  const job = await getJobById(jobId);
  if (!job) throw new Error(`Job ${jobId} not found`);

  const creditsNeeded = getCreditsForJob("image", job.intensity);
  await updateJobStatus(jobId, "processing", {
    processingStartedAt: new Date(),
    progress: 5,
  });

  try {
    const deducted = await deductCredits(
      job.userId, creditsNeeded, jobId,
      `Image humanization (${job.intensity})`
    );
    if (!deducted) {
      await updateJobStatus(jobId, "failed", { errorMessage: "Insufficient credits" });
      return;
    }

    await withImageSlot(async () => {
      await updateJobProgress(jobId, 15);
      const originalBuf = await downloadOriginal(job.originalKey, job.originalUrl);
      await updateJobProgress(jobId, 30);

      const humanized = await humanizeImageBuffer(originalBuf, job.intensity);
      await updateJobProgress(jobId, 90);

      const processedKey = `processed/${job.userId}/${jobId}/humanized.jpg`;
      const { url: processedUrl } = await storagePut(
        processedKey, humanized, "image/jpeg"
      );

      await updateJobStatus(jobId, "completed", {
        processedKey, processedUrl,
        progress: 100, completedAt: new Date(),
        creditsUsed: creditsNeeded,
      });
    });

    // Best-effort completion email (no-op unless SMTP is configured).
    try {
      const user = await getUserById(job.userId);
      if (user?.email) {
        await sendJobCompletionEmail({ to: user.email, jobId, type: "image" });
      }
    } catch (err) {
      console.warn(`[email] job ${jobId} completion notice failed:`, err);
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown processing error";
    await updateJobStatus(jobId, "failed", { errorMessage: msg.slice(0, 500) });
    await addCredits(job.userId, creditsNeeded, "refund", `Refund for failed job #${jobId}`);
    throw error;
  }
}

export async function processVideoJob(jobId: number): Promise<void> {
  const { runVideoPipeline } = await import("./video");
  await runVideoPipeline(jobId);
}
