import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, ArrowRight, Printer } from "lucide-react";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import { useRecipe } from "../api/recipes.js";
import { ServingsScaler } from "../components/ServingsScaler.js";
import { IngredientList } from "../components/IngredientList.js";
import { StepList } from "../components/StepList.js";
import { NutritionTable } from "../components/NutritionTable.js";
import { FavoriteButton } from "../components/FavoriteButton.js";
import { RecipeDetailSkeleton } from "../components/Skeleton.js";
import { ErrorState } from "../components/ErrorState.js";
import { CookingModeModal } from "../components/CookingModeModal.js";
import { gsap, prefersReducedMotion } from "../lib/gsap.js";
import { useTranslation } from "../features/i18n/I18nContext.js";

export function RecipeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: recipe, isLoading, isError, refetch } = useRecipe(slug);
  const [userServings, setUserServings] = useState<number | null>(null);
  const [cookingModeOpen, setCookingModeOpen] = useState(false);
  const {
    t,
    tCategory,
    tDifficulty,
    tTag,
    tUnit,
    formatDuration,
    formatNum,
    isRTL,
  } = useTranslation();

  const servings = userServings ?? recipe?.servings ?? 4;

  const heroImageRef = useRef<HTMLImageElement>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const mobileFloatingBarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (recipe) {
      document.title = t("titles.recipeDetail", { title: recipe.title });
    }
  }, [recipe, t]);

  // Entrance motion & Scroll-driven parallax
  useEffect(() => {
    if (prefersReducedMotion() || !recipe) return;

    // Entrance animation on toolbar
    if (toolbarRef.current) {
      gsap.fromTo(
        toolbarRef.current,
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
      );
    }

    // Entrance animation on mobile floating kitchen bar
    if (mobileFloatingBarRef.current) {
      gsap.fromTo(
        mobileFloatingBarRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: "back.out(1.4)" },
      );
    }

    const img = heroImageRef.current;
    const container = heroContainerRef.current;
    if (!img || !container) return;

    const tween = gsap.to(img, {
      yPercent: 12,
      scale: 1.06,
      ease: "none",
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [recipe]);

  if (isLoading) {
    return <RecipeDetailSkeleton />;
  }

  if (isError || !recipe) {
    return (
      <ErrorState
        title={t("recipeDetail.notFoundTitle")}
        message={t("recipeDetail.notFoundDesc")}
        onRetry={() => refetch()}
      />
    );
  }

  const coverUrl =
    recipe.cover?.formats?.large?.url ||
    recipe.cover?.formats?.medium?.url ||
    recipe.cover?.url ||
    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80";

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <>
      <article className="max-w-6xl mx-auto space-y-12 pb-24">
        {/* Navigation Breadcrumb & Action Toolbar */}
        <div ref={toolbarRef} className="border-b border-stone-200/80 pb-4">
          {/* Mobile Toolbar (< sm) */}
          <div className="flex sm:hidden items-center justify-between gap-3 no-print">
            <Link
              to="/recipes"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sand/50 hover:bg-sand text-stone-700 font-mono text-xs transition-colors shrink-0"
            >
              <BackIcon className="w-3.5 h-3.5" />
              <span>{t("recipeDetail.allRecipes")}</span>
            </Link>

            <div className="flex items-center gap-2 shrink-0">
              {recipe.steps && recipe.steps.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCookingModeOpen(true)}
                  className="inline-flex items-center justify-center h-8 px-3.5 rounded-full bg-[#171513] active:bg-black text-[#FBF8F3] font-sans text-xs font-semibold uppercase tracking-wider shadow-xs transition-transform active:scale-95"
                >
                  <span>{t("recipeDetail.cookingMode")}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => window.print()}
                className="w-8 h-8 rounded-full bg-white border border-stone-200 text-stone-600 flex items-center justify-center hover:bg-stone-50 active:scale-95 transition-colors shadow-2xs"
                aria-label={t("recipeDetail.print")}
              >
                <Printer className="w-4 h-4" />
              </button>

              <FavoriteButton
                recipeId={recipe.id}
                className="w-8 h-8 p-0 flex items-center justify-center shadow-2xs"
              />
            </div>
          </div>

          {/* Desktop Toolbar (sm and up) */}
          <div className="hidden sm:flex items-center justify-between gap-4">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 font-mono text-xs text-stone-500 truncate"
            >
              <Link to="/" className="hover:text-terracotta transition-colors">
                {t("header.home")}
              </Link>
              <span className="text-stone-300 select-none">/</span>
              <Link
                to="/recipes"
                className="hover:text-terracotta transition-colors"
              >
                {t("header.recipes")}
              </Link>
              <span className="text-stone-300 select-none">/</span>
              <span className="text-stone-900 font-semibold truncate max-w-sm">
                {recipe.title}
              </span>
            </nav>

            <div className="flex items-center gap-2.5 no-print shrink-0">
              {/* Primary: Cooking Mode Button with Step Count */}
              {recipe.steps && recipe.steps.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCookingModeOpen(true)}
                  className="group inline-flex items-center gap-2.5 h-10 px-5 rounded-full bg-[#171513] hover:bg-terracotta text-[#FBF8F3] font-sans text-xs font-semibold uppercase tracking-wider shadow-xs hover:shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  data-magnetic="true"
                >
                  <span>{t("recipeDetail.cookingMode")}</span>
                  <span className="font-mono text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                    {t("recipeDetail.stepsCount", {
                      count: recipe.steps.length,
                    })}
                  </span>
                </button>
              )}

              {/* Secondary: Print Button */}
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 border border-stone-200/90 font-sans text-xs font-semibold shadow-xs hover:border-stone-300 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                data-magnetic="true"
              >
                <Printer className="w-4 h-4 text-stone-500" />
                <span>{t("recipeDetail.print")}</span>
              </button>

              {/* Tertiary: Favorite Button */}
              <FavoriteButton
                recipeId={recipe.id}
                className="h-10 w-10 p-0 flex items-center justify-center rounded-full bg-white hover:bg-stone-50 border border-stone-200/90 shadow-xs hover:border-stone-300 transition-all hover:scale-105 active:scale-95"
              />
            </div>
          </div>
        </div>

        {/* Recipe Title & Header Meta */}
        <div className="space-y-4 max-w-4xl">
          {recipe.categories && recipe.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/categories/${c.slug}`}
                  className="px-3.5 py-1 bg-sand/60 text-stone-800 border border-stone-300/60 rounded-full font-mono text-[11px] font-semibold uppercase tracking-wider hover:bg-terracotta hover:text-white transition-colors"
                >
                  {tCategory(c.slug, c.name)}
                </Link>
              ))}
            </div>
          )}

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-stone-900 leading-[1.08] sm:leading-[1.06] rtl:leading-[1.25] sm:rtl:leading-[1.2]">
            {recipe.title}
          </h1>

          {recipe.description && (
            <p className="font-sans text-stone-600 text-base sm:text-xl leading-relaxed max-w-3xl">
              {recipe.description}
            </p>
          )}
        </div>

        {/* Full-bleed Hero Cover with Scroll Parallax */}
        <div
          ref={heroContainerRef}
          className="relative aspect-16/9 sm:aspect-21/9 w-full rounded-[36px] overflow-hidden bg-stone-200 shadow-xl border border-stone-200"
        >
          <img
            ref={heroImageRef}
            src={coverUrl}
            alt={recipe.cover?.alt || recipe.title}
            className="w-full h-[120%] object-cover -translate-y-6"
          />
        </div>

        {/* Key Culinary Metrics Pills Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cooking Time Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <span className="font-mono text-[11px] uppercase tracking-widest text-stone-400">
              {t("recipeDetail.totalTime")}
            </span>
            <div className="mt-3">
              <span className="font-serif text-3xl font-normal text-stone-900 block">
                {formatDuration(recipe.totalTimeMinutes || 30)}
              </span>
              <span className="font-mono text-xs text-stone-500 block mt-1">
                {t("recipeDetail.prepTime")}:{" "}
                {formatDuration(recipe.prepTimeMinutes || 0)} •{" "}
                {t("recipeDetail.cookTime")}:{" "}
                {formatDuration(recipe.cookTimeMinutes || 0)}
              </span>
            </div>
          </div>

          {/* Servings Adjuster Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <span className="font-mono text-[11px] uppercase tracking-widest text-stone-400">
              {t("recipeDetail.servingsCount")}
            </span>
            <div className="mt-3">
              <span className="font-serif text-3xl font-normal text-stone-900 block mb-2">
                {formatNum(servings)} {t("common.servings")}
              </span>
              <ServingsScaler
                currentServings={servings}
                baseServings={recipe.servings || 4}
                onChange={setUserServings}
              />
            </div>
          </div>

          {/* Difficulty Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <span className="font-mono text-[11px] uppercase tracking-widest text-stone-400">
              {t("recipeDetail.difficulty")}
            </span>
            <div className="mt-3">
              <span className="font-serif text-3xl font-normal capitalize text-stone-900 block">
                {tDifficulty(recipe.difficulty)}
              </span>
              <span className="font-mono text-xs text-stone-500 block mt-1">
                {t("recipeDetail.baseServings", {
                  servings: formatNum(recipe.servings || 4),
                })}
              </span>
            </div>
          </div>

          {/* Nutrition Quick Insight Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <span className="font-mono text-[11px] uppercase tracking-widest text-stone-400">
              {t("recipeDetail.calories")}
            </span>
            <div className="mt-3">
              <span className="font-serif text-3xl font-normal text-stone-900 block">
                {recipe.nutrition?.calories
                  ? `${formatNum(Math.round(recipe.nutrition.calories))} ${tUnit("kcal")}`
                  : t("common.any")}
              </span>
              <span className="font-mono text-xs text-stone-500 block mt-1">
                {t("recipeDetail.baseServings", {
                  servings: formatNum(1),
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Two-Column Layout: Sticky Ingredients Beside Scrolling Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-6">
          {/* Sticky Left Rail: Ingredients Panel */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start space-y-6 bg-white rounded-[32px] p-6 sm:p-8 border border-stone-200/80 shadow-[0_4px_24px_rgba(23,21,19,0.03)]">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-terracotta font-semibold">
                  {t("recipeDetail.miseEnPlace")}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 mt-0.5">
                  {t("recipeDetail.ingredientsHeading")}
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs text-stone-500">
                  {t("recipeDetail.ingredientsSub", {
                    servings: formatNum(servings),
                  })}
                </span>
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
            </div>
          </div>

          {/* Right Rail: Method Instructions, Nutrition, Chef's Notes */}
          <div className="lg:col-span-8 space-y-12">
            {/* Steps Instructions */}
            <section className="space-y-6">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-terracotta font-semibold">
                  {t("recipeDetail.instructionsHeading")}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 mt-1">
                  {t("recipeDetail.instructionsHeading")}
                </h2>
                <p className="font-sans text-xs sm:text-sm text-stone-500 mt-1">
                  {t("recipeDetail.instructionsSub")}
                </p>
              </div>

              <StepList steps={recipe.steps || []} />
            </section>

            {/* Nutrition Table */}
            {recipe.nutrition && (
              <section className="space-y-4 pt-8 border-t border-stone-200">
                <h2 className="font-serif text-2xl font-normal text-stone-900">
                  {t("recipeDetail.nutritionHeading")}
                </h2>
                <NutritionTable nutrition={recipe.nutrition} />
              </section>
            )}

            {/* Chef's Notes & Editorial Rich Text */}
            {recipe.notes && (
              <section className="space-y-4 pt-8 border-t border-stone-200">
                <span className="font-mono text-xs uppercase tracking-widest text-terracotta font-semibold">
                  {t("recipeDetail.chefNotes")}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
                  {t("recipeDetail.chefNotes")}
                </h2>
                <div className="prose prose-stone max-w-none bg-sand/30 p-8 rounded-3xl border border-stone-200/80 text-stone-800 leading-relaxed font-sans">
                  <BlocksRenderer content={recipe.notes as any} />
                </div>
              </section>
            )}

            {/* Tags & Source Attribution */}
            <div className="pt-8 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-stone-500">
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="uppercase tracking-widest text-stone-400 font-semibold">
                    {t("recipeDetail.dietsTags")}:
                  </span>
                  {recipe.tags.map((tg) => (
                    <Link
                      key={tg.id}
                      to={`/recipes?tag=${tg.slug}`}
                      className="px-3 py-1 bg-sand/60 hover:bg-terracotta hover:text-white text-stone-700 rounded-full transition-colors"
                    >
                      #{tTag(tg.slug, tg.name)}
                    </Link>
                  ))}
                </div>
              )}

              {recipe.sourceUrl && (
                <div>
                  Archived from:{" "}
                  <a
                    href={recipe.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-terracotta underline hover:text-terracotta-dark"
                  >
                    Original Monograph
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Floating Kitchen Bar on Mobile */}
      {recipe.steps && recipe.steps.length > 0 && (
        <aside
          ref={mobileFloatingBarRef}
          aria-label="Quick cooking action"
          className="sm:hidden fixed bottom-5 left-4 right-4 z-40 bg-[#171513]/95 backdrop-blur-xl text-white px-4 py-3 rounded-full shadow-[0_16px_36px_rgba(23,21,19,0.35)] border border-white/10 flex items-center justify-between no-print"
        >
          <div className="truncate pe-3">
            <span className="block font-serif text-sm font-medium text-white truncate leading-tight">
              {recipe.title}
            </span>
            <span className="block font-mono text-[10px] text-white/50 mt-0.5">
              {recipe.totalTimeMinutes
                ? formatDuration(recipe.totalTimeMinutes)
                : t("common.any")}{" "}
              • {t("recipeDetail.stepsCount", { count: recipe.steps.length })}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setCookingModeOpen(true)}
            className="bg-terracotta hover:bg-terracotta-dark text-white font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full shrink-0 flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span>{t("recipeDetail.cookingMode")}</span>
          </button>
        </aside>
      )}

      {/* Fullscreen Interactive Cooking Mode Modal */}
      <CookingModeModal
        recipeTitle={recipe.title}
        steps={recipe.steps || []}
        isOpen={cookingModeOpen}
        onClose={() => setCookingModeOpen(false)}
      />
    </>
  );
}
