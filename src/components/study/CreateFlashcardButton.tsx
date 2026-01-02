import { Button } from "@/components/ui/button";

/**
 * CreateFlashcardButton component provides a button to navigate to the create flashcard page.
 */
export function CreateFlashcardButton() {
  const handleClick = () => {
    window.location.href = "/create";
  };

  return (
    <Button onClick={handleClick}>
      Dodaj fiszkę
    </Button>
  );
}

