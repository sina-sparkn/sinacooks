import { useEffect, useRef } from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useRecipes } from "../api/recipes.js";
import { useCategories } from "../api/categories.js";
import { SearchBar } from "../components/SearchBar.js";
import { RecipeCard } from "../components/RecipeCard.js";
import { RecipeGrid } from "../components/RecipeGrid.js";
import { RecipeCardSkeleton } from "../components/Skeleton.js";
import { ErrorState } from "../components/ErrorState.js";
import { HorizontalCollection } from "../components/HorizontalCollection.js";
import { gsap, prefersReducedMotion } from "../lib/gsap.js";
import { useTranslation } from "../features/i18n/I18nContext.js";

export function HomePage() {
  const navigate = useNavigate();
  const { preloaderDone } =
    useOutletContext<{ preloaderDone?: boolean }>() || {};
  const { t, tCategory, formatNum, isRTL } = useTranslation();

  const heroHeadlineRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const heroImageContainerRef = useRef<HTMLDivElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);

  const ArrowForward = isRTL ? ArrowLeft : ArrowRight;

  useEffect(() => {
    document.title = t("titles.home");
  }, [t]);

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

  // Hero entrance animation (triggers only after preloader completes or immediately if already loaded)
  useEffect(() => {
    if (prefersReducedMotion()) return;

    // Wait until preloader is done
    const hasSeenIntro = sessionStorage.getItem("sinacooks_intro_seen");
    if (!preloaderDone && !hasSeenIntro) return;

    const headline = heroHeadlineRef.current;
    const subtitle = heroSubtitleRef.current;
    const cta = heroCtaRef.current;
    const imgContainer = heroImageContainerRef.current;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Animate split lines of the headline
      if (headline) {
        const lines = headline.querySelectorAll(".hero-line-inner");
        tl.fromTo(
          lines,
          { yPercent: 125, opacity: 0, rotateZ: isRTL ? -1.5 : 2 },
          {
            yPercent: 0,
            opacity: 1,
            rotateZ: 0,
            stagger: 0.12,
            duration: 1.1,
            onComplete: () => {
              headline
                .querySelectorAll<HTMLElement>(".hero-line-wrapper")
                .forEach((el) => {
                  el.style.overflow = "visible";
                });
            },
          },
        );
      }

      if (subtitle) {
        tl.fromTo(
          subtitle,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.6",
        );
      }

      if (cta) {
        tl.fromTo(
          cta,
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.6",
        );
      }

      // Parallax scroll on featured hero image
      if (imgContainer) {
        gsap.to(imgContainer.querySelector("img"), {
          yPercent: 18,
          ease: "none",
          scrollTrigger: {
            trigger: imgContainer,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    });

    return () => ctx.revert();
  }, [preloaderDone, isRTL]);

  // Infinite marquee ribbon ticker
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const track = marqueeTrackRef.current;
    if (!track) return;

    const tween = gsap.to(track, {
      xPercent: isRTL ? 50 : -50,
      repeat: -1,
      duration: 28,
      ease: "none",
    });

    return () => {
      tween.kill();
    };
  }, [isRTL]);

  const handleSearch = (term: string) => {
    if (term) {
      navigate(`/recipes?q=${encodeURIComponent(term)}`);
    }
  };

  const marqueeItems = isRTL
    ? [
        "آتلیه پاستای دست‌ساز",
        "سوپ‌ها و آب‌گوشت‌های طلایی",
        "نان‌های خمیرترش و کروسان‌های فرانسوی",
        "سالادهای ارگانیک و سبزیجات فصلی",
        "تکنیک‌های اصیل قنادی فرانسوی",
        "ادویه‌های دودی و روغن‌های فشرده سرد",
        "اصول تغذیه و سلامت خانواده",
      ]
    : [
        "Handmade Pasta Atelier",
        "Slow-Simmered Broths",
        "Artisan Sourdough & Crusts",
        "Seasonal Mediterranean Greens",
        "French Patisserie Classics",
        "Smoked Spices & Herb Emulsions",
        "Cold-Pressed Pantry Essentials",
      ];

  return (
    <div className="space-y-24 pb-20 overflow-x-clip w-full max-w-full">
      {/* =====================================================================
          1. EDITORIAL HERO SECTION
          ===================================================================== */}
      <section className="relative pt-2 sm:pt-4 pb-8 overflow-hidden sm:overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, Monograph Note & CTAs */}
          <div className="lg:col-span-7 space-y-8">
            {/* Volume Edition Tag */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-sand/60 border border-stone-200 text-stone-800 text-xs font-mono tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-terracotta" />
              <span>{t("home.edition")}</span>
            </div>

            {/* Large Split Editorial Headline */}
            <h1
              ref={heroHeadlineRef}
              className="font-serif text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-stone-900 leading-[1.08] sm:leading-[1.05] rtl:leading-[1.25] sm:rtl:leading-[1.2]"
            >
              <span className="hero-line-wrapper block overflow-hidden pb-[0.3em] -mb-[0.3em]">
                <span className="hero-line-inner block">
                  {t("home.heroLine1")}
                </span>
              </span>
              <span className="hero-line-wrapper block overflow-hidden pb-[0.3em] -mb-[0.3em]">
                <span className="hero-line-inner block italic rtl:not-italic text-terracotta">
                  {t("home.heroLine2")}
                </span>
              </span>
            </h1>

            {/* Editorial Subtitle */}
            <p
              ref={heroSubtitleRef}
              className="font-sans text-base sm:text-xl text-stone-600 font-normal leading-relaxed max-w-xl"
            >
              {t("home.heroSubtitle")}
            </p>

            {/* Dual CTAs & Search Trigger */}
            <div ref={heroCtaRef} className="space-y-6 pt-2">
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/recipes"
                  className="inline-flex items-center gap-2 bg-[#171513] hover:bg-black text-[#FBF8F3] px-8 py-4 rounded-full font-sans font-semibold text-xs uppercase tracking-wider transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                  data-magnetic="true"
                >
                  <span>{t("home.exploreArchive")}</span>
                  <ArrowForward className="w-4 h-4" />
                </Link>
                <Link
                  to="/recipes?featured=true"
                  className="bg-white hover:bg-stone-50 text-stone-900 px-8 py-4 rounded-full font-sans font-semibold text-xs uppercase tracking-wider border border-stone-200 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  data-magnetic="true"
                >
                  {t("home.curatedVolumes")}
                </Link>
              </div>

              {/* Fast Search Input */}
              <div className="max-w-md pt-2">
                <SearchBar
                  onSearch={handleSearch}
                  placeholder={t("recipes.searchPlaceholder")}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Hero Showcase Image with Parallax */}
          <div className="lg:col-span-5 relative">
            {/* Editorial Circular Frame Background */}
            <div className="absolute inset-0 sm:-inset-3 lg:-inset-4 rounded-[40px] bg-sand/40 rotate-0 sm:-rotate-2 -z-10 pointer-events-none" />

            <div
              ref={heroImageContainerRef}
              className="relative aspect-4/5 w-full rounded-[36px] overflow-hidden bg-stone-200 shadow-2xl border border-stone-200/80"
              data-cursor="recipe"
            >
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80"
                alt="Artisan Salad with Poached Eggs, Avocado, and Fresh Kitchen Herbs"
                className="w-full h-[125%] object-cover select-none -translate-y-8"
              />

              {/* Floating Monogram Chip */}
              <div className="absolute top-6 start-6 font-mono text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-[#171513]/85 text-[#FBF8F3] backdrop-blur-md border border-white/10">
                {t("home.edition")}
              </div>

              {/* Bottom Caption Pill */}
              <div className="absolute bottom-6 start-6 end-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200/80 shadow-lg flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-lg text-stone-900 leading-tight">
                    {t("collections.greensTitle")}
                  </h4>
                  <span className="font-mono text-xs text-stone-500">
                    {formatNum(25)} {t("common.mins")} •{" "}
                    {t("home.testedRecipes")}
                  </span>
                </div>
                <Link
                  to="/recipes"
                  className="font-mono text-xs font-bold text-terracotta hover:underline inline-flex items-center gap-1"
                >
                  <span>{t("home.exploreVolume")}</span>
                  <ArrowForward className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. INFINITE MARQUEE CATEGORY TICKER
          ===================================================================== */}
      <section className="relative overflow-hidden py-5 bg-[#171513] text-[#FBF8F3] -mx-4 sm:-mx-6 lg:-mx-8 my-10 select-none">
        <div
          ref={marqueeTrackRef}
          className="flex whitespace-nowrap gap-12 font-serif text-xl sm:text-2xl font-light tracking-wide w-max"
        >
          {marqueeItems.concat(marqueeItems).map((item, idx) => (
            <span key={idx} className="flex items-center gap-12">
              <span>{item}</span>
              <Sparkles
                className="w-3.5 h-3.5 text-terracotta"
                aria-hidden="true"
              />
            </span>
          ))}
        </div>
      </section>

      {/* =====================================================================
          3. CATEGORIES MONOGRAPH GRID
          ===================================================================== */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-terracotta font-semibold">
              {t("filters.category")}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-stone-900 font-normal mt-1">
              {t("home.curatedVolumes")}
            </h2>
          </div>
          <Link
            to="/recipes"
            className="font-mono text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
          >
            <span>{t("home.viewAllRecipes")}</span>
            <ArrowForward className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Categories Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat, idx) => (
            <Link
              key={cat.id}
              to={`/categories/${cat.slug}`}
              className="group bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs hover:border-terracotta/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-32 hover:-translate-y-1"
            >
              <span className="font-mono text-[11px] text-stone-400 group-hover:text-terracotta transition-colors">
                {formatNum(`0${idx + 1}`)}
              </span>
              <div>
                <h3 className="font-serif text-xl text-stone-900 group-hover:text-terracotta transition-colors capitalize">
                  {tCategory(cat.slug, cat.name)}
                </h3>
                <span className="font-mono text-[10px] text-stone-400 uppercase tracking-wider inline-flex items-center gap-1 group-hover:text-terracotta transition-colors">
                  <span>{t("home.exploreVolume")}</span>
                  <ArrowForward className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =====================================================================
          4. PINNED HORIZONTAL MONOGRAPH COLLECTIONS (GSAP ScrollTrigger)
          ===================================================================== */}
      <HorizontalCollection />

      {/* =====================================================================
          5. CURATED SPOTLIGHT (Trending Recipes)
          ===================================================================== */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-terracotta font-semibold">
              {t("home.curatedVolumes")}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-stone-900 font-normal mt-1">
              {t("home.featuredHeading")}
            </h2>
          </div>
          <Link
            to="/recipes?featured=true"
            className="font-mono text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
          >
            <span>{t("home.viewAllRecipes")}</span>
            <ArrowForward className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isFeaturedLoading && (
          <RecipeGrid>
            {Array.from({ length: 4 }).map((_, idx) => (
              <RecipeCardSkeleton key={idx} />
            ))}
          </RecipeGrid>
        )}

        {isFeaturedError && (
          <ErrorState
            title={t("common.error")}
            message={t("recipes.noRecipesDesc")}
            onRetry={refetchFeatured}
          />
        )}

        {featuredData && featuredData.items.length > 0 && (
          <RecipeGrid>
            {featuredData.items.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </RecipeGrid>
        )}
      </section>

      {/* =====================================================================
          6. LATEST ADDITIONS TO THE ARCHIVE
          ===================================================================== */}
      <section className="space-y-8 pt-6 border-t border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-stone-400 font-semibold">
              {t("recipes.badge")}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-stone-900 font-normal mt-1">
              {t("home.testedRecipes")}
            </h2>
          </div>
          <Link
            to="/recipes"
            className="font-mono text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
          >
            <span>
              {t("home.viewAllRecipes")} (
              {formatNum(latestData?.meta.total || 0)})
            </span>
            <ArrowForward className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLatestLoading && (
          <RecipeGrid>
            {Array.from({ length: 8 }).map((_, idx) => (
              <RecipeCardSkeleton key={idx} />
            ))}
          </RecipeGrid>
        )}

        {isLatestError && (
          <ErrorState
            title={t("common.error")}
            message={t("recipes.noRecipesDesc")}
            onRetry={refetchLatest}
          />
        )}

        {latestData && latestData.items.length > 0 && (
          <RecipeGrid>
            {latestData.items.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </RecipeGrid>
        )}
      </section>
    </div>
  );
}
