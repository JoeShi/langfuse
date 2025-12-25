import { describe, it, expect } from "vitest";
import {
  isValidJSONSchema,
  validateFieldAgainstSchema,
  validateWithCompiledSchema,
  createAjvInstanceInternal,
  FieldValidationError,
  FieldValidationResult,
} from "../jsonSchemaValidation";

describe("jsonSchemaValidation utilities", () => {
  describe("createAjvInstanceInternal", () => {
    it("should create an Ajv instance", () => {
      const ajv = createAjvInstanceInternal();
      expect(ajv).toBeDefined();
      expect(ajv.compile).toBeDefined();
    });

    it("should create fresh instances each time", () => {
      const ajv1 = createAjvInstanceInternal();
      const ajv2 = createAjvInstanceInternal();
      expect(ajv1).not.toBe(ajv2);
    });
  });

  describe("isValidJSONSchema", () => {
    it("should accept valid simple schema", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
        },
      };
      expect(isValidJSONSchema(schema)).toBe(true);
    });

    it("should accept schema with required fields", () => {
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

    it("should accept schema with nested objects", () => {
      const schema = {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string" },
            },
          },
        },
      };
      expect(isValidJSONSchema(schema)).toBe(true);
    });

    it("should accept array schemas", () => {
      const schema = {
        type: "array",
        items: {
          type: "string",
        },
      };
      expect(isValidJSONSchema(schema)).toBe(true);
    });

    it("should reject invalid schema", () => {
      const schema = {
        type: "invalid-type",
      };
      expect(isValidJSONSchema(schema)).toBe(false);
    });

    it("should reject schema that is too large", () => {
      const largeSchema = {
        type: "object",
        properties: {},
      };
      // Add many properties to make it large
      for (let i = 0; i < 10000; i++) {
        largeSchema.properties[`prop${i}`] = { type: "string" };
      }
      expect(isValidJSONSchema(largeSchema)).toBe(false);
    });

    it("should reject non-object schemas", () => {
      expect(isValidJSONSchema("not a schema")).toBe(false);
      expect(isValidJSONSchema(123)).toBe(false);
      expect(isValidJSONSchema(null)).toBe(false);
    });

    it("should accept schema with formats", () => {
      const schema = {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          date: { type: "string", format: "date" },
        },
      };
      expect(isValidJSONSchema(schema)).toBe(true);
    });

    it("should accept schema with enum", () => {
      const schema = {
        type: "string",
        enum: ["red", "green", "blue"],
      };
      expect(isValidJSONSchema(schema)).toBe(true);
    });

    it("should accept schema with pattern", () => {
      const schema = {
        type: "string",
        pattern: "^[A-Z][a-z]+$",
      };
      expect(isValidJSONSchema(schema)).toBe(true);
    });
  });

  describe("validateFieldAgainstSchema", () => {
    it("should validate valid data", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
        },
      };
      const data = { name: "John" };
      const result = validateFieldAgainstSchema({ data, schema });
      expect(result.isValid).toBe(true);
    });

    it("should reject invalid data type", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
        },
      };
      const data = { name: 123 };
      const result = validateFieldAgainstSchema({ data, schema });
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errors).toBeDefined();
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it("should validate required fields", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
        },
        required: ["name"],
      };
      const data = {};
      const result = validateFieldAgainstSchema({ data, schema });
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errors[0].message).toContain("required");
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
      };
      const validData = { user: { name: "John", age: 30 } };
      const result1 = validateFieldAgainstSchema({ data: validData, schema });
      expect(result1.isValid).toBe(true);

      const invalidData = { user: { age: 30 } };
      const result2 = validateFieldAgainstSchema({ data: invalidData, schema });
      expect(result2.isValid).toBe(false);
    });

    it("should validate arrays", () => {
      const schema = {
        type: "array",
        items: { type: "string" },
      };
      const validData = ["one", "two", "three"];
      const result1 = validateFieldAgainstSchema({ data: validData, schema });
      expect(result1.isValid).toBe(true);

      const invalidData = ["one", 2, "three"];
      const result2 = validateFieldAgainstSchema({ data: invalidData, schema });
      expect(result2.isValid).toBe(false);
    });

    it("should include error path", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
        },
      };
      const data = { name: 123 };
      const result = validateFieldAgainstSchema({ data, schema });
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errors[0].path).toBeDefined();
      }
    });

    it("should include error message", () => {
      const schema = {
        type: "object",
        properties: {
          age: { type: "number", minimum: 0 },
        },
      };
      const data = { age: -5 };
      const result = validateFieldAgainstSchema({ data, schema });
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errors[0].message).toBeDefined();
        expect(result.errors[0].message).toContain("minimum");
      }
    });

    it("should include error keyword", () => {
      const schema = {
        type: "string",
      };
      const data = 123;
      const result = validateFieldAgainstSchema({ data, schema });
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errors[0].keyword).toBeDefined();
      }
    });

    it("should validate enum values", () => {
      const schema = {
        type: "string",
        enum: ["red", "green", "blue"],
      };
      const validData = "red";
      const result1 = validateFieldAgainstSchema({ data: validData, schema });
      expect(result1.isValid).toBe(true);

      const invalidData = "yellow";
      const result2 = validateFieldAgainstSchema({ data: invalidData, schema });
      expect(result2.isValid).toBe(false);
    });
  });

  describe("validateWithCompiledSchema", () => {
    it("should validate with pre-compiled schema", () => {
      const ajv = createAjvInstanceInternal();
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
        },
      };
      const validator = ajv.compile(schema);

      const validData = { name: "John" };
      const result1 = validateWithCompiledSchema(validData, validator);
      expect(result1.isValid).toBe(true);

      const invalidData = { name: 123 };
      const result2 = validateWithCompiledSchema(invalidData, validator);
      expect(result2.isValid).toBe(false);
    });

    it("should reuse validator for multiple validations", () => {
      const ajv = createAjvInstanceInternal();
      const schema = {
        type: "object",
        properties: {
          age: { type: "number" },
        },
      };
      const validator = ajv.compile(schema);

      const testCases = [
        { data: { age: 25 }, expected: true },
        { data: { age: "25" }, expected: false },
        { data: { age: 0 }, expected: true },
        { data: { age: -1 }, expected: true },
        { data: {}, expected: true }, // age not required
      ];

      for (const testCase of testCases) {
        const result = validateWithCompiledSchema(testCase.data, validator);
        expect(result.isValid).toBe(testCase.expected);
      }
    });

    it("should return error details for invalid data", () => {
      const ajv = createAjvInstanceInternal();
      const schema = {
        type: "object",
        properties: {
          email: { type: "string" },
        },
        required: ["email"],
      };
      const validator = ajv.compile(schema);

      const result = validateWithCompiledSchema({}, validator);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBeTruthy();
      }
    });
  });

  describe("error formatting", () => {
    it("should default path to / when instancePath is empty", () => {
      const schema = {
        type: "string",
      };
      const data = 123;
      const result = validateFieldAgainstSchema({ data, schema });
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        // Root level error should have path "/"
        expect(result.errors[0].path).toBe("/");
      }
    });

    it("should include nested path for nested errors", () => {
      const schema = {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              email: { type: "string" },
            },
            required: ["email"],
          },
        },
      };
      const data = { user: {} };
      const result = validateFieldAgainstSchema({ data, schema });
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errors[0].path).toContain("user");
      }
    });
  });
});
