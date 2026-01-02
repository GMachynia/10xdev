import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NavigationButtonsProps } from "../../types.ts";

/**
 * NavigationButtons component provides previous/next buttons
 * for navigating between flashcards.
 */
export function NavigationButtons({ hasPrevious, hasNext, onPrevious, onNext }: NavigationButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      <Button variant="outline" size="icon" disabled={!hasPrevious} onClick={onPrevious} aria-label="Poprzednia fiszka">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" disabled={!hasNext} onClick={onNext} aria-label="Następna fiszka">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
