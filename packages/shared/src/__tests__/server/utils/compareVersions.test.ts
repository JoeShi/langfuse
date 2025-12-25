import { describe, it, expect } from "vitest";
import { compareVersions, versionSchema } from "../../../../src/server/utils/compareVersions";

describe("compareVersions", () => {
  describe("versionSchema", () => {
    it("should validate semantic versions with v prefix", () => {
      expect(versionSchema.safeParse("v1.2.3").success).toBe(true);
      expect(versionSchema.safeParse("v0.0.1").success).toBe(true);
      expect(versionSchema.safeParse("v10.20.30").success).toBe(true);
    });

    it("should validate semantic versions without v prefix", () => {
      expect(versionSchema.safeParse("1.2.3").success).toBe(true);
      expect(versionSchema.safeParse("0.0.1").success).toBe(true);
      expect(versionSchema.safeParse("10.20.30").success).toBe(true);
    });

    it("should validate versions with pre-release tags", () => {
      expect(versionSchema.safeParse("v1.2.3-rc.1").success).toBe(true);
      expect(versionSchema.safeParse("1.2.3-alpha").success).toBe(true);
      expect(versionSchema.safeParse("v2.0.0-beta.2").success).toBe(true);
    });

    it("should validate versions with build metadata", () => {
      expect(versionSchema.safeParse("v1.2.3+build.123").success).toBe(true);
      expect(versionSchema.safeParse("1.2.3+20241225").success).toBe(true);
    });

    it("should validate versions with both pre-release and build metadata", () => {
      expect(versionSchema.safeParse("v1.2.3-rc.1+build.123").success).toBe(true);
    });

    it("should reject invalid version formats", () => {
      expect(versionSchema.safeParse("1.2").success).toBe(false);
      expect(versionSchema.safeParse("1").success).toBe(false);
      expect(versionSchema.safeParse("a.b.c").success).toBe(false);
      expect(versionSchema.safeParse("").success).toBe(false);
      expect(versionSchema.safeParse("v1.2.3.4").success).toBe(false);
    });
  });

  describe("compareVersions function", () => {
    describe("major version differences", () => {
      it("should return 'major' when latest major is greater", () => {
        expect(compareVersions("v1.0.0", "v2.0.0")).toBe("major");
        expect(compareVersions("v1.5.3", "v2.0.0")).toBe("major");
        expect(compareVersions("v1.9.9", "v3.0.0")).toBe("major");
      });

      it("should work without v prefix", () => {
        expect(compareVersions("1.0.0", "2.0.0")).toBe("major");
      });

      it("should return null when current major is greater or equal", () => {
        expect(compareVersions("v2.0.0", "v1.0.0")).toBeNull();
        expect(compareVersions("v2.0.0", "v2.0.0")).toBeNull();
      });
    });

    describe("minor version differences", () => {
      it("should return 'minor' when latest minor is greater with same major", () => {
        expect(compareVersions("v1.0.0", "v1.1.0")).toBe("minor");
        expect(compareVersions("v1.5.0", "v1.6.0")).toBe("minor");
        expect(compareVersions("v2.0.0", "v2.5.0")).toBe("minor");
      });

      it("should return null when current minor is greater or equal", () => {
        expect(compareVersions("v1.2.0", "v1.1.0")).toBeNull();
        expect(compareVersions("v1.2.0", "v1.2.0")).toBeNull();
      });
    });

    describe("patch version differences", () => {
      it("should return 'patch' when latest patch is greater with same major and minor", () => {
        expect(compareVersions("v1.0.0", "v1.0.1")).toBe("patch");
        expect(compareVersions("v1.5.2", "v1.5.3")).toBe("patch");
        expect(compareVersions("v2.1.0", "v2.1.5")).toBe("patch");
      });

      it("should return null when current patch is greater or equal", () => {
        expect(compareVersions("v1.0.2", "v1.0.1")).toBeNull();
        expect(compareVersions("v1.0.2", "v1.0.2")).toBeNull();
      });
    });

    describe("equal versions", () => {
      it("should return null when versions are identical", () => {
        expect(compareVersions("v1.2.3", "v1.2.3")).toBeNull();
        expect(compareVersions("1.2.3", "1.2.3")).toBeNull();
        expect(compareVersions("v0.0.1", "v0.0.1")).toBeNull();
      });
    });

    describe("pre-release handling", () => {
      it("should return 'patch' when current is pre-release and latest is full release of same version", () => {
        expect(compareVersions("v1.2.3-rc.1", "v1.2.3")).toBe("patch");
        expect(compareVersions("v2.0.0-beta", "v2.0.0")).toBe("patch");
        expect(compareVersions("1.5.0-alpha.1", "1.5.0")).toBe("patch");
      });

      it("should compare pre-release versions normally if different numbers", () => {
        expect(compareVersions("v1.2.3-rc.1", "v1.2.4")).toBe("patch");
        expect(compareVersions("v1.2.3-rc.1", "v1.3.0")).toBe("minor");
        expect(compareVersions("v1.2.3-rc.1", "v2.0.0")).toBe("major");
      });

      it("should handle both versions being pre-releases", () => {
        expect(compareVersions("v1.2.3-rc.1", "v1.2.4-rc.1")).toBe("patch");
        expect(compareVersions("v1.2.3-alpha", "v1.3.0-beta")).toBe("minor");
      });
    });

    describe("build metadata", () => {
      it("should ignore build metadata in comparison", () => {
        expect(compareVersions("v1.2.3+build1", "v1.2.3+build2")).toBeNull();
        expect(compareVersions("v1.2.3", "v1.2.3+build.123")).toBeNull();
      });

      it("should compare versions with build metadata correctly", () => {
        expect(compareVersions("v1.2.3+build1", "v1.2.4+build2")).toBe("patch");
        expect(compareVersions("v1.2.3+build1", "v1.3.0+build2")).toBe("minor");
        expect(compareVersions("v1.2.3+build1", "v2.0.0+build2")).toBe("major");
      });
    });

    describe("mixed prefix handling", () => {
      it("should compare versions with and without v prefix", () => {
        expect(compareVersions("v1.2.3", "1.2.4")).toBe("patch");
        expect(compareVersions("1.2.3", "v1.2.4")).toBe("patch");
        expect(compareVersions("v1.2.3", "2.0.0")).toBe("major");
      });
    });

    describe("edge cases", () => {
      it("should handle large version numbers", () => {
        expect(compareVersions("v999.999.999", "v1000.0.0")).toBe("major");
        expect(compareVersions("v1.999.0", "v1.1000.0")).toBe("minor");
      });

      it("should handle versions with leading zeros", () => {
        expect(compareVersions("v01.02.03", "v1.2.4")).toBe("patch");
      });

      it("should throw on invalid version format", () => {
        expect(() => compareVersions("invalid", "v1.2.3")).toThrow();
        expect(() => compareVersions("v1.2.3", "invalid")).toThrow();
        expect(() => compareVersions("1.2", "1.2.3")).toThrow();
      });
    });

    describe("comprehensive comparison scenarios", () => {
      it("should correctly determine upgrade type", () => {
        // Patch upgrades
        expect(compareVersions("v1.0.0", "v1.0.1")).toBe("patch");
        expect(compareVersions("v1.0.9", "v1.0.10")).toBe("patch");
        
        // Minor upgrades
        expect(compareVersions("v1.0.0", "v1.1.0")).toBe("minor");
        expect(compareVersions("v1.0.5", "v1.1.0")).toBe("minor");
        
        // Major upgrades
        expect(compareVersions("v1.9.9", "v2.0.0")).toBe("major");
        expect(compareVersions("v1.0.0", "v2.5.3")).toBe("major");
        
        // No upgrade needed
        expect(compareVersions("v2.0.0", "v1.9.9")).toBeNull();
        expect(compareVersions("v1.5.0", "v1.4.9")).toBeNull();
      });
    });
  });
});
