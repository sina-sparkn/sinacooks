import { useEffect } from "react";
import { useParams, Link } from "react-router";
import { useRecipes } from "../api/recipes.js";
import { useCategories } from "../api/categories.js";
import { RecipeCard } from "../components/RecipeCard.js";
import { RecipeGrid } from "../components/RecipeGrid.js";
import { RecipeCardSkeleton } from "../components/Skeleton.js";
import { ErrorState } from "../components/ErrorState.js";
import { EmptyState } from "../components/EmptyState.js";
import { useTranslation } from "../features/i18n/I18nContext.js";

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories = [] } = useCategories();
  const currentCategory = categories.find((c) => c.slug === slug);
  const { t, tCategory, formatNum } = useTranslation();

  const categoryName = tCategory(slug, currentCategory?.name);

  useEffect(() => {
    if (categoryName) {
      document.title = `${categoryName} | sinacooks Archive`;
    }
  }, [categoryName]);

  const { data, isLoading, isError, refetch } = useRecipes({
    category: slug,
    pageSize: 24,
  });

  return (
    <div className="space-y-10 pb-16">
      {/* Header Banner */}
      <div className="bg-[#171513] text-[#FBF8F3] rounded-[36px] p-8 sm:p-14 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <nav
            aria-label="Breadcrumb"
            className="font-mono text-xs text-white/60 font-medium"
          >
            <Link to="/" className="hover:text-white">
              {t("header.home")}
            </Link>
            <span className="mx-2">/</span>
            <Link to="/recipes" className="hover:text-white">
              {t("header.recipes")}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-terracotta font-semibold capitalize">
              {categoryName}
            </span>
          </nav>
          <span className="font-mono text-xs uppercase tracking-widest text-terracotta font-semibold">
            {t("categoryPage.categoryMonograph")}
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-white font-normal capitalize tracking-tight">
            {t("categoryPage.recipesTitle", { category: categoryName })}
          </h1>
          {currentCategory?.description && (
            <p className="font-sans text-white/70 text-sm sm:text-base leading-relaxed">
              {currentCategory.description}
            </p>
          )}
        </div>

        {/* Decorative backdrop ring */}
        <div className="absolute end-0 top-0 w-96 h-96 rounded-full border border-white/5 pointer-events-none translate-x-20 -translate-y-20" />
      </div>

      {/* Content */}
      {isLoading ? (
        <RecipeGrid>
          {Array.from({ length: 8 }).map((_, idx) => (
            <RecipeCardSkeleton key={idx} />
          ))}
        </RecipeGrid>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : data?.items && data.items.length > 0 ? (
        <div className="space-y-6">
          <p className="font-mono text-xs text-stone-500">
            {t("categoryPage.archivedCount", {
              count: formatNum(data.items.length),
              category: categoryName,
            })}
          </p>
          <RecipeGrid>
            {data.items.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </RecipeGrid>
        </div>
      ) : (
        <EmptyState
          title={t("categoryPage.noCategoryRecipes", {
            category: categoryName,
          })}
          message={t("categoryPage.noCategoryRecipesDesc")}
          actionText={t("categoryPage.exploreAll")}
          actionHref="/recipes"
        />
      )}
    </div>
  );
}
