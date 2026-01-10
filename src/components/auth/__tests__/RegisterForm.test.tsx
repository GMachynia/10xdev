import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RegisterForm } from "../RegisterForm";

describe("RegisterForm", () => {
  const mockFetch = vi.fn();
  const originalLocation = window.location;

  beforeEach(() => {
    global.fetch = mockFetch;
    delete (window as Partial<Window>).location;
    window.location = { ...originalLocation, href: "" } as Location;
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

  it("should have link to login", () => {
    render(<RegisterForm />);

    const loginLink = screen.getByText("Zaloguj się");
    expect(loginLink).toHaveAttribute("href", "/auth/login");
  });
});
