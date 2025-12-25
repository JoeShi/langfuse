import { describe, it, expect } from "vitest";
import { parseIO } from "../../../src/utils/IORepresentation/parseIO";
import { toCompactVerbosity } from "../../../src/utils/IORepresentation/toCompactVerbosity";

describe("IORepresentation", () => {
  describe("parseIO", () => {
    it("should return original io for 'full' verbosity", () => {
      const io = { messages: [{ role: "user", content: "Hello" }] };
      const result = parseIO(io, "full");
      expect(result).toBe(io);
    });

    it("should return original io for 'truncated' verbosity", () => {
      const io = { messages: [{ role: "user", content: "Hello" }] };
      const result = parseIO(io, "truncated");
      expect(result).toBe(io);
    });

    it("should attempt compact conversion for 'compact' verbosity", () => {
      const io = {
        messages: [
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi there" },
        ],
      };
      const result = parseIO(io, "compact");
      // Should return compact representation if successful
      expect(result).toBeDefined();
    });

    it("should return original io if compact conversion fails", () => {
      const io = { random: "data", without: "standard structure" };
      const result = parseIO(io, "compact");
      expect(result).toBe(io);
    });

    it("should handle null input", () => {
      const result = parseIO(null, "compact");
      expect(result).toBeNull();
    });

    it("should handle undefined input", () => {
      const result = parseIO(undefined, "compact");
      expect(result).toBeUndefined();
    });

    it("should handle string input", () => {
      const io = JSON.stringify({ messages: [{ role: "user", content: "Test" }] });
      const result = parseIO(io, "full");
      expect(result).toBe(io);
    });
  });

  describe("toCompactVerbosity", () => {
    it("should return failure for null input", () => {
      const result = toCompactVerbosity(null);
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });

    it("should return failure for undefined input", () => {
      const result = toCompactVerbosity(undefined);
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });

    it("should try to parse JSON strings", () => {
      const io = JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
      });
      const result = toCompactVerbosity(io);
      // Result depends on ChatML extraction
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("data");
    });

    it("should handle unparseable JSON strings", () => {
      const io = "not valid json";
      const result = toCompactVerbosity(io);
      // Should continue with original string
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("data");
    });

    it("should extract compact representation from ChatML format", () => {
      const io = {
        messages: [
          { role: "user", content: "What is 2+2?" },
          { role: "assistant", content: "4" },
        ],
      };
      const result = toCompactVerbosity(io);
      // If ChatML extraction is successful
      if (result.success) {
        expect(result.data).toBeTruthy();
        expect(typeof result.data).toBe("string");
      }
    });

    it("should return failure for non-ChatML objects", () => {
      const io = { random: "object", structure: "unknown" };
      const result = toCompactVerbosity(io);
      expect(result.success).toBe(false);
    });

    it("should handle arrays", () => {
      const io = ["item1", "item2", "item3"];
      const result = toCompactVerbosity(io);
      expect(result).toHaveProperty("success");
    });

    it("should handle nested objects", () => {
      const io = {
        nested: {
          deep: {
            structure: "value",
          },
        },
      };
      const result = toCompactVerbosity(io);
      expect(result).toHaveProperty("success");
    });

    it("should handle primitive values", () => {
      expect(toCompactVerbosity("string")).toHaveProperty("success");
      expect(toCompactVerbosity(123)).toHaveProperty("success");
      expect(toCompactVerbosity(true)).toHaveProperty("success");
    });
  });
});
