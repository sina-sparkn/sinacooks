import { useEffect } from "react";
import { useFavorites } from "../api/favorites.js";
import { RecipeCard } from "../components/RecipeCard.js";
import { RecipeGrid } from "../components/RecipeGrid.js";
import { RecipeCardSkeleton } from "../components/Skeleton.js";
import { ErrorState } from "../components/ErrorState.js";
import { EmptyState } from "../components/EmptyState.js";

export function FavoritesPage() {
  useEffect(() => {
    document.title = "Saved Favorites | TasteCraft";
  }, []);

  const { data: recipes = [], isLoading, isError, refetch } = useFavorites();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          My Saved Recipes
        </h1>
        <p className="text-stone-600 text-sm sm:text-base mt-1">
          Your personal cookbook of favorited culinary creations.
        </p>
      </div>

      {isLoading ? (
        <RecipeGrid>
          {Array.from({ length: 4 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </RecipeGrid>
      ) : isError ? (
        <ErrorState
          title="Could not load favorites"
          message="Failed to load your favorite recipes. Please try again."
          onRetry={() => refetch()}
        />
      ) : recipes.length > 0 ? (
        <RecipeGrid>
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </RecipeGrid>
      ) : (
        <EmptyState
          title="No favorites saved yet"
          message="Tap the heart icon on any recipe card to save it here for quick access while cooking."
          actionText="Browse recipes"
          actionHref="/recipes"
        />
      )}
    </div>
  );
}
