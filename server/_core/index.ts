import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { ENV } from "./env";
import { registerStorageProxy } from "./storageProxy";
import { registerBatchDownload } from "./batchDownload";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // When behind a reverse proxy, trust it so rate-limit/IP detection is correct.
  if (ENV.trustProxy) {
    const n = Number(ENV.trustProxy);
    app.set("trust proxy", Number.isNaN(n) ? ENV.trustProxy : n);
  }

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerBatchDownload(app);

  // Rate limit the API surface (the storage proxy and batch download are
  // intentionally exempt — they are separate routes).
  const apiLimiter = rateLimit({
    windowMs: ENV.rateLimitWindowMs,
    limit: ENV.rateLimitMax,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests, please slow down." },
  });

  // tRPC API
  app.use(
    "/api/trpc",
    apiLimiter,
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  // Clean up orphan video temp dirs older than 1h on boot.
  import("../video")
    .then(m => m.sweepOldTempDirs())
    .catch(err => console.warn("[Startup] sweep failed:", err));

  // Reconcile jobs left pending/processing after a crash or restart.
  import("../recovery")
    .then(m => m.recoverOrphanedJobs())
    .catch(err => console.warn("[Startup] job recovery failed:", err));

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
