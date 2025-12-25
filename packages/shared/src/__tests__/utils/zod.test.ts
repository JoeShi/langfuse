import { describe, it, expect } from "vitest";
import {
  jsonSchema,
  jsonSchemaNullable,
  paginationZod,
  optionalPaginationZod,
  datetimeFilterSchema,
  variableMapping,
} from "../../../src/utils/zod";

describe("zod utils", () => {
  describe("jsonSchema", () => {
    it("should validate simple string", () => {
      const result = jsonSchema.safeParse("test");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("test");
      }
    });

    it("should validate number", () => {
      const result = jsonSchema.safeParse(42);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(42);
      }
    });

    it("should validate boolean", () => {
      const result = jsonSchema.safeParse(true);
      expect(result.success).toBe(true);
    });

    it("should validate object", () => {
      const result = jsonSchema.safeParse({ key: "value" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ key: "value" });
      }
    });

    it("should validate array", () => {
      const result = jsonSchema.safeParse([1, 2, 3]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([1, 2, 3]);
      }
    });

    it("should validate nested objects", () => {
      const nested = { outer: { inner: "value", num: 123 } };
      const result = jsonSchema.safeParse(nested);
      expect(result.success).toBe(true);
    });

    it("should reject null at root level", () => {
      const result = jsonSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it("should allow null in nested values", () => {
      const result = jsonSchema.safeParse({ key: null });
      expect(result.success).toBe(true);
    });

    it("should validate complex nested structures", () => {
      const complex = {
        array: [1, "two", { three: 3 }],
        nested: {
          deep: {
            value: "test",
            nullValue: null,
          },
        },
      };
      const result = jsonSchema.safeParse(complex);
      expect(result.success).toBe(true);
    });
  });

  describe("jsonSchemaNullable", () => {
    it("should accept null", () => {
      const result = jsonSchemaNullable.safeParse(null);
      expect(result.success).toBe(true);
    });

    it("should accept primitives", () => {
      expect(jsonSchemaNullable.safeParse("string").success).toBe(true);
      expect(jsonSchemaNullable.safeParse(123).success).toBe(true);
      expect(jsonSchemaNullable.safeParse(true).success).toBe(true);
    });

    it("should accept objects", () => {
      const result = jsonSchemaNullable.safeParse({ key: "value" });
      expect(result.success).toBe(true);
    });

    it("should accept arrays", () => {
      const result = jsonSchemaNullable.safeParse([1, null, "three"]);
      expect(result.success).toBe(true);
    });
  });

  describe("paginationZod", () => {
    it("should use default page value of 1", () => {
      const result = paginationZod.page.parse(undefined);
      expect(result).toBe(1);
    });

    it("should use default limit value of 50", () => {
      const result = paginationZod.limit.parse(undefined);
      expect(result).toBe(50);
    });

    it("should coerce string to number for page", () => {
      const result = paginationZod.page.parse("5");
      expect(result).toBe(5);
    });

    it("should coerce string to number for limit", () => {
      const result = paginationZod.limit.parse("25");
      expect(result).toBe(25);
    });

    it("should reject negative page numbers", () => {
      expect(() => paginationZod.page.parse(-1)).toThrow();
    });

    it("should reject negative limit", () => {
      expect(() => paginationZod.limit.parse(-1)).toThrow();
    });

    it("should reject limit greater than 100", () => {
      expect(() => paginationZod.limit.parse(101)).toThrow();
    });

    it("should allow limit of exactly 100", () => {
      const result = paginationZod.limit.parse(100);
      expect(result).toBe(100);
    });

    it("should treat empty string as undefined for page", () => {
      const result = paginationZod.page.parse("");
      expect(result).toBe(1);
    });

    it("should treat empty string as undefined for limit", () => {
      const result = paginationZod.limit.parse("");
      expect(result).toBe(50);
    });

    it("should accept valid page values", () => {
      expect(paginationZod.page.parse(1)).toBe(1);
      expect(paginationZod.page.parse(10)).toBe(10);
      expect(paginationZod.page.parse(100)).toBe(100);
    });

    it("should accept valid limit values", () => {
      expect(paginationZod.limit.parse(1)).toBe(1);
      expect(paginationZod.limit.parse(50)).toBe(50);
      expect(paginationZod.limit.parse(100)).toBe(100);
    });
  });

  describe("optionalPaginationZod", () => {
    it("should make page optional", () => {
      const result = optionalPaginationZod.page.parse(undefined);
      expect(result).toBeUndefined();
    });

    it("should make limit optional", () => {
      const result = optionalPaginationZod.limit.parse(undefined);
      expect(result).toBeUndefined();
    });

    it("should still coerce when provided", () => {
      expect(optionalPaginationZod.page.parse("5")).toBe(5);
      expect(optionalPaginationZod.limit.parse("25")).toBe(25);
    });

    it("should still validate constraints when provided", () => {
      expect(() => optionalPaginationZod.page.parse(-1)).toThrow();
      expect(() => optionalPaginationZod.limit.parse(101)).toThrow();
    });
  });

  describe("datetimeFilterSchema", () => {
    it("should validate valid datetime filters", () => {
      const filter = {
        type: "datetime" as const,
        operator: ">" as const,
        value: new Date("2024-01-01"),
      };
      const result = datetimeFilterSchema.safeParse(filter);
      expect(result.success).toBe(true);
    });

    it("should accept all valid operators", () => {
      const operators = [">", ">=", "<", "<="] as const;
      operators.forEach((operator) => {
        const filter = {
          type: "datetime" as const,
          operator,
          value: new Date(),
        };
        const result = datetimeFilterSchema.safeParse(filter);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid operators", () => {
      const filter = {
        type: "datetime",
        operator: "invalid",
        value: new Date(),
      };
      const result = datetimeFilterSchema.safeParse(filter);
      expect(result.success).toBe(false);
    });

    it("should reject non-date values", () => {
      const filter = {
        type: "datetime",
        operator: ">",
        value: "not a date",
      };
      const result = datetimeFilterSchema.safeParse(filter);
      expect(result.success).toBe(false);
    });
  });

  describe("variableMapping", () => {
    it("should validate simple variable mappings", () => {
      const mapping = [{ var: "input", value: "test" }];
      const result = variableMapping.safeParse(mapping);
      expect(result.success).toBe(true);
    });

    it("should validate empty array", () => {
      const result = variableMapping.safeParse([]);
      expect(result.success).toBe(true);
    });

    it("should validate multiple mappings", () => {
      const mapping = [
        { var: "input", value: "test" },
        { var: "output", value: "result" },
      ];
      const result = variableMapping.safeParse(mapping);
      expect(result.success).toBe(true);
    });

    it("should accept various value types", () => {
      const mapping = [
        { var: "string", value: "text" },
        { var: "number", value: 123 },
        { var: "boolean", value: true },
        { var: "object", value: { key: "value" } },
      ];
      const result = variableMapping.safeParse(mapping);
      expect(result.success).toBe(true);
    });

    it("should reject mappings without var field", () => {
      const mapping = [{ value: "test" }];
      const result = variableMapping.safeParse(mapping);
      expect(result.success).toBe(false);
    });

    it("should reject mappings without value field", () => {
      const mapping = [{ var: "input" }];
      const result = variableMapping.safeParse(mapping);
      expect(result.success).toBe(false);
    });

    it("should reject non-array values", () => {
      const result = variableMapping.safeParse({ var: "input", value: "test" });
      expect(result.success).toBe(false);
    });
  });
});
