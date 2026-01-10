import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateFlashcardForm } from "../CreateFlashcardForm";
import * as apiClient from "../../../lib/utils/api-client";

vi.mock("../../../lib/utils/api-client");

describe("CreateFlashcardForm", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    delete (window as any).location;
    window.location = { ...originalLocation, href: "" } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.location = originalLocation;
  });

  it("should render create flashcard form", () => {
    render(<CreateFlashcardForm />);

    expect(screen.getByLabelText("Tekst źródłowy")).toBeInTheDocument();
    expect(screen.getByLabelText("Translacja")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /utwórz fiszkę/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /anuluj/i })).toBeInTheDocument();
  });

  it("should disable submit button when source text is empty", () => {
    render(<CreateFlashcardForm />);

    const submitButton = screen.getByRole("button", { name: /utwórz fiszkę/i });
    expect(submitButton).toBeDisabled();
  });

  it("should enable submit button when source text is entered", async () => {
    const user = userEvent.setup();
    render(<CreateFlashcardForm />);

    await user.type(screen.getByLabelText("Tekst źródłowy"), "Test");

    const submitButton = screen.getByRole("button", { name: /utwórz fiszkę/i });
    expect(submitButton).not.toBeDisabled();
  });

  it("should show validation error for empty source text", async () => {
    const user = userEvent.setup();
    render(<CreateFlashcardForm />);

    const input = screen.getByLabelText("Tekst źródłowy");
    await user.type(input, "Test");
    await user.clear(input);

    expect(screen.getByText("Tekst źródłowy nie może być pusty")).toBeInTheDocument();
  });

  it("should show validation error when source text exceeds max length", async () => {
    const user = userEvent.setup();
    render(<CreateFlashcardForm />);

    const input = screen.getByLabelText("Tekst źródłowy");
    await user.type(input, "a".repeat(201));

    expect(
      screen.getByText("Tekst źródłowy przekracza maksymalną długość 200 znaków")
    ).toBeInTheDocument();
  });

  it("should display character counter", async () => {
    const user = userEvent.setup();
    render(<CreateFlashcardForm />);

    const input = screen.getByLabelText("Tekst źródłowy");
    await user.type(input, "Test");

    expect(screen.getByText("4 / 200")).toBeInTheDocument();
  });

  it("should create flashcard successfully", async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, "createFlashcard").mockResolvedValue({
      data: { data: { id: "1", source_text: "Test", translation: "Testowanie" } },
      error: null,
    });

    render(<CreateFlashcardForm />);

    await user.type(screen.getByLabelText("Tekst źródłowy"), "Test");
    await user.type(screen.getByLabelText("Translacja"), "Testowanie");
    await user.click(screen.getByRole("button", { name: /utwórz fiszkę/i }));

    await waitFor(() => {
      expect(apiClient.createFlashcard).toHaveBeenCalledWith({
        source_text: "Test",
        translation: "Testowanie",
      });
    });

    await waitFor(() => {
      expect(window.location.href).toBe("/study");
    });
  });

  it("should create flashcard without translation", async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, "createFlashcard").mockResolvedValue({
      data: { data: { id: "1", source_text: "Test", translation: null } },
      error: null,
    });

    render(<CreateFlashcardForm />);

    await user.type(screen.getByLabelText("Tekst źródłowy"), "Test");
    await user.click(screen.getByRole("button", { name: /utwórz fiszkę/i }));

    await waitFor(() => {
      expect(apiClient.createFlashcard).toHaveBeenCalledWith({
        source_text: "Test",
        translation: null,
      });
    });
  });

  it("should trim source text before submitting", async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, "createFlashcard").mockResolvedValue({
      data: { data: { id: "1", source_text: "Test", translation: null } },
      error: null,
    });

    render(<CreateFlashcardForm />);

    await user.type(screen.getByLabelText("Tekst źródłowy"), "  Test  ");
    await user.click(screen.getByRole("button", { name: /utwórz fiszkę/i }));

    await waitFor(() => {
      expect(apiClient.createFlashcard).toHaveBeenCalledWith({
        source_text: "Test",
        translation: null,
      });
    });
  });

  it("should display error message on failed creation", async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, "createFlashcard").mockResolvedValue({
      data: null,
      error: {
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to create flashcard",
        },
      },
    });

    render(<CreateFlashcardForm />);

    await user.type(screen.getByLabelText("Tekst źródłowy"), "Test");
    await user.click(screen.getByRole("button", { name: /utwórz fiszkę/i }));

    await waitFor(() => {
      expect(screen.getByText("Failed to create flashcard")).toBeInTheDocument();
    });
  });

  it("should show loading state during submission", async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, "createFlashcard").mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ data: { data: { id: "1", source_text: "Test", translation: null } }, error: null });
          }, 100);
        })
    );

    render(<CreateFlashcardForm />);

    await user.type(screen.getByLabelText("Tekst źródłowy"), "Test");
    await user.click(screen.getByRole("button", { name: /utwórz fiszkę/i }));

    expect(screen.getByText("Tworzenie...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tworzenie/i })).toBeDisabled();

    await waitFor(() => {
      expect(window.location.href).toBe("/study");
    });
  });

  it("should disable inputs during submission", async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, "createFlashcard").mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ data: { data: { id: "1", source_text: "Test", translation: null } }, error: null });
          }, 100);
        })
    );

    render(<CreateFlashcardForm />);

    const sourceTextInput = screen.getByLabelText("Tekst źródłowy");
    const translationInput = screen.getByLabelText("Translacja");

    await user.type(sourceTextInput, "Test");
    await user.click(screen.getByRole("button", { name: /utwórz fiszkę/i }));

    expect(sourceTextInput).toBeDisabled();
    expect(translationInput).toBeDisabled();

    await waitFor(() => {
      expect(window.location.href).toBe("/study");
    });
  });

  it("should navigate to study page on cancel", async () => {
    const user = userEvent.setup();
    render(<CreateFlashcardForm />);

    await user.click(screen.getByRole("button", { name: /anuluj/i }));

    expect(window.location.href).toBe("/study");
  });

  it("should prevent submission when validation error exists", async () => {
    const user = userEvent.setup();
    render(<CreateFlashcardForm />);

    const input = screen.getByLabelText("Tekst źródłowy");
    await user.type(input, "a".repeat(201));

    const submitButton = screen.getByRole("button", { name: /utwórz fiszkę/i });
    expect(submitButton).toBeDisabled();

    await user.click(submitButton);

    expect(apiClient.createFlashcard).not.toHaveBeenCalled();
  });
});

