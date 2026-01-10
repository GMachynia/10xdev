import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import {
  createTestSupabaseClient,
  createTestUser,
  cleanupTestData,
  createTestFlashcards,
  type TestSupabaseClient,
} from "../helpers/supabase-test-client";

/**
 * Integration tests for Flashcards API endpoints
 *
 * These tests require a running Supabase instance.
 * Run `supabase start` before running these tests.
 *
 * To run these tests:
 * npm run test:integration
 */

describe("Flashcards API Integration Tests", () => {
  let supabase: TestSupabaseClient;
  let userId: string;
  let authToken: string;
  let baseUrl: string;

  beforeAll(async () => {
    supabase = createTestSupabaseClient();
    baseUrl = process.env.BASE_URL || "http://localhost:4321";

    // Create test user
    const testUser = await createTestUser(supabase);
    userId = testUser.userId;
    authToken = testUser.session?.access_token || "";
  });

  afterAll(async () => {
    // Clean up test data
    if (userId) {
      await cleanupTestData(supabase, userId);
    }
  });

  beforeEach(async () => {
    // Delete all flashcards before each test
    await supabase.from("flashcards").delete().eq("user_id", userId);
  });

  describe("GET /api/flashcards", () => {
    it("should return flashcards for authenticated user", async () => {
      // Create test flashcards
      const flashcards = await createTestFlashcards(supabase, 3);

      const response = await fetch(`${baseUrl}/api/flashcards`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data).toHaveLength(3);
      expect(data.data[0]).toHaveProperty("id");
      expect(data.data[0]).toHaveProperty("source_text");
      expect(data.data[0]).toHaveProperty("translation");
    });

    it("should return empty array when no flashcards exist", async () => {
      const response = await fetch(`${baseUrl}/api/flashcards`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data).toHaveLength(0);
    });

    it("should support order=id parameter", async () => {
      await createTestFlashcards(supabase, 3);

      const response = await fetch(`${baseUrl}/api/flashcards?order=id`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data).toHaveLength(3);
      
      // Verify order by checking if IDs are in ascending order
      const ids = data.data.map((fc: any) => fc.id);
      const sortedIds = [...ids].sort();
      expect(ids).toEqual(sortedIds);
    });

    it("should support limit parameter", async () => {
      await createTestFlashcards(supabase, 5);

      const response = await fetch(`${baseUrl}/api/flashcards?limit=2`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data).toHaveLength(2);
    });

    it("should support offset parameter", async () => {
      await createTestFlashcards(supabase, 5);

      const response = await fetch(`${baseUrl}/api/flashcards?offset=2`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data).toHaveLength(3);
    });

    it("should return validation error for invalid limit", async () => {
      const response = await fetch(`${baseUrl}/api/flashcards?limit=invalid`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/flashcards", () => {
    it("should create flashcard for authenticated user", async () => {
      const newFlashcard = {
        source_text: "Hello",
        translation: "Cześć",
      };

      const response = await fetch(`${baseUrl}/api/flashcards`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFlashcard),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data).toHaveProperty("id");
      expect(data.data.source_text).toBe("Hello");
      expect(data.data.translation).toBe("Cześć");
      expect(data.data.user_id).toBe(userId);
    });

    it("should create flashcard without translation", async () => {
      const newFlashcard = {
        source_text: "Hello",
      };

      const response = await fetch(`${baseUrl}/api/flashcards`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFlashcard),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data.source_text).toBe("Hello");
      expect(data.data.translation).toBeNull();
    });

    it("should validate source_text length (max 200)", async () => {
      const newFlashcard = {
        source_text: "a".repeat(201),
        translation: "Test",
      };

      const response = await fetch(`${baseUrl}/api/flashcards`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFlashcard),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it("should require source_text field", async () => {
      const newFlashcard = {
        translation: "Test",
      };

      const response = await fetch(`${baseUrl}/api/flashcards`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFlashcard),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it("should return validation error for empty source_text", async () => {
      const newFlashcard = {
        source_text: "",
        translation: "Test",
      };

      const response = await fetch(`${baseUrl}/api/flashcards`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFlashcard),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });

  describe("PATCH /api/flashcards/:id", () => {
    it("should update flashcard for authenticated user", async () => {
      const flashcards = await createTestFlashcards(supabase, 1);
      const flashcardId = flashcards[0].id;

      const update = {
        source_text: "Updated",
        translation: "Zaktualizowane",
      };

      const response = await fetch(`${baseUrl}/api/flashcards/${flashcardId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(update),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data.source_text).toBe("Updated");
      expect(data.data.translation).toBe("Zaktualizowane");
    });

    it("should support partial updates", async () => {
      const flashcards = await createTestFlashcards(supabase, 1);
      const flashcardId = flashcards[0].id;

      const update = {
        source_text: "Updated Only",
      };

      const response = await fetch(`${baseUrl}/api/flashcards/${flashcardId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(update),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data.source_text).toBe("Updated Only");
      expect(data.data.translation).toBe("Translation 1"); // Original translation
    });

    it("should return 404 for non-existent flashcard", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";

      const update = {
        source_text: "Updated",
      };

      const response = await fetch(`${baseUrl}/api/flashcards/${fakeId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(update),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it("should validate UUID format", async () => {
      const update = {
        source_text: "Updated",
      };

      const response = await fetch(`${baseUrl}/api/flashcards/invalid-uuid`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(update),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it("should validate source_text length", async () => {
      const flashcards = await createTestFlashcards(supabase, 1);
      const flashcardId = flashcards[0].id;

      const update = {
        source_text: "a".repeat(201),
      };

      const response = await fetch(`${baseUrl}/api/flashcards/${flashcardId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(update),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/flashcards/:id", () => {
    it("should delete flashcard for authenticated user", async () => {
      const flashcards = await createTestFlashcards(supabase, 1);
      const flashcardId = flashcards[0].id;

      const response = await fetch(`${baseUrl}/api/flashcards/${flashcardId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);

      // Verify flashcard was deleted
      const { data } = await supabase
        .from("flashcards")
        .select()
        .eq("id", flashcardId)
        .single();
      expect(data).toBeNull();
    });

    it("should return 404 for non-existent flashcard", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";

      const response = await fetch(`${baseUrl}/api/flashcards/${fakeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it("should validate UUID format", async () => {
      const response = await fetch(`${baseUrl}/api/flashcards/invalid-uuid`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });

  describe("Row Level Security (RLS)", () => {
    it("should filter flashcards by user_id", async () => {
      // Create flashcards for current user
      await createTestFlashcards(supabase, 2);

      // Create another user
      const otherUser = await createTestUser(supabase);
      
      // Create flashcards for other user
      const otherSupabase = createTestSupabaseClient();
      await otherSupabase.auth.setSession({
        access_token: otherUser.session?.access_token || "",
        refresh_token: otherUser.session?.refresh_token || "",
      });
      await createTestFlashcards(otherSupabase, 3);

      // Current user should only see their flashcards
      const response = await fetch(`${baseUrl}/api/flashcards`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      expect(data.data).toHaveLength(2);
      expect(data.data.every((fc: any) => fc.user_id === userId)).toBe(true);

      // Cleanup other user
      await cleanupTestData(supabase, otherUser.userId);
    });

    it("should not allow updating flashcard of another user", async () => {
      // Create another user with flashcard
      const otherUser = await createTestUser(supabase);
      const otherSupabase = createTestSupabaseClient();
      await otherSupabase.auth.setSession({
        access_token: otherUser.session?.access_token || "",
        refresh_token: otherUser.session?.refresh_token || "",
      });
      const flashcards = await createTestFlashcards(otherSupabase, 1);
      const flashcardId = flashcards[0].id;

      // Try to update with current user's token
      const update = { source_text: "Hacked" };
      const response = await fetch(`${baseUrl}/api/flashcards/${flashcardId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(update),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404); // RLS makes it look like it doesn't exist

      // Cleanup other user
      await cleanupTestData(supabase, otherUser.userId);
    });

    it("should not allow deleting flashcard of another user", async () => {
      // Create another user with flashcard
      const otherUser = await createTestUser(supabase);
      const otherSupabase = createTestSupabaseClient();
      await otherSupabase.auth.setSession({
        access_token: otherUser.session?.access_token || "",
        refresh_token: otherUser.session?.refresh_token || "",
      });
      const flashcards = await createTestFlashcards(otherSupabase, 1);
      const flashcardId = flashcards[0].id;

      // Try to delete with current user's token
      const response = await fetch(`${baseUrl}/api/flashcards/${flashcardId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404); // RLS makes it look like it doesn't exist

      // Cleanup other user
      await cleanupTestData(supabase, otherUser.userId);
    });
  });
});
