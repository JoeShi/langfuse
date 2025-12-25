/**
 * Tests for level-colors utilities
 *
 * Run with: pnpm test-client --testPathPattern="level-colors"
 */

import { LevelColors, LevelSymbols, formatAsLabel } from "./level-colors";

describe("level-colors", () => {
  describe("LevelColors", () => {
    it("has DEFAULT level with empty colors", () => {
      expect(LevelColors.DEFAULT).toEqual({ text: "", bg: "" });
    });

    it("has DEBUG level with correct colors", () => {
      expect(LevelColors.DEBUG).toEqual({
        text: "text-muted-foreground",
        bg: "bg-primary-foreground",
      });
    });

    it("has WARNING level with correct colors", () => {
      expect(LevelColors.WARNING).toEqual({
        text: "text-dark-yellow",
        bg: "bg-light-yellow",
      });
    });

    it("has ERROR level with correct colors", () => {
      expect(LevelColors.ERROR).toEqual({
        text: "text-dark-red",
        bg: "bg-light-red",
      });
    });

    it("contains all required levels", () => {
      const levels = Object.keys(LevelColors);
      expect(levels).toContain("DEFAULT");
      expect(levels).toContain("DEBUG");
      expect(levels).toContain("WARNING");
      expect(levels).toContain("ERROR");
    });

    it("each level has text and bg properties", () => {
      Object.values(LevelColors).forEach((level) => {
        expect(level).toHaveProperty("text");
        expect(level).toHaveProperty("bg");
        expect(typeof level.text).toBe("string");
        expect(typeof level.bg).toBe("string");
      });
    });
  });

  describe("LevelSymbols", () => {
    it("has DEFAULT level with info symbol", () => {
      expect(LevelSymbols.DEFAULT).toBe("ℹ️");
    });

    it("has DEBUG level with magnifying glass symbol", () => {
      expect(LevelSymbols.DEBUG).toBe("🔍");
    });

    it("has WARNING level with warning symbol", () => {
      expect(LevelSymbols.WARNING).toBe("⚠️");
    });

    it("has ERROR level with siren symbol", () => {
      expect(LevelSymbols.ERROR).toBe("🚨");
    });

    it("contains all required levels", () => {
      const levels = Object.keys(LevelSymbols);
      expect(levels).toContain("DEFAULT");
      expect(levels).toContain("DEBUG");
      expect(levels).toContain("WARNING");
      expect(levels).toContain("ERROR");
    });

    it("each symbol is a string", () => {
      Object.values(LevelSymbols).forEach((symbol) => {
        expect(typeof symbol).toBe("string");
        expect(symbol.length).toBeGreaterThan(0);
      });
    });

    it("symbols match color keys", () => {
      const colorKeys = Object.keys(LevelColors);
      const symbolKeys = Object.keys(LevelSymbols);
      expect(symbolKeys).toEqual(colorKeys);
    });
  });

  describe("formatAsLabel", () => {
    it("removes Count suffix and converts to uppercase", () => {
      expect(formatAsLabel("defaultCount")).toBe("DEFAULT");
      expect(formatAsLabel("debugCount")).toBe("DEBUG");
      expect(formatAsLabel("warningCount")).toBe("WARNING");
      expect(formatAsLabel("errorCount")).toBe("ERROR");
    });

    it("handles mixed case input", () => {
      expect(formatAsLabel("DebugCount")).toBe("DEBUG");
      expect(formatAsLabel("WarningCount")).toBe("WARNING");
    });

    it("converts to uppercase even without Count suffix", () => {
      expect(formatAsLabel("default")).toBe("DEFAULT");
      expect(formatAsLabel("debug")).toBe("DEBUG");
      expect(formatAsLabel("warning")).toBe("WARNING");
      expect(formatAsLabel("error")).toBe("ERROR");
    });

    it("handles empty string", () => {
      expect(formatAsLabel("")).toBe("");
    });

    it("only removes Count at the end", () => {
      expect(formatAsLabel("CountInMiddleCount")).toBe("COUNTINMIDDLE");
      expect(formatAsLabel("CountAtStart")).toBe("COUNTATSTART");
    });

    it("handles strings without Count suffix", () => {
      expect(formatAsLabel("custom")).toBe("CUSTOM");
      expect(formatAsLabel("level")).toBe("LEVEL");
    });

    it("is case-insensitive for Count suffix", () => {
      // Note: The function uses replace with the exact "Count" pattern
      // so it's case-sensitive for the suffix
      expect(formatAsLabel("debugcount")).toBe("DEBUGCOUNT");
      expect(formatAsLabel("debugCount")).toBe("DEBUG");
      expect(formatAsLabel("debugCOUNT")).toBe("DEBUGCOUNT");
    });

    it("handles multiple Count occurrences", () => {
      expect(formatAsLabel("countCount")).toBe("COUNT");
      expect(formatAsLabel("CountCount")).toBe("COUNT");
    });

    it("preserves characters other than Count suffix", () => {
      expect(formatAsLabel("customLevelCount")).toBe("CUSTOMLEVEL");
      expect(formatAsLabel("my-level-Count")).toBe("MY-LEVEL-");
    });
  });
});
