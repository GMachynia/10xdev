import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavigationButtons } from "../NavigationButtons";

describe("NavigationButtons", () => {
  const mockProps = {
    hasPrevious: true,
    hasNext: true,
    onPrevious: vi.fn(),
    onNext: vi.fn(),
  };

  it("should render previous and next buttons", () => {
    render(<NavigationButtons {...mockProps} />);

    expect(screen.getByLabelText("Poprzednia fiszka")).toBeInTheDocument();
    expect(screen.getByLabelText("Następna fiszka")).toBeInTheDocument();
  });

  it("should call onPrevious when previous button is clicked", async () => {
    const user = userEvent.setup();
    render(<NavigationButtons {...mockProps} />);

    await user.click(screen.getByLabelText("Poprzednia fiszka"));

    expect(mockProps.onPrevious).toHaveBeenCalledTimes(1);
  });

  it("should call onNext when next button is clicked", async () => {
    const user = userEvent.setup();
    render(<NavigationButtons {...mockProps} />);

    await user.click(screen.getByLabelText("Następna fiszka"));

    expect(mockProps.onNext).toHaveBeenCalledTimes(1);
  });

  it("should disable previous button when hasPrevious is false", () => {
    render(<NavigationButtons {...mockProps} hasPrevious={false} />);

    const previousButton = screen.getByLabelText("Poprzednia fiszka");
    expect(previousButton).toBeDisabled();
  });

  it("should disable next button when hasNext is false", () => {
    render(<NavigationButtons {...mockProps} hasNext={false} />);

    const nextButton = screen.getByLabelText("Następna fiszka");
    expect(nextButton).toBeDisabled();
  });

  it("should enable previous button when hasPrevious is true", () => {
    render(<NavigationButtons {...mockProps} hasPrevious={true} />);

    const previousButton = screen.getByLabelText("Poprzednia fiszka");
    expect(previousButton).not.toBeDisabled();
  });

  it("should enable next button when hasNext is true", () => {
    render(<NavigationButtons {...mockProps} hasNext={true} />);

    const nextButton = screen.getByLabelText("Następna fiszka");
    expect(nextButton).not.toBeDisabled();
  });

  it("should not call onPrevious when previous button is disabled", async () => {
    const user = userEvent.setup();
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    
    render(<NavigationButtons hasPrevious={false} hasNext={true} onPrevious={onPrevious} onNext={onNext} />);

    const previousButton = screen.getByLabelText("Poprzednia fiszka");
    // Try to click disabled button - userEvent will not trigger handler
    try {
      await user.click(previousButton);
    } catch {
      // Expected - clicking disabled button may throw
    }

    expect(onPrevious).not.toHaveBeenCalled();
  });

  it("should not call onNext when next button is disabled", async () => {
    const user = userEvent.setup();
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    
    render(<NavigationButtons hasPrevious={true} hasNext={false} onPrevious={onPrevious} onNext={onNext} />);

    const nextButton = screen.getByLabelText("Następna fiszka");
    // Try to click disabled button - userEvent will not trigger handler
    try {
      await user.click(nextButton);
    } catch {
      // Expected - clicking disabled button may throw
    }

    expect(onNext).not.toHaveBeenCalled();
  });

  it("should be keyboard accessible", async () => {
    const user = userEvent.setup();
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    
    render(<NavigationButtons hasPrevious={true} hasNext={true} onPrevious={onPrevious} onNext={onNext} />);

    const previousButton = screen.getByLabelText("Poprzednia fiszka");
    const nextButton = screen.getByLabelText("Następna fiszka");

    previousButton.focus();
    await user.keyboard("{Enter}");
    expect(onPrevious).toHaveBeenCalledTimes(1);

    nextButton.focus();
    await user.keyboard("{Enter}");
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});

