import { describe, it, expect } from "vitest";
import {
  validateRegexPattern,
  PricingTierConditionSchema,
  PricingTierInputSchema,
} from "../../../../src/features/model-pricing/validation";

describe("model-pricing validation", () => {
  describe("validateRegexPattern", () => {
    it("should accept valid regex patterns", () => {
      expect(() => validateRegexPattern("^test$")).not.toThrow();
      expect(() => validateRegexPattern(".*")).not.toThrow();
      expect(() => validateRegexPattern("[a-z]+")).not.toThrow();
      expect(() => validateRegexPattern("\\d{1,3}")).not.toThrow();
    });

    it("should reject empty patterns", () => {
      expect(() => validateRegexPattern("")).toThrow("Pattern cannot be empty");
    });

    it("should reject patterns exceeding 200 characters", () => {
      const longPattern = "a".repeat(201);
      expect(() => validateRegexPattern(longPattern)).toThrow(
        "Pattern exceeds maximum length of 200 characters",
      );
    });

    it("should accept patterns at exactly 200 characters", () => {
      const exactPattern = "a".repeat(200);
      expect(() => validateRegexPattern(exactPattern)).not.toThrow();
    });

    it("should reject invalid regex syntax", () => {
      expect(() => validateRegexPattern("[unclosed")).toThrow("Invalid regex syntax");
      expect(() => validateRegexPattern("(unclosed")).toThrow("Invalid regex syntax");
      expect(() => validateRegexPattern("*invalid")).toThrow("Invalid regex syntax");
    });

    it("should reject patterns with catastrophic backtracking", () => {
      // Classic catastrophic backtracking pattern
      const dangerousPattern = "(a+)+b";
      expect(() => validateRegexPattern(dangerousPattern)).toThrow(
        "Pattern may cause catastrophic backtracking",
      );
    });

    it("should accept common safe patterns", () => {
      const safePatterns = [
        "^gpt-4",
        "claude.*",
        "model-\\w+",
        "[0-9]{1,10}",
        "^(option1|option2)$",
      ];

      safePatterns.forEach((pattern) => {
        expect(() => validateRegexPattern(pattern)).not.toThrow();
      });
    });
  });

  describe("PricingTierConditionSchema", () => {
    it("should validate valid condition", () => {
      const condition = {
        usageDetailPattern: "^gpt-4",
        operator: "gt" as const,
        value: 1000,
        caseSensitive: false,
      };
      const result = PricingTierConditionSchema.safeParse(condition);
      expect(result.success).toBe(true);
    });

    it("should accept all valid operators", () => {
      const operators = ["gt", "gte", "lt", "lte", "eq", "neq"] as const;
      
      operators.forEach((operator) => {
        const condition = {
          usageDetailPattern: "test",
          operator,
          value: 100,
        };
        const result = PricingTierConditionSchema.safeParse(condition);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid operator", () => {
      const condition = {
        usageDetailPattern: "test",
        operator: "invalid",
        value: 100,
      };
      const result = PricingTierConditionSchema.safeParse(condition);
      expect(result.success).toBe(false);
    });

    it("should reject empty pattern", () => {
      const condition = {
        usageDetailPattern: "",
        operator: "gt",
        value: 100,
      };
      const result = PricingTierConditionSchema.safeParse(condition);
      expect(result.success).toBe(false);
    });

    it("should reject pattern exceeding 200 characters", () => {
      const condition = {
        usageDetailPattern: "a".repeat(201),
        operator: "gt",
        value: 100,
      };
      const result = PricingTierConditionSchema.safeParse(condition);
      expect(result.success).toBe(false);
    });

    it("should reject invalid regex pattern", () => {
      const condition = {
        usageDetailPattern: "[unclosed",
        operator: "gt",
        value: 100,
      };
      const result = PricingTierConditionSchema.safeParse(condition);
      expect(result.success).toBe(false);
    });

    it("should reject negative value", () => {
      const condition = {
        usageDetailPattern: "test",
        operator: "gt",
        value: -1,
      };
      const result = PricingTierConditionSchema.safeParse(condition);
      expect(result.success).toBe(false);
    });

    it("should accept value of 0", () => {
      const condition = {
        usageDetailPattern: "test",
        operator: "gt",
        value: 0,
      };
      const result = PricingTierConditionSchema.safeParse(condition);
      expect(result.success).toBe(true);
    });

    it("should default caseSensitive to false", () => {
      const condition = {
        usageDetailPattern: "test",
        operator: "gt" as const,
        value: 100,
      };
      const result = PricingTierConditionSchema.safeParse(condition);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.caseSensitive).toBe(false);
      }
    });

    it("should accept explicit caseSensitive value", () => {
      const condition = {
        usageDetailPattern: "test",
        operator: "gt" as const,
        value: 100,
        caseSensitive: true,
      };
      const result = PricingTierConditionSchema.safeParse(condition);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.caseSensitive).toBe(true);
      }
    });
  });

  describe("PricingTierInputSchema", () => {
    it("should validate valid pricing tier input", () => {
      const tier = {
        name: "Enterprise Tier",
        isDefault: false,
        priority: 10,
        conditions: [
          {
            usageDetailPattern: "^gpt-4",
            operator: "gt" as const,
            value: 1000,
            caseSensitive: false,
          },
        ],
        prices: {
          "input-tokens": 0.03,
          "output-tokens": 0.06,
        },
      };
      const result = PricingTierInputSchema.safeParse(tier);
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const tier = {
        name: "",
        isDefault: false,
        priority: 10,
        conditions: [],
        prices: {},
      };
      const result = PricingTierInputSchema.safeParse(tier);
      expect(result.success).toBe(false);
    });

    it("should reject name exceeding 100 characters", () => {
      const tier = {
        name: "a".repeat(101),
        isDefault: false,
        priority: 10,
        conditions: [],
        prices: {},
      };
      const result = PricingTierInputSchema.safeParse(tier);
      expect(result.success).toBe(false);
    });

    it("should accept name at exactly 100 characters", () => {
      const tier = {
        name: "a".repeat(100),
        isDefault: false,
        priority: 10,
        conditions: [],
        prices: {},
      };
      const result = PricingTierInputSchema.safeParse(tier);
      expect(result.success).toBe(true);
    });

    it("should default isDefault to false", () => {
      const tier = {
        name: "Test Tier",
        priority: 10,
        conditions: [],
        prices: {},
      };
      const result = PricingTierInputSchema.safeParse(tier);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isDefault).toBe(false);
      }
    });

    it("should reject non-integer priority", () => {
      const tier = {
        name: "Test Tier",
        priority: 10.5,
        conditions: [],
        prices: {},
      };
      const result = PricingTierInputSchema.safeParse(tier);
      expect(result.success).toBe(false);
    });

    it("should reject negative priority", () => {
      const tier = {
        name: "Test Tier",
        priority: -1,
        conditions: [],
        prices: {},
      };
      const result = PricingTierInputSchema.safeParse(tier);
      expect(result.success).toBe(false);
    });

    it("should reject priority exceeding 999", () => {
      const tier = {
        name: "Test Tier",
        priority: 1000,
        conditions: [],
        prices: {},
      };
      const result = PricingTierInputSchema.safeParse(tier);
      expect(result.success).toBe(false);
    });

    it("should accept priority of 0", () => {
      const tier = {
        name: "Test Tier",
        priority: 0,
        conditions: [],
        prices: {},
      };
      const result = PricingTierInputSchema.safeParse(tier);
      expect(result.success).toBe(true);
    });

    it("should accept priority of 999", () => {
      const tier = {
        name: "Test Tier",
        priority: 999,
        conditions: [],
        prices: {},
      };
      const result = PricingTierInputSchema.safeParse(tier);
      expect(result.success).toBe(true);
    });

    it("should accept empty conditions array", () => {
      const tier = {
        name: "Test Tier",
        priority: 10,
        conditions: [],
        prices: {},
      };
      const result = PricingTierInputSchema.safeParse(tier);
      expect(result.success).toBe(true);
    });

    it("should accept multiple conditions", () => {
      const tier = {
        name: "Test Tier",
        priority: 10,
        conditions: [
          {
            usageDetailPattern: "^gpt-4",
            operator: "gt" as const,
            value: 1000,
          },
          {
            usageDetailPattern: "^claude",
            operator: "lte" as const,
            value: 500,
          },
        ],
        prices: {},
      };
      const result = PricingTierInputSchema.safeParse(tier);
      expect(result.success).toBe(true);
    });

    it("should reject negative prices", () => {
      const tier = {
        name: "Test Tier",
        priority: 10,
        conditions: [],
        prices: {
          "input-tokens": -0.01,
        },
      };
      const result = PricingTierInputSchema.safeParse(tier);
      expect(result.success).toBe(false);
    });

    it("should accept price of 0", () => {
      const tier = {
        name: "Test Tier",
        priority: 10,
        conditions: [],
        prices: {
          "input-tokens": 0,
          "output-tokens": 0.01,
        },
      };
      const result = PricingTierInputSchema.safeParse(tier);
      expect(result.success).toBe(true);
    });

    it("should accept empty prices object", () => {
      const tier = {
        name: "Test Tier",
        priority: 10,
        conditions: [],
        prices: {},
      };
      const result = PricingTierInputSchema.safeParse(tier);
      expect(result.success).toBe(true);
    });

    it("should accept multiple price entries", () => {
      const tier = {
        name: "Test Tier",
        priority: 10,
        conditions: [],
        prices: {
          "input-tokens": 0.01,
          "output-tokens": 0.02,
          "cached-tokens": 0.005,
        },
      };
      const result = PricingTierInputSchema.safeParse(tier);
      expect(result.success).toBe(true);
    });
  });
});
