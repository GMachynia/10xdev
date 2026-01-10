import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressIndicator } from "../ProgressIndicator";

describe("ProgressIndicator", () => {
  it("should render progress", () => {
    render(<ProgressIndicator current={3} total={10} />);

    expect(screen.getByText("3 / 10")).toBeInTheDocument();
  });

  it("should render at start", () => {
    render(<ProgressIndicator current={1} total={10} />);

    expect(screen.getByText("1 / 10")).toBeInTheDocument();
  });

  it("should render at end", () => {
    render(<ProgressIndicator current={10} total={10} />);

    expect(screen.getByText("10 / 10")).toBeInTheDocument();
  });

  it("should handle single item", () => {
    render(<ProgressIndicator current={1} total={1} />);

    expect(screen.getByText("1 / 1")).toBeInTheDocument();
  });

  it("should handle large numbers", () => {
    render(<ProgressIndicator current={999} total={1000} />);

    expect(screen.getByText("999 / 1000")).toBeInTheDocument();
  });
});

