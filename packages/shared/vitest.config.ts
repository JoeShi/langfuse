import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.unit.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/utils/**/*.ts", "src/server/services/DatasetService/**/*.ts"],
      exclude: [
        "**/*.test.ts",
        "**/*.unit.test.ts",
        "**/__tests__/**",
        "**/node_modules/**",
        "**/dist/**",
      ],
    },
  },
});
