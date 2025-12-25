import { describe, it, expect } from "vitest";
import { isPresent, stringDateTime } from "../typeChecks";

describe("typeChecks utilities", () => {
  describe("isPresent", () => {
    it("should return true for valid values", () => {
      expect(isPresent("hello")).toBe(true);
      expect(isPresent(42)).toBe(true);
      expect(isPresent(0)).toBe(true);
      expect(isPresent(false)).toBe(true);
      expect(isPresent([])).toBe(true);
      expect(isPresent({})).toBe(true);
    });

    it("should return false for null", () => {
      expect(isPresent(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isPresent(undefined)).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isPresent("")).toBe(false);
    });

    it("should work as type guard", () => {
      const value: string | null | undefined = "test";
      if (isPresent(value)) {
        // TypeScript should know value is string here
        expect(value.length).toBe(4);
      }
    });

    it("should filter arrays correctly", () => {
      const arr = [1, null, 2, undefined, 3, ""];
      const filtered = arr.filter(isPresent);
      expect(filtered).toEqual([1, 2, 3]);
    });
  });

  describe("stringDateTime", () => {
    it("should accept valid ISO datetime strings with offset", () => {
      const valid = "2024-12-25T10:30:00Z";
      const result = stringDateTime.parse(valid);
      expect(result).toBe(valid);
    });

    it("should accept datetime with timezone offset", () => {
      const valid = "2024-12-25T10:30:00+05:30";
      const result = stringDateTime.parse(valid);
      expect(result).toBe(valid);
    });

    it("should accept datetime with negative offset", () => {
      const valid = "2024-12-25T10:30:00-08:00";
      const result = stringDateTime.parse(valid);
      expect(result).toBe(valid);
    });

    it("should accept null", () => {
      const result = stringDateTime.parse(null);
      expect(result).toBeNull();
    });

    it("should accept undefined", () => {
      const result = stringDateTime.parse(undefined);
      expect(result).toBeUndefined();
    });

    it("should reject invalid datetime strings", () => {
      expect(() => stringDateTime.parse("not a date")).toThrow();
      expect(() => stringDateTime.parse("2024-12-25")).toThrow();
    });

    it("should reject datetime without offset", () => {
      expect(() => stringDateTime.parse("2024-12-25T10:30:00")).toThrow();
    });
  });
});
