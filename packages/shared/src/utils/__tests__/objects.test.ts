import { describe, it, expect } from "vitest";
import { removeObjectKeys } from "../objects";

describe("objects.ts", () => {
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
      expect(result).not.toHaveProperty("b");
      expect(result).not.toHaveProperty("d");
    });

    it("should handle non-existent keys gracefully", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = removeObjectKeys(obj, ["d" as any, "e" as any]);

      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it("should preserve other properties", () => {
      const obj = {
        name: "John",
        age: 30,
        email: "john@example.com",
        password: "secret",
      };
      const result = removeObjectKeys(obj, ["password"]);

      expect(result).toEqual({
        name: "John",
        age: 30,
        email: "john@example.com",
      });
    });

    it("should handle empty keys array", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = removeObjectKeys(obj, []);

      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it("should handle empty object", () => {
      const obj = {};
      const result = removeObjectKeys(obj, ["a" as any]);

      expect(result).toEqual({});
    });

    it("should not mutate the original object", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = removeObjectKeys(obj, ["b"]);

      expect(obj).toEqual({ a: 1, b: 2, c: 3 });
      expect(result).toEqual({ a: 1, c: 3 });
      expect(result).not.toBe(obj);
    });

    it("should handle objects with different value types", () => {
      const obj = {
        string: "text",
        number: 42,
        boolean: true,
        null: null,
        undefined: undefined,
        array: [1, 2, 3],
        object: { nested: "value" },
      };
      const result = removeObjectKeys(obj, ["null", "undefined"]);

      expect(result).toEqual({
        string: "text",
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        object: { nested: "value" },
      });
    });

    it("should remove all keys when all are specified", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = removeObjectKeys(obj, ["a", "b", "c"]);

      expect(result).toEqual({});
    });

    it("should handle objects with nested structures", () => {
      const obj = {
        a: 1,
        b: { nested: { deep: "value" } },
        c: [1, 2, 3],
      };
      const result = removeObjectKeys(obj, ["b"]);

      expect(result).toEqual({
        a: 1,
        c: [1, 2, 3],
      });
    });

    it("should preserve type information", () => {
      interface TestType {
        a: number;
        b: string;
        c: boolean;
      }
      const obj: TestType = { a: 1, b: "text", c: true };
      const result = removeObjectKeys(obj, ["b"]);

      // TypeScript should infer correct type
      expect(result).toHaveProperty("a");
      expect(result).toHaveProperty("c");
      expect(result).not.toHaveProperty("b");
    });

    it("should handle duplicate keys in removal array", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = removeObjectKeys(obj, ["b", "b", "b"]);

      expect(result).toEqual({ a: 1, c: 3 });
    });

    it("should handle objects with symbol keys", () => {
      const symbolKey = Symbol("key");
      const obj = {
        a: 1,
        b: 2,
        [symbolKey]: "symbol-value",
      };
      const result = removeObjectKeys(obj, ["b"]);

      expect(result).toEqual({
        a: 1,
        [symbolKey]: "symbol-value",
      });
    });

    it("should handle objects with numeric keys", () => {
      const obj: any = {
        0: "zero",
        1: "one",
        2: "two",
      };
      const result = removeObjectKeys(obj, [1]);

      expect(result).toEqual({
        0: "zero",
        2: "two",
      });
    });

    it("should handle mix of existing and non-existing keys", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = removeObjectKeys(obj, ["b", "d" as any, "e" as any]);

      expect(result).toEqual({ a: 1, c: 3 });
    });

    it("should preserve readonly and optional properties behavior", () => {
      interface TestInterface {
        required: string;
        optional?: number;
        readonly readOnly: boolean;
      }

      const obj: TestInterface = {
        required: "value",
        optional: 42,
        readOnly: true,
      };

      const result = removeObjectKeys(obj, ["optional"]);

      expect(result).toEqual({
        required: "value",
        readOnly: true,
      });
    });
  });
});
