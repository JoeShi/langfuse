import { describe, it, expect } from "vitest";
import { isIPBlocked, isIPAddress, isHostnameBlocked } from "../../../src/server/webhooks/ipBlocking";

describe("ipBlocking", () => {
  describe("isIPAddress", () => {
    it("should recognize IPv4 addresses", () => {
      expect(isIPAddress("192.168.1.1")).toBe(true);
      expect(isIPAddress("8.8.8.8")).toBe(true);
      expect(isIPAddress("127.0.0.1")).toBe(true);
      expect(isIPAddress("10.0.0.1")).toBe(true);
    });

    it("should recognize IPv6 addresses", () => {
      expect(isIPAddress("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe(true);
      expect(isIPAddress("::1")).toBe(true);
      expect(isIPAddress("fe80::1")).toBe(true);
      expect(isIPAddress("2001:db8::1")).toBe(true);
    });

    it("should handle IPv6 addresses with brackets", () => {
      expect(isIPAddress("[2001:0db8:85a3::8a2e:0370:7334]")).toBe(true);
      expect(isIPAddress("[::1]")).toBe(true);
    });

    it("should reject hostnames", () => {
      expect(isIPAddress("example.com")).toBe(false);
      expect(isIPAddress("subdomain.example.com")).toBe(false);
      expect(isIPAddress("localhost")).toBe(false);
    });

    it("should reject invalid formats", () => {
      expect(isIPAddress("not-an-ip")).toBe(false);
      expect(isIPAddress("256.256.256.256")).toBe(false);
      expect(isIPAddress("")).toBe(false);
    });
  });

  describe("isIPBlocked", () => {
    it("should block loopback addresses (127.0.0.0/8)", () => {
      expect(isIPBlocked("127.0.0.1", [], [])).toBe(true);
      expect(isIPBlocked("127.1.2.3", [], [])).toBe(true);
    });

    it("should block private IPv4 addresses (10.0.0.0/8)", () => {
      expect(isIPBlocked("10.0.0.1", [], [])).toBe(true);
      expect(isIPBlocked("10.255.255.255", [], [])).toBe(true);
    });

    it("should block private IPv4 addresses (172.16.0.0/12)", () => {
      expect(isIPBlocked("172.16.0.1", [], [])).toBe(true);
      expect(isIPBlocked("172.31.255.255", [], [])).toBe(true);
    });

    it("should block private IPv4 addresses (192.168.0.0/16)", () => {
      expect(isIPBlocked("192.168.0.1", [], [])).toBe(true);
      expect(isIPBlocked("192.168.255.255", [], [])).toBe(true);
    });

    it("should block link-local addresses (169.254.0.0/16)", () => {
      expect(isIPBlocked("169.254.1.1", [], [])).toBe(true);
      expect(isIPBlocked("169.254.169.254", [], [])).toBe(true); // AWS metadata
    });

    it("should allow public IPv4 addresses", () => {
      expect(isIPBlocked("8.8.8.8", [], [])).toBe(false);
      expect(isIPBlocked("1.1.1.1", [], [])).toBe(false);
      expect(isIPBlocked("93.184.216.34", [], [])).toBe(false); // example.com
    });

    it("should block IPv6 loopback", () => {
      expect(isIPBlocked("::1", [], [])).toBe(true);
    });

    it("should block IPv6 link-local addresses", () => {
      expect(isIPBlocked("fe80::1", [], [])).toBe(true);
      expect(isIPBlocked("fe80::dead:beef", [], [])).toBe(true);
    });

    it("should block IPv6 unique-local addresses", () => {
      expect(isIPBlocked("fc00::1", [], [])).toBe(true);
      expect(isIPBlocked("fd00::1", [], [])).toBe(true);
    });

    it("should allow public IPv6 addresses", () => {
      expect(isIPBlocked("2001:4860:4860::8888", [], [])).toBe(false); // Google DNS
      expect(isIPBlocked("2606:2800:220:1:248:1893:25c8:1946", [], [])).toBe(false);
    });

    it("should respect whitelist IPs", () => {
      // Private IP that would normally be blocked
      expect(isIPBlocked("192.168.1.1", ["192.168.1.1"], [])).toBe(false);
      expect(isIPBlocked("127.0.0.1", ["127.0.0.1"], [])).toBe(false);
    });

    it("should handle case-insensitive whitelist", () => {
      expect(isIPBlocked("192.168.1.1", ["192.168.1.1"], [])).toBe(false);
    });

    it("should trim whitelist IPs", () => {
      expect(isIPBlocked("192.168.1.1", [" 192.168.1.1 "], [])).toBe(false);
    });

    it("should respect whitelisted IP segments", () => {
      // Allow a specific private subnet
      expect(isIPBlocked("192.168.1.1", [], ["192.168.1.0/24"])).toBe(false);
      expect(isIPBlocked("192.168.1.255", [], ["192.168.1.0/24"])).toBe(false);
      // But block outside that subnet
      expect(isIPBlocked("192.168.2.1", [], ["192.168.1.0/24"])).toBe(true);
    });

    it("should block invalid IP strings", () => {
      expect(isIPBlocked("not-an-ip", [], [])).toBe(true);
      expect(isIPBlocked("", [], [])).toBe(true);
      expect(isIPBlocked("invalid", [], [])).toBe(true);
    });

    it("should block multicast addresses", () => {
      expect(isIPBlocked("224.0.0.1", [], [])).toBe(true);
      expect(isIPBlocked("239.255.255.255", [], [])).toBe(true);
    });

    it("should block broadcast address", () => {
      expect(isIPBlocked("255.255.255.255", [], [])).toBe(true);
    });

    it("should block TEST-NET addresses", () => {
      expect(isIPBlocked("192.0.2.1", [], [])).toBe(true);
      expect(isIPBlocked("198.51.100.1", [], [])).toBe(true);
      expect(isIPBlocked("203.0.113.1", [], [])).toBe(true);
    });
  });

  describe("isHostnameBlocked", () => {
    it("should block localhost", () => {
      expect(isHostnameBlocked("localhost", [])).toBe(true);
    });

    it("should block common localhost variants", () => {
      expect(isHostnameBlocked("LOCALHOST", [])).toBe(true);
      expect(isHostnameBlocked("LocalHost", [])).toBe(true);
    });

    it("should block internal domains", () => {
      expect(isHostnameBlocked("internal", [])).toBe(true);
      expect(isHostnameBlocked("internal.local", [])).toBe(true);
      expect(isHostnameBlocked("corp", [])).toBe(true);
      expect(isHostnameBlocked("home", [])).toBe(true);
    });

    it("should allow public domains", () => {
      expect(isHostnameBlocked("example.com", [])).toBe(false);
      expect(isHostnameBlocked("google.com", [])).toBe(false);
      expect(isHostnameBlocked("api.service.com", [])).toBe(false);
    });

    it("should respect whitelisted hosts", () => {
      expect(isHostnameBlocked("localhost", ["localhost"])).toBe(false);
      expect(isHostnameBlocked("internal.corp", ["internal.corp"])).toBe(false);
    });

    it("should handle case-insensitive hostname comparison", () => {
      expect(isHostnameBlocked("LOCALHOST", [])).toBe(true);
      expect(isHostnameBlocked("Internal", [])).toBe(true);
    });

    it("should trim hostnames", () => {
      expect(isHostnameBlocked(" localhost ", [])).toBe(true);
      expect(isHostnameBlocked(" example.com ", [])).toBe(false);
    });
  });
});
