import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listFlashcards,
  getFlashcardById,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
} from "../flashcards.service";
import type { SupabaseClient } from "../../../db/supabase.client";
import type { FlashcardDTO } from "../../../types";

describe("Flashcards Service", () => {
  let mockSupabase: SupabaseClient;
  const userId = "550e8400-e29b-41d4-a716-446655440000";

  beforeEach(() => {
    // Create a mock Supabase client
    mockSupabase = {
      from: vi.fn(),
    } as any;
  });

  describe("listFlashcards", () => {
    it("should return flashcards ordered by id", async () => {
      const mockData: FlashcardDTO[] = [
        { id: "1", source_text: "Hello", translation: "Cześć" },
        { id: "2", source_text: "World", translation: "Świat" },
      ];

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockData,
          count: 2,
          error: null,
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await listFlashcards(mockSupabase, userId, { order: "id" });

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockData);
      expect(result.count).toBe(2);
      expect(mockQueryBuilder.order).toHaveBeenCalledWith("id", { ascending: true });
    });

    it("should return flashcards in random order", async () => {
      const mockData: FlashcardDTO[] = [
        { id: "1", source_text: "Hello", translation: "Cześć" },
        { id: "2", source_text: "World", translation: "Świat" },
        { id: "3", source_text: "Test", translation: "Test" },
      ];

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockData,
          count: 3,
          error: null,
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await listFlashcards(mockSupabase, userId, { order: "random" });

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(3);
      expect(result.count).toBe(3);
      // Note: We can't test randomness deterministically, but we can check that all items are present
      expect(result.data?.map((f) => f.id).sort()).toEqual(["1", "2", "3"]);
    });

    it("should apply limit parameter", async () => {
      const mockData: FlashcardDTO[] = [{ id: "1", source_text: "Hello", translation: "Cześć" }];

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: mockData,
          count: 1,
          error: null,
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await listFlashcards(mockSupabase, userId, { order: "id", limit: 1 });

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockData);
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(1);
    });

    it("should apply offset parameter", async () => {
      const mockData: FlashcardDTO[] = [{ id: "2", source_text: "World", translation: "Świat" }];

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: mockData,
          count: 1,
          error: null,
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await listFlashcards(mockSupabase, userId, { order: "id", offset: 1, limit: 10 });

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockData);
      expect(mockQueryBuilder.range).toHaveBeenCalledWith(1, 10);
    });

    it("should return error when userId is missing", async () => {
      const result = await listFlashcards(mockSupabase, "", {});

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe("userId is required");
      expect(result.data).toBeNull();
      expect(result.count).toBe(0);
    });

    it("should return error when database query fails", async () => {
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          count: 0,
          error: { message: "Database error" },
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await listFlashcards(mockSupabase, userId, {});

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe("Database error");
      expect(result.data).toBeNull();
    });

    it("should return empty array when no data", async () => {
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          count: 0,
          error: null,
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await listFlashcards(mockSupabase, userId, {});

      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe("getFlashcardById", () => {
    it("should return flashcard by id", async () => {
      const mockData: FlashcardDTO = { id: "1", source_text: "Hello", translation: "Cześć" };

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await getFlashcardById(mockSupabase, "1", userId);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockData);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("id", "1");
    });

    it("should return error when id is missing", async () => {
      const result = await getFlashcardById(mockSupabase, "", userId);

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe("ID and userId are required");
      expect(result.data).toBeNull();
    });

    it("should return error when userId is missing", async () => {
      const result = await getFlashcardById(mockSupabase, "1", "");

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe("ID and userId are required");
      expect(result.data).toBeNull();
    });

    it("should return error when flashcard not found", async () => {
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Not found" },
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await getFlashcardById(mockSupabase, "1", userId);

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe("Not found");
      expect(result.data).toBeNull();
    });

    it("should return null when no data", async () => {
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await getFlashcardById(mockSupabase, "1", userId);

      expect(result.error).toBeNull();
      expect(result.data).toBeNull();
    });
  });

  describe("createFlashcard", () => {
    it("should create flashcard with source_text and translation", async () => {
      const command = { source_text: "Hello", translation: "Cześć" };
      const mockData: FlashcardDTO = { id: "1", source_text: "Hello", translation: "Cześć" };

      const mockQueryBuilder = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await createFlashcard(mockSupabase, userId, command);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockData);
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
        source_text: "Hello",
        translation: "Cześć",
        user_id: userId,
      });
    });

    it("should create flashcard with source_text only", async () => {
      const command = { source_text: "Hello" };
      const mockData: FlashcardDTO = { id: "1", source_text: "Hello", translation: null };

      const mockQueryBuilder = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await createFlashcard(mockSupabase, userId, command);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockData);
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
        source_text: "Hello",
        translation: null,
        user_id: userId,
      });
    });

    it("should trim source_text before creating", async () => {
      const command = { source_text: "  Hello  ", translation: "Cześć" };
      const mockData: FlashcardDTO = { id: "1", source_text: "Hello", translation: "Cześć" };

      const mockQueryBuilder = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await createFlashcard(mockSupabase, userId, command);

      expect(result.error).toBeNull();
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
        source_text: "Hello",
        translation: "Cześć",
        user_id: userId,
      });
    });

    it("should return error when userId is missing", async () => {
      const command = { source_text: "Hello" };
      const result = await createFlashcard(mockSupabase, "", command);

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe("userId is required");
      expect(result.data).toBeNull();
    });

    it("should return error when source_text is empty", async () => {
      const command = { source_text: "" };
      const result = await createFlashcard(mockSupabase, userId, command);

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe("Source text is required");
      expect(result.data).toBeNull();
    });

    it("should return error when source_text exceeds 200 characters", async () => {
      const command = { source_text: "a".repeat(201) };
      const result = await createFlashcard(mockSupabase, userId, command);

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe("Source text exceeds maximum length of 200 characters");
      expect(result.data).toBeNull();
    });

    it("should return error when database insert fails", async () => {
      const command = { source_text: "Hello" };

      const mockQueryBuilder = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await createFlashcard(mockSupabase, userId, command);

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe("Database error");
      expect(result.data).toBeNull();
    });
  });

  describe("updateFlashcard", () => {
    it("should update source_text", async () => {
      const command = { source_text: "Updated" };
      const mockData: FlashcardDTO = { id: "1", source_text: "Updated", translation: "Cześć" };

      const mockQueryBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await updateFlashcard(mockSupabase, "1", userId, command);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockData);
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({ source_text: "Updated" });
    });

    it("should update translation", async () => {
      const command = { translation: "Updated translation" };
      const mockData: FlashcardDTO = { id: "1", source_text: "Hello", translation: "Updated translation" };

      const mockQueryBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await updateFlashcard(mockSupabase, "1", userId, command);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockData);
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({ translation: "Updated translation" });
    });

    it("should update both source_text and translation", async () => {
      const command = { source_text: "Updated", translation: "Updated translation" };
      const mockData: FlashcardDTO = { id: "1", source_text: "Updated", translation: "Updated translation" };

      const mockQueryBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await updateFlashcard(mockSupabase, "1", userId, command);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockData);
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        source_text: "Updated",
        translation: "Updated translation",
      });
    });

    it("should trim source_text and translation before updating", async () => {
      const command = { source_text: "  Updated  ", translation: "  Updated translation  " };
      const mockData: FlashcardDTO = { id: "1", source_text: "Updated", translation: "Updated translation" };

      const mockQueryBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await updateFlashcard(mockSupabase, "1", userId, command);

      expect(result.error).toBeNull();
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        source_text: "Updated",
        translation: "Updated translation",
      });
    });

    it("should set translation to null when empty string is provided", async () => {
      const command = { translation: "" };
      const mockData: FlashcardDTO = { id: "1", source_text: "Hello", translation: null };

      const mockQueryBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await updateFlashcard(mockSupabase, "1", userId, command);

      expect(result.error).toBeNull();
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({ translation: null });
    });

    it("should return error when id is missing", async () => {
      const command = { source_text: "Updated" };
      const result = await updateFlashcard(mockSupabase, "", userId, command);

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe("ID and userId are required");
      expect(result.data).toBeNull();
    });

    it("should return error when userId is missing", async () => {
      const command = { source_text: "Updated" };
      const result = await updateFlashcard(mockSupabase, "1", "", command);

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe("ID and userId are required");
      expect(result.data).toBeNull();
    });

    it("should return error when source_text exceeds 200 characters", async () => {
      const command = { source_text: "a".repeat(201) };
      const result = await updateFlashcard(mockSupabase, "1", userId, command);

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe("Source text exceeds maximum length of 200 characters");
      expect(result.data).toBeNull();
    });

    it("should return error when no fields to update", async () => {
      const command = {};
      const result = await updateFlashcard(mockSupabase, "1", userId, command);

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe("No fields to update");
      expect(result.data).toBeNull();
    });

    it("should return error when flashcard not found", async () => {
      const command = { source_text: "Updated" };

      const mockQueryBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "not found" },
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await updateFlashcard(mockSupabase, "1", userId, command);

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe("Flashcard not found");
      expect(result.data).toBeNull();
    });
  });

  describe("deleteFlashcard", () => {
    it("should delete flashcard", async () => {
      const mockQueryBuilder = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          error: null,
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await deleteFlashcard(mockSupabase, "1", userId);

      expect(result.error).toBeNull();
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("id", "1");
    });

    it("should return error when id is missing", async () => {
      const result = await deleteFlashcard(mockSupabase, "", userId);

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe("ID and userId are required");
    });

    it("should return error when userId is missing", async () => {
      const result = await deleteFlashcard(mockSupabase, "1", "");

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe("ID and userId are required");
    });

    it("should return error when flashcard not found", async () => {
      const mockQueryBuilder = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          error: { message: "not found" },
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await deleteFlashcard(mockSupabase, "1", userId);

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe("Flashcard not found");
    });

    it("should return error when database delete fails", async () => {
      const mockQueryBuilder = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          error: { message: "Database error" },
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockQueryBuilder);

      const result = await deleteFlashcard(mockSupabase, "1", userId);

      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe("Database error");
    });
  });
});

