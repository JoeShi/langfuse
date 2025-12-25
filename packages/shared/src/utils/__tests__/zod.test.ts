import { describe, it, expect } from "vitest";
import { z } from "zod/v4";
import {
  jsonSchema,
  jsonSchemaNullable,
  paginationZod,
  publicApiPaginationZod,
  optionalPaginationZod,
  validateZodSchema,
  sanitizeEmailSubject,
  urlRegex,
  noUrlCheck,
  NonEmptyString,
  htmlRegex,
  StringNoHTML,
  StringNoHTMLNonEmpty,
  queryStringZod,
  paginationMetaResponseZod,
  JSONPrimitiveValueSchema,
  JSONValueSchema,
  JSONObjectSchema,
  JSONArraySchema,
} from "../zod";

describe("zod.ts", () => {
  describe("jsonSchema", () => {
    it("should accept string values at root", () => {
      const result = jsonSchema.safeParse("hello");
      expect(result.success).toBe(true);
    });

    it("should accept number values at root", () => {
      const result = jsonSchema.safeParse(123);
      expect(result.success).toBe(true);
    });

    it("should accept boolean values at root", () => {
      const result = jsonSchema.safeParse(true);
      expect(result.success).toBe(true);
    });

    it("should reject null at root", () => {
      const result = jsonSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it("should accept objects", () => {
      const result = jsonSchema.safeParse({ key: "value" });
      expect(result.success).toBe(true);
    });

    it("should accept arrays", () => {
      const result = jsonSchema.safeParse([1, 2, 3]);
      expect(result.success).toBe(true);
    });

    it("should accept nested structures", () => {
      const nested = {
        string: "text",
        number: 42,
        boolean: true,
        null: null,
        array: [1, "two", { three: 3 }],
        object: {
          nested: "deep",
        },
      };
      const result = jsonSchema.safeParse(nested);
      expect(result.success).toBe(true);
    });
  });

  describe("jsonSchemaNullable", () => {
    it("should accept null at any level", () => {
      const result = jsonSchemaNullable.safeParse(null);
      expect(result.success).toBe(true);
    });

    it("should accept all primitive types", () => {
      expect(jsonSchemaNullable.safeParse("string").success).toBe(true);
      expect(jsonSchemaNullable.safeParse(123).success).toBe(true);
      expect(jsonSchemaNullable.safeParse(true).success).toBe(true);
      expect(jsonSchemaNullable.safeParse(null).success).toBe(true);
    });

    it("should accept arrays with null values", () => {
      const result = jsonSchemaNullable.safeParse([1, null, "text"]);
      expect(result.success).toBe(true);
    });

    it("should accept objects with null values", () => {
      const result = jsonSchemaNullable.safeParse({ key: null, other: "value" });
      expect(result.success).toBe(true);
    });
  });

  describe("paginationZod", () => {
    it("should accept valid page and limit", () => {
      const schema = z.object(paginationZod);
      const result = schema.safeParse({ page: 1, limit: 50 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(50);
      }
    });

    it("should use default values when not provided", () => {
      const schema = z.object(paginationZod);
      const result = schema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(50);
      }
    });

    it("should coerce string numbers to numbers", () => {
      const schema = z.object(paginationZod);
      const result = schema.safeParse({ page: "2", limit: "25" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(25);
      }
    });

    it("should treat empty string as undefined and use defaults", () => {
      const schema = z.object(paginationZod);
      const result = schema.safeParse({ page: "", limit: "" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(50);
      }
    });

    it("should reject negative page numbers", () => {
      const schema = z.object(paginationZod);
      const result = schema.safeParse({ page: -1, limit: 50 });

      expect(result.success).toBe(false);
    });

    it("should reject negative limit", () => {
      const schema = z.object(paginationZod);
      const result = schema.safeParse({ page: 1, limit: -10 });

      expect(result.success).toBe(false);
    });

    it("should reject limit greater than 100", () => {
      const schema = z.object(paginationZod);
      const result = schema.safeParse({ page: 1, limit: 101 });

      expect(result.success).toBe(false);
    });

    it("should accept limit of exactly 100", () => {
      const schema = z.object(paginationZod);
      const result = schema.safeParse({ page: 1, limit: 100 });

      expect(result.success).toBe(true);
    });
  });

  describe("publicApiPaginationZod", () => {
    it("should accept valid page and limit", () => {
      const schema = z.object(publicApiPaginationZod);
      const result = schema.safeParse({ page: 1, limit: 50 });

      expect(result.success).toBe(true);
    });

    it("should reject page 0", () => {
      const schema = z.object(publicApiPaginationZod);
      const result = schema.safeParse({ page: 0, limit: 50 });

      expect(result.success).toBe(false);
    });

    it("should accept page starting from 1", () => {
      const schema = z.object(publicApiPaginationZod);
      const result = schema.safeParse({ page: 1, limit: 50 });

      expect(result.success).toBe(true);
    });

    it("should use default values", () => {
      const schema = z.object(publicApiPaginationZod);
      const result = schema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(50);
      }
    });
  });

  describe("optionalPaginationZod", () => {
    it("should accept optional page and limit", () => {
      const schema = z.object(optionalPaginationZod);
      const result = schema.safeParse({ page: 2, limit: 25 });

      expect(result.success).toBe(true);
    });

    it("should accept missing page and limit", () => {
      const schema = z.object(optionalPaginationZod);
      const result = schema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBeUndefined();
        expect(result.data.limit).toBeUndefined();
      }
    });

    it("should coerce string numbers", () => {
      const schema = z.object(optionalPaginationZod);
      const result = schema.safeParse({ page: "3", limit: "30" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(30);
      }
    });
  });

  describe("queryStringZod", () => {
    it("should decode URL-encoded strings", () => {
      const encoded = "hello%20world";
      const result = queryStringZod.safeParse(encoded);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("hello world");
      }
    });

    it("should decode special characters", () => {
      const encoded = "test%2Bvalue%3D123";
      const result = queryStringZod.safeParse(encoded);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("test+value=123");
      }
    });

    it("should handle unencoded strings", () => {
      const plain = "hello";
      const result = queryStringZod.safeParse(plain);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("hello");
      }
    });
  });

  describe("paginationMetaResponseZod", () => {
    it("should accept valid pagination metadata", () => {
      const meta = {
        page: 2,
        limit: 25,
        totalItems: 100,
        totalPages: 4,
      };
      const result = paginationMetaResponseZod.safeParse(meta);

      expect(result.success).toBe(true);
    });

    it("should require positive page number", () => {
      const meta = {
        page: 0,
        limit: 25,
        totalItems: 100,
        totalPages: 4,
      };
      const result = paginationMetaResponseZod.safeParse(meta);

      expect(result.success).toBe(false);
    });

    it("should require positive limit", () => {
      const meta = {
        page: 1,
        limit: 0,
        totalItems: 100,
        totalPages: 4,
      };
      const result = paginationMetaResponseZod.safeParse(meta);

      expect(result.success).toBe(false);
    });

    it("should accept zero totalItems and totalPages", () => {
      const meta = {
        page: 1,
        limit: 25,
        totalItems: 0,
        totalPages: 0,
      };
      const result = paginationMetaResponseZod.safeParse(meta);

      expect(result.success).toBe(true);
    });
  });

  describe("urlRegex", () => {
    it("should match http URLs", () => {
      expect(urlRegex.test("http://example.com")).toBe(true);
      expect(urlRegex.test("http://example.com/path")).toBe(true);
    });

    it("should match https URLs", () => {
      expect(urlRegex.test("https://example.com")).toBe(true);
      expect(urlRegex.test("https://example.com/path")).toBe(true);
    });

    it("should not match non-URLs", () => {
      expect(urlRegex.test("not a url")).toBe(false);
      expect(urlRegex.test("example.com")).toBe(false);
    });

    it("should match URLs with query parameters", () => {
      expect(urlRegex.test("https://example.com?param=value")).toBe(true);
    });

    it("should match URLs with fragments", () => {
      expect(urlRegex.test("https://example.com#section")).toBe(true);
    });
  });

  describe("noUrlCheck", () => {
    it("should return true when no URL is present", () => {
      expect(noUrlCheck("plain text")).toBe(true);
      expect(noUrlCheck("no urls here")).toBe(true);
    });

    it("should return false when URL is present", () => {
      expect(noUrlCheck("visit http://example.com")).toBe(false);
      expect(noUrlCheck("https://example.com")).toBe(false);
    });
  });

  describe("NonEmptyString", () => {
    it("should accept non-empty strings", () => {
      expect(NonEmptyString.safeParse("hello").success).toBe(true);
      expect(NonEmptyString.safeParse("a").success).toBe(true);
    });

    it("should reject empty strings", () => {
      expect(NonEmptyString.safeParse("").success).toBe(false);
    });

    it("should accept strings with spaces", () => {
      expect(NonEmptyString.safeParse(" ").success).toBe(true);
    });
  });

  describe("htmlRegex", () => {
    it("should match HTML tags", () => {
      expect(htmlRegex.test("<div>")).toBe(true);
      expect(htmlRegex.test("<p>text</p>")).toBe(true);
      expect(htmlRegex.test("<script>alert(1)</script>")).toBe(true);
    });

    it("should not match non-HTML strings", () => {
      // Reset the regex lastIndex
      htmlRegex.lastIndex = 0;
      expect(htmlRegex.test("plain text")).toBe(false);
    });
  });

  describe("StringNoHTML", () => {
    it("should accept strings without HTML", () => {
      expect(StringNoHTML.safeParse("plain text").success).toBe(true);
      expect(StringNoHTML.safeParse("hello world").success).toBe(true);
    });

    it("should reject strings with HTML tags", () => {
      expect(StringNoHTML.safeParse("<div>text</div>").success).toBe(false);
      expect(StringNoHTML.safeParse("hello <b>world</b>").success).toBe(false);
    });

    it("should accept empty strings", () => {
      expect(StringNoHTML.safeParse("").success).toBe(true);
    });
  });

  describe("StringNoHTMLNonEmpty", () => {
    it("should accept non-empty strings without HTML", () => {
      expect(StringNoHTMLNonEmpty.safeParse("hello").success).toBe(true);
    });

    it("should reject empty strings", () => {
      expect(StringNoHTMLNonEmpty.safeParse("").success).toBe(false);
    });

    it("should reject strings with HTML", () => {
      expect(StringNoHTMLNonEmpty.safeParse("<div>text</div>").success).toBe(false);
    });
  });

  describe("validateZodSchema", () => {
    it("should validate and return parsed object", () => {
      const schema = z.object({ name: z.string(), age: z.number() });
      const obj = { name: "John", age: 30 };
      const result = validateZodSchema(schema, obj);

      expect(result).toEqual(obj);
    });

    it("should throw on invalid data", () => {
      const schema = z.object({ name: z.string(), age: z.number() });
      const obj = { name: "John", age: "not a number" };

      expect(() => validateZodSchema(schema, obj as any)).toThrow();
    });

    it("should work with transformations", () => {
      const schema = z.object({
        value: z.string().transform((val) => val.toUpperCase()),
      });
      const obj = { value: "hello" };
      const result = validateZodSchema(schema, obj);

      expect(result.value).toBe("HELLO");
    });
  });

  describe("JSONPrimitiveValueSchema", () => {
    it("should accept string", () => {
      expect(JSONPrimitiveValueSchema.safeParse("text").success).toBe(true);
    });

    it("should accept finite numbers", () => {
      expect(JSONPrimitiveValueSchema.safeParse(123).success).toBe(true);
      expect(JSONPrimitiveValueSchema.safeParse(0).success).toBe(true);
      expect(JSONPrimitiveValueSchema.safeParse(-456).success).toBe(true);
    });

    it("should accept boolean", () => {
      expect(JSONPrimitiveValueSchema.safeParse(true).success).toBe(true);
      expect(JSONPrimitiveValueSchema.safeParse(false).success).toBe(true);
    });

    it("should reject Infinity", () => {
      expect(JSONPrimitiveValueSchema.safeParse(Infinity).success).toBe(false);
    });

    it("should reject NaN", () => {
      expect(JSONPrimitiveValueSchema.safeParse(NaN).success).toBe(false);
    });
  });

  describe("JSONValueSchema", () => {
    it("should accept primitives", () => {
      expect(JSONValueSchema.safeParse("text").success).toBe(true);
      expect(JSONValueSchema.safeParse(123).success).toBe(true);
      expect(JSONValueSchema.safeParse(true).success).toBe(true);
    });

    it("should accept arrays", () => {
      expect(JSONValueSchema.safeParse([1, 2, 3]).success).toBe(true);
    });

    it("should accept objects", () => {
      expect(JSONValueSchema.safeParse({ key: "value" }).success).toBe(true);
    });

    it("should accept nested structures", () => {
      const nested = {
        array: [1, 2, { nested: "value" }],
        object: { deep: [true, false] },
      };
      expect(JSONValueSchema.safeParse(nested).success).toBe(true);
    });
  });

  describe("JSONObjectSchema", () => {
    it("should accept valid objects", () => {
      const obj = { key1: "value", key2: 123, key3: true };
      expect(JSONObjectSchema.safeParse(obj).success).toBe(true);
    });

    it("should reject arrays", () => {
      expect(JSONObjectSchema.safeParse([1, 2, 3]).success).toBe(false);
    });

    it("should reject primitives", () => {
      expect(JSONObjectSchema.safeParse("string").success).toBe(false);
    });
  });

  describe("JSONArraySchema", () => {
    it("should accept valid arrays", () => {
      const arr = [1, "text", true, { key: "value" }];
      expect(JSONArraySchema.safeParse(arr).success).toBe(true);
    });

    it("should reject objects", () => {
      expect(JSONArraySchema.safeParse({ key: "value" }).success).toBe(false);
    });

    it("should reject primitives", () => {
      expect(JSONArraySchema.safeParse("string").success).toBe(false);
    });
  });

  describe("sanitizeEmailSubject", () => {
    it("should remove carriage return characters", () => {
      const input = "Hello\rWorld";
      expect(sanitizeEmailSubject(input)).toBe("HelloWorld");
    });

    it("should remove line feed characters", () => {
      const input = "Hello\nWorld";
      expect(sanitizeEmailSubject(input)).toBe("HelloWorld");
    });

    it("should remove CRLF sequences", () => {
      const input = "Hello\r\nWorld";
      expect(sanitizeEmailSubject(input)).toBe("HelloWorld");
    });

    it("should prevent CRLF injection attacks", () => {
      const input = "Subject\r\nBCC: attacker@evil.com";
      expect(sanitizeEmailSubject(input)).toBe("SubjectBCC: attacker@evil.com");
    });

    it("should remove control characters", () => {
      const input = "Hello\x00\x01\x02World";
      expect(sanitizeEmailSubject(input)).toBe("HelloWorld");
    });

    it("should remove HTML tags", () => {
      const input = "Hello<script>alert(1)</script>World";
      expect(sanitizeEmailSubject(input)).toBe("Helloscriptalert(1)/scriptWorld");
    });

    it("should remove all control characters (ASCII 0-31 and 127)", () => {
      let input = "Hello";
      for (let i = 0; i < 32; i++) {
        input += String.fromCharCode(i);
      }
      input += String.fromCharCode(127);
      input += "World";

      expect(sanitizeEmailSubject(input)).toBe("HelloWorld");
    });

    it("should trim whitespace", () => {
      const input = "  Hello World  ";
      expect(sanitizeEmailSubject(input)).toBe("Hello World");
    });

    it("should handle multiple sanitization issues at once", () => {
      const input = "  <script>alert(1)</script>\r\nBCC: evil@test.com  ";
      const result = sanitizeEmailSubject(input);
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("\r");
      expect(result).not.toContain("\n");
      expect(result).toBe("scriptalert(1)/scriptBCC: evil@test.com");
    });

    it("should preserve normal text", () => {
      const input = "Your daily report for 2023-12-25";
      expect(sanitizeEmailSubject(input)).toBe(input);
    });

    it("should preserve special characters that are safe", () => {
      const input = "Report: Project #123 - Status Update!";
      expect(sanitizeEmailSubject(input)).toBe(input);
    });

    it("should handle empty string", () => {
      expect(sanitizeEmailSubject("")).toBe("");
    });

    it("should handle string with only control characters", () => {
      const input = "\r\n\x00\x01";
      expect(sanitizeEmailSubject(input)).toBe("");
    });

    it("should handle unicode characters", () => {
      const input = "Hello 世界 🌍";
      expect(sanitizeEmailSubject(input)).toBe("Hello 世界 🌍");
    });

    it("should prevent email header injection", () => {
      const malicious = "Normal Subject\r\nFrom: attacker@evil.com\r\nTo: victim@test.com";
      const sanitized = sanitizeEmailSubject(malicious);

      expect(sanitized).not.toContain("\r");
      expect(sanitized).not.toContain("\n");
      expect(sanitized).toBe("Normal SubjectFrom: attacker@evil.comTo: victim@test.com");
    });
  });
});
