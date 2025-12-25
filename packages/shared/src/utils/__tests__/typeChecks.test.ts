import { describe, it, expect } from "vitest";
import { isPresent, stringDateTime } from "../typeChecks";

describe("typeChecks.ts", () => {
  describe("isPresent", () => {
    it("should return false for null", () => {
      expect(isPresent(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isPresent(undefined)).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isPresent("")).toBe(false);
    });

    it("should return true for non-empty string", () => {
      expect(isPresent("hello")).toBe(true);
      expect(isPresent("0")).toBe(true);
      expect(isPresent(" ")).toBe(true); // Space is not empty
    });

    it("should return true for numbers", () => {
      expect(isPresent(0)).toBe(true);
      expect(isPresent(123)).toBe(true);
      expect(isPresent(-456)).toBe(true);
      expect(isPresent(3.14)).toBe(true);
    });

    it("should return true for boolean values", () => {
      expect(isPresent(true)).toBe(true);
      expect(isPresent(false)).toBe(true);
    });

    it("should return true for objects", () => {
      expect(isPresent({})).toBe(true);
      expect(isPresent({ key: "value" })).toBe(true);
    });

    it("should return true for arrays", () => {
      expect(isPresent([])).toBe(true);
      expect(isPresent([1, 2, 3])).toBe(true);
    });

    it("should return true for Date objects", () => {
      expect(isPresent(new Date())).toBe(true);
    });

    it("should return true for functions", () => {
      expect(isPresent(() => {})).toBe(true);
      expect(isPresent(function () {})).toBe(true);
    });

    it("should correctly narrow types with type guard", () => {
      const value: string | null | undefined = "hello";
      
      if (isPresent(value)) {
        // TypeScript should know value is string here
        expect(value.toUpperCase()).toBe("HELLO");
      }
    });

    it("should filter out null, undefined, and empty strings from arrays", () => {
      const mixed = [1, null, "hello", undefined, "", 0, false];
      const filtered = mixed.filter(isPresent);

      expect(filtered).toEqual([1, "hello", 0, false]);
    });

    it("should handle special number values", () => {
      expect(isPresent(NaN)).toBe(true);
      expect(isPresent(Infinity)).toBe(true);
      expect(isPresent(-Infinity)).toBe(true);
    });

    it("should return true for symbol", () => {
      expect(isPresent(Symbol("test"))).toBe(true);
    });

    it("should return true for BigInt", () => {
      expect(isPresent(BigInt(123))).toBe(true);
      expect(isPresent(BigInt(0))).toBe(true);
    });

    it("should handle regex", () => {
      expect(isPresent(/test/)).toBe(true);
    });

    it("should handle Map and Set", () => {
      expect(isPresent(new Map())).toBe(true);
      expect(isPresent(new Set())).toBe(true);
    });
  });

  describe("stringDateTime", () => {
    it("should accept valid ISO 8601 datetime with timezone offset", () => {
      const valid = "2023-01-01T12:00:00+00:00";
      const result = stringDateTime.safeParse(valid);

      expect(result.success).toBe(true);
    });

    it("should accept datetime with Z timezone", () => {
      const valid = "2023-01-01T12:00:00Z";
      const result = stringDateTime.safeParse(valid);

      expect(result.success).toBe(true);
    });

    it("should accept datetime with positive timezone offset", () => {
      const valid = "2023-01-01T12:00:00+05:30";
      const result = stringDateTime.safeParse(valid);

      expect(result.success).toBe(true);
    });

    it("should accept datetime with negative timezone offset", () => {
      const valid = "2023-01-01T12:00:00-08:00";
      const result = stringDateTime.safeParse(valid);

      expect(result.success).toBe(true);
    });

    it("should accept datetime with milliseconds", () => {
      const valid = "2023-01-01T12:00:00.123Z";
      const result = stringDateTime.safeParse(valid);

      expect(result.success).toBe(true);
    });

    it("should accept null", () => {
      const result = stringDateTime.safeParse(null);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it("should accept undefined", () => {
      const result = stringDateTime.safeParse(undefined);

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });

    it("should reject datetime without timezone offset", () => {
      const invalid = "2023-01-01T12:00:00";
      const result = stringDateTime.safeParse(invalid);

      expect(result.success).toBe(false);
    });

    it("should reject invalid datetime format", () => {
      const invalid = "2023-01-01 12:00:00";
      const result = stringDateTime.safeParse(invalid);

      expect(result.success).toBe(false);
    });

    it("should reject date without time", () => {
      const invalid = "2023-01-01";
      const result = stringDateTime.safeParse(invalid);

      expect(result.success).toBe(false);
    });

    it("should reject non-string values", () => {
      const invalid = 123;
      const result = stringDateTime.safeParse(invalid);

      expect(result.success).toBe(false);
    });

    it("should reject empty string", () => {
      const invalid = "";
      const result = stringDateTime.safeParse(invalid);

      expect(result.success).toBe(false);
    });

    it("should accept various valid ISO 8601 formats", () => {
      const validFormats = [
        "2023-12-25T10:30:00Z",
        "2023-12-25T10:30:00+00:00",
        "2023-12-25T10:30:00-05:00",
        "2023-12-25T10:30:00.000Z",
        "2023-12-25T10:30:00.123+01:00",
        "2023-01-01T00:00:00Z",
        "2023-12-31T23:59:59Z",
      ];

      validFormats.forEach((format) => {
        const result = stringDateTime.safeParse(format);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid dates", () => {
      const invalidDates = [
        "2023-13-01T12:00:00Z", // Invalid month
        "2023-01-32T12:00:00Z", // Invalid day
        "2023-01-01T25:00:00Z", // Invalid hour
        "2023-01-01T12:60:00Z", // Invalid minute
        "2023-01-01T12:00:60Z", // Invalid second
      ];

      invalidDates.forEach((date) => {
        const result = stringDateTime.safeParse(date);
        expect(result.success).toBe(false);
      });
    });

    it("should be nullish (accept null and undefined)", () => {
      // Test that it's truly nullish
      expect(stringDateTime.safeParse(null).success).toBe(true);
      expect(stringDateTime.safeParse(undefined).success).toBe(true);
      
      // But rejects other falsy values that aren't null/undefined
      expect(stringDateTime.safeParse("").success).toBe(false);
      expect(stringDateTime.safeParse(0).success).toBe(false);
      expect(stringDateTime.safeParse(false).success).toBe(false);
    });

    it("should work in object schemas", () => {
      const schema = stringDateTime;
      const testObject = {
        created: "2023-01-01T12:00:00Z",
        updated: null,
        deleted: undefined,
      };

      expect(schema.safeParse(testObject.created).success).toBe(true);
      expect(schema.safeParse(testObject.updated).success).toBe(true);
      expect(schema.safeParse(testObject.deleted).success).toBe(true);
    });

    it("should handle leap year dates", () => {
      const leapYear = "2024-02-29T12:00:00Z";
      const result = stringDateTime.safeParse(leapYear);

      expect(result.success).toBe(true);
    });

    it("should reject non-leap year Feb 29", () => {
      const nonLeapYear = "2023-02-29T12:00:00Z";
      const result = stringDateTime.safeParse(nonLeapYear);

      expect(result.success).toBe(false);
    });

    it("should handle edge case times", () => {
      const edgeCases = [
        "2023-01-01T00:00:00Z", // Midnight
        "2023-01-01T23:59:59Z", // End of day
        "2023-01-01T12:00:00.999Z", // Milliseconds
      ];

      edgeCases.forEach((time) => {
        const result = stringDateTime.safeParse(time);
        expect(result.success).toBe(true);
      });
    });
  });
});
