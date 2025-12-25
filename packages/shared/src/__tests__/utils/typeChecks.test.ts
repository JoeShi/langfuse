import { describe, it, expect } from "vitest";
import { isPresent, stringDateTime } from "../../../src/utils/typeChecks";

describe("typeChecks", () => {
  describe("isPresent", () => {
    it("should return true for non-null, non-undefined, non-empty string values", () => {
      expect(isPresent("hello")).toBe(true);
      expect(isPresent(0)).toBe(true);
      expect(isPresent(false)).toBe(true);
      expect(isPresent([])).toBe(true);
      expect(isPresent({})).toBe(true);
      expect(isPresent(123)).toBe(true);
    });

    it("should return false for null values", () => {
      expect(isPresent(null)).toBe(false);
    });

    it("should return false for undefined values", () => {
      expect(isPresent(undefined)).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isPresent("")).toBe(false);
    });

    it("should preserve type guard functionality", () => {
      const value: string | null | undefined = "test";
      if (isPresent(value)) {
        // TypeScript should recognize value as string here
        expect(typeof value).toBe("string");
        expect(value.length).toBe(4);
      }
    });

    it("should work with arrays", () => {
      const arr: (number | null | undefined)[] = [1, null, undefined, 2, 3];
      const filtered = arr.filter(isPresent);
      expect(filtered).toEqual([1, 2, 3]);
      expect(filtered.length).toBe(3);
    });

    it("should handle zero correctly", () => {
      expect(isPresent(0)).toBe(true);
      expect(isPresent(0n)).toBe(true);
    });

    it("should handle boolean false correctly", () => {
      expect(isPresent(false)).toBe(true);
    });
  });

  describe("stringDateTime", () => {
    it("should accept valid ISO datetime strings with offset", () => {
      const result = stringDateTime.safeParse("2024-01-15T10:30:00+00:00");
      expect(result.success).toBe(true);
    });

    it("should accept valid ISO datetime strings with Z timezone", () => {
      const result = stringDateTime.safeParse("2024-01-15T10:30:00Z");
      expect(result.success).toBe(true);
    });

    it("should accept datetime strings with timezone offsets", () => {
      const result = stringDateTime.safeParse("2024-01-15T10:30:00+05:30");
      expect(result.success).toBe(true);
    });

    it("should accept null values", () => {
      const result = stringDateTime.safeParse(null);
      expect(result.success).toBe(true);
    });

    it("should accept undefined values", () => {
      const result = stringDateTime.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it("should reject invalid datetime strings", () => {
      const result = stringDateTime.safeParse("not a date");
      expect(result.success).toBe(false);
    });

    it("should reject datetime strings without offset", () => {
      const result = stringDateTime.safeParse("2024-01-15T10:30:00");
      expect(result.success).toBe(false);
    });

    it("should reject malformed datetime strings", () => {
      const result = stringDateTime.safeParse("2024-13-45T25:70:99Z");
      expect(result.success).toBe(false);
    });

    it("should reject non-string values", () => {
      const result = stringDateTime.safeParse(12345);
      expect(result.success).toBe(false);
    });
  });
});
