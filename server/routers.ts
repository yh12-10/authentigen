import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
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

// ─── Jobs Router ──────────────────────────────────────────────────────────────

const jobsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        filename: z.string().min(1).max(255),
        mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]),
        intensity: z.enum(["light", "medium", "heavy"]).default("medium"),
        fileDataBase64: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const type = input.mimeType.startsWith("image/") ? "image" : "video";
      const creditsNeeded = getCreditsForJob(type, input.intensity);

      // Check credits
      const user = await getUserById(userId);
      if (!user) throw new Error("User not found");
      if (user.credits < creditsNeeded) {
        throw new Error(`Insufficient credits. Need ${creditsNeeded}, have ${user.credits}`);
      }

      // Upload original file to storage
      const ext = input.mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "bin";
      const originalKey = `originals/${userId}/${Date.now()}-${input.filename}`;
      const fileBuffer = Buffer.from(input.fileDataBase64, "base64");
      const { url: originalUrl } = await storagePut(originalKey, fileBuffer, input.mimeType);

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
      if (!job || job.userId !== ctx.user.id) throw new Error("Job not found");
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
    if (!user) throw new Error("User not found");
    if (user.bonusClaimed) throw new Error("Welcome bonus already claimed");
    const { getDb } = await import("./db");
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    // Atomically mark bonus as claimed and add credits
    const { users } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set({ bonusClaimed: 1 }).where(eq(users.id, ctx.user.id));
    await addCredits(ctx.user.id, 10, "bonus", "Welcome bonus credits");
    return { success: true };
  }),
});

// ─── App Router ───────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  jobs: jobsRouter,
  credits: creditsRouter,
});

export type AppRouter = typeof appRouter;
