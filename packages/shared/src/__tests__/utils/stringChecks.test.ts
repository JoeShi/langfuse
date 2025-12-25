import { describe, it, expect } from "vitest";
import {
  getIsCharOrUnderscore,
  isValidVariableName,
  extractVariables,
  stringifyValue,
  VARIABLE_REGEX,
  MUSTACHE_REGEX,
  MULTILINE_VARIABLE_REGEX,
  UNCLOSED_VARIABLE_REGEX,
} from "../../../src/utils/stringChecks";

describe("stringChecks", () => {
  describe("getIsCharOrUnderscore", () => {
    it("should return true for alphabetic characters only", () => {
      expect(getIsCharOrUnderscore("abc")).toBe(true);
      expect(getIsCharOrUnderscore("ABC")).toBe(true);
      expect(getIsCharOrUnderscore("AbCdEf")).toBe(true);
    });

    it("should return true for underscores", () => {
      expect(getIsCharOrUnderscore("_")).toBe(true);
      expect(getIsCharOrUnderscore("___")).toBe(true);
    });

    it("should return true for mixed letters and underscores", () => {
      expect(getIsCharOrUnderscore("abc_def")).toBe(true);
      expect(getIsCharOrUnderscore("_abc_")).toBe(true);
      expect(getIsCharOrUnderscore("ABC_DEF_GHI")).toBe(true);
    });

    it("should return false for strings with numbers", () => {
      expect(getIsCharOrUnderscore("abc123")).toBe(false);
      expect(getIsCharOrUnderscore("123")).toBe(false);
      expect(getIsCharOrUnderscore("a1b2c3")).toBe(false);
    });

    it("should return false for strings with special characters", () => {
      expect(getIsCharOrUnderscore("abc-def")).toBe(false);
      expect(getIsCharOrUnderscore("abc.def")).toBe(false);
      expect(getIsCharOrUnderscore("abc def")).toBe(false);
      expect(getIsCharOrUnderscore("abc!")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(getIsCharOrUnderscore("")).toBe(false);
    });
  });

  describe("isValidVariableName", () => {
    it("should return true for valid variable names starting with letter", () => {
      expect(isValidVariableName("variable")).toBe(true);
      expect(isValidVariableName("myVar")).toBe(true);
      expect(isValidVariableName("x")).toBe(true);
    });

    it("should return true for variable names with underscores", () => {
      expect(isValidVariableName("my_variable")).toBe(true);
      expect(isValidVariableName("var_name_here")).toBe(true);
      expect(isValidVariableName("a_b_c")).toBe(true);
    });

    it("should return false for names starting with underscore", () => {
      expect(isValidVariableName("_variable")).toBe(false);
      expect(isValidVariableName("_")).toBe(false);
    });

    it("should return false for names with numbers", () => {
      expect(isValidVariableName("var123")).toBe(false);
      expect(isValidVariableName("var_123")).toBe(false);
      expect(isValidVariableName("123var")).toBe(false);
    });

    it("should return false for names with special characters", () => {
      expect(isValidVariableName("var-name")).toBe(false);
      expect(isValidVariableName("var.name")).toBe(false);
      expect(isValidVariableName("var name")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isValidVariableName("")).toBe(false);
    });

    it("should accept both uppercase and lowercase", () => {
      expect(isValidVariableName("Variable")).toBe(true);
      expect(isValidVariableName("VARIABLE")).toBe(true);
      expect(isValidVariableName("VaRiAbLe")).toBe(true);
    });
  });

  describe("extractVariables", () => {
    it("should extract single variable", () => {
      const result = extractVariables("Hello {{name}}");
      expect(result).toEqual(["name"]);
    });

    it("should extract multiple variables", () => {
      const result = extractVariables("{{greeting}} {{name}}, you are {{age}} years old");
      expect(result).toEqual(["greeting", "name", "age"]);
    });

    it("should remove duplicate variables", () => {
      const result = extractVariables("{{name}} and {{name}} again");
      expect(result).toEqual(["name"]);
    });

    it("should extract variables with underscores", () => {
      const result = extractVariables("{{first_name}} {{last_name}}");
      expect(result).toEqual(["first_name", "last_name"]);
    });

    it("should ignore invalid variable names", () => {
      const result = extractVariables("{{valid}} {{123invalid}} {{_invalid}} {{also-invalid}}");
      expect(result).toEqual(["valid"]);
    });

    it("should return empty array for no variables", () => {
      const result = extractVariables("No variables here");
      expect(result).toEqual([]);
    });

    it("should handle empty string", () => {
      const result = extractVariables("");
      expect(result).toEqual([]);
    });

    it("should handle malformed mustache syntax", () => {
      const result = extractVariables("{{unclosed");
      expect(result).toEqual([]);
    });

    it("should extract from complex template", () => {
      const template = `
        Hello {{user}},
        Your order {{order_id}} is ready.
        Total: {{total}}
      `;
      const result = extractVariables(template);
      expect(result).toContain("user");
      expect(result).toContain("order_id");
      expect(result).toContain("total");
    });
  });

  describe("stringifyValue", () => {
    it("should return string values as-is", () => {
      expect(stringifyValue("hello")).toBe("hello");
      expect(stringifyValue("")).toBe("");
    });

    it("should convert numbers to strings", () => {
      expect(stringifyValue(42)).toBe("42");
      expect(stringifyValue(3.14)).toBe("3.14");
      expect(stringifyValue(0)).toBe("0");
      expect(stringifyValue(-5)).toBe("-5");
    });

    it("should convert booleans to strings", () => {
      expect(stringifyValue(true)).toBe("true");
      expect(stringifyValue(false)).toBe("false");
    });

    it("should JSON stringify objects", () => {
      expect(stringifyValue({ key: "value" })).toBe('{"key":"value"}');
      expect(stringifyValue({ a: 1, b: 2 })).toBe('{"a":1,"b":2}');
    });

    it("should JSON stringify arrays", () => {
      expect(stringifyValue([1, 2, 3])).toBe("[1,2,3]");
      expect(stringifyValue(["a", "b"])).toBe('["a","b"]');
    });

    it("should handle null", () => {
      expect(stringifyValue(null)).toBe("null");
    });

    it("should handle undefined", () => {
      expect(stringifyValue(undefined)).toBeUndefined();
    });

    it("should handle nested objects", () => {
      const nested = { outer: { inner: "value" } };
      expect(stringifyValue(nested)).toBe('{"outer":{"inner":"value"}}');
    });
  });

  describe("VARIABLE_REGEX", () => {
    it("should match valid variable names", () => {
      expect(VARIABLE_REGEX.test("variable")).toBe(true);
      expect(VARIABLE_REGEX.test("myVar")).toBe(true);
      expect(VARIABLE_REGEX.test("var_name")).toBe(true);
    });

    it("should not match invalid variable names", () => {
      expect(VARIABLE_REGEX.test("_var")).toBe(false);
      expect(VARIABLE_REGEX.test("123var")).toBe(false);
      expect(VARIABLE_REGEX.test("var-name")).toBe(false);
    });
  });

  describe("MUSTACHE_REGEX", () => {
    it("should match mustache variables", () => {
      const matches = "{{var1}} and {{var2}}".match(MUSTACHE_REGEX);
      expect(matches).toHaveLength(2);
    });

    it("should extract variable names", () => {
      const text = "{{name}} is {{age}} years old";
      const matches = Array.from(text.matchAll(MUSTACHE_REGEX));
      expect(matches[0][1]).toBe("name");
      expect(matches[1][1]).toBe("age");
    });
  });

  describe("MULTILINE_VARIABLE_REGEX", () => {
    it("should match multiline variables", () => {
      const text = "{{variable\nwith\nnewlines}}";
      expect(MULTILINE_VARIABLE_REGEX.test(text)).toBe(true);
    });

    it("should not match single line variables", () => {
      const text = "{{variable}}";
      expect(MULTILINE_VARIABLE_REGEX.test(text)).toBe(false);
    });
  });

  describe("UNCLOSED_VARIABLE_REGEX", () => {
    it("should match unclosed variables", () => {
      const text = "{{unclosed";
      expect(UNCLOSED_VARIABLE_REGEX.test(text)).toBe(true);
    });

    it("should not match properly closed variables", () => {
      const text = "{{closed}}";
      expect(UNCLOSED_VARIABLE_REGEX.test(text)).toBe(false);
    });
  });
});
