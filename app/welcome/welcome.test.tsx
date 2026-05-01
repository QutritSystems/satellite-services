import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Welcome } from "./welcome";

describe("Welcome Component", () => {
  it("renders the welcome message", () => {
    render(<Welcome />);
    expect(screen.getByText(/What's next\?/i)).toBeInTheDocument();
  });

  it("renders the resources navigation", () => {
    render(<Welcome />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByText(/React Router Docs/i)).toBeInTheDocument();
    expect(screen.getByText(/Join Discord/i)).toBeInTheDocument();
  });
});
