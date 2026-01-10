import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StudyModeSelector } from "../StudyModeSelector";

describe("StudyModeSelector", () => {
  const mockProps = {
    mode: "browse" as const,
    onModeChange: vi.fn(),
    onStartStudySession: vi.fn(),
    hasFlashcards: true,
  };

  it("should render mode selector with both tabs", () => {
    render(<StudyModeSelector {...mockProps} />);

    expect(screen.getByText("Przeglądanie")).toBeInTheDocument();
    expect(screen.getByText("Powtórki")).toBeInTheDocument();
  });

  it("should call onModeChange when switching to study mode", async () => {
    const user = userEvent.setup();
    render(<StudyModeSelector {...mockProps} />);

    await user.click(screen.getByText("Powtórki"));

    expect(mockProps.onModeChange).toHaveBeenCalledWith("study");
  });

  it("should call onModeChange when switching to browse mode", async () => {
    const user = userEvent.setup();
    render(<StudyModeSelector {...mockProps} mode="study" />);

    await user.click(screen.getByText("Przeglądanie"));

    expect(mockProps.onModeChange).toHaveBeenCalledWith("browse");
  });

  it("should show start session button in study mode", () => {
    render(<StudyModeSelector {...mockProps} mode="study" />);

    expect(screen.getByRole("button", { name: /rozpocznij sesję powtórek/i })).toBeInTheDocument();
  });

  it("should not show start session button in browse mode", () => {
    render(<StudyModeSelector {...mockProps} mode="browse" />);

    expect(screen.queryByRole("button", { name: /rozpocznij sesję powtórek/i })).not.toBeInTheDocument();
  });

  it("should call onStartStudySession when start button is clicked", async () => {
    const user = userEvent.setup();
    render(<StudyModeSelector {...mockProps} mode="study" />);

    await user.click(screen.getByRole("button", { name: /rozpocznij sesję powtórek/i }));

    expect(mockProps.onStartStudySession).toHaveBeenCalledTimes(1);
  });

  it("should disable start session button when no flashcards", () => {
    render(<StudyModeSelector {...mockProps} mode="study" hasFlashcards={false} />);

    const startButton = screen.getByRole("button", { name: /rozpocznij sesję powtórek/i });
    expect(startButton).toBeDisabled();
  });

  it("should enable start session button when has flashcards", () => {
    render(<StudyModeSelector {...mockProps} mode="study" hasFlashcards={true} />);

    const startButton = screen.getByRole("button", { name: /rozpocznij sesję powtórek/i });
    expect(startButton).not.toBeDisabled();
  });

  it("should not call onStartStudySession when button is disabled", async () => {
    const user = userEvent.setup();
    const onStartStudySession = vi.fn();

    render(
      <StudyModeSelector
        mode="study"
        onModeChange={vi.fn()}
        onStartStudySession={onStartStudySession}
        hasFlashcards={false}
      />
    );

    const startButton = screen.getByRole("button", { name: /rozpocznij sesję powtórek/i });
    // Try to click disabled button - userEvent will not trigger handler
    try {
      await user.click(startButton);
    } catch {
      // Expected - clicking disabled button may throw
    }

    expect(onStartStudySession).not.toHaveBeenCalled();
  });

  it("should be keyboard accessible", async () => {
    const user = userEvent.setup();
    const onStartStudySession = vi.fn();

    render(
      <StudyModeSelector
        mode="study"
        onModeChange={vi.fn()}
        onStartStudySession={onStartStudySession}
        hasFlashcards={true}
      />
    );

    const startButton = screen.getByRole("button", { name: /rozpocznij sesję powtórek/i });
    startButton.focus();
    await user.keyboard("{Enter}");

    expect(onStartStudySession).toHaveBeenCalledTimes(1);
  });

  it("should indicate current mode", () => {
    const { rerender } = render(<StudyModeSelector {...mockProps} mode="browse" />);

    const browseTab = screen.getByText("Przeglądanie").closest("button");
    expect(browseTab).toHaveAttribute("data-state", "active");

    rerender(<StudyModeSelector {...mockProps} mode="study" />);

    const studyTab = screen.getByText("Powtórki").closest("button");
    expect(studyTab).toHaveAttribute("data-state", "active");
  });
});
