import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterPanel } from "./FilterPanel.js";
import type { Category, Tag } from "../api/types.js";

const mockCategories: Category[] = [
  { id: 1, documentId: "cat1", name: "Breakfast", slug: "breakfast" },
  { id: 2, documentId: "cat2", name: "Dinner", slug: "dinner" },
];

const mockTags: Tag[] = [
  { id: 1, documentId: "tag1", name: "vegan", slug: "vegan" },
  { id: 2, documentId: "tag2", name: "quick", slug: "quick" },
];

describe("FilterPanel", () => {
  it("renders categories, difficulties, and tags", () => {
    render(
      <FilterPanel
        categories={mockCategories}
        tags={mockTags}
        onApply={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByText("Refine Archive")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Breakfast" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dinner" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /easy/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /#vegan/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Set Filters/i }),
    ).toBeInTheDocument();
  });

  it("does not trigger onApply immediately when toggling filters", () => {
    const handleApply = vi.fn();
    render(
      <FilterPanel
        categories={mockCategories}
        tags={mockTags}
        onApply={handleApply}
        onReset={vi.fn()}
      />,
    );

    const dinnerBtn = screen.getByRole("button", { name: "Dinner" });
    fireEvent.click(dinnerBtn);

    const easyBtn = screen.getByRole("button", { name: /easy/i });
    fireEvent.click(easyBtn);

    const tagBtn = screen.getByRole("button", { name: /#vegan/i });
    fireEvent.click(tagBtn);

    // Filter changes should be in draft state and NOT have triggered onApply
    expect(handleApply).not.toHaveBeenCalled();

    // Pending indicator should be visible
    expect(
      screen.getByText(/Unapplied changes — click Set Filters/i),
    ).toBeInTheDocument();
  });

  it("calls onApply with the selected draft filters only when Set Filters is clicked", () => {
    const handleApply = vi.fn();
    render(
      <FilterPanel
        categories={mockCategories}
        tags={mockTags}
        onApply={handleApply}
        onReset={vi.fn()}
      />,
    );

    // Select Dinner, medium difficulty, and #vegan
    fireEvent.click(screen.getByRole("button", { name: "Dinner" }));
    fireEvent.click(screen.getByRole("button", { name: /medium/i }));
    fireEvent.click(screen.getByRole("button", { name: /#vegan/i }));

    // Click Set Filters
    const setFiltersBtn = screen.getByRole("button", { name: /Set Filters/i });
    fireEvent.click(setFiltersBtn);

    expect(handleApply).toHaveBeenCalledTimes(1);
    expect(handleApply).toHaveBeenCalledWith({
      category: "dinner",
      difficulty: "medium",
      maxTime: undefined,
      tags: ["vegan"],
    });
  });

  it("clears all draft filters and calls onReset when Clear All is clicked", () => {
    const handleReset = vi.fn();
    render(
      <FilterPanel
        categories={mockCategories}
        tags={mockTags}
        selectedCategory="breakfast"
        onApply={vi.fn()}
        onReset={handleReset}
      />,
    );

    const clearBtn = screen.getByRole("button", { name: /Clear All/i });
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);

    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
