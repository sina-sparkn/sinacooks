import { Link } from "react-router";
import { Clock, Users } from "lucide-react";
import type { RecipeSummary } from "../api/types.js";
import { FavoriteButton } from "./FavoriteButton.js";
import { useTranslation } from "../features/i18n/I18nContext.js";

interface RecipeCardProps {
  recipe: RecipeSummary;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const { t, tDifficulty, tCategory, formatDuration, formatNum } =
    useTranslation();

  const imageUrl =
    recipe.cover?.formats?.small?.url ||
    recipe.cover?.formats?.medium?.url ||
    recipe.cover?.url ||
    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80";

  const difficultyColors = {
    easy: "bg-sage-light text-sage border-sage/20",
    medium: "bg-butter text-amber-900 border-amber-200/60",
    hard: "bg-terracotta-light text-terracotta border-terracotta/20",
  };

  const difficultyClass =
    recipe.difficulty && difficultyColors[recipe.difficulty]
      ? difficultyColors[recipe.difficulty]
      : "bg-stone-100 text-stone-700 border-stone-200";

  return (
    <article
      data-cursor="recipe"
      className="recipe-card-reveal group relative bg-white rounded-[28px] overflow-hidden border border-stone-200/70 shadow-[0_4px_24px_rgba(23,21,19,0.04)] hover:shadow-[0_16px_40px_rgba(23,21,19,0.1)] transition-all duration-500 flex flex-col h-full hover:-translate-y-1.5"
    >
      {/* Cover Image Container with Clip-path overflow */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100">
        <Link to={`/recipes/${recipe.slug}`} className="block w-full h-full">
          <img
            src={imageUrl}
            alt={recipe.cover?.alt || recipe.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          />
        </Link>

        {/* Favorite Button Overlay */}
        <div className="absolute top-4 end-4 z-10">
          <FavoriteButton recipeId={recipe.id} />
        </div>

        {/* Difficulty Pill */}
        {recipe.difficulty && (
          <span
            className={`absolute bottom-3.5 start-3.5 px-3 py-1 text-[11px] font-mono uppercase tracking-wider font-medium rounded-full border shadow-xs backdrop-blur-md ${difficultyClass}`}
          >
            {tDifficulty(recipe.difficulty)}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div className="space-y-2.5">
          {/* Category Chips */}
          {recipe.categories && recipe.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {recipe.categories.slice(0, 2).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/categories/${cat.slug}`}
                  className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-sand/60 text-stone-800 hover:bg-terracotta hover:text-white transition-colors"
                >
                  {tCategory(cat.slug, cat.name)}
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="font-serif text-2xl text-stone-900 group-hover:text-terracotta transition-colors line-clamp-1 leading-snug">
            <Link to={`/recipes/${recipe.slug}`}>{recipe.title}</Link>
          </h3>

          {/* Description */}
          {recipe.description && (
            <p className="font-sans text-stone-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
              {recipe.description}
            </p>
          )}
        </div>

        {/* Footer Meta Details */}
        <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between text-xs font-mono text-stone-600">
          {recipe.totalTimeMinutes ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sand/40 text-stone-800 group-hover:bg-terracotta/10 group-hover:text-terracotta transition-colors">
              <Clock
                className="w-3.5 h-3.5 text-stone-500 group-hover:text-terracotta transition-colors"
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <span>{formatDuration(recipe.totalTimeMinutes)}</span>
            </span>
          ) : (
            <span />
          )}

          {recipe.servings && (
            <span className="flex items-center gap-1 text-stone-500">
              <Users className="w-3.5 h-3.5" strokeWidth={1.8} />
              <span>
                {formatNum(recipe.servings)} {t("common.servings")}
              </span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
