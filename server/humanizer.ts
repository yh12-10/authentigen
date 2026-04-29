/**
 * AuthentiGen AI Humanization Pipeline
 *
 * This module orchestrates the humanization of AI-generated images and videos.
 * It uses the built-in LLM + image generation APIs to apply organic imperfections
 * that defeat AI detectors: noise, color grading, texture, lighting variations,
 * grain, motion blur, and micro-imperfections.
 */

import { generateImage } from "./_core/imageGeneration";
import { updateJobProgress, updateJobStatus, deductCredits, getJobById } from "./db";
import { storagePut } from "./storage";

export type IntensityLevel = "light" | "medium" | "heavy";
export type MediaType = "image" | "video";

interface HumanizationConfig {
  intensity: IntensityLevel;
  mediaType: MediaType;
}

function buildImageHumanizationPrompt(intensity: IntensityLevel): string {
  const base = "Transform this image to look authentically human-made and photographed. ";

  const intensityMap: Record<IntensityLevel, string> = {
    light: [
      base,
      "Apply very subtle, minimal adjustments: add slight natural film grain (ISO 200 equivalent), ",
      "introduce barely perceptible chromatic aberration at the edges, apply gentle vignetting, ",
      "add micro-level sensor noise, and introduce a very slight warm color shift as if shot on a DSLR. ",
      "Keep the image nearly identical to the original but with authentic photographic character.",
    ].join(""),
    medium: [
      base,
      "Apply moderate humanizing transformations: add natural film grain (ISO 800 equivalent), ",
      "introduce realistic lens imperfections including slight barrel distortion and chromatic aberration, ",
      "apply organic color grading with subtle warm shadows and cool highlights, ",
      "add realistic depth-of-field micro-blur on edges, introduce natural lighting variations and soft shadows, ",
      "add textural imperfections like micro-scratches or dust particles, ",
      "and apply a cinematic color grade that feels hand-crafted.",
    ].join(""),
    heavy: [
      base,
      "Apply strong, comprehensive humanizing transformations: add heavy film grain (ISO 3200 equivalent), ",
      "introduce pronounced lens distortion, strong chromatic aberration, and realistic bokeh blur, ",
      "apply dramatic organic color grading with crushed blacks, lifted shadows, and teal-orange toning, ",
      "add visible textural imperfections, lens flares, and natural lighting inconsistencies, ",
      "introduce micro-motion blur as if hand-held, add realistic noise patterns from camera sensor, ",
      "apply heavy vignetting, and make the image feel like it was shot on vintage film camera. ",
      "The result should look unmistakably human-photographed.",
    ].join(""),
  };

  return intensityMap[intensity];
}

function buildVideoFramePrompt(intensity: IntensityLevel, frameIndex: number, totalFrames: number): string {
  const position = frameIndex / totalFrames;
  const base = buildImageHumanizationPrompt(intensity);

  const videoExtra = [
    ` This is frame ${frameIndex + 1} of ${totalFrames} in a video sequence. `,
    "Additionally apply: natural motion blur consistent with hand-held camera movement, ",
    "inter-frame grain consistency with slight temporal variation, ",
    position < 0.1 ? "slight focus pull as camera adjusts at start of shot, " : "",
    position > 0.9 ? "natural camera micro-shake at end of shot, " : "",
    "rolling shutter micro-distortion, and temporal noise that varies naturally between frames.",
  ].join("");

  return base + videoExtra;
}

export function getCreditsForJob(type: MediaType, intensity: IntensityLevel): number {
  const base = type === "image" ? 1 : 3;
  const multiplier: Record<IntensityLevel, number> = { light: 1, medium: 2, heavy: 3 };
  return base * multiplier[intensity];
}

export async function processImageJob(jobId: number): Promise<void> {
  const job = await getJobById(jobId);
  if (!job) throw new Error(`Job ${jobId} not found`);

  const creditsNeeded = getCreditsForJob("image", job.intensity);

  await updateJobStatus(jobId, "processing", { processingStartedAt: new Date(), progress: 5 });

  try {
    // Deduct credits
    const deducted = await deductCredits(job.userId, creditsNeeded, jobId, `Image humanization (${job.intensity})`);
    if (!deducted) {
      await updateJobStatus(jobId, "failed", { errorMessage: "Insufficient credits" });
      return;
    }

    await updateJobProgress(jobId, 15);

    // Build the humanization prompt
    const prompt = buildImageHumanizationPrompt(job.intensity);

    await updateJobProgress(jobId, 25);

    // Run through AI image generation with the original as reference
    const result = await generateImage({
      prompt,
      originalImages: [{ url: job.originalUrl, mimeType: job.originalMimeType as "image/jpeg" | "image/png" | "image/webp" }],
    });

    await updateJobProgress(jobId, 75);

    // Fetch the generated image and store it
    if (!result.url) throw new Error("Image generation returned no URL");
    const response = await fetch(result.url);
    const buffer = Buffer.from(await response.arrayBuffer());

    const ext = job.originalMimeType === "image/png" ? "png" : job.originalMimeType === "image/webp" ? "webp" : "jpg";
    const processedKey = `processed/${job.userId}/${jobId}/humanized.${ext}`;
    const { url: processedUrl } = await storagePut(processedKey, buffer, job.originalMimeType);

    await updateJobProgress(jobId, 95);

    await updateJobStatus(jobId, "completed", {
      processedKey,
      processedUrl,
      progress: 100,
      completedAt: new Date(),
      creditsUsed: creditsNeeded,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown processing error";
    await updateJobStatus(jobId, "failed", { errorMessage: msg });
    // Refund credits on failure
    const { addCredits } = await import("./db");
    await addCredits(job.userId, creditsNeeded, "refund", `Refund for failed job #${jobId}`);
    throw error;
  }
}

export async function processVideoJob(jobId: number): Promise<void> {
  // Real frame-sampled FFmpeg pipeline lives in ./video.ts.
  // It owns credit deduction, refund-on-failure, duration cap, temp cleanup,
  // and per-user concurrency.
  const { runVideoPipeline } = await import("./video");
  await runVideoPipeline(jobId);
}
