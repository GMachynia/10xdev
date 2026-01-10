import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FlashcardsCarousel } from "../FlashcardsCarousel";
import type { FlashcardDTO } from "../../../types";

// Mock react-swipeable
vi.mock("react-swipeable", () => ({
  useSwipeable: () => ({}),
}));

describe("FlashcardsCarousel", () => {
  const mockFlashcards: FlashcardDTO[] = [
    { id: "1", source_text: "Hello", translation: "Cześć" },
    { id: "2", source_text: "Goodbye", translation: "Do widzenia" },
    { id: "3", source_text: "Thank you", translation: "Dziękuję" },
  ];

  const mockProps = {
    flashcards: mockFlashcards,
    currentIndex: 0,
    isCardFlipped: false,
    onCardChange: vi.fn(),
    onCardFlip: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    progress: { current: 1, total: 3 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render flashcard carousel", () => {
    render(<FlashcardsCarousel {...mockProps} />);

    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("should render progress indicator", () => {
    render(<FlashcardsCarousel {...mockProps} />);

    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("should not render progress indicator when progress is not provided", () => {
    const { container } = render(
      <FlashcardsCarousel {...mockProps} progress={undefined} />
    );

    expect(screen.queryByText("1 / 3")).not.toBeInTheDocument();
  });

  it("should render navigation buttons", () => {
    render(<FlashcardsCarousel {...mockProps} />);

    expect(screen.getByRole("button", { name: /poprzednia/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /następna/i })).toBeInTheDocument();
  });

  it("should call onCardChange when next button is clicked", () => {
    render(<FlashcardsCarousel {...mockProps} />);

    fireEvent.click(screen.getByRole("button", { name: /następna/i }));

    expect(mockProps.onCardChange).toHaveBeenCalledWith(1);
  });

  it("should call onCardChange when previous button is clicked", () => {
    const props = { ...mockProps, currentIndex: 1 };
    render(<FlashcardsCarousel {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /poprzednia/i }));

    expect(mockProps.onCardChange).toHaveBeenCalledWith(0);
  });

  it("should disable previous button on first flashcard", () => {
    render(<FlashcardsCarousel {...mockProps} currentIndex={0} />);

    const prevButton = screen.getByRole("button", { name: /poprzednia/i });
    expect(prevButton).toBeDisabled();
  });

  it("should disable next button on last flashcard", () => {
    render(<FlashcardsCarousel {...mockProps} currentIndex={2} />);

    const nextButton = screen.getByRole("button", { name: /następna/i });
    expect(nextButton).toBeDisabled();
  });

  it("should handle keyboard navigation with ArrowRight", () => {
    render(<FlashcardsCarousel {...mockProps} />);

    fireEvent.keyDown(window, { key: "ArrowRight" });

    expect(mockProps.onCardChange).toHaveBeenCalledWith(1);
  });

  it("should handle keyboard navigation with ArrowLeft", () => {
    const props = { ...mockProps, currentIndex: 1 };
    render(<FlashcardsCarousel {...props} />);

    fireEvent.keyDown(window, { key: "ArrowLeft" });

    expect(mockProps.onCardChange).toHaveBeenCalledWith(0);
  });

  it("should not navigate left when on first flashcard", () => {
    render(<FlashcardsCarousel {...mockProps} currentIndex={0} />);

    fireEvent.keyDown(window, { key: "ArrowLeft" });

    expect(mockProps.onCardChange).not.toHaveBeenCalled();
  });

  it("should not navigate right when on last flashcard", () => {
    render(<FlashcardsCarousel {...mockProps} currentIndex={2} />);

    fireEvent.keyDown(window, { key: "ArrowRight" });

    expect(mockProps.onCardChange).not.toHaveBeenCalled();
  });

  it("should ignore keyboard events when typing in input", () => {
    const { container } = render(
      <>
        <input type="text" data-testid="test-input" />
        <FlashcardsCarousel {...mockProps} />
      </>
    );

    const input = screen.getByTestId("test-input");
    input.focus();
    fireEvent.keyDown(input, { key: "ArrowRight" });

    expect(mockProps.onCardChange).not.toHaveBeenCalled();
  });

  it("should ignore keyboard events when typing in textarea", () => {
    const { container } = render(
      <>
        <textarea data-testid="test-textarea" />
        <FlashcardsCarousel {...mockProps} />
      </>
    );

    const textarea = screen.getByTestId("test-textarea");
    textarea.focus();
    fireEvent.keyDown(textarea, { key: "ArrowRight" });

    expect(mockProps.onCardChange).not.toHaveBeenCalled();
  });

  it("should render current flashcard", () => {
    render(<FlashcardsCarousel {...mockProps} currentIndex={1} />);

    expect(screen.getByText("Goodbye")).toBeInTheDocument();
  });

  it("should render flipped card when isCardFlipped is true", () => {
    render(<FlashcardsCarousel {...mockProps} isCardFlipped={true} />);

    expect(screen.getByText("Cześć")).toBeInTheDocument();
  });

  it("should call onCardFlip when card is clicked", () => {
    render(<FlashcardsCarousel {...mockProps} />);

    // Click on the card (the div with role="button")
    const flipButton = screen.getByLabelText(/kliknij.*rewers/i);
    fireEvent.click(flipButton);

    expect(mockProps.onCardFlip).toHaveBeenCalled();
  });

  it("should call onEdit when edit button is clicked", () => {
    render(<FlashcardsCarousel {...mockProps} />);

    const editButton = screen.getByRole("button", { name: /edytuj/i });
    fireEvent.click(editButton);

    expect(mockProps.onEdit).toHaveBeenCalledWith(mockFlashcards[0]);
  });

  it("should call onDelete when delete button is clicked", () => {
    render(<FlashcardsCarousel {...mockProps} />);

    const deleteButton = screen.getByRole("button", { name: /usuń/i });
    fireEvent.click(deleteButton);

    expect(mockProps.onDelete).toHaveBeenCalledWith(mockFlashcards[0]);
  });

  it("should return null when flashcards array is empty", () => {
    const { container } = render(
      <FlashcardsCarousel {...mockProps} flashcards={[]} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should clean up keyboard event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<FlashcardsCarousel {...mockProps} />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
  });
});

