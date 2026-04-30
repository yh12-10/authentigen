import type { Express } from "express";
import { authenticateRequest } from "./auth";

/**
 * Mounts GET /api/batch/:batchId/download which streams a ZIP of all
 * completed humanized files in the batch.
 * Implementation lives in server/batch.ts; this module wires it to Express
 * and handles auth via the native session-cookie path used by tRPC.
 */
export function registerBatchDownload(app: Express): void {
  app.get("/api/batch/:batchId/download", async (req, res) => {
    try {
      const user = await authenticateRequest(req).catch(() => null);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { streamBatchZip } = await import("../batch");
      await streamBatchZip(req.params.batchId, user.id, res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to stream batch";
      console.error("[BatchDownload]", msg);
      if (!res.headersSent) {
        res.status(500).json({ error: msg });
      }
    }
  });
}
