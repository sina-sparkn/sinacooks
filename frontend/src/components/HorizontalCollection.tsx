import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { gsap, prefersReducedMotion } from "../lib/gsap.js";
import { useTranslation } from "../features/i18n/I18nContext.js";

interface CollectionItem {
  id: string;
  tag: string;
  image: string;
  recipeCount: number;
}

const rawCollections: CollectionItem[] = [
  {
    id: "pasta",
    tag: "dinner",
    recipeCount: 14,
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "sunday",
    tag: "dinner",
    recipeCount: 9,
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "patisserie",
    tag: "dessert",
    recipeCount: 12,
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "greens",
    tag: "lunch",
    recipeCount: 18,
    image:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
  },
];

export function HorizontalCollection() {
  const { t, formatNum, isRTL } = useTranslation();

  const collections = useMemo(
    () =>
      rawCollections.map((col) => {
        if (col.id === "pasta") {
          return {
            ...col,
            title: t("collections.pastaTitle"),
            subtitle: t("collections.pastaSub"),
            highlight: t("collections.pastaHighlight"),
          };
        }
        if (col.id === "sunday") {
          return {
            ...col,
            title: t("collections.sundayTitle"),
            subtitle: t("collections.sundaySub"),
            highlight: t("collections.sundayHighlight"),
          };
        }
        if (col.id === "patisserie") {
          return {
            ...col,
            title: t("collections.patisserieTitle"),
            subtitle: t("collections.patisserieSub"),
            highlight: t("collections.patisserieHighlight"),
          };
        }
        return {
          ...col,
          title: t("collections.greensTitle"),
          subtitle: t("collections.greensSub"),
          highlight: t("collections.greensHighlight"),
        };
      }),
    [t],
  );

  const PrevArrow = isRTL ? ArrowRight : ArrowLeft;
  const NextArrow = isRTL ? ArrowLeft : ArrowRight;
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const isProgrammaticScrollRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Desktop Pinning with GSAP matchMedia
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // Reset track position before creating new tween
    gsap.set(track, { clearProps: "transform" });

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const getScrollAmount = () => {
        return Math.max(0, track.scrollWidth - section.clientWidth + 64);
      };

      const tween = gsap.to(track, {
        x: () => (isRTL ? getScrollAmount() : -getScrollAmount()),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1.1,
          start: "top 72px",
          end: () => `+=${getScrollAmount() * 1.25}`,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => {
      mm.revert();
      gsap.set(track, { clearProps: "transform" });
    };
  }, [isRTL]);

  // Programmatic slide navigation
  const goToSlide = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;

      // Normalizing wrap-around index
      const targetIndex = (index + collections.length) % collections.length;

      // 1. Lock programmatic scroll flag so scroll events do not overwrite index
      isProgrammaticScrollRef.current = true;
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);

      // 2. Set active index
      setActiveIndex(targetIndex);

      // 3. Smooth scroll directly to the target card (centered)
      const cards = track.querySelectorAll(".collection-card");
      const targetCard = cards[targetIndex] as HTMLElement | undefined;
      if (targetCard) {
        targetCard.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }

      // 4. Release programmatic lock after scroll finishes (~450ms)
      scrollTimerRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 500);
    },
    [collections.length],
  );

  // Mobile Auto-Carousel Interval (4s per slide)
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const isMobile =
      typeof window !== "undefined" ? window.innerWidth < 1024 : false;
    if (!isMobile || isPaused) return;

    const timer = setInterval(() => {
      goToSlide(activeIndex + 1);
    }, 4200);

    return () => clearInterval(timer);
  }, [activeIndex, isPaused, goToSlide]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, []);

  // Sync index when user manually finger-swipes the mobile track
  const handleScroll = () => {
    if (isProgrammaticScrollRef.current) return;
    const track = trackRef.current;
    if (!track || window.innerWidth >= 1024) return;

    const cards = track.querySelectorAll(".collection-card");
    if (cards.length === 0) return;

    const trackRect = track.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, idx) => {
      const el = card as HTMLElement;
      const cardRect = el.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const dist = Math.abs(trackCenter - cardCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  // Pause carousel for 6s on manual interaction
  const triggerUserPause = () => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 6000);
  };

  const handleTouchStart = () => {
    triggerUserPause();
  };

  const goToPrev = () => {
    triggerUserPause();
    goToSlide(activeIndex - 1);
  };

  const goToNext = () => {
    triggerUserPause();
    goToSlide(activeIndex + 1);
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#171513] text-[#FBF8F3] py-14 sm:py-20 my-16 rounded-[36px]"
      data-cursor="scroll"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-terracotta font-semibold">
            {t("home.curatedVolumes")}
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal mt-2 leading-tight">
            {t("home.seasonalAnthologies")}
          </h2>
        </div>

        <div className="flex flex-col md:items-end gap-3 max-w-md">
          <p className="font-sans text-xs sm:text-sm text-white/60 leading-relaxed">
            {t("home.seasonalDesc")}
          </p>

          {/* Mobile Auto Carousel Controls Header */}
          <div className="flex lg:hidden items-center justify-between w-full sm:w-auto gap-4 pt-1">
            {/* Auto-carousel indicator badge */}
            <div className="flex items-center gap-2 font-mono text-[11px] text-stone-400">
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
              <span>
                {formatNum(activeIndex + 1)} {t("common.of")}{" "}
                {formatNum(collections.length)}
              </span>
            </div>

            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPrev}
                aria-label={isRTL ? "مجموعه قبلی" : "Previous collection slide"}
                className="w-9 h-9 rounded-full border border-white/20 bg-white/10 text-white/80 hover:bg-terracotta hover:border-terracotta hover:text-white flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-xs select-none"
              >
                <PrevArrow className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                aria-label={isRTL ? "مجموعه بعدی" : "Next collection slide"}
                className="w-9 h-9 rounded-full border border-white/20 bg-white/10 text-white/80 hover:bg-terracotta hover:border-terracotta hover:text-white flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-xs select-none"
              >
                <NextArrow className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrolling / Swiping Track */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={triggerUserPause}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex gap-5 sm:gap-8 px-[calc((100%-min(82vw,340px))/2)] sm:px-[calc((100%-380px)/2)] lg:px-12 items-stretch pb-4 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none scrollbar-none"
        style={{
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
        }}
      >
        {collections.map((item, index) => (
          <Link
            key={item.id}
            to={`/recipes?category=${item.tag}`}
            className="collection-card group relative w-[82vw] max-w-[340px] sm:w-[380px] lg:w-[420px] shrink-0 snap-center lg:snap-none bg-[#211E1B] rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between transition-transform duration-500 hover:-translate-y-2 shadow-xl"
          >
            {/* Image Frame with hover zoom */}
            <div className="relative aspect-4/3 w-full overflow-hidden bg-black/40">
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
              />
              <div className="absolute top-4 start-4 font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase px-3 py-1 bg-black/70 backdrop-blur-md text-white/90 rounded-full border border-white/10">
                {formatNum(`0${index + 1}`)} // {item.highlight}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-5 sm:p-7 flex flex-col justify-between flex-1 space-y-4">
              <div className="space-y-2">
                <h3 className="font-serif text-2xl sm:text-3xl text-white group-hover:text-terracotta transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-white/60 leading-relaxed line-clamp-2">
                  {item.subtitle}
                </p>
              </div>

              {/* Card Footer: Tested recipes count + Explore Series action button */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2 text-xs font-mono">
                <span className="text-white/70 whitespace-nowrap shrink-0">
                  {t("home.recipesInVolume", {
                    count: formatNum(item.recipeCount),
                  })}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 group-hover:bg-terracotta text-white font-mono text-[11px] font-semibold transition-all whitespace-nowrap shrink-0 shadow-xs">
                  <span>{t("home.exploreVolume")}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-terracotta group-hover:text-white transition-colors shrink-0 rtl:-scale-x-100" />
                </span>
              </div>
            </div>
          </Link>
        ))}

        {/* Trailing Spacing Card for Desktop Scroll Completion */}
        <div
          className="hidden lg:block w-12 sm:w-20 shrink-0 pointer-events-none select-none"
          aria-hidden="true"
        />
      </div>

      {/* Mobile Active Slide Dots (Pagination) */}
      <div className="flex lg:hidden items-center justify-center gap-2 pt-6 pb-2">
        {collections.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              triggerUserPause();
              goToSlide(idx);
            }}
            aria-label={
              isRTL
                ? `رفتن به اسلاید ${formatNum(idx + 1)}`
                : `Go to slide ${idx + 1}`
            }
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === activeIndex
                ? "w-8 bg-terracotta"
                : "w-2 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
