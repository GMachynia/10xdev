import type { CharacterCounterProps } from "../../types.ts";

/**
 * CharacterCounter component displays the current character count
 * and maximum allowed characters with color coding.
 */
export function CharacterCounter({ current, max }: CharacterCounterProps) {
  const isOverLimit = current > max;
  const textColor = isOverLimit ? "text-destructive" : "text-muted-foreground";

  return (
    <div className={`text-sm ${textColor}`}>
      {current} / {max}
    </div>
  );
}
