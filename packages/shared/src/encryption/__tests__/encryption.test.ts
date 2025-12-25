import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import crypto from "crypto";

describe("encryption utilities", () => {
  const originalEnv = process.env.ENCRYPTION_KEY;

  beforeAll(() => {
    // Set a test encryption key (64 hex characters = 32 bytes)
    process.env.ENCRYPTION_KEY =
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  });

  afterAll(() => {
    // Restore original environment
    process.env.ENCRYPTION_KEY = originalEnv;
  });

  // Re-import after setting env var
  const { encrypt, decrypt, keyGen } = require("../encryption");

  describe("keyGen", () => {
    it("should generate a 64 character hex key", () => {
      const key = keyGen();
      expect(key).toHaveLength(64);
      expect(key).toMatch(/^[0-9a-f]+$/);
    });

    it("should generate unique keys", () => {
      const key1 = keyGen();
      const key2 = keyGen();
      expect(key1).not.toBe(key2);
    });

    it("should generate valid hex strings", () => {
      const key = keyGen();
      const buffer = Buffer.from(key, "hex");
      expect(buffer.length).toBe(32); // 32 bytes
    });
  });

  describe("encrypt", () => {
    it("should encrypt a simple string", () => {
      const plainText = "Hello, World!";
      const encrypted = encrypt(plainText);
      expect(encrypted).toBeTruthy();
      expect(typeof encrypted).toBe("string");
      expect(encrypted.split(":")).toHaveLength(3);
    });

    it("should produce different output with different IVs", () => {
      const plainText = "Hello, World!";
      const encrypted1 = encrypt(plainText);
      const encrypted2 = encrypt(plainText);
      // Should be different due to random IV
      expect(encrypted1).not.toBe(encrypted2);
    });

    it("should encrypt empty string", () => {
      const encrypted = encrypt("");
      expect(encrypted).toBeTruthy();
      expect(encrypted.split(":")).toHaveLength(3);
    });

    it("should encrypt special characters", () => {
      const plainText = "Hello! @#$%^&*() 你好";
      const encrypted = encrypt(plainText);
      expect(encrypted).toBeTruthy();
    });

    it("should encrypt long strings", () => {
      const plainText = "a".repeat(10000);
      const encrypted = encrypt(plainText);
      expect(encrypted).toBeTruthy();
      expect(encrypted.split(":")).toHaveLength(3);
    });

    it("should encrypt with mocked randomness", () => {
      const mockRandomBytes = vi.spyOn(crypto, "randomBytes");
      // Mock IV (12 bytes)
      mockRandomBytes.mockReturnValue(
        Buffer.from("aabbccddeeff00112233", "hex"),
      );

      const plainText = "Hello, World!";
      const expectedEncrypted =
        "aabbccddeeff00112233:5c40ad18eaeccee16fd195c5a2:fa3fb54e39fd23981ad146fe6ea4ec56";

      const encrypted = encrypt(plainText);
      expect(encrypted).toBe(expectedEncrypted);

      mockRandomBytes.mockRestore();
    });
  });

  describe("decrypt", () => {
    it("should decrypt encrypted text", () => {
      const plainText = "Hello, World!";
      const encrypted = encrypt(plainText);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(plainText);
    });

    it("should decrypt empty string", () => {
      const plainText = "";
      const encrypted = encrypt(plainText);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(plainText);
    });

    it("should decrypt special characters", () => {
      const plainText = "Hello! @#$%^&*() 你好";
      const encrypted = encrypt(plainText);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(plainText);
    });

    it("should decrypt long strings", () => {
      const plainText = "a".repeat(10000);
      const encrypted = encrypt(plainText);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(plainText);
    });

    it("should throw error for invalid format", () => {
      expect(() => decrypt("invalid")).toThrow("Invalid or corrupted cipher format");
    });

    it("should throw error for missing parts", () => {
      expect(() => decrypt("iv:encrypted")).toThrow("Invalid or corrupted cipher format");
    });

    it("should throw error for tampered data", () => {
      const plainText = "Hello, World!";
      const encrypted = encrypt(plainText);
      const [iv, enc, tag] = encrypted.split(":");
      const tampered = `${iv}:${enc}:${"0".repeat(32)}`;
      expect(() => decrypt(tampered)).toThrow();
    });

    it("should throw error for corrupted IV", () => {
      const plainText = "Hello, World!";
      const encrypted = encrypt(plainText);
      const [, enc, tag] = encrypted.split(":");
      const corrupted = `${"0".repeat(24)}:${enc}:${tag}`;
      expect(() => decrypt(corrupted)).toThrow();
    });
  });

  describe("encrypt/decrypt round trip", () => {
    it("should handle various data types as strings", () => {
      const testCases = [
        "simple text",
        "123",
        "true",
        '{"json": "data"}',
        "[1,2,3]",
        "multi\nline\ntext",
        "text with\ttabs",
      ];

      for (const testCase of testCases) {
        const encrypted = encrypt(testCase);
        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(testCase);
      }
    });
  });
});

describe("encryption without key", () => {
  it("should throw error when ENCRYPTION_KEY is not set", () => {
    const originalKey = process.env.ENCRYPTION_KEY;
    delete process.env.ENCRYPTION_KEY;

    // Force re-import
    vi.resetModules();
    const { encrypt: encryptNoKey, decrypt: decryptNoKey } = require("../encryption");

    expect(() => encryptNoKey("test")).toThrow("Missing environment variable: `ENCRYPTION_KEY`");
    
    // Test with a pre-encrypted value (won't work but should give the right error)
    expect(() => decryptNoKey("iv:enc:tag")).toThrow("Missing environment variable: `ENCRYPTION_KEY`");

    process.env.ENCRYPTION_KEY = originalKey;
    vi.resetModules();
  });
});
