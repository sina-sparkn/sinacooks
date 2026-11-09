import { useEffect } from "react";
import { Bookmark } from "lucide-react";
import { useFavorites } from "../api/favorites.js";
import { RecipeCard } from "../components/RecipeCard.js";
import { RecipeGrid } from "../components/RecipeGrid.js";
import { RecipeCardSkeleton } from "../components/Skeleton.js";
import { ErrorState } from "../components/ErrorState.js";
import { EmptyState } from "../components/EmptyState.js";
import { useTranslation } from "../features/i18n/I18nContext.js";

export function FavoritesPage() {
  const { t, formatNum } = useTranslation();

  useEffect(() => {
    document.title = t("titles.favorites");
  }, [t]);

  const { data: recipes = [], isLoading, isError, refetch } = useFavorites();

  return (
    <div className="space-y-10 pb-16">
      <div className="space-y-3 border-b border-stone-200 pb-8">
        <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-terracotta font-semibold">
          <Bookmark className="w-3.5 h-3.5" />
          <span>{t("favorites.tag")}</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl text-stone-900 font-normal">
          {t("favorites.title")}
        </h1>
        <p className="font-sans text-stone-600 text-sm sm:text-base max-w-xl leading-relaxed">
          {t("favorites.desc")}
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
          title={t("favorites.errorTitle")}
          message={t("favorites.errorDesc")}
          onRetry={() => refetch()}
        />
      ) : recipes.length > 0 ? (
        <div className="space-y-6">
          <p className="font-mono text-xs text-stone-500">
            {recipes.length === 1
              ? t("favorites.countSingular")
              : t("favorites.countPlural", {
                  count: formatNum(recipes.length),
                })}
          </p>
          <RecipeGrid>
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </RecipeGrid>
        </div>
      ) : (
        <EmptyState
          title={t("favorites.emptyTitle")}
          message={t("favorites.emptyDesc")}
          actionText={t("favorites.browseRecipes")}
          actionHref="/recipes"
        />
      )}
    </div>
  );
}
