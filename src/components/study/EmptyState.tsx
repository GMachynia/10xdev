import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * EmptyState component displayed when user has no flashcards.
 */
export function EmptyState() {
  const handleCreateClick = () => {
    window.location.href = "/create";
  };

  return (
    <Card className="p-8 text-center">
      <CardHeader>
        <CardTitle>Nie masz jeszcze fiszek</CardTitle>
        <CardDescription>Utwórz swoją pierwszą fiszkę, aby rozpocząć naukę</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleCreateClick}>Utwórz fiszkę</Button>
      </CardContent>
    </Card>
  );
}
