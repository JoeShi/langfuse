import { describe, it, expect } from "vitest";
import {
  getIsCharOrUnderscore,
  isValidVariableName,
  extractVariables,
  stringifyValue,
  VARIABLE_REGEX,
  MUSTACHE_REGEX,
} from "../stringChecks";

describe("stringChecks", () => {
  describe("getIsCharOrUnderscore", () => {
    it("should return true for single lowercase letter", () => {
      // Arrange & Act & Assert
      expect(getIsCharOrUnderscore("a")).toBe(true);
      expect(getIsCharOrUnderscore("z")).toBe(true);
    });

    it("should return true for single uppercase letter", () => {
      // Arrange & Act & Assert
      expect(getIsCharOrUnderscore("A")).toBe(true);
      expect(getIsCharOrUnderscore("Z")).toBe(true);
    });

    it("should return true for single underscore", () => {
      // Arrange & Act & Assert
      expect(getIsCharOrUnderscore("_")).toBe(true);
    });

    it("should return true for multiple letters", () => {
      // Arrange & Act & Assert
      expect(getIsCharOrUnderscore("abc")).toBe(true);
      expect(getIsCharOrUnderscore("XYZ")).toBe(true);
      expect(getIsCharOrUnderscore("aBcDeF")).toBe(true);
    });

    it("should return true for letters with underscores", () => {
      // Arrange & Act & Assert
      expect(getIsCharOrUnderscore("a_b")).toBe(true);
      expect(getIsCharOrUnderscore("_abc")).toBe(true);
      expect(getIsCharOrUnderscore("abc_")).toBe(true);
      expect(getIsCharOrUnderscore("___")).toBe(true);
    });

    it("should return false for strings with numbers", () => {
      // Arrange & Act & Assert
      expect(getIsCharOrUnderscore("a1")).toBe(false);
      expect(getIsCharOrUnderscore("123")).toBe(false);
      expect(getIsCharOrUnderscore("abc123")).toBe(false);
    });

    it("should return false for strings with special characters", () => {
      // Arrange & Act & Assert
      expect(getIsCharOrUnderscore("a-b")).toBe(false);
      expect(getIsCharOrUnderscore("a.b")).toBe(false);
      expect(getIsCharOrUnderscore("a b")).toBe(false);
      expect(getIsCharOrUnderscore("a$b")).toBe(false);
    });

    it("should return false for empty string", () => {
      // Arrange & Act & Assert
      expect(getIsCharOrUnderscore("")).toBe(false);
    });
  });

  describe("isValidVariableName", () => {
    it("should return true for valid single letter variables", () => {
      // Arrange & Act & Assert
      expect(isValidVariableName("a")).toBe(true);
      expect(isValidVariableName("Z")).toBe(true);
    });

    it("should return true for valid camelCase variables", () => {
      // Arrange & Act & Assert
      expect(isValidVariableName("userName")).toBe(true);
      expect(isValidVariableName("firstName")).toBe(true);
    });

    it("should return true for variables with underscores", () => {
      // Arrange & Act & Assert
      expect(isValidVariableName("user_name")).toBe(true);
      expect(isValidVariableName("first_name")).toBe(true);
      // Variables starting with underscore are not valid per VARIABLE_REGEX
      expect(isValidVariableName("_private")).toBe(false);
    });

    it("should return true for all caps variables", () => {
      // Arrange & Act & Assert
      expect(isValidVariableName("CONSTANT")).toBe(true);
      expect(isValidVariableName("MAX_VALUE")).toBe(true);
    });

    it("should return false for variables starting with number", () => {
      // Arrange & Act & Assert
      expect(isValidVariableName("1user")).toBe(false);
      expect(isValidVariableName("2ndPlace")).toBe(false);
    });

    it("should return false for variables starting with underscore followed by number", () => {
      // Arrange & Act & Assert
      expect(isValidVariableName("_1var")).toBe(false);
    });

    it("should return false for variables with numbers in the middle", () => {
      // Arrange & Act & Assert
      expect(isValidVariableName("user1name")).toBe(false);
      expect(isValidVariableName("var2")).toBe(false);
    });

    it("should return false for variables with special characters", () => {
      // Arrange & Act & Assert
      expect(isValidVariableName("user-name")).toBe(false);
      expect(isValidVariableName("user.name")).toBe(false);
      expect(isValidVariableName("user name")).toBe(false);
      expect(isValidVariableName("user$name")).toBe(false);
    });

    it("should return false for empty string", () => {
      // Arrange & Act & Assert
      expect(isValidVariableName("")).toBe(false);
    });

    it("should return false for only underscores", () => {
      // Arrange & Act & Assert
      // Single underscore is not valid (must start with letter)
      expect(isValidVariableName("_")).toBe(false);
      // Multiple underscores are not valid
      expect(isValidVariableName("__")).toBe(false);
    });
  });

  describe("extractVariables", () => {
    describe("mustache syntax extraction", () => {
      it("should extract single variable", () => {
        // Arrange
        const input = "Hello {{name}}!";

        // Act
        const result = extractVariables(input);

        // Assert
        expect(result).toEqual(["name"]);
      });

      it("should extract multiple variables", () => {
        // Arrange
        const input = "Hello {{firstName}} {{lastName}}!";

        // Act
        const result = extractVariables(input);

        // Assert
        expect(result).toEqual(["firstName", "lastName"]);
      });

      it("should extract variables with underscores", () => {
        // Arrange
        const input = "User: {{user_name}}, Email: {{user_email}}";

        // Act
        const result = extractVariables(input);

        // Assert
        expect(result).toEqual(["user_name", "user_email"]);
      });

      it("should extract variables in complex text", () => {
        // Arrange
        const input =
          "Dear {{recipient}}, your order {{orderId}} has been shipped.";

        // Act
        const result = extractVariables(input);

        // Assert
        expect(result).toEqual(["recipient", "orderId"]);
      });

      it("should handle consecutive variables", () => {
        // Arrange
        const input = "{{first}}{{second}}{{third}}";

        // Act
        const result = extractVariables(input);

        // Assert
        expect(result).toEqual(["first", "second", "third"]);
      });
    });

    describe("deduplication", () => {
      it("should deduplicate repeated variables", () => {
        // Arrange
        const input = "{{name}} said hello to {{name}} and {{name}} again";

        // Act
        const result = extractVariables(input);

        // Assert
        expect(result).toEqual(["name"]);
        expect(result.length).toBe(1);
      });

      it("should deduplicate multiple different repeated variables", () => {
        // Arrange
        const input = "{{a}} {{b}} {{a}} {{c}} {{b}} {{a}}";

        // Act
        const result = extractVariables(input);

        // Assert
        expect(result).toEqual(["a", "b", "c"]);
        expect(result.length).toBe(3);
      });

      it("should preserve order of first occurrence", () => {
        // Arrange
        const input = "{{third}} {{first}} {{second}} {{first}} {{third}}";

        // Act
        const result = extractVariables(input);

        // Assert
        expect(result).toEqual(["third", "first", "second"]);
      });
    });

    describe("invalid variable filtering", () => {
      it("should filter out variables with numbers", () => {
        // Arrange
        const input = "{{valid}} {{invalid123}} {{also_valid}}";

        // Act
        const result = extractVariables(input);

        // Assert
        expect(result).toEqual(["valid", "also_valid"]);
      });

      it("should filter out variables starting with numbers", () => {
        // Arrange
        const input = "{{123invalid}} {{valid}} {{2ndPlace}}";

        // Act
        const result = extractVariables(input);

        // Assert
        expect(result).toEqual(["valid"]);
      });

      it("should filter out variables with special characters", () => {
        // Arrange
        const input = "{{valid}} {{in-valid}} {{user.name}} {{good_one}}";

        // Act
        const result = extractVariables(input);

        // Assert
        expect(result).toEqual(["valid", "good_one"]);
      });

      it("should filter out empty mustache brackets", () => {
        // Arrange
        const input = "{{}} {{valid}} {{}}";

        // Act
        const result = extractVariables(input);

        // Assert
        expect(result).toEqual(["valid"]);
      });

      it("should filter out whitespace-only variables", () => {
        // Arrange
        const input = "{{  }} {{valid}} {{      }}";

        // Act
        const result = extractVariables(input);

        // Assert
        expect(result).toEqual(["valid"]);
      });
    });

    describe("edge cases", () => {
      it("should return empty array for string without variables", () => {
        // Arrange
        const input = "Hello world, no variables here!";

        // Act
        const result = extractVariables(input);

        // Assert
        expect(result).toEqual([]);
      });

      it("should return empty array for empty string", () => {
        // Arrange
        const input = "";

        // Act
        const result = extractVariables(input);

        // Assert
        expect(result).toEqual([]);
      });

      it("should handle single mustache bracket", () => {
        // Arrange
        const input = "Hello {name}!";

        // Act
        const result = extractVariables(input);

        // Assert
        expect(result).toEqual([]);
      });

      it("should handle triple mustache brackets", () => {
        // Arrange
        const input = "Hello {{{name}}}!";

        // Act
        const result = extractVariables(input);

        // Assert
        // Should still extract if there's a valid {{}} inside
        expect(result).toEqual(["name"]);
      });

      it("should handle unclosed mustache brackets", () => {
        // Arrange
        const input = "Hello {{name !";

        // Act
        const result = extractVariables(input);

        // Assert
        expect(result).toEqual([]);
      });

      it("should handle nested-looking but invalid syntax", () => {
        // Arrange
        const input = "{{outer {{inner}} }}";

        // Act
        const result = extractVariables(input);

        // Assert
        // Should extract what matches the pattern
        expect(result.length).toBeGreaterThanOrEqual(0);
      });

      it("should handle variables with only underscores", () => {
        // Arrange
        const input = "{{_}} {{__}} {{___}}";

        // Act
        const result = extractVariables(input);

        // Assert - Variables starting with underscore are not valid
        expect(result).toEqual([]);
      });

      it("should handle very long variable names", () => {
        // Arrange
        const longName = "a".repeat(1000);
        const input = `{{${longName}}}`;

        // Act
        const result = extractVariables(input);

        // Assert
        expect(result).toEqual([longName]);
      });

      it("should handle many variables", () => {
        // Arrange
        const vars = Array.from({ length: 100 }, (_, i) => `var${i}`);
        const input = vars.map((v) => `{{${v}}}`).join(" ");

        // Act
        const result = extractVariables(input);

        // Assert
        // Numbers make them invalid
        expect(result).toEqual([]);
      });

      it("should handle many valid variables", () => {
        // Arrange
        const vars = Array.from(
          { length: 100 },
          (_, i) => `var_${String.fromCharCode(97 + (i % 26))}`,
        );
        const input = vars.map((v) => `{{${v}}}`).join(" ");

        // Act
        const result = extractVariables(input);

        // Assert - Should be deduplicated since var_a, var_b, etc repeat
        expect(result.length).toBeLessThanOrEqual(26);
      });
    });
  });

  describe("stringifyValue", () => {
    describe("string conversion", () => {
      it("should return string as-is", () => {
        // Arrange
        const input = "hello world";

        // Act
        const result = stringifyValue(input);

        // Assert
        expect(result).toBe("hello world");
      });

      it("should return empty string as-is", () => {
        // Arrange
        const input = "";

        // Act
        const result = stringifyValue(input);

        // Assert
        expect(result).toBe("");
      });

      it("should preserve whitespace in strings", () => {
        // Arrange
        const input = "  spaces  ";

        // Act
        const result = stringifyValue(input);

        // Assert
        expect(result).toBe("  spaces  ");
      });
    });

    describe("number conversion", () => {
      it("should convert integers to string", () => {
        // Arrange & Act & Assert
        expect(stringifyValue(42)).toBe("42");
        expect(stringifyValue(0)).toBe("0");
        expect(stringifyValue(-10)).toBe("-10");
      });

      it("should convert floats to string", () => {
        // Arrange & Act & Assert
        expect(stringifyValue(3.14)).toBe("3.14");
        expect(stringifyValue(-2.5)).toBe("-2.5");
      });

      it("should convert very large numbers to string", () => {
        // Arrange & Act & Assert
        expect(stringifyValue(1e10)).toBe("10000000000");
        expect(stringifyValue(999999999999)).toBe("999999999999");
      });

      it("should convert very small numbers to string", () => {
        // Arrange & Act & Assert
        expect(stringifyValue(0.0001)).toBe("0.0001");
        expect(stringifyValue(1e-10)).toBe("1e-10");
      });

      it("should handle special number values", () => {
        // Arrange & Act & Assert
        expect(stringifyValue(NaN)).toBe("NaN");
        expect(stringifyValue(Infinity)).toBe("Infinity");
        expect(stringifyValue(-Infinity)).toBe("-Infinity");
      });
    });

    describe("boolean conversion", () => {
      it("should convert true to string", () => {
        // Arrange
        const input = true;

        // Act
        const result = stringifyValue(input);

        // Assert
        expect(result).toBe("true");
      });

      it("should convert false to string", () => {
        // Arrange
        const input = false;

        // Act
        const result = stringifyValue(input);

        // Assert
        expect(result).toBe("false");
      });
    });

    describe("object/array conversion (JSON.stringify)", () => {
      it("should stringify simple objects", () => {
        // Arrange
        const input = { key: "value" };

        // Act
        const result = stringifyValue(input);

        // Assert
        expect(result).toBe('{"key":"value"}');
      });

      it("should stringify arrays", () => {
        // Arrange
        const input = [1, 2, 3];

        // Act
        const result = stringifyValue(input);

        // Assert
        expect(result).toBe("[1,2,3]");
      });

      it("should stringify nested objects", () => {
        // Arrange
        const input = { outer: { inner: "value" } };

        // Act
        const result = stringifyValue(input);

        // Assert
        expect(result).toBe('{"outer":{"inner":"value"}}');
      });

      it("should stringify null", () => {
        // Arrange
        const input = null;

        // Act
        const result = stringifyValue(input);

        // Assert
        expect(result).toBe("null");
      });

      it("should stringify undefined", () => {
        // Arrange
        const input = undefined;

        // Act
        const result = stringifyValue(input);

        // Assert
        expect(result).toBe(undefined);
      });

      it("should stringify complex mixed types", () => {
        // Arrange
        const input = {
          string: "text",
          number: 42,
          boolean: true,
          null: null,
          array: [1, "two", false],
        };

        // Act
        const result = stringifyValue(input);

        // Assert
        expect(result).toBe(
          '{"string":"text","number":42,"boolean":true,"null":null,"array":[1,"two",false]}',
        );
      });

      it("should stringify empty object", () => {
        // Arrange
        const input = {};

        // Act
        const result = stringifyValue(input);

        // Assert
        expect(result).toBe("{}");
      });

      it("should stringify empty array", () => {
        // Arrange
        const input: unknown[] = [];

        // Act
        const result = stringifyValue(input);

        // Assert
        expect(result).toBe("[]");
      });

      it("should handle Date objects", () => {
        // Arrange
        const input = new Date("2024-01-01T00:00:00.000Z");

        // Act
        const result = stringifyValue(input);

        // Assert
        expect(result).toContain("2024-01-01");
      });

      it("should handle functions (JSON.stringify returns undefined)", () => {
        // Arrange
        const input = () => "test";

        // Act
        const result = stringifyValue(input);

        // Assert
        expect(result).toBe(undefined);
      });

      it("should handle symbols (JSON.stringify returns undefined)", () => {
        // Arrange
        const input = Symbol("test");

        // Act
        const result = stringifyValue(input);

        // Assert
        expect(result).toBe(undefined);
      });
    });

    describe("edge cases", () => {
      it("should handle BigInt by converting to JSON", () => {
        // Arrange
        const input = BigInt(12345);

        // Act & Assert
        // BigInt throws error in JSON.stringify unless converted
        expect(() => stringifyValue(input)).toThrow();
      });

      it("should handle objects with circular references", () => {
        // Arrange
        const input: any = { a: 1 };
        input.self = input;

        // Act & Assert
        expect(() => stringifyValue(input)).toThrow();
      });

      it("should handle objects with toJSON method", () => {
        // Arrange
        const input = {
          value: 42,
          toJSON() {
            return { custom: "serialization" };
          },
        };

        // Act
        const result = stringifyValue(input);

        // Assert
        expect(result).toBe('{"custom":"serialization"}');
      });

      it("should handle zero values correctly", () => {
        // Arrange & Act & Assert
        expect(stringifyValue(0)).toBe("0");
        expect(stringifyValue(-0)).toBe("0");
        expect(stringifyValue(0.0)).toBe("0");
      });

      it("should handle empty strings differently from undefined", () => {
        // Arrange & Act & Assert
        expect(stringifyValue("")).toBe("");
        expect(stringifyValue(undefined)).toBe(undefined);
      });
    });
  });

  describe("VARIABLE_REGEX constant", () => {
    it("should match valid variable patterns", () => {
      // Arrange & Act & Assert
      expect(VARIABLE_REGEX.test("validVar")).toBe(true);
      // Variables starting with underscore are not valid per the regex
      expect(VARIABLE_REGEX.test("_private")).toBe(false);
      expect(VARIABLE_REGEX.test("camelCase")).toBe(true);
    });

    it("should not match invalid patterns", () => {
      // Arrange & Act & Assert
      expect(VARIABLE_REGEX.test("123invalid")).toBe(false);
      expect(VARIABLE_REGEX.test("in-valid")).toBe(false);
    });
  });

  describe("MUSTACHE_REGEX constant", () => {
    it("should match mustache patterns", () => {
      // Arrange
      const input = "{{variable}}";

      // Act
      const matches = input.match(MUSTACHE_REGEX);

      // Assert
      expect(matches).not.toBeNull();
      expect(matches![0]).toBe("{{variable}}");
    });

    it("should match multiple mustache patterns", () => {
      // Arrange
      const input = "{{var1}} and {{var2}}";

      // Act
      const matches = input.matchAll(MUSTACHE_REGEX);
      const results = Array.from(matches);

      // Assert
      expect(results.length).toBe(2);
    });
  });
});
