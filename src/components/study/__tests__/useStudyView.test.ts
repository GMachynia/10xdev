import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useStudyView } from "../useStudyView";
import * as apiClient from "../../../lib/utils/api-client";
import type { FlashcardDTO, ErrorResponse } from "../../../types";

// Mock the API client
vi.mock("../../../lib/utils/api-client");

describe("useStudyView", () => {
  const mockFlashcards: FlashcardDTO[] = [
    { id: "1", source_text: "Hello", translation: "Cześć" },
    { id: "2", source_text: "World", translation: "Świat" },
    { id: "3", source_text: "Test", translation: "Test" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial state", () => {
    it("should initialize with default state", () => {
      const { result } = renderHook(() => useStudyView());

      expect(result.current.state).toEqual({
        flashcards: [],
        currentIndex: 0,
        mode: "browse",
        isStudySessionActive: false,
        studySession: null,
        isLoading: false,
        error: null,
        editingFlashcard: null,
        deletingFlashcard: null,
        isCardFlipped: false,
      });
    });
  });

  describe("fetchFlashcards", () => {
    it("should fetch flashcards successfully", async () => {
      vi.spyOn(apiClient, "fetchFlashcards").mockResolvedValue({
        data: { data: mockFlashcards, count: 3 },
        error: null,
      });

      const { result } = renderHook(() => useStudyView());

      await act(async () => {
        await result.current.fetchFlashcards("id");
      });

      await waitFor(() => {
        expect(result.current.state.flashcards).toEqual(mockFlashcards);
        expect(result.current.state.isLoading).toBe(false);
        expect(result.current.state.error).toBeNull();
        expect(result.current.state.currentIndex).toBe(0);
      });
    });

    it("should handle fetch error", async () => {
      const mockError: ErrorResponse = {
        error: {
          code: "DATABASE_ERROR",
          message: "Database connection failed",
        },
      };

      vi.spyOn(apiClient, "fetchFlashcards").mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { result } = renderHook(() => useStudyView());

      await act(async () => {
        await result.current.fetchFlashcards("id");
      });

      await waitFor(() => {
        expect(result.current.state.error).toEqual(mockError);
        expect(result.current.state.flashcards).toEqual([]);
        expect(result.current.state.isLoading).toBe(false);
      });
    });

    it("should set loading state during fetch", async () => {
      vi.spyOn(apiClient, "fetchFlashcards").mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({ data: { data: mockFlashcards, count: 3 }, error: null });
            }, 100);
          })
      );

      const { result } = renderHook(() => useStudyView());

      act(() => {
        result.current.fetchFlashcards("id");
      });

      expect(result.current.state.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });
    });
  });

  describe("Mode switching", () => {
    it("should switch to study mode", () => {
      const { result } = renderHook(() => useStudyView());

      act(() => {
        result.current.setMode("study");
      });

      expect(result.current.state.mode).toBe("study");
      expect(result.current.state.isStudySessionActive).toBe(false);
      expect(result.current.state.studySession).toBeNull();
      expect(result.current.state.currentIndex).toBe(0);
    });

    it("should switch to browse mode", () => {
      const { result } = renderHook(() => useStudyView());

      act(() => {
        result.current.setMode("study");
      });

      act(() => {
        result.current.setMode("browse");
      });

      expect(result.current.state.mode).toBe("browse");
      expect(result.current.state.isStudySessionActive).toBe(false);
      expect(result.current.state.studySession).toBeNull();
    });
  });

  describe("Study session", () => {
    it("should start study session successfully", async () => {
      vi.spyOn(apiClient, "fetchFlashcards").mockResolvedValue({
        data: { data: mockFlashcards, count: 3 },
        error: null,
      });

      const { result } = renderHook(() => useStudyView());

      await act(async () => {
        await result.current.startStudySession();
      });

      await waitFor(() => {
        expect(result.current.state.mode).toBe("study");
        expect(result.current.state.isStudySessionActive).toBe(true);
        expect(result.current.state.studySession).not.toBeNull();
        expect(result.current.state.studySession?.flashcards).toHaveLength(3);
        expect(result.current.state.studySession?.currentIndex).toBe(0);
        expect(result.current.state.studySession?.completed.size).toBe(0);
      });
    });

    it("should reset study session", async () => {
      vi.spyOn(apiClient, "fetchFlashcards").mockResolvedValue({
        data: { data: mockFlashcards, count: 3 },
        error: null,
      });

      const { result } = renderHook(() => useStudyView());

      await act(async () => {
        await result.current.startStudySession();
      });

      await waitFor(() => {
        expect(result.current.state.isStudySessionActive).toBe(true);
      });

      act(() => {
        result.current.resetStudySession();
      });

      expect(result.current.state.isStudySessionActive).toBe(false);
      expect(result.current.state.studySession).toBeNull();
      expect(result.current.state.currentIndex).toBe(0);
    });

    it("should handle empty flashcards when starting study session", async () => {
      vi.spyOn(apiClient, "fetchFlashcards").mockResolvedValue({
        data: { data: [], count: 0 },
        error: null,
      });

      const { result } = renderHook(() => useStudyView());

      await act(async () => {
        await result.current.startStudySession();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
        expect(result.current.state.isStudySessionActive).toBe(false);
      });
    });
  });

  describe("Navigation", () => {
    beforeEach(async () => {
      vi.spyOn(apiClient, "fetchFlashcards").mockResolvedValue({
        data: { data: mockFlashcards, count: 3 },
        error: null,
      });
    });

    it("should navigate to next card", async () => {
      const { result } = renderHook(() => useStudyView());

      await act(async () => {
        await result.current.fetchFlashcards("id");
      });

      await waitFor(() => {
        expect(result.current.state.flashcards).toHaveLength(3);
      });

      act(() => {
        result.current.goToNext();
      });

      expect(result.current.state.currentIndex).toBe(1);
      expect(result.current.state.isCardFlipped).toBe(false);
    });

    it("should navigate to previous card", async () => {
      const { result } = renderHook(() => useStudyView());

      await act(async () => {
        await result.current.fetchFlashcards("id");
      });

      await waitFor(() => {
        expect(result.current.state.flashcards).toHaveLength(3);
      });

      act(() => {
        result.current.goToNext();
      });

      act(() => {
        result.current.goToPrevious();
      });

      expect(result.current.state.currentIndex).toBe(0);
    });

    it("should not go below 0 when navigating to previous", async () => {
      const { result } = renderHook(() => useStudyView());

      await act(async () => {
        await result.current.fetchFlashcards("id");
      });

      await waitFor(() => {
        expect(result.current.state.flashcards).toHaveLength(3);
      });

      act(() => {
        result.current.goToPrevious();
      });

      expect(result.current.state.currentIndex).toBe(0);
    });

    it("should not go beyond last card when navigating to next", async () => {
      const { result } = renderHook(() => useStudyView());

      await act(async () => {
        await result.current.fetchFlashcards("id");
      });

      await waitFor(() => {
        expect(result.current.state.flashcards).toHaveLength(3);
      });

      act(() => {
        result.current.navigateToCard(2);
      });

      act(() => {
        result.current.goToNext();
      });

      expect(result.current.state.currentIndex).toBe(2);
    });

    it("should navigate to specific card", async () => {
      const { result } = renderHook(() => useStudyView());

      await act(async () => {
        await result.current.fetchFlashcards("id");
      });

      await waitFor(() => {
        expect(result.current.state.flashcards).toHaveLength(3);
      });

      act(() => {
        result.current.navigateToCard(2);
      });

      expect(result.current.state.currentIndex).toBe(2);
      expect(result.current.state.isCardFlipped).toBe(false);
    });

    it("should clamp index when navigating to out of bounds", async () => {
      const { result } = renderHook(() => useStudyView());

      await act(async () => {
        await result.current.fetchFlashcards("id");
      });

      await waitFor(() => {
        expect(result.current.state.flashcards).toHaveLength(3);
      });

      act(() => {
        result.current.navigateToCard(10);
      });

      expect(result.current.state.currentIndex).toBe(2);

      act(() => {
        result.current.navigateToCard(-5);
      });

      expect(result.current.state.currentIndex).toBe(0);
    });
  });

  describe("Card flipping", () => {
    it("should flip card", () => {
      const { result } = renderHook(() => useStudyView());

      act(() => {
        result.current.flipCard();
      });

      expect(result.current.state.isCardFlipped).toBe(true);

      act(() => {
        result.current.flipCard();
      });

      expect(result.current.state.isCardFlipped).toBe(false);
    });

    it("should reset flip state when navigating", async () => {
      vi.spyOn(apiClient, "fetchFlashcards").mockResolvedValue({
        data: { data: mockFlashcards, count: 3 },
        error: null,
      });

      const { result } = renderHook(() => useStudyView());

      await act(async () => {
        await result.current.fetchFlashcards("id");
      });

      await waitFor(() => {
        expect(result.current.state.flashcards).toHaveLength(3);
      });

      act(() => {
        result.current.flipCard();
      });

      expect(result.current.state.isCardFlipped).toBe(true);

      act(() => {
        result.current.goToNext();
      });

      expect(result.current.state.isCardFlipped).toBe(false);
    });
  });

  describe("Edit dialog", () => {
    it("should open edit dialog", () => {
      const { result } = renderHook(() => useStudyView());
      const flashcard = mockFlashcards[0];

      act(() => {
        result.current.openEditDialog(flashcard);
      });

      expect(result.current.state.editingFlashcard).toEqual(flashcard);
    });

    it("should close edit dialog", () => {
      const { result } = renderHook(() => useStudyView());
      const flashcard = mockFlashcards[0];

      act(() => {
        result.current.openEditDialog(flashcard);
      });

      act(() => {
        result.current.closeEditDialog();
      });

      expect(result.current.state.editingFlashcard).toBeNull();
    });
  });

  describe("Delete dialog", () => {
    it("should open delete dialog", () => {
      const { result } = renderHook(() => useStudyView());
      const flashcard = mockFlashcards[0];

      act(() => {
        result.current.openDeleteDialog(flashcard);
      });

      expect(result.current.state.deletingFlashcard).toEqual(flashcard);
    });

    it("should close delete dialog", () => {
      const { result } = renderHook(() => useStudyView());
      const flashcard = mockFlashcards[0];

      act(() => {
        result.current.openDeleteDialog(flashcard);
      });

      act(() => {
        result.current.closeDeleteDialog();
      });

      expect(result.current.state.deletingFlashcard).toBeNull();
    });
  });

  describe("Update flashcard", () => {
    beforeEach(() => {
      vi.spyOn(apiClient, "fetchFlashcards").mockResolvedValue({
        data: { data: mockFlashcards, count: 3 },
        error: null,
      });
    });

    it("should update flashcard optimistically", async () => {
      vi.spyOn(apiClient, "updateFlashcard").mockResolvedValue({
        data: { data: { id: "1", source_text: "Updated", translation: "Cześć" } },
        error: null,
      });

      const { result } = renderHook(() => useStudyView());

      await act(async () => {
        await result.current.fetchFlashcards("id");
      });

      await waitFor(() => {
        expect(result.current.state.flashcards).toHaveLength(3);
      });

      await act(async () => {
        await result.current.updateFlashcard("1", { source_text: "Updated" });
      });

      await waitFor(() => {
        const updatedCard = result.current.state.flashcards.find((f) => f.id === "1");
        expect(updatedCard?.source_text).toBe("Updated");
      });
    });

    it("should close edit dialog after successful update", async () => {
      vi.spyOn(apiClient, "updateFlashcard").mockResolvedValue({
        data: { data: { id: "1", source_text: "Updated", translation: "Cześć" } },
        error: null,
      });

      const { result } = renderHook(() => useStudyView());

      await act(async () => {
        await result.current.fetchFlashcards("id");
      });

      await waitFor(() => {
        expect(result.current.state.flashcards).toHaveLength(3);
      });

      act(() => {
        result.current.openEditDialog(mockFlashcards[0]);
      });

      expect(result.current.state.editingFlashcard).not.toBeNull();

      await act(async () => {
        await result.current.updateFlashcard("1", { source_text: "Updated" });
      });

      await waitFor(() => {
        expect(result.current.state.editingFlashcard).toBeNull();
      });
    });

    it("should revert optimistic update on error", async () => {
      const mockError: ErrorResponse = {
        error: {
          code: "DATABASE_ERROR",
          message: "Update failed",
        },
      };

      vi.spyOn(apiClient, "updateFlashcard").mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { result } = renderHook(() => useStudyView());

      await act(async () => {
        await result.current.fetchFlashcards("id");
      });

      await waitFor(() => {
        expect(result.current.state.flashcards).toHaveLength(3);
      });

      const originalCard = result.current.state.flashcards[0];

      try {
        await act(async () => {
          await result.current.updateFlashcard("1", { source_text: "Updated" });
        });
      } catch (error) {
        // Expected error
      }

      // Should refetch after error
      await waitFor(() => {
        expect(apiClient.fetchFlashcards).toHaveBeenCalled();
      });
    });
  });

  describe("Delete flashcard", () => {
    beforeEach(() => {
      vi.spyOn(apiClient, "fetchFlashcards").mockResolvedValue({
        data: { data: mockFlashcards, count: 3 },
        error: null,
      });
    });

    it("should delete flashcard optimistically", async () => {
      vi.spyOn(apiClient, "deleteFlashcard").mockResolvedValue({
        data: null,
        error: null,
      });

      const { result } = renderHook(() => useStudyView());

      await act(async () => {
        await result.current.fetchFlashcards("id");
      });

      await waitFor(() => {
        expect(result.current.state.flashcards).toHaveLength(3);
      });

      await act(async () => {
        await result.current.deleteFlashcard("1");
      });

      await waitFor(() => {
        expect(result.current.state.flashcards).toHaveLength(2);
        expect(result.current.state.flashcards.find((f) => f.id === "1")).toBeUndefined();
      });
    });

    it("should close delete dialog after successful delete", async () => {
      vi.spyOn(apiClient, "deleteFlashcard").mockResolvedValue({
        data: null,
        error: null,
      });

      const { result } = renderHook(() => useStudyView());

      await act(async () => {
        await result.current.fetchFlashcards("id");
      });

      await waitFor(() => {
        expect(result.current.state.flashcards).toHaveLength(3);
      });

      act(() => {
        result.current.openDeleteDialog(mockFlashcards[0]);
      });

      expect(result.current.state.deletingFlashcard).not.toBeNull();

      await act(async () => {
        await result.current.deleteFlashcard("1");
      });

      await waitFor(() => {
        expect(result.current.state.deletingFlashcard).toBeNull();
      });
    });

    it("should adjust current index when deleting current card", async () => {
      vi.spyOn(apiClient, "deleteFlashcard").mockResolvedValue({
        data: null,
        error: null,
      });

      const { result } = renderHook(() => useStudyView());

      await act(async () => {
        await result.current.fetchFlashcards("id");
      });

      await waitFor(() => {
        expect(result.current.state.flashcards).toHaveLength(3);
      });

      act(() => {
        result.current.navigateToCard(2);
      });

      expect(result.current.state.currentIndex).toBe(2);

      await act(async () => {
        await result.current.deleteFlashcard("3");
      });

      await waitFor(() => {
        expect(result.current.state.currentIndex).toBe(1);
      });
    });

    it("should revert optimistic delete on error", async () => {
      const mockError: ErrorResponse = {
        error: {
          code: "DATABASE_ERROR",
          message: "Delete failed",
        },
      };

      vi.spyOn(apiClient, "deleteFlashcard").mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { result } = renderHook(() => useStudyView());

      await act(async () => {
        await result.current.fetchFlashcards("id");
      });

      await waitFor(() => {
        expect(result.current.state.flashcards).toHaveLength(3);
      });

      try {
        await act(async () => {
          await result.current.deleteFlashcard("1");
        });
      } catch (error) {
        // Expected error
      }

      // Should restore the deleted flashcard
      await waitFor(() => {
        expect(result.current.state.flashcards).toHaveLength(3);
      });
    });
  });

  describe("Retry", () => {
    it("should retry fetching flashcards in browse mode", async () => {
      vi.spyOn(apiClient, "fetchFlashcards").mockResolvedValue({
        data: { data: mockFlashcards, count: 3 },
        error: null,
      });

      const { result } = renderHook(() => useStudyView());

      act(() => {
        result.current.setMode("browse");
      });

      act(() => {
        result.current.retry();
      });

      await waitFor(() => {
        expect(apiClient.fetchFlashcards).toHaveBeenCalledWith({ order: "id" });
      });
    });

    it("should retry fetching flashcards in study mode", async () => {
      vi.spyOn(apiClient, "fetchFlashcards").mockResolvedValue({
        data: { data: mockFlashcards, count: 3 },
        error: null,
      });

      const { result } = renderHook(() => useStudyView());

      act(() => {
        result.current.setMode("study");
      });

      act(() => {
        result.current.retry();
      });

      await waitFor(() => {
        expect(apiClient.fetchFlashcards).toHaveBeenCalledWith({ order: "random" });
      });
    });
  });
});

