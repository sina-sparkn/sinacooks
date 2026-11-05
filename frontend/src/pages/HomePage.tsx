import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useRecipes } from "../api/recipes.js";
import { useCategories } from "../api/categories.js";
import { SearchBar } from "../components/SearchBar.js";
import { RecipeCard } from "../components/RecipeCard.js";
import { RecipeGrid } from "../components/RecipeGrid.js";
import { RecipeCardSkeleton } from "../components/Skeleton.js";
import { ErrorState } from "../components/ErrorState.js";

export function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "TasteCraft | Delicious Curated Recipes";
  }, []);

  const {
    data: featuredData,
    isLoading: isFeaturedLoading,
    isError: isFeaturedError,
    refetch: refetchFeatured,
  } = useRecipes({ featured: true, pageSize: 4 });

  const {
    data: latestData,
    isLoading: isLatestLoading,
    isError: isLatestError,
    refetch: refetchLatest,
  } = useRecipes({ pageSize: 8 });

  const { data: categories = [] } = useCategories();

  const handleSearch = (term: string) => {
    if (term) {
      navigate(`/recipes?q=${encodeURIComponent(term)}`);
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 text-white p-8 sm:p-14 lg:p-16 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-6">
          <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-semibold tracking-wider uppercase">
            Curated Culinary Inspiration
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Cook with joy, scale with ease.
          </h1>
          <p className="text-amber-100/90 text-base sm:text-lg leading-relaxed">
            Discover dependable recipes with precise scaling, step-by-step
            guidance, and wholesome ingredients.
          </p>

          <div className="pt-2">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search recipes (e.g. pancakes, pasta, tacos)..."
            />
          </div>

          {/* Quick Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-amber-200/80 font-medium">
                Popular:
              </span>
              {categories.slice(0, 5).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/categories/${cat.slug}`}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-xs rounded-full backdrop-blur-xs transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Hand-Picked
            </span>
            <h2 className="font-serif text-3xl font-bold text-stone-900 mt-1">
              Featured Recipes
            </h2>
          </div>
          <Link
            to="/recipes?featured=true"
            className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>View all</span>
            <span>→</span>
          </Link>
        </div>

        {isFeaturedLoading ? (
          <RecipeGrid>
            {Array.from({ length: 4 }).map((_, i) => (
              <RecipeCardSkeleton key={i} />
            ))}
          </RecipeGrid>
        ) : isFeaturedError ? (
          <ErrorState onRetry={() => refetchFeatured()} />
        ) : featuredData?.items && featuredData.items.length > 0 ? (
          <RecipeGrid>
            {featuredData.items.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </RecipeGrid>
        ) : null}
      </section>

      {/* Latest Recipes Section */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Fresh from the Kitchen
            </span>
            <h2 className="font-serif text-3xl font-bold text-stone-900 mt-1">
              Latest Creations
            </h2>
          </div>
          <Link
            to="/recipes"
            className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>Explore all</span>
            <span>→</span>
          </Link>
        </div>

        {isLatestLoading ? (
          <RecipeGrid>
            {Array.from({ length: 8 }).map((_, i) => (
              <RecipeCardSkeleton key={i} />
            ))}
          </RecipeGrid>
        ) : isLatestError ? (
          <ErrorState onRetry={() => refetchLatest()} />
        ) : latestData?.items && latestData.items.length > 0 ? (
          <RecipeGrid>
            {latestData.items.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </RecipeGrid>
        ) : null}
      </section>
    </div>
  );
}
