import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { users, jobs, InsertJob, Job } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── User helpers ────────────────────────────────────────────────────────────

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Job helpers ─────────────────────────────────────────────────────────────

export async function createJob(data: InsertJob): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(jobs).values(data);
  return (result[0] as { insertId: number }).insertId;
}

export async function getJobById(id: number): Promise<Job | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getJobsByUserId(userId: number): Promise<Job[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(jobs)
    .where(eq(jobs.userId, userId))
    .orderBy(desc(jobs.createdAt))
    .limit(50);
}

export async function updateJobStatus(
  id: number,
  status: Job["status"],
  extra?: Partial<
    Pick<
      Job,
      | "progress"
      | "processedKey"
      | "processedUrl"
      | "errorMessage"
      | "processingStartedAt"
      | "completedAt"
    >
  >
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(jobs)
    .set({ status, ...extra })
    .where(eq(jobs.id, id));
}

export async function updateJobProgress(
  id: number,
  progress: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(jobs).set({ progress }).where(eq(jobs.id, id));
}
