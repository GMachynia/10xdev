import { Badge } from "@/components/ui/badge";

interface FlashcardsStatsProps {
  count: number;
}

/**
 * FlashcardsStats component displays the total number of flashcards.
 */
export function FlashcardsStats({ count }: FlashcardsStatsProps) {
  return (
    <div className="flex items-center justify-center mb-6">
      <Badge variant="secondary" className="text-lg px-4 py-2">
        Liczba fiszek: {count}
      </Badge>
    </div>
  );
}
