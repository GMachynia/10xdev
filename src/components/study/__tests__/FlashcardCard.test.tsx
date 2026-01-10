import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlashcardCard } from "../FlashcardCard";
import type { FlashcardDTO } from "../../../types";

describe("FlashcardCard", () => {
  const mockFlashcard: FlashcardDTO = {
    id: "1",
    source_text: "Hello",
    translation: "Cześć",
  };

  const mockProps = {
    flashcard: mockFlashcard,
    isFlipped: false,
    onFlip: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render flashcard with source text", () => {
    render(<FlashcardCard {...mockProps} />);

    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("should show translation when flipped", () => {
    render(<FlashcardCard {...mockProps} isFlipped={true} />);

    expect(screen.getByText("Cześć")).toBeInTheDocument();
  });

  it("should show 'Brak translacji' when translation is null", () => {
    const flashcardWithoutTranslation: FlashcardDTO = {
      id: "1",
      source_text: "Hello",
      translation: null,
    };

    render(<FlashcardCard {...mockProps} flashcard={flashcardWithoutTranslation} isFlipped={true} />);

    expect(screen.getByText("Brak translacji")).toBeInTheDocument();
  });

  it("should call onFlip when card is clicked", async () => {
    const user = userEvent.setup();
    render(<FlashcardCard {...mockProps} />);

    const card = screen.getByRole("button", { name: /kliknij, aby zobaczyć rewers/i });
    await user.click(card);

    expect(mockProps.onFlip).toHaveBeenCalledTimes(1);
  });

  it("should call onFlip when Enter key is pressed", async () => {
    const user = userEvent.setup();
    const onFlip = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    
    render(<FlashcardCard flashcard={mockFlashcard} isFlipped={false} onFlip={onFlip} onEdit={onEdit} onDelete={onDelete} />);

    const card = screen.getByRole("button", { name: /kliknij, aby zobaczyć rewers/i });
    card.focus();
    await user.keyboard("{Enter}");

    expect(onFlip).toHaveBeenCalledTimes(1);
  });

  it("should not call onFlip when edit button is clicked", async () => {
    const user = userEvent.setup();
    const onFlip = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    
    render(<FlashcardCard flashcard={mockFlashcard} isFlipped={false} onFlip={onFlip} onEdit={onEdit} onDelete={onDelete} />);

    const editButton = screen.getByLabelText("Edytuj fiszkę");
    await user.click(editButton);

    expect(onFlip).not.toHaveBeenCalled();
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("should not call onFlip when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onFlip = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    
    render(<FlashcardCard flashcard={mockFlashcard} isFlipped={false} onFlip={onFlip} onEdit={onEdit} onDelete={onDelete} />);

    const deleteButton = screen.getByLabelText("Usuń fiszkę");
    await user.click(deleteButton);

    expect(onFlip).not.toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("should call onEdit when edit button is clicked", async () => {
    const user = userEvent.setup();
    const onFlip = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    
    render(<FlashcardCard flashcard={mockFlashcard} isFlipped={false} onFlip={onFlip} onEdit={onEdit} onDelete={onDelete} />);

    const editButton = screen.getByLabelText("Edytuj fiszkę");
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("should call onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onFlip = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    
    render(<FlashcardCard flashcard={mockFlashcard} isFlipped={false} onFlip={onFlip} onEdit={onEdit} onDelete={onDelete} />);

    const deleteButton = screen.getByLabelText("Usuń fiszkę");
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("should have correct aria-label when not flipped", () => {
    render(<FlashcardCard {...mockProps} isFlipped={false} />);

    const card = screen.getByRole("button", { name: /kliknij, aby zobaczyć rewers/i });
    expect(card).toBeInTheDocument();
  });

  it("should have correct aria-label when flipped", () => {
    render(<FlashcardCard {...mockProps} isFlipped={true} />);

    const card = screen.getByRole("button", { name: /kliknij, aby zobaczyć awers/i });
    expect(card).toBeInTheDocument();
  });

  it("should be keyboard accessible", () => {
    render(<FlashcardCard {...mockProps} />);

    const card = screen.getByRole("button", { name: /kliknij, aby zobaczyć rewers/i });
    expect(card).toHaveAttribute("tabIndex", "0");
  });
});

