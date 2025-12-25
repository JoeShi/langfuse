import { describe, it, expect } from "vitest";
import {
  jsonSchema,
  jsonSchemaNullable,
  paginationZod,
  publicApiPaginationZod,
  optionalPaginationZod,
  queryStringZod,
  paginationMetaResponseZod,
  urlRegex,
  noUrlCheck,
  NonEmptyString,
  htmlRegex,
  StringNoHTML,
  StringNoHTMLNonEmpty,
  validateZodSchema,
  JSONPrimitiveValueSchema,
  JSONValueSchema,
  JSONObjectSchema,
  JSONArraySchema,
  sanitizeEmailSubject,
} from "../zod";
import { z } from "zod/v4";

describe("zod utilities", () => {
  describe("jsonSchema", () => {
    it("should accept valid JSON primitives", () => {
      expect(jsonSchema.parse("hello")).toBe("hello");
      expect(jsonSchema.parse(42)).toBe(42);
      expect(jsonSchema.parse(true)).toBe(true);
    });

    it("should accept valid JSON arrays", () => {
      const result = jsonSchema.parse([1, 2, 3]);
      expect(result).toEqual([1, 2, 3]);
    });

    it("should accept valid JSON objects", () => {
      const result = jsonSchema.parse({ name: "John", age: 30 });
      expect(result).toEqual({ name: "John", age: 30 });
    });

    it("should accept nested JSON structures", () => {
      const nested = {
        user: {
          name: "John",
          tags: ["admin", "user"],
          metadata: null,
        },
      };
      const result = jsonSchema.parse(nested);
      expect(result).toEqual(nested);
    });

    it("should reject null at root level", () => {
      expect(() => jsonSchema.parse(null)).toThrow();
    });
  });

  describe("jsonSchemaNullable", () => {
    it("should accept null", () => {
      expect(jsonSchemaNullable.parse(null)).toBe(null);
    });

    it("should accept nested structures with null", () => {
      const result = jsonSchemaNullable.parse({ value: null });
      expect(result).toEqual({ value: null });
    });
  });

  describe("paginationZod", () => {
    it("should use default values when not provided", () => {
      const result = z.object(paginationZod).parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });

    it("should coerce string numbers to numbers", () => {
      const result = z.object(paginationZod).parse({ page: "3", limit: "25" });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(25);
    });

    it("should handle empty strings as default", () => {
      const result = z.object(paginationZod).parse({ page: "", limit: "" });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });

    it("should reject negative page numbers", () => {
      expect(() =>
        z.object(paginationZod).parse({ page: -1 }),
      ).toThrow();
    });

    it("should reject limit over 100", () => {
      expect(() =>
        z.object(paginationZod).parse({ limit: 101 }),
      ).toThrow();
    });
  });

  describe("publicApiPaginationZod", () => {
    it("should use default values", () => {
      const result = z.object(publicApiPaginationZod).parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });

    it("should reject page 0", () => {
      expect(() =>
        z.object(publicApiPaginationZod).parse({ page: 0 }),
      ).toThrow();
    });

    it("should accept page starting from 1", () => {
      const result = z.object(publicApiPaginationZod).parse({ page: 1 });
      expect(result.page).toBe(1);
    });
  });

  describe("optionalPaginationZod", () => {
    it("should allow undefined values", () => {
      const result = z.object(optionalPaginationZod).parse({});
      expect(result.page).toBeUndefined();
      expect(result.limit).toBeUndefined();
    });

    it("should coerce string numbers when provided", () => {
      const result = z
        .object(optionalPaginationZod)
        .parse({ page: "5", limit: "10" });
      expect(result.page).toBe(5);
      expect(result.limit).toBe(10);
    });
  });

  describe("queryStringZod", () => {
    it("should decode URL encoded strings", () => {
      const result = queryStringZod.parse("hello%20world");
      expect(result).toBe("hello world");
    });

    it("should handle special characters", () => {
      const result = queryStringZod.parse("test%26special%3Dvalue");
      expect(result).toBe("test&special=value");
    });
  });

  describe("paginationMetaResponseZod", () => {
    it("should accept valid pagination meta", () => {
      const meta = {
        page: 1,
        limit: 50,
        totalItems: 100,
        totalPages: 2,
      };
      const result = paginationMetaResponseZod.parse(meta);
      expect(result).toEqual(meta);
    });

    it("should reject negative values", () => {
      expect(() =>
        paginationMetaResponseZod.parse({
          page: -1,
          limit: 50,
          totalItems: 100,
          totalPages: 2,
        }),
      ).toThrow();
    });

    it("should reject non-integer values", () => {
      expect(() =>
        paginationMetaResponseZod.parse({
          page: 1.5,
          limit: 50,
          totalItems: 100,
          totalPages: 2,
        }),
      ).toThrow();
    });
  });

  describe("urlRegex", () => {
    it("should match valid HTTP URLs", () => {
      expect(urlRegex.test("http://example.com")).toBe(true);
      expect(urlRegex.test("https://example.com")).toBe(true);
    });

    it("should match URLs with paths", () => {
      expect(urlRegex.test("https://example.com/path/to/resource")).toBe(true);
    });

    it("should not match invalid URLs", () => {
      expect(urlRegex.test("not a url")).toBe(false);
      expect(urlRegex.test("ftp://example.com")).toBe(false);
    });
  });

  describe("noUrlCheck", () => {
    it("should return true for non-URLs", () => {
      expect(noUrlCheck("just some text")).toBe(true);
      expect(noUrlCheck("example.com")).toBe(true);
    });

    it("should return false for URLs", () => {
      expect(noUrlCheck("http://example.com")).toBe(false);
      expect(noUrlCheck("https://example.com/path")).toBe(false);
    });
  });

  describe("NonEmptyString", () => {
    it("should accept non-empty strings", () => {
      expect(NonEmptyString.parse("hello")).toBe("hello");
      expect(NonEmptyString.parse("x")).toBe("x");
    });

    it("should reject empty strings", () => {
      expect(() => NonEmptyString.parse("")).toThrow();
    });
  });

  describe("htmlRegex", () => {
    it("should match HTML tags", () => {
      expect(htmlRegex.test("<div>")).toBe(true);
      expect(htmlRegex.test("<p>text</p>")).toBe(true);
      expect(htmlRegex.test("<script>alert(1)</script>")).toBe(true);
    });

    it("should not match plain text", () => {
      expect(htmlRegex.test("plain text")).toBe(false);
    });
  });

  describe("StringNoHTML", () => {
    it("should accept strings without HTML", () => {
      expect(StringNoHTML.parse("plain text")).toBe("plain text");
      expect(StringNoHTML.parse("text with & special chars")).toBe(
        "text with & special chars",
      );
    });

    it("should reject strings with HTML tags", () => {
      expect(() => StringNoHTML.parse("<div>text</div>")).toThrow();
      expect(() => StringNoHTML.parse("text <script>alert(1)</script>")).toThrow();
    });
  });

  describe("StringNoHTMLNonEmpty", () => {
    it("should accept non-empty strings without HTML", () => {
      expect(StringNoHTMLNonEmpty.parse("valid text")).toBe("valid text");
    });

    it("should reject empty strings", () => {
      expect(() => StringNoHTMLNonEmpty.parse("")).toThrow();
    });

    it("should reject strings with HTML", () => {
      expect(() => StringNoHTMLNonEmpty.parse("<p>text</p>")).toThrow();
    });
  });

  describe("validateZodSchema", () => {
    it("should validate and return parsed object", () => {
      const schema = z.object({ name: z.string(), age: z.number() });
      const input = { name: "John", age: 30 };
      const result = validateZodSchema(schema, input);
      expect(result).toEqual(input);
    });

    it("should throw on invalid input", () => {
      const schema = z.object({ name: z.string() });
      expect(() => validateZodSchema(schema, { name: 123 } as any)).toThrow();
    });
  });

  describe("JSONPrimitiveValueSchema", () => {
    it("should accept strings, numbers, and booleans", () => {
      expect(JSONPrimitiveValueSchema.parse("text")).toBe("text");
      expect(JSONPrimitiveValueSchema.parse(42)).toBe(42);
      expect(JSONPrimitiveValueSchema.parse(true)).toBe(true);
    });

    it("should reject infinite numbers", () => {
      expect(() => JSONPrimitiveValueSchema.parse(Infinity)).toThrow();
      expect(() => JSONPrimitiveValueSchema.parse(-Infinity)).toThrow();
      expect(() => JSONPrimitiveValueSchema.parse(NaN)).toThrow();
    });
  });

  describe("JSONValueSchema", () => {
    it("should accept primitives", () => {
      expect(JSONValueSchema.parse("text")).toBe("text");
      expect(JSONValueSchema.parse(42)).toBe(42);
    });

    it("should accept arrays", () => {
      const result = JSONValueSchema.parse([1, "two", true]);
      expect(result).toEqual([1, "two", true]);
    });

    it("should accept objects", () => {
      const result = JSONValueSchema.parse({ key: "value", num: 42 });
      expect(result).toEqual({ key: "value", num: 42 });
    });

    it("should accept nested structures", () => {
      const nested = {
        arr: [1, 2, { nested: true }],
        obj: { deep: { value: "test" } },
      };
      const result = JSONValueSchema.parse(nested);
      expect(result).toEqual(nested);
    });
  });

  describe("JSONObjectSchema", () => {
    it("should accept objects with JSON values", () => {
      const obj = {
        str: "text",
        num: 42,
        bool: true,
        arr: [1, 2, 3],
        nested: { key: "value" },
      };
      const result = JSONObjectSchema.parse(obj);
      expect(result).toEqual(obj);
    });

    it("should reject non-objects", () => {
      expect(() => JSONObjectSchema.parse([1, 2, 3])).toThrow();
    });
  });

  describe("JSONArraySchema", () => {
    it("should accept arrays with JSON values", () => {
      const arr = [1, "text", true, { key: "value" }, [1, 2]];
      const result = JSONArraySchema.parse(arr);
      expect(result).toEqual(arr);
    });

    it("should reject non-arrays", () => {
      expect(() => JSONArraySchema.parse({ key: "value" })).toThrow();
    });
  });

  describe("sanitizeEmailSubject", () => {
    it("should remove CRLF characters", () => {
      expect(sanitizeEmailSubject("Hello\r\nWorld")).toBe("HelloWorld");
      expect(sanitizeEmailSubject("Test\rLine\nBreaks")).toBe("TestLineBreaks");
    });

    it("should remove control characters", () => {
      expect(sanitizeEmailSubject("Hello\x00\x1FWorld")).toBe("HelloWorld");
      expect(sanitizeEmailSubject("Test\x7FString")).toBe("TestString");
    });

    it("should remove HTML tags", () => {
      expect(sanitizeEmailSubject("Hello<script>alert(1)</script>World")).toBe(
        "Helloscriptalert(1)/scriptWorld",
      );
      expect(sanitizeEmailSubject("<p>Test</p>")).toBe("pTest/p");
    });

    it("should trim whitespace", () => {
      expect(sanitizeEmailSubject("  Hello World  ")).toBe("Hello World");
      expect(sanitizeEmailSubject("\tTest\t")).toBe("Test");
    });

    it("should handle CRLF injection attempts", () => {
      const malicious = "Subject\r\nBCC: attacker@evil.com";
      expect(sanitizeEmailSubject(malicious)).toBe("SubjectBCC: attacker@evil.com");
    });

    it("should handle empty strings", () => {
      expect(sanitizeEmailSubject("")).toBe("");
      expect(sanitizeEmailSubject("   ")).toBe("");
    });

    it("should preserve normal text", () => {
      expect(sanitizeEmailSubject("Normal Subject Line")).toBe(
        "Normal Subject Line",
      );
      expect(sanitizeEmailSubject("Test 123 @#$%")).toBe("Test 123 @#$%");
    });

    it("should handle combined attack vectors", () => {
      const combined = "Test\r\n<script>alert(1)</script>\x00BCC: evil@test.com";
      const result = sanitizeEmailSubject(combined);
      expect(result).not.toContain("\r");
      expect(result).not.toContain("\n");
      expect(result).not.toContain("<");
      expect(result).not.toContain("\x00");
    });
  });
});
