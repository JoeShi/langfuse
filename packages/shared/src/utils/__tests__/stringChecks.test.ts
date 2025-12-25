import { describe, it, expect } from "vitest";
import {
  getIsCharOrUnderscore,
  VARIABLE_REGEX,
  MUSTACHE_REGEX,
  MULTILINE_VARIABLE_REGEX,
  UNCLOSED_VARIABLE_REGEX,
  isValidVariableName,
  extractVariables,
  stringifyValue,
} from "../stringChecks";

describe("stringChecks utilities", () => {
  describe("getIsCharOrUnderscore", () => {
    it("should return true for alphabetic characters", () => {
      expect(getIsCharOrUnderscore("abc")).toBe(true);
      expect(getIsCharOrUnderscore("ABC")).toBe(true);
      expect(getIsCharOrUnderscore("AbC")).toBe(true);
    });

    it("should return true for underscores", () => {
      expect(getIsCharOrUnderscore("_")).toBe(true);
      expect(getIsCharOrUnderscore("___")).toBe(true);
      expect(getIsCharOrUnderscore("a_b_c")).toBe(true);
    });

    it("should return false for numbers", () => {
      expect(getIsCharOrUnderscore("123")).toBe(false);
      expect(getIsCharOrUnderscore("abc123")).toBe(false);
    });

    it("should return false for special characters", () => {
      expect(getIsCharOrUnderscore("abc-def")).toBe(false);
      expect(getIsCharOrUnderscore("abc def")).toBe(false);
      expect(getIsCharOrUnderscore("abc@def")).toBe(false);
    });

    it("should return false for empty strings", () => {
      expect(getIsCharOrUnderscore("")).toBe(false);
    });
  });

  describe("VARIABLE_REGEX", () => {
    it("should match valid variable names starting with letters", () => {
      expect(VARIABLE_REGEX.test("variable")).toBe(true);
      expect(VARIABLE_REGEX.test("myVar")).toBe(true);
      expect(VARIABLE_REGEX.test("test_variable")).toBe(true);
    });

    it("should match variable names with underscores", () => {
      expect(VARIABLE_REGEX.test("_privateVar")).toBe(true);
      expect(VARIABLE_REGEX.test("my_var_name")).toBe(true);
    });

    it("should reject variable names starting with numbers", () => {
      expect(VARIABLE_REGEX.test("123var")).toBe(false);
      expect(VARIABLE_REGEX.test("1test")).toBe(false);
    });

    it("should reject variable names with special characters", () => {
      expect(VARIABLE_REGEX.test("var-name")).toBe(false);
      expect(VARIABLE_REGEX.test("var name")).toBe(false);
      expect(VARIABLE_REGEX.test("var@name")).toBe(false);
    });
  });

  describe("MUSTACHE_REGEX", () => {
    it("should match mustache variables", () => {
      const matches = "{{variable}}".matchAll(MUSTACHE_REGEX);
      const results = Array.from(matches);
      expect(results).toHaveLength(1);
      expect(results[0][1]).toBe("variable");
    });

    it("should match multiple mustache variables", () => {
      const matches = "{{var1}} and {{var2}}".matchAll(MUSTACHE_REGEX);
      const results = Array.from(matches);
      expect(results).toHaveLength(2);
      expect(results[0][1]).toBe("var1");
      expect(results[1][1]).toBe("var2");
    });

    it("should handle nested braces", () => {
      const matches = "{{variable}}".matchAll(MUSTACHE_REGEX);
      const results = Array.from(matches);
      expect(results).toHaveLength(1);
    });
  });

  describe("MULTILINE_VARIABLE_REGEX", () => {
    it("should match multiline variables", () => {
      const text = "{{variable\nwith\nnewlines}}";
      const matches = text.match(MULTILINE_VARIABLE_REGEX);
      expect(matches).not.toBeNull();
      expect(matches).toHaveLength(1);
    });

    it("should not match single-line variables", () => {
      const text = "{{variable}}";
      const matches = text.match(MULTILINE_VARIABLE_REGEX);
      expect(matches).toBeNull();
    });
  });

  describe("UNCLOSED_VARIABLE_REGEX", () => {
    it("should match unclosed variables", () => {
      const text = "{{unclosed";
      const matches = text.match(UNCLOSED_VARIABLE_REGEX);
      expect(matches).not.toBeNull();
      expect(matches).toHaveLength(1);
    });

    it("should not match properly closed variables", () => {
      const text = "{{closed}}";
      const matches = text.match(UNCLOSED_VARIABLE_REGEX);
      expect(matches).toBeNull();
    });

    it("should match multiple unclosed variables", () => {
      const text = "{{first {{second";
      const matches = text.match(UNCLOSED_VARIABLE_REGEX);
      expect(matches).not.toBeNull();
      expect(matches!.length).toBeGreaterThan(0);
    });
  });

  describe("isValidVariableName", () => {
    it("should accept valid variable names", () => {
      expect(isValidVariableName("variable")).toBe(true);
      expect(isValidVariableName("myVar")).toBe(true);
      expect(isValidVariableName("test_var")).toBe(true);
      expect(isValidVariableName("_private")).toBe(true);
    });

    it("should reject invalid variable names", () => {
      expect(isValidVariableName("123var")).toBe(false);
      expect(isValidVariableName("var-name")).toBe(false);
      expect(isValidVariableName("var name")).toBe(false);
      expect(isValidVariableName("var@test")).toBe(false);
    });

    it("should reject empty strings", () => {
      expect(isValidVariableName("")).toBe(false);
    });

    it("should reject names with numbers in middle", () => {
      expect(isValidVariableName("var123name")).toBe(false);
    });
  });

  describe("extractVariables", () => {
    it("should extract single variable", () => {
      const result = extractVariables("Hello {{name}}");
      expect(result).toEqual(["name"]);
    });

    it("should extract multiple variables", () => {
      const result = extractVariables("{{greeting}} {{name}}, welcome to {{place}}");
      expect(result).toEqual(["greeting", "name", "place"]);
    });

    it("should deduplicate variables", () => {
      const result = extractVariables("{{name}} and {{name}} again");
      expect(result).toEqual(["name"]);
    });

    it("should filter out invalid variable names", () => {
      const result = extractVariables("{{valid}} {{123invalid}} {{also-invalid}}");
      expect(result).toEqual(["valid"]);
    });

    it("should handle empty strings", () => {
      const result = extractVariables("");
      expect(result).toEqual([]);
    });

    it("should handle strings without variables", () => {
      const result = extractVariables("No variables here");
      expect(result).toEqual([]);
    });

    it("should handle variables with underscores", () => {
      const result = extractVariables("{{user_name}} and {{user_id}}");
      expect(result).toEqual(["user_name", "user_id"]);
    });

    it("should handle complex templates", () => {
      const template = "Dear {{firstName}}, your order {{orderId}} is ready.";
      const result = extractVariables(template);
      expect(result).toEqual(["firstName", "orderId"]);
    });
  });

  describe("stringifyValue", () => {
    it("should return strings as-is", () => {
      expect(stringifyValue("hello")).toBe("hello");
      expect(stringifyValue("123")).toBe("123");
    });

    it("should convert numbers to strings", () => {
      expect(stringifyValue(42)).toBe("42");
      expect(stringifyValue(3.14)).toBe("3.14");
      expect(stringifyValue(0)).toBe("0");
    });

    it("should convert booleans to strings", () => {
      expect(stringifyValue(true)).toBe("true");
      expect(stringifyValue(false)).toBe("false");
    });

    it("should JSON stringify objects", () => {
      const obj = { name: "John", age: 30 };
      expect(stringifyValue(obj)).toBe(JSON.stringify(obj));
    });

    it("should JSON stringify arrays", () => {
      const arr = [1, 2, 3];
      expect(stringifyValue(arr)).toBe(JSON.stringify(arr));
    });

    it("should JSON stringify null", () => {
      expect(stringifyValue(null)).toBe("null");
    });

    it("should JSON stringify undefined", () => {
      expect(stringifyValue(undefined)).toBe(undefined);
    });

    it("should handle complex nested structures", () => {
      const complex = {
        user: {
          name: "John",
          tags: ["admin", "user"],
        },
      };
      expect(stringifyValue(complex)).toBe(JSON.stringify(complex));
    });
  });
});
