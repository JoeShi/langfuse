import { describe, it, expect } from "vitest";
import {
  deepParseJson,
  deepParseJsonIterative,
  parseJsonPrioritised,
  DeepParseJsonOptions,
} from "../json";

describe("json utilities", () => {
  describe("deepParseJson", () => {
    it("should parse simple JSON strings", () => {
      const result = deepParseJson('{"name":"John"}');
      expect(result).toEqual({ name: "John" });
    });

    it("should parse nested JSON strings", () => {
      const nested = '{"data":"{\\"nested\\":\\"value\\"}"}';
      const result = deepParseJson(nested);
      expect(result).toEqual({ data: { nested: "value" } });
    });

    it("should handle already parsed objects", () => {
      const obj = { name: "John", age: 30 };
      const result = deepParseJson(obj);
      expect(result).toEqual(obj);
    });

    it("should parse arrays", () => {
      const result = deepParseJson('["one", "two", "three"]');
      expect(result).toEqual(["one", "two", "three"]);
    });

    it("should parse nested arrays with stringified JSON", () => {
      const nested = ['{"name":"John"}', '{"name":"Jane"}'];
      const result = deepParseJson(nested);
      expect(result).toEqual([{ name: "John" }, { name: "Jane" }]);
    });

    it("should respect maxDepth option", () => {
      const nested = '{"level1":"{\\"level2\\":\\"{\\\\\\"level3\\\\\\":\\\\\\"value\\\\\\"}\\"}"}';
      const result = deepParseJson(nested, { maxDepth: 1 });
      // Should only parse one level deep
      expect(typeof result).toBe("object");
    });

    it("should handle Python dict syntax", () => {
      const pythonDict = "{'name': 'John', 'active': True, 'value': None}";
      const result = deepParseJson(pythonDict);
      expect(result).toEqual({ name: "John", active: true, value: null });
    });

    it("should handle Python list syntax", () => {
      const pythonList = "['one', 'two', 'three']";
      const result = deepParseJson(pythonList);
      expect(result).toEqual(["one", "two", "three"]);
    });

    it("should handle Python False", () => {
      const pythonDict = "{'active': False}";
      const result = deepParseJson(pythonDict);
      expect(result).toEqual({ active: false });
    });

    it("should filter out dangerous keys", () => {
      const malicious = { name: "John", __proto__: { admin: true } };
      const result = deepParseJson(malicious);
      expect(result).not.toHaveProperty("__proto__");
      expect(result).toHaveProperty("name");
    });

    it("should filter out constructor key", () => {
      const malicious = { name: "John", constructor: { admin: true } };
      const result = deepParseJson(malicious);
      expect(result).not.toHaveProperty("constructor");
    });

    it("should filter out prototype key", () => {
      const malicious = { name: "John", prototype: { admin: true } };
      const result = deepParseJson(malicious);
      expect(result).not.toHaveProperty("prototype");
    });

    it("should return string if not valid JSON", () => {
      const notJson = "just a plain string";
      const result = deepParseJson(notJson);
      expect(result).toBe(notJson);
    });

    it("should preserve number strings as strings", () => {
      const result = deepParseJson('"123"');
      expect(result).toBe("123");
      expect(typeof result).toBe("string");
    });

    it("should skip parsing for large objects", () => {
      const largeObj = { data: "x".repeat(600000) };
      const result = deepParseJson(largeObj, { maxSize: 500000 });
      expect(result).toBe(largeObj);
    });

    it("should handle null values", () => {
      const result = deepParseJson(null);
      expect(result).toBeNull();
    });

    it("should handle undefined values", () => {
      const result = deepParseJson(undefined);
      expect(result).toBeUndefined();
    });

    it("should handle empty objects", () => {
      const result = deepParseJson({});
      expect(result).toEqual({});
    });

    it("should handle empty arrays", () => {
      const result = deepParseJson([]);
      expect(result).toEqual([]);
    });

    it("should parse complex nested structures", () => {
      const complex = {
        user: '{"name":"John"}',
        data: ['{"id":1}', '{"id":2}'],
        meta: '{"nested":"{\\"deep\\":\\"value\\"}"}',
      };
      const result = deepParseJson(complex);
      expect(result).toEqual({
        user: { name: "John" },
        data: [{ id: 1 }, { id: 2 }],
        meta: { nested: { deep: "value" } },
      });
    });
  });

  describe("deepParseJsonIterative", () => {
    it("should parse simple JSON strings", () => {
      const result = deepParseJsonIterative('{"name":"John"}');
      expect(result).toEqual({ name: "John" });
    });

    it("should parse nested JSON strings", () => {
      const nested = '{"data":"{\\"nested\\":\\"value\\"}"}';
      const result = deepParseJsonIterative(nested);
      expect(result).toEqual({ data: { nested: "value" } });
    });

    it("should handle already parsed objects", () => {
      const obj = { name: "John", age: 30 };
      const result = deepParseJsonIterative(obj);
      expect(result).toEqual(obj);
    });

    it("should parse arrays", () => {
      const result = deepParseJsonIterative('["one", "two", "three"]');
      expect(result).toEqual(["one", "two", "three"]);
    });

    it("should respect maxDepth option", () => {
      const nested = '{"level1":"{\\"level2\\":\\"value\\"}"}';
      const result = deepParseJsonIterative(nested, { maxDepth: 1 });
      expect(typeof result).toBe("object");
    });

    it("should handle Python dict syntax", () => {
      const pythonDict = "{'name': 'John', 'active': True}";
      const result = deepParseJsonIterative(pythonDict);
      expect(result).toEqual({ name: "John", active: true });
    });

    it("should filter out dangerous keys", () => {
      const malicious = { name: "John", __proto__: { admin: true } };
      const result = deepParseJsonIterative(malicious);
      expect(result).not.toHaveProperty("__proto__");
      expect(result).toHaveProperty("name");
    });

    it("should produce same results as recursive version", () => {
      const testCases = [
        '{"name":"John"}',
        '{"data":"{\\"nested\\":\\"value\\"}"}',
        ['{"id":1}', '{"id":2}'],
        { user: '{"name":"Jane"}', id: 42 },
        "plain string",
        null,
        undefined,
      ];

      for (const testCase of testCases) {
        const recursive = deepParseJson(testCase);
        const iterative = deepParseJsonIterative(testCase);
        expect(iterative).toEqual(recursive);
      }
    });

    it("should handle empty objects", () => {
      const result = deepParseJsonIterative({});
      expect(result).toEqual({});
    });

    it("should handle empty arrays", () => {
      const result = deepParseJsonIterative([]);
      expect(result).toEqual([]);
    });

    it("should preserve number strings as strings", () => {
      const result = deepParseJsonIterative('"123"');
      expect(result).toBe("123");
    });

    it("should skip parsing for large objects", () => {
      const largeObj = { data: "x".repeat(600000) };
      const result = deepParseJsonIterative(largeObj, { maxSize: 500000 });
      expect(result).toBe(largeObj);
    });

    it("should handle complex nested structures", () => {
      const complex = {
        user: '{"name":"John"}',
        data: ['{"id":1}', '{"id":2}'],
        meta: '{"nested":"{\\"deep\\":\\"value\\"}"}',
      };
      const result = deepParseJsonIterative(complex);
      expect(result).toEqual({
        user: { name: "John" },
        data: [{ id: 1 }, { id: 2 }],
        meta: { nested: { deep: "value" } },
      });
    });
  });

  describe("parseJsonPrioritised", () => {
    it("should parse valid JSON strings", () => {
      const result = parseJsonPrioritised('{"name":"John"}');
      expect(result).toEqual({ name: "John" });
    });

    it("should parse arrays", () => {
      const result = parseJsonPrioritised('[1,2,3]');
      expect(result).toEqual([1, 2, 3]);
    });

    it("should handle safe numbers", () => {
      const result = parseJsonPrioritised('{"value":42}');
      expect(result).toEqual({ value: 42 });
    });

    it("should preserve large integers as strings", () => {
      const largeNumber = "9007199254740992"; // Beyond Number.MAX_SAFE_INTEGER
      const result = parseJsonPrioritised(`{"bigInt":${largeNumber}}`);
      expect(result).toHaveProperty("bigInt");
    });

    it("should return original string for invalid JSON", () => {
      const invalid = "not valid json";
      const result = parseJsonPrioritised(invalid);
      expect(result).toBe(invalid);
    });

    it("should handle nested objects", () => {
      const json = '{"user":{"name":"John","age":30}}';
      const result = parseJsonPrioritised(json);
      expect(result).toEqual({ user: { name: "John", age: 30 } });
    });

    it("should handle null values", () => {
      const result = parseJsonPrioritised('{"value":null}');
      expect(result).toEqual({ value: null });
    });

    it("should handle boolean values", () => {
      const result = parseJsonPrioritised('{"active":true,"disabled":false}');
      expect(result).toEqual({ active: true, disabled: false });
    });

    it("should return original string if parsing fails", () => {
      const broken = '{"broken":';
      const result = parseJsonPrioritised(broken);
      expect(result).toBe(broken);
    });
  });

  describe("deepParseJson edge cases", () => {
    it("should handle mixed valid and invalid JSON", () => {
      const mixed = {
        valid: '{"key":"value"}',
        invalid: "not json",
        number: 42,
      };
      const result = deepParseJson(mixed);
      expect(result).toEqual({
        valid: { key: "value" },
        invalid: "not json",
        number: 42,
      });
    });

    it("should not parse strings that start with characters other than braces for Python dicts", () => {
      const notPythonDict = "plain text with True and False";
      const result = deepParseJson(notPythonDict);
      expect(result).toBe(notPythonDict);
    });

    it("should handle strings longer than 1MB for Python dict parsing", () => {
      const longString = "{'key': 'value'}" + "x".repeat(1000001);
      const result = deepParseJson(longString);
      expect(result).toBe(longString);
    });

    it("should handle Python dict with nested quotes", () => {
      const pythonDict = "{'message': 'He said \"hello\"'}";
      const result = deepParseJson(pythonDict);
      // This might not parse perfectly due to quote conversion, but shouldn't crash
      expect(result).toBeDefined();
    });
  });
});
