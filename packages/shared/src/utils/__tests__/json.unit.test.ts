import { expect, describe, it } from "vitest";
import { deepParseJson, parseJsonPrioritised } from "../json";

describe("deepParseJson", () => {
  describe("basic parsing", () => {
    it("should parse single-level JSON strings", () => {
      const input = '{"key": "value"}';
      const result = deepParseJson(input);
      expect(result).toEqual({ key: "value" });
    });

    it("should parse nested JSON strings", () => {
      const input = '{"outer": "{\\"inner\\": \\"value\\"}"}';
      const result = deepParseJson(input);
      expect(result).toEqual({ outer: { inner: "value" } });
    });

    it("should parse deeply nested JSON strings", () => {
      const input = '{"level1": "{\\"level2\\": \\"{\\\\\\"level3\\\\\\": \\\\\\"value\\\\\\"}\\"}"}';
      const result = deepParseJson(input);
      expect(result).toEqual({ level1: { level2: { level3: "value" } } });
    });

    it("should return original string for invalid JSON", () => {
      const input = "not a json";
      const result = deepParseJson(input);
      expect(result).toBe("not a json");
    });

    it("should handle arrays with stringified JSON", () => {
      const input = ['{"key": "value"}', "plain string"];
      const result = deepParseJson(input);
      expect(result).toEqual([{ key: "value" }, "plain string"]);
    });

    it("should preserve number strings as strings", () => {
      const input = { key: "123" };
      const result = deepParseJson(input);
      expect(result).toEqual({ key: "123" });
    });
  });

  describe("Python dict syntax", () => {
    it("should parse Python dict with True/False/None", () => {
      const input = "{'key': True, 'key2': False, 'key3': None}";
      const result = deepParseJson(input);
      expect(result).toEqual({ key: true, key2: false, key3: null });
    });

    it("should parse Python dict with single quotes", () => {
      const input = "{'name': 'John', 'age': 30}";
      const result = deepParseJson(input);
      expect(result).toEqual({ name: "John", age: 30 });
    });

    it("should parse Python list", () => {
      const input = "['item1', 'item2', 'item3']";
      const result = deepParseJson(input);
      expect(result).toEqual(["item1", "item2", "item3"]);
    });

    it("should parse nested Python dict", () => {
      const input = "{'outer': {'inner': True}}";
      const result = deepParseJson(input);
      expect(result).toEqual({ outer: { inner: true } });
    });

    it("should return original string if Python parsing fails", () => {
      const input = "{'invalid python syntax";
      const result = deepParseJson(input);
      expect(result).toBe("{'invalid python syntax");
    });

    it("should skip Python parsing for strings without single quotes", () => {
      const input = "regular string without quotes";
      const result = deepParseJson(input);
      expect(result).toBe("regular string without quotes");
    });

    it("should skip Python parsing for strings without dict/list structure", () => {
      const input = "string with 'quotes' but no brackets";
      const result = deepParseJson(input);
      expect(result).toBe("string with 'quotes' but no brackets");
    });
  });

  describe("depth limiting", () => {
    it("should respect maxDepth option", () => {
      const input = '{"level1": "{\\"level2\\": \\"value\\"}"}';
      const result = deepParseJson(input, { maxDepth: 1 });
      expect(result).toEqual({ level1: '{"level2": "value"}' });
    });

    it("should use default maxDepth of 3", () => {
      // Create a 4-level nested structure
      const input = '{"l1": "{\\"l2\\": \\"{\\\\\\"l3\\\\\\": \\\\\\"{\\\\\\\\\\\\\\"l4\\\\\\\\\\\\\\": \\\\\\\\\\\\\\"value\\\\\\\\\\\\\\"}\\\\\\"}\\"}"}';
      const result = deepParseJson(input);
      // Should only parse to depth 3
      expect(typeof result).toBe("object");
    });

    it("should allow custom maxDepth", () => {
      const input = '{"level1": "{\\"level2\\": \\"value\\"}"}';
      const result = deepParseJson(input, { maxDepth: 5 });
      expect(result).toEqual({ level1: { level2: "value" } });
    });
  });

  describe("size limiting", () => {
    it("should respect maxSize option", () => {
      const largeObject = { data: "x".repeat(10000) };
      const result = deepParseJson(largeObject, { maxSize: 100 });
      expect(result).toBe(largeObject);
    });

    it("should use default maxSize of 500KB", () => {
      const normalObject = { data: "x".repeat(1000) };
      const result = deepParseJson(normalObject);
      expect(result).toEqual(normalObject);
    });

    it("should skip parsing for large objects", () => {
      const largeObject = { data: "x".repeat(600000) };
      const result = deepParseJson(largeObject);
      expect(result).toBe(largeObject);
    });
  });

  describe("prototype pollution prevention", () => {
    it("should filter out __proto__ keys", () => {
      const input = '{"__proto__": "malicious", "safe": "value"}';
      const result = deepParseJson(input) as any;
      expect(result.__proto__).toBeUndefined();
      expect(result.safe).toBe("value");
    });

    it("should filter out constructor keys", () => {
      const input = '{"constructor": "malicious", "safe": "value"}';
      const result = deepParseJson(input) as any;
      expect(result.constructor).toBeUndefined();
      expect(result.safe).toBe("value");
    });

    it("should filter out prototype keys", () => {
      const input = '{"prototype": "malicious", "safe": "value"}';
      const result = deepParseJson(input) as any;
      expect(result.prototype).toBeUndefined();
      expect(result.safe).toBe("value");
    });
  });

  describe("edge cases", () => {
    it("should handle null input", () => {
      const result = deepParseJson(null);
      expect(result).toBeNull();
    });

    it("should handle undefined input", () => {
      const result = deepParseJson(undefined);
      expect(result).toBeUndefined();
    });

    it("should handle empty string", () => {
      const result = deepParseJson("");
      expect(result).toBe("");
    });

    it("should handle empty object", () => {
      const result = deepParseJson({});
      expect(result).toEqual({});
    });

    it("should handle empty array", () => {
      const result = deepParseJson([]);
      expect(result).toEqual([]);
    });

    it("should handle primitive values", () => {
      expect(deepParseJson(123)).toBe(123);
      expect(deepParseJson(true)).toBe(true);
      expect(deepParseJson(false)).toBe(false);
    });

    it("should handle arrays of primitives", () => {
      const input = [1, 2, 3, "four", true, null];
      const result = deepParseJson(input);
      expect(result).toEqual([1, 2, 3, "four", true, null]);
    });

    it("should handle mixed nested structures", () => {
      const input = {
        string: "value",
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        object: { nested: "data" },
      };
      const result = deepParseJson(input);
      expect(result).toEqual(input);
    });
  });
});

describe("parseJsonPrioritised", () => {
  describe("safe number handling", () => {
    it("should parse safe integers as numbers", () => {
      const input = '{"value": 123}';
      const result = parseJsonPrioritised(input);
      expect(result).toEqual({ value: 123 });
    });

    it("should parse safe decimals as numbers", () => {
      const input = '{"value": 123.456}';
      const result = parseJsonPrioritised(input);
      expect(result).toEqual({ value: 123.456 });
    });

    it("should preserve large integers as strings", () => {
      const input = '{"value": 9007199254740992}'; // Beyond Number.MAX_SAFE_INTEGER
      const result = parseJsonPrioritised(input) as any;
      expect(typeof result.value).toBe("string");
      expect(result.value).toBe("9007199254740992");
    });

    it("should handle negative safe numbers", () => {
      const input = '{"value": -123}';
      const result = parseJsonPrioritised(input);
      expect(result).toEqual({ value: -123 });
    });

    it("should handle zero", () => {
      const input = '{"value": 0}';
      const result = parseJsonPrioritised(input);
      expect(result).toEqual({ value: 0 });
    });
  });

  describe("basic JSON parsing", () => {
    it("should parse valid JSON objects", () => {
      const input = '{"name": "John", "age": 30}';
      const result = parseJsonPrioritised(input);
      expect(result).toEqual({ name: "John", age: 30 });
    });

    it("should parse valid JSON arrays", () => {
      const input = '[1, 2, 3, 4, 5]';
      const result = parseJsonPrioritised(input);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it("should parse nested JSON", () => {
      const input = '{"outer": {"inner": "value"}}';
      const result = parseJsonPrioritised(input);
      expect(result).toEqual({ outer: { inner: "value" } });
    });

    it("should parse JSON with boolean values", () => {
      const input = '{"isActive": true, "isDeleted": false}';
      const result = parseJsonPrioritised(input);
      expect(result).toEqual({ isActive: true, isDeleted: false });
    });

    it("should parse JSON with null values", () => {
      const input = '{"value": null}';
      const result = parseJsonPrioritised(input);
      expect(result).toEqual({ value: null });
    });
  });

  describe("invalid JSON handling", () => {
    it("should return original string for invalid JSON", () => {
      const input = "not valid json";
      const result = parseJsonPrioritised(input);
      expect(result).toBe("not valid json");
    });

    it("should return original string for malformed JSON", () => {
      const input = '{"key": value}'; // Missing quotes around value
      const result = parseJsonPrioritised(input);
      expect(result).toBe('{"key": value}');
    });

    it("should return original string for incomplete JSON", () => {
      const input = '{"key": "value"';
      const result = parseJsonPrioritised(input);
      expect(result).toBe('{"key": "value"');
    });

    it("should handle empty string", () => {
      const input = "";
      const result = parseJsonPrioritised(input);
      expect(result).toBe("");
    });
  });

  describe("edge cases", () => {
    it("should handle strings with special characters", () => {
      const input = '{"message": "Line 1\\nLine 2\\tTabbed"}';
      const result = parseJsonPrioritised(input);
      expect(result).toEqual({ message: "Line 1\nLine 2\tTabbed" });
    });

    it("should handle empty JSON object", () => {
      const input = "{}";
      const result = parseJsonPrioritised(input);
      expect(result).toEqual({});
    });

    it("should handle empty JSON array", () => {
      const input = "[]";
      const result = parseJsonPrioritised(input);
      expect(result).toEqual([]);
    });

    it("should handle JSON with Unicode characters", () => {
      const input = '{"emoji": "😀", "chinese": "你好"}';
      const result = parseJsonPrioritised(input);
      expect(result).toEqual({ emoji: "😀", chinese: "你好" });
    });

    it("should handle JSON with escaped quotes", () => {
      const input = '{"quote": "He said \\"Hello\\""}';
      const result = parseJsonPrioritised(input);
      expect(result).toEqual({ quote: 'He said "Hello"' });
    });
  });
});
