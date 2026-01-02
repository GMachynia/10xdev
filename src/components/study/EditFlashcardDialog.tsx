import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CharacterCounter } from "./CharacterCounter";
import type { EditFlashcardDialogProps, UpdateFlashcardCommand } from "../../types.ts";

const MAX_SOURCE_TEXT_LENGTH = 200;

/**
 * EditFlashcardDialog component provides a form for editing flashcard data.
 */
export function EditFlashcardDialog({ flashcard, onSave, onCancel, isOpen }: EditFlashcardDialogProps) {
  const [sourceText, setSourceText] = useState("");
  const [translation, setTranslation] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when flashcard changes
  useEffect(() => {
    if (flashcard) {
      setSourceText(flashcard.source_text);
      setTranslation(flashcard.translation || "");
      setValidationError(null);
    }
  }, [flashcard]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSourceText("");
      setTranslation("");
      setValidationError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSourceTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSourceText(value);

    // Real-time validation
    if (value.trim().length === 0) {
      setValidationError("Tekst źródłowy nie może być pusty");
    } else if (value.length > MAX_SOURCE_TEXT_LENGTH) {
      setValidationError(`Tekst źródłowy przekracza maksymalną długość ${MAX_SOURCE_TEXT_LENGTH} znaków`);
    } else {
      setValidationError(null);
    }
  };

  const handleTranslationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranslation(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!flashcard) {
      return;
    }

    // Final validation
    const trimmedSourceText = sourceText.trim();
    if (trimmedSourceText.length === 0) {
      setValidationError("Tekst źródłowy nie może być pusty");
      return;
    }

    if (trimmedSourceText.length > MAX_SOURCE_TEXT_LENGTH) {
      setValidationError(`Tekst źródłowy przekracza maksymalną długość ${MAX_SOURCE_TEXT_LENGTH} znaków`);
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    try {
      const command: UpdateFlashcardCommand = {
        source_text: trimmedSourceText,
        translation: translation.trim() || null,
      };

      await onSave(flashcard.id, command);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Nie udało się zapisać fiszki";
      setValidationError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!flashcard) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edytuj fiszkę</DialogTitle>
          <DialogDescription>Wprowadź zmiany w tekście źródłowym i translacji</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="source_text" className="text-sm font-medium">
                Tekst źródłowy
              </label>
              <Input
                id="source_text"
                value={sourceText}
                onChange={handleSourceTextChange}
                maxLength={MAX_SOURCE_TEXT_LENGTH}
                disabled={isSubmitting}
                aria-invalid={validationError ? "true" : "false"}
                aria-describedby={validationError ? "source_text_error" : "source_text_counter"}
              />
              <div className="flex items-center justify-between">
                <CharacterCounter current={sourceText.length} max={MAX_SOURCE_TEXT_LENGTH} />
                {validationError && (
                  <span id="source_text_error" className="text-sm text-destructive" role="alert">
                    {validationError}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="translation" className="text-sm font-medium">
                Translacja
              </label>
              <Textarea
                id="translation"
                value={translation}
                onChange={handleTranslationChange}
                disabled={isSubmitting}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting || !!validationError || sourceText.trim().length === 0}>
              {isSubmitting ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
