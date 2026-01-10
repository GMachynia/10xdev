import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteFlashcardDialog } from "../DeleteFlashcardDialog";
import type { FlashcardDTO } from "../../../types";

describe("DeleteFlashcardDialog", () => {
  const mockFlashcard: FlashcardDTO = {
    id: "1",
    source_text: "Hello",
    translation: "Cześć",
  };

  const mockProps = {
    flashcard: mockFlashcard,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    isOpen: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render delete flashcard dialog", () => {
    render(<DeleteFlashcardDialog {...mockProps} />);

    expect(screen.getByText("Czy na pewno chcesz usunąć tę fiszkę?")).toBeInTheDocument();
    expect(screen.getByText("Ta operacja jest nieodwracalna. Fiszka zostanie trwale usunięta.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /usuń/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /anuluj/i })).toBeInTheDocument();
  });

  it("should not render when flashcard is null", () => {
    render(<DeleteFlashcardDialog {...mockProps} flashcard={null} />);

    expect(screen.queryByText("Czy na pewno chcesz usunąć tę fiszkę?")).not.toBeInTheDocument();
  });

  it("should call onConfirm with flashcard id when confirm button is clicked", async () => {
    const user = userEvent.setup();
    mockProps.onConfirm.mockResolvedValue(undefined);

    render(<DeleteFlashcardDialog {...mockProps} />);

    await user.click(screen.getByRole("button", { name: /usuń/i }));

    await waitFor(() => {
      expect(mockProps.onConfirm).toHaveBeenCalledWith("1");
    });
  });

  it("should call onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    
    render(<DeleteFlashcardDialog flashcard={mockFlashcard} onConfirm={onConfirm} onCancel={onCancel} isOpen={true} />);

    const cancelButtons = screen.getAllByRole("button", { name: /anuluj/i });
    await user.click(cancelButtons[0]);

    expect(onCancel).toHaveBeenCalled();
  });

  it("should have destructive styling on delete button", () => {
    render(<DeleteFlashcardDialog {...mockProps} />);

    const deleteButton = screen.getByRole("button", { name: /usuń/i });
    expect(deleteButton.className).toContain("bg-destructive");
  });

  it("should handle async confirm action", async () => {
    const user = userEvent.setup();
    mockProps.onConfirm.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(undefined), 100);
        })
    );

    render(<DeleteFlashcardDialog {...mockProps} />);

    await user.click(screen.getByRole("button", { name: /usuń/i }));

    await waitFor(() => {
      expect(mockProps.onConfirm).toHaveBeenCalledWith("1");
    });
  });

  it("should be keyboard accessible", async () => {
    const user = userEvent.setup();
    mockProps.onConfirm.mockResolvedValue(undefined);

    render(<DeleteFlashcardDialog {...mockProps} />);

    const cancelButton = screen.getByRole("button", { name: /anuluj/i });
    const deleteButton = screen.getByRole("button", { name: /usuń/i });

    cancelButton.focus();
    await user.keyboard("{Tab}");
    expect(deleteButton).toHaveFocus();

    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(mockProps.onConfirm).toHaveBeenCalledWith("1");
    });
  });
});

