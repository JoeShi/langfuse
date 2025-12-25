import { describe, it, expect } from "vitest";
import {
  createAjvInstanceInternal,
  isValidJSONSchema,
  validateFieldAgainstSchema,
} from "../jsonSchemaValidation";
import { DatasetSchemaValidator } from "../../../server/services/DatasetService/DatasetSchemaValidator";

describe("jsonSchemaValidation.ts", () => {
  describe("createAjvInstanceInternal", () => {
    it("should create an Ajv instance", () => {
      const ajv = createAjvInstanceInternal();

      expect(ajv).toBeDefined();
      expect(ajv.compile).toBeDefined();
    });

    it("should create instances with strict mode enabled", () => {
      const ajv = createAjvInstanceInternal();
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
        },
      };

      const validate = ajv.compile(schema);
      expect(validate).toBeDefined();
    });
  });

  describe("isValidJSONSchema", () => {
    it("should validate correct JSON schemas", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
        },
        required: ["name"],
      };

      expect(isValidJSONSchema(schema)).toBe(true);
    });

    it("should validate simple type schemas", () => {
      expect(isValidJSONSchema({ type: "string" })).toBe(true);
      expect(isValidJSONSchema({ type: "number" })).toBe(true);
      expect(isValidJSONSchema({ type: "boolean" })).toBe(true);
      expect(isValidJSONSchema({ type: "array" })).toBe(true);
      expect(isValidJSONSchema({ type: "object" })).toBe(true);
    });

    it("should reject invalid schemas", () => {
      const invalidSchema = {
        type: "invalid-type",
      };

      expect(isValidJSONSchema(invalidSchema)).toBe(false);
    });

    it("should reject schemas with invalid structure", () => {
      const invalidSchema = {
        type: "object",
        properties: "not-an-object",
      };

      expect(isValidJSONSchema(invalidSchema)).toBe(false);
    });

    it("should reject oversized schemas (>10000 chars)", () => {
      // Create a large schema
      const largeSchema: any = {
        type: "object",
        properties: {},
      };

      // Add many properties to exceed size limit
      for (let i = 0; i < 1000; i++) {
        largeSchema.properties[`prop${i}`] = {
          type: "string",
          description: "x".repeat(100),
        };
      }

      expect(isValidJSONSchema(largeSchema)).toBe(false);
    });

    it("should handle null and undefined gracefully", () => {
      expect(isValidJSONSchema(null)).toBe(false);
      expect(isValidJSONSchema(undefined)).toBe(false);
    });

    it("should handle non-object schemas", () => {
      expect(isValidJSONSchema("not a schema")).toBe(false);
      expect(isValidJSONSchema(123)).toBe(false);
      expect(isValidJSONSchema(true)).toBe(false);
    });

    it("should validate schemas with nested properties", () => {
      const schema = {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string", format: "email" },
            },
          },
        },
      };

      expect(isValidJSONSchema(schema)).toBe(true);
    });

    it("should validate schemas with arrays", () => {
      const schema = {
        type: "array",
        items: {
          type: "string",
        },
      };

      expect(isValidJSONSchema(schema)).toBe(true);
    });

    it("should validate schemas with enums", () => {
      const schema = {
        type: "string",
        enum: ["option1", "option2", "option3"],
      };

      expect(isValidJSONSchema(schema)).toBe(true);
    });

    it("should validate schemas with patterns", () => {
      const schema = {
        type: "string",
        pattern: "^[a-zA-Z]+$",
      };

      expect(isValidJSONSchema(schema)).toBe(true);
    });
  });

  describe("validateFieldAgainstSchema", () => {
    it("should validate data against a simple schema", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
        },
        required: ["name"],
      };

      const validData = { name: "John" };
      const result = validateFieldAgainstSchema({
        data: validData,
        schema,
      });

      expect(result.isValid).toBe(true);
    });

    it("should reject invalid data", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
        },
        required: ["name"],
      };

      const invalidData = { name: 123 }; // name should be string
      const result = validateFieldAgainstSchema({
        data: invalidData,
        schema,
      });

      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errors).toBeDefined();
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it("should provide validation errors with path and message", () => {
      const schema = {
        type: "object",
        properties: {
          age: { type: "number" },
        },
        required: ["age"],
      };

      const invalidData = { age: "not-a-number" };
      const result = validateFieldAgainstSchema({
        data: invalidData,
        schema,
      });

      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errors[0]).toHaveProperty("path");
        expect(result.errors[0]).toHaveProperty("message");
        expect(result.errors[0]).toHaveProperty("keyword");
      }
    });

    it("should validate nested objects", () => {
      const schema = {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              name: { type: "string" },
              age: { type: "number" },
            },
            required: ["name"],
          },
        },
        required: ["user"],
      };

      const validData = {
        user: {
          name: "John",
          age: 30,
        },
      };

      const result = validateFieldAgainstSchema({
        data: validData,
        schema,
      });

      expect(result.isValid).toBe(true);
    });

    it("should validate arrays", () => {
      const schema = {
        type: "array",
        items: {
          type: "string",
        },
      };

      const validData = ["item1", "item2", "item3"];
      const result = validateFieldAgainstSchema({
        data: validData,
        schema,
      });

      expect(result.isValid).toBe(true);
    });

    it("should reject arrays with wrong item types", () => {
      const schema = {
        type: "array",
        items: {
          type: "string",
        },
      };

      const invalidData = ["item1", 123, "item3"];
      const result = validateFieldAgainstSchema({
        data: invalidData,
        schema,
      });

      expect(result.isValid).toBe(false);
    });

    it("should handle missing required fields", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
        },
        required: ["name", "email"],
      };

      const invalidData = { name: "John" }; // missing email
      const result = validateFieldAgainstSchema({
        data: invalidData,
        schema,
      });

      expect(result.isValid).toBe(false);
    });

    it("should validate with format constraints", () => {
      const schema = {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
        },
      };

      const validData = { email: "test@example.com" };
      const result = validateFieldAgainstSchema({
        data: validData,
        schema,
      });

      // Note: validateFormats is set to false, so format validation is skipped
      expect(result.isValid).toBe(true);
    });
  });

  describe("DatasetSchemaValidator", () => {
    it("should create validator with both schemas", () => {
      const inputSchema = {
        type: "object",
        properties: { input: { type: "string" } },
      };
      const outputSchema = {
        type: "object",
        properties: { output: { type: "string" } },
      };

      const validator = new DatasetSchemaValidator({
        inputSchema,
        expectedOutputSchema: outputSchema,
      });

      expect(validator).toBeDefined();
    });

    it("should validate input correctly", () => {
      const inputSchema = {
        type: "object",
        properties: { text: { type: "string" } },
        required: ["text"],
      };

      const validator = new DatasetSchemaValidator({
        inputSchema,
        expectedOutputSchema: null,
      });

      const validInput = { text: "hello" };
      const result = validator.validateInput(validInput);

      expect(result.isValid).toBe(true);
    });

    it("should reject invalid input", () => {
      const inputSchema = {
        type: "object",
        properties: { text: { type: "string" } },
        required: ["text"],
      };

      const validator = new DatasetSchemaValidator({
        inputSchema,
        expectedOutputSchema: null,
      });

      const invalidInput = { text: 123 }; // should be string
      const result = validator.validateInput(invalidInput);

      expect(result.isValid).toBe(false);
    });

    it("should validate output correctly", () => {
      const outputSchema = {
        type: "object",
        properties: { result: { type: "number" } },
        required: ["result"],
      };

      const validator = new DatasetSchemaValidator({
        inputSchema: null,
        expectedOutputSchema: outputSchema,
      });

      const validOutput = { result: 42 };
      const result = validator.validateOutput(validOutput);

      expect(result.isValid).toBe(true);
    });

    it("should reject invalid output", () => {
      const outputSchema = {
        type: "object",
        properties: { result: { type: "number" } },
        required: ["result"],
      };

      const validator = new DatasetSchemaValidator({
        inputSchema: null,
        expectedOutputSchema: outputSchema,
      });

      const invalidOutput = { result: "not-a-number" };
      const result = validator.validateOutput(invalidOutput);

      expect(result.isValid).toBe(false);
    });

    it("should return valid when no schema is provided", () => {
      const validator = new DatasetSchemaValidator({
        inputSchema: null,
        expectedOutputSchema: null,
      });

      const inputResult = validator.validateInput({ anything: "goes" });
      const outputResult = validator.validateOutput({ anything: "goes" });

      expect(inputResult.isValid).toBe(true);
      expect(outputResult.isValid).toBe(true);
    });

    it("should validate both input and output with validateItem", () => {
      const inputSchema = {
        type: "object",
        properties: { text: { type: "string" } },
        required: ["text"],
      };
      const outputSchema = {
        type: "object",
        properties: { result: { type: "number" } },
        required: ["result"],
      };

      const validator = new DatasetSchemaValidator({
        inputSchema,
        expectedOutputSchema: outputSchema,
      });

      const result = validator.validateItem({
        input: { text: "hello" },
        expectedOutput: { result: 42 },
      });

      expect(result.isValid).toBe(true);
    });

    it("should report input errors in validateItem", () => {
      const inputSchema = {
        type: "object",
        properties: { text: { type: "string" } },
        required: ["text"],
      };
      const outputSchema = {
        type: "object",
        properties: { result: { type: "number" } },
      };

      const validator = new DatasetSchemaValidator({
        inputSchema,
        expectedOutputSchema: outputSchema,
      });

      const result = validator.validateItem({
        input: { text: 123 }, // invalid
        expectedOutput: { result: 42 },
      });

      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.inputErrors).toBeDefined();
        expect(result.expectedOutputErrors).toBeUndefined();
      }
    });

    it("should report output errors in validateItem", () => {
      const inputSchema = {
        type: "object",
        properties: { text: { type: "string" } },
      };
      const outputSchema = {
        type: "object",
        properties: { result: { type: "number" } },
        required: ["result"],
      };

      const validator = new DatasetSchemaValidator({
        inputSchema,
        expectedOutputSchema: outputSchema,
      });

      const result = validator.validateItem({
        input: { text: "hello" },
        expectedOutput: { result: "not-a-number" }, // invalid
      });

      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.expectedOutputErrors).toBeDefined();
        expect(result.inputErrors).toBeUndefined();
      }
    });

    it("should report both errors in validateItem", () => {
      const inputSchema = {
        type: "object",
        properties: { text: { type: "string" } },
        required: ["text"],
      };
      const outputSchema = {
        type: "object",
        properties: { result: { type: "number" } },
        required: ["result"],
      };

      const validator = new DatasetSchemaValidator({
        inputSchema,
        expectedOutputSchema: outputSchema,
      });

      const result = validator.validateItem({
        input: { text: 123 }, // invalid
        expectedOutput: { result: "not-a-number" }, // invalid
      });

      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.inputErrors).toBeDefined();
        expect(result.expectedOutputErrors).toBeDefined();
      }
    });

    it("should reuse compiled validators for performance", () => {
      const inputSchema = {
        type: "object",
        properties: { text: { type: "string" } },
      };

      const validator = new DatasetSchemaValidator({
        inputSchema,
        expectedOutputSchema: null,
      });

      // Validate multiple items - should reuse the compiled validator
      const items = [
        { text: "item1" },
        { text: "item2" },
        { text: "item3" },
      ];

      const results = items.map((input) => validator.validateInput(input));

      expect(results.every((r) => r.isValid)).toBe(true);
    });
  });
});
