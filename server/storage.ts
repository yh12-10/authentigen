/**
 * Pluggable object storage.
 *
 * Backend is chosen by STORAGE_BACKEND ("local" filesystem by default, or "s3"):
 *   storagePut(key, data, mime) → stores the object and returns { key, url }
 *   storageGet(key)             → { key, url } without writing
 *   storageGetBuffer(key)       → reads the object back as a Buffer
 *   storageGetSignedUrl(key)    → a fetchable/displayable URL for the object
 *
 * The public API and key shape are identical across backends, so callers never
 * change. The local backend serves files via the /storage/* route mounted in
 * server/_core/index.ts; the S3 backend returns a public (S3_PUBLIC_URL) or
 * presigned URL. The AWS SDK is imported lazily so local deployments never load it.
 */
import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import type { S3Client } from "@aws-sdk/client-s3";
import { ENV, isS3Configured } from "./_core/env";

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

function toBuffer(data: Buffer | Uint8Array | string): Buffer {
  if (typeof data === "string") return Buffer.from(data, "utf8");
  if (Buffer.isBuffer(data)) return data;
  return Buffer.from(data);
}

interface StorageBackend {
  put(key: string, buf: Buffer, contentType: string): Promise<void>;
  getBuffer(key: string): Promise<Buffer>;
  /** A fetchable/displayable URL for the object (may expire for S3 presigned). */
  url(key: string): Promise<string>;
}

// ─── Local filesystem backend ───────────────────────────────────────────────
const localBackend: StorageBackend = {
  async put(key, buf) {
    const abs = safeAbsolutePath(key);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, buf);
  },
  async getBuffer(key) {
    return fs.readFile(safeAbsolutePath(key));
  },
  async url(key) {
    return `/storage/${normalizeKey(key)}`;
  },
};

// ─── S3 / S3-compatible backend (lazy SDK import) ───────────────────────────
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days (SigV4 maximum)
let _s3: S3Client | null = null;

async function getS3Client(): Promise<S3Client> {
  if (_s3) return _s3;
  const { S3Client: Client } = await import("@aws-sdk/client-s3");
  _s3 = new Client({
    region: ENV.s3Region,
    endpoint: ENV.s3Endpoint || undefined,
    forcePathStyle: ENV.s3ForcePathStyle,
    credentials: ENV.s3AccessKeyId
      ? {
          accessKeyId: ENV.s3AccessKeyId,
          secretAccessKey: ENV.s3SecretAccessKey,
        }
      : undefined,
  });
  return _s3;
}

const s3Backend: StorageBackend = {
  async put(key, buf, contentType) {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: ENV.s3Bucket,
        Key: key,
        Body: buf,
        ContentType: contentType,
      })
    );
  },
  async getBuffer(key) {
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await getS3Client();
    const out = await client.send(
      new GetObjectCommand({ Bucket: ENV.s3Bucket, Key: key })
    );
    if (!out.Body) throw new Error(`S3 object has no body: ${key}`);
    const bytes = await out.Body.transformToByteArray();
    return Buffer.from(bytes);
  },
  async url(key) {
    if (ENV.s3PublicUrl) {
      return `${ENV.s3PublicUrl.replace(/\/+$/, "")}/${normalizeKey(key)}`;
    }
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
    const client = await getS3Client();
    return getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: ENV.s3Bucket, Key: key }),
      {
        expiresIn: SIGNED_URL_TTL_SECONDS,
      }
    );
  },
};

function selectBackend(): StorageBackend {
  if (ENV.storageBackend === "s3") {
    if (!isS3Configured()) {
      throw new Error(
        "STORAGE_BACKEND=s3 but S3 is not configured. Set S3_BUCKET, S3_REGION, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY."
      );
    }
    return s3Backend;
  }
  return localBackend;
}

const backend = selectBackend();

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  await backend.put(key, toBuffer(data), contentType);
  return { key, url: await backend.url(key) };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: await backend.url(key) };
}

export async function storageGetBuffer(relKey: string): Promise<Buffer> {
  return backend.getBuffer(normalizeKey(relKey));
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  return backend.url(normalizeKey(relKey));
}
