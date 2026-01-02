import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { FlashcardCardProps } from "../../types.ts";

/**
 * FlashcardCard component displays a flashcard with 3D flip animation.
 * Shows source text on front and translation on back.
 */
export function FlashcardCard({ flashcard, isFlipped, onFlip, onEdit, onDelete }: FlashcardCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't flip if clicking on buttons
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    onFlip();
  };

  return (
    <div className="perspective-1000 w-full max-w-md mx-auto">
      <div
        className={`relative w-full h-64 transition-transform duration-500 ease-in-out transform-gpu ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{ transformStyle: "preserve-3d" }}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onFlip();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? "Kliknij, aby zobaczyć awers" : "Kliknij, aby zobaczyć rewers"}
      >
        {/* Front side (source text) */}
        <Card
          className="absolute inset-0 w-full h-full backface-hidden flex flex-col"
          style={{ backfaceVisibility: "hidden" }}
        >
          <CardContent className="flex-1 flex items-center justify-center p-6 relative">
            <p className="text-2xl font-medium text-center">{flashcard.source_text}</p>
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                aria-label="Edytuj fiszkę"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                aria-label="Usuń fiszkę"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back side (translation) */}
        <Card
          className="absolute inset-0 w-full h-full backface-hidden flex flex-col"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <CardContent className="flex-1 flex items-center justify-center p-6">
            <p className="text-2xl font-medium text-center text-muted-foreground">
              {flashcard.translation || "Brak translacji"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
