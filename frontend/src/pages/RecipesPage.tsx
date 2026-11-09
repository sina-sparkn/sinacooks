import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useRecipes } from "../api/recipes.js";
import { useCategories } from "../api/categories.js";
import { useTags } from "../api/tags.js";
import { SearchBar } from "../components/SearchBar.js";
import { FilterPanel, type FilterValues } from "../components/FilterPanel.js";
import { RecipeCard } from "../components/RecipeCard.js";
import { RecipeGrid } from "../components/RecipeGrid.js";
import { Pagination } from "../components/Pagination.js";
import { RecipeCardSkeleton } from "../components/Skeleton.js";
import { ErrorState } from "../components/ErrorState.js";
import { EmptyState } from "../components/EmptyState.js";
import { useLenis } from "../components/useLenis.js";
import { useTranslation } from "../features/i18n/I18nContext.js";

export function RecipesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { scrollTo } = useLenis();
  const { t, tCategory, formatNum } = useTranslation();

  useEffect(() => {
    document.title = t("titles.recipes");
  }, [t]);

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

  const handleApplyFilters = (filters: FilterValues) => {
    updateParams((p) => {
      if (filters.category) {
        p.set("category", filters.category);
      } else {
        p.delete("category");
      }

      if (filters.difficulty) {
        p.set("difficulty", filters.difficulty);
      } else {
        p.delete("difficulty");
      }

      if (filters.maxTime) {
        p.set("maxTime", String(filters.maxTime));
      } else {
        p.delete("maxTime");
      }

      p.delete("tag");
      filters.tags.forEach((t) => p.append("tag", t));

      p.set("page", "1");
    });
  };

  const handleResetFilters = () => {
    updateParams((p) => {
      p.delete("category");
      p.delete("difficulty");
      p.delete("maxTime");
      p.delete("tag");
      p.set("page", "1");
    });
  };

  const handlePageChange = (newPage: number) => {
    updateParams((p) => {
      p.set("page", String(newPage));
    });
    scrollTo(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header Banner */}
      <div className="space-y-3 border-b border-stone-200 pb-8">
        <span className="font-mono text-xs uppercase tracking-widest text-terracotta font-semibold">
          {t("recipes.badge")}
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl text-stone-900 font-normal">
          {t("recipes.title")}
        </h1>
        <p className="font-sans text-stone-600 text-sm sm:text-base max-w-xl leading-relaxed">
          {t("recipes.desc")}
        </p>
      </div>

      {/* Main Grid: Sidebar Filters + Recipe Cards */}
      <div className="grid relative grid-cols-1 lg:grid-cols-4 gap-10 items-start">
        {/* Filter Sidebar - Sticky on desktop below floating header */}
        <div
          data-lenis-prevent
          className="lg:sticky lg:top-24 lg:self-start lg:col-span-1 space-y-6 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto scrollbar-none pe-1"
        >
          <SearchBar
            initialValue={q}
            onSearch={handleSearch}
            placeholder={t("recipes.searchPlaceholder")}
          />
          <FilterPanel
            categories={categories}
            tags={availableTags}
            selectedCategory={category}
            selectedTags={tags}
            selectedDifficulty={difficulty}
            maxTime={maxTime}
            onApply={handleApplyFilters}
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
            <div className="space-y-8">
              <div className="flex items-center justify-between text-xs font-mono text-stone-500">
                <span>
                  {t("recipes.showingRecipes", {
                    from: formatNum((page - 1) * 12 + 1),
                    to: formatNum(Math.min(page * 12, recipesData.meta.total)),
                    total: formatNum(recipesData.meta.total),
                  })}
                </span>
                {category && (
                  <span className="capitalize text-terracotta font-semibold">
                    {t("recipes.categoryFilter", {
                      category: tCategory(category),
                    })}
                  </span>
                )}
              </div>

              {/* Recipe Grid with Flip Layout Transitions */}
              <RecipeGrid id="recipes-catalog-grid">
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
              title={t("recipes.noRecipes")}
              message={t("recipes.noRecipesDesc")}
              actionText={t("recipes.resetAllFilters")}
              actionHref="/recipes"
            />
          )}
        </div>
      </div>
    </div>
  );
}
