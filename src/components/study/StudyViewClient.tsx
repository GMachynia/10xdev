import { useEffect } from "react";
import { useStudyView } from "./useStudyView";
import { StudyModeSelector } from "./StudyModeSelector";
import { FlashcardsStats } from "./FlashcardsStats";
import { FlashcardsCarousel } from "./FlashcardsCarousel";
import { EditFlashcardDialog } from "./EditFlashcardDialog";
import { DeleteFlashcardDialog } from "./DeleteFlashcardDialog";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { ErrorDisplay } from "./ErrorDisplay";

interface StudyViewClientProps {
  initialFlashcards?: never; // Reserved for future SSR support
}

/**
 * StudyViewClient is the main React component for the study view.
 * It manages the entire study view state and coordinates all sub-components.
 */
export function StudyViewClient(_props: StudyViewClientProps) {
  const {
    state,
    fetchFlashcards,
    setMode,
    startStudySession,
    resetStudySession: _resetStudySession,
    navigateToCard,
    goToPrevious: _goToPrevious,
    goToNext: _goToNext,
    flipCard,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    updateFlashcard,
    deleteFlashcard,
    retry,
  } = useStudyView();

  // Fetch flashcards on mount
  useEffect(() => {
    fetchFlashcards("id");
  }, [fetchFlashcards]);

  // Get current flashcards based on mode
  const currentFlashcards =
    state.mode === "study" && state.studySession ? state.studySession.flashcards : state.flashcards;

  const currentFlashcard = currentFlashcards[state.currentIndex];

  // Calculate progress for study mode
  const progress =
    state.mode === "study" && state.studySession
      ? {
          current: state.currentIndex + 1,
          total: state.studySession.flashcards.length,
        }
      : undefined;

  // Handle flashcard edit
  const handleEdit = (flashcard: typeof currentFlashcard) => {
    if (flashcard) {
      openEditDialog(flashcard);
    }
  };

  // Handle flashcard delete
  const handleDelete = (flashcard: typeof currentFlashcard) => {
    if (flashcard) {
      openDeleteDialog(flashcard);
    }
  };

  // Handle save in edit dialog
  const handleSave = async (id: string, data: Parameters<typeof updateFlashcard>[1]) => {
    try {
      await updateFlashcard(id, data);
    } catch (error) {
      // Error is handled in the hook, but we can show a toast here if needed
      throw error; // Re-throw to let dialog handle it
    }
  };

  // Handle confirm in delete dialog
  const handleDeleteConfirm = async (id: string) => {
    try {
      await deleteFlashcard(id);
    } catch (error) {
      // Error is handled in the hook, but we can show a toast here if needed
      throw error; // Re-throw to let dialog handle it
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <StudyModeSelector
        mode={state.mode}
        onModeChange={setMode}
        onStartStudySession={startStudySession}
        hasFlashcards={state.flashcards.length > 0}
      />

      {state.isLoading && <LoadingState />}

      {!state.isLoading && state.error && <ErrorDisplay error={state.error} onRetry={retry} />}

      {!state.isLoading && !state.error && state.flashcards.length === 0 && <EmptyState />}

      {!state.isLoading && !state.error && state.flashcards.length > 0 && (
        <>
          <FlashcardsStats count={state.flashcards.length} />
          {currentFlashcard && (
            <FlashcardsCarousel
              flashcards={currentFlashcards}
              currentIndex={state.currentIndex}
              mode={state.mode}
              isCardFlipped={state.isCardFlipped}
              onCardChange={navigateToCard}
              onCardFlip={flipCard}
              onEdit={handleEdit}
              onDelete={handleDelete}
              progress={progress}
            />
          )}
        </>
      )}

      <EditFlashcardDialog
        flashcard={state.editingFlashcard}
        onSave={handleSave}
        onCancel={closeEditDialog}
        isOpen={!!state.editingFlashcard}
      />

      <DeleteFlashcardDialog
        flashcard={state.deletingFlashcard}
        onConfirm={handleDeleteConfirm}
        onCancel={closeDeleteDialog}
        isOpen={!!state.deletingFlashcard}
      />
    </div>
  );
}
