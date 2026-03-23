import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: ["text", "clover", "json"],
      exclude: ["src/index.ts"],
    },
  },
});
