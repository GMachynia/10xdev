import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetPasswordForm } from "../ResetPasswordForm";

describe("ResetPasswordForm", () => {
  const mockFetch = vi.fn();
  const originalLocation = window.location;

  beforeEach(() => {
    global.fetch = mockFetch;
    delete (window as Partial<Window>).location;
    window.location = { ...originalLocation, href: "" } as Location;
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.location = originalLocation;
  });

  it("should render reset password form", () => {
    render(<ResetPasswordForm />);

    expect(screen.getByText("Resetuj hasło")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /wyślij link resetujący/i })).toBeInTheDocument();
  });

  it("should display validation error for empty form", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    const submitButton = screen.getByRole("button", { name: /wyślij link resetujący/i });
    await user.click(submitButton);

    // HTML5 validation should prevent submission
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should handle successful password reset request", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Reset email sent" }),
    });

    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /wyślij link resetujący/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "test@example.com" }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Email wysłany!")).toBeInTheDocument();
      expect(
        screen.getByText("Jeśli konto z tym adresem email istnieje, wysłaliśmy instrukcje resetowania hasła.")
      ).toBeInTheDocument();
    });
  });

  it("should display error message on failed request", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to send reset email" }),
    });

    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /wyślij link resetujący/i }));

    await waitFor(() => {
      expect(screen.getByText("Failed to send reset email")).toBeInTheDocument();
    });
  });

  it("should display loading state during submission", async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ message: "Reset email sent" }),
            });
          }, 100);
        })
    );

    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /wyślij link resetujący/i }));

    expect(screen.getByText("Wysyłanie...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /wysyłanie/i })).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText("Email wysłany!")).toBeInTheDocument();
    });
  });

  it("should disable input during loading", async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ message: "Reset email sent" }),
            });
          }, 100);
        })
    );

    render(<ResetPasswordForm />);

    const emailInput = screen.getByLabelText("Email");

    await user.type(emailInput, "test@example.com");
    await user.click(screen.getByRole("button", { name: /wyślij link resetujący/i }));

    expect(emailInput).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText("Email wysłany!")).toBeInTheDocument();
    });
  });

  it("should handle network error", async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /wyślij link resetujący/i }));

    await waitFor(() => {
      expect(screen.getByText("An unexpected error occurred")).toBeInTheDocument();
    });
  });

  it("should have link to login", () => {
    render(<ResetPasswordForm />);

    const loginLinks = screen.getAllByText("Powrót do logowania");
    expect(loginLinks[0]).toHaveAttribute("href", "/auth/login");
  });

  it("should show button to return to login after successful submission", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Reset email sent" }),
    });

    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /wyślij link resetujący/i }));

    await waitFor(() => {
      expect(screen.getByText("Email wysłany!")).toBeInTheDocument();
    });

    const returnButton = screen.getByRole("button", { name: /powrót do logowania/i });
    expect(returnButton).toBeInTheDocument();

    await user.click(returnButton);
    expect(window.location.href).toBe("/auth/login");
  });

  it("should clear error on new submission", async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Failed to send reset email" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Reset email sent" }),
      });

    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /wyślij link resetujący/i }));

    await waitFor(() => {
      expect(screen.getByText("Failed to send reset email")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /wyślij link resetujący/i }));

    await waitFor(() => {
      expect(screen.queryByText("Failed to send reset email")).not.toBeInTheDocument();
    });
  });
});
