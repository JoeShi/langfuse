import { expect, describe, it } from "vitest";
import { DatasetSchemaValidator } from "../DatasetSchemaValidator";

describe("DatasetSchemaValidator", () => {
  describe("initialization", () => {
    it("should create validator with both schemas", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: { type: "string" },
        expectedOutputSchema: { type: "number" },
      });
      expect(validator).toBeDefined();
    });

    it("should create validator with only input schema", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: { type: "string" },
        expectedOutputSchema: null,
      });
      expect(validator).toBeDefined();
    });

    it("should create validator with only output schema", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: null,
        expectedOutputSchema: { type: "number" },
      });
      expect(validator).toBeDefined();
    });

    it("should create validator with no schemas", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: null,
        expectedOutputSchema: null,
      });
      expect(validator).toBeDefined();
    });

    it("should create validator with undefined schemas", () => {
      const validator = new DatasetSchemaValidator({});
      expect(validator).toBeDefined();
    });
  });

  describe("validateInput", () => {
    it("should validate correct input data", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: { type: "string" },
      });
      const result = validator.validateInput("hello");
      expect(result.isValid).toBe(true);
    });

    it("should return errors for invalid input data", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: { type: "string" },
      });
      const result = validator.validateInput(123);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errors).toBeDefined();
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it("should always return valid when no input schema provided", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: null,
      });
      const result = validator.validateInput("anything");
      expect(result.isValid).toBe(true);
    });

    it("should validate complex input schema", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "number" },
          },
          required: ["name", "age"],
        },
      });
      const result = validator.validateInput({ name: "John", age: 30 });
      expect(result.isValid).toBe(true);
    });

    it("should return errors for missing required fields", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "number" },
          },
          required: ["name", "age"],
        },
      });
      const result = validator.validateInput({ name: "John" });
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe("validateOutput", () => {
    it("should validate correct output data", () => {
      const validator = new DatasetSchemaValidator({
        expectedOutputSchema: { type: "number" },
      });
      const result = validator.validateOutput(42);
      expect(result.isValid).toBe(true);
    });

    it("should return errors for invalid output data", () => {
      const validator = new DatasetSchemaValidator({
        expectedOutputSchema: { type: "number" },
      });
      const result = validator.validateOutput("not a number");
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errors).toBeDefined();
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it("should always return valid when no output schema provided", () => {
      const validator = new DatasetSchemaValidator({
        expectedOutputSchema: null,
      });
      const result = validator.validateOutput("anything");
      expect(result.isValid).toBe(true);
    });

    it("should validate complex output schema", () => {
      const validator = new DatasetSchemaValidator({
        expectedOutputSchema: {
          type: "object",
          properties: {
            result: { type: "string" },
            confidence: { type: "number" },
          },
          required: ["result"],
        },
      });
      const result = validator.validateOutput({ result: "success", confidence: 0.95 });
      expect(result.isValid).toBe(true);
    });
  });

  describe("validateItem", () => {
    it("should validate both input and output when both are valid", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: { type: "string" },
        expectedOutputSchema: { type: "number" },
      });
      const result = validator.validateItem({
        input: "hello",
        expectedOutput: 42,
      });
      expect(result.isValid).toBe(true);
    });

    it("should return input errors when input is invalid", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: { type: "string" },
        expectedOutputSchema: { type: "number" },
      });
      const result = validator.validateItem({
        input: 123,
        expectedOutput: 42,
      });
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.inputErrors).toBeDefined();
        expect(result.inputErrors!.length).toBeGreaterThan(0);
      }
    });

    it("should return output errors when output is invalid", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: { type: "string" },
        expectedOutputSchema: { type: "number" },
      });
      const result = validator.validateItem({
        input: "hello",
        expectedOutput: "not a number",
      });
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.expectedOutputErrors).toBeDefined();
        expect(result.expectedOutputErrors!.length).toBeGreaterThan(0);
      }
    });

    it("should return both input and output errors when both are invalid", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: { type: "string" },
        expectedOutputSchema: { type: "number" },
      });
      const result = validator.validateItem({
        input: 123,
        expectedOutput: "not a number",
      });
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.inputErrors).toBeDefined();
        expect(result.expectedOutputErrors).toBeDefined();
      }
    });

    it("should validate when no schemas are provided", () => {
      const validator = new DatasetSchemaValidator({});
      const result = validator.validateItem({
        input: "anything",
        expectedOutput: "anything else",
      });
      expect(result.isValid).toBe(true);
    });

    it("should validate only input when only input schema provided", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: { type: "string" },
      });
      const result = validator.validateItem({
        input: "hello",
        expectedOutput: 999, // No schema, so this is ignored
      });
      expect(result.isValid).toBe(true);
    });

    it("should validate only output when only output schema provided", () => {
      const validator = new DatasetSchemaValidator({
        expectedOutputSchema: { type: "number" },
      });
      const result = validator.validateItem({
        input: "anything", // No schema, so this is ignored
        expectedOutput: 42,
      });
      expect(result.isValid).toBe(true);
    });
  });

  describe("batch validation performance", () => {
    it("should efficiently validate multiple items", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: {
          type: "object",
          properties: {
            text: { type: "string" },
          },
          required: ["text"],
        },
        expectedOutputSchema: {
          type: "object",
          properties: {
            score: { type: "number" },
          },
          required: ["score"],
        },
      });

      const items = Array.from({ length: 100 }, (_, i) => ({
        input: { text: `input ${i}` },
        expectedOutput: { score: i * 0.01 },
      }));

      const results = items.map((item) => validator.validateItem(item));
      expect(results.every((r) => r.isValid)).toBe(true);
    });

    it("should detect errors in batch validation", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: { type: "string" },
        expectedOutputSchema: { type: "number" },
      });

      const items = [
        { input: "valid", expectedOutput: 1 },
        { input: 123, expectedOutput: 2 }, // Invalid input
        { input: "valid", expectedOutput: "invalid" }, // Invalid output
        { input: "valid", expectedOutput: 4 },
      ];

      const results = items.map((item) => validator.validateItem(item));
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(false);
      expect(results[2].isValid).toBe(false);
      expect(results[3].isValid).toBe(true);
    });
  });

  describe("complex schema scenarios", () => {
    it("should validate nested objects", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: {
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                name: { type: "string" },
                email: { type: "string" },
              },
              required: ["name", "email"],
            },
          },
          required: ["user"],
        },
      });

      const result = validator.validateInput({
        user: { name: "John", email: "john@example.com" },
      });
      expect(result.isValid).toBe(true);
    });

    it("should validate arrays", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: {
          type: "array",
          items: { type: "string" },
        },
      });

      const result = validator.validateInput(["a", "b", "c"]);
      expect(result.isValid).toBe(true);
    });

    it("should validate with enum constraints", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: {
          type: "string",
          enum: ["red", "green", "blue"],
        },
      });

      expect(validator.validateInput("red").isValid).toBe(true);
      expect(validator.validateInput("yellow").isValid).toBe(false);
    });

    it("should validate with pattern constraints", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: {
          type: "string",
          pattern: "^[A-Z][a-z]+$",
        },
      });

      expect(validator.validateInput("John").isValid).toBe(true);
      expect(validator.validateInput("john").isValid).toBe(false);
      expect(validator.validateInput("JOHN").isValid).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle null input data", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: { type: "null" },
      });
      const result = validator.validateInput(null);
      expect(result.isValid).toBe(true);
    });

    it("should handle undefined input data", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: {},
      });
      const result = validator.validateInput(undefined);
      expect(result.isValid).toBe(true);
    });

    it("should handle empty objects", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: { type: "object" },
      });
      const result = validator.validateInput({});
      expect(result.isValid).toBe(true);
    });

    it("should handle empty arrays", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: { type: "array" },
      });
      const result = validator.validateInput([]);
      expect(result.isValid).toBe(true);
    });
  });
});
