import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import type { ErrorDisplayProps } from "../../types.ts";

/**
 * ErrorDisplay component displays API errors with optional retry functionality.
 */
export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  if (!error) {
    return null;
  }

  const errorMessage = error.error?.message || "Wystąpił nieoczekiwany błąd";

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Błąd</AlertTitle>
      <AlertDescription>
        <p className="mb-2">{errorMessage}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Spróbuj ponownie
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
