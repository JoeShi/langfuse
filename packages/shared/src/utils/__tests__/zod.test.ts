import { describe, it, expect } from "vitest";
import {
  jsonSchema,
  jsonSchemaNullable,
  paginationZod,
  publicApiPaginationZod,
  optionalPaginationZod,
  validateZodSchema,
  sanitizeEmailSubject,
  JSONPrimitiveValueSchema,
  JSONValueSchema,
  JSONObjectSchema,
  JSONArraySchema,
  StringNoHTML,
  StringNoHTMLNonEmpty,
} from "../zod";

describe("zod schemas", () => {
  describe("JSON schema validators", () => {
    describe("jsonSchema", () => {
      it("should validate string at root level", () => {
        // Arrange & Act
        const result = jsonSchema.safeParse("test");

        // Assert
        expect(result.success).toBe(true);
      });

      it("should validate number at root level", () => {
        // Arrange & Act
        const result = jsonSchema.safeParse(42);

        // Assert
        expect(result.success).toBe(true);
      });

      it("should validate boolean at root level", () => {
        // Arrange & Act
        const result = jsonSchema.safeParse(true);

        // Assert
        expect(result.success).toBe(true);
      });

      it("should reject null at root level", () => {
        // Arrange & Act
        const result = jsonSchema.safeParse(null);

        // Assert
        expect(result.success).toBe(false);
      });

      it("should validate object at root level", () => {
        // Arrange & Act
        const result = jsonSchema.safeParse({ key: "value" });

        // Assert
        expect(result.success).toBe(true);
      });

      it("should validate array at root level", () => {
        // Arrange & Act
        const result = jsonSchema.safeParse([1, 2, 3]);

        // Assert
        expect(result.success).toBe(true);
      });

      it("should validate nested structures", () => {
        // Arrange
        const data = {
          string: "text",
          number: 42,
          boolean: true,
          null: null,
          nested: { deep: "value" },
          array: [1, "two", false, null],
        };

        // Act
        const result = jsonSchema.safeParse(data);

        // Assert
        expect(result.success).toBe(true);
      });
    });

    describe("jsonSchemaNullable", () => {
      it("should validate null", () => {
        // Arrange & Act
        const result = jsonSchemaNullable.safeParse(null);

        // Assert
        expect(result.success).toBe(true);
      });

      it("should validate primitives", () => {
        // Arrange & Act & Assert
        expect(jsonSchemaNullable.safeParse("test").success).toBe(true);
        expect(jsonSchemaNullable.safeParse(42).success).toBe(true);
        expect(jsonSchemaNullable.safeParse(true).success).toBe(true);
      });

      it("should validate objects", () => {
        // Arrange & Act
        const result = jsonSchemaNullable.safeParse({ key: null });

        // Assert
        expect(result.success).toBe(true);
      });

      it("should validate arrays", () => {
        // Arrange & Act
        const result = jsonSchemaNullable.safeParse([null, "test", null]);

        // Assert
        expect(result.success).toBe(true);
      });
    });

    describe("JSONPrimitiveValueSchema", () => {
      it("should validate string", () => {
        // Arrange & Act
        const result = JSONPrimitiveValueSchema.safeParse("test");

        // Assert
        expect(result.success).toBe(true);
      });

      it("should validate finite numbers", () => {
        // Arrange & Act & Assert
        expect(JSONPrimitiveValueSchema.safeParse(42).success).toBe(true);
        expect(JSONPrimitiveValueSchema.safeParse(0).success).toBe(true);
        expect(JSONPrimitiveValueSchema.safeParse(-10.5).success).toBe(true);
      });

      it("should validate booleans", () => {
        // Arrange & Act & Assert
        expect(JSONPrimitiveValueSchema.safeParse(true).success).toBe(true);
        expect(JSONPrimitiveValueSchema.safeParse(false).success).toBe(true);
      });

      it("should reject non-finite numbers", () => {
        // Arrange & Act & Assert
        expect(JSONPrimitiveValueSchema.safeParse(Infinity).success).toBe(
          false,
        );
        expect(JSONPrimitiveValueSchema.safeParse(-Infinity).success).toBe(
          false,
        );
        expect(JSONPrimitiveValueSchema.safeParse(NaN).success).toBe(false);
      });

      it("should reject null", () => {
        // Arrange & Act
        const result = JSONPrimitiveValueSchema.safeParse(null);

        // Assert
        expect(result.success).toBe(false);
      });
    });

    describe("JSONValueSchema", () => {
      it("should validate primitives", () => {
        // Arrange & Act & Assert
        expect(JSONValueSchema.safeParse("test").success).toBe(true);
        expect(JSONValueSchema.safeParse(42).success).toBe(true);
        expect(JSONValueSchema.safeParse(true).success).toBe(true);
      });

      it("should validate arrays", () => {
        // Arrange & Act
        const result = JSONValueSchema.safeParse([1, "two", true]);

        // Assert
        expect(result.success).toBe(true);
      });

      it("should validate objects", () => {
        // Arrange & Act
        const result = JSONValueSchema.safeParse({ key: "value" });

        // Assert
        expect(result.success).toBe(true);
      });

      it("should validate nested structures", () => {
        // Arrange
        const data = {
          array: [1, 2, { nested: "value" }],
          object: { deep: { deeper: ["array"] } },
        };

        // Act
        const result = JSONValueSchema.safeParse(data);

        // Assert
        expect(result.success).toBe(true);
      });
    });

    describe("JSONObjectSchema", () => {
      it("should validate empty object", () => {
        // Arrange & Act
        const result = JSONObjectSchema.safeParse({});

        // Assert
        expect(result.success).toBe(true);
      });

      it("should validate object with values", () => {
        // Arrange
        const data = { key1: "value", key2: 42, key3: true };

        // Act
        const result = JSONObjectSchema.safeParse(data);

        // Assert
        expect(result.success).toBe(true);
      });

      it("should reject arrays", () => {
        // Arrange & Act
        const result = JSONObjectSchema.safeParse([1, 2, 3]);

        // Assert
        expect(result.success).toBe(false);
      });
    });

    describe("JSONArraySchema", () => {
      it("should validate empty array", () => {
        // Arrange & Act
        const result = JSONArraySchema.safeParse([]);

        // Assert
        expect(result.success).toBe(true);
      });

      it("should validate array with values", () => {
        // Arrange
        const data = [1, "two", true, { nested: "object" }];

        // Act
        const result = JSONArraySchema.safeParse(data);

        // Assert
        expect(result.success).toBe(true);
      });

      it("should reject objects", () => {
        // Arrange & Act
        const result = JSONArraySchema.safeParse({ key: "value" });

        // Assert
        expect(result.success).toBe(false);
      });
    });
  });

  describe("pagination schemas", () => {
    describe("paginationZod", () => {
      it("should use default values when empty", () => {
        // Arrange & Act
        const result = paginationZod.page.parse("");

        // Assert
        expect(result).toBe(1);
      });

      it("should parse valid page number", () => {
        // Arrange & Act
        const result = paginationZod.page.parse("5");

        // Assert
        expect(result).toBe(5);
      });

      it("should parse valid limit", () => {
        // Arrange & Act
        const result = paginationZod.limit.parse("25");

        // Assert
        expect(result).toBe(25);
      });

      it("should use default page of 1", () => {
        // Arrange & Act
        const result = paginationZod.page.parse(undefined);

        // Assert
        expect(result).toBe(1);
      });

      it("should use default limit of 50", () => {
        // Arrange & Act
        const result = paginationZod.limit.parse(undefined);

        // Assert
        expect(result).toBe(50);
      });

      it("should enforce max limit of 100", () => {
        // Arrange & Act
        const result = paginationZod.limit.safeParse("150");

        // Assert
        expect(result.success).toBe(false);
      });

      it("should reject negative page", () => {
        // Arrange & Act
        const result = paginationZod.page.safeParse("-1");

        // Assert
        expect(result.success).toBe(false);
      });

      it("should accept zero page", () => {
        // Arrange & Act
        const result = paginationZod.page.parse("0");

        // Assert
        expect(result).toBe(0);
      });
    });

    describe("publicApiPaginationZod", () => {
      it("should require page greater than 0", () => {
        // Arrange & Act
        const result = publicApiPaginationZod.page.safeParse("0");

        // Assert
        expect(result.success).toBe(false);
      });

      it("should accept page 1", () => {
        // Arrange & Act
        const result = publicApiPaginationZod.page.parse("1");

        // Assert
        expect(result).toBe(1);
      });

      it("should use default page of 1", () => {
        // Arrange & Act
        const result = publicApiPaginationZod.page.parse(undefined);

        // Assert
        expect(result).toBe(1);
      });

      it("should use default limit of 50", () => {
        // Arrange & Act
        const result = publicApiPaginationZod.limit.parse(undefined);

        // Assert
        expect(result).toBe(50);
      });

      it("should enforce max limit of 100", () => {
        // Arrange & Act
        const result = publicApiPaginationZod.limit.safeParse("150");

        // Assert
        expect(result.success).toBe(false);
      });
    });

    describe("optionalPaginationZod", () => {
      it("should allow undefined page", () => {
        // Arrange & Act
        const result = optionalPaginationZod.page.parse(undefined);

        // Assert
        expect(result).toBeUndefined();
      });

      it("should allow undefined limit", () => {
        // Arrange & Act
        const result = optionalPaginationZod.limit.parse(undefined);

        // Assert
        expect(result).toBeUndefined();
      });

      it("should parse provided page", () => {
        // Arrange & Act
        const result = optionalPaginationZod.page.parse("5");

        // Assert
        expect(result).toBe(5);
      });

      it("should parse provided limit", () => {
        // Arrange & Act
        const result = optionalPaginationZod.limit.parse("25");

        // Assert
        expect(result).toBe(25);
      });

      it("should handle empty string as undefined", () => {
        // Arrange & Act
        const result = optionalPaginationZod.page.safeParse("");

        // Assert
        // Empty string coerces to NaN which fails validation
        expect(result.success).toBe(false);
      });
    });
  });

  describe("validateZodSchema", () => {
    it("should validate and return parsed object", () => {
      // Arrange
      const schema = JSONObjectSchema;
      const data = { key: "value" };

      // Act
      const result = validateZodSchema(schema, data);

      // Assert
      expect(result).toEqual(data);
    });

    it("should throw on invalid data", () => {
      // Arrange
      const schema = JSONObjectSchema;
      const data = "not an object";

      // Act & Assert
      expect(() => validateZodSchema(schema, data)).toThrow();
    });

    it("should work with custom schemas", () => {
      // Arrange
      const schema = JSONValueSchema;
      const data = [1, 2, 3];

      // Act
      const result = validateZodSchema(schema, data);

      // Assert
      expect(result).toEqual(data);
    });

    it("should preserve type information", () => {
      // Arrange
      const schema = JSONObjectSchema;
      const data = { name: "test", count: 42 };

      // Act
      const result = validateZodSchema(schema, data);

      // Assert
      expect(result.name).toBe("test");
      expect(result.count).toBe(42);
    });
  });

  describe("sanitizeEmailSubject", () => {
    describe("CRLF injection protection", () => {
      it("should remove carriage return characters", () => {
        // Arrange
        const input = "Subject\rLine";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).toBe("SubjectLine");
        expect(result).not.toContain("\r");
      });

      it("should remove line feed characters", () => {
        // Arrange
        const input = "Subject\nLine";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).toBe("SubjectLine");
        expect(result).not.toContain("\n");
      });

      it("should remove CRLF sequences", () => {
        // Arrange
        const input = "Subject\r\nBCC: attacker@evil.com";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).toBe("SubjectBCC: attacker@evil.com");
        expect(result).not.toContain("\r");
        expect(result).not.toContain("\n");
      });

      it("should prevent header injection attack", () => {
        // Arrange
        const input = "Test\r\nBCC: hacker@bad.com\r\nSubject: Injected";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).not.toContain("\r\n");
        expect(result).toBe("TestBCC: hacker@bad.comSubject: Injected");
      });
    });

    describe("control character removal", () => {
      it("should remove null character", () => {
        // Arrange
        const input = "Test\x00Subject";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).toBe("TestSubject");
      });

      it("should remove tab character", () => {
        // Arrange
        const input = "Test\tSubject";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).toBe("TestSubject");
      });

      it("should remove all control characters (ASCII 0-31)", () => {
        // Arrange
        const input = "Test\x01\x02\x03\x1FSubject";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).toBe("TestSubject");
      });

      it("should remove DEL character (ASCII 127)", () => {
        // Arrange
        const input = "Test\x7FSubject";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).toBe("TestSubject");
      });
    });

    describe("HTML tag removal", () => {
      it("should remove simple HTML tags", () => {
        // Arrange
        const input = "Test<script>alert(1)</script>Subject";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).toBe("Testalert(1)Subject");
        expect(result).not.toContain("<");
        expect(result).not.toContain(">");
      });

      it("should remove self-closing tags", () => {
        // Arrange
        const input = "Test<br/>Subject";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).toBe("TestSubject");
      });

      it("should remove tags with attributes", () => {
        // Arrange
        const input = 'Test<div class="bad">Content</div>Subject';

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).toBe("TestContentSubject");
      });

      it("should remove multiple tags", () => {
        // Arrange
        const input = "<b>Bold</b> and <i>Italic</i>";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).toBe("Bold and Italic");
      });
    });

    describe("whitespace handling", () => {
      it("should trim leading whitespace", () => {
        // Arrange
        const input = "   Test Subject";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).toBe("Test Subject");
      });

      it("should trim trailing whitespace", () => {
        // Arrange
        const input = "Test Subject   ";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).toBe("Test Subject");
      });

      it("should trim both leading and trailing whitespace", () => {
        // Arrange
        const input = "   Test Subject   ";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).toBe("Test Subject");
      });

      it("should preserve internal spaces", () => {
        // Arrange
        const input = "Test   Multiple   Spaces";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).toBe("Test   Multiple   Spaces");
      });
    });

    describe("security edge cases", () => {
      it("should handle mixed attack vectors", () => {
        // Arrange
        const input =
          "Subject\r\n<script>alert(1)</script>\x00BCC: evil@bad.com";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).not.toContain("\r");
        expect(result).not.toContain("\n");
        expect(result).not.toContain("<");
        expect(result).not.toContain(">");
        expect(result).not.toContain("\x00");
      });

      it("should handle encoded characters", () => {
        // Arrange
        const input = "Test\u0000\u000d\u000aSubject";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).toBe("TestSubject");
      });

      it("should handle unicode line separators", () => {
        // Arrange
        const input = "Test\u2028\u2029Subject"; // Line and paragraph separators

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        // Unicode line separators are not removed (only ASCII control chars)
        expect(result).toContain("Subject");
      });

      it("should prevent multiple injection attempts", () => {
        // Arrange
        const input =
          "Subject\r\nBCC: a@evil.com\r\nBCC: b@evil.com\r\nBCC: c@evil.com";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).not.toContain("\r\n");
        expect(result.match(/\r/g)).toBeNull();
        expect(result.match(/\n/g)).toBeNull();
      });
    });

    describe("normal cases", () => {
      it("should preserve safe subject lines", () => {
        // Arrange
        const input = "Welcome to Our Service";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).toBe("Welcome to Our Service");
      });

      it("should preserve special characters", () => {
        // Arrange
        const input = "Order #12345 - Confirmation!";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).toBe("Order #12345 - Confirmation!");
      });

      it("should preserve unicode characters", () => {
        // Arrange
        const input = "Hello 世界 🎉";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).toBe("Hello 世界 🎉");
      });

      it("should handle empty string", () => {
        // Arrange
        const input = "";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).toBe("");
      });

      it("should handle whitespace-only string", () => {
        // Arrange
        const input = "   ";

        // Act
        const result = sanitizeEmailSubject(input);

        // Assert
        expect(result).toBe("");
      });
    });

    describe("real-world scenarios", () => {
      it("should sanitize user-provided names", () => {
        // Arrange
        const userName = "John\r\nBCC: attacker@evil.com";
        const subject = `Welcome ${userName} to our platform`;

        // Act
        const result = sanitizeEmailSubject(subject);

        // Assert
        expect(result).not.toContain("\r\n");
        expect(result).toContain("Welcome");
        expect(result).toContain("John");
      });

      it("should sanitize project names", () => {
        // Arrange
        const projectName = "<script>alert('xss')</script>Project";
        const subject = `Project ${projectName} created`;

        // Act
        const result = sanitizeEmailSubject(subject);

        // Assert
        expect(result).not.toContain("<script>");
        expect(result).toContain("Project");
      });

      it("should handle combined user input", () => {
        // Arrange
        const name = "User\nName";
        const project = "Proj<tag>ect";
        const subject = `${name} invited to ${project}`;

        // Act
        const result = sanitizeEmailSubject(subject);

        // Assert
        expect(result).toBe("UserName invited to Project");
      });
    });
  });

  describe("StringNoHTML", () => {
    it("should accept strings without HTML", () => {
      // Arrange & Act
      const result = StringNoHTML.safeParse("Plain text");

      // Assert
      expect(result.success).toBe(true);
    });

    it("should reject strings with HTML tags", () => {
      // Arrange & Act
      const result = StringNoHTML.safeParse("<div>Text</div>");

      // Assert
      expect(result.success).toBe(false);
    });

    it("should accept empty string", () => {
      // Arrange & Act
      const result = StringNoHTML.safeParse("");

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("StringNoHTMLNonEmpty", () => {
    it("should accept non-empty strings without HTML", () => {
      // Arrange & Act
      const result = StringNoHTMLNonEmpty.safeParse("Plain text");

      // Assert
      expect(result.success).toBe(true);
    });

    it("should reject empty string", () => {
      // Arrange & Act
      const result = StringNoHTMLNonEmpty.safeParse("");

      // Assert
      expect(result.success).toBe(false);
    });

    it("should reject strings with HTML", () => {
      // Arrange & Act
      const result = StringNoHTMLNonEmpty.safeParse("<b>Text</b>");

      // Assert
      expect(result.success).toBe(false);
    });
  });
});
