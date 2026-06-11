import { and, eq } from "drizzle-orm";
import type { Response } from "express";
import { jobs } from "../drizzle/schema";
import { getDb, createJob, getUserById } from "./db";
import { storagePut, storageGetBuffer } from "./storage";
import { processImageJob } from "./humanizer";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@shared/const";

interface BatchFile {
  filename: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  intensity: "light" | "medium" | "heavy";
  fileDataBase64: string;
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function createBatch(
  userId: number,
  files: BatchFile[]
): Promise<{ batchId: string; jobIds: number[] }> {
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  const batchId = uuid();
  const jobIds: number[] = [];

  for (const file of files) {
    const type = "image";
    const requestedKey = `originals/${userId}/${Date.now()}-${file.filename}`;
    const buf = Buffer.from(file.fileDataBase64, "base64");
    if (buf.length > MAX_UPLOAD_BYTES) {
      throw new Error(
        `File too large: ${file.filename}. Max ${MAX_UPLOAD_MB} MB.`
      );
    }
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
        await processImageJob(jobId);
      } catch (err) {
        console.error(`[Batch] job ${jobId} failed:`, err);
      }
    }
  })().catch(err => console.error("[Batch] queue runner crashed:", err));

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

export async function streamBatchZip(
  batchId: string,
  userId: number,
  res: Response
): Promise<void> {
  const rows = await listJobsByBatch(batchId, userId);
  if (rows.length === 0) {
    res.status(404).json({ error: "Batch not found" });
    return;
  }
  const completed = rows.filter(
    r => r.status === "completed" && r.processedKey
  );
  if (completed.length === 0) {
    res.status(409).json({ error: "Batch not yet complete" });
    return;
  }

  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  for (const row of completed) {
    if (!row.processedKey) continue;
    try {
      // Read the object directly from the storage backend (works for both the
      // local filesystem and S3 — no fetch of a possibly-relative/expiring URL).
      const buf = await storageGetBuffer(row.processedKey);
      const ext =
        row.originalMimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "bin";
      const name = `humanized-${row.id}-${row.originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const finalName = name.includes(".") ? name : `${name}.${ext}`;
      zip.file(finalName, buf);
    } catch (err) {
      console.warn(`[BatchZip] error fetching ${row.processedKey}:`, err);
    }
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="authentigen-batch-${batchId}.zip"`
  );
  const stream = zip.generateNodeStream({
    streamFiles: true,
    compression: "DEFLATE",
  });
  stream.pipe(res);
}
