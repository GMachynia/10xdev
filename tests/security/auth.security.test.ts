import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestSupabaseClient,
  createTestUser,
  cleanupTestData,
  createTestFlashcards,
  type TestSupabaseClient,
} from "../integration/helpers/supabase-test-client";

/**
 * Authentication and Authorization Security Tests
 *
 * These tests verify that authentication and authorization are properly enforced.
 */

describe("Authentication Security", () => {
  let supabase: TestSupabaseClient;
  let userId: string;
  let authToken: string;
  let baseUrl: string;

  beforeAll(async () => {
    supabase = createTestSupabaseClient();
    baseUrl = process.env.BASE_URL || "http://localhost:4321";

    const testUser = await createTestUser(supabase);
    userId = testUser.userId;
    authToken = testUser.session?.access_token || "";
  });

  afterAll(async () => {
    if (userId) {
      await cleanupTestData(supabase, userId);
    }
  });

  describe("Unauthorized Access", () => {
    it("should return 401 for GET /api/flashcards without auth", async () => {
      const response = await fetch(`${baseUrl}/api/flashcards`);

      expect(response.status).toBe(401);
    });

    it("should return 401 for POST /api/flashcards without auth", async () => {
      const response = await fetch(`${baseUrl}/api/flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ source_text: "Test" }),
      });

      expect(response.status).toBe(401);
    });

    it("should return 401 for PATCH /api/flashcards/:id without auth", async () => {
      const flashcards = await createTestFlashcards(supabase, 1);
      const flashcardId = flashcards[0].id;

      const response = await fetch(`${baseUrl}/api/flashcards/${flashcardId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ source_text: "Updated" }),
      });

      expect(response.status).toBe(401);
    });

    it("should return 401 for DELETE /api/flashcards/:id without auth", async () => {
      const flashcards = await createTestFlashcards(supabase, 1);
      const flashcardId = flashcards[0].id;

      const response = await fetch(`${baseUrl}/api/flashcards/${flashcardId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("Invalid Tokens", () => {
    it("should return 401 for invalid JWT token", async () => {
      const response = await fetch(`${baseUrl}/api/flashcards`, {
        headers: {
          Authorization: "Bearer invalid.token.here",
        },
      });

      expect(response.status).toBe(401);
    });

    it("should return 401 for malformed JWT token", async () => {
      const response = await fetch(`${baseUrl}/api/flashcards`, {
        headers: {
          Authorization: "Bearer not-a-jwt",
        },
      });

      expect(response.status).toBe(401);
    });

    it("should return 401 for empty Authorization header", async () => {
      const response = await fetch(`${baseUrl}/api/flashcards`, {
        headers: {
          Authorization: "",
        },
      });

      expect(response.status).toBe(401);
    });

    it("should return 401 for Bearer token without 'Bearer' prefix", async () => {
      const response = await fetch(`${baseUrl}/api/flashcards`, {
        headers: {
          Authorization: authToken,
        },
      });

      expect(response.status).toBe(401);
    });
  });

  describe("Token Format Validation", () => {
    it("should require 'Bearer' scheme in Authorization header", async () => {
      const response = await fetch(`${baseUrl}/api/flashcards`, {
        headers: {
          Authorization: `Basic ${authToken}`,
        },
      });

      expect(response.status).toBe(401);
    });

    it("should handle tokens with extra whitespace", async () => {
      const response = await fetch(`${baseUrl}/api/flashcards`, {
        headers: {
          Authorization: `Bearer  ${authToken}  `,
        },
      });

      // Should still work (implementation may trim)
      // Or return 401 if strict validation
      expect([200, 401]).toContain(response.status);
    });
  });

  describe("Authorization Header Requirements", () => {
    it("should not accept credentials in query string", async () => {
      const response = await fetch(`${baseUrl}/api/flashcards?token=${authToken}`);

      expect(response.status).toBe(401);
    });

    it("should not accept credentials in request body", async () => {
      const response = await fetch(`${baseUrl}/api/flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          source_text: "Test",
          token: authToken 
        }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe("Cross-Site Request Forgery (CSRF) Protection", () => {
    it("should require Content-Type application/json for API requests", async () => {
      // Form submissions use application/x-www-form-urlencoded by default
      // API should reject this to prevent CSRF via forms
      const response = await fetch(`${baseUrl}/api/flashcards`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "source_text=Test",
      });

      // Should be rejected for wrong content type
      expect([400, 415]).toContain(response.status);
    });

    it("should require Authorization header (not cookie-based auth for API)", async () => {
      // Even if session cookie exists, API should require Authorization header
      const response = await fetch(`${baseUrl}/api/flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ source_text: "Test" }),
        credentials: "include", // Include cookies
      });

      expect(response.status).toBe(401);
    });
  });

  describe("Rate Limiting (if implemented)", () => {
    it.skip("should rate limit excessive requests", async () => {
      /**
       * If rate limiting is implemented:
       * 1. Make many requests in quick succession
       * 2. Verify 429 Too Many Requests response
       * 3. Verify retry-after header
       */
      expect(true).toBe(true);
    });
  });
});

