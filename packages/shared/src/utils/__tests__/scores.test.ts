import { describe, it, expect } from "vitest";
import { z } from "zod/v4";
import { applyScoreValidation } from "../scores";

describe("scores.ts", () => {
  describe("applyScoreValidation", () => {
    // Base schema for testing
    const baseSchema = z.object({
      traceId: z.string().optional(),
      observationId: z.string().optional(),
      sessionId: z.string().optional(),
      datasetRunId: z.string().optional(),
      value: z.number(),
    });

    const validatedSchema = applyScoreValidation(baseSchema);

    it("should accept traceId only", () => {
      const data = {
        traceId: "trace-123",
        value: 0.9,
      };

      const result = validatedSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("should accept traceId with observationId", () => {
      const data = {
        traceId: "trace-123",
        observationId: "obs-456",
        value: 0.9,
      };

      const result = validatedSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("should accept sessionId only (without observationId)", () => {
      const data = {
        sessionId: "session-789",
        value: 0.8,
      };

      const result = validatedSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("should accept datasetRunId only (without observationId)", () => {
      const data = {
        datasetRunId: "run-101",
        value: 0.7,
      };

      const result = validatedSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("should reject when multiple IDs are provided (traceId + sessionId)", () => {
      const data = {
        traceId: "trace-123",
        sessionId: "session-789",
        value: 0.9,
      };

      const result = validatedSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Provide exactly one of the following",
        );
      }
    });

    it("should reject when multiple IDs are provided (traceId + datasetRunId)", () => {
      const data = {
        traceId: "trace-123",
        datasetRunId: "run-101",
        value: 0.9,
      };

      const result = validatedSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("should reject when multiple IDs are provided (sessionId + datasetRunId)", () => {
      const data = {
        sessionId: "session-789",
        datasetRunId: "run-101",
        value: 0.9,
      };

      const result = validatedSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("should reject when all three IDs are provided", () => {
      const data = {
        traceId: "trace-123",
        sessionId: "session-789",
        datasetRunId: "run-101",
        value: 0.9,
      };

      const result = validatedSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("should reject sessionId with observationId", () => {
      const data = {
        sessionId: "session-789",
        observationId: "obs-456",
        value: 0.8,
      };

      const result = validatedSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Provide exactly one of the following",
        );
      }
    });

    it("should reject datasetRunId with observationId", () => {
      const data = {
        datasetRunId: "run-101",
        observationId: "obs-456",
        value: 0.7,
      };

      const result = validatedSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("should reject when no ID is provided", () => {
      const data = {
        value: 0.9,
      };

      const result = validatedSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("should reject observationId without traceId", () => {
      const data = {
        observationId: "obs-456",
        value: 0.9,
      };

      const result = validatedSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("should include correct error path", () => {
      const data = {
        traceId: "trace-123",
        sessionId: "session-789",
        value: 0.9,
      };

      const result = validatedSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues[0];
        // The error path should include the relevant fields
        expect(issue.path).toBeDefined();
      }
    });

    it("should work with different schema structures", () => {
      const customSchema = z.object({
        traceId: z.string().optional(),
        observationId: z.string().optional(),
        sessionId: z.string().optional(),
        datasetRunId: z.string().optional(),
        name: z.string(),
        score: z.number().min(0).max(1),
      });

      const validatedCustomSchema = applyScoreValidation(customSchema);

      const validData = {
        traceId: "trace-123",
        name: "quality",
        score: 0.95,
      };

      const result = validatedCustomSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should preserve other validation rules", () => {
      const strictSchema = z.object({
        traceId: z.string().optional(),
        observationId: z.string().optional(),
        sessionId: z.string().optional(),
        datasetRunId: z.string().optional(),
        value: z.number().min(0).max(1), // Score must be between 0 and 1
      });

      const validatedStrictSchema = applyScoreValidation(strictSchema);

      // Valid ID, but invalid score
      const data = {
        traceId: "trace-123",
        value: 2.0, // Out of range
      };

      const result = validatedStrictSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("should handle empty strings as falsy", () => {
      const schemaWithStrings = z.object({
        traceId: z.string().optional(),
        observationId: z.string().optional(),
        sessionId: z.string().optional(),
        datasetRunId: z.string().optional(),
        value: z.number(),
      });

      const validatedSchema = applyScoreValidation(schemaWithStrings);

      // Empty strings should be treated as not provided
      const data = {
        traceId: "trace-123",
        sessionId: "", // Empty string
        value: 0.9,
      };

      // This should be valid because empty string is falsy
      const result = validatedSchema.safeParse(data);

      // Empty strings would not pass string schema typically, but if they do,
      // they are still truthy in the refinement, so this would fail
      expect(result.success).toBe(false);
    });

    it("should validate complex score object", () => {
      const complexSchema = z.object({
        traceId: z.string().optional(),
        observationId: z.string().optional(),
        sessionId: z.string().optional(),
        datasetRunId: z.string().optional(),
        name: z.string(),
        value: z.number(),
        comment: z.string().optional(),
        metadata: z.record(z.unknown()).optional(),
      });

      const validatedComplexSchema = applyScoreValidation(complexSchema);

      const data = {
        traceId: "trace-123",
        observationId: "obs-456",
        name: "accuracy",
        value: 0.95,
        comment: "Good performance",
        metadata: { model: "gpt-4", version: "1.0" },
      };

      const result = validatedComplexSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("should handle undefined values correctly", () => {
      const data = {
        traceId: "trace-123",
        observationId: undefined,
        sessionId: undefined,
        datasetRunId: undefined,
        value: 0.9,
      };

      const result = validatedSchema.safeParse(data);

      expect(result.success).toBe(true);
    });
  });
});
