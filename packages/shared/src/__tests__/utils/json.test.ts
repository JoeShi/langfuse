import { describe, it, expect } from "vitest";
import {
  deepParseJson,
  deepParseJsonIterative,
  parseJsonPrioritised,
} from "../../../src/utils/json";

describe("json utils", () => {
  describe("deepParseJson", () => {
    it("should parse simple JSON strings", () => {
      const result = deepParseJson('{"key": "value"}');
      expect(result).toEqual({ key: "value" });
    });

    it("should recursively parse nested JSON strings", () => {
      const nested = '{"outer": "{\\"inner\\": \\"value\\"}"}';
      const result = deepParseJson(nested);
      expect(result).toEqual({ outer: { inner: "value" } });
    });

    it("should handle arrays", () => {
      const result = deepParseJson('["a", "b", "c"]');
      expect(result).toEqual(["a", "b", "c"]);
    });

    it("should parse nested JSON in arrays", () => {
      const nested = '["{\\"key\\": \\"value\\"}", "plain"]';
      const result = deepParseJson(nested);
      expect(result).toEqual([{ key: "value" }, "plain"]);
    });

    it("should preserve numbers that were strings", () => {
      const result = deepParseJson('"123"');
      expect(result).toBe("123");
    });

    it("should parse Python dict with single quotes", () => {
      const pythonDict = "{'key': 'value'}";
      const result = deepParseJson(pythonDict);
      expect(result).toEqual({ key: "value" });
    });

    it("should parse Python booleans", () => {
      const pythonDict = "{'flag': True, 'other': False}";
      const result = deepParseJson(pythonDict);
      expect(result).toEqual({ flag: true, other: false });
    });

    it("should parse Python None to null", () => {
      const pythonDict = "{'value': None}";
      const result = deepParseJson(pythonDict);
      expect(result).toEqual({ value: null });
    });

    it("should respect maxDepth option", () => {
      const nested = '{"l1": "{\\"l2\\": \\"{\\\\\\"l3\\\\\\": \\\\\\"value\\\\\\"}\\"}"}';
      const result = deepParseJson(nested, { maxDepth: 2 });
      // Should only parse up to depth 2
      expect(typeof result).toBe("object");
    });

    it("should skip parsing for large objects", () => {
      const largeObj = { data: "x".repeat(600000) };
      const result = deepParseJson(largeObj, { maxSize: 500000 });
      expect(result).toBe(largeObj);
    });

    it("should handle null and undefined", () => {
      expect(deepParseJson(null)).toBeNull();
      expect(deepParseJson(undefined)).toBeUndefined();
    });

    it("should handle primitives", () => {
      expect(deepParseJson(123)).toBe(123);
      expect(deepParseJson(true)).toBe(true);
      expect(deepParseJson("plain string")).toBe("plain string");
    });

    it("should filter out dangerous keys", () => {
      const dangerous = '{"__proto__": "evil", "constructor": "bad", "prototype": "harmful", "safe": "good"}';
      const result = deepParseJson(dangerous) as Record<string, unknown>;
      expect(result).toHaveProperty("safe");
      expect(result).not.toHaveProperty("__proto__");
      expect(result).not.toHaveProperty("constructor");
      expect(result).not.toHaveProperty("prototype");
    });

    it("should not parse invalid JSON", () => {
      const invalid = "this is not json";
      const result = deepParseJson(invalid);
      expect(result).toBe(invalid);
    });

    it("should handle Python list syntax", () => {
      const pythonList = "['a', 'b', 'c']";
      const result = deepParseJson(pythonList);
      expect(result).toEqual(["a", "b", "c"]);
    });

    it("should handle complex nested structures", () => {
      const complex = {
        level1: '{"level2": "{\\"level3\\": \\"value\\"}"}',
        array: ['{"key": "value"}', "plain"],
        number: 42,
      };
      const result = deepParseJson(complex);
      expect(result).toEqual({
        level1: { level2: { level3: "value" } },
        array: [{ key: "value" }, "plain"],
        number: 42,
      });
    });
  });

  describe("deepParseJsonIterative", () => {
    it("should parse simple JSON strings", () => {
      const result = deepParseJsonIterative('{"key": "value"}');
      expect(result).toEqual({ key: "value" });
    });

    it("should recursively parse nested JSON strings", () => {
      const nested = '{"outer": "{\\"inner\\": \\"value\\"}"}';
      const result = deepParseJsonIterative(nested);
      expect(result).toEqual({ outer: { inner: "value" } });
    });

    it("should handle arrays", () => {
      const result = deepParseJsonIterative('["a", "b", "c"]');
      expect(result).toEqual(["a", "b", "c"]);
    });

    it("should parse nested JSON in arrays", () => {
      const nested = '["{\\"key\\": \\"value\\"}", "plain"]';
      const result = deepParseJsonIterative(nested);
      expect(result).toEqual([{ key: "value" }, "plain"]);
    });

    it("should preserve numbers that were strings", () => {
      const result = deepParseJsonIterative('"123"');
      expect(result).toBe("123");
    });

    it("should respect maxDepth option", () => {
      const nested = '{"l1": "{\\"l2\\": \\"{\\\\\\"l3\\\\\\": \\\\\\"value\\\\\\"}\\"}"}';
      const result = deepParseJsonIterative(nested, { maxDepth: 2 });
      expect(typeof result).toBe("object");
    });

    it("should skip parsing for large objects", () => {
      const largeObj = { data: "x".repeat(600000) };
      const result = deepParseJsonIterative(largeObj, { maxSize: 500000 });
      expect(result).toBe(largeObj);
    });

    it("should handle null and undefined", () => {
      expect(deepParseJsonIterative(null)).toBeNull();
      expect(deepParseJsonIterative(undefined)).toBeUndefined();
    });

    it("should filter out dangerous keys", () => {
      const dangerous = '{"__proto__": "evil", "constructor": "bad", "prototype": "harmful", "safe": "good"}';
      const result = deepParseJsonIterative(dangerous) as Record<string, unknown>;
      expect(result).toHaveProperty("safe");
      expect(result).not.toHaveProperty("__proto__");
      expect(result).not.toHaveProperty("constructor");
      expect(result).not.toHaveProperty("prototype");
    });

    it("should produce same results as recursive version", () => {
      const testCases = [
        '{"key": "value"}',
        '{"outer": "{\\"inner\\": \\"value\\"}"}',
        '["a", "b", "c"]',
        "{'key': 'value'}",
        { nested: '{"deep": "value"}' },
      ];

      testCases.forEach((testCase) => {
        const recursive = deepParseJson(testCase);
        const iterative = deepParseJsonIterative(testCase);
        expect(iterative).toEqual(recursive);
      });
    });

    it("should handle empty objects and arrays", () => {
      expect(deepParseJsonIterative({})).toEqual({});
      expect(deepParseJsonIterative([])).toEqual([]);
    });

    it("should handle complex nested structures", () => {
      const complex = {
        level1: '{"level2": "{\\"level3\\": \\"value\\"}"}',
        array: ['{"key": "value"}', "plain"],
        number: 42,
      };
      const result = deepParseJsonIterative(complex);
      expect(result).toEqual({
        level1: { level2: { level3: "value" } },
        array: [{ key: "value" }, "plain"],
        number: 42,
      });
    });
  });

  describe("parseJsonPrioritised", () => {
    it("should parse valid JSON strings", () => {
      const result = parseJsonPrioritised('{"key": "value"}');
      expect(result).toEqual({ key: "value" });
    });

    it("should handle large numbers safely", () => {
      const largeNumber = "9007199254740992"; // Beyond Number.MAX_SAFE_INTEGER
      const result = parseJsonPrioritised(largeNumber);
      expect(typeof result).toBe("string");
    });

    it("should convert safe numbers to Number", () => {
      const result = parseJsonPrioritised("42");
      expect(result).toBe(42);
      expect(typeof result).toBe("number");
    });

    it("should handle decimal numbers", () => {
      const result = parseJsonPrioritised("3.14159");
      expect(result).toBe(3.14159);
    });

    it("should return original string for invalid JSON", () => {
      const invalid = "not json";
      const result = parseJsonPrioritised(invalid);
      expect(result).toBe(invalid);
    });

    it("should handle arrays", () => {
      const result = parseJsonPrioritised('[1, 2, 3]');
      expect(result).toEqual([1, 2, 3]);
    });

    it("should handle nested objects", () => {
      const result = parseJsonPrioritised('{"outer": {"inner": "value"}}');
      expect(result).toEqual({ outer: { inner: "value" } });
    });

    it("should handle empty string", () => {
      const result = parseJsonPrioritised("");
      expect(result).toBe("");
    });

    it("should handle boolean values", () => {
      expect(parseJsonPrioritised("true")).toBe(true);
      expect(parseJsonPrioritised("false")).toBe(false);
    });

    it("should handle null", () => {
      const result = parseJsonPrioritised("null");
      expect(result).toBeNull();
    });
  });
});
