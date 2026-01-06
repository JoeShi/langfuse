import { describe, it, expect } from "vitest";
import { removeObjectKeys } from "../objects";

describe("removeObjectKeys", () => {
  describe("single key removal", () => {
    it("should remove a single key from object", () => {
      // Arrange
      const obj = { a: 1, b: 2, c: 3 };

      // Act
      const result = removeObjectKeys(obj, ["b"]);

      // Assert
      expect(result).toEqual({ a: 1, c: 3 });
      expect(result).not.toHaveProperty("b");
    });

    it("should remove string property", () => {
      // Arrange
      const obj = { name: "John", age: 30, city: "NYC" };

      // Act
      const result = removeObjectKeys(obj, ["city"]);

      // Assert
      expect(result).toEqual({ name: "John", age: 30 });
    });

    it("should remove number property", () => {
      // Arrange
      const obj = { count: 10, total: 100, sum: 50 };

      // Act
      const result = removeObjectKeys(obj, ["sum"]);

      // Assert
      expect(result).toEqual({ count: 10, total: 100 });
    });

    it("should remove boolean property", () => {
      // Arrange
      const obj = { enabled: true, active: false, visible: true };

      // Act
      const result = removeObjectKeys(obj, ["active"]);

      // Assert
      expect(result).toEqual({ enabled: true, visible: true });
    });
  });

  describe("multiple key removal", () => {
    it("should remove multiple keys from object", () => {
      // Arrange
      const obj = { a: 1, b: 2, c: 3, d: 4 };

      // Act
      const result = removeObjectKeys(obj, ["b", "d"]);

      // Assert
      expect(result).toEqual({ a: 1, c: 3 });
      expect(result).not.toHaveProperty("b");
      expect(result).not.toHaveProperty("d");
    });

    it("should remove all keys when specified", () => {
      // Arrange
      const obj = { a: 1, b: 2, c: 3 };

      // Act
      const result = removeObjectKeys(obj, ["a", "b", "c"]);

      // Assert
      expect(result).toEqual({});
      expect(Object.keys(result).length).toBe(0);
    });

    it("should handle removing adjacent keys", () => {
      // Arrange
      const obj = { first: 1, second: 2, third: 3, fourth: 4 };

      // Act
      const result = removeObjectKeys(obj, ["second", "third"]);

      // Assert
      expect(result).toEqual({ first: 1, fourth: 4 });
    });

    it("should handle removing non-adjacent keys", () => {
      // Arrange
      const obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };

      // Act
      const result = removeObjectKeys(obj, ["a", "c", "e"]);

      // Assert
      expect(result).toEqual({ b: 2, d: 4 });
    });
  });

  describe("non-existent keys", () => {
    it("should handle non-existent key gracefully", () => {
      // Arrange
      const obj = { a: 1, b: 2 };

      // Act
      const result = removeObjectKeys(obj, ["nonexistent"]);

      // Assert
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it("should handle mix of existent and non-existent keys", () => {
      // Arrange
      const obj = { a: 1, b: 2, c: 3 };

      // Act
      const result = removeObjectKeys(obj, ["b", "nonexistent", "d"]);

      // Assert
      expect(result).toEqual({ a: 1, c: 3 });
    });

    it("should handle all non-existent keys", () => {
      // Arrange
      const obj = { a: 1, b: 2 };

      // Act
      const result = removeObjectKeys(obj, ["x", "y", "z"]);

      // Assert
      expect(result).toEqual({ a: 1, b: 2 });
    });
  });

  describe("type safety and immutability", () => {
    it("should return a new object (shallow copy)", () => {
      // Arrange
      const obj = { a: 1, b: 2, c: 3 };

      // Act
      const result = removeObjectKeys(obj, ["b"]);

      // Assert
      expect(result).not.toBe(obj); // Different reference
      expect(obj).toEqual({ a: 1, b: 2, c: 3 }); // Original unchanged
    });

    it("should not mutate the original object", () => {
      // Arrange
      const obj = { name: "John", age: 30, city: "NYC" };
      const original = { ...obj };

      // Act
      removeObjectKeys(obj, ["age"]);

      // Assert
      expect(obj).toEqual(original);
    });

    it("should preserve type information for remaining keys", () => {
      // Arrange
      interface Person {
        name: string;
        age: number;
        email: string;
      }
      const person: Person = {
        name: "John",
        age: 30,
        email: "john@example.com",
      };

      // Act
      const result = removeObjectKeys(person, ["email"]);

      // Assert
      expect(result.name).toBe("John");
      expect(result.age).toBe(30);
    });

    it("should work with typed objects", () => {
      // Arrange
      type Data = {
        id: number;
        name: string;
        temp?: string;
      };
      const data: Data = { id: 1, name: "test", temp: "remove" };

      // Act
      const result = removeObjectKeys(data, ["temp"]);

      // Assert
      expect(result).toEqual({ id: 1, name: "test" });
    });
  });

  describe("edge cases", () => {
    it("should handle empty object", () => {
      // Arrange
      const obj = {};

      // Act
      const result = removeObjectKeys(obj, ["any"]);

      // Assert
      expect(result).toEqual({});
    });

    it("should handle empty keys array", () => {
      // Arrange
      const obj = { a: 1, b: 2, c: 3 };

      // Act
      const result = removeObjectKeys(obj, []);

      // Assert
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it("should handle object with null values", () => {
      // Arrange
      const obj = { a: null, b: 2, c: null };

      // Act
      const result = removeObjectKeys(obj, ["a", "c"]);

      // Assert
      expect(result).toEqual({ b: 2 });
    });

    it("should handle object with undefined values", () => {
      // Arrange
      const obj = { a: undefined, b: 2, c: undefined };

      // Act
      const result = removeObjectKeys(obj, ["a"]);

      // Assert
      expect(result).toEqual({ b: 2, c: undefined });
    });

    it("should handle object with nested objects", () => {
      // Arrange
      const obj = {
        simple: "value",
        nested: { inner: "data" },
        toRemove: { other: "stuff" },
      };

      // Act
      const result = removeObjectKeys(obj, ["toRemove"]);

      // Assert
      expect(result).toEqual({
        simple: "value",
        nested: { inner: "data" },
      });
    });

    it("should handle object with array values", () => {
      // Arrange
      const obj = {
        items: [1, 2, 3],
        tags: ["a", "b"],
        remove: ["x", "y"],
      };

      // Act
      const result = removeObjectKeys(obj, ["remove"]);

      // Assert
      expect(result).toEqual({
        items: [1, 2, 3],
        tags: ["a", "b"],
      });
    });

    it("should handle object with function values", () => {
      // Arrange
      const fn1 = () => "test1";
      const fn2 = () => "test2";
      const obj = {
        method1: fn1,
        method2: fn2,
      };

      // Act
      const result = removeObjectKeys(obj, ["method2"]);

      // Assert
      expect(result).toEqual({ method1: fn1 });
      expect(result.method1()).toBe("test1");
    });

    it("should handle object with symbol keys (only string keys in type)", () => {
      // Arrange
      const obj = {
        normalKey: "value",
        anotherKey: "data",
      };

      // Act
      const result = removeObjectKeys(obj, ["anotherKey"]);

      // Assert
      expect(result).toEqual({ normalKey: "value" });
    });

    it("should handle large objects", () => {
      // Arrange
      const obj: Record<string, number> = {};
      for (let i = 0; i < 1000; i++) {
        obj[`key${i}`] = i;
      }

      // Act
      const result = removeObjectKeys(obj, ["key500", "key999"]);

      // Assert
      expect(result).not.toHaveProperty("key500");
      expect(result).not.toHaveProperty("key999");
      expect(Object.keys(result).length).toBe(998);
    });

    it("should preserve key order (insertion order)", () => {
      // Arrange
      const obj = { z: 3, a: 1, m: 2 };

      // Act
      const result = removeObjectKeys(obj, ["m"]);

      // Assert
      expect(Object.keys(result)).toEqual(["z", "a"]);
    });

    it("should handle numeric-like string keys", () => {
      // Arrange
      const obj = { "0": "zero", "1": "one", "2": "two" };

      // Act
      const result = removeObjectKeys(obj, ["1"]);

      // Assert
      expect(result).toEqual({ "0": "zero", "2": "two" });
    });

    it("should handle keys with special characters", () => {
      // Arrange
      const obj = {
        "normal-key": 1,
        "key.with.dots": 2,
        "key with spaces": 3,
      };

      // Act
      const result = removeObjectKeys(obj, ["key.with.dots"]);

      // Assert
      expect(result).toEqual({
        "normal-key": 1,
        "key with spaces": 3,
      });
    });

    it("should handle duplicate keys in removal array", () => {
      // Arrange
      const obj = { a: 1, b: 2, c: 3 };

      // Act
      const result = removeObjectKeys(obj, ["b", "b", "b"]);

      // Assert
      expect(result).toEqual({ a: 1, c: 3 });
    });
  });

  describe("complex type scenarios", () => {
    it("should work with union types", () => {
      // Arrange
      type Config = {
        name: string;
        value: string | number;
        optional?: boolean;
      };
      const config: Config = { name: "test", value: 42, optional: true };

      // Act
      const result = removeObjectKeys(config, ["optional"]);

      // Assert
      expect(result).toEqual({ name: "test", value: 42 });
    });

    it("should work with intersection types", () => {
      // Arrange
      type Base = { id: number };
      type Extended = { name: string };
      type Combined = Base & Extended & { temp: string };
      const obj: Combined = { id: 1, name: "test", temp: "remove" };

      // Act
      const result = removeObjectKeys(obj, ["temp"]);

      // Assert
      expect(result).toEqual({ id: 1, name: "test" });
    });
  });
});
