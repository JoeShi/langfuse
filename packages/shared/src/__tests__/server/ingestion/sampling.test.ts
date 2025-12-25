import { describe, it, expect, beforeEach, vi } from "vitest";
import { isTraceIdInSample } from "../../../src/server/ingestion/sampling";
import { env } from "../../../src/env";

// Mock the env module
vi.mock("../../../src/env", () => ({
  env: {
    LANGFUSE_INGESTION_PROCESSING_SAMPLED_PROJECTS: new Map(),
  },
}));

describe("ingestion sampling", () => {
  beforeEach(() => {
    // Reset the mock before each test
    env.LANGFUSE_INGESTION_PROCESSING_SAMPLED_PROJECTS = new Map();
  });

  describe("isTraceIdInSample", () => {
    it("should include all traces when project not in sampled projects", () => {
      const event = {
        type: "trace-create" as const,
        body: {
          id: "trace-123",
          name: "test-trace",
          timestamp: new Date().toISOString(),
        },
      };

      const result = isTraceIdInSample({
        projectId: "project-1",
        event,
      });

      expect(result.isSampled).toBe(true);
      expect(result.isSamplingConfigured).toBe(false);
    });

    it("should include all traces when projectId is null", () => {
      const event = {
        type: "trace-create" as const,
        body: {
          id: "trace-123",
          name: "test-trace",
          timestamp: new Date().toISOString(),
        },
      };

      const result = isTraceIdInSample({
        projectId: null,
        event,
      });

      expect(result.isSampled).toBe(true);
      expect(result.isSamplingConfigured).toBe(false);
    });

    it("should include all traces when sample rate is 1", () => {
      env.LANGFUSE_INGESTION_PROCESSING_SAMPLED_PROJECTS.set("project-1", 1);

      const event = {
        type: "trace-create" as const,
        body: {
          id: "trace-123",
          name: "test-trace",
          timestamp: new Date().toISOString(),
        },
      };

      const result = isTraceIdInSample({
        projectId: "project-1",
        event,
      });

      expect(result.isSampled).toBe(true);
      expect(result.isSamplingConfigured).toBe(true);
    });

    it("should exclude all traces when sample rate is 0", () => {
      env.LANGFUSE_INGESTION_PROCESSING_SAMPLED_PROJECTS.set("project-1", 0);

      const event = {
        type: "trace-create" as const,
        body: {
          id: "trace-123",
          name: "test-trace",
          timestamp: new Date().toISOString(),
        },
      };

      const result = isTraceIdInSample({
        projectId: "project-1",
        event,
      });

      expect(result.isSampled).toBe(false);
      expect(result.isSamplingConfigured).toBe(true);
    });

    it("should consistently sample same traceId", () => {
      env.LANGFUSE_INGESTION_PROCESSING_SAMPLED_PROJECTS.set("project-1", 0.5);

      const traceId = "consistent-trace-id";
      const event = {
        type: "trace-create" as const,
        body: {
          id: traceId,
          name: "test-trace",
          timestamp: new Date().toISOString(),
        },
      };

      // Call multiple times with same trace ID
      const result1 = isTraceIdInSample({ projectId: "project-1", event });
      const result2 = isTraceIdInSample({ projectId: "project-1", event });
      const result3 = isTraceIdInSample({ projectId: "project-1", event });

      // All results should be the same
      expect(result1.isSampled).toBe(result2.isSampled);
      expect(result2.isSampled).toBe(result3.isSampled);
      expect(result1.isSamplingConfigured).toBe(true);
    });

    it("should handle observation events with traceId", () => {
      env.LANGFUSE_INGESTION_PROCESSING_SAMPLED_PROJECTS.set("project-1", 0.5);

      const event = {
        type: "observation-create" as const,
        body: {
          id: "obs-123",
          traceId: "trace-123",
          type: "SPAN" as const,
          name: "test-observation",
          startTime: new Date().toISOString(),
        },
      };

      const result = isTraceIdInSample({
        projectId: "project-1",
        event,
      });

      expect(result.isSamplingConfigured).toBe(true);
      expect(typeof result.isSampled).toBe("boolean");
    });

    it("should include trace when traceId is missing", () => {
      env.LANGFUSE_INGESTION_PROCESSING_SAMPLED_PROJECTS.set("project-1", 0.5);

      const event = {
        type: "observation-create" as const,
        body: {
          id: "obs-123",
          type: "SPAN" as const,
          name: "test-observation",
          startTime: new Date().toISOString(),
        },
      };

      const result = isTraceIdInSample({
        projectId: "project-1",
        event,
      });

      expect(result.isSampled).toBe(true);
      expect(result.isSamplingConfigured).toBe(true);
    });

    it("should include trace when sample rate is undefined", () => {
      env.LANGFUSE_INGESTION_PROCESSING_SAMPLED_PROJECTS.set(
        "project-1",
        undefined as any,
      );

      const event = {
        type: "trace-create" as const,
        body: {
          id: "trace-123",
          name: "test-trace",
          timestamp: new Date().toISOString(),
        },
      };

      const result = isTraceIdInSample({
        projectId: "project-1",
        event,
      });

      expect(result.isSampled).toBe(true);
      expect(result.isSamplingConfigured).toBe(true);
    });

    it("should handle different trace IDs differently with partial sampling", () => {
      env.LANGFUSE_INGESTION_PROCESSING_SAMPLED_PROJECTS.set("project-1", 0.5);

      const results = new Set<boolean>();

      // Test with many different trace IDs
      for (let i = 0; i < 100; i++) {
        const event = {
          type: "trace-create" as const,
          body: {
            id: `trace-${i}`,
            name: "test-trace",
            timestamp: new Date().toISOString(),
          },
        };

        const result = isTraceIdInSample({ projectId: "project-1", event });
        results.add(result.isSampled);
      }

      // With 50% sample rate and 100 different IDs, we should see both true and false
      expect(results.size).toBe(2);
      expect(results.has(true)).toBe(true);
      expect(results.has(false)).toBe(true);
    });

    it("should handle invalid sample rate by including trace", () => {
      env.LANGFUSE_INGESTION_PROCESSING_SAMPLED_PROJECTS.set("project-1", 1.5);

      const event = {
        type: "trace-create" as const,
        body: {
          id: "trace-123",
          name: "test-trace",
          timestamp: new Date().toISOString(),
        },
      };

      const result = isTraceIdInSample({
        projectId: "project-1",
        event,
      });

      expect(result.isSampled).toBe(true);
      expect(result.isSamplingConfigured).toBe(true);
    });

    it("should handle negative sample rate by including trace", () => {
      env.LANGFUSE_INGESTION_PROCESSING_SAMPLED_PROJECTS.set("project-1", -0.5);

      const event = {
        type: "trace-create" as const,
        body: {
          id: "trace-123",
          name: "test-trace",
          timestamp: new Date().toISOString(),
        },
      };

      const result = isTraceIdInSample({
        projectId: "project-1",
        event,
      });

      expect(result.isSampled).toBe(true);
      expect(result.isSamplingConfigured).toBe(true);
    });
  });
});
