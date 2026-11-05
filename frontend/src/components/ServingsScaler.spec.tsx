import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ServingsScaler } from "./ServingsScaler.js";

describe("ServingsScaler", () => {
  it("renders current servings count", () => {
    render(
      <ServingsScaler
        currentServings={4}
        baseServings={4}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("increments servings on plus click", () => {
    const handleChange = vi.fn();
    render(
      <ServingsScaler
        currentServings={4}
        baseServings={4}
        onChange={handleChange}
      />,
    );
    const plusBtn = screen.getByLabelText("Increase servings");
    fireEvent.click(plusBtn);
    expect(handleChange).toHaveBeenCalledWith(5);
  });

  it("decrements servings on minus click", () => {
    const handleChange = vi.fn();
    render(
      <ServingsScaler
        currentServings={4}
        baseServings={4}
        onChange={handleChange}
      />,
    );
    const minusBtn = screen.getByLabelText("Decrease servings");
    fireEvent.click(minusBtn);
    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it("shows and handles reset when scaled", () => {
    const handleChange = vi.fn();
    render(
      <ServingsScaler
        currentServings={6}
        baseServings={4}
        onChange={handleChange}
      />,
    );
    const resetBtn = screen.getByText("Reset (4)");
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);
    expect(handleChange).toHaveBeenCalledWith(4);
  });
});
