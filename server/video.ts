/**
 * AuthentiGen Real Video Humanization Pipeline
 *
 * Sample-every-N frames + 30s cap + audio passthrough.
 *
 * Per-user concurrency: 1 (a small in-process semaphore guards CPU-heavy frame processing).
 * Temp directory: os.tmpdir()/authentigen/<jobId>/, always cleaned in `finally`.
 * Sweep at startup removes orphans older than 1 hour.
 */
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import * as ffprobeStatic from "ffprobe-static";
import { ENV } from "./_core/env";
import { storageGetBuffer, storagePut } from "./storage";
import {
  getJobById,
  getUserById,
  updateJobProgress,
  updateJobStatus,
  getDb,
} from "./db";
import { sendJobCompletionEmail } from "./_core/email";
import { jobs as jobsTable } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { generateImage } from "./_core/imageGeneration";
import { type IntensityLevel } from "./humanizer";

const ROOT_TMP = path.join(os.tmpdir(), "authentigen");

const userSemaphores = new Map<number, Promise<void>>();

async function withUserConcurrency<T>(
  userId: number,
  fn: () => Promise<T>
): Promise<T> {
  const previous = userSemaphores.get(userId) ?? Promise.resolve();
  let release!: () => void;
  const next = new Promise<void>(res => (release = res));
  userSemaphores.set(
    userId,
    previous.then(() => next)
  );
  await previous;
  try {
    return await fn();
  } finally {
    release();
    if (userSemaphores.get(userId) === next) {
      userSemaphores.delete(userId);
    }
  }
}

function ffmpegBin(): string {
  if (!ffmpegPath)
    throw new Error("ffmpeg-static did not provide a binary path");
  return ffmpegPath;
}

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegBin(), args, { windowsHide: true });
    let stderr = "";
    proc.stderr.on("data", c => {
      stderr += c.toString();
    });
    proc.on("error", reject);
    proc.on("close", code => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-1000)}`));
    });
  });
}

function runFfprobeJson(args: string[]): Promise<{ stdout: string }> {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffprobeStatic.path, args, { windowsHide: true });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", c => {
      stdout += c.toString();
    });
    proc.stderr.on("data", c => {
      stderr += c.toString();
    });
    proc.on("error", reject);
    proc.on("close", code => {
      if (code === 0) resolve({ stdout });
      else reject(new Error(`ffprobe exited ${code}: ${stderr.slice(-500)}`));
    });
  });
}

interface ProbeInfo {
  durationSeconds: number;
  fps: number;
  hasAudio: boolean;
}

async function probe(localPath: string): Promise<ProbeInfo> {
  const { stdout } = await runFfprobeJson([
    "-v",
    "error",
    "-print_format",
    "json",
    "-show_streams",
    "-show_format",
    localPath,
  ]);
  const data = JSON.parse(stdout) as {
    streams: Array<{
      codec_type: string;
      r_frame_rate?: string;
      avg_frame_rate?: string;
      duration?: string;
    }>;
    format: { duration?: string };
  };
  const video = data.streams.find(s => s.codec_type === "video");
  const hasAudio = data.streams.some(s => s.codec_type === "audio");
  if (!video) throw new Error("No video stream found");
  const fpsRaw = video.r_frame_rate || video.avg_frame_rate || "30/1";
  const [num, den] = fpsRaw.split("/").map(Number);
  const fps = den && den !== 0 ? num / den : 30;
  const duration = Number(video.duration ?? data.format.duration ?? 0);
  return { durationSeconds: duration, fps, hasAudio };
}

function buildVideoFramePrompt(
  intensity: IntensityLevel,
  frameIndex: number,
  totalFrames: number
): string {
  const position = frameIndex / Math.max(1, totalFrames);
  const intensityDescriptors: Record<IntensityLevel, string> = {
    light:
      "Apply very subtle film grain (ISO 200), barely perceptible chromatic aberration, gentle vignetting, and a slight warm color shift. Keep the frame nearly identical to the original.",
    medium:
      "Apply natural film grain (ISO 800), realistic lens imperfections including slight barrel distortion and chromatic aberration, organic color grading with warm shadows and cool highlights, and depth-of-field micro-blur.",
    heavy:
      "Apply heavy film grain (ISO 3200), pronounced lens distortion, strong chromatic aberration, dramatic color grading with crushed blacks and teal-orange toning, lens flares, heavy vignetting, and a vintage 35mm film feel.",
  };
  const startEdge =
    position < 0.1
      ? " Slight focus pull as camera adjusts at start of shot."
      : "";
  const endEdge =
    position > 0.9 ? " Natural camera micro-shake at end of shot." : "";
  return [
    "Transform this video frame to look authentically human-photographed.",
    intensityDescriptors[intensity],
    `This is frame ${frameIndex + 1} of ${totalFrames} in a continuous video sequence.`,
    "Maintain temporal grain consistency with slight inter-frame variation, rolling shutter micro-distortion, and natural motion blur consistent with hand-held camera movement.",
    startEdge,
    endEdge,
  ]
    .join(" ")
    .trim();
}

async function readDirSorted(dir: string): Promise<string[]> {
  const names = await fs.readdir(dir);
  return names.filter(n => n.endsWith(".png") || n.endsWith(".jpg")).sort();
}

export async function sweepOldTempDirs(): Promise<void> {
  try {
    await fs.mkdir(ROOT_TMP, { recursive: true });
    const entries = await fs.readdir(ROOT_TMP);
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const name of entries) {
      const p = path.join(ROOT_TMP, name);
      try {
        const stat = await fs.stat(p);
        if (stat.mtimeMs < oneHourAgo) {
          await fs.rm(p, { recursive: true, force: true });
        }
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* ignore */
  }
}

export async function runVideoPipeline(jobId: number): Promise<void> {
  const job = await getJobById(jobId);
  if (!job) throw new Error(`Job ${jobId} not found`);
  if (job.type !== "video") throw new Error(`Job ${jobId} is not a video job`);

  await withUserConcurrency(job.userId, () => processVideoOnce(jobId));
}

async function processVideoOnce(jobId: number): Promise<void> {
  const job = await getJobById(jobId);
  if (!job) throw new Error(`Job ${jobId} not found`);

  const intensity = job.intensity as IntensityLevel;
  const tmpDir = path.join(ROOT_TMP, String(jobId));
  const framesDir = path.join(tmpDir, "frames");
  const outFramesDir = path.join(tmpDir, "out");

  await updateJobStatus(jobId, "processing", {
    processingStartedAt: new Date(),
    progress: 5,
  });

  try {
    await fs.mkdir(framesDir, { recursive: true });
    await fs.mkdir(outFramesDir, { recursive: true });

    // 1. Download original
    const ext = job.originalMimeType.split("/")[1] ?? "mp4";
    const inPath = path.join(tmpDir, `in.${ext}`);
    const buf = await storageGetBuffer(job.originalKey);
    await fs.writeFile(inPath, buf);
    await updateJobProgress(jobId, 8);

    // 2. Probe + 30s cap
    const info = await probe(inPath);
    const cap = ENV.videoMaxDurationSeconds;
    if (info.durationSeconds > cap + 0.5) {
      await updateJobStatus(jobId, "failed", {
        errorMessage: `Video duration ${info.durationSeconds.toFixed(1)}s exceeds ${cap}s limit`,
      });
      return;
    }

    // 3. Persist duration + frame plan
    const sampleEvery = Math.max(1, ENV.videoFrameSampleEvery);
    const sourceFps = info.fps || 30;
    const totalSourceFrames = Math.floor(info.durationSeconds * sourceFps);
    const sampledFrames = Math.max(
      1,
      Math.ceil(totalSourceFrames / sampleEvery)
    );

    const db = await getDb();
    if (db) {
      await db
        .update(jobsTable)
        .set({
          durationSeconds: info.durationSeconds,
          frameCount: sampledFrames,
          framesProcessed: 0,
        })
        .where(eq(jobsTable.id, jobId));
    }

    await updateJobProgress(jobId, 10);

    // 4. Extract sampled frames
    await runFfmpeg([
      "-y",
      "-i",
      inPath,
      "-vf",
      `select=not(mod(n\\,${sampleEvery})),setpts=N/(${sourceFps}/${sampleEvery})/TB`,
      "-vsync",
      "vfr",
      path.join(framesDir, "in_%05d.png"),
    ]);

    const frameNames = await readDirSorted(framesDir);
    const frameTotal = frameNames.length || sampledFrames;

    // 5. Humanize each frame via the image pipeline
    for (let i = 0; i < frameNames.length; i++) {
      const name = frameNames[i];
      const inFramePath = path.join(framesDir, name);
      const frameBuffer = await fs.readFile(inFramePath);
      const b64 = frameBuffer.toString("base64");

      const prompt = buildVideoFramePrompt(intensity, i, frameTotal);
      const result = await generateImage({
        prompt,
        intensity,
        originalImages: [{ b64Json: b64, mimeType: "image/png" }],
      });
      if (!result.url) throw new Error(`Frame ${i} returned no URL`);

      // Read the generated frame (JPEG bytes from humanizer) from local storage or HTTP.
      let outBuf: Buffer;
      if (result.url.startsWith("/storage/")) {
        const key = result.url.slice("/storage/".length);
        outBuf = await storageGetBuffer(key);
      } else {
        const resp = await fetch(result.url);
        if (!resp.ok)
          throw new Error(
            `Failed to fetch generated frame ${i}: ${resp.status}`
          );
        outBuf = Buffer.from(await resp.arrayBuffer());
      }
      const outName = name.replace("in_", "out_").replace(/\.png$/, ".jpg");
      await fs.writeFile(path.join(outFramesDir, outName), outBuf);

      // Progress 10 → 90
      const framesProcessed = i + 1;
      const progress = 10 + Math.floor((framesProcessed / frameTotal) * 80);
      await updateJobProgress(jobId, Math.min(90, progress));
      if (db) {
        await db
          .update(jobsTable)
          .set({ framesProcessed })
          .where(eq(jobsTable.id, jobId));
      }
    }

    // 6. Reassemble
    const outPath = path.join(tmpDir, "out.mp4");
    const outFps = sourceFps / sampleEvery;
    const reassembleArgs: string[] = [
      "-y",
      "-framerate",
      String(outFps),
      "-i",
      path.join(outFramesDir, "out_%05d.jpg"),
    ];
    if (info.hasAudio) {
      reassembleArgs.push(
        "-i",
        inPath,
        "-map",
        "0:v",
        "-map",
        "1:a",
        "-c:a",
        "copy"
      );
    } else {
      reassembleArgs.push("-map", "0:v");
    }
    reassembleArgs.push(
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "veryfast",
      "-shortest",
      outPath
    );
    await runFfmpeg(reassembleArgs);

    // 7. Upload
    const finalBuf = await fs.readFile(outPath);
    const processedKey = `processed/${job.userId}/${jobId}/humanized.mp4`;
    const { url: processedUrl } = await storagePut(
      processedKey,
      finalBuf,
      "video/mp4"
    );

    await updateJobStatus(jobId, "completed", {
      processedKey,
      processedUrl,
      progress: 100,
      completedAt: new Date(),
    });

    // Best-effort completion email (no-op unless SMTP is configured).
    try {
      const user = await getUserById(job.userId);
      if (user?.email) {
        await sendJobCompletionEmail({ to: user.email, jobId, type: "video" });
      }
    } catch (err) {
      console.warn(`[email] job ${jobId} completion notice failed:`, err);
    }
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Unknown video processing error";
    console.error(`[Video] job ${jobId} failed:`, msg);
    await updateJobStatus(jobId, "failed", { errorMessage: msg.slice(0, 500) });
    throw error;
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
