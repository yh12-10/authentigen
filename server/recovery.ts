/**
 * Crash recovery for in-process jobs.
 *
 * Jobs run fire-and-forget in the same process, so a restart can leave rows
 * stuck in `pending` (never started) or `processing` (interrupted mid-run).
 * On boot we reconcile them:
 *   - pending    → re-queued (safe: nothing happened yet)
 *   - processing → marked failed, and any credit deduction that wasn't already
 *                  refunded is returned to the user
 * Terminal states (completed/failed) are skipped.
 */
import { eq, inArray } from "drizzle-orm";
import { getDb, addCredits, updateJobStatus } from "./db";
import { jobs, creditTransactions } from "../drizzle/schema";
import { processImageJob, processVideoJob } from "./humanizer";

export type OrphanAction = "requeue" | "fail-refund" | "skip";

/** Pure status → action mapping (unit-tested). */
export function classifyOrphan(status: string): OrphanAction {
  if (status === "pending") return "requeue";
  if (status === "processing") return "fail-refund";
  return "skip";
}

/** Net credits deducted for a job that have not yet been refunded. */
async function unrefundedUsageAmount(jobId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const txns = await db
    .select()
    .from(creditTransactions)
    .where(eq(creditTransactions.jobId, jobId));
  let usage = 0;
  let refunded = 0;
  for (const t of txns) {
    if (t.type === "usage") usage += Math.abs(t.amount);
    else if (t.type === "refund") refunded += Math.abs(t.amount);
  }
  return Math.max(0, usage - refunded);
}

export async function recoverOrphanedJobs(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const orphans = await db
    .select()
    .from(jobs)
    .where(inArray(jobs.status, ["pending", "processing"]));
  if (orphans.length === 0) return;
  console.log(`[recovery] reconciling ${orphans.length} interrupted job(s)`);

  for (const job of orphans) {
    const action = classifyOrphan(job.status);
    if (action === "requeue") {
      const run = job.type === "image" ? processImageJob : processVideoJob;
      run(job.id).catch((err) =>
        console.error(`[recovery] re-queue of job ${job.id} failed:`, err)
      );
      console.log(`[recovery] re-queued pending ${job.type} job ${job.id}`);
    } else if (action === "fail-refund") {
      await updateJobStatus(job.id, "failed", {
        errorMessage: "Interrupted by server restart",
      });
      const owed = await unrefundedUsageAmount(job.id);
      if (owed > 0) {
        await addCredits(job.userId, owed, "refund", `Refund for interrupted job #${job.id}`);
      }
      console.log(
        `[recovery] failed interrupted job ${job.id}${owed > 0 ? `, refunded ${owed} credit(s)` : ""}`
      );
    }
  }
}
