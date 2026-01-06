import { describe, it, expect } from "vitest";
import { removeEmptyEnvVariables } from "../environment";

describe("removeEmptyEnvVariables", () => {
  describe("empty string removal", () => {
    it("should remove keys with empty string values", () => {
      // Arrange
      const env = {
        KEY1: "value1",
        KEY2: "",
        KEY3: "value3",
      };

      // Act
      const result = removeEmptyEnvVariables(env);

      // Assert
      expect(result).toEqual({
        KEY1: "value1",
        KEY3: "value3",
      });
      expect(result.KEY2).toBeUndefined();
    });

    it("should remove all keys when all values are empty strings", () => {
      // Arrange
      const env = {
        KEY1: "",
        KEY2: "",
        KEY3: "",
      };

      // Act
      const result = removeEmptyEnvVariables(env);

      // Assert
      expect(result).toEqual({});
      expect(Object.keys(result).length).toBe(0);
    });

    it("should handle mixed empty and non-empty values", () => {
      // Arrange
      const env = {
        EMPTY1: "",
        VALID1: "value",
        EMPTY2: "",
        VALID2: "another",
        EMPTY3: "",
      };

      // Act
      const result = removeEmptyEnvVariables(env);

      // Assert
      expect(result).toEqual({
        VALID1: "value",
        VALID2: "another",
      });
      expect(Object.keys(result).length).toBe(2);
    });
  });

  describe("non-empty value preservation", () => {
    it("should preserve keys with non-empty string values", () => {
      // Arrange
      const env = {
        KEY1: "value1",
        KEY2: "value2",
        KEY3: "value3",
      };

      // Act
      const result = removeEmptyEnvVariables(env);

      // Assert
      expect(result).toEqual(env);
      expect(Object.keys(result).length).toBe(3);
    });

    it("should preserve whitespace-only strings", () => {
      // Arrange
      const env = {
        KEY1: " ",
        KEY2: "  ",
        KEY3: "\t",
        KEY4: "\n",
      };

      // Act
      const result = removeEmptyEnvVariables(env);

      // Assert
      expect(result).toEqual(env);
      expect(result.KEY1).toBe(" ");
      expect(result.KEY2).toBe("  ");
      expect(result.KEY3).toBe("\t");
      expect(result.KEY4).toBe("\n");
    });

    it("should preserve special characters and symbols", () => {
      // Arrange
      const env = {
        KEY1: "!@#$%^&*()",
        KEY2: "hello-world_123",
        KEY3: "path/to/file",
        KEY4: "https://example.com",
      };

      // Act
      const result = removeEmptyEnvVariables(env);

      // Assert
      expect(result).toEqual(env);
    });
  });

  describe("edge cases", () => {
    it("should handle empty object", () => {
      // Arrange
      const env = {};

      // Act
      const result = removeEmptyEnvVariables(env);

      // Assert
      expect(result).toEqual({});
    });

    it("should handle object with single empty string", () => {
      // Arrange
      const env = { SINGLE: "" };

      // Act
      const result = removeEmptyEnvVariables(env);

      // Assert
      expect(result).toEqual({});
    });

    it("should handle object with single non-empty value", () => {
      // Arrange
      const env = { SINGLE: "value" };

      // Act
      const result = removeEmptyEnvVariables(env);

      // Assert
      expect(result).toEqual({ SINGLE: "value" });
    });

    it("should mutate the original object and return it", () => {
      // Arrange
      const env = {
        KEY1: "value",
        KEY2: "",
      };

      // Act
      const result = removeEmptyEnvVariables(env);

      // Assert
      expect(result).toBe(env); // Same reference
      expect(env.KEY2).toBeUndefined();
    });

    it("should preserve numeric string values", () => {
      // Arrange
      const env = {
        PORT: "3000",
        ZERO: "0",
        EMPTY: "",
      };

      // Act
      const result = removeEmptyEnvVariables(env);

      // Assert
      expect(result).toEqual({
        PORT: "3000",
        ZERO: "0",
      });
    });

    it("should preserve boolean string values", () => {
      // Arrange
      const env = {
        ENABLED: "true",
        DISABLED: "false",
        EMPTY: "",
      };

      // Act
      const result = removeEmptyEnvVariables(env);

      // Assert
      expect(result).toEqual({
        ENABLED: "true",
        DISABLED: "false",
      });
    });

    it("should handle keys with underscores and numbers", () => {
      // Arrange
      const env = {
        API_KEY_1: "key1",
        API_KEY_2: "",
        DATABASE_URL_2: "url",
        __INTERNAL__: "value",
      };

      // Act
      const result = removeEmptyEnvVariables(env);

      // Assert
      expect(result).toEqual({
        API_KEY_1: "key1",
        DATABASE_URL_2: "url",
        __INTERNAL__: "value",
      });
    });

    it("should handle very long string values", () => {
      // Arrange
      const longString = "a".repeat(10000);
      const env = {
        LONG_KEY: longString,
        EMPTY_KEY: "",
      };

      // Act
      const result = removeEmptyEnvVariables(env);

      // Assert
      expect(result.LONG_KEY).toBe(longString);
      expect(result.EMPTY_KEY).toBeUndefined();
    });
  });
});
