/**
 * Crash recovery for in-process jobs.
 *
 * Jobs run fire-and-forget in the same process, so a restart can leave rows
 * stuck in `pending` (never started) or `processing` (interrupted mid-run).
 * On boot we reconcile them:
 *   - pending    → re-queued (safe: nothing happened yet)
 *   - processing → marked failed (can't safely resume mid-pipeline)
 * Terminal states (completed/failed) are skipped.
 */
import { inArray } from "drizzle-orm";
import { getDb, updateJobStatus } from "./db";
import { jobs } from "../drizzle/schema";
import { processImageJob, processVideoJob } from "./humanizer";

export type OrphanAction = "requeue" | "fail" | "skip";

/** Pure status → action mapping (unit-tested). */
export function classifyOrphan(status: string): OrphanAction {
  if (status === "pending") return "requeue";
  if (status === "processing") return "fail";
  return "skip";
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
      run(job.id).catch(err =>
        console.error(`[recovery] re-queue of job ${job.id} failed:`, err)
      );
      console.log(`[recovery] re-queued pending ${job.type} job ${job.id}`);
    } else if (action === "fail") {
      await updateJobStatus(job.id, "failed", {
        errorMessage: "Interrupted by server restart",
      });
      console.log(`[recovery] failed interrupted job ${job.id}`);
    }
  }
}
