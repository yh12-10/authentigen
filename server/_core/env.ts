import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

/**
 * In dev, auto-generate a JWT_SECRET on first run and persist it to .env so
 * sessions survive server restarts. In production we never silently generate
 * one — operators must set it explicitly.
 */
function ensureDevJwtSecret(): void {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) return;
  if (process.env.NODE_ENV === "production") return;

  const secret = randomBytes(48).toString("hex"); // 96 hex chars
  process.env.JWT_SECRET = secret;

  try {
    const envPath = path.resolve(process.cwd(), ".env");
    let contents = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";

    if (/^\s*JWT_SECRET\s*=.*$/m.test(contents)) {
      contents = contents.replace(
        /^\s*JWT_SECRET\s*=.*$/m,
        `JWT_SECRET=${secret}`
      );
    } else {
      if (contents.length > 0 && !contents.endsWith("\n")) contents += "\n";
      contents += `JWT_SECRET=${secret}\n`;
    }
    writeFileSync(envPath, contents, "utf8");
    console.log("[env] Generated JWT_SECRET and wrote it to .env (dev only).");
  } catch (err) {
    // If we can't write .env, sessions are still valid for this process — just won't persist on restart.
    console.warn("[env] Could not persist JWT_SECRET to .env:", err);
  }
}

ensureDevJwtSecret();

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:3000",
  // Video pipeline
  videoMaxDurationSeconds: Number(process.env.VIDEO_MAX_DURATION_SECONDS ?? 30),
  videoFrameSampleEvery: Number(process.env.VIDEO_FRAME_SAMPLE_EVERY ?? 3),
  // Storage backend ("local" filesystem by default, or "s3")
  storageBackend:
    (process.env.STORAGE_BACKEND ?? "local").toLowerCase() === "s3"
      ? "s3"
      : "local",
  s3Bucket: process.env.S3_BUCKET ?? "",
  s3Region: process.env.S3_REGION ?? "us-east-1",
  s3Endpoint: process.env.S3_ENDPOINT ?? "", // optional, for S3-compatible (R2/MinIO/B2)
  s3ForcePathStyle:
    (process.env.S3_FORCE_PATH_STYLE ?? "false").toLowerCase() === "true",
  s3PublicUrl: process.env.S3_PUBLIC_URL ?? "", // optional public/CDN base for long-lived URLs
  s3AccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  s3SecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  // SMTP email (optional — falls back to console logging when unset)
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPassword: process.env.SMTP_PASSWORD ?? "",
  smtpFrom: process.env.SMTP_FROM ?? "",
  smtpSecure: (process.env.SMTP_SECURE ?? "false").toLowerCase() === "true",
  ownerEmail: process.env.OWNER_EMAIL ?? "",
  // Rate limiting (applied to /api/trpc)
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 100),
  trustProxy: process.env.TRUST_PROXY ?? "", // e.g. "1" or "loopback" when behind a reverse proxy
  // Job processing
  maxConcurrentImageJobs: Number(process.env.MAX_CONCURRENT_IMAGE_JOBS ?? 4),
};

export function isS3Configured(): boolean {
  return Boolean(ENV.s3Bucket && ENV.s3AccessKeyId && ENV.s3SecretAccessKey);
}

export function isSmtpConfigured(): boolean {
  return Boolean(ENV.smtpHost && ENV.smtpFrom);
}
