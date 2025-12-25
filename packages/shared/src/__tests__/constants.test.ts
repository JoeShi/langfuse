import { describe, it, expect } from "vitest";
import { ModelUsageUnit } from "../constants";

describe("constants", () => {
  describe("ModelUsageUnit", () => {
    it("should have CHARACTERS unit", () => {
      expect(ModelUsageUnit.Characters).toBe("CHARACTERS");
    });

    it("should have TOKENS unit", () => {
      expect(ModelUsageUnit.Tokens).toBe("TOKENS");
    });

    it("should have SECONDS unit", () => {
      expect(ModelUsageUnit.Seconds).toBe("SECONDS");
    });

    it("should have MILLISECONDS unit", () => {
      expect(ModelUsageUnit.Milliseconds).toBe("MILLISECONDS");
    });

    it("should have IMAGES unit", () => {
      expect(ModelUsageUnit.Images).toBe("IMAGES");
    });

    it("should have REQUESTS unit", () => {
      expect(ModelUsageUnit.Requests).toBe("REQUESTS");
    });

    it("should have all expected enum values", () => {
      const expectedValues = [
        "CHARACTERS",
        "TOKENS",
        "SECONDS",
        "MILLISECONDS",
        "IMAGES",
        "REQUESTS",
      ];
      const actualValues = Object.values(ModelUsageUnit);
      expect(actualValues).toEqual(expectedValues);
    });

    it("should have correct number of enum values", () => {
      const values = Object.values(ModelUsageUnit);
      expect(values).toHaveLength(6);
    });

    it("should allow enum value comparison", () => {
      const unit = ModelUsageUnit.Tokens;
      expect(unit === ModelUsageUnit.Tokens).toBe(true);
      expect(unit === ModelUsageUnit.Characters).toBe(false);
    });

    it("should allow enum value in switch statements", () => {
      const getUnitDescription = (unit: ModelUsageUnit): string => {
        switch (unit) {
          case ModelUsageUnit.Characters:
            return "Character count";
          case ModelUsageUnit.Tokens:
            return "Token count";
          case ModelUsageUnit.Seconds:
            return "Time in seconds";
          case ModelUsageUnit.Milliseconds:
            return "Time in milliseconds";
          case ModelUsageUnit.Images:
            return "Image count";
          case ModelUsageUnit.Requests:
            return "Request count";
          default:
            return "Unknown unit";
        }
      };

      expect(getUnitDescription(ModelUsageUnit.Tokens)).toBe("Token count");
      expect(getUnitDescription(ModelUsageUnit.Images)).toBe("Image count");
    });
  });
});
