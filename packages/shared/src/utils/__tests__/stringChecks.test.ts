import { describe, it, expect } from "vitest";
import {
  getIsCharOrUnderscore,
  isValidVariableName,
  extractVariables,
  stringifyValue,
  VARIABLE_REGEX,
  MUSTACHE_REGEX,
} from "../stringChecks";

describe("stringChecks.ts", () => {
  describe("getIsCharOrUnderscore", () => {
    it("should return true for single lowercase letter", () => {
      expect(getIsCharOrUnderscore("a")).toBe(true);
      expect(getIsCharOrUnderscore("z")).toBe(true);
    });

    it("should return true for single uppercase letter", () => {
      expect(getIsCharOrUnderscore("A")).toBe(true);
      expect(getIsCharOrUnderscore("Z")).toBe(true);
    });

    it("should return true for single underscore", () => {
      expect(getIsCharOrUnderscore("_")).toBe(true);
    });

    it("should return true for multiple letters", () => {
      expect(getIsCharOrUnderscore("abc")).toBe(true);
      expect(getIsCharOrUnderscore("ABC")).toBe(true);
      expect(getIsCharOrUnderscore("AbC")).toBe(true);
    });

    it("should return true for letters with underscores", () => {
      expect(getIsCharOrUnderscore("a_b_c")).toBe(true);
      expect(getIsCharOrUnderscore("__test__")).toBe(true);
      expect(getIsCharOrUnderscore("_")).toBe(true);
    });

    it("should return false for strings with numbers", () => {
      expect(getIsCharOrUnderscore("a1")).toBe(false);
      expect(getIsCharOrUnderscore("123")).toBe(false);
      expect(getIsCharOrUnderscore("test123")).toBe(false);
    });

    it("should return false for strings with special characters", () => {
      expect(getIsCharOrUnderscore("a-b")).toBe(false);
      expect(getIsCharOrUnderscore("a.b")).toBe(false);
      expect(getIsCharOrUnderscore("a b")).toBe(false);
      expect(getIsCharOrUnderscore("a@b")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(getIsCharOrUnderscore("")).toBe(false);
    });

    it("should return true for only underscores", () => {
      expect(getIsCharOrUnderscore("___")).toBe(true);
    });
  });

  describe("isValidVariableName", () => {
    it("should return true for valid variable names starting with letter", () => {
      expect(isValidVariableName("variable")).toBe(true);
      expect(isValidVariableName("myVar")).toBe(true);
      expect(isValidVariableName("test_case")).toBe(true);
    });

    it("should return true for single letter", () => {
      expect(isValidVariableName("a")).toBe(true);
      expect(isValidVariableName("Z")).toBe(true);
    });

    it("should return true for variable names with underscores", () => {
      expect(isValidVariableName("my_variable")).toBe(true);
      expect(isValidVariableName("test_case_one")).toBe(true);
      expect(isValidVariableName("a_")).toBe(true);
    });

    it("should return false for names starting with underscore", () => {
      expect(isValidVariableName("_variable")).toBe(false);
      expect(isValidVariableName("_test")).toBe(false);
    });

    it("should return false for names starting with number", () => {
      expect(isValidVariableName("1variable")).toBe(false);
      expect(isValidVariableName("123test")).toBe(false);
    });

    it("should return false for names with numbers", () => {
      expect(isValidVariableName("var1")).toBe(false);
      expect(isValidVariableName("test123")).toBe(false);
    });

    it("should return false for names with special characters", () => {
      expect(isValidVariableName("var-name")).toBe(false);
      expect(isValidVariableName("var.name")).toBe(false);
      expect(isValidVariableName("var name")).toBe(false);
      expect(isValidVariableName("var@name")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isValidVariableName("")).toBe(false);
    });

    it("should return false for only underscores", () => {
      expect(isValidVariableName("___")).toBe(false);
    });

    it("should match VARIABLE_REGEX pattern", () => {
      // Test that the function uses the correct regex
      const validNames = ["a", "myVar", "test_case", "longVariableName"];
      const invalidNames = ["_var", "1var", "var-name", "var.name"];

      validNames.forEach((name) => {
        expect(isValidVariableName(name)).toBe(true);
        expect(VARIABLE_REGEX.test(name)).toBe(true);
      });

      invalidNames.forEach((name) => {
        expect(isValidVariableName(name)).toBe(false);
        expect(VARIABLE_REGEX.test(name)).toBe(false);
      });
    });
  });

  describe("extractVariables", () => {
    it("should extract single variable from mustache template", () => {
      const template = "Hello {{name}}!";
      const result = extractVariables(template);

      expect(result).toEqual(["name"]);
    });

    it("should extract multiple variables from mustache template", () => {
      const template = "{{greeting}} {{name}}, you have {{count}} messages.";
      const result = extractVariables(template);

      expect(result).toEqual(["greeting", "name", "count"]);
    });

    it("should return empty array when no variables present", () => {
      const template = "This is a plain text string";
      const result = extractVariables(template);

      expect(result).toEqual([]);
    });

    it("should ignore invalid variable names", () => {
      const template = "{{valid}} {{_invalid}} {{123invalid}} {{in-valid}}";
      const result = extractVariables(template);

      expect(result).toEqual(["valid"]);
    });

    it("should handle variables with underscores", () => {
      const template = "{{user_name}} {{user_age}}";
      const result = extractVariables(template);

      expect(result).toEqual(["user_name", "user_age"]);
    });

    it("should remove duplicate variables", () => {
      const template = "{{name}} {{age}} {{name}} {{name}}";
      const result = extractVariables(template);

      expect(result).toEqual(["name", "age"]);
    });

    it("should handle empty mustache brackets", () => {
      const template = "Hello {{}} world";
      const result = extractVariables(template);

      expect(result).toEqual([]);
    });

    it("should handle variables with spaces", () => {
      const template = "{{ name }} {{ age }}";
      const result = extractVariables(template);

      // Variables with spaces are not valid, so they should be filtered out
      expect(result).toEqual([]);
    });

    it("should handle nested brackets", () => {
      const template = "{{outer {{inner}}}}";
      const result = extractVariables(template);

      // This should extract based on the regex pattern
      // The MUSTACHE_REGEX would match {{outer {{inner}}
      const matches = Array.from(template.matchAll(MUSTACHE_REGEX));
      expect(matches.length).toBeGreaterThan(0);
    });

    it("should handle consecutive mustache variables", () => {
      const template = "{{first}}{{second}}{{third}}";
      const result = extractVariables(template);

      expect(result).toEqual(["first", "second", "third"]);
    });

    it("should handle variables at start and end", () => {
      const template = "{{start}} middle text {{end}}";
      const result = extractVariables(template);

      expect(result).toEqual(["start", "end"]);
    });

    it("should handle single letter variables", () => {
      const template = "{{a}} {{b}} {{c}}";
      const result = extractVariables(template);

      expect(result).toEqual(["a", "b", "c"]);
    });

    it("should handle mixed case variables", () => {
      const template = "{{userName}} {{UserName}} {{USERNAME}}";
      const result = extractVariables(template);

      expect(result).toEqual(["userName", "UserName", "USERNAME"]);
    });

    it("should handle empty string", () => {
      const template = "";
      const result = extractVariables(template);

      expect(result).toEqual([]);
    });

    it("should filter out variables with numbers", () => {
      const template = "{{var1}} {{var2}} {{validVar}}";
      const result = extractVariables(template);

      // Variables with numbers are invalid according to VARIABLE_REGEX
      expect(result).toEqual(["validVar"]);
    });

    it("should handle complex template", () => {
      const template = `
        Dear {{firstName}} {{lastName}},
        
        Your account {{accountId}} has been updated.
        
        Best regards,
        {{companyName}}
      `;
      const result = extractVariables(template);

      expect(result).toEqual([
        "firstName",
        "lastName",
        "accountId",
        "companyName",
      ]);
    });
  });

  describe("stringifyValue", () => {
    it("should return string values as-is", () => {
      expect(stringifyValue("hello")).toBe("hello");
      expect(stringifyValue("")).toBe("");
      expect(stringifyValue("123")).toBe("123");
    });

    it("should convert numbers to strings", () => {
      expect(stringifyValue(123)).toBe("123");
      expect(stringifyValue(0)).toBe("0");
      expect(stringifyValue(-456)).toBe("-456");
      expect(stringifyValue(3.14)).toBe("3.14");
    });

    it("should convert booleans to strings", () => {
      expect(stringifyValue(true)).toBe("true");
      expect(stringifyValue(false)).toBe("false");
    });

    it("should JSON.stringify objects", () => {
      const obj = { key: "value", nested: { inner: 123 } };
      expect(stringifyValue(obj)).toBe(JSON.stringify(obj));
    });

    it("should JSON.stringify arrays", () => {
      const arr = [1, 2, 3, "four"];
      expect(stringifyValue(arr)).toBe(JSON.stringify(arr));
    });

    it("should JSON.stringify null", () => {
      expect(stringifyValue(null)).toBe("null");
    });

    it("should JSON.stringify undefined", () => {
      expect(stringifyValue(undefined)).toBe(undefined);
    });

    it("should handle special number values", () => {
      expect(stringifyValue(Infinity)).toBe("null");
      expect(stringifyValue(-Infinity)).toBe("null");
      expect(stringifyValue(NaN)).toBe("null");
    });

    it("should handle empty object", () => {
      expect(stringifyValue({})).toBe("{}");
    });

    it("should handle empty array", () => {
      expect(stringifyValue([])).toBe("[]");
    });

    it("should handle complex nested structures", () => {
      const complex = {
        string: "text",
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        nested: {
          deep: "value",
        },
      };
      expect(stringifyValue(complex)).toBe(JSON.stringify(complex));
    });

    it("should handle Date objects", () => {
      const date = new Date("2023-01-01T00:00:00.000Z");
      expect(stringifyValue(date)).toBe(JSON.stringify(date));
    });

    it("should handle functions", () => {
      const fn = () => "test";
      // Functions are not JSON-serializable
      expect(stringifyValue(fn)).toBe(undefined);
    });

    it("should handle symbols", () => {
      const sym = Symbol("test");
      // Symbols are not JSON-serializable
      expect(stringifyValue(sym)).toBe(undefined);
    });

    it("should handle bigint", () => {
      const big = BigInt(123);
      // BigInt will throw error in JSON.stringify
      expect(() => stringifyValue(big)).toThrow();
    });

    it("should handle circular references gracefully", () => {
      const circular: any = { name: "test" };
      circular.self = circular;
      
      // Circular references throw error in JSON.stringify
      expect(() => stringifyValue(circular)).toThrow();
    });
  });
});
