import { describe, it, expect } from "vitest";
import { extractPlaceholderNames, PromptMessage } from "../prompts";

describe("extractPlaceholderNames", () => {
  describe("placeholder extraction", () => {
    it("should extract single placeholder name", () => {
      // Arrange
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "user_input" },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual(["user_input"]);
    });

    it("should extract multiple placeholder names", () => {
      // Arrange
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "name" },
        { type: "placeholder", name: "email" },
        { type: "placeholder", name: "address" },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual(["name", "email", "address"]);
    });

    it("should extract placeholders mixed with other message types", () => {
      // Arrange
      const messages: PromptMessage[] = [
        { type: "text", content: "Hello" },
        { type: "placeholder", name: "user_name" },
        { type: "text", content: "Welcome" },
        { type: "placeholder", name: "greeting" },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual(["user_name", "greeting"]);
    });

    it("should handle placeholders with underscores", () => {
      // Arrange
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "user_first_name" },
        { type: "placeholder", name: "user_last_name" },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual(["user_first_name", "user_last_name"]);
    });

    it("should handle placeholders with camelCase names", () => {
      // Arrange
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "userName" },
        { type: "placeholder", name: "userEmail" },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual(["userName", "userEmail"]);
    });
  });

  describe("empty array scenarios", () => {
    it("should return empty array for empty messages", () => {
      // Arrange
      const messages: PromptMessage[] = [];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual([]);
    });

    it("should return empty array when no placeholders present", () => {
      // Arrange
      const messages: PromptMessage[] = [
        { type: "text", content: "Hello" },
        { type: "user", role: "user", content: "Hi" },
        { type: "assistant", role: "assistant", content: "Hey" },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual([]);
    });

    it("should return empty array when all placeholders have no name", () => {
      // Arrange
      const messages: PromptMessage[] = [
        { type: "placeholder" },
        { type: "placeholder", name: undefined },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("invalid message filtering", () => {
    it("should filter out messages with wrong type", () => {
      // Arrange
      const messages: PromptMessage[] = [
        { type: "text", name: "should_not_appear" },
        { type: "placeholder", name: "valid" },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual(["valid"]);
    });

    it("should filter out placeholders without name", () => {
      // Arrange
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "valid" },
        { type: "placeholder" },
        { type: "placeholder", name: "also_valid" },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual(["valid", "also_valid"]);
    });

    it("should filter out placeholders with undefined name", () => {
      // Arrange
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "valid" },
        { type: "placeholder", name: undefined },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual(["valid"]);
    });

    it("should filter out placeholders with non-string name", () => {
      // Arrange
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "valid" },
        { type: "placeholder", name: 123 as any },
        { type: "placeholder", name: null as any },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual(["valid"]);
    });

    it("should handle empty string names", () => {
      // Arrange
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "valid" },
        { type: "placeholder", name: "" },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual(["valid", ""]);
    });
  });

  describe("edge cases", () => {
    it("should handle single placeholder", () => {
      // Arrange
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "single" },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual(["single"]);
      expect(result.length).toBe(1);
    });

    it("should preserve order of placeholders", () => {
      // Arrange
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "third" },
        { type: "placeholder", name: "first" },
        { type: "placeholder", name: "second" },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual(["third", "first", "second"]);
    });

    it("should handle duplicate placeholder names", () => {
      // Arrange
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "duplicate" },
        { type: "placeholder", name: "unique" },
        { type: "placeholder", name: "duplicate" },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual(["duplicate", "unique", "duplicate"]);
      expect(result.length).toBe(3);
    });

    it("should handle messages with all properties", () => {
      // Arrange
      const messages: PromptMessage[] = [
        {
          type: "placeholder",
          name: "full",
          role: "user",
          content: "some content",
        },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual(["full"]);
    });

    it("should handle very long placeholder names", () => {
      // Arrange
      const longName = "a".repeat(1000);
      const messages: PromptMessage[] = [
        { type: "placeholder", name: longName },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual([longName]);
      expect(result[0].length).toBe(1000);
    });

    it("should handle special characters in names", () => {
      // Arrange
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "name-with-dashes" },
        { type: "placeholder", name: "name.with.dots" },
        { type: "placeholder", name: "name$with$dollar" },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual([
        "name-with-dashes",
        "name.with.dots",
        "name$with$dollar",
      ]);
    });

    it("should handle unicode characters in names", () => {
      // Arrange
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "用户名" },
        { type: "placeholder", name: "имя" },
        { type: "placeholder", name: "🎉emoji🎉" },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual(["用户名", "имя", "🎉emoji🎉"]);
    });

    it("should handle whitespace in names", () => {
      // Arrange
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "name with spaces" },
        { type: "placeholder", name: " leading_space" },
        { type: "placeholder", name: "trailing_space " },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual([
        "name with spaces",
        " leading_space",
        "trailing_space ",
      ]);
    });

    it("should handle numeric-only names", () => {
      // Arrange
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "123" },
        { type: "placeholder", name: "456" },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual(["123", "456"]);
    });
  });

  describe("large datasets", () => {
    it("should handle large number of placeholders", () => {
      // Arrange
      const messages: PromptMessage[] = Array.from(
        { length: 1000 },
        (_, i) => ({
          type: "placeholder",
          name: `placeholder_${i}`,
        }),
      );

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result.length).toBe(1000);
      expect(result[0]).toBe("placeholder_0");
      expect(result[999]).toBe("placeholder_999");
    });

    it("should handle large mixed message arrays", () => {
      // Arrange
      const messages: PromptMessage[] = [];
      for (let i = 0; i < 500; i++) {
        messages.push({ type: "text", content: `text ${i}` });
        messages.push({ type: "placeholder", name: `placeholder_${i}` });
      }

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result.length).toBe(500);
      expect(result[0]).toBe("placeholder_0");
      expect(result[499]).toBe("placeholder_499");
    });
  });

  describe("type guard functionality", () => {
    it("should properly type narrow placeholders", () => {
      // Arrange
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "test" },
        { type: "text", content: "not a placeholder" },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert - If type guard works, only placeholder names are extracted
      expect(result).toEqual(["test"]);
      expect(typeof result[0]).toBe("string");
    });

    it("should handle messages without explicit type", () => {
      // Arrange
      const messages: PromptMessage[] = [
        { name: "no_type" } as any,
        { type: "placeholder", name: "with_type" },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual(["with_type"]);
    });
  });

  describe("mixed content scenarios", () => {
    it("should handle realistic prompt structure", () => {
      // Arrange
      const messages: PromptMessage[] = [
        {
          type: "system",
          role: "system",
          content: "You are a helpful assistant",
        },
        { type: "placeholder", name: "context" },
        { type: "user", role: "user", content: "User message" },
        { type: "placeholder", name: "question" },
        { type: "assistant", role: "assistant", content: "Response" },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual(["context", "question"]);
    });

    it("should handle nested content structures", () => {
      // Arrange
      const messages: PromptMessage[] = [
        {
          type: "placeholder",
          name: "main",
          content: JSON.stringify({ nested: "data" }),
        },
        { type: "text", content: "Some text" },
        { type: "placeholder", name: "secondary" },
      ];

      // Act
      const result = extractPlaceholderNames(messages);

      // Assert
      expect(result).toEqual(["main", "secondary"]);
    });
  });
});
