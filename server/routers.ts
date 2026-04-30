import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { signupUser, loginUser, signSessionToken } from "./_core/auth";
import {
  createJob,
  getJobById,
  getJobsByUserId,
  getUserById,
  getCreditTransactions,
  addCredits,
} from "./db";
import { storagePut } from "./storage";
import { processImageJob, processVideoJob, getCreditsForJob } from "./humanizer";
import { isStripeConfigured } from "./_core/env";
import { PRICE_PACKS, createCheckoutSession, type PackKey } from "./payments";
import {
  getAdminStats,
  listAdminUsers,
  listAdminJobs,
  grantCreditsToUser,
  getDailyRevenueLast30Days,
} from "./admin";
import { createBatch, listJobsByBatch } from "./batch";

// ─── Jobs Router ──────────────────────────────────────────────────────────────

const jobsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        filename: z.string().min(1).max(255),
        mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]),
        intensity: z.enum(["light", "medium", "heavy"]).default("medium"),
        fileDataBase64: z.string(),
        batchId: z.string().min(1).max(36).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const type = input.mimeType.startsWith("image/") ? "image" : "video";
      const creditsNeeded = getCreditsForJob(type, input.intensity);

      // Check credits
      const user = await getUserById(userId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      if (user.credits < creditsNeeded) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Insufficient credits. Need ${creditsNeeded}, have ${user.credits}`,
        });
      }

      // Upload original file to storage. storagePut returns the actual key
      // (with a unique hash suffix) — store THAT in the DB so subsequent reads find the file.
      const requestedKey = `originals/${userId}/${Date.now()}-${input.filename}`;
      const fileBuffer = Buffer.from(input.fileDataBase64, "base64");
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
        creditsUsed: 0,
        batchId: input.batchId ?? null,
      });

      // Trigger processing asynchronously (fire and forget)
      const processFn = type === "image" ? processImageJob : processVideoJob;
      processFn(jobId).catch((err) => {
        console.error(`[Humanizer] Job ${jobId} failed:`, err);
      });

      return { jobId, creditsNeeded };
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

// ─── Credits Router ───────────────────────────────────────────────────────────

const creditsRouter = router({
  balance: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserById(ctx.user.id);
    return { credits: user?.credits ?? 0 };
  }),

  transactions: protectedProcedure.query(async ({ ctx }) => {
    return getCreditTransactions(ctx.user.id);
  }),

  // One-time welcome bonus — guarded by durable bonusClaimed flag on user record
  claimBonus: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await getUserById(ctx.user.id);
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    if (user.bonusClaimed) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Welcome bonus already claimed" });
    }
    const { getDb } = await import("./db");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const { users } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set({ bonusClaimed: 1 }).where(eq(users.id, ctx.user.id));
    await addCredits(ctx.user.id, 10, "bonus", "Welcome bonus credits");
    return { success: true };
  }),
});

// ─── Payments Router ──────────────────────────────────────────────────────────

const paymentsRouter = router({
  isConfigured: publicProcedure.query(() => ({ configured: isStripeConfigured() })),

  packs: publicProcedure.query(() =>
    Object.entries(PRICE_PACKS).map(([key, pack]) => ({
      key: key as PackKey,
      label: pack.label,
      credits: pack.credits,
      priceCents: pack.priceCents,
    }))
  ),

  createCheckoutSession: protectedProcedure
    .input(z.object({ pack: z.enum(["starter", "pro", "studio"]) }))
    .mutation(async ({ ctx, input }) => {
      if (!isStripeConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Stripe is not configured. Contact the administrator.",
        });
      }
      const url = await createCheckoutSession(ctx.user.id, input.pack);
      return { url };
    }),
});

// ─── Admin Router ─────────────────────────────────────────────────────────────

const adminRouter = router({
  stats: adminProcedure.query(() => getAdminStats()),
  users: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50), offset: z.number().min(0).default(0) }))
    .query(({ input }) => listAdminUsers(input)),
  jobs: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
        type: z.enum(["image", "video"]).optional(),
      })
    )
    .query(({ input }) => listAdminJobs(input)),
  grantCredits: adminProcedure
    .input(z.object({ userId: z.number(), amount: z.number().int().min(1).max(10000) }))
    .mutation(({ ctx, input }) => grantCreditsToUser(input.userId, input.amount, ctx.user.id)),
  dailyRevenue: adminProcedure.query(() => getDailyRevenueLast30Days()),
});

// ─── Batch Router ─────────────────────────────────────────────────────────────

const fileSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]),
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
    me: publicProcedure.query((opts) => opts.ctx.user),

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
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
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
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true, user } as const;
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  jobs: jobsRouter,
  credits: creditsRouter,
  payments: paymentsRouter,
  admin: adminRouter,
  batch: batchRouter,
});

export type AppRouter = typeof appRouter;
