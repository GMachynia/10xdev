import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface StudyModeSelectorProps {
  mode: "browse" | "study";
  onModeChange: (mode: "browse" | "study") => void;
  onStartStudySession: () => void;
  hasFlashcards: boolean;
}

/**
 * StudyModeSelector component allows switching between browse and study modes.
 */
export function StudyModeSelector({ mode, onModeChange, onStartStudySession, hasFlashcards }: StudyModeSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      <Tabs value={mode} onValueChange={(value) => onModeChange(value as "browse" | "study")}>
        <TabsList>
          <TabsTrigger value="browse">Przeglądanie</TabsTrigger>
          <TabsTrigger value="study">Powtórki</TabsTrigger>
        </TabsList>
      </Tabs>
      {mode === "study" && (
        <Button onClick={onStartStudySession} disabled={!hasFlashcards}>
          Rozpocznij sesję powtórek
        </Button>
      )}
    </div>
  );
}
