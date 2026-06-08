import { and, count, desc, eq, gte, like, or, sql, sum } from "drizzle-orm";
import { creditTransactions, jobs, users } from "../drizzle/schema";
import { getDb } from "./db";

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export async function getAdminStats() {
  const db = await getDb();
  if (!db) {
    return {
      totalUsers: 0,
      totalJobs: 0,
      totalRevenueCents: 0,
      jobsToday: 0,
      newUsersToday: 0,
    };
  }

  const today = startOfToday();

  const [usersRow] = await db.select({ c: count() }).from(users);
  const [jobsRow] = await db.select({ c: count() }).from(jobs);
  const [jobsTodayRow] = await db
    .select({ c: count() })
    .from(jobs)
    .where(gte(jobs.createdAt, today));
  const [newUsersTodayRow] = await db
    .select({ c: count() })
    .from(users)
    .where(gte(users.createdAt, today));

  // Sum total purchased credits, then convert to dollars using PRICE_PACKS heuristic.
  // We use the sum of priceCents inferred from credit_transactions descriptions where possible.
  // Simpler: sum (credits * average pricePerCredit). Approximate by summing positive purchase amounts × per-credit-cents from PRICE_PACKS.
  // Most reliable: store priceCents at purchase time. Until we do, derive an estimate from credit packs.
  // For now: use credits * 5 cents as a coarse estimate (Starter 50/$4.99 ≈ 9.98c/credit; round to a low estimate).
  const purchasesAggregate = await db
    .select({ totalCredits: sum(creditTransactions.amount) })
    .from(creditTransactions)
    .where(eq(creditTransactions.type, "purchase"));
  const purchasedCredits = Number(purchasesAggregate[0]?.totalCredits ?? 0);
  // 50/$4.99 = $0.0998/cr; 200/$14.99 = $0.0750/cr; 500/$29.99 = $0.0600/cr.
  // Assume blended ~$0.075/cr → 7.5 cents.
  const totalRevenueCents = Math.round(purchasedCredits * 7.5);

  return {
    totalUsers: Number(usersRow?.c ?? 0),
    totalJobs: Number(jobsRow?.c ?? 0),
    totalRevenueCents,
    jobsToday: Number(jobsTodayRow?.c ?? 0),
    newUsersToday: Number(newUsersTodayRow?.c ?? 0),
  };
}

export async function listAdminUsers(opts: {
  limit: number;
  offset: number;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  const where = opts.search
    ? or(
        like(users.email, `%${opts.search}%`),
        like(users.name, `%${opts.search}%`),
        like(users.openId, `%${opts.search}%`)
      )
    : undefined;

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      credits: users.credits,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
    })
    .from(users)
    .where(where as any)
    .orderBy(desc(users.createdAt))
    .limit(opts.limit)
    .offset(opts.offset);

  // Add jobs count per user
  const enriched = await Promise.all(
    rows.map(async u => {
      const [r] = await db
        .select({ c: count() })
        .from(jobs)
        .where(eq(jobs.userId, u.id));
      return { ...u, jobsCount: Number(r?.c ?? 0) };
    })
  );

  return enriched;
}

export async function listAdminJobs(opts: {
  limit: number;
  offset: number;
  status?: "pending" | "processing" | "completed" | "failed";
  type?: "image" | "video";
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [] as any[];
  if (opts.status) conditions.push(eq(jobs.status, opts.status));
  if (opts.type) conditions.push(eq(jobs.type, opts.type));

  const where =
    conditions.length === 0
      ? undefined
      : conditions.length === 1
        ? conditions[0]
        : and(...conditions);

  const rows = await db
    .select({
      id: jobs.id,
      userId: jobs.userId,
      type: jobs.type,
      status: jobs.status,
      intensity: jobs.intensity,
      creditsUsed: jobs.creditsUsed,
      progress: jobs.progress,
      createdAt: jobs.createdAt,
      completedAt: jobs.completedAt,
      originalFilename: jobs.originalFilename,
      userEmail: users.email,
      userName: users.name,
    })
    .from(jobs)
    .leftJoin(users, eq(users.id, jobs.userId))
    .where(where as any)
    .orderBy(desc(jobs.createdAt))
    .limit(opts.limit)
    .offset(opts.offset);

  return rows;
}

export async function grantCreditsToUser(
  targetUserId: number,
  amount: number,
  adminUserId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const target = await db
    .select()
    .from(users)
    .where(eq(users.id, targetUserId))
    .limit(1);
  if (target.length === 0) throw new Error("Target user not found");
  // Whitelist: only update credits, NEVER role.
  await db
    .update(users)
    .set({ credits: target[0].credits + amount })
    .where(eq(users.id, targetUserId));
  await db.insert(creditTransactions).values({
    userId: targetUserId,
    amount,
    type: "purchase",
    description: `[admin:${adminUserId}] Granted ${amount} credits`,
  });
  return { success: true };
}

export async function getDailyRevenueLast30Days() {
  const db = await getDb();
  if (!db) return [];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  cutoff.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      day: sql<string>`DATE(${creditTransactions.createdAt})`,
      credits: sum(creditTransactions.amount),
    })
    .from(creditTransactions)
    .where(
      and(
        eq(creditTransactions.type, "purchase"),
        gte(creditTransactions.createdAt, cutoff)
      )
    )
    .groupBy(sql`DATE(${creditTransactions.createdAt})`)
    .orderBy(sql`DATE(${creditTransactions.createdAt})`);

  return rows.map(r => ({
    day: String(r.day),
    credits: Number(r.credits ?? 0),
    estimatedRevenueCents: Math.round(Number(r.credits ?? 0) * 7.5),
  }));
}
