import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../LoginForm";

describe("LoginForm", () => {
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

  it("should render login form", () => {
    render(<LoginForm />);

    expect(screen.getByRole("heading", { name: /zaloguj się/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Hasło")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zaloguj się/i })).toBeInTheDocument();
  });

  it("should display validation error for empty form", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /zaloguj się/i });
    await user.click(submitButton);

    // HTML5 validation should prevent submission
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should handle successful login", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Login successful" }),
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Hasło"), "password123");
    await user.click(screen.getByRole("button", { name: /zaloguj się/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "test@example.com", password: "password123" }),
      });
    });

    await waitFor(() => {
      expect(window.location.href).toBe("/study");
    });
  });

  it("should display error message on failed login", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid credentials" }),
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Hasło"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /zaloguj się/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("should display loading state during login", async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ message: "Login successful" }),
            });
          }, 100);
        })
    );

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Hasło"), "password123");
    await user.click(screen.getByRole("button", { name: /zaloguj się/i }));

    expect(screen.getByText("Logowanie...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logowanie/i })).toBeDisabled();

    await waitFor(() => {
      expect(window.location.href).toBe("/study");
    });
  });

  it("should disable inputs during loading", async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ message: "Login successful" }),
            });
          }, 100);
        })
    );

    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Hasło");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(screen.getByRole("button", { name: /zaloguj się/i }));

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();

    await waitFor(() => {
      expect(window.location.href).toBe("/study");
    });
  });

  it("should handle network error", async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Hasło"), "password123");
    await user.click(screen.getByRole("button", { name: /zaloguj się/i }));

    await waitFor(() => {
      expect(screen.getByText("An unexpected error occurred")).toBeInTheDocument();
    });
  });

  it("should have links to register and reset password", () => {
    render(<LoginForm />);

    const registerLink = screen.getByText("Zarejestruj się");
    const resetPasswordLink = screen.getByText("Zapomniałeś hasła?");

    expect(registerLink).toHaveAttribute("href", "/auth/register");
    expect(resetPasswordLink).toHaveAttribute("href", "/auth/reset-password");
  });

  it("should clear error on new submission", async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Invalid credentials" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Login successful" }),
      });

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Hasło"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /zaloguj się/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText("Hasło"));
    await user.type(screen.getByLabelText("Hasło"), "correctpassword");
    await user.click(screen.getByRole("button", { name: /zaloguj się/i }));

    await waitFor(() => {
      expect(screen.queryByText("Invalid credentials")).not.toBeInTheDocument();
    });
  });
});
