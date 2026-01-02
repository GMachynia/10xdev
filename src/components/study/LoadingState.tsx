import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * LoadingState component displayed while flashcards are being fetched.
 */
export function LoadingState() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-4 w-full mt-4" />
        <Skeleton className="h-4 w-2/3 mt-2" />
      </CardContent>
    </Card>
  );
}
