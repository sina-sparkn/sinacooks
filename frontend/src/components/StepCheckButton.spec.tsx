import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StepCheckButton } from "./StepCheckButton.js";

describe("StepCheckButton", () => {
  it("renders with 'Mark as done' when incomplete", () => {
    render(
      <StepCheckButton isDone={false} onToggle={vi.fn()} stepNumber={1} />,
    );

    const button = screen.getByRole("checkbox");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-checked", "false");
    expect(button).toHaveAttribute("aria-label", "Mark step 1 as complete");
    expect(screen.getByText("Mark as done")).toBeInTheDocument();
  });

  it("renders with 'Completed' when done", () => {
    render(<StepCheckButton isDone={true} onToggle={vi.fn()} stepNumber={2} />);

    const button = screen.getByRole("checkbox");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-checked", "true");
    expect(button).toHaveAttribute("aria-label", "Mark step 2 as incomplete");
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("calls onToggle when clicked", () => {
    const handleToggle = vi.fn();
    render(
      <StepCheckButton isDone={false} onToggle={handleToggle} stepNumber={3} />,
    );

    const button = screen.getByRole("checkbox");
    fireEvent.click(button);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it("updates animation state when toggled from incomplete to complete", () => {
    const handleToggle = vi.fn();
    const { rerender } = render(
      <StepCheckButton isDone={false} onToggle={handleToggle} stepNumber={1} />,
    );

    expect(screen.getByText("Mark as done")).toBeInTheDocument();

    rerender(
      <StepCheckButton isDone={true} onToggle={handleToggle} stepNumber={1} />,
    );

    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });
});
