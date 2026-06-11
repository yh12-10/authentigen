import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import {
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  router,
} from "./_core/trpc";
import { signupUser, loginUser, signSessionToken } from "./_core/auth";
import { createJob, getJobById, getJobsByUserId } from "./db";
import { storagePut } from "./storage";
import { processImageJob } from "./humanizer";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@shared/const";
import { getAdminStats, listAdminUsers, listAdminJobs } from "./admin";
import { createBatch, listJobsByBatch } from "./batch";

// ─── Jobs Router ──────────────────────────────────────────────────────────────

const jobsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        filename: z.string().min(1).max(255),
        mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
        intensity: z.enum(["light", "medium", "heavy"]).default("medium"),
        fileDataBase64: z.string(),
        batchId: z.string().min(1).max(36).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const type = "image";

      // Upload original file to storage. storagePut returns the actual key
      // (with a unique hash suffix) — store THAT in the DB so subsequent reads find the file.
      const requestedKey = `originals/${userId}/${Date.now()}-${input.filename}`;
      const fileBuffer = Buffer.from(input.fileDataBase64, "base64");
      // Server-side size guard — never trust the client. Rejects oversized
      // uploads (e.g. a direct API call past the browser's check).
      if (fileBuffer.length > MAX_UPLOAD_BYTES) {
        throw new TRPCError({
          code: "PAYLOAD_TOO_LARGE",
          message: `File too large. Max ${MAX_UPLOAD_MB} MB.`,
        });
      }
      const { key: originalKey, url: originalUrl } = await storagePut(
        requestedKey,
        fileBuffer,
        input.mimeType
      );

      // Create job record
      const jobId = await createJob({
        userId,
        type,
        intensity: input.intensity,
        originalKey,
        originalUrl,
        originalFilename: input.filename,
        originalMimeType: input.mimeType,
        status: "pending",
        progress: 0,
        batchId: input.batchId ?? null,
      });

      // Trigger processing asynchronously (fire and forget)
      processImageJob(jobId).catch(err => {
        console.error(`[Humanizer] Job ${jobId} failed:`, err);
      });

      return { jobId };
    }),

  status: protectedProcedure
    .input(z.object({ jobId: z.number() }))
    .query(async ({ ctx, input }) => {
      const job = await getJobById(input.jobId);
      if (!job || job.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }
      return job;
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return getJobsByUserId(ctx.user.id);
  }),
});

// ─── Admin Router ─────────────────────────────────────────────────────────────

const adminRouter = router({
  stats: adminProcedure.query(() => getAdminStats()),
  users: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(({ input }) => listAdminUsers(input)),
  jobs: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z
          .enum(["pending", "processing", "completed", "failed"])
          .optional(),
      })
    )
    .query(({ input }) => listAdminJobs(input)),
});

// ─── Batch Router ─────────────────────────────────────────────────────────────

const fileSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  intensity: z.enum(["light", "medium", "heavy"]).default("medium"),
  fileDataBase64: z.string(),
});

const batchRouter = router({
  create: protectedProcedure
    .input(z.object({ files: z.array(fileSchema).min(1).max(10) }))
    .mutation(async ({ ctx, input }) => {
      return createBatch(ctx.user.id, input.files);
    }),

  status: protectedProcedure
    .input(z.object({ batchId: z.string().min(1).max(36) }))
    .query(({ ctx, input }) => listJobsByBatch(input.batchId, ctx.user.id)),
});

// ─── App Router ───────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    signup: publicProcedure
      .input(
        z.object({
          email: z.string().email().max(320),
          password: z.string().min(8).max(128),
          name: z.string().min(1).max(120).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        let user;
        try {
          user = await signupUser(input);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Signup failed";
          throw new TRPCError({ code: "BAD_REQUEST", message: msg });
        }
        const token = await signSessionToken(user.id);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });
        return { success: true, user } as const;
      }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email().max(320),
          password: z.string().min(1).max(128),
        })
      )
      .mutation(async ({ ctx, input }) => {
        let user;
        try {
          user = await loginUser(input.email, input.password);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Login failed";
          throw new TRPCError({ code: "UNAUTHORIZED", message: msg });
        }
        const token = await signSessionToken(user.id);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });
        return { success: true, user } as const;
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  jobs: jobsRouter,
  admin: adminRouter,
  batch: batchRouter,
});

export type AppRouter = typeof appRouter;
