import { describe, it, expect } from "vitest";
import { extractPlaceholderNames, PromptMessage } from "../prompts";

describe("prompts.ts", () => {
  describe("extractPlaceholderNames", () => {
    it("should extract placeholder names from messages", () => {
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "user_input" },
        { type: "placeholder", name: "system_prompt" },
        { type: "text", content: "Some text" },
      ];

      const result = extractPlaceholderNames(messages);

      expect(result).toEqual(["user_input", "system_prompt"]);
    });

    it("should handle messages without placeholders", () => {
      const messages: PromptMessage[] = [
        { type: "text", content: "Message 1" },
        { type: "text", content: "Message 2" },
      ];

      const result = extractPlaceholderNames(messages);

      expect(result).toEqual([]);
    });

    it("should handle empty messages array", () => {
      const messages: PromptMessage[] = [];

      const result = extractPlaceholderNames(messages);

      expect(result).toEqual([]);
    });

    it("should ignore placeholders without name property", () => {
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "valid_name" },
        { type: "placeholder" }, // missing name
        { type: "placeholder", name: "another_valid" },
      ];

      const result = extractPlaceholderNames(messages);

      expect(result).toEqual(["valid_name", "another_valid"]);
    });

    it("should ignore placeholders with non-string name", () => {
      const messages: any[] = [
        { type: "placeholder", name: "valid_name" },
        { type: "placeholder", name: 123 }, // non-string name
        { type: "placeholder", name: null }, // null name
        { type: "placeholder", name: "another_valid" },
      ];

      const result = extractPlaceholderNames(messages);

      expect(result).toEqual(["valid_name", "another_valid"]);
    });

    it("should handle messages with different types", () => {
      const messages: PromptMessage[] = [
        { type: "system", role: "system", content: "System message" },
        { type: "placeholder", name: "input" },
        { type: "user", role: "user", content: "User message" },
        { type: "placeholder", name: "context" },
        { type: "assistant", role: "assistant", content: "Assistant message" },
      ];

      const result = extractPlaceholderNames(messages);

      expect(result).toEqual(["input", "context"]);
    });

    it("should handle messages with missing type property", () => {
      const messages: any[] = [
        { name: "should_be_ignored" }, // no type
        { type: "placeholder", name: "valid" },
      ];

      const result = extractPlaceholderNames(messages);

      expect(result).toEqual(["valid"]);
    });

    it("should handle placeholder with empty string name", () => {
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "" }, // empty string
        { type: "placeholder", name: "valid" },
      ];

      const result = extractPlaceholderNames(messages);

      // Empty string is still a valid string, so it should be included
      expect(result).toEqual(["", "valid"]);
    });

    it("should preserve order of placeholders", () => {
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "third" },
        { type: "text", content: "Some text" },
        { type: "placeholder", name: "first" },
        { type: "placeholder", name: "second" },
      ];

      const result = extractPlaceholderNames(messages);

      expect(result).toEqual(["third", "first", "second"]);
    });

    it("should handle duplicate placeholder names", () => {
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "input" },
        { type: "placeholder", name: "input" },
        { type: "placeholder", name: "output" },
      ];

      const result = extractPlaceholderNames(messages);

      // Duplicates are preserved
      expect(result).toEqual(["input", "input", "output"]);
    });

    it("should handle messages with extra properties", () => {
      const messages: any[] = [
        {
          type: "placeholder",
          name: "valid",
          extraProp: "should be ignored",
          anotherProp: 123,
        },
        { type: "text", content: "text", name: "should_be_ignored" },
      ];

      const result = extractPlaceholderNames(messages);

      expect(result).toEqual(["valid"]);
    });

    it("should handle messages with role and content", () => {
      const messages: PromptMessage[] = [
        {
          type: "placeholder",
          name: "user_query",
          role: "user",
          content: "ignored",
        },
        { type: "system", role: "system", content: "System prompt" },
      ];

      const result = extractPlaceholderNames(messages);

      expect(result).toEqual(["user_query"]);
    });

    it("should handle complex message structures", () => {
      const messages: PromptMessage[] = [
        { type: "system", role: "system", content: "You are a helpful assistant" },
        { type: "placeholder", name: "context_documents" },
        { type: "user", role: "user", content: "Question: " },
        { type: "placeholder", name: "user_question" },
        { type: "assistant", role: "assistant", content: "Let me help you" },
        { type: "placeholder", name: "additional_info" },
      ];

      const result = extractPlaceholderNames(messages);

      expect(result).toEqual([
        "context_documents",
        "user_question",
        "additional_info",
      ]);
    });

    it("should handle single placeholder message", () => {
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "single" },
      ];

      const result = extractPlaceholderNames(messages);

      expect(result).toEqual(["single"]);
    });

    it("should handle messages with undefined type", () => {
      const messages: any[] = [
        { type: undefined, name: "should_be_ignored" },
        { type: "placeholder", name: "valid" },
      ];

      const result = extractPlaceholderNames(messages);

      expect(result).toEqual(["valid"]);
    });

    it("should handle messages with null type", () => {
      const messages: any[] = [
        { type: null, name: "should_be_ignored" },
        { type: "placeholder", name: "valid" },
      ];

      const result = extractPlaceholderNames(messages);

      expect(result).toEqual(["valid"]);
    });

    it("should handle placeholders with special characters in names", () => {
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "user_input_123" },
        { type: "placeholder", name: "context-data" },
        { type: "placeholder", name: "system.prompt" },
      ];

      const result = extractPlaceholderNames(messages);

      expect(result).toEqual([
        "user_input_123",
        "context-data",
        "system.prompt",
      ]);
    });
  });
});
