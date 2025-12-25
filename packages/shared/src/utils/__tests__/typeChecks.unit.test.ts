import { expect, describe, it } from "vitest";
import { isPresent } from "../typeChecks";

describe("isPresent", () => {
  describe("returning true for valid values", () => {
    it("should return true for non-empty strings", () => {
      expect(isPresent("hello")).toBe(true);
      expect(isPresent("world")).toBe(true);
      expect(isPresent("a")).toBe(true);
    });

    it("should return true for strings with whitespace", () => {
      expect(isPresent(" ")).toBe(true);
      expect(isPresent("  ")).toBe(true);
      expect(isPresent("\t")).toBe(true);
      expect(isPresent("\n")).toBe(true);
    });

    it("should return true for numbers", () => {
      expect(isPresent(0)).toBe(true);
      expect(isPresent(1)).toBe(true);
      expect(isPresent(-1)).toBe(true);
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

    it("should return true for functions", () => {
      expect(isPresent(() => {})).toBe(true);
      expect(isPresent(function() {})).toBe(true);
    });

    it("should return true for Date objects", () => {
      expect(isPresent(new Date())).toBe(true);
    });

    it("should return true for RegExp", () => {
      expect(isPresent(/test/)).toBe(true);
    });

    it("should return true for symbols", () => {
      expect(isPresent(Symbol("test"))).toBe(true);
    });
  });

  describe("returning false for null/undefined/empty string", () => {
    it("should return false for null", () => {
      expect(isPresent(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isPresent(undefined)).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isPresent("")).toBe(false);
    });
  });

  describe("type narrowing", () => {
    it("should narrow type for strings", () => {
      const value: string | null | undefined = "test";
      if (isPresent(value)) {
        // Type should be narrowed to string
        const length: number = value.length;
        expect(length).toBe(4);
      }
    });

    it("should narrow type for numbers", () => {
      const value: number | null | undefined = 42;
      if (isPresent(value)) {
        // Type should be narrowed to number
        const doubled: number = value * 2;
        expect(doubled).toBe(84);
      }
    });

    it("should narrow type for objects", () => {
      const value: { key: string } | null | undefined = { key: "value" };
      if (isPresent(value)) {
        // Type should be narrowed to { key: string }
        const key: string = value.key;
        expect(key).toBe("value");
      }
    });

    it("should work in filter operations", () => {
      const values = [1, null, 2, undefined, 3, "", 4];
      const filtered = values.filter(isPresent);
      expect(filtered).toEqual([1, 2, 3, 4]);
    });

    it("should filter out nullish values from arrays", () => {
      const values = ["a", null, "b", undefined, "", "c"];
      const filtered = values.filter(isPresent);
      expect(filtered).toEqual(["a", "b", "c"]);
    });
  });

  describe("edge cases", () => {
    it("should return true for zero", () => {
      expect(isPresent(0)).toBe(true);
    });

    it("should return true for false", () => {
      expect(isPresent(false)).toBe(true);
    });

    it("should return true for NaN", () => {
      expect(isPresent(NaN)).toBe(true);
    });

    it("should return true for Infinity", () => {
      expect(isPresent(Infinity)).toBe(true);
      expect(isPresent(-Infinity)).toBe(true);
    });

    it("should return true for empty object", () => {
      expect(isPresent({})).toBe(true);
    });

    it("should return true for empty array", () => {
      expect(isPresent([])).toBe(true);
    });
  });

  describe("complex scenarios", () => {
    it("should work with nested nullish checks", () => {
      const obj: { nested?: { value?: string } | null } | null = {
        nested: { value: "test" },
      };
      
      if (isPresent(obj) && isPresent(obj.nested) && isPresent(obj.nested.value)) {
        expect(obj.nested.value).toBe("test");
      }
    });

    it("should work with optional chaining", () => {
      const obj: { nested?: { value?: string } } | null = null;
      const value = obj?.nested?.value;
      expect(isPresent(value)).toBe(false);
    });

    it("should handle array of optional values", () => {
      const values: (string | null | undefined)[] = [
        "a",
        null,
        "b",
        undefined,
        "c",
        "",
      ];
      const present = values.filter(isPresent);
      expect(present).toEqual(["a", "b", "c"]);
      expect(present.length).toBe(3);
    });

    it("should work with union types", () => {
      const value: string | number | null = "test";
      if (isPresent(value)) {
        // Should be narrowed to string | number
        expect(typeof value === "string" || typeof value === "number").toBe(true);
      }
    });

    it("should handle mixed array filtering", () => {
      const mixed: (number | null | undefined | string)[] = [
        1,
        null,
        "two",
        undefined,
        3,
        "",
        "four",
      ];
      const filtered = mixed.filter(isPresent);
      expect(filtered).toEqual([1, "two", 3, "four"]);
    });
  });
});
