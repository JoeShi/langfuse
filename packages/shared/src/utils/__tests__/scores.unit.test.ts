import { expect, describe, it } from "vitest";
import { z } from "zod/v4";
import { applyScoreValidation } from "../scores";

describe("applyScoreValidation", () => {
  // Base schema for testing
  const baseSchema = z.object({
    traceId: z.string().optional(),
    sessionId: z.string().optional(),
    datasetRunId: z.string().optional(),
    observationId: z.string().optional(),
  });

  const validatedSchema = applyScoreValidation(baseSchema);

  describe("valid cases: traceId only", () => {
    it("should validate with traceId only", () => {
      const data = { traceId: "trace-123" };
      const result = validatedSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate with traceId and observationId", () => {
      const data = { traceId: "trace-123", observationId: "obs-456" };
      const result = validatedSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("valid cases: sessionId only", () => {
    it("should validate with sessionId only", () => {
      const data = { sessionId: "session-123" };
      const result = validatedSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should not validate sessionId with observationId", () => {
      const data = { sessionId: "session-123", observationId: "obs-456" };
      const result = validatedSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("valid cases: datasetRunId only", () => {
    it("should validate with datasetRunId only", () => {
      const data = { datasetRunId: "run-123" };
      const result = validatedSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should not validate datasetRunId with observationId", () => {
      const data = { datasetRunId: "run-123", observationId: "obs-456" };
      const result = validatedSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("invalid cases: multiple IDs provided", () => {
    it("should not validate with traceId and sessionId", () => {
      const data = { traceId: "trace-123", sessionId: "session-456" };
      const result = validatedSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain(
          "Provide exactly one of the following"
        );
      }
    });

    it("should not validate with traceId and datasetRunId", () => {
      const data = { traceId: "trace-123", datasetRunId: "run-456" };
      const result = validatedSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should not validate with sessionId and datasetRunId", () => {
      const data = { sessionId: "session-123", datasetRunId: "run-456" };
      const result = validatedSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should not validate with all three IDs", () => {
      const data = {
        traceId: "trace-123",
        sessionId: "session-456",
        datasetRunId: "run-789",
      };
      const result = validatedSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should not validate with all IDs including observationId", () => {
      const data = {
        traceId: "trace-123",
        sessionId: "session-456",
        datasetRunId: "run-789",
        observationId: "obs-101",
      };
      const result = validatedSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("invalid cases: observationId without traceId", () => {
    it("should not validate observationId without traceId", () => {
      const data = { observationId: "obs-123" };
      const result = validatedSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should not validate observationId with sessionId", () => {
      const data = { sessionId: "session-123", observationId: "obs-456" };
      const result = validatedSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should not validate observationId with datasetRunId", () => {
      const data = { datasetRunId: "run-123", observationId: "obs-456" };
      const result = validatedSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should not validate with no IDs provided", () => {
      const data = {};
      const result = validatedSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should validate with empty optional fields as undefined", () => {
      const data = {
        traceId: "trace-123",
        sessionId: undefined,
        datasetRunId: undefined,
      };
      const result = validatedSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should handle empty strings as falsy", () => {
      const schemaWithStrings = z.object({
        traceId: z.string().optional().transform(val => val || undefined),
        sessionId: z.string().optional().transform(val => val || undefined),
        datasetRunId: z.string().optional().transform(val => val || undefined),
        observationId: z.string().optional().transform(val => val || undefined),
      });
      const validated = applyScoreValidation(schemaWithStrings);
      
      const data = { traceId: "" };
      const result = validated.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("error messages", () => {
    it("should provide helpful error message for invalid configuration", () => {
      const data = { sessionId: "session-123", observationId: "obs-456" };
      const result = validatedSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.errors[0];
        expect(error.message).toContain("ObservationId requires traceId");
      }
    });

    it("should have error on multiple paths", () => {
      const data = { traceId: "trace-123", sessionId: "session-456" };
      const result = validatedSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.errors[0];
        expect(error.path).toBeDefined();
      }
    });
  });

  describe("complex schemas", () => {
    it("should work with extended schema", () => {
      const extendedSchema = baseSchema.extend({
        name: z.string(),
        value: z.number(),
      });
      const validated = applyScoreValidation(extendedSchema);

      const data = {
        traceId: "trace-123",
        name: "test-score",
        value: 0.95,
      };
      const result = validated.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate additional fields with traceId", () => {
      const extendedSchema = baseSchema.extend({
        score: z.number(),
        metadata: z.record(z.unknown()).optional(),
      });
      const validated = applyScoreValidation(extendedSchema);

      const data = {
        traceId: "trace-123",
        score: 100,
        metadata: { key: "value" },
      };
      const result = validated.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("boundary conditions", () => {
    it("should handle very long ID strings", () => {
      const data = { traceId: "a".repeat(1000) };
      const result = validatedSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate with minimal valid data", () => {
      const data = { traceId: "a" };
      const result = validatedSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
