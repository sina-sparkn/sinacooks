import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useRecipes } from "../api/recipes.js";
import { useCategories } from "../api/categories.js";
import { useTags } from "../api/tags.js";
import { SearchBar } from "../components/SearchBar.js";
import { FilterPanel } from "../components/FilterPanel.js";
import { RecipeCard } from "../components/RecipeCard.js";
import { RecipeGrid } from "../components/RecipeGrid.js";
import { Pagination } from "../components/Pagination.js";
import { RecipeCardSkeleton } from "../components/Skeleton.js";
import { ErrorState } from "../components/ErrorState.js";
import { EmptyState } from "../components/EmptyState.js";

export function RecipesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    document.title = "All Recipes | TasteCraft";
  }, []);

  // Parse filters from URL
  const page = parseInt(searchParams.get("page") || "1", 10);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || undefined;
  const tags = useMemo(() => searchParams.getAll("tag"), [searchParams]);
  const difficulty =
    (searchParams.get("difficulty") as "easy" | "medium" | "hard") || undefined;
  const maxTime = searchParams.get("maxTime")
    ? parseInt(searchParams.get("maxTime")!, 10)
    : undefined;
  const featured = searchParams.get("featured") === "true" ? true : undefined;

  const {
    data: recipesData,
    isLoading,
    isError,
    refetch,
  } = useRecipes({
    page,
    pageSize: 12,
    q: q || undefined,
    category,
    tag: tags,
    difficulty,
    maxTime,
    featured,
  });

  const { data: categories = [] } = useCategories();
  const { data: availableTags = [] } = useTags();

  // URL updating helpers
  const updateParams = (updater: (params: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams);
    updater(next);
    setSearchParams(next);
  };

  const handleSearch = (term: string) => {
    updateParams((p) => {
      if (term) p.set("q", term);
      else p.delete("q");
      p.set("page", "1");
    });
  };

  const handleCategoryChange = (cat: string | undefined) => {
    updateParams((p) => {
      if (cat) p.set("category", cat);
      else p.delete("category");
      p.set("page", "1");
    });
  };

  const handleTagToggle = (tagSlug: string) => {
    updateParams((p) => {
      const currentTags = p.getAll("tag");
      p.delete("tag");
      if (currentTags.includes(tagSlug)) {
        currentTags
          .filter((t) => t !== tagSlug)
          .forEach((t) => p.append("tag", t));
      } else {
        [...currentTags, tagSlug].forEach((t) => p.append("tag", t));
      }
      p.set("page", "1");
    });
  };

  const handleDifficultyChange = (
    diff: "easy" | "medium" | "hard" | undefined,
  ) => {
    updateParams((p) => {
      if (diff) p.set("difficulty", diff);
      else p.delete("difficulty");
      p.set("page", "1");
    });
  };

  const handleMaxTimeChange = (time: number | undefined) => {
    updateParams((p) => {
      if (time) p.set("maxTime", String(time));
      else p.delete("maxTime");
      p.set("page", "1");
    });
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage: number) => {
    updateParams((p) => {
      p.set("page", String(newPage));
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          Discover Recipes
        </h1>
        <p className="text-stone-600 text-sm sm:text-base mt-1">
          Explore delicious meals, snacks, and treats tested for culinary
          success.
        </p>
      </div>

      {/* Main Grid: Sidebar Filters + Recipe Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <SearchBar initialValue={q} onSearch={handleSearch} />
          <FilterPanel
            categories={categories}
            tags={availableTags}
            selectedCategory={category}
            selectedTags={tags}
            selectedDifficulty={difficulty}
            maxTime={maxTime}
            onCategoryChange={handleCategoryChange}
            onTagToggle={handleTagToggle}
            onDifficultyChange={handleDifficultyChange}
            onMaxTimeChange={handleMaxTimeChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Recipes Content Area */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <RecipeGrid>
              {Array.from({ length: 9 }).map((_, i) => (
                <RecipeCardSkeleton key={i} />
              ))}
            </RecipeGrid>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : recipesData?.items && recipesData.items.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>
                  Showing {(page - 1) * 12 + 1}–
                  {Math.min(page * 12, recipesData.meta.total)} of{" "}
                  {recipesData.meta.total} recipes
                </span>
              </div>
              <RecipeGrid>
                {recipesData.items.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </RecipeGrid>

              <Pagination
                currentPage={recipesData.meta.page}
                totalPages={recipesData.meta.pageCount}
                onPageChange={handlePageChange}
              />
            </div>
          ) : (
            <EmptyState
              title="No recipes found"
              message="No recipes match the selected filters or search terms. Try clearing some filters."
              actionText="Reset All Filters"
              actionHref="/recipes"
            />
          )}
        </div>
      </div>
    </div>
  );
}
