import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestSupabaseClient,
  createTestUser,
  cleanupTestData,
  createTestFlashcards,
  type TestSupabaseClient,
} from "../integration/helpers/supabase-test-client";

/**
 * Performance Tests for API Endpoints
 *
 * These tests verify that API endpoints respond within acceptable time limits.
 */

describe("API Performance Tests", () => {
  let supabase: TestSupabaseClient;
  let userId: string;
  let authToken: string;
  let baseUrl: string;

  // Performance thresholds (in milliseconds)
  const THRESHOLDS = {
    FAST: 100, // Very fast operations (< 100ms)
    NORMAL: 500, // Normal operations (< 500ms)
    SLOW: 1000, // Slow operations (< 1000ms)
    BULK: 2000, // Bulk operations (< 2000ms)
  };

  beforeAll(async () => {
    supabase = createTestSupabaseClient();
    baseUrl = process.env.BASE_URL || "http://localhost:4321";

    const testUser = await createTestUser(supabase);
    userId = testUser.userId;
    authToken = testUser.session?.access_token || "";

    // Create initial test data
    await createTestFlashcards(supabase, 50);
  });

  afterAll(async () => {
    if (userId) {
      await cleanupTestData(supabase, userId);
    }
  });

  describe("GET /api/flashcards", () => {
    it("should respond within 500ms for small dataset", async () => {
      const startTime = performance.now();

      const response = await fetch(`${baseUrl}/api/flashcards?limit=10`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(response.ok).toBe(true);
      expect(duration).toBeLessThan(THRESHOLDS.NORMAL);
    });

    it("should respond within 1000ms for full dataset", async () => {
      const startTime = performance.now();

      const response = await fetch(`${baseUrl}/api/flashcards`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(response.ok).toBe(true);
      expect(duration).toBeLessThan(THRESHOLDS.SLOW);
    });

    it("should handle pagination efficiently", async () => {
      const results: number[] = [];

      for (let offset = 0; offset < 50; offset += 10) {
        const startTime = performance.now();

        await fetch(`${baseUrl}/api/flashcards?limit=10&offset=${offset}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const endTime = performance.now();
        results.push(endTime - startTime);
      }

      // All requests should be fast
      const avgDuration = results.reduce((a, b) => a + b, 0) / results.length;
      expect(avgDuration).toBeLessThan(THRESHOLDS.NORMAL);

      // Performance should not degrade with offset
      const firstRequest = results[0];
      const lastRequest = results[results.length - 1];
      expect(lastRequest).toBeLessThan(firstRequest * 2); // No more than 2x slower
    });
  });

  describe("POST /api/flashcards", () => {
    it("should create flashcard within 500ms", async () => {
      const startTime = performance.now();

      const response = await fetch(`${baseUrl}/api/flashcards`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_text: "Performance Test",
          translation: "Test wydajności",
        }),
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(response.ok).toBe(true);
      expect(duration).toBeLessThan(THRESHOLDS.NORMAL);
    });

    it("should handle concurrent creates efficiently", async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        fetch(`${baseUrl}/api/flashcards`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source_text: `Concurrent ${i}`,
            translation: `Równoczesny ${i}`,
          }),
        })
      );

      const startTime = performance.now();
      const responses = await Promise.all(promises);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(responses.every((r) => r.ok)).toBe(true);
      expect(duration).toBeLessThan(THRESHOLDS.BULK);
    });
  });

  describe("PATCH /api/flashcards/:id", () => {
    it("should update flashcard within 500ms", async () => {
      const flashcards = await createTestFlashcards(supabase, 1);
      const flashcardId = flashcards[0].id;

      const startTime = performance.now();

      const response = await fetch(`${baseUrl}/api/flashcards/${flashcardId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_text: "Updated for performance",
        }),
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(response.ok).toBe(true);
      expect(duration).toBeLessThan(THRESHOLDS.NORMAL);
    });
  });

  describe("DELETE /api/flashcards/:id", () => {
    it("should delete flashcard within 500ms", async () => {
      const flashcards = await createTestFlashcards(supabase, 1);
      const flashcardId = flashcards[0].id;

      const startTime = performance.now();

      const response = await fetch(`${baseUrl}/api/flashcards/${flashcardId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(response.ok).toBe(true);
      expect(duration).toBeLessThan(THRESHOLDS.NORMAL);
    });
  });

  describe("Database Query Performance", () => {
    it("should have efficient user_id index", async () => {
      // Query with user_id filter (should use index)
      const startTime = performance.now();

      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", userId);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(error).toBeNull();
      expect(duration).toBeLessThan(THRESHOLDS.FAST);
    });

    it("should order by id efficiently", async () => {
      const startTime = performance.now();

      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", userId)
        .order("id", { ascending: true });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(error).toBeNull();
      expect(duration).toBeLessThan(THRESHOLDS.NORMAL);
    });
  });

  describe("Response Size", () => {
    it("should have reasonable response size for flashcards list", async () => {
      const response = await fetch(`${baseUrl}/api/flashcards?limit=10`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      const responseSize = new Blob([JSON.stringify(data)]).size;

      // Response should be < 50KB for 10 flashcards
      expect(responseSize).toBeLessThan(50 * 1024);
    });

    it("should support pagination to limit response size", async () => {
      const response = await fetch(`${baseUrl}/api/flashcards?limit=100`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      // Should return at most 100 items
      expect(data.data.length).toBeLessThanOrEqual(100);
    });
  });

  describe("Load Testing (Stress Test)", () => {
    it("should handle 50 concurrent GET requests", async () => {
      const promises = Array.from({ length: 50 }, () =>
        fetch(`${baseUrl}/api/flashcards?limit=10`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
      );

      const startTime = performance.now();
      const responses = await Promise.all(promises);
      const endTime = performance.now();
      const duration = endTime - startTime;

      const successCount = responses.filter((r) => r.ok).length;
      expect(successCount).toBeGreaterThan(45); // Allow some failures

      // Average response time should be acceptable
      const avgDuration = duration / 50;
      expect(avgDuration).toBeLessThan(THRESHOLDS.SLOW);
    });

    it("should handle mixed operations under load", async () => {
      const operations = [
        // 30 GET requests
        ...Array.from({ length: 30 }, () => ({
          method: "GET",
          endpoint: `/api/flashcards?limit=10`,
        })),
        // 10 POST requests
        ...Array.from({ length: 10 }, (_, i) => ({
          method: "POST",
          endpoint: "/api/flashcards",
          body: { source_text: `Load Test ${i}` },
        })),
      ];

      const promises = operations.map((op) => {
        const options: RequestInit = {
          method: op.method,
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        };

        if (op.body) {
          options.body = JSON.stringify(op.body);
        }

        return fetch(`${baseUrl}${op.endpoint}`, options);
      });

      const startTime = performance.now();
      const responses = await Promise.all(promises);
      const endTime = performance.now();
      const duration = endTime - startTime;

      const successCount = responses.filter((r) => r.ok).length;
      expect(successCount).toBeGreaterThan(35); // Allow some failures

      expect(duration).toBeLessThan(THRESHOLDS.BULK * 2);
    });
  });
});

