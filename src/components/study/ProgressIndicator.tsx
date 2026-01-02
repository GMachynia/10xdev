import type { ProgressIndicatorProps } from "../../types.ts";

/**
 * ProgressIndicator component displays the current progress
 * in a study session (e.g., "3 / 10").
 */
export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  return (
    <div className="text-sm text-muted-foreground">
      {current} / {total}
    </div>
  );
}
