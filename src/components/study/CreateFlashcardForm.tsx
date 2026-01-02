import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CharacterCounter } from "./CharacterCounter";
import { createFlashcard } from "../../lib/utils/api-client";
import type { CreateFlashcardCommand } from "../../types.ts";

const MAX_SOURCE_TEXT_LENGTH = 200;

/**
 * CreateFlashcardForm component provides a form for creating new flashcard data.
 */
export function CreateFlashcardForm() {
  const [sourceText, setSourceText] = useState("");
  const [translation, setTranslation] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const command: CreateFlashcardCommand = {
        source_text: trimmedSourceText,
        translation: translation.trim() || null,
      };

      const { data, error } = await createFlashcard(command);

      if (error) {
        const errorMessage = error.error?.message || "Nie udało się utworzyć fiszki";
        setValidationError(errorMessage);
        setIsSubmitting(false);
        return;
      }

      if (data) {
        // Success - redirect to study page
        window.location.href = "/study";
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Nie udało się utworzyć fiszki";
      setValidationError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          placeholder="Wprowadź tekst źródłowy..."
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
          placeholder="Wprowadź translację (opcjonalnie)..."
        />
      </div>
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => (window.location.href = "/study")}
          disabled={isSubmitting}
        >
          Anuluj
        </Button>
        <Button type="submit" disabled={isSubmitting || !!validationError || sourceText.trim().length === 0}>
          {isSubmitting ? "Tworzenie..." : "Utwórz fiszkę"}
        </Button>
      </div>
    </form>
  );
}
