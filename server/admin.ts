import { and, count, desc, eq, gte, like, or } from "drizzle-orm";
import { jobs, users } from "../drizzle/schema";
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

  return {
    totalUsers: Number(usersRow?.c ?? 0),
    totalJobs: Number(jobsRow?.c ?? 0),
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
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [] as any[];
  if (opts.status) conditions.push(eq(jobs.status, opts.status));

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
