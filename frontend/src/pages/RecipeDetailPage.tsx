import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import { useRecipe } from "../api/recipes.js";
import { ServingsScaler } from "../components/ServingsScaler.js";
import { IngredientList } from "../components/IngredientList.js";
import { StepList } from "../components/StepList.js";
import { NutritionTable } from "../components/NutritionTable.js";
import { FavoriteButton } from "../components/FavoriteButton.js";
import { RecipeDetailSkeleton } from "../components/Skeleton.js";
import { ErrorState } from "../components/ErrorState.js";
import { formatDifficulty, formatTime } from "../lib/formatters.js";

export function RecipeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: recipe, isLoading, isError, refetch } = useRecipe(slug);
  const [userServings, setUserServings] = useState<number | null>(null);
  const servings = userServings ?? recipe?.servings ?? 4;

  useEffect(() => {
    if (recipe) {
      document.title = `${recipe.title} | TasteCraft`;
    }
  }, [recipe]);

  if (isLoading) {
    return <RecipeDetailSkeleton />;
  }

  if (isError || !recipe) {
    return (
      <ErrorState
        title="Recipe not found"
        message="The recipe you are looking for may have been removed or does not exist."
        onRetry={() => refetch()}
      />
    );
  }

  const coverUrl =
    recipe.cover?.formats?.large?.url ||
    recipe.cover?.formats?.medium?.url ||
    recipe.cover?.url ||
    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80";

  return (
    <article className="max-w-4xl mx-auto space-y-10">
      {/* Breadcrumb & Tags */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-stone-500 font-medium"
        >
          <Link to="/" className="hover:text-amber-600">
            Home
          </Link>
          <span>/</span>
          <Link to="/recipes" className="hover:text-amber-600">
            Recipes
          </Link>
          <span>/</span>
          <span className="text-stone-800 truncate max-w-xs">
            {recipe.title}
          </span>
        </nav>

        <div className="flex items-center gap-2 no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>🖨️</span>
            <span>Print</span>
          </button>
          <FavoriteButton recipeId={recipe.id} />
        </div>
      </div>

      {/* Header Info */}
      <div className="space-y-4">
        {recipe.categories && recipe.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recipe.categories.map((c) => (
              <Link
                key={c.id}
                to={`/categories/${c.slug}`}
                className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-amber-100 transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        <h1 className="font-serif text-3xl sm:text-5xl font-black text-stone-900 leading-tight">
          {recipe.title}
        </h1>

        {recipe.description && (
          <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
            {recipe.description}
          </p>
        )}
      </div>

      {/* Cover Image */}
      <div className="relative aspect-16/9 w-full rounded-3xl overflow-hidden bg-stone-100 shadow-md">
        <img
          src={coverUrl}
          alt={recipe.cover?.alt || recipe.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs text-center">
        <div>
          <span className="block text-xs uppercase font-bold text-stone-400">
            Prep Time
          </span>
          <span className="block text-lg font-bold text-stone-900 mt-1">
            {formatTime(recipe.prepTimeMinutes)}
          </span>
        </div>
        <div>
          <span className="block text-xs uppercase font-bold text-stone-400">
            Cook Time
          </span>
          <span className="block text-lg font-bold text-stone-900 mt-1">
            {formatTime(recipe.cookTimeMinutes)}
          </span>
        </div>
        <div>
          <span className="block text-xs uppercase font-bold text-stone-400">
            Total Time
          </span>
          <span className="block text-lg font-bold text-stone-900 mt-1">
            {formatTime(recipe.totalTimeMinutes)}
          </span>
        </div>
        <div>
          <span className="block text-xs uppercase font-bold text-stone-400">
            Difficulty
          </span>
          <span className="block text-lg font-bold text-stone-900 mt-1 capitalize">
            {formatDifficulty(recipe.difficulty)}
          </span>
        </div>
      </div>

      {/* Ingredients & Scaler */}
      <section className="space-y-6 pt-4 border-t border-stone-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Ingredients
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Adjust the servings to automatically scale ingredient
              measurements.
            </p>
          </div>
          <ServingsScaler
            currentServings={servings}
            baseServings={recipe.servings}
            onChange={setUserServings}
          />
        </div>

        <IngredientList
          ingredients={recipe.ingredients || []}
          baseServings={recipe.servings}
          currentServings={servings}
        />
      </section>

      {/* Steps Instructions */}
      <section className="space-y-6 pt-4 border-t border-stone-200">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Instructions
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Follow each step in order for perfect results.
          </p>
        </div>

        <StepList steps={recipe.steps || []} />
      </section>

      {/* Nutrition Section */}
      {recipe.nutrition && (
        <section className="space-y-4 pt-4 border-t border-stone-200">
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Nutrition Information
          </h2>
          <NutritionTable nutrition={recipe.nutrition} />
        </section>
      )}

      {/* Recipe Notes / Rich Text */}
      {recipe.notes && (
        <section className="space-y-4 pt-4 border-t border-stone-200">
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Chef's Notes & Tips
          </h2>
          <div className="prose prose-stone max-w-none bg-amber-50/50 p-6 rounded-2xl border border-amber-200/50 text-stone-800 leading-relaxed">
            <BlocksRenderer content={recipe.notes as any} />
          </div>
        </section>
      )}

      {/* Tags & Source Attribution */}
      <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-stone-400 font-semibold uppercase">
              Tags:
            </span>
            {recipe.tags.map((t) => (
              <Link
                key={t.id}
                to={`/recipes?tag=${t.slug}`}
                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition-colors"
              >
                #{t.name}
              </Link>
            ))}
          </div>
        )}

        {recipe.sourceUrl && (
          <div className="text-xs text-stone-500">
            Recipe source:{" "}
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-700 underline hover:text-amber-800"
            >
              Original Publisher
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
