import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

// Shared resolve config. Test projects (server / client) are defined in
// vitest.workspace.ts and extend this file.
export default defineConfig({
  root: templateRoot,
  // Use the automatic JSX runtime so component tests don't need React in scope.
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
});
