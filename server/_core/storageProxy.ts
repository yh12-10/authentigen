import type { Express } from "express";
import express from "express";
import { promises as fs } from "node:fs";
import { STORAGE_ROOT } from "../storage";

/**
 * Serve files from the local ./storage/ directory at /storage/*.
 * Streams the actual file (not a redirect), so URLs work for both <img>
 * and <video> tags including when fetched cross-origin during humanization.
 */
export function registerStorageProxy(app: Express) {
  // Make sure the directory exists so express.static doesn't 404 on first boot.
  fs.mkdir(STORAGE_ROOT, { recursive: true }).catch(() => {});
  app.use(
    "/storage",
    express.static(STORAGE_ROOT, {
      setHeaders: res => {
        res.setHeader("Cache-Control", "private, max-age=3600");
      },
    })
  );
}
