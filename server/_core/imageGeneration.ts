/**
 * Thin wrapper around the pixel-level pipeline in server/humanizer.ts.
 * Kept for callers (e.g. video frame loop) that want a "give me a URL"
 * façade — internally it just runs humanizeImageBuffer + storagePut.
 */
import { humanizeImageBuffer, type IntensityLevel } from "../humanizer";
import { storagePut, storageGetBuffer } from "../storage";

export interface GenerateImageOptions {
  prompt: string;
  intensity?: IntensityLevel;
  originalImages?: Array<{
    url?: string;
    b64Json?: string;
    mimeType?: string;
  }>;
}

export interface GenerateImageResponse {
  url?: string;
}

function inferIntensityFromPrompt(prompt: string): IntensityLevel {
  if (/ISO\s*3200|heavy|dramatic|crushed blacks/i.test(prompt)) return "heavy";
  if (/ISO\s*800|moderate|cinematic color grade/i.test(prompt)) return "medium";
  return "light";
}

async function loadInput(opts: GenerateImageOptions): Promise<Buffer> {
  const src = opts.originalImages?.[0];
  if (!src) throw new Error("Image humanization requires a source image");
  if (src.b64Json) return Buffer.from(src.b64Json, "base64");
  if (src.url) {
    if (src.url.startsWith("/storage/")) {
      return storageGetBuffer(src.url.slice("/storage/".length));
    }
    const resp = await fetch(src.url);
    if (!resp.ok)
      throw new Error(`Failed to fetch source image: ${resp.status}`);
    return Buffer.from(await resp.arrayBuffer());
  }
  throw new Error("Source image had neither b64Json nor url");
}

export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResponse> {
  const inputBuffer = await loadInput(options);
  const intensity =
    options.intensity ?? inferIntensityFromPrompt(options.prompt);
  const outputBuffer = await humanizeImageBuffer(inputBuffer, intensity);
  const { url } = await storagePut(
    `generated/${Date.now()}.jpg`,
    outputBuffer,
    "image/jpeg"
  );
  return { url };
}
