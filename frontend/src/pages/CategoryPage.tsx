import { useEffect } from "react";
import { useParams, Link } from "react-router";
import { useRecipes } from "../api/recipes.js";
import { useCategories } from "../api/categories.js";
import { RecipeCard } from "../components/RecipeCard.js";
import { RecipeGrid } from "../components/RecipeGrid.js";
import { RecipeCardSkeleton } from "../components/Skeleton.js";
import { ErrorState } from "../components/ErrorState.js";
import { EmptyState } from "../components/EmptyState.js";

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories = [] } = useCategories();
  const currentCategory = categories.find((c) => c.slug === slug);

  useEffect(() => {
    if (currentCategory) {
      document.title = `${currentCategory.name} Recipes | TasteCraft`;
    }
  }, [currentCategory]);

  const { data, isLoading, isError, refetch } = useRecipes({
    category: slug,
    pageSize: 24,
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white rounded-3xl p-8 sm:p-12 shadow-sm">
        <div className="max-w-xl space-y-3">
          <nav
            aria-label="Breadcrumb"
            className="text-xs text-amber-200/80 font-medium"
          >
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link to="/recipes" className="hover:text-white">
              Recipes
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white font-semibold capitalize">{slug}</span>
          </nav>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold capitalize">
            {currentCategory?.name || slug} Recipes
          </h1>
          {currentCategory?.description && (
            <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
              {currentCategory.description}
            </p>
          )}
        </div>
      </div>

      {/* Recipes */}
      {isLoading ? (
        <RecipeGrid>
          {Array.from({ length: 6 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </RecipeGrid>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : data?.items && data.items.length > 0 ? (
        <RecipeGrid>
          {data.items.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </RecipeGrid>
      ) : (
        <EmptyState
          title={`No ${slug} recipes found`}
          message="We have not added recipes in this category yet. Check back soon!"
          actionText="Explore other recipes"
          actionHref="/recipes"
        />
      )}
    </div>
  );
}
