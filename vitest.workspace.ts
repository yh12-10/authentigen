import { defineWorkspace } from "vitest/config";

// Two test projects: server code runs in Node, client components in jsdom.
export default defineWorkspace([
  {
    extends: "./vitest.config.ts",
    test: {
      name: "server",
      environment: "node",
      include: ["server/**/*.test.ts", "server/**/*.spec.ts"],
    },
  },
  {
    extends: "./vitest.config.ts",
    test: {
      name: "client",
      environment: "jsdom",
      include: ["client/**/*.test.{ts,tsx}"],
      setupFiles: ["./client/src/test/setup.ts"],
    },
  },
]);
