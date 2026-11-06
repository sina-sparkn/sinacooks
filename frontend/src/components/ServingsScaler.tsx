import { useEffect, useRef } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { gsap } from "../lib/gsap.js";
import { useTranslation } from "../features/i18n/I18nContext.js";

interface ServingsScalerProps {
  currentServings: number;
  baseServings: number;
  onChange: (servings: number) => void;
  className?: string;
}

export function ServingsScaler({
  currentServings,
  baseServings,
  onChange,
  className = "",
}: ServingsScalerProps) {
  const { t, formatNum } = useTranslation();
  const numberRef = useRef<HTMLSpanElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (numberRef.current) {
      gsap.fromTo(
        numberRef.current,
        { scale: 0.7, opacity: 0.2, y: -3 },
        { scale: 1, opacity: 1, y: 0, duration: 0.25, ease: "back.out(2)" },
      );
    }
  }, [currentServings]);

  const handleDecrement = () => {
    if (currentServings > 1) {
      onChange(currentServings - 1);
    }
  };

  const handleIncrement = () => {
    if (currentServings < 40) {
      onChange(currentServings + 1);
    }
  };

  const handleReset = () => {
    onChange(baseServings);
  };

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-2 bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200/80 shadow-xs max-w-full ${className}`}
    >
      {/* Plus / Minus & Number Controls */}
      <div className="inline-flex items-center gap-0.5 bg-white rounded-xl p-0.5 border border-stone-200/60 shadow-xs shrink-0">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={currentServings <= 1}
          aria-label="Decrease servings"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-transparent text-stone-700 hover:bg-terracotta hover:text-white disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-terracotta/50 active:scale-95 select-none cursor-pointer"
        >
          <Minus className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
        </button>
        <span
          ref={numberRef}
          className="w-8 text-center font-mono font-bold text-stone-900 text-sm sm:text-base select-none shrink-0"
        >
          {formatNum(currentServings)}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={currentServings >= 40}
          aria-label="Increase servings"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-transparent text-stone-700 hover:bg-terracotta hover:text-white disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-terracotta/50 active:scale-95 select-none cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
        </button>
      </div>

      <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider px-1 hidden sm:inline-block shrink-0 select-none">
        {t("common.servings")}
      </span>

      {currentServings !== baseServings && (
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-terracotta hover:text-terracotta-dark bg-terracotta/10 hover:bg-terracotta/20 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-terracotta/40 active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" strokeWidth={2} aria-hidden="true" />
          <span>
            {t("recipeDetail.resetServings", { base: formatNum(baseServings) })}
          </span>
        </button>
      )}
    </div>
  );
}
