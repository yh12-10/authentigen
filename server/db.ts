import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { users, jobs, creditTransactions, InsertJob, Job } from "../drizzle/schema";

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
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deductCredits(userId: number, amount: number, jobId: number, description: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const user = await getUserById(userId);
  if (!user || user.credits < amount) return false;
  await db.update(users).set({ credits: user.credits - amount }).where(eq(users.id, userId));
  await db.insert(creditTransactions).values({ userId, jobId, amount: -amount, type: "usage", description });
  return true;
}

export async function addCredits(userId: number, amount: number, type: "purchase" | "bonus" | "refund", description: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const user = await getUserById(userId);
  if (!user) return;
  await db.update(users).set({ credits: user.credits + amount }).where(eq(users.id, userId));
  await db.insert(creditTransactions).values({ userId, amount, type, description });
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
  return db.select().from(jobs).where(eq(jobs.userId, userId)).orderBy(desc(jobs.createdAt)).limit(50);
}

export async function updateJobStatus(
  id: number,
  status: Job["status"],
  extra?: Partial<Pick<Job, "progress" | "processedKey" | "processedUrl" | "errorMessage" | "processingStartedAt" | "completedAt" | "creditsUsed">>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(jobs).set({ status, ...extra }).where(eq(jobs.id, id));
}

export async function updateJobProgress(id: number, progress: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(jobs).set({ progress }).where(eq(jobs.id, id));
}

// ─── Credit transaction helpers ───────────────────────────────────────────────

export async function getCreditTransactions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(creditTransactions).where(eq(creditTransactions.userId, userId)).orderBy(desc(creditTransactions.createdAt)).limit(20);
}
