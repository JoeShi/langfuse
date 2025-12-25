import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import {
  generateWebhookSecret,
  getDisplaySecretKey,
  generateWebhookSignature,
  createSignatureHeader,
} from "../signature";

describe("signature utilities", () => {
  describe("generateWebhookSecret", () => {
    it("should generate a secret key with correct prefix", () => {
      const { secretKey, displaySecretKey } = generateWebhookSecret();
      expect(secretKey).toMatch(/^lf-whsec_[0-9a-f]{64}$/);
    });

    it("should generate different secrets each time", () => {
      const secret1 = generateWebhookSecret();
      const secret2 = generateWebhookSecret();
      expect(secret1.secretKey).not.toBe(secret2.secretKey);
    });

    it("should generate display key that masks the secret", () => {
      const { secretKey, displaySecretKey } = generateWebhookSecret();
      expect(displaySecretKey).toMatch(/^lf-whsec_\.\.\..{4}$/);
      expect(displaySecretKey.length).toBeLessThan(secretKey.length);
    });

    it("should generate 64 hex characters after prefix", () => {
      const { secretKey } = generateWebhookSecret();
      const hexPart = secretKey.replace("lf-whsec_", "");
      expect(hexPart).toHaveLength(64);
      expect(hexPart).toMatch(/^[0-9a-f]+$/);
    });

    it("should generate display key with last 4 characters", () => {
      const { secretKey, displaySecretKey } = generateWebhookSecret();
      const lastFour = secretKey.slice(-4);
      expect(displaySecretKey).toContain(lastFour);
    });

    it("should generate unique secrets with mocked randomness", () => {
      const mockRandomBytes = vi.spyOn(crypto, "randomBytes");
      mockRandomBytes.mockReturnValueOnce(
        Buffer.from("a".repeat(64), "hex"),
      );

      const { secretKey } = generateWebhookSecret();
      expect(secretKey).toBe("lf-whsec_" + "a".repeat(64));

      mockRandomBytes.mockRestore();
    });
  });

  describe("getDisplaySecretKey", () => {
    it("should mask secret key showing only last 4 characters", () => {
      const secretKey = "lf-whsec_" + "a".repeat(60) + "1234";
      const display = getDisplaySecretKey(secretKey);
      expect(display).toBe("lf-whsec_...1234");
    });

    it("should return **** for empty string", () => {
      expect(getDisplaySecretKey("")).toBe("****");
    });

    it("should return **** for null", () => {
      expect(getDisplaySecretKey(null as any)).toBe("****");
    });

    it("should return **** for short strings", () => {
      expect(getDisplaySecretKey("short")).toBe("****");
      expect(getDisplaySecretKey("lf-whsec_")).toBe("****");
    });

    it("should handle minimum valid length", () => {
      const secretKey = "lf-whsec_abcd";
      const display = getDisplaySecretKey(secretKey);
      expect(display).toBe("lf-whsec_...abcd");
    });

    it("should work with standard webhook secrets", () => {
      const secretKey = "lf-whsec_" + "0123456789abcdef".repeat(4);
      const display = getDisplaySecretKey(secretKey);
      expect(display).toMatch(/^lf-whsec_\.\.\..{4}$/);
      expect(display).toContain(secretKey.slice(-4));
    });
  });

  describe("generateWebhookSignature", () => {
    it("should generate consistent signature for same inputs", () => {
      const payload = '{"event":"test"}';
      const timestamp = 1234567890;
      const secret = "test_secret";

      const sig1 = generateWebhookSignature(payload, timestamp, secret);
      const sig2 = generateWebhookSignature(payload, timestamp, secret);
      expect(sig1).toBe(sig2);
    });

    it("should generate different signatures for different payloads", () => {
      const timestamp = 1234567890;
      const secret = "test_secret";

      const sig1 = generateWebhookSignature('{"event":"test1"}', timestamp, secret);
      const sig2 = generateWebhookSignature('{"event":"test2"}', timestamp, secret);
      expect(sig1).not.toBe(sig2);
    });

    it("should generate different signatures for different timestamps", () => {
      const payload = '{"event":"test"}';
      const secret = "test_secret";

      const sig1 = generateWebhookSignature(payload, 1234567890, secret);
      const sig2 = generateWebhookSignature(payload, 1234567891, secret);
      expect(sig1).not.toBe(sig2);
    });

    it("should generate different signatures for different secrets", () => {
      const payload = '{"event":"test"}';
      const timestamp = 1234567890;

      const sig1 = generateWebhookSignature(payload, timestamp, "secret1");
      const sig2 = generateWebhookSignature(payload, timestamp, "secret2");
      expect(sig1).not.toBe(sig2);
    });

    it("should generate hex string", () => {
      const signature = generateWebhookSignature('{"test":1}', 123456, "secret");
      expect(signature).toMatch(/^[0-9a-f]+$/);
      expect(signature.length).toBe(64); // SHA256 produces 64 hex characters
    });

    it("should handle empty payload", () => {
      const signature = generateWebhookSignature("", 123456, "secret");
      expect(signature).toMatch(/^[0-9a-f]+$/);
      expect(signature.length).toBe(64);
    });

    it("should handle special characters in payload", () => {
      const payload = '{"test":"hello 世界 @#$%"}';
      const signature = generateWebhookSignature(payload, 123456, "secret");
      expect(signature).toMatch(/^[0-9a-f]+$/);
    });

    it("should create signature in format timestamp.payload", () => {
      const payload = '{"event":"test"}';
      const timestamp = 1234567890;
      const secret = "test_secret";

      // Manually verify the signing process
      const signedPayload = `${timestamp}.${payload}`;
      const expectedSig = crypto
        .createHmac("sha256", secret)
        .update(signedPayload, "utf8")
        .digest("hex");

      const actualSig = generateWebhookSignature(payload, timestamp, secret);
      expect(actualSig).toBe(expectedSig);
    });
  });

  describe("createSignatureHeader", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it("should create signature header in correct format", () => {
      const now = new Date("2024-01-01T00:00:00Z");
      vi.setSystemTime(now);

      const payload = '{"event":"test"}';
      const secret = "test_secret";

      const header = createSignatureHeader(payload, secret);
      expect(header).toMatch(/^t=\d+,v1=[0-9a-f]{64}$/);
    });

    it("should include timestamp in header", () => {
      const now = new Date("2024-01-01T00:00:00Z");
      vi.setSystemTime(now);

      const header = createSignatureHeader('{"test":1}', "secret");
      const timestamp = Math.floor(now.getTime() / 1000);
      expect(header).toContain(`t=${timestamp}`);
    });

    it("should include v1 signature in header", () => {
      const now = new Date("2024-01-01T00:00:00Z");
      vi.setSystemTime(now);

      const payload = '{"event":"test"}';
      const secret = "test_secret";
      const timestamp = Math.floor(now.getTime() / 1000);

      const header = createSignatureHeader(payload, secret);
      const expectedSig = generateWebhookSignature(payload, timestamp, secret);

      expect(header).toContain(`v1=${expectedSig}`);
    });

    it("should handle different payloads", () => {
      vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));

      const header1 = createSignatureHeader('{"event":"test1"}', "secret");
      const header2 = createSignatureHeader('{"event":"test2"}', "secret");
      expect(header1).not.toBe(header2);
    });

    it("should handle different secrets", () => {
      vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));

      const header1 = createSignatureHeader('{"event":"test"}', "secret1");
      const header2 = createSignatureHeader('{"event":"test"}', "secret2");
      expect(header1).not.toBe(header2);
    });

    it("should use current timestamp", () => {
      const time1 = new Date("2024-01-01T00:00:00Z");
      vi.setSystemTime(time1);
      const header1 = createSignatureHeader('{"test":1}', "secret");

      const time2 = new Date("2024-01-01T01:00:00Z");
      vi.setSystemTime(time2);
      const header2 = createSignatureHeader('{"test":1}', "secret");

      expect(header1).not.toBe(header2);
    });

    afterEach(() => {
      vi.useRealTimers();
    });
  });

  describe("signature integration", () => {
    it("should generate and verify webhook signature flow", () => {
      vi.useFakeTimers();
      const now = new Date("2024-01-01T00:00:00Z");
      vi.setSystemTime(now);

      const { secretKey } = generateWebhookSecret();
      const payload = '{"event":"user.created","data":{"id":123}}';

      const header = createSignatureHeader(payload, secretKey);
      expect(header).toBeTruthy();

      // Parse header
      const parts = header.split(",");
      const timestampPart = parts[0].split("=")[1];
      const signaturePart = parts[1].split("=")[1];

      // Verify signature
      const expectedSig = generateWebhookSignature(
        payload,
        parseInt(timestampPart),
        secretKey,
      );
      expect(signaturePart).toBe(expectedSig);

      vi.useRealTimers();
    });
  });
});
