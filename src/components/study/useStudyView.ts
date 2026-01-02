import { useState, useCallback } from "react";
import { fetchFlashcards, updateFlashcard, deleteFlashcard } from "../../lib/utils/api-client.ts";
import type { StudyViewState, FlashcardDTO, UpdateFlashcardCommand } from "../../types.ts";

/**
 * Helper function to redirect to login page.
 * Extracted outside the hook to avoid react-compiler warnings.
 */
function redirectToLogin() {
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

/**
 * Custom hook for managing the StudyView state and operations.
 * Handles fetching flashcards, mode switching, study sessions, navigation, and optimistic updates.
 */
export function useStudyView() {
  const [state, setState] = useState<StudyViewState>({
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

  /**
   * Fetches flashcards from the API.
   */
  const fetchFlashcardsData = useCallback(async (order: "id" | "random" = "id") => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const { data, error } = await fetchFlashcards({ order });

    if (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error,
        flashcards: [],
      }));

      // Handle 401 - redirect to login (handled by middleware in production)
      if (error.error.code === "UNAUTHORIZED") {
        // Don't redirect immediately - let user see the error
        // window.location.href = "/";
      }
      return;
    }

    if (!data) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        flashcards: [],
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: false,
      flashcards: data.data,
      currentIndex: 0,
      isCardFlipped: false,
      error: null,
    }));
  }, []);

  /**
   * Sets the view mode (browse or study).
   */
  const setMode = useCallback((mode: "browse" | "study") => {
    setState((prev) => ({
      ...prev,
      mode,
      isStudySessionActive: false,
      studySession: null,
      currentIndex: 0,
      isCardFlipped: false,
    }));
  }, []);

  /**
   * Starts a study session with flashcards in random order.
   */
  const startStudySession = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const { data, error } = await fetchFlashcards({ order: "random" });

    if (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error,
      }));
      return;
    }

    if (!data || data.data.length === 0) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: false,
      mode: "study",
      isStudySessionActive: true,
      studySession: {
        flashcards: data.data,
        currentIndex: 0,
        completed: new Set<string>(),
      },
      currentIndex: 0,
      isCardFlipped: false,
      error: null,
    }));
  }, []);

  /**
   * Resets the study session.
   */
  const resetStudySession = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isStudySessionActive: false,
      studySession: null,
      currentIndex: 0,
      isCardFlipped: false,
    }));
  }, []);

  /**
   * Navigates to a specific card index.
   */
  const navigateToCard = useCallback((index: number) => {
    setState((prev) => {
      const maxIndex =
        prev.mode === "study" && prev.studySession
          ? prev.studySession.flashcards.length - 1
          : prev.flashcards.length - 1;

      const newIndex = Math.max(0, Math.min(index, maxIndex));
      return {
        ...prev,
        currentIndex: newIndex,
        isCardFlipped: false,
      };
    });
  }, []);

  /**
   * Navigates to the previous card.
   */
  const goToPrevious = useCallback(() => {
    setState((prev) => {
      if (prev.currentIndex > 0) {
        return {
          ...prev,
          currentIndex: prev.currentIndex - 1,
          isCardFlipped: false,
        };
      }
      return prev;
    });
  }, []);

  /**
   * Navigates to the next card.
   */
  const goToNext = useCallback(() => {
    setState((prev) => {
      const maxIndex =
        prev.mode === "study" && prev.studySession
          ? prev.studySession.flashcards.length - 1
          : prev.flashcards.length - 1;

      if (prev.currentIndex < maxIndex) {
        return {
          ...prev,
          currentIndex: prev.currentIndex + 1,
          isCardFlipped: false,
        };
      }
      return prev;
    });
  }, []);

  /**
   * Flips the current card.
   */
  const flipCard = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isCardFlipped: !prev.isCardFlipped,
    }));
  }, []);

  /**
   * Opens the edit dialog for a flashcard.
   */
  const openEditDialog = useCallback((flashcard: FlashcardDTO) => {
    setState((prev) => ({
      ...prev,
      editingFlashcard: flashcard,
    }));
  }, []);

  /**
   * Closes the edit dialog.
   */
  const closeEditDialog = useCallback(() => {
    setState((prev) => ({
      ...prev,
      editingFlashcard: null,
    }));
  }, []);

  /**
   * Opens the delete dialog for a flashcard.
   */
  const openDeleteDialog = useCallback((flashcard: FlashcardDTO) => {
    setState((prev) => ({
      ...prev,
      deletingFlashcard: flashcard,
    }));
  }, []);

  /**
   * Closes the delete dialog.
   */
  const closeDeleteDialog = useCallback(() => {
    setState((prev) => ({
      ...prev,
      deletingFlashcard: null,
    }));
  }, []);

  /**
   * Updates a flashcard with optimistic update.
   */
  const updateFlashcardData = useCallback(
    async (id: string, command: UpdateFlashcardCommand) => {
      // Optimistic update
      setState((prev) => {
        const updateFlashcardInArray = (flashcards: FlashcardDTO[]): FlashcardDTO[] => {
          return flashcards.map((fc) =>
            fc.id === id
              ? {
                  ...fc,
                  source_text: command.source_text ?? fc.source_text,
                  translation: command.translation ?? fc.translation,
                }
              : fc
          );
        };

        const updatedFlashcards = updateFlashcardInArray(prev.flashcards);
        const updatedStudySession = prev.studySession
          ? {
              ...prev.studySession,
              flashcards: updateFlashcardInArray(prev.studySession.flashcards),
            }
          : null;

        return {
          ...prev,
          flashcards: updatedFlashcards,
          studySession: updatedStudySession,
          editingFlashcard: null,
        };
      });

      // API call
      const { data, error } = await updateFlashcard(id, command);

      if (error) {
        // Revert optimistic update
        setState((prev) => {
          // Re-fetch to get correct data
          fetchFlashcardsData(prev.mode === "study" ? "random" : "id");
          return {
            ...prev,
            editingFlashcard: prev.editingFlashcard, // Keep dialog open
          };
        });

        // Handle 401 - redirect to login
        if (error.error.code === "UNAUTHORIZED") {
          // Use setTimeout to defer the redirect outside of the render cycle
          setTimeout(() => {
            redirectToLogin();
          }, 0);
        }

        throw error;
      }

      if (data) {
        // Update with server response
        setState((prev) => {
          const updateFlashcardInArray = (flashcards: FlashcardDTO[]): FlashcardDTO[] => {
            return flashcards.map((fc) => (fc.id === id ? data.data : fc));
          };

          return {
            ...prev,
            flashcards: updateFlashcardInArray(prev.flashcards),
            studySession: prev.studySession
              ? {
                  ...prev.studySession,
                  flashcards: updateFlashcardInArray(prev.studySession.flashcards),
                }
              : null,
            editingFlashcard: null,
          };
        });
      }
    },
    [fetchFlashcardsData]
  );

  /**
   * Deletes a flashcard with optimistic update.
   */
  const deleteFlashcardData = useCallback(
    async (id: string) => {
      // Store the flashcard for potential restoration
      const flashcardToDelete = state.flashcards.find((fc) => fc.id === id);
      if (!flashcardToDelete) {
        return;
      }

      // Optimistic update
      setState((prev) => {
        const removeFlashcardFromArray = (flashcards: FlashcardDTO[]): FlashcardDTO[] => {
          return flashcards.filter((fc) => fc.id !== id);
        };

        const updatedFlashcards = removeFlashcardFromArray(prev.flashcards);
        const updatedStudySession = prev.studySession
          ? {
              ...prev.studySession,
              flashcards: removeFlashcardFromArray(prev.studySession.flashcards),
            }
          : null;

        // Adjust current index if needed
        let newIndex = prev.currentIndex;
        if (newIndex >= updatedFlashcards.length && updatedFlashcards.length > 0) {
          newIndex = updatedFlashcards.length - 1;
        } else if (updatedFlashcards.length === 0) {
          newIndex = 0;
        }

        return {
          ...prev,
          flashcards: updatedFlashcards,
          studySession: updatedStudySession,
          currentIndex: newIndex,
          deletingFlashcard: null,
        };
      });

      // API call
      const { error } = await deleteFlashcard(id);

      if (error) {
        // Revert optimistic update - restore flashcard
        setState((prev) => {
          const restoreFlashcard = (flashcards: FlashcardDTO[]): FlashcardDTO[] => {
            // Find insertion point (maintain order)
            const insertIndex = flashcards.findIndex((fc) => fc.id > flashcardToDelete.id);
            if (insertIndex === -1) {
              return [...flashcards, flashcardToDelete];
            }
            return [...flashcards.slice(0, insertIndex), flashcardToDelete, ...flashcards.slice(insertIndex)];
          };

          return {
            ...prev,
            flashcards: restoreFlashcard(prev.flashcards),
            studySession: prev.studySession
              ? {
                  ...prev.studySession,
                  flashcards: restoreFlashcard(prev.studySession.flashcards),
                }
              : null,
            deletingFlashcard: null,
          };
        });

        // Handle 401 - redirect to login
        if (error.error.code === "UNAUTHORIZED") {
          // Use setTimeout to defer the redirect outside of the render cycle
          setTimeout(() => {
            redirectToLogin();
          }, 0);
        }

        throw error;
      }
    },
    [state.flashcards]
  );

  /**
   * Retries fetching flashcards.
   */
  const retry = useCallback(() => {
    const order = state.mode === "study" ? "random" : "id";
    fetchFlashcardsData(order);
  }, [state.mode, fetchFlashcardsData]);

  return {
    state,
    fetchFlashcards: fetchFlashcardsData,
    setMode,
    startStudySession,
    resetStudySession,
    navigateToCard,
    goToPrevious,
    goToNext,
    flipCard,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    updateFlashcard: updateFlashcardData,
    deleteFlashcard: deleteFlashcardData,
    retry,
  };
}
