import { describe, it, expect } from "vitest";
import {
  ScoreBodyWithoutConfig,
  ScorePropsAgainstConfig,
} from "../../../../src/features/scores/interfaces/ingestion/validation";

describe("scores ingestion validation", () => {
  describe("ScoreBodyWithoutConfig", () => {
    describe("NUMERIC dataType", () => {
      it("should validate valid numeric score", () => {
        const score = {
          name: "accuracy",
          value: 0.95,
          dataType: "NUMERIC",
          traceId: "trace-123",
        };
        const result = ScoreBodyWithoutConfig.safeParse(score);
        expect(result.success).toBe(true);
      });

      it("should accept integer values", () => {
        const score = {
          name: "count",
          value: 42,
          dataType: "NUMERIC",
          traceId: "trace-123",
        };
        const result = ScoreBodyWithoutConfig.safeParse(score);
        expect(result.success).toBe(true);
      });

      it("should accept negative values", () => {
        const score = {
          name: "loss",
          value: -1.5,
          dataType: "NUMERIC",
          traceId: "trace-123",
        };
        const result = ScoreBodyWithoutConfig.safeParse(score);
        expect(result.success).toBe(true);
      });

      it("should reject non-numeric values", () => {
        const score = {
          name: "accuracy",
          value: "not a number",
          dataType: "NUMERIC",
          traceId: "trace-123",
        };
        const result = ScoreBodyWithoutConfig.safeParse(score);
        expect(result.success).toBe(false);
      });
    });

    describe("CATEGORICAL dataType", () => {
      it("should validate valid categorical score", () => {
        const score = {
          name: "sentiment",
          value: "positive",
          dataType: "CATEGORICAL",
          traceId: "trace-123",
        };
        const result = ScoreBodyWithoutConfig.safeParse(score);
        expect(result.success).toBe(true);
      });

      it("should accept any string value", () => {
        const score = {
          name: "category",
          value: "some-category-value",
          dataType: "CATEGORICAL",
          traceId: "trace-123",
        };
        const result = ScoreBodyWithoutConfig.safeParse(score);
        expect(result.success).toBe(true);
      });

      it("should reject non-string values", () => {
        const score = {
          name: "sentiment",
          value: 123,
          dataType: "CATEGORICAL",
          traceId: "trace-123",
        };
        const result = ScoreBodyWithoutConfig.safeParse(score);
        expect(result.success).toBe(false);
      });
    });

    describe("CORRECTION dataType", () => {
      it("should validate correction score with string value", () => {
        const score = {
          name: "correction",
          value: "corrected text",
          dataType: "CORRECTION",
          traceId: "trace-123",
        };
        const result = ScoreBodyWithoutConfig.safeParse(score);
        expect(result.success).toBe(true);
      });

      it("should accept empty string", () => {
        const score = {
          name: "correction",
          value: "",
          dataType: "CORRECTION",
          traceId: "trace-123",
        };
        const result = ScoreBodyWithoutConfig.safeParse(score);
        expect(result.success).toBe(true);
      });
    });

    describe("BOOLEAN dataType", () => {
      it("should validate 1 as valid boolean", () => {
        const score = {
          name: "approved",
          value: 1,
          dataType: "BOOLEAN",
          traceId: "trace-123",
        };
        const result = ScoreBodyWithoutConfig.safeParse(score);
        expect(result.success).toBe(true);
      });

      it("should validate 0 as valid boolean", () => {
        const score = {
          name: "approved",
          value: 0,
          dataType: "BOOLEAN",
          traceId: "trace-123",
        };
        const result = ScoreBodyWithoutConfig.safeParse(score);
        expect(result.success).toBe(true);
      });

      it("should reject other numeric values", () => {
        const score = {
          name: "approved",
          value: 2,
          dataType: "BOOLEAN",
          traceId: "trace-123",
        };
        const result = ScoreBodyWithoutConfig.safeParse(score);
        expect(result.success).toBe(false);
      });

      it("should reject boolean values", () => {
        const score = {
          name: "approved",
          value: true,
          dataType: "BOOLEAN",
          traceId: "trace-123",
        };
        const result = ScoreBodyWithoutConfig.safeParse(score);
        expect(result.success).toBe(false);
      });
    });

    describe("common fields", () => {
      it("should validate with traceId", () => {
        const score = {
          name: "test",
          value: 1,
          dataType: "NUMERIC",
          traceId: "trace-123",
        };
        const result = ScoreBodyWithoutConfig.safeParse(score);
        expect(result.success).toBe(true);
      });

      it("should validate with observationId", () => {
        const score = {
          name: "test",
          value: 1,
          dataType: "NUMERIC",
          observationId: "obs-123",
        };
        const result = ScoreBodyWithoutConfig.safeParse(score);
        expect(result.success).toBe(true);
      });

      it("should validate with sessionId", () => {
        const score = {
          name: "test",
          value: 1,
          dataType: "NUMERIC",
          sessionId: "session-123",
        };
        const result = ScoreBodyWithoutConfig.safeParse(score);
        expect(result.success).toBe(true);
      });

      it("should accept optional comment field", () => {
        const score = {
          name: "test",
          value: 1,
          dataType: "NUMERIC",
          traceId: "trace-123",
          comment: "This is a test comment",
        };
        const result = ScoreBodyWithoutConfig.safeParse(score);
        expect(result.success).toBe(true);
      });

      it("should accept optional metadata field", () => {
        const score = {
          name: "test",
          value: 1,
          dataType: "NUMERIC",
          traceId: "trace-123",
          metadata: { key: "value" },
        };
        const result = ScoreBodyWithoutConfig.safeParse(score);
        expect(result.success).toBe(true);
      });

      it("should use default environment value", () => {
        const score = {
          name: "test",
          value: 1,
          dataType: "NUMERIC",
          traceId: "trace-123",
        };
        const result = ScoreBodyWithoutConfig.safeParse(score);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.environment).toBe("default");
        }
      });

      it("should accept custom environment", () => {
        const score = {
          name: "test",
          value: 1,
          dataType: "NUMERIC",
          traceId: "trace-123",
          environment: "production",
        };
        const result = ScoreBodyWithoutConfig.safeParse(score);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.environment).toBe("production");
        }
      });
    });
  });

  describe("ScorePropsAgainstConfig", () => {
    describe("NUMERIC with constraints", () => {
      it("should validate value within range", () => {
        const props = {
          value: 5,
          minValue: 0,
          maxValue: 10,
          dataType: "NUMERIC",
        };
        const result = ScorePropsAgainstConfig.safeParse(props);
        expect(result.success).toBe(true);
      });

      it("should reject value above maxValue", () => {
        const props = {
          value: 15,
          minValue: 0,
          maxValue: 10,
          dataType: "NUMERIC",
        };
        const result = ScorePropsAgainstConfig.safeParse(props);
        expect(result.success).toBe(false);
      });

      it("should reject value below minValue", () => {
        const props = {
          value: -5,
          minValue: 0,
          maxValue: 10,
          dataType: "NUMERIC",
        };
        const result = ScorePropsAgainstConfig.safeParse(props);
        expect(result.success).toBe(false);
      });

      it("should accept value equal to maxValue", () => {
        const props = {
          value: 10,
          minValue: 0,
          maxValue: 10,
          dataType: "NUMERIC",
        };
        const result = ScorePropsAgainstConfig.safeParse(props);
        expect(result.success).toBe(true);
      });

      it("should accept value equal to minValue", () => {
        const props = {
          value: 0,
          minValue: 0,
          maxValue: 10,
          dataType: "NUMERIC",
        };
        const result = ScorePropsAgainstConfig.safeParse(props);
        expect(result.success).toBe(true);
      });
    });

    describe("CATEGORICAL with categories", () => {
      it("should validate value matching a category", () => {
        const props = {
          value: "positive",
          categories: [
            { label: "positive", value: 1 },
            { label: "negative", value: 0 },
          ],
          dataType: "CATEGORICAL",
        };
        const result = ScorePropsAgainstConfig.safeParse(props);
        expect(result.success).toBe(true);
      });

      it("should reject value not in categories", () => {
        const props = {
          value: "neutral",
          categories: [
            { label: "positive", value: 1 },
            { label: "negative", value: 0 },
          ],
          dataType: "CATEGORICAL",
        };
        const result = ScorePropsAgainstConfig.safeParse(props);
        expect(result.success).toBe(false);
      });

      it("should handle empty categories array", () => {
        const props = {
          value: "any",
          categories: [],
          dataType: "CATEGORICAL",
        };
        const result = ScorePropsAgainstConfig.safeParse(props);
        expect(result.success).toBe(false);
      });
    });

    describe("BOOLEAN validation", () => {
      it("should accept 1", () => {
        const props = {
          value: 1,
          dataType: "BOOLEAN",
        };
        const result = ScorePropsAgainstConfig.safeParse(props);
        expect(result.success).toBe(true);
      });

      it("should accept 0", () => {
        const props = {
          value: 0,
          dataType: "BOOLEAN",
        };
        const result = ScorePropsAgainstConfig.safeParse(props);
        expect(result.success).toBe(true);
      });

      it("should reject other values", () => {
        const props = {
          value: 2,
          dataType: "BOOLEAN",
        };
        const result = ScorePropsAgainstConfig.safeParse(props);
        expect(result.success).toBe(false);
      });
    });
  });
});
