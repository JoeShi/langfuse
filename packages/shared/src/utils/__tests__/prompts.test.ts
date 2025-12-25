import { describe, it, expect } from "vitest";
import { extractPlaceholderNames, PromptMessage } from "../prompts";

describe("prompts utilities", () => {
  describe("extractPlaceholderNames", () => {
    it("should extract placeholder names from messages", () => {
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "userName" },
        { type: "placeholder", name: "userId" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["userName", "userId"]);
    });

    it("should filter out non-placeholder messages", () => {
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "userName" },
        { type: "text", content: "Hello" },
        { type: "placeholder", name: "userId" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["userName", "userId"]);
    });

    it("should return empty array for no placeholders", () => {
      const messages: PromptMessage[] = [
        { type: "text", content: "Hello" },
        { type: "system", content: "System message" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual([]);
    });

    it("should handle empty messages array", () => {
      const messages: PromptMessage[] = [];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual([]);
    });

    it("should filter out placeholders without names", () => {
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "validName" },
        { type: "placeholder" },
        { type: "placeholder", name: "anotherValid" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["validName", "anotherValid"]);
    });

    it("should filter out placeholders with non-string names", () => {
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "validName" },
        { type: "placeholder", name: 123 as any },
        { type: "placeholder", name: null as any },
        { type: "placeholder", name: undefined },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["validName"]);
    });

    it("should handle messages with all properties", () => {
      const messages: PromptMessage[] = [
        {
          type: "placeholder",
          name: "userName",
          role: "user",
          content: "Some content",
        },
        { type: "text", name: "textName", role: "system", content: "Hello" },
        { type: "placeholder", name: "userId", role: "assistant" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["userName", "userId"]);
    });

    it("should handle duplicate placeholder names", () => {
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "userName" },
        { type: "placeholder", name: "userName" },
        { type: "placeholder", name: "userId" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["userName", "userName", "userId"]);
    });

    it("should preserve order of placeholders", () => {
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "third" },
        { type: "text", content: "text" },
        { type: "placeholder", name: "first" },
        { type: "placeholder", name: "second" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["third", "first", "second"]);
    });

    it("should handle single placeholder", () => {
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "singlePlaceholder" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["singlePlaceholder"]);
    });

    it("should handle various message types", () => {
      const messages: PromptMessage[] = [
        { type: "user", role: "user", content: "User message" },
        { type: "assistant", role: "assistant", content: "Assistant message" },
        { type: "system", role: "system", content: "System message" },
        { type: "placeholder", name: "variable1" },
        { type: "function", name: "functionName", content: "Function result" },
        { type: "placeholder", name: "variable2" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["variable1", "variable2"]);
    });

    it("should handle empty string as placeholder name", () => {
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "" },
        { type: "placeholder", name: "validName" },
      ];
      const result = extractPlaceholderNames(messages);
      // Empty strings are still strings, so they should be included
      expect(result).toEqual(["", "validName"]);
    });

    it("should handle placeholder with only name property", () => {
      const messages: PromptMessage[] = [
        { type: "placeholder", name: "justName" },
      ];
      const result = extractPlaceholderNames(messages);
      expect(result).toEqual(["justName"]);
    });
  });
});
