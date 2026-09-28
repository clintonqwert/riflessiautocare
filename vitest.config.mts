import { defineConfig } from "vitest/config";

export default defineConfig({
  // Resolve the "@/*" alias from tsconfig.json, so tests import like the app.
  resolve: { tsconfigPaths: true },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
