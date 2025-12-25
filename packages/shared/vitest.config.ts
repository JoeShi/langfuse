import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "**/*.d.ts",
        "**/*.config.*",
        "**/prisma/**",
        "**/clickhouse/**",
        "**/scripts/**",
        "src/__tests__/**",
        "src/server/**", // Server code may require more complex integration testing
        "src/index.ts", // Just exports
        "src/types.ts", // Type definitions only
      ],
      include: ["src/**/*.ts"],
      all: true,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@langfuse/shared": path.resolve(__dirname, "./src"),
    },
  },
});
