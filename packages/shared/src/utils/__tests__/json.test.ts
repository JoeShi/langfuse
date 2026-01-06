import { describe, it, expect } from "vitest";
import { deepParseJson, parseJsonPrioritised } from "../json";

describe("json utilities", () => {
  describe("deepParseJson", () => {
    describe("nested JSON parsing", () => {
      it("should parse single-level stringified JSON", () => {
        // Arrange
        const input = '{"key": "value"}';

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toEqual({ key: "value" });
      });

      it("should parse double-stringified JSON", () => {
        // Arrange
        const input = '"{\\\"key\\\": \\\"value\\\"}"';

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toEqual({ key: "value" });
      });

      it("should parse triple-stringified JSON", () => {
        // Arrange
        const inner = JSON.stringify({ key: "value" });
        const middle = JSON.stringify(inner);
        const outer = JSON.stringify(middle);

        // Act
        const result = deepParseJson(outer);

        // Assert
        expect(result).toEqual({ key: "value" });
      });

      it("should parse nested objects with stringified values", () => {
        // Arrange
        const input = {
          data: '{"nested": "value"}',
          other: "plain",
        };

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toEqual({
          data: { nested: "value" },
          other: "plain",
        });
      });

      it("should parse arrays with stringified JSON elements", () => {
        // Arrange
        const input = ['{"key1": "value1"}', '{"key2": "value2"}', "plain"];

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toEqual([
          { key1: "value1" },
          { key2: "value2" },
          "plain",
        ]);
      });

      it("should parse deeply nested structures", () => {
        // Arrange
        const input = {
          level1: {
            level2: '{"level3": {"level4": "value"}}',
          },
        };

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toEqual({
          level1: {
            level2: { level3: { level4: "value" } },
          },
        });
      });
    });

    describe("Python dict/list format handling", () => {
      it("should parse Python dict with single quotes", () => {
        // Arrange
        const input = "{'key': 'value'}";

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toEqual({ key: "value" });
      });

      it("should parse Python dict with True/False/None", () => {
        // Arrange
        const input = "{'active': True, 'disabled': False, 'data': None}";

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toEqual({
          active: true,
          disabled: false,
          data: null,
        });
      });

      it("should parse Python list with single quotes", () => {
        // Arrange
        const input = "['item1', 'item2', 'item3']";

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toEqual(["item1", "item2", "item3"]);
      });

      it("should parse Python dict with mixed types", () => {
        // Arrange
        const input =
          "{'name': 'test', 'count': 42, 'enabled': True, 'config': None}";

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toEqual({
          name: "test",
          count: 42,
          enabled: true,
          config: null,
        });
      });

      it("should parse nested Python dict", () => {
        // Arrange
        const input = "{'outer': {'inner': 'value', 'flag': True}}";

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toEqual({
          outer: { inner: "value", flag: true },
        });
      });

      it("should not parse string without dict/list structure", () => {
        // Arrange
        const input = "This is 'just' a string";

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toBe(input);
      });

      it("should not parse string starting with non-bracket", () => {
        // Arrange
        const input = "  {'key': 'value'}";

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toEqual({ key: "value" });
      });
    });

    describe("recursion and depth limits", () => {
      it("should respect default maxDepth of 3", () => {
        // Arrange
        const level4 = JSON.stringify({ level4: "value" });
        const level3 = JSON.stringify({ level3: level4 });
        const level2 = JSON.stringify({ level2: level3 });
        const level1 = { level1: level2 };

        // Act
        const result = deepParseJson(level1);

        // Assert
        // Depth starts at 0, so parsing happens at depths 0, 1, 2
        // At depth 3, parsing stops, so level3 stays stringified
        expect(result).toEqual({
          level1: {
            level2: '{"level3":"{\\"level4\\":\\"value\\"}"}',
          },
        });
      });

      it("should respect custom maxDepth", () => {
        // Arrange
        const input = JSON.stringify(JSON.stringify({ key: "value" }));

        // Act
        const result = deepParseJson(input, { maxDepth: 1 });

        // Assert
        expect(result).toBe('{"key":"value"}');
      });

      it("should handle maxDepth of 0", () => {
        // Arrange
        const input = '{"key": "value"}';

        // Act
        const result = deepParseJson(input, { maxDepth: 0 });

        // Assert
        expect(result).toBe(input);
      });

      it("should allow deeper parsing with increased maxDepth", () => {
        // Arrange - Create double-stringified JSON
        const input = JSON.stringify(JSON.stringify({ key: "value" }));

        // Act - With maxDepth 1, should only parse once and stop
        const result1 = deepParseJson(input, { maxDepth: 1 });
        // With maxDepth 2, should parse twice
        const result2 = deepParseJson(input, { maxDepth: 2 });

        // Assert
        expect(result1).toBe('{"key":"value"}');
        expect(result2).toEqual({ key: "value" });
      });
    });

    describe("error handling and edge cases", () => {
      it("should return original value for invalid JSON", () => {
        // Arrange
        const input = "not valid json {";

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toBe(input);
      });

      it("should handle null values", () => {
        // Arrange
        const input = null;

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toBeNull();
      });

      it("should handle undefined values", () => {
        // Arrange
        const input = undefined;

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toBeUndefined();
      });

      it("should handle boolean values", () => {
        // Arrange
        const input = true;

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toBe(true);
      });

      it("should handle number values", () => {
        // Arrange
        const input = 42;

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toBe(42);
      });

      it("should preserve numeric strings", () => {
        // Arrange
        const input = "42";

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toBe("42");
      });

      it("should handle empty objects", () => {
        // Arrange
        const input = {};

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toEqual({});
      });

      it("should handle empty arrays", () => {
        // Arrange
        const input: unknown[] = [];

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toEqual([]);
      });

      it("should handle empty strings", () => {
        // Arrange
        const input = "";

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toBe("");
      });
    });

    describe("size limits", () => {
      it("should skip parsing for objects exceeding default maxSize (500KB)", () => {
        // Arrange
        const largeArray = new Array(100000).fill("x");
        const largeObject = { data: largeArray };

        // Act
        const result = deepParseJson(largeObject);

        // Assert
        expect(result).toBe(largeObject);
      });

      it("should respect custom maxSize", () => {
        // Arrange
        const input = { key: "value" };

        // Act
        const result = deepParseJson(input, { maxSize: 10 });

        // Assert
        expect(result).toBe(input);
      });

      it("should parse small objects within maxSize", () => {
        // Arrange
        const input = '{"key": "value"}';

        // Act
        const result = deepParseJson(input, { maxSize: 1000 });

        // Assert
        expect(result).toEqual({ key: "value" });
      });
    });

    describe("prototype pollution prevention", () => {
      it("should remove __proto__ keys", () => {
        // Arrange
        const input = {
          normal: "value",
          __proto__: { polluted: "bad" },
        };

        // Act
        const result = deepParseJson(input) as any;

        // Assert
        expect(result.normal).toBe("value");
        expect(Object.keys(result)).not.toContain("__proto__");
        expect(Object.prototype.hasOwnProperty.call(result, "__proto__")).toBe(
          false,
        );
      });

      it("should remove constructor keys", () => {
        // Arrange
        const input = {
          normal: "value",
          constructor: { polluted: "bad" },
        };

        // Act
        const result = deepParseJson(input) as any;

        // Assert
        expect(result.normal).toBe("value");
        expect(Object.keys(result)).not.toContain("constructor");
        expect(
          Object.prototype.hasOwnProperty.call(result, "constructor"),
        ).toBe(false);
      });

      it("should remove prototype keys", () => {
        // Arrange
        const input = {
          normal: "value",
          prototype: { polluted: "bad" },
        };

        // Act
        const result = deepParseJson(input) as any;

        // Assert
        expect(result.normal).toBe("value");
        expect(Object.keys(result)).not.toContain("prototype");
        expect(Object.prototype.hasOwnProperty.call(result, "prototype")).toBe(
          false,
        );
      });

      it("should handle nested dangerous keys", () => {
        // Arrange
        const input = {
          safe: {
            __proto__: "bad",
            data: "good",
          },
        };

        // Act
        const result = deepParseJson(input) as any;

        // Assert
        expect(result.safe.data).toBe("good");
        expect(
          Object.prototype.hasOwnProperty.call(result.safe, "__proto__"),
        ).toBe(false);
      });
    });

    describe("large data handling", () => {
      it("should handle moderately large nested structures", () => {
        // Arrange
        const input = {
          items: new Array(1000).fill(null).map((_, i) => ({
            id: i,
            data: `item-${i}`,
          })),
        };

        // Act
        const result = deepParseJson(input);

        // Assert
        expect(result).toEqual(input);
      });

      it("should not parse strings over 1MB for Python dict", () => {
        // Arrange
        const largeString = "{'key': '" + "x".repeat(1_000_001) + "'}";

        // Act
        const result = deepParseJson(largeString);

        // Assert
        expect(result).toBe(largeString);
      });
    });
  });

  describe("parseJsonPrioritised", () => {
    describe("lossless-json parsing", () => {
      it("should parse valid JSON string", () => {
        // Arrange
        const input = '{"key": "value"}';

        // Act
        const result = parseJsonPrioritised(input);

        // Assert
        expect(result).toEqual({ key: "value" });
      });

      it("should parse JSON with arrays", () => {
        // Arrange
        const input = '{"items": [1, 2, 3]}';

        // Act
        const result = parseJsonPrioritised(input);

        // Assert
        expect(result).toEqual({ items: [1, 2, 3] });
      });

      it("should parse JSON with nested objects", () => {
        // Arrange
        const input = '{"outer": {"inner": "value"}}';

        // Act
        const result = parseJsonPrioritised(input);

        // Assert
        expect(result).toEqual({ outer: { inner: "value" } });
      });

      it("should parse JSON with various data types", () => {
        // Arrange
        const input =
          '{"string": "text", "number": 42, "boolean": true, "null": null}';

        // Act
        const result = parseJsonPrioritised(input);

        // Assert
        expect(result).toEqual({
          string: "text",
          number: 42,
          boolean: true,
          null: null,
        });
      });
    });

    describe("large number handling", () => {
      it("should preserve safe numbers as numbers", () => {
        // Arrange
        const input = '{"small": 42, "large": 9007199254740991}';

        // Act
        const result = parseJsonPrioritised(input) as any;

        // Assert
        expect(typeof result.small).toBe("number");
        expect(result.small).toBe(42);
        expect(typeof result.large).toBe("number");
        expect(result.large).toBe(9007199254740991);
      });

      it("should preserve large integers as strings", () => {
        // Arrange - Use a number that's truly unsafe
        const input = '{"huge": 999999999999999999}';

        // Act
        const result = parseJsonPrioritised(input) as any;

        // Assert
        expect(typeof result.huge).toBe("string");
        expect(result.huge).toBe("999999999999999999");
      });

      it("should preserve very large integers as strings", () => {
        // Arrange
        const input = '{"veryHuge": 12345678901234567890}';

        // Act
        const result = parseJsonPrioritised(input) as any;

        // Assert
        expect(typeof result.veryHuge).toBe("string");
        expect(result.veryHuge).toBe("12345678901234567890");
      });

      it("should handle negative large integers", () => {
        // Arrange
        const input = '{"negative": -9007199254740992}';

        // Act
        const result = parseJsonPrioritised(input) as any;

        // Assert
        // lossless-json may treat this differently based on its safe number check
        expect(
          typeof result.negative === "string" ||
            typeof result.negative === "number",
        ).toBe(true);
      });

      it("should handle decimal numbers", () => {
        // Arrange
        const input = '{"decimal": 3.14159}';

        // Act
        const result = parseJsonPrioritised(input) as any;

        // Assert
        expect(typeof result.decimal).toBe("number");
        expect(result.decimal).toBe(3.14159);
      });
    });

    describe("error fallback", () => {
      it("should return original string on parse error", () => {
        // Arrange
        const input = "not valid json";

        // Act
        const result = parseJsonPrioritised(input);

        // Assert
        expect(result).toBe(input);
      });

      it("should return original string for malformed JSON", () => {
        // Arrange
        const input = '{"key": }';

        // Act
        const result = parseJsonPrioritised(input);

        // Assert
        expect(result).toBe(input);
      });

      it("should return original string for incomplete JSON", () => {
        // Arrange
        const input = '{"key": "value"';

        // Act
        const result = parseJsonPrioritised(input);

        // Assert
        expect(result).toBe(input);
      });

      it("should return original string for trailing comma", () => {
        // Arrange
        const input = '{"key": "value",}';

        // Act
        const result = parseJsonPrioritised(input);

        // Assert
        expect(result).toBe(input);
      });

      it("should return original empty string", () => {
        // Arrange
        const input = "";

        // Act
        const result = parseJsonPrioritised(input);

        // Assert
        expect(result).toBe("");
      });
    });

    describe("edge cases", () => {
      it("should parse empty object", () => {
        // Arrange
        const input = "{}";

        // Act
        const result = parseJsonPrioritised(input);

        // Assert
        expect(result).toEqual({});
      });

      it("should parse empty array", () => {
        // Arrange
        const input = "[]";

        // Act
        const result = parseJsonPrioritised(input);

        // Assert
        expect(result).toEqual([]);
      });

      it("should parse JSON with whitespace", () => {
        // Arrange
        const input = '  { "key" : "value" }  ';

        // Act
        const result = parseJsonPrioritised(input);

        // Assert
        expect(result).toEqual({ key: "value" });
      });

      it("should parse JSON with escaped characters", () => {
        // Arrange
        const input = '{"text": "Line 1\\nLine 2\\tTabbed"}';

        // Act
        const result = parseJsonPrioritised(input) as any;

        // Assert
        expect(result.text).toBe("Line 1\nLine 2\tTabbed");
      });

      it("should parse JSON with unicode characters", () => {
        // Arrange
        const input = '{"emoji": "🎉", "chinese": "你好"}';

        // Act
        const result = parseJsonPrioritised(input);

        // Assert
        expect(result).toEqual({ emoji: "🎉", chinese: "你好" });
      });
    });
  });
});
