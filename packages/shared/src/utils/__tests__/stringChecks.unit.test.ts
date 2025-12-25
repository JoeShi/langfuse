import { expect, describe, it } from "vitest";
import {
  getIsCharOrUnderscore,
  isValidVariableName,
  extractVariables,
  stringifyValue,
} from "../stringChecks";

describe("getIsCharOrUnderscore", () => {
  describe("valid character/underscore strings", () => {
    it("should return true for single letter", () => {
      expect(getIsCharOrUnderscore("a")).toBe(true);
      expect(getIsCharOrUnderscore("Z")).toBe(true);
    });

    it("should return true for multiple letters", () => {
      expect(getIsCharOrUnderscore("abc")).toBe(true);
      expect(getIsCharOrUnderscore("XYZ")).toBe(true);
      expect(getIsCharOrUnderscore("AbCdEf")).toBe(true);
    });

    it("should return true for underscore", () => {
      expect(getIsCharOrUnderscore("_")).toBe(true);
    });

    it("should return true for letters and underscores", () => {
      expect(getIsCharOrUnderscore("var_name")).toBe(true);
      expect(getIsCharOrUnderscore("_private")).toBe(true);
      expect(getIsCharOrUnderscore("CONSTANT_VALUE")).toBe(true);
    });

    it("should return true for all underscores", () => {
      expect(getIsCharOrUnderscore("___")).toBe(true);
    });
  });

  describe("invalid strings", () => {
    it("should return false for strings with numbers", () => {
      expect(getIsCharOrUnderscore("abc123")).toBe(false);
      expect(getIsCharOrUnderscore("1abc")).toBe(false);
      expect(getIsCharOrUnderscore("a1b2c3")).toBe(false);
    });

    it("should return false for strings with spaces", () => {
      expect(getIsCharOrUnderscore("hello world")).toBe(false);
      expect(getIsCharOrUnderscore("a b")).toBe(false);
    });

    it("should return false for strings with special characters", () => {
      expect(getIsCharOrUnderscore("hello-world")).toBe(false);
      expect(getIsCharOrUnderscore("hello.world")).toBe(false);
      expect(getIsCharOrUnderscore("hello@world")).toBe(false);
      expect(getIsCharOrUnderscore("hello!")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(getIsCharOrUnderscore("")).toBe(false);
    });

    it("should return false for string with only numbers", () => {
      expect(getIsCharOrUnderscore("123")).toBe(false);
    });
  });
});

describe("isValidVariableName", () => {
  describe("valid variable names", () => {
    it("should return true for single letter", () => {
      expect(isValidVariableName("a")).toBe(true);
      expect(isValidVariableName("Z")).toBe(true);
    });

    it("should return true for names starting with letter", () => {
      expect(isValidVariableName("variable")).toBe(true);
      expect(isValidVariableName("myVar")).toBe(true);
      expect(isValidVariableName("Variable")).toBe(true);
    });

    it("should return true for names with underscores", () => {
      expect(isValidVariableName("my_variable")).toBe(true);
      expect(isValidVariableName("var_name_here")).toBe(true);
      expect(isValidVariableName("a_")).toBe(true);
    });

    it("should return true for names with trailing underscores", () => {
      expect(isValidVariableName("variable_")).toBe(true);
      expect(isValidVariableName("var__")).toBe(true);
    });

    it("should return true for mixed case", () => {
      expect(isValidVariableName("myVariable")).toBe(true);
      expect(isValidVariableName("MyVariable")).toBe(true);
    });
  });

  describe("invalid variable names", () => {
    it("should return false for names starting with underscore", () => {
      expect(isValidVariableName("_variable")).toBe(false);
      expect(isValidVariableName("__private")).toBe(false);
    });

    it("should return false for names starting with number", () => {
      expect(isValidVariableName("1variable")).toBe(false);
      expect(isValidVariableName("123abc")).toBe(false);
    });

    it("should return false for names with numbers", () => {
      expect(isValidVariableName("var123")).toBe(false);
      expect(isValidVariableName("my2var")).toBe(false);
    });

    it("should return false for names with special characters", () => {
      expect(isValidVariableName("my-var")).toBe(false);
      expect(isValidVariableName("my.var")).toBe(false);
      expect(isValidVariableName("my var")).toBe(false);
      expect(isValidVariableName("my@var")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isValidVariableName("")).toBe(false);
    });

    it("should return false for only underscores", () => {
      expect(isValidVariableName("_")).toBe(false);
      expect(isValidVariableName("__")).toBe(false);
    });
  });
});

describe("extractVariables", () => {
  describe("extracting mustache variables", () => {
    it("should extract single variable", () => {
      const result = extractVariables("Hello {{name}}");
      expect(result).toEqual(["name"]);
    });

    it("should extract multiple variables", () => {
      const result = extractVariables("{{firstName}} {{lastName}}");
      expect(result).toEqual(["firstName", "lastName"]);
    });

    it("should extract variables from longer text", () => {
      const result = extractVariables(
        "Welcome {{username}}, your score is {{score}}"
      );
      expect(result).toEqual(["username", "score"]);
    });

    it("should remove duplicate variables", () => {
      const result = extractVariables("{{name}} and {{name}} again");
      expect(result).toEqual(["name"]);
    });

    it("should preserve unique variables order", () => {
      const result = extractVariables("{{a}} {{b}} {{c}} {{b}} {{a}}");
      expect(result).toEqual(["a", "b", "c"]);
    });
  });

  describe("filtering invalid variable names", () => {
    it("should filter variables starting with underscore", () => {
      const result = extractVariables("{{_private}} {{valid}}");
      expect(result).toEqual(["valid"]);
    });

    it("should filter variables with numbers", () => {
      const result = extractVariables("{{var123}} {{validVar}}");
      expect(result).toEqual(["validVar"]);
    });

    it("should filter variables starting with numbers", () => {
      const result = extractVariables("{{1invalid}} {{valid}}");
      expect(result).toEqual(["valid"]);
    });

    it("should filter variables with special characters", () => {
      const result = extractVariables("{{my-var}} {{my_var}}");
      expect(result).toEqual(["my_var"]);
    });

    it("should filter empty variables", () => {
      const result = extractVariables("{{}} {{valid}}");
      expect(result).toEqual(["valid"]);
    });

    it("should filter variables with spaces", () => {
      const result = extractVariables("{{my var}} {{myvar}}");
      expect(result).toEqual(["myvar"]);
    });
  });

  describe("handling messages without placeholders", () => {
    it("should return empty array for text without variables", () => {
      const result = extractVariables("Hello world");
      expect(result).toEqual([]);
    });

    it("should return empty array for empty string", () => {
      const result = extractVariables("");
      expect(result).toEqual([]);
    });

    it("should return empty array for incomplete mustache syntax", () => {
      const result = extractVariables("{{incomplete");
      expect(result).toEqual([]);
    });

    it("should return empty array for single braces", () => {
      const result = extractVariables("{single}");
      expect(result).toEqual([]);
    });
  });

  describe("edge cases", () => {
    it("should handle nested braces", () => {
      const result = extractVariables("{{var}}{{another}}");
      expect(result).toEqual(["var", "another"]);
    });

    it("should handle variables with underscores (not at start)", () => {
      const result = extractVariables("{{my_variable}}");
      expect(result).toEqual(["my_variable"]);
    });

    it("should handle mixed valid and invalid variables", () => {
      const result = extractVariables(
        "{{valid}} {{123invalid}} {{also_valid}} {{in-valid}}"
      );
      expect(result).toEqual(["valid", "also_valid"]);
    });

    it("should handle multiple mustache braces", () => {
      const result = extractVariables("{{{variable}}}");
      expect(result).toEqual(["variable"]);
    });

    it("should handle text with only invalid variables", () => {
      const result = extractVariables("{{123}} {{_private}} {{my-var}}");
      expect(result).toEqual([]);
    });
  });
});

describe("stringifyValue", () => {
  describe("string values", () => {
    it("should return string as-is", () => {
      expect(stringifyValue("hello")).toBe("hello");
      expect(stringifyValue("world")).toBe("world");
    });

    it("should return empty string as-is", () => {
      expect(stringifyValue("")).toBe("");
    });

    it("should return string with spaces as-is", () => {
      expect(stringifyValue("hello world")).toBe("hello world");
    });

    it("should return string with special characters as-is", () => {
      expect(stringifyValue("hello@world.com")).toBe("hello@world.com");
    });
  });

  describe("number values", () => {
    it("should convert integers to string", () => {
      expect(stringifyValue(123)).toBe("123");
      expect(stringifyValue(0)).toBe("0");
      expect(stringifyValue(-456)).toBe("-456");
    });

    it("should convert decimals to string", () => {
      expect(stringifyValue(3.14)).toBe("3.14");
      expect(stringifyValue(0.5)).toBe("0.5");
      expect(stringifyValue(-2.5)).toBe("-2.5");
    });

    it("should handle scientific notation", () => {
      expect(stringifyValue(1e10)).toBe("10000000000");
      expect(stringifyValue(1.5e-5)).toBe("0.000015");
    });

    it("should handle special numbers", () => {
      expect(stringifyValue(Infinity)).toBe("Infinity");
      expect(stringifyValue(-Infinity)).toBe("-Infinity");
      expect(stringifyValue(NaN)).toBe("NaN");
    });
  });

  describe("boolean values", () => {
    it("should convert true to string", () => {
      expect(stringifyValue(true)).toBe("true");
    });

    it("should convert false to string", () => {
      expect(stringifyValue(false)).toBe("false");
    });
  });

  describe("object and array values", () => {
    it("should JSON.stringify objects", () => {
      const obj = { key: "value" };
      expect(stringifyValue(obj)).toBe('{"key":"value"}');
    });

    it("should JSON.stringify arrays", () => {
      const arr = [1, 2, 3];
      expect(stringifyValue(arr)).toBe("[1,2,3]");
    });

    it("should JSON.stringify nested objects", () => {
      const obj = { outer: { inner: "value" } };
      expect(stringifyValue(obj)).toBe('{"outer":{"inner":"value"}}');
    });

    it("should JSON.stringify empty object", () => {
      expect(stringifyValue({})).toBe("{}");
    });

    it("should JSON.stringify empty array", () => {
      expect(stringifyValue([])).toBe("[]");
    });
  });

  describe("null and undefined values", () => {
    it("should JSON.stringify null", () => {
      expect(stringifyValue(null)).toBe("null");
    });

    it("should JSON.stringify undefined", () => {
      expect(stringifyValue(undefined)).toBe(undefined);
    });
  });

  describe("edge cases", () => {
    it("should handle Date objects", () => {
      const date = new Date("2024-01-01T00:00:00.000Z");
      const result = stringifyValue(date);
      expect(result).toContain("2024");
    });

    it("should handle arrays with mixed types", () => {
      const arr = [1, "two", true, null];
      expect(stringifyValue(arr)).toBe('[1,"two",true,null]');
    });

    it("should handle objects with null values", () => {
      const obj = { key: null };
      expect(stringifyValue(obj)).toBe('{"key":null}');
    });

    it("should handle objects with undefined values", () => {
      const obj = { key: undefined };
      expect(stringifyValue(obj)).toBe("{}");
    });

    it("should handle functions", () => {
      const fn = () => {};
      expect(stringifyValue(fn)).toBe(undefined);
    });

    it("should handle symbols", () => {
      const sym = Symbol("test");
      expect(stringifyValue(sym)).toBe(undefined);
    });

    it("should handle BigInt", () => {
      const big = BigInt(123);
      expect(() => stringifyValue(big)).toThrow();
    });
  });
});
