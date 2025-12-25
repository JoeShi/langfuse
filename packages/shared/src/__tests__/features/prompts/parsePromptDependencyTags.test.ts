import { describe, it, expect } from "vitest";
import {
  parsePromptDependencyTags,
  PromptDependencyRegex,
  ParsedPromptDependencySchema,
} from "../../../../src/features/prompts/parsePromptDependencyTags";

describe("parsePromptDependencyTags", () => {
  describe("parsePromptDependencyTags function", () => {
    it("should parse version-based dependency tags", () => {
      const content = "Some text @@@langfusePrompt:name=myPrompt|version=1@@@ more text";
      const result = parsePromptDependencyTags(content);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: "myPrompt",
        type: "version",
        version: 1,
      });
    });

    it("should parse label-based dependency tags", () => {
      const content = "Some text @@@langfusePrompt:name=myPrompt|label=production@@@ more text";
      const result = parsePromptDependencyTags(content);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: "myPrompt",
        type: "label",
        label: "production",
      });
    });

    it("should parse multiple dependency tags", () => {
      const content = `
        @@@langfusePrompt:name=prompt1|version=1@@@
        @@@langfusePrompt:name=prompt2|label=latest@@@
      `;
      const result = parsePromptDependencyTags(content);
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("prompt1");
      expect(result[1].name).toBe("prompt2");
    });

    it("should deduplicate identical tags", () => {
      const content = `
        @@@langfusePrompt:name=myPrompt|version=1@@@
        @@@langfusePrompt:name=myPrompt|version=1@@@
      `;
      const result = parsePromptDependencyTags(content);
      
      expect(result).toHaveLength(1);
    });

    it("should skip tags without name as first parameter", () => {
      const content = "@@@langfusePrompt:version=1|name=myPrompt@@@";
      const result = parsePromptDependencyTags(content);
      
      expect(result).toHaveLength(0);
    });

    it("should skip tags with wrong number of parts", () => {
      const content = "@@@langfusePrompt:name=myPrompt@@@";
      const result = parsePromptDependencyTags(content);
      
      expect(result).toHaveLength(0);
    });

    it("should skip tags with too many parts", () => {
      const content = "@@@langfusePrompt:name=myPrompt|version=1|extra=value@@@";
      const result = parsePromptDependencyTags(content);
      
      expect(result).toHaveLength(0);
    });

    it("should handle empty content", () => {
      const result = parsePromptDependencyTags("");
      expect(result).toHaveLength(0);
    });

    it("should handle content with no tags", () => {
      const content = "This is just regular text with no tags";
      const result = parsePromptDependencyTags(content);
      
      expect(result).toHaveLength(0);
    });

    it("should parse tags from object content", () => {
      const content = {
        message: "Hello @@@langfusePrompt:name=greeting|version=2@@@",
        nested: {
          prompt: "@@@langfusePrompt:name=nested|label=dev@@@",
        },
      };
      const result = parsePromptDependencyTags(content);
      
      expect(result).toHaveLength(2);
      expect(result.some(tag => tag.name === "greeting")).toBe(true);
      expect(result.some(tag => tag.name === "nested")).toBe(true);
    });

    it("should coerce version to number", () => {
      const content = "@@@langfusePrompt:name=myPrompt|version=5@@@";
      const result = parsePromptDependencyTags(content);
      
      expect(result[0]).toEqual({
        name: "myPrompt",
        type: "version",
        version: 5,
      });
      expect(typeof result[0].version).toBe("number");
    });

    it("should handle malformed tags gracefully", () => {
      const content = `
        @@@langfusePrompt:name=valid|version=1@@@
        @@@langfusePrompt:invalid@@@
        @@@langfusePrompt:name=valid2|label=prod@@@
      `;
      const result = parsePromptDependencyTags(content);
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("valid");
      expect(result[1].name).toBe("valid2");
    });

    it("should handle tags with special characters in names", () => {
      const content = "@@@langfusePrompt:name=my-prompt-123|version=1@@@";
      const result = parsePromptDependencyTags(content);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("my-prompt-123");
    });

    it("should handle tags with spaces in label values", () => {
      const content = "@@@langfusePrompt:name=myPrompt|label=production latest@@@";
      const result = parsePromptDependencyTags(content);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: "myPrompt",
        type: "label",
        label: "production latest",
      });
    });
  });

  describe("PromptDependencyRegex", () => {
    it("should match valid prompt dependency tags", () => {
      const text = "@@@langfusePrompt:name=test|version=1@@@";
      const matches = text.match(PromptDependencyRegex);
      
      expect(matches).not.toBeNull();
      expect(matches).toHaveLength(1);
    });

    it("should match multiple tags", () => {
      const text = "@@@langfusePrompt:name=test1|version=1@@@ and @@@langfusePrompt:name=test2|label=prod@@@";
      const matches = text.match(PromptDependencyRegex);
      
      expect(matches).toHaveLength(2);
    });

    it("should not match incomplete tags", () => {
      const text = "@@@langfusePrompt:incomplete";
      const matches = text.match(PromptDependencyRegex);
      
      expect(matches).toBeNull();
    });
  });

  describe("ParsedPromptDependencySchema", () => {
    it("should validate version-based dependency", () => {
      const data = {
        name: "myPrompt",
        type: "version" as const,
        version: 1,
      };
      const result = ParsedPromptDependencySchema.safeParse(data);
      
      expect(result.success).toBe(true);
    });

    it("should validate label-based dependency", () => {
      const data = {
        name: "myPrompt",
        type: "label" as const,
        label: "production",
      };
      const result = ParsedPromptDependencySchema.safeParse(data);
      
      expect(result.success).toBe(true);
    });

    it("should reject missing name", () => {
      const data = {
        type: "version",
        version: 1,
      };
      const result = ParsedPromptDependencySchema.safeParse(data);
      
      expect(result.success).toBe(false);
    });

    it("should reject invalid type", () => {
      const data = {
        name: "myPrompt",
        type: "invalid",
        version: 1,
      };
      const result = ParsedPromptDependencySchema.safeParse(data);
      
      expect(result.success).toBe(false);
    });

    it("should reject version type without version field", () => {
      const data = {
        name: "myPrompt",
        type: "version",
      };
      const result = ParsedPromptDependencySchema.safeParse(data);
      
      expect(result.success).toBe(false);
    });

    it("should reject label type without label field", () => {
      const data = {
        name: "myPrompt",
        type: "label",
      };
      const result = ParsedPromptDependencySchema.safeParse(data);
      
      expect(result.success).toBe(false);
    });

    it("should coerce version string to number", () => {
      const data = {
        name: "myPrompt",
        type: "version" as const,
        version: "5" as any,
      };
      const result = ParsedPromptDependencySchema.safeParse(data);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.version).toBe(5);
        expect(typeof result.data.version).toBe("number");
      }
    });
  });
});
