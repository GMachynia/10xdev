import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CharacterCounter } from "../CharacterCounter";

describe("CharacterCounter", () => {
  it("should render character count", () => {
    render(<CharacterCounter current={10} max={100} />);

    expect(screen.getByText("10 / 100")).toBeInTheDocument();
  });

  it("should show default color when under limit", () => {
    const { container } = render(<CharacterCounter current={50} max={100} />);

    const counterElement = container.querySelector(".text-muted-foreground");
    expect(counterElement).toBeInTheDocument();
  });

  it("should show destructive color when over limit", () => {
    const { container } = render(<CharacterCounter current={101} max={100} />);

    const counterElement = container.querySelector(".text-destructive");
    expect(counterElement).toBeInTheDocument();
  });

  it("should show default color when at limit", () => {
    const { container } = render(<CharacterCounter current={100} max={100} />);

    const counterElement = container.querySelector(".text-muted-foreground");
    expect(counterElement).toBeInTheDocument();
  });

  it("should render zero count", () => {
    render(<CharacterCounter current={0} max={100} />);

    expect(screen.getByText("0 / 100")).toBeInTheDocument();
  });

  it("should handle large numbers", () => {
    render(<CharacterCounter current={9999} max={10000} />);

    expect(screen.getByText("9999 / 10000")).toBeInTheDocument();
  });
});

