import { describe, it, expect } from "vitest";
import {
  deepParseJson,
  deepParseJsonIterative,
  parseJsonPrioritised,
  DeepParseJsonOptions,
} from "../json";

describe("json.ts", () => {
  describe("deepParseJson", () => {
    it("should parse valid JSON strings", () => {
      const input = '{"key": "value"}';
      const result = deepParseJson(input);

      expect(result).toEqual({ key: "value" });
    });

    it("should parse nested stringified JSON", () => {
      const input = '{"outer": "{\\"inner\\": \\"value\\"}"}';
      const result = deepParseJson(input);

      expect(result).toEqual({
        outer: { inner: "value" },
      });
    });

    it("should parse deeply nested stringified JSON", () => {
      const level3 = JSON.stringify({ level: 3 });
      const level2 = JSON.stringify({ level: 2, data: level3 });
      const level1 = JSON.stringify({ level: 1, data: level2 });
      const result = deepParseJson(level1);

      expect(result).toEqual({
        level: 1,
        data: {
          level: 2,
          data: { level: 3 },
        },
      });
    });

    it("should handle Python dict syntax with True/False/None", () => {
      const pythonDict = "{'key': True, 'value': False, 'empty': None}";
      const result = deepParseJson(pythonDict);

      expect(result).toEqual({
        key: true,
        value: false,
        empty: null,
      });
    });

    it("should handle Python list syntax", () => {
      const pythonList = "['item1', 'item2', 'item3']";
      const result = deepParseJson(pythonList);

      expect(result).toEqual(["item1", "item2", "item3"]);
    });

    it("should handle Python dict with single quotes", () => {
      const pythonDict = "{'name': 'John', 'age': 30}";
      const result = deepParseJson(pythonDict);

      expect(result).toEqual({
        name: "John",
        age: 30,
      });
    });

    it("should handle invalid JSON gracefully", () => {
      const input = "this is not JSON";
      const result = deepParseJson(input);

      expect(result).toBe(input);
    });

    it("should handle partial JSON gracefully", () => {
      const input = '{"incomplete": ';
      const result = deepParseJson(input);

      expect(result).toBe(input);
    });

    it("should skip parsing for large objects (>500KB by default)", () => {
      // Create a large object
      const largeArray = new Array(100000).fill("x");
      const largeObject = { data: largeArray };

      // This should be skipped and returned as-is
      const result = deepParseJson(largeObject);

      expect(result).toBe(largeObject);
    });

    it("should respect custom maxSize option", () => {
      const smallObject = { key: "value" };
      const options: DeepParseJsonOptions = { maxSize: 10 }; // Very small size

      const result = deepParseJson(smallObject, options);

      // Should be skipped due to small maxSize
      expect(result).toBe(smallObject);
    });

    it("should respect maxDepth option", () => {
      const level3 = JSON.stringify({ level: 3 });
      const level2 = JSON.stringify({ level: 2, data: level3 });
      const level1 = JSON.stringify({ level: 1, data: level2 });

      const options: DeepParseJsonOptions = { maxDepth: 2 };
      const result = deepParseJson(level1, options);

      // Should only parse to depth 2
      expect(result).toEqual({
        level: 1,
        data: {
          level: 2,
          data: '{"level":3}',
        },
      });
    });

    it("should handle arrays with stringified JSON", () => {
      const input = ['{"key": "value1"}', '{"key": "value2"}'];
      const result = deepParseJson(input);

      expect(result).toEqual([{ key: "value1" }, { key: "value2" }]);
    });

    it("should preserve numeric strings as strings", () => {
      const input = '"123"';
      const result = deepParseJson(input);

      // Numbers that were strings should remain as strings
      expect(result).toBe("123");
    });

    it("should handle objects with null values", () => {
      const input = { key: null, nested: '{"inner": null}' };
      const result = deepParseJson(input);

      expect(result).toEqual({
        key: null,
        nested: { inner: null },
      });
    });

    it("should handle boolean values", () => {
      const input = { bool: true, nested: '{"inner": false}' };
      const result = deepParseJson(input);

      expect(result).toEqual({
        bool: true,
        nested: { inner: false },
      });
    });

    it("should filter out dangerous keys (__proto__, constructor, prototype)", () => {
      const input = {
        safe: "value",
        __proto__: "dangerous",
        constructor: "dangerous",
        prototype: "dangerous",
      };
      const result = deepParseJson(input) as any;

      expect(result).toHaveProperty("safe");
      expect(result).not.toHaveProperty("__proto__");
      expect(result).not.toHaveProperty("constructor");
      expect(result).not.toHaveProperty("prototype");
    });

    it("should handle empty strings", () => {
      const input = "";
      const result = deepParseJson(input);

      expect(result).toBe("");
    });

    it("should handle empty objects", () => {
      const input = {};
      const result = deepParseJson(input);

      expect(result).toEqual({});
    });

    it("should handle empty arrays", () => {
      const input: unknown[] = [];
      const result = deepParseJson(input);

      expect(result).toEqual([]);
    });

    it("should not parse strings that don't start with { or [", () => {
      const input = "'not a dict'";
      const result = deepParseJson(input);

      expect(result).toBe(input);
    });

    it("should handle Python dict strings larger than 1MB", () => {
      // Create a large string (>1MB)
      const largeString = "'" + "x".repeat(1_100_000) + "'";
      const result = deepParseJson(largeString);

      // Should not try to parse, return as-is
      expect(result).toBe(largeString);
    });

    it("should handle mixed Python and JSON syntax gracefully", () => {
      const input = "{'key': True, 'nested': '{\"json\": true}'}";
      const result = deepParseJson(input);

      expect(result).toEqual({
        key: true,
        nested: { json: true },
      });
    });
  });

  describe("deepParseJsonIterative", () => {
    it("should parse valid JSON strings", () => {
      const input = '{"key": "value"}';
      const result = deepParseJsonIterative(input);

      expect(result).toEqual({ key: "value" });
    });

    it("should parse nested stringified JSON", () => {
      const input = '{"outer": "{\\"inner\\": \\"value\\"}"}';
      const result = deepParseJsonIterative(input);

      expect(result).toEqual({
        outer: { inner: "value" },
      });
    });

    it("should handle Python dict syntax", () => {
      const pythonDict = "{'key': True, 'value': False, 'empty': None}";
      const result = deepParseJsonIterative(pythonDict);

      expect(result).toEqual({
        key: true,
        value: false,
        empty: null,
      });
    });

    it("should respect maxDepth option", () => {
      const level3 = JSON.stringify({ level: 3 });
      const level2 = JSON.stringify({ level: 2, data: level3 });
      const level1 = JSON.stringify({ level: 1, data: level2 });

      const options: DeepParseJsonOptions = { maxDepth: 2 };
      const result = deepParseJsonIterative(level1, options);

      expect(result).toEqual({
        level: 1,
        data: {
          level: 2,
          data: '{"level":3}',
        },
      });
    });

    it("should filter out dangerous keys", () => {
      const input = {
        safe: "value",
        __proto__: "dangerous",
        constructor: "dangerous",
        prototype: "dangerous",
      };
      const result = deepParseJsonIterative(input) as any;

      expect(result).toHaveProperty("safe");
      expect(result).not.toHaveProperty("__proto__");
      expect(result).not.toHaveProperty("constructor");
      expect(result).not.toHaveProperty("prototype");
    });

    it("should handle large objects by skipping parsing", () => {
      const largeArray = new Array(100000).fill("x");
      const largeObject = { data: largeArray };

      const result = deepParseJsonIterative(largeObject);
      expect(result).toBe(largeObject);
    });

    it("should produce same results as deepParseJson", () => {
      const testCases = [
        '{"key": "value"}',
        '{"outer": "{\\"inner\\": \\"value\\"}"}',
        "{'key': True, 'value': False}",
        ["item1", '{"nested": "value"}'],
        { key: "value", nested: '{"inner": "value"}' },
      ];

      for (const testCase of testCases) {
        const recursiveResult = deepParseJson(testCase);
        const iterativeResult = deepParseJsonIterative(testCase);
        expect(iterativeResult).toEqual(recursiveResult);
      }
    });
  });

  describe("parseJsonPrioritised", () => {
    it("should parse valid JSON strings", () => {
      const input = '{"key": "value"}';
      const result = parseJsonPrioritised(input);

      expect(result).toEqual({ key: "value" });
    });

    it("should handle safe numbers correctly", () => {
      const input = '{"small": 123, "decimal": 45.67}';
      const result = parseJsonPrioritised(input);

      expect(result).toEqual({ small: 123, decimal: 45.67 });
    });

    it("should preserve large integers as strings", () => {
      // Number larger than Number.MAX_SAFE_INTEGER
      const largeInt = "9007199254740992"; // MAX_SAFE_INTEGER + 1
      const input = `{"large": ${largeInt}}`;
      const result = parseJsonPrioritised(input) as any;

      expect(typeof result.large).toBe("string");
      expect(result.large).toBe(largeInt);
    });

    it("should handle arrays with numbers", () => {
      const input = "[1, 2, 3, 4, 5]";
      const result = parseJsonPrioritised(input);

      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it("should handle nested objects", () => {
      const input = '{"outer": {"inner": {"deep": 123}}}';
      const result = parseJsonPrioritised(input);

      expect(result).toEqual({
        outer: {
          inner: {
            deep: 123,
          },
        },
      });
    });

    it("should handle invalid JSON gracefully", () => {
      const input = "this is not JSON";
      const result = parseJsonPrioritised(input);

      expect(result).toBe(input);
    });

    it("should handle empty string", () => {
      const input = "";
      const result = parseJsonPrioritised(input);

      expect(result).toBe(input);
    });

    it("should handle JSON with null values", () => {
      const input = '{"key": null}';
      const result = parseJsonPrioritised(input);

      expect(result).toEqual({ key: null });
    });

    it("should handle JSON with boolean values", () => {
      const input = '{"true": true, "false": false}';
      const result = parseJsonPrioritised(input);

      expect(result).toEqual({ true: true, false: false });
    });

    it("should handle JSON arrays", () => {
      const input = '["a", "b", "c"]';
      const result = parseJsonPrioritised(input);

      expect(result).toEqual(["a", "b", "c"]);
    });

    it("should handle mixed types in arrays", () => {
      const input = '[1, "string", true, null, {"key": "value"}]';
      const result = parseJsonPrioritised(input);

      expect(result).toEqual([1, "string", true, null, { key: "value" }]);
    });

    it("should handle zero", () => {
      const input = '{"zero": 0}';
      const result = parseJsonPrioritised(input);

      expect(result).toEqual({ zero: 0 });
    });

    it("should handle negative numbers", () => {
      const input = '{"negative": -123}';
      const result = parseJsonPrioritised(input);

      expect(result).toEqual({ negative: -123 });
    });

    it("should handle very large negative numbers as strings", () => {
      const largeNegative = "-9007199254740992";
      const input = `{"large": ${largeNegative}}`;
      const result = parseJsonPrioritised(input) as any;

      expect(typeof result.large).toBe("string");
      expect(result.large).toBe(largeNegative);
    });
  });
});
