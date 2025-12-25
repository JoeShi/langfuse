import { describe, it, expect } from "vitest";
import { removeEmptyEnvVariables } from "../environment";

describe("environment utilities", () => {
  describe("removeEmptyEnvVariables", () => {
    it("should remove empty string values", () => {
      const input = {
        VAR1: "value1",
        VAR2: "",
        VAR3: "value3",
      };
      const result = removeEmptyEnvVariables(input);
      expect(result).toEqual({
        VAR1: "value1",
        VAR3: "value3",
      });
      expect(result).not.toHaveProperty("VAR2");
    });

    it("should preserve non-empty values", () => {
      const input = {
        VAR1: "value1",
        VAR2: "value2",
        VAR3: "value3",
      };
      const result = removeEmptyEnvVariables(input);
      expect(result).toEqual(input);
    });

    it("should handle all empty values", () => {
      const input = {
        VAR1: "",
        VAR2: "",
        VAR3: "",
      };
      const result = removeEmptyEnvVariables(input);
      expect(result).toEqual({});
    });

    it("should handle empty object", () => {
      const input = {};
      const result = removeEmptyEnvVariables(input);
      expect(result).toEqual({});
    });

    it("should preserve null values", () => {
      const input = {
        VAR1: "value1",
        VAR2: null,
        VAR3: "value3",
      };
      const result = removeEmptyEnvVariables(input);
      expect(result).toHaveProperty("VAR2");
      expect(result.VAR2).toBeNull();
    });

    it("should preserve undefined values", () => {
      const input = {
        VAR1: "value1",
        VAR2: undefined,
        VAR3: "value3",
      };
      const result = removeEmptyEnvVariables(input);
      expect(result).toHaveProperty("VAR2");
      expect(result.VAR2).toBeUndefined();
    });

    it("should preserve zero values", () => {
      const input = {
        VAR1: "value1",
        VAR2: 0,
        VAR3: "value3",
      };
      const result = removeEmptyEnvVariables(input);
      expect(result).toHaveProperty("VAR2");
      expect(result.VAR2).toBe(0);
    });

    it("should preserve false values", () => {
      const input = {
        VAR1: "value1",
        VAR2: false,
        VAR3: "value3",
      };
      const result = removeEmptyEnvVariables(input);
      expect(result).toHaveProperty("VAR2");
      expect(result.VAR2).toBe(false);
    });

    it("should handle mixed types", () => {
      const input = {
        STR: "string",
        NUM: 42,
        BOOL: true,
        NULL: null,
        UNDEF: undefined,
        EMPTY: "",
        ZERO: 0,
        FALSE: false,
      };
      const result = removeEmptyEnvVariables(input);
      expect(result).not.toHaveProperty("EMPTY");
      expect(result).toHaveProperty("STR");
      expect(result).toHaveProperty("NUM");
      expect(result).toHaveProperty("BOOL");
      expect(result).toHaveProperty("NULL");
      expect(result).toHaveProperty("UNDEF");
      expect(result).toHaveProperty("ZERO");
      expect(result).toHaveProperty("FALSE");
    });

    it("should mutate the input object", () => {
      const input = {
        VAR1: "value1",
        VAR2: "",
      };
      const result = removeEmptyEnvVariables(input);
      expect(result).toBe(input); // Should be the same object
      expect(input).not.toHaveProperty("VAR2");
    });

    it("should handle single empty variable", () => {
      const input = { EMPTY: "" };
      const result = removeEmptyEnvVariables(input);
      expect(result).toEqual({});
    });

    it("should handle single non-empty variable", () => {
      const input = { VAR: "value" };
      const result = removeEmptyEnvVariables(input);
      expect(result).toEqual({ VAR: "value" });
    });

    it("should handle objects with many variables", () => {
      const input = {
        VAR1: "val1",
        VAR2: "",
        VAR3: "val3",
        VAR4: "",
        VAR5: "val5",
        VAR6: "",
        VAR7: "val7",
      };
      const result = removeEmptyEnvVariables(input);
      expect(Object.keys(result)).toHaveLength(4);
      expect(result).toEqual({
        VAR1: "val1",
        VAR3: "val3",
        VAR5: "val5",
        VAR7: "val7",
      });
    });
  });
});
