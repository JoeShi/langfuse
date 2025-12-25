import { describe, it, expect } from "vitest";
import { removeEmptyEnvVariables } from "../environment";

describe("environment.ts", () => {
  describe("removeEmptyEnvVariables", () => {
    it("should remove empty string values from object", () => {
      const input = {
        VAR1: "value1",
        VAR2: "",
        VAR3: "value3",
        VAR4: "",
      };
      const result = removeEmptyEnvVariables(input);

      expect(result).toEqual({
        VAR1: "value1",
        VAR3: "value3",
      });
      expect(result).not.toHaveProperty("VAR2");
      expect(result).not.toHaveProperty("VAR4");
    });

    it("should keep non-empty values unchanged", () => {
      const input = {
        STRING: "hello",
        NUMBER: 123,
        BOOLEAN: true,
        NULL: null,
        ZERO: 0,
        FALSE: false,
      };
      const result = removeEmptyEnvVariables(input);

      expect(result).toEqual({
        STRING: "hello",
        NUMBER: 123,
        BOOLEAN: true,
        NULL: null,
        ZERO: 0,
        FALSE: false,
      });
    });

    it("should handle object with all empty strings", () => {
      const input = {
        VAR1: "",
        VAR2: "",
        VAR3: "",
      };
      const result = removeEmptyEnvVariables(input);

      expect(result).toEqual({});
    });

    it("should handle object with no empty strings", () => {
      const input = {
        VAR1: "value1",
        VAR2: "value2",
        VAR3: "value3",
      };
      const result = removeEmptyEnvVariables(input);

      expect(result).toEqual({
        VAR1: "value1",
        VAR2: "value2",
        VAR3: "value3",
      });
    });

    it("should handle empty object", () => {
      const input = {};
      const result = removeEmptyEnvVariables(input);

      expect(result).toEqual({});
    });

    it("should handle undefined values differently from empty strings", () => {
      const input = {
        EMPTY_STRING: "",
        UNDEFINED: undefined,
        DEFINED: "value",
      };
      const result = removeEmptyEnvVariables(input);

      expect(result).toHaveProperty("UNDEFINED");
      expect(result.UNDEFINED).toBeUndefined();
      expect(result).not.toHaveProperty("EMPTY_STRING");
      expect(result.DEFINED).toBe("value");
    });

    it("should handle null values differently from empty strings", () => {
      const input = {
        EMPTY_STRING: "",
        NULL: null,
        DEFINED: "value",
      };
      const result = removeEmptyEnvVariables(input);

      expect(result).toHaveProperty("NULL");
      expect(result.NULL).toBeNull();
      expect(result).not.toHaveProperty("EMPTY_STRING");
      expect(result.DEFINED).toBe("value");
    });

    it("should mutate the original object and return it", () => {
      const input = {
        VAR1: "value1",
        VAR2: "",
      };
      const result = removeEmptyEnvVariables(input);

      // Should be the same reference
      expect(result).toBe(input);
      expect(input).not.toHaveProperty("VAR2");
    });

    it("should handle objects with special characters in keys", () => {
      const input = {
        "VAR-WITH-DASHES": "value1",
        "VAR_WITH_UNDERSCORES": "",
        "VAR.WITH.DOTS": "value3",
      };
      const result = removeEmptyEnvVariables(input);

      expect(result).toEqual({
        "VAR-WITH-DASHES": "value1",
        "VAR.WITH.DOTS": "value3",
      });
    });

    it("should handle objects with numeric keys", () => {
      const input = {
        "0": "value0",
        "1": "",
        "2": "value2",
      };
      const result = removeEmptyEnvVariables(input);

      expect(result).toEqual({
        "0": "value0",
        "2": "value2",
      });
    });
  });
});
