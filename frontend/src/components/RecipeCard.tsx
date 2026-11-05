import { Link } from "react-router";
import type { RecipeSummary } from "../api/types.js";
import { FavoriteButton } from "./FavoriteButton.js";
import { formatDifficulty, formatTime } from "../lib/formatters.js";

interface RecipeCardProps {
  recipe: RecipeSummary;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const imageUrl =
    recipe.cover?.formats?.small?.url ||
    recipe.cover?.formats?.medium?.url ||
    recipe.cover?.url ||
    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80";

  const difficultyColors = {
    easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    hard: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const difficultyClass =
    recipe.difficulty && difficultyColors[recipe.difficulty]
      ? difficultyColors[recipe.difficulty]
      : "bg-stone-100 text-stone-700 border-stone-200";

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Cover Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100">
        <Link to={`/recipes/${recipe.slug}`} className="block w-full h-full">
          <img
            src={imageUrl}
            alt={recipe.cover?.alt || recipe.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton recipeId={recipe.id} />
        </div>
        {recipe.difficulty && (
          <span
            className={`absolute bottom-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-xs backdrop-blur-md ${difficultyClass}`}
          >
            {formatDifficulty(recipe.difficulty)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Categories */}
        {recipe.categories && recipe.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {recipe.categories.slice(0, 2).map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="text-xs font-medium text-amber-700 hover:text-amber-800 uppercase tracking-wider"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        <h3 className="font-serif font-bold text-xl text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-1 mb-2">
          <Link to={`/recipes/${recipe.slug}`}>{recipe.title}</Link>
        </h3>

        {recipe.description && (
          <p className="text-stone-600 text-sm line-clamp-2 mb-4 leading-relaxed flex-1">
            {recipe.description}
          </p>
        )}

        {/* Footer info: Total time & Servings */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-medium">
          <div className="flex items-center gap-1">
            <span>⏱️</span>
            <span>{formatTime(recipe.totalTimeMinutes)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>👥</span>
            <span>{recipe.servings} servings</span>
          </div>
        </div>
      </div>
    </div>
  );
}
