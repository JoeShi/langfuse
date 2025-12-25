import { describe, it, expect } from "vitest";
import { removeObjectKeys } from "../objects";

describe("objects utilities", () => {
  describe("removeObjectKeys", () => {
    it("should remove single key from object", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = removeObjectKeys(obj, ["b"]);
      expect(result).toEqual({ a: 1, c: 3 });
      expect(result).not.toHaveProperty("b");
    });

    it("should remove multiple keys from object", () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = removeObjectKeys(obj, ["b", "d"]);
      expect(result).toEqual({ a: 1, c: 3 });
    });

    it("should return object with all keys if empty array provided", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = removeObjectKeys(obj, []);
      expect(result).toEqual(obj);
    });

    it("should not mutate original object", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const original = { ...obj };
      removeObjectKeys(obj, ["b"]);
      expect(obj).toEqual(original);
    });

    it("should handle objects with string values", () => {
      const obj = { name: "John", age: "30", city: "NYC" };
      const result = removeObjectKeys(obj, ["age"]);
      expect(result).toEqual({ name: "John", city: "NYC" });
    });

    it("should handle objects with mixed types", () => {
      const obj = {
        str: "text",
        num: 42,
        bool: true,
        arr: [1, 2, 3],
        obj: { nested: true },
      };
      const result = removeObjectKeys(obj, ["num", "arr"]);
      expect(result).toEqual({
        str: "text",
        bool: true,
        obj: { nested: true },
      });
    });

    it("should handle removing non-existent keys gracefully", () => {
      const obj = { a: 1, b: 2 };
      const result = removeObjectKeys(obj, ["c" as any]);
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it("should handle empty object", () => {
      const obj = {};
      const result = removeObjectKeys(obj, []);
      expect(result).toEqual({});
    });

    it("should preserve undefined and null values", () => {
      const obj = { a: 1, b: undefined, c: null, d: 2 };
      const result = removeObjectKeys(obj, ["a"]);
      expect(result).toEqual({ b: undefined, c: null, d: 2 });
    });
  });
});
