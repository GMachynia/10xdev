import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "../RegisterForm";

describe("RegisterForm", () => {
  const mockFetch = vi.fn();
  const originalLocation = window.location;

  beforeEach(() => {
    global.fetch = mockFetch;
    delete (window as any).location;
    window.location = { ...originalLocation, href: "" } as any;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    window.location = originalLocation;
  });

  it("should render register form", () => {
    render(<RegisterForm />);

    expect(screen.getByText("Utwórz konto")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Hasło")).toBeInTheDocument();
    expect(screen.getByLabelText("Potwierdź hasło")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zarejestruj się/i })).toBeInTheDocument();
  });

  it("should validate password match", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Hasło"), "password123");
    await user.type(screen.getByLabelText("Potwierdź hasło"), "differentpassword");
    await user.click(screen.getByRole("button", { name: /zarejestruj się/i }));

    await waitFor(() => {
      expect(screen.getByText("Hasła nie są identyczne")).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should validate password length", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Hasło"), "12345");
    await user.type(screen.getByLabelText("Potwierdź hasło"), "12345");
    await user.click(screen.getByRole("button", { name: /zarejestruj się/i }));

    await waitFor(() => {
      expect(screen.getByText("Hasło musi mieć co najmniej 6 znaków")).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should handle successful registration", async () => {
    const user = userEvent.setup({ delay: null });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Registration successful" }),
    });

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Hasło"), "password123");
    await user.type(screen.getByLabelText("Potwierdź hasło"), "password123");
    await user.click(screen.getByRole("button", { name: /zarejestruj się/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "test@example.com", password: "password123" }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Rejestracja zakończona!")).toBeInTheDocument();
      expect(screen.getByText("Twoje konto zostało utworzone. Przekierowujemy...")).toBeInTheDocument();
    });

    // Fast-forward time to trigger redirect
    vi.advanceTimersByTime(1500);

    await waitFor(() => {
      expect(window.location.href).toBe("/study");
    });
  });

  it("should display error message on failed registration", async () => {
    const user = userEvent.setup({ delay: null });
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Email already exists" }),
    });

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Hasło"), "password123");
    await user.type(screen.getByLabelText("Potwierdź hasło"), "password123");
    await user.click(screen.getByRole("button", { name: /zarejestruj się/i }));

    await waitFor(() => {
      expect(screen.getByText("Email already exists")).toBeInTheDocument();
    });
  });

  it("should display loading state during registration", async () => {
    const user = userEvent.setup({ delay: null });
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ message: "Registration successful" }),
            });
          }, 100);
        })
    );

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Hasło"), "password123");
    await user.type(screen.getByLabelText("Potwierdź hasło"), "password123");
    await user.click(screen.getByRole("button", { name: /zarejestruj się/i }));

    expect(screen.getByText("Rejestrowanie...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /rejestrowanie/i })).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText("Rejestracja zakończona!")).toBeInTheDocument();
    });
  });

  it("should disable inputs during loading", async () => {
    const user = userEvent.setup({ delay: null });
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ message: "Registration successful" }),
            });
          }, 100);
        })
    );

    render(<RegisterForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Hasło");
    const confirmPasswordInput = screen.getByLabelText("Potwierdź hasło");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(screen.getByRole("button", { name: /zarejestruj się/i }));

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(confirmPasswordInput).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText("Rejestracja zakończona!")).toBeInTheDocument();
    });
  });

  it("should handle network error", async () => {
    const user = userEvent.setup({ delay: null });
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Hasło"), "password123");
    await user.type(screen.getByLabelText("Potwierdź hasło"), "password123");
    await user.click(screen.getByRole("button", { name: /zarejestruj się/i }));

    await waitFor(() => {
      expect(screen.getByText("An unexpected error occurred")).toBeInTheDocument();
    });
  });

  it("should have link to login", () => {
    render(<RegisterForm />);

    const loginLink = screen.getByText("Zaloguj się");
    expect(loginLink).toHaveAttribute("href", "/auth/login");
  });

  it("should clear error on new submission", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Hasło"), "password123");
    await user.type(screen.getByLabelText("Potwierdź hasło"), "differentpassword");
    await user.click(screen.getByRole("button", { name: /zarejestruj się/i }));

    await waitFor(() => {
      expect(screen.getByText("Hasła nie są identyczne")).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText("Potwierdź hasło"));
    await user.type(screen.getByLabelText("Potwierdź hasło"), "password123");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Registration successful" }),
    });

    await user.click(screen.getByRole("button", { name: /zarejestruj się/i }));

    await waitFor(() => {
      expect(screen.queryByText("Hasła nie są identyczne")).not.toBeInTheDocument();
    });
  });
});

