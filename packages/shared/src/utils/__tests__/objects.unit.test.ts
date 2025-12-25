import { expect, describe, it } from "vitest";
import { removeObjectKeys } from "../objects";

describe("removeObjectKeys", () => {
  describe("basic functionality", () => {
    it("should remove specified keys from object", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = removeObjectKeys(obj, ["b"]);
      expect(result).toEqual({ a: 1, c: 3 });
      expect(result.b).toBeUndefined();
    });

    it("should remove multiple keys", () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = removeObjectKeys(obj, ["a", "c"]);
      expect(result).toEqual({ b: 2, d: 4 });
    });

    it("should preserve unspecified keys", () => {
      const obj = { name: "John", age: 30, city: "NYC" };
      const result = removeObjectKeys(obj, ["age"]);
      expect(result).toEqual({ name: "John", city: "NYC" });
      expect(result.name).toBe("John");
      expect(result.city).toBe("NYC");
    });

    it("should return new object (not mutate original)", () => {
      const obj = { a: 1, b: 2 };
      const result = removeObjectKeys(obj, ["b"]);
      expect(result).not.toBe(obj);
      expect(obj.b).toBe(2); // Original unchanged
    });
  });

  describe("empty keys array", () => {
    it("should handle empty keys array", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = removeObjectKeys(obj, []);
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it("should return copy when no keys to remove", () => {
      const obj = { x: 10, y: 20 };
      const result = removeObjectKeys(obj, []);
      expect(result).toEqual(obj);
      expect(result).not.toBe(obj); // New object
    });
  });

  describe("edge cases", () => {
    it("should handle empty object", () => {
      const obj = {};
      const result = removeObjectKeys(obj, ["nonexistent"]);
      expect(result).toEqual({});
    });

    it("should handle removing non-existent keys", () => {
      const obj = { a: 1, b: 2 };
      const result = removeObjectKeys(obj, ["c", "d"] as any);
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it("should handle removing all keys", () => {
      const obj = { a: 1, b: 2 };
      const result = removeObjectKeys(obj, ["a", "b"]);
      expect(result).toEqual({});
    });

    it("should preserve null values", () => {
      const obj = { a: 1, b: null, c: 3 };
      const result = removeObjectKeys(obj, ["a"]);
      expect(result).toEqual({ b: null, c: 3 });
    });

    it("should preserve undefined values", () => {
      const obj = { a: 1, b: undefined, c: 3 };
      const result = removeObjectKeys(obj, ["a"]);
      expect(result).toEqual({ b: undefined, c: 3 });
    });

    it("should handle objects with boolean values", () => {
      const obj = { isActive: true, isDeleted: false, count: 5 };
      const result = removeObjectKeys(obj, ["isDeleted"]);
      expect(result).toEqual({ isActive: true, count: 5 });
    });

    it("should handle objects with array values", () => {
      const obj = { items: [1, 2, 3], name: "test" };
      const result = removeObjectKeys(obj, ["name"]);
      expect(result).toEqual({ items: [1, 2, 3] });
    });

    it("should handle objects with nested objects", () => {
      const obj = { outer: { inner: "value" }, simple: "text" };
      const result = removeObjectKeys(obj, ["simple"]);
      expect(result).toEqual({ outer: { inner: "value" } });
    });

    it("should handle string keys", () => {
      const obj = { firstName: "John", lastName: "Doe", age: 30 };
      const result = removeObjectKeys(obj, ["lastName"]);
      expect(result).toEqual({ firstName: "John", age: 30 });
    });

    it("should handle number values", () => {
      const obj = { a: 0, b: -1, c: 3.14 };
      const result = removeObjectKeys(obj, ["b"]);
      expect(result).toEqual({ a: 0, c: 3.14 });
    });
  });

  describe("type preservation", () => {
    it("should preserve value types", () => {
      const obj = {
        string: "text",
        number: 42,
        boolean: true,
        null: null,
        undefined: undefined,
        array: [1, 2, 3],
        object: { nested: "value" },
      };
      const result = removeObjectKeys(obj, ["string"]);
      expect(result.number).toBe(42);
      expect(result.boolean).toBe(true);
      expect(result.null).toBeNull();
      expect(result.undefined).toBeUndefined();
      expect(result.array).toEqual([1, 2, 3]);
      expect(result.object).toEqual({ nested: "value" });
    });

    it("should maintain references for non-removed nested objects", () => {
      const nested = { value: "test" };
      const obj = { keep: nested, remove: "this" };
      const result = removeObjectKeys(obj, ["remove"]);
      expect(result.keep).toBe(nested); // Same reference
    });
  });
});
