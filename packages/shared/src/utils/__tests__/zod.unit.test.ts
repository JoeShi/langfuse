import { expect, describe, it } from "vitest";
import { z } from "zod/v4";
import {
  validateZodSchema,
  sanitizeEmailSubject,
  jsonSchema,
  jsonSchemaNullable,
  paginationZod,
  publicApiPaginationZod,
  optionalPaginationZod,
  urlRegex,
  noUrlCheck,
  NonEmptyString,
  htmlRegex,
  StringNoHTML,
  StringNoHTMLNonEmpty,
  JSONPrimitiveValueSchema,
  JSONValueSchema,
  JSONObjectSchema,
  JSONArraySchema,
} from "../zod";

describe("validateZodSchema", () => {
  it("should validate correct data", () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const data = { name: "John", age: 30 };
    const result = validateZodSchema(schema, data);
    expect(result).toEqual(data);
  });

  it("should throw on invalid data", () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const data = { name: "John", age: "thirty" };
    expect(() => validateZodSchema(schema, data as any)).toThrow();
  });

  it("should work with complex schemas", () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
        email: z.string().email(),
      }),
      tags: z.array(z.string()),
    });
    const data = {
      user: { name: "John", email: "john@example.com" },
      tags: ["tag1", "tag2"],
    };
    const result = validateZodSchema(schema, data);
    expect(result).toEqual(data);
  });
});

describe("sanitizeEmailSubject", () => {
  describe("CRLF injection prevention", () => {
    it("should remove carriage return characters", () => {
      const result = sanitizeEmailSubject("Subject\rLine");
      expect(result).toBe("SubjectLine");
    });

    it("should remove newline characters", () => {
      const result = sanitizeEmailSubject("Subject\nLine");
      expect(result).toBe("SubjectLine");
    });

    it("should remove CRLF sequences", () => {
      const result = sanitizeEmailSubject("Subject\r\nBCC: attacker@evil.com");
      expect(result).toBe("SubjectBCC: attacker@evil.com");
    });

    it("should handle multiple CRLF sequences", () => {
      const result = sanitizeEmailSubject("Line1\r\nLine2\r\nLine3");
      expect(result).toBe("Line1Line2Line3");
    });
  });

  describe("control character removal", () => {
    it("should remove control characters", () => {
      const result = sanitizeEmailSubject("Test\x00String");
      expect(result).toBe("TestString");
    });

    it("should remove tab characters", () => {
      const result = sanitizeEmailSubject("Test\tString");
      expect(result).toBe("TestString");
    });

    it("should remove all ASCII control characters", () => {
      let input = "Test";
      for (let i = 0; i <= 31; i++) {
        input += String.fromCharCode(i);
      }
      input += "String";
      const result = sanitizeEmailSubject(input);
      expect(result).toBe("TestString");
    });

    it("should remove DEL character (ASCII 127)", () => {
      const result = sanitizeEmailSubject("Test\x7FString");
      expect(result).toBe("TestString");
    });
  });

  describe("HTML tag removal", () => {
    it("should remove HTML tags", () => {
      const result = sanitizeEmailSubject("Test<script>alert(1)</script>");
      expect(result).toBe("Testalert(1)");
    });

    it("should remove multiple HTML tags", () => {
      const result = sanitizeEmailSubject("<b>Bold</b> and <i>Italic</i>");
      expect(result).toBe("Bold and Italic");
    });

    it("should remove self-closing tags", () => {
      const result = sanitizeEmailSubject("Test<br/>String");
      expect(result).toBe("TestString");
    });

    it("should remove tags with attributes", () => {
      const result = sanitizeEmailSubject('<a href="test">Link</a>');
      expect(result).toBe("Link");
    });
  });

  describe("whitespace handling", () => {
    it("should trim leading whitespace", () => {
      const result = sanitizeEmailSubject("   Test");
      expect(result).toBe("Test");
    });

    it("should trim trailing whitespace", () => {
      const result = sanitizeEmailSubject("Test   ");
      expect(result).toBe("Test");
    });

    it("should trim both leading and trailing whitespace", () => {
      const result = sanitizeEmailSubject("   Test   ");
      expect(result).toBe("Test");
    });

    it("should preserve internal spaces", () => {
      const result = sanitizeEmailSubject("Test  String");
      expect(result).toBe("Test  String");
    });
  });

  describe("combined scenarios", () => {
    it("should handle multiple attack vectors", () => {
      const result = sanitizeEmailSubject(
        "Subject\r\nBCC: evil@test.com<script>alert(1)</script>\x00"
      );
      expect(result).toBe("SubjectBCC: evil@test.comalert(1)");
    });

    it("should handle normal safe strings", () => {
      const result = sanitizeEmailSubject("Welcome to Langfuse");
      expect(result).toBe("Welcome to Langfuse");
    });

    it("should handle Unicode characters", () => {
      const result = sanitizeEmailSubject("Hello 你好 🎉");
      expect(result).toBe("Hello 你好 🎉");
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      const result = sanitizeEmailSubject("");
      expect(result).toBe("");
    });

    it("should handle only whitespace", () => {
      const result = sanitizeEmailSubject("   ");
      expect(result).toBe("");
    });

    it("should handle only control characters", () => {
      const result = sanitizeEmailSubject("\r\n\t\x00");
      expect(result).toBe("");
    });

    it("should handle very long strings", () => {
      const longString = "A".repeat(1000);
      const result = sanitizeEmailSubject(longString);
      expect(result).toBe(longString);
    });
  });
});

describe("JSON schemas", () => {
  describe("jsonSchema", () => {
    it("should validate string values", () => {
      const result = jsonSchema.parse("hello");
      expect(result).toBe("hello");
    });

    it("should validate number values", () => {
      const result = jsonSchema.parse(123);
      expect(result).toBe(123);
    });

    it("should validate boolean values", () => {
      const result = jsonSchema.parse(true);
      expect(result).toBe(true);
    });

    it("should validate objects", () => {
      const obj = { key: "value", nested: { deep: "data" } };
      const result = jsonSchema.parse(obj);
      expect(result).toEqual(obj);
    });

    it("should validate arrays", () => {
      const arr = [1, "two", true, null];
      const result = jsonSchema.parse(arr);
      expect(result).toEqual(arr);
    });

    it("should not allow null at root level", () => {
      expect(() => jsonSchema.parse(null)).toThrow();
    });

    it("should allow null in nested values", () => {
      const obj = { key: null };
      const result = jsonSchema.parse(obj);
      expect(result).toEqual(obj);
    });
  });

  describe("jsonSchemaNullable", () => {
    it("should allow null values", () => {
      const result = jsonSchemaNullable.parse(null);
      expect(result).toBeNull();
    });

    it("should validate nested structures", () => {
      const obj = { a: null, b: "string", c: 123 };
      const result = jsonSchemaNullable.parse(obj);
      expect(result).toEqual(obj);
    });
  });

  describe("JSONPrimitiveValueSchema", () => {
    it("should validate string", () => {
      const result = JSONPrimitiveValueSchema.parse("test");
      expect(result).toBe("test");
    });

    it("should validate finite numbers", () => {
      const result = JSONPrimitiveValueSchema.parse(42);
      expect(result).toBe(42);
    });

    it("should validate boolean", () => {
      const result = JSONPrimitiveValueSchema.parse(false);
      expect(result).toBe(false);
    });

    it("should reject Infinity", () => {
      expect(() => JSONPrimitiveValueSchema.parse(Infinity)).toThrow();
    });

    it("should reject NaN", () => {
      expect(() => JSONPrimitiveValueSchema.parse(NaN)).toThrow();
    });
  });

  describe("JSONValueSchema", () => {
    it("should validate primitives", () => {
      expect(JSONValueSchema.parse("string")).toBe("string");
      expect(JSONValueSchema.parse(123)).toBe(123);
      expect(JSONValueSchema.parse(true)).toBe(true);
    });

    it("should validate arrays", () => {
      const arr = [1, "two", true];
      const result = JSONValueSchema.parse(arr);
      expect(result).toEqual(arr);
    });

    it("should validate objects", () => {
      const obj = { key: "value" };
      const result = JSONValueSchema.parse(obj);
      expect(result).toEqual(obj);
    });
  });

  describe("JSONObjectSchema", () => {
    it("should validate object with string keys", () => {
      const obj = { key1: "value1", key2: 123 };
      const result = JSONObjectSchema.parse(obj);
      expect(result).toEqual(obj);
    });

    it("should reject arrays", () => {
      expect(() => JSONObjectSchema.parse([1, 2, 3])).toThrow();
    });
  });

  describe("JSONArraySchema", () => {
    it("should validate arrays", () => {
      const arr = [1, "two", { three: 3 }];
      const result = JSONArraySchema.parse(arr);
      expect(result).toEqual(arr);
    });

    it("should reject objects", () => {
      expect(() => JSONArraySchema.parse({ key: "value" })).toThrow();
    });
  });
});

describe("pagination schemas", () => {
  describe("paginationZod", () => {
    it("should use default page value of 1", () => {
      const schema = z.object(paginationZod);
      const result = schema.parse({});
      expect(result.page).toBe(1);
    });

    it("should use default limit value of 50", () => {
      const schema = z.object(paginationZod);
      const result = schema.parse({});
      expect(result.limit).toBe(50);
    });

    it("should coerce string page to number", () => {
      const schema = z.object(paginationZod);
      const result = schema.parse({ page: "3" });
      expect(result.page).toBe(3);
    });

    it("should coerce string limit to number", () => {
      const schema = z.object(paginationZod);
      const result = schema.parse({ limit: "25" });
      expect(result.limit).toBe(25);
    });

    it("should handle empty string as default", () => {
      const schema = z.object(paginationZod);
      const result = schema.parse({ page: "", limit: "" });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });

    it("should accept nonnegative page values", () => {
      const schema = z.object(paginationZod);
      const result = schema.parse({ page: 0 });
      expect(result.page).toBe(0);
    });

    it("should enforce limit <= 100", () => {
      const schema = z.object(paginationZod);
      expect(() => schema.parse({ limit: 101 })).toThrow();
    });

    it("should allow limit of 100", () => {
      const schema = z.object(paginationZod);
      const result = schema.parse({ limit: 100 });
      expect(result.limit).toBe(100);
    });
  });

  describe("publicApiPaginationZod", () => {
    it("should use default page value of 1", () => {
      const schema = z.object(publicApiPaginationZod);
      const result = schema.parse({});
      expect(result.page).toBe(1);
    });

    it("should use default limit value of 50", () => {
      const schema = z.object(publicApiPaginationZod);
      const result = schema.parse({});
      expect(result.limit).toBe(50);
    });

    it("should require page > 0", () => {
      const schema = z.object(publicApiPaginationZod);
      expect(() => schema.parse({ page: 0 })).toThrow();
    });

    it("should allow page >= 1", () => {
      const schema = z.object(publicApiPaginationZod);
      const result = schema.parse({ page: 1 });
      expect(result.page).toBe(1);
    });

    it("should enforce limit <= 100", () => {
      const schema = z.object(publicApiPaginationZod);
      expect(() => schema.parse({ limit: 101 })).toThrow();
    });
  });

  describe("optionalPaginationZod", () => {
    it("should allow undefined page", () => {
      const schema = z.object(optionalPaginationZod);
      const result = schema.parse({});
      expect(result.page).toBeUndefined();
    });

    it("should allow undefined limit", () => {
      const schema = z.object(optionalPaginationZod);
      const result = schema.parse({});
      expect(result.limit).toBeUndefined();
    });

    it("should coerce string values", () => {
      const schema = z.object(optionalPaginationZod);
      const result = schema.parse({ page: "5", limit: "20" });
      expect(result.page).toBe(5);
      expect(result.limit).toBe(20);
    });

    it("should handle empty strings as undefined", () => {
      const schema = z.object(optionalPaginationZod);
      const result = schema.parse({ page: "", limit: "" });
      expect(result.page).toBeUndefined();
      expect(result.limit).toBeUndefined();
    });
  });
});

describe("URL regex and validation", () => {
  describe("urlRegex", () => {
    it("should match http URLs", () => {
      expect(urlRegex.test("http://example.com")).toBe(true);
    });

    it("should match https URLs", () => {
      expect(urlRegex.test("https://example.com")).toBe(true);
    });

    it("should match URLs with paths", () => {
      expect(urlRegex.test("https://example.com/path/to/page")).toBe(true);
    });

    it("should match URLs with query strings", () => {
      expect(urlRegex.test("https://example.com?key=value")).toBe(true);
    });

    it("should not match non-URLs", () => {
      expect(urlRegex.test("not a url")).toBe(false);
    });

    it("should not match incomplete URLs", () => {
      expect(urlRegex.test("http://")).toBe(false);
    });
  });

  describe("noUrlCheck", () => {
    it("should return true for non-URL strings", () => {
      expect(noUrlCheck("just text")).toBe(true);
    });

    it("should return false for URLs", () => {
      expect(noUrlCheck("https://example.com")).toBe(false);
    });
  });
});

describe("HTML detection", () => {
  describe("htmlRegex", () => {
    it("should match HTML tags", () => {
      expect(htmlRegex.test("<div>content</div>")).toBe(true);
    });

    it("should match self-closing tags", () => {
      expect(htmlRegex.test("text<br/>more")).toBe(true);
    });

    it("should not match plain text", () => {
      expect(htmlRegex.test("plain text")).toBe(false);
    });

    it("should match tags with attributes", () => {
      expect(htmlRegex.test('<a href="link">text</a>')).toBe(true);
    });
  });

  describe("StringNoHTML", () => {
    it("should accept strings without HTML", () => {
      const result = StringNoHTML.parse("plain text");
      expect(result).toBe("plain text");
    });

    it("should reject strings with HTML tags", () => {
      expect(() => StringNoHTML.parse("<div>content</div>")).toThrow();
    });

    it("should accept empty string", () => {
      const result = StringNoHTML.parse("");
      expect(result).toBe("");
    });
  });

  describe("StringNoHTMLNonEmpty", () => {
    it("should accept non-empty strings without HTML", () => {
      const result = StringNoHTMLNonEmpty.parse("text");
      expect(result).toBe("text");
    });

    it("should reject empty strings", () => {
      expect(() => StringNoHTMLNonEmpty.parse("")).toThrow();
    });

    it("should reject strings with HTML", () => {
      expect(() => StringNoHTMLNonEmpty.parse("<b>bold</b>")).toThrow();
    });
  });
});

describe("NonEmptyString", () => {
  it("should accept non-empty strings", () => {
    const result = NonEmptyString.parse("hello");
    expect(result).toBe("hello");
  });

  it("should reject empty strings", () => {
    expect(() => NonEmptyString.parse("")).toThrow();
  });

  it("should accept strings with whitespace", () => {
    const result = NonEmptyString.parse(" ");
    expect(result).toBe(" ");
  });
});
