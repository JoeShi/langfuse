import { describe, it, expect } from "vitest";
import { z } from "zod/v4";
import { applyScoreValidation } from "../scores";

describe("scores utilities", () => {
  describe("applyScoreValidation", () => {
    const baseSchema = z.object({
      traceId: z.string().optional(),
      sessionId: z.string().optional(),
      datasetRunId: z.string().optional(),
      observationId: z.string().optional(),
      value: z.number(),
    });

    const validatedSchema = applyScoreValidation(baseSchema);

    it("should accept traceId only", () => {
      const data = {
        traceId: "trace-123",
        value: 0.9,
      };
      expect(() => validatedSchema.parse(data)).not.toThrow();
    });

    it("should accept traceId with observationId", () => {
      const data = {
        traceId: "trace-123",
        observationId: "obs-456",
        value: 0.9,
      };
      expect(() => validatedSchema.parse(data)).not.toThrow();
    });

    it("should accept sessionId only", () => {
      const data = {
        sessionId: "session-123",
        value: 0.9,
      };
      expect(() => validatedSchema.parse(data)).not.toThrow();
    });

    it("should accept datasetRunId only", () => {
      const data = {
        datasetRunId: "dataset-run-123",
        value: 0.9,
      };
      expect(() => validatedSchema.parse(data)).not.toThrow();
    });

    it("should reject both traceId and sessionId", () => {
      const data = {
        traceId: "trace-123",
        sessionId: "session-123",
        value: 0.9,
      };
      expect(() => validatedSchema.parse(data)).toThrow();
    });

    it("should reject both traceId and datasetRunId", () => {
      const data = {
        traceId: "trace-123",
        datasetRunId: "dataset-run-123",
        value: 0.9,
      };
      expect(() => validatedSchema.parse(data)).toThrow();
    });

    it("should reject both sessionId and datasetRunId", () => {
      const data = {
        sessionId: "session-123",
        datasetRunId: "dataset-run-123",
        value: 0.9,
      };
      expect(() => validatedSchema.parse(data)).toThrow();
    });

    it("should reject all three IDs together", () => {
      const data = {
        traceId: "trace-123",
        sessionId: "session-123",
        datasetRunId: "dataset-run-123",
        value: 0.9,
      };
      expect(() => validatedSchema.parse(data)).toThrow();
    });

    it("should reject sessionId with observationId", () => {
      const data = {
        sessionId: "session-123",
        observationId: "obs-456",
        value: 0.9,
      };
      expect(() => validatedSchema.parse(data)).toThrow(
        /Provide exactly one of the following/,
      );
    });

    it("should reject datasetRunId with observationId", () => {
      const data = {
        datasetRunId: "dataset-run-123",
        observationId: "obs-456",
        value: 0.9,
      };
      expect(() => validatedSchema.parse(data)).toThrow();
    });

    it("should reject observationId without traceId", () => {
      const data = {
        observationId: "obs-456",
        value: 0.9,
      };
      expect(() => validatedSchema.parse(data)).toThrow();
    });

    it("should reject when no IDs are provided", () => {
      const data = {
        value: 0.9,
      };
      expect(() => validatedSchema.parse(data)).toThrow();
    });

    it("should include proper error message", () => {
      const data = {
        traceId: "trace-123",
        sessionId: "session-123",
        value: 0.9,
      };

      try {
        validatedSchema.parse(data);
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain(
          "Provide exactly one of the following",
        );
      }
    });

    it("should work with different schema extensions", () => {
      const extendedSchema = applyScoreValidation(
        baseSchema.extend({
          name: z.string(),
          comment: z.string().optional(),
        }),
      );

      const data = {
        traceId: "trace-123",
        value: 0.9,
        name: "quality-score",
        comment: "Good quality",
      };

      expect(() => extendedSchema.parse(data)).not.toThrow();
    });

    it("should handle empty string IDs as falsy", () => {
      // Empty strings should be treated as not having the ID
      const data = {
        traceId: "trace-123",
        sessionId: "",
        datasetRunId: "",
        value: 0.9,
      };
      // This should pass because empty strings are falsy in the validation
      expect(() => validatedSchema.parse(data)).not.toThrow();
    });
  });
});
