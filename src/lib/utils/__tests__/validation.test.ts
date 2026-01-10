import { describe, it, expect } from "vitest";
import { isValidUUID } from "../validation";

describe("Validation utilities", () => {
  describe("isValidUUID", () => {
    it("should return true for valid UUID v4", () => {
      const validUUIDs = [
        "550e8400-e29b-41d4-a716-446655440000",
        "c9bf9e57-1685-4c89-bafb-ff5af830be8a",
        "a3bb189e-8bf9-4888-9912-ace4e6543002",
        "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      ];

      validUUIDs.forEach((uuid) => {
        expect(isValidUUID(uuid)).toBe(true);
      });
    });

    it("should return true for valid UUID v4 with uppercase letters", () => {
      expect(isValidUUID("550E8400-E29B-41D4-A716-446655440000")).toBe(true);
      expect(isValidUUID("C9BF9E57-1685-4C89-BAFB-FF5AF830BE8A")).toBe(true);
    });

    it("should return false for invalid UUID format", () => {
      const invalidUUIDs = [
        "invalid-uuid",
        "550e8400-e29b-41d4-a716", // too short
        "550e8400-e29b-41d4-a716-446655440000-extra", // too long
        "550e8400e29b41d4a716446655440000", // no hyphens
        "550e8400-e29b-51d4-a716-446655440000", // wrong version (5 instead of 4)
        "550e8400-e29b-41d4-c716-446655440000", // wrong variant (c instead of 8,9,a,b)
        "",
        "   ",
      ];

      invalidUUIDs.forEach((uuid) => {
        expect(isValidUUID(uuid)).toBe(false);
      });
    });

    it("should return false for null or undefined", () => {
      expect(isValidUUID(null as any)).toBe(false);
      expect(isValidUUID(undefined as any)).toBe(false);
    });

    it("should return false for non-string values", () => {
      expect(isValidUUID(123 as any)).toBe(false);
      expect(isValidUUID({} as any)).toBe(false);
      expect(isValidUUID([] as any)).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isValidUUID("")).toBe(false);
    });

    it("should validate UUID with correct version and variant", () => {
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      // where y is 8, 9, a, or b (variant bits)
      expect(isValidUUID("550e8400-e29b-4000-8000-446655440000")).toBe(true);
      expect(isValidUUID("550e8400-e29b-4000-9000-446655440000")).toBe(true);
      expect(isValidUUID("550e8400-e29b-4000-a000-446655440000")).toBe(true);
      expect(isValidUUID("550e8400-e29b-4000-b000-446655440000")).toBe(true);
    });
  });
});
