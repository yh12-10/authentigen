import { and, eq } from "drizzle-orm";
import type { Response } from "express";
import { jobs } from "../drizzle/schema";
import { getDb, createJob, getUserById } from "./db";
import { storagePut, storageGetSignedUrl } from "./storage";
import { processImageJob, processVideoJob, getCreditsForJob } from "./humanizer";

interface BatchFile {
  filename: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "video/mp4" | "video/webm";
  intensity: "light" | "medium" | "heavy";
  fileDataBase64: string;
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function createBatch(userId: number, files: BatchFile[]): Promise<{ batchId: string; jobIds: number[] }> {
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  // Pre-flight: total credits across files
  const totalCredits = files.reduce((sum, f) => {
    const type = f.mimeType.startsWith("image/") ? "image" : "video";
    return sum + getCreditsForJob(type, f.intensity);
  }, 0);
  if (user.credits < totalCredits) {
    throw new Error(`Insufficient credits. Need ${totalCredits}, have ${user.credits}`);
  }

  const batchId = uuid();
  const jobIds: number[] = [];

  for (const file of files) {
    const type = file.mimeType.startsWith("image/") ? "image" : "video";
    const requestedKey = `originals/${userId}/${Date.now()}-${file.filename}`;
    const buf = Buffer.from(file.fileDataBase64, "base64");
    const { key: originalKey, url: originalUrl } = await storagePut(
      requestedKey,
      buf,
      file.mimeType
    );

    const jobId = await createJob({
      userId,
      type,
      intensity: file.intensity,
      originalKey,
      originalUrl,
      originalFilename: file.filename,
      originalMimeType: file.mimeType,
      status: "pending",
      progress: 0,
      creditsUsed: 0,
      batchId,
    });
    jobIds.push(jobId);
  }

  // Process sequentially to respect per-user processing concurrency.
  (async () => {
    for (const jobId of jobIds) {
      try {
        const job = (await import("./db")).getJobById;
        const j = await job(jobId);
        if (!j) continue;
        const fn = j.type === "image" ? processImageJob : processVideoJob;
        await fn(jobId);
      } catch (err) {
        console.error(`[Batch] job ${jobId} failed:`, err);
      }
    }
  })().catch((err) => console.error("[Batch] queue runner crashed:", err));

  return { batchId, jobIds };
}

export async function listJobsByBatch(batchId: string, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(jobs)
    .where(and(eq(jobs.batchId, batchId), eq(jobs.userId, userId)));
}

export async function streamBatchZip(batchId: string, userId: number, res: Response): Promise<void> {
  const rows = await listJobsByBatch(batchId, userId);
  if (rows.length === 0) {
    res.status(404).json({ error: "Batch not found" });
    return;
  }
  const completed = rows.filter((r) => r.status === "completed" && r.processedKey);
  if (completed.length === 0) {
    res.status(409).json({ error: "Batch not yet complete" });
    return;
  }

  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  for (const row of completed) {
    if (!row.processedKey) continue;
    try {
      const signedUrl = await storageGetSignedUrl(row.processedKey);
      const resp = await fetch(signedUrl);
      if (!resp.ok) {
        console.warn(`[BatchZip] failed to fetch ${row.processedKey}: ${resp.status}`);
        continue;
      }
      const buf = Buffer.from(await resp.arrayBuffer());
      const ext = row.originalMimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "bin";
      const name = `humanized-${row.id}-${row.originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const finalName = name.includes(".") ? name : `${name}.${ext}`;
      zip.file(finalName, buf);
    } catch (err) {
      console.warn(`[BatchZip] error fetching ${row.processedKey}:`, err);
    }
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="authentigen-batch-${batchId}.zip"`);
  const stream = zip.generateNodeStream({ streamFiles: true, compression: "DEFLATE" });
  stream.pipe(res);
}
