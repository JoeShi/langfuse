import { describe, it, expect } from "vitest";
import { removeObjectKeys } from "../../../src/utils/objects";

describe("objects utils", () => {
  describe("removeObjectKeys", () => {
    it("should remove specified keys from object", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = removeObjectKeys(obj, ["b"]);
      expect(result).toEqual({ a: 1, c: 3 });
      expect(result).not.toHaveProperty("b");
    });

    it("should remove multiple keys", () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = removeObjectKeys(obj, ["b", "d"]);
      expect(result).toEqual({ a: 1, c: 3 });
    });

    it("should not modify original object", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = removeObjectKeys(obj, ["b"]);
      expect(obj).toEqual({ a: 1, b: 2, c: 3 });
      expect(result).not.toBe(obj);
    });

    it("should handle empty keys array", () => {
      const obj = { a: 1, b: 2 };
      const result = removeObjectKeys(obj, []);
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it("should handle non-existent keys", () => {
      const obj = { a: 1, b: 2 };
      const result = removeObjectKeys(obj, ["c" as any]);
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it("should handle objects with different value types", () => {
      const obj = {
        str: "string",
        num: 123,
        bool: true,
        arr: [1, 2, 3],
        obj: { nested: "value" },
      };
      const result = removeObjectKeys(obj, ["num", "arr"]);
      expect(result).toEqual({
        str: "string",
        bool: true,
        obj: { nested: "value" },
      });
    });

    it("should preserve undefined and null values", () => {
      const obj = { a: undefined, b: null, c: 0, d: "" };
      const result = removeObjectKeys(obj, ["d"]);
      expect(result).toEqual({ a: undefined, b: null, c: 0 });
    });

    it("should handle nested objects", () => {
      const obj = {
        outer: { inner: "value" },
        toRemove: "data",
      };
      const result = removeObjectKeys(obj, ["toRemove"]);
      expect(result).toEqual({ outer: { inner: "value" } });
    });

    it("should preserve object prototype", () => {
      const obj = { a: 1, b: 2 };
      const result = removeObjectKeys(obj, ["b"]);
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    });

    it("should work with all keys removed", () => {
      const obj = { a: 1, b: 2 };
      const result = removeObjectKeys(obj, ["a", "b"]);
      expect(result).toEqual({});
      expect(Object.keys(result)).toHaveLength(0);
    });
  });
});
