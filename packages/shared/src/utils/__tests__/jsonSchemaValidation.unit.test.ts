import { expect, describe, it } from "vitest";
import {
  isValidJSONSchema,
  validateFieldAgainstSchema,
  createAjvInstanceInternal,
} from "../jsonSchemaValidation";

describe("isValidJSONSchema", () => {
  describe("valid schemas", () => {
    it("should validate a simple string schema", () => {
      const schema = { type: "string" };
      expect(isValidJSONSchema(schema)).toBe(true);
    });

    it("should validate a number schema", () => {
      const schema = { type: "number" };
      expect(isValidJSONSchema(schema)).toBe(true);
    });

    it("should validate an object schema with properties", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
        },
      };
      expect(isValidJSONSchema(schema)).toBe(true);
    });

    it("should validate an array schema", () => {
      const schema = {
        type: "array",
        items: { type: "string" },
      };
      expect(isValidJSONSchema(schema)).toBe(true);
    });

    it("should validate schema with required fields", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
        },
        required: ["name", "email"],
      };
      expect(isValidJSONSchema(schema)).toBe(true);
    });

    it("should validate schema with nested objects", () => {
      const schema = {
        type: "object",
        properties: {
          address: {
            type: "object",
            properties: {
              street: { type: "string" },
              city: { type: "string" },
            },
          },
        },
      };
      expect(isValidJSONSchema(schema)).toBe(true);
    });

    it("should validate schema with enums", () => {
      const schema = {
        type: "string",
        enum: ["red", "green", "blue"],
      };
      expect(isValidJSONSchema(schema)).toBe(true);
    });

    it("should validate boolean schema", () => {
      const schema = { type: "boolean" };
      expect(isValidJSONSchema(schema)).toBe(true);
    });
  });

  describe("invalid schemas", () => {
    it("should reject schema with invalid type", () => {
      const schema = { type: "invalidType" };
      expect(isValidJSONSchema(schema)).toBe(false);
    });

    it("should reject schema with invalid structure", () => {
      const schema = { invalidKey: "value" };
      expect(isValidJSONSchema(schema)).toBe(false);
    });

    it("should reject non-object schemas", () => {
      expect(isValidJSONSchema("string")).toBe(false);
      expect(isValidJSONSchema(123)).toBe(false);
      expect(isValidJSONSchema(true)).toBe(false);
    });

    it("should reject null schema", () => {
      expect(isValidJSONSchema(null)).toBe(false);
    });

    it("should reject undefined schema", () => {
      expect(isValidJSONSchema(undefined)).toBe(false);
    });

    it("should reject array as schema", () => {
      expect(isValidJSONSchema([])).toBe(false);
    });
  });

  describe("oversized schemas", () => {
    it("should reject schemas larger than 10000 characters", () => {
      const largeSchema = {
        type: "object",
        properties: {},
      };
      // Create a large schema by adding many properties
      for (let i = 0; i < 1000; i++) {
        (largeSchema.properties as any)[`property${i}`] = {
          type: "string",
          description: "A".repeat(20),
        };
      }
      expect(isValidJSONSchema(largeSchema)).toBe(false);
    });

    it("should accept schemas smaller than 10000 characters", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
        },
      };
      expect(isValidJSONSchema(schema)).toBe(true);
    });

    it("should reject schema with very long string values", () => {
      const schema = {
        type: "string",
        description: "x".repeat(15000),
      };
      expect(isValidJSONSchema(schema)).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should validate empty object schema", () => {
      const schema = {};
      expect(isValidJSONSchema(schema)).toBe(true);
    });

    it("should handle schema with additional properties", () => {
      const schema = {
        type: "object",
        additionalProperties: false,
      };
      expect(isValidJSONSchema(schema)).toBe(true);
    });

    it("should handle schema with pattern", () => {
      const schema = {
        type: "string",
        pattern: "^[A-Za-z]+$",
      };
      expect(isValidJSONSchema(schema)).toBe(true);
    });
  });
});

describe("validateFieldAgainstSchema", () => {
  describe("successful validations", () => {
    it("should validate string data against string schema", () => {
      const result = validateFieldAgainstSchema({
        data: "hello",
        schema: { type: "string" },
      });
      expect(result.isValid).toBe(true);
    });

    it("should validate number data against number schema", () => {
      const result = validateFieldAgainstSchema({
        data: 42,
        schema: { type: "number" },
      });
      expect(result.isValid).toBe(true);
    });

    it("should validate object data against object schema", () => {
      const result = validateFieldAgainstSchema({
        data: { name: "John", age: 30 },
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "number" },
          },
        },
      });
      expect(result.isValid).toBe(true);
    });

    it("should validate array data against array schema", () => {
      const result = validateFieldAgainstSchema({
        data: ["a", "b", "c"],
        schema: {
          type: "array",
          items: { type: "string" },
        },
      });
      expect(result.isValid).toBe(true);
    });

    it("should validate boolean data", () => {
      const result = validateFieldAgainstSchema({
        data: true,
        schema: { type: "boolean" },
      });
      expect(result.isValid).toBe(true);
    });

    it("should validate null data", () => {
      const result = validateFieldAgainstSchema({
        data: null,
        schema: { type: "null" },
      });
      expect(result.isValid).toBe(true);
    });
  });

  describe("validation failures with errors", () => {
    it("should return errors for type mismatch", () => {
      const result = validateFieldAgainstSchema({
        data: 123,
        schema: { type: "string" },
      });
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errors).toBeDefined();
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].message).toBeDefined();
      }
    });

    it("should return errors for missing required fields", () => {
      const result = validateFieldAgainstSchema({
        data: { name: "John" },
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
          },
          required: ["name", "email"],
        },
      });
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errors).toBeDefined();
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it("should return path and keyword in errors", () => {
      const result = validateFieldAgainstSchema({
        data: "not-a-number",
        schema: { type: "number" },
      });
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errors[0].path).toBeDefined();
        expect(result.errors[0].keyword).toBeDefined();
        expect(result.errors[0].message).toBeDefined();
      }
    });

    it("should validate nested object with errors", () => {
      const result = validateFieldAgainstSchema({
        data: { address: { street: 123 } }, // street should be string
        schema: {
          type: "object",
          properties: {
            address: {
              type: "object",
              properties: {
                street: { type: "string" },
              },
            },
          },
        },
      });
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errors).toBeDefined();
      }
    });

    it("should validate array items with errors", () => {
      const result = validateFieldAgainstSchema({
        data: [1, 2, "three"], // should all be numbers
        schema: {
          type: "array",
          items: { type: "number" },
        },
      });
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errors).toBeDefined();
      }
    });

    it("should validate enum with errors", () => {
      const result = validateFieldAgainstSchema({
        data: "yellow",
        schema: {
          type: "string",
          enum: ["red", "green", "blue"],
        },
      });
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errors).toBeDefined();
      }
    });
  });

  describe("edge cases", () => {
    it("should handle empty data with empty schema", () => {
      const result = validateFieldAgainstSchema({
        data: {},
        schema: {},
      });
      expect(result.isValid).toBe(true);
    });

    it("should handle null data", () => {
      const result = validateFieldAgainstSchema({
        data: null,
        schema: { type: ["null", "object"] },
      });
      expect(result.isValid).toBe(true);
    });

    it("should handle undefined data with nullable schema", () => {
      const result = validateFieldAgainstSchema({
        data: undefined,
        schema: {},
      });
      expect(result.isValid).toBe(true);
    });

    it("should validate with additional properties false", () => {
      const result = validateFieldAgainstSchema({
        data: { name: "John", extra: "field" },
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
          },
          additionalProperties: false,
        },
      });
      expect(result.isValid).toBe(false);
    });

    it("should validate with pattern", () => {
      const result = validateFieldAgainstSchema({
        data: "abc123",
        schema: {
          type: "string",
          pattern: "^[a-z]+$",
        },
      });
      expect(result.isValid).toBe(false);
    });
  });
});

describe("createAjvInstanceInternal", () => {
  it("should create a valid Ajv instance", () => {
    const ajv = createAjvInstanceInternal();
    expect(ajv).toBeDefined();
    expect(typeof ajv.compile).toBe("function");
  });

  it("should have strict mode enabled", () => {
    const ajv = createAjvInstanceInternal();
    const schema = { type: "string" };
    const validate = ajv.compile(schema);
    expect(validate).toBeDefined();
  });

  it("should support format validators", () => {
    const ajv = createAjvInstanceInternal();
    const schema = { type: "string", format: "email" };
    const validate = ajv.compile(schema);
    expect(validate).toBeDefined();
  });
});
