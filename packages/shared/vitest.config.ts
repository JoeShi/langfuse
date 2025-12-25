import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.test.ts",
        "src/**/*.spec.ts",
        "src/index.ts",
        "src/db.ts",
        "src/env.ts",
        "src/types.ts",
        "src/constants.ts",
        "src/domain/**", // Database domain models
        "src/tableDefinitions/**", // Database table definitions
        "src/interfaces/**", // Type interfaces
        "src/errors/**", // Simple error classes
        "src/server/test-utils/**", // Test utilities
        "src/server/instrumentation/**", // Instrumentation setup
        "src/server/services/email/**", // Email templates
        "prisma/**",
        "scripts/**",
        "clickhouse/**",
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    setupFiles: [],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      "@langfuse/shared": "/projects/sandbox/langfuse/packages/shared/src",
    },
  },
});
