import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { DeleteFlashcardDialogProps } from "../../types.ts";

/**
 * DeleteFlashcardDialog component provides a confirmation dialog for deleting a flashcard.
 */
export function DeleteFlashcardDialog({ flashcard, onConfirm, onCancel, isOpen }: DeleteFlashcardDialogProps) {
  if (!flashcard) {
    return null;
  }

  const handleConfirm = async () => {
    await onConfirm(flashcard.id);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Czy na pewno chcesz usunąć tę fiszkę?</AlertDialogTitle>
          <AlertDialogDescription>
            Ta operacja jest nieodwracalna. Fiszka zostanie trwale usunięta.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Anuluj</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Usuń
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
