import { expect, describe, it } from "vitest";
import { extractPlaceholderNames } from "../prompts";

describe("extractPlaceholderNames", () => {
  describe("extracting placeholder names", () => {
    it("should extract placeholder names from messages", () => {
      const messages = [
        { type: "placeholder", name: "user_name" },
        { type: "placeholder", name: "age" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["user_name", "age"]);
    });

    it("should extract single placeholder", () => {
      const messages = [{ type: "placeholder", name: "variable" }];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["variable"]);
    });

    it("should preserve order of placeholders", () => {
      const messages = [
        { type: "placeholder", name: "first" },
        { type: "placeholder", name: "second" },
        { type: "placeholder", name: "third" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["first", "second", "third"]);
    });
  });

  describe("filtering non-placeholder types", () => {
    it("should filter out non-placeholder messages", () => {
      const messages = [
        { type: "placeholder", name: "user_name" },
        { type: "text", name: "not_a_placeholder" },
        { type: "placeholder", name: "age" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["user_name", "age"]);
    });

    it("should filter messages without type", () => {
      const messages = [
        { type: "placeholder", name: "valid" },
        { name: "no_type" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["valid"]);
    });

    it("should filter messages with undefined type", () => {
      const messages = [
        { type: "placeholder", name: "valid" },
        { type: undefined, name: "undefined_type" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["valid"]);
    });

    it("should filter messages with different types", () => {
      const messages = [
        { type: "system", name: "system_msg" },
        { type: "user", name: "user_msg" },
        { type: "placeholder", name: "actual_placeholder" },
        { type: "assistant", name: "assistant_msg" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["actual_placeholder"]);
    });
  });

  describe("handling messages without placeholders", () => {
    it("should return empty array for messages without placeholders", () => {
      const messages = [
        { type: "text", name: "text1" },
        { type: "system", name: "system1" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual([]);
    });

    it("should return empty array for empty messages array", () => {
      const messages: any[] = [];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual([]);
    });
  });

  describe("handling missing or invalid name", () => {
    it("should filter placeholders without name", () => {
      const messages = [
        { type: "placeholder", name: "valid" },
        { type: "placeholder" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["valid"]);
    });

    it("should filter placeholders with null name", () => {
      const messages = [
        { type: "placeholder", name: "valid" },
        { type: "placeholder", name: null },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["valid"]);
    });

    it("should filter placeholders with undefined name", () => {
      const messages = [
        { type: "placeholder", name: "valid" },
        { type: "placeholder", name: undefined },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["valid"]);
    });

    it("should filter placeholders with non-string name", () => {
      const messages = [
        { type: "placeholder", name: "valid" },
        { type: "placeholder", name: 123 },
        { type: "placeholder", name: true },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["valid"]);
    });

    it("should filter placeholders with empty string name", () => {
      const messages = [
        { type: "placeholder", name: "valid" },
        { type: "placeholder", name: "" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["valid"]);
    });
  });

  describe("mixed scenarios", () => {
    it("should handle messages with additional properties", () => {
      const messages = [
        {
          type: "placeholder",
          name: "user_name",
          role: "user",
          content: "Some content",
        },
        { type: "placeholder", name: "age", role: "system" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["user_name", "age"]);
    });

    it("should handle all valid placeholders in complex array", () => {
      const messages = [
        { type: "system", name: "sys", role: "system", content: "Hello" },
        { type: "placeholder", name: "var1" },
        { type: "user", name: "usr", role: "user" },
        { type: "placeholder", name: "var2", role: "placeholder" },
        { type: "text", name: "txt" },
        { type: "placeholder", name: "var3", content: "content" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["var1", "var2", "var3"]);
    });

    it("should handle placeholders with special characters in names", () => {
      const messages = [
        { type: "placeholder", name: "user_name_123" },
        { type: "placeholder", name: "var-with-dash" },
        { type: "placeholder", name: "var.with.dot" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["user_name_123", "var-with-dash", "var.with.dot"]);
    });

    it("should handle duplicate placeholder names", () => {
      const messages = [
        { type: "placeholder", name: "duplicate" },
        { type: "placeholder", name: "unique" },
        { type: "placeholder", name: "duplicate" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["duplicate", "unique", "duplicate"]);
    });
  });

  describe("edge cases", () => {
    it("should handle messages with only role property", () => {
      const messages = [{ type: "placeholder", role: "user" }];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual([]);
    });

    it("should handle messages with only content property", () => {
      const messages = [{ type: "placeholder", content: "content" }];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual([]);
    });

    it("should handle messages with whitespace-only names", () => {
      const messages = [
        { type: "placeholder", name: "valid" },
        { type: "placeholder", name: "   " },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["valid", "   "]);
    });
  });
});
