/**
 * Local-filesystem storage. No external dependency, no API keys.
 *
 *   storagePut(key, data, mime) → writes ./storage/<key> and returns a public URL
 *   storageGetBuffer(key)       → reads ./storage/<key>
 *   storageGetSignedUrl(key)    → returns a public URL (no signing needed locally)
 *
 * Files are served by Express via the /storage/* static route mounted in
 * server/_core/index.ts.
 */
import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";

export const STORAGE_ROOT = path.resolve(process.cwd(), "storage");

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "").replace(/\\/g, "/");
}

function appendHashSuffix(relKey: string): string {
  const hash = randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

function safeAbsolutePath(relKey: string): string {
  const key = normalizeKey(relKey);
  const abs = path.resolve(STORAGE_ROOT, key);
  if (!abs.startsWith(STORAGE_ROOT + path.sep) && abs !== STORAGE_ROOT) {
    throw new Error(`Refusing path traversal: ${relKey}`);
  }
  return abs;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  _contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  const abs = safeAbsolutePath(key);
  await fs.mkdir(path.dirname(abs), { recursive: true });

  const buf =
    typeof data === "string"
      ? Buffer.from(data, "utf8")
      : Buffer.isBuffer(data)
      ? data
      : Buffer.from(data);

  await fs.writeFile(abs, buf);
  return { key, url: `/storage/${key}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: `/storage/${key}` };
}

export async function storageGetBuffer(relKey: string): Promise<Buffer> {
  const abs = safeAbsolutePath(relKey);
  return fs.readFile(abs);
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  // For local FS, the "signed" URL is just the public path.
  return `/storage/${key}`;
}
