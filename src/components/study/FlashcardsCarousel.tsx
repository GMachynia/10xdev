import { useSwipeable } from "react-swipeable";
import { useEffect } from "react";
import { FlashcardCard } from "./FlashcardCard";
import { NavigationButtons } from "./NavigationButtons";
import { ProgressIndicator } from "./ProgressIndicator";
import type { FlashcardsCarouselProps } from "../../types.ts";

/**
 * FlashcardsCarousel component displays flashcards in a carousel format
 * with swipe gestures, keyboard navigation, and navigation buttons.
 */
export function FlashcardsCarousel({
  flashcards,
  currentIndex,
  mode: _mode,
  isCardFlipped,
  onCardChange,
  onCardFlip,
  onEdit,
  onDelete,
  progress,
}: FlashcardsCarouselProps) {
  const currentFlashcard = flashcards[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < flashcards.length - 1;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard events if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.key === "ArrowLeft" && hasPrevious) {
        e.preventDefault();
        onCardChange(currentIndex - 1);
      } else if (e.key === "ArrowRight" && hasNext) {
        e.preventDefault();
        onCardChange(currentIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, hasPrevious, hasNext, onCardChange]);

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (hasNext) {
        onCardChange(currentIndex + 1);
      }
    },
    onSwipedRight: () => {
      if (hasPrevious) {
        onCardChange(currentIndex - 1);
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  if (!currentFlashcard) {
    return null;
  }

  return (
    <div className="w-full" {...swipeHandlers}>
      {progress && (
        <div className="flex justify-center mb-4">
          <ProgressIndicator current={progress.current} total={progress.total} />
        </div>
      )}
      <FlashcardCard
        flashcard={currentFlashcard}
        isFlipped={isCardFlipped}
        onFlip={onCardFlip}
        onEdit={() => onEdit(currentFlashcard)}
        onDelete={() => onDelete(currentFlashcard)}
      />
      <NavigationButtons
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onPrevious={() => onCardChange(currentIndex - 1)}
        onNext={() => onCardChange(currentIndex + 1)}
      />
    </div>
  );
}
