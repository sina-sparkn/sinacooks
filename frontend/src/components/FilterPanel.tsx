import { useState, useMemo } from "react";
import { SlidersHorizontal, RotateCcw, Check } from "lucide-react";
import type { Category, Tag } from "../api/types.js";
import { useTranslation } from "../features/i18n/I18nContext.js";

export interface FilterValues {
  category?: string;
  tags: string[];
  difficulty?: "easy" | "medium" | "hard";
  maxTime?: number;
}

export interface FilterPanelProps {
  categories: Category[];
  tags: Tag[];
  selectedCategory?: string;
  selectedTags?: string[];
  selectedDifficulty?: "easy" | "medium" | "hard";
  maxTime?: number;
  onApply: (filters: FilterValues) => void;
  onReset: () => void;
  // Optional backwards-compatibility props
  onCategoryChange?: (catSlug: string | undefined) => void;
  onTagToggle?: (tagSlug: string) => void;
  onDifficultyChange?: (diff: "easy" | "medium" | "hard" | undefined) => void;
  onMaxTimeChange?: (time: number | undefined) => void;
}

export function FilterPanel({
  categories,
  tags,
  selectedCategory,
  selectedTags = [],
  selectedDifficulty,
  maxTime,
  onApply,
  onReset,
}: FilterPanelProps) {
  const { t, tCategory, tDifficulty, tTag, formatNum } = useTranslation();
  const tagsKey = selectedTags.join(",");

  // Store previous applied props to synchronize draft state when props change externally
  const [prevProps, setPrevProps] = useState({
    selectedCategory,
    selectedDifficulty,
    maxTime,
    tagsKey,
  });

  // Local draft filter state - only applied to the page when "Set Filters" is clicked
  const [draftCategory, setDraftCategory] = useState<string | undefined>(
    selectedCategory,
  );
  const [draftTags, setDraftTags] = useState<string[]>(selectedTags);
  const [draftDifficulty, setDraftDifficulty] = useState<
    "easy" | "medium" | "hard" | undefined
  >(selectedDifficulty);
  const [draftMaxTime, setDraftMaxTime] = useState<number | undefined>(maxTime);

  // Sync draft state during render when incoming props change externally (official React pattern)
  if (
    selectedCategory !== prevProps.selectedCategory ||
    selectedDifficulty !== prevProps.selectedDifficulty ||
    maxTime !== prevProps.maxTime ||
    tagsKey !== prevProps.tagsKey
  ) {
    setPrevProps({
      selectedCategory,
      selectedDifficulty,
      maxTime,
      tagsKey,
    });
    setDraftCategory(selectedCategory);
    setDraftDifficulty(selectedDifficulty);
    setDraftMaxTime(maxTime);
    setDraftTags(selectedTags);
  }

  // Determine whether there are pending unapplied changes
  const isCategoryChanged = draftCategory !== selectedCategory;
  const isDifficultyChanged = draftDifficulty !== selectedDifficulty;
  const isMaxTimeChanged = draftMaxTime !== maxTime;

  const isTagsChanged = useMemo(() => {
    if (draftTags.length !== selectedTags.length) return true;
    const sortedDraft = [...draftTags].sort();
    const sortedSelected = [...selectedTags].sort();
    return sortedDraft.some((tag, idx) => tag !== sortedSelected[idx]);
  }, [draftTags, selectedTags]);

  const hasPendingChanges =
    isCategoryChanged ||
    isDifficultyChanged ||
    isMaxTimeChanged ||
    isTagsChanged;

  const hasActiveAppliedFilters = Boolean(
    selectedCategory ||
    selectedTags.length > 0 ||
    selectedDifficulty ||
    maxTime,
  );

  const hasDraftFilters = Boolean(
    draftCategory || draftTags.length > 0 || draftDifficulty || draftMaxTime,
  );

  const totalSelectedCount =
    (draftCategory ? 1 : 0) +
    (draftDifficulty ? 1 : 0) +
    (draftMaxTime ? 1 : 0) +
    draftTags.length;

  const handleApply = () => {
    onApply({
      category: draftCategory,
      difficulty: draftDifficulty,
      maxTime: draftMaxTime,
      tags: draftTags,
    });
  };

  const handleClearAll = () => {
    setDraftCategory(undefined);
    setDraftDifficulty(undefined);
    setDraftMaxTime(undefined);
    setDraftTags([]);
    onReset();
  };

  return (
    <div className="bg-white rounded-[30px] border border-stone-200/80 p-6 space-y-7 shadow-[0_4px_24px_rgba(23,21,19,0.03)]">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            className="w-4 h-4 text-terracotta"
            aria-hidden="true"
          />
          <h3 className="font-serif text-xl text-stone-900">
            {t("filters.refineArchive")}
          </h3>
        </div>
        {(hasActiveAppliedFilters || hasDraftFilters) && (
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1 font-mono text-xs text-terracotta hover:underline font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            <span>{t("filters.clearAll")}</span>
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-stone-500">
          {t("filters.category")}
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDraftCategory(undefined)}
            className={`px-3.5 py-1.5 rounded-full font-mono text-xs transition-colors cursor-pointer ${
              !draftCategory
                ? "bg-stone-900 text-white shadow-xs"
                : "bg-sand/50 text-stone-700 hover:bg-stone-200"
            }`}
          >
            {t("filters.all")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                setDraftCategory(
                  draftCategory === cat.slug ? undefined : cat.slug,
                )
              }
              className={`px-3.5 py-1.5 rounded-full font-mono text-xs transition-colors cursor-pointer ${
                draftCategory === cat.slug
                  ? "bg-terracotta text-white shadow-xs"
                  : "bg-sand/50 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {tCategory(cat.slug, cat.name)}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="space-y-3">
        <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-stone-500">
          {t("filters.difficulty")}
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {(["easy", "medium", "hard"] as const).map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() =>
                setDraftDifficulty(draftDifficulty === diff ? undefined : diff)
              }
              className={`py-1.5 px-2 rounded-full font-mono text-xs capitalize text-center transition-colors cursor-pointer ${
                draftDifficulty === diff
                  ? "bg-terracotta text-white shadow-xs"
                  : "bg-sand/50 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {tDifficulty(diff)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setDraftDifficulty(undefined)}
            className={`py-1.5 px-2 rounded-full font-mono text-xs text-center transition-colors cursor-pointer ${
              !draftDifficulty
                ? "bg-stone-900 text-white shadow-xs"
                : "bg-sand/50 text-stone-700 hover:bg-stone-200"
            }`}
          >
            {t("filters.any")}
          </button>
        </div>
      </div>

      {/* Max Cooking Time */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-mono text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            {t("filters.maxTime")}
          </label>
          <span className="font-mono text-xs font-semibold text-terracotta">
            {draftMaxTime
              ? t("filters.lessThanMins", { mins: draftMaxTime })
              : t("filters.any")}
          </span>
        </div>
        <input
          type="range"
          min="5"
          max="120"
          step="5"
          value={draftMaxTime || 120}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            setDraftMaxTime(val >= 120 ? undefined : val);
          }}
          className="w-full accent-terracotta cursor-pointer"
        />
        <div className="flex justify-between font-mono text-[10px] text-stone-400">
          <span>{formatNum(5)}m</span>
          <span>{formatNum(30)}m</span>
          <span>{formatNum(60)}m</span>
          <span>{formatNum(120)}m+</span>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="space-y-3">
          <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            {t("filters.dietsAndHeritage")}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => {
              const isSelected = draftTags.includes(tag.slug);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    setDraftTags((prev) =>
                      prev.includes(tag.slug)
                        ? prev.filter((t) => t !== tag.slug)
                        : [...prev, tag.slug],
                    );
                  }}
                  className={`px-3 py-1 rounded-full font-mono text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-sage text-white"
                      : "bg-sand/50 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  #{tTag(tag.slug, tag.name)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Set Filters Action Button */}
      <div className="pt-3 border-t border-stone-100 space-y-2">
        <button
          type="button"
          onClick={handleApply}
          className={`w-full py-3 px-4 rounded-full font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
            hasPendingChanges
              ? "bg-terracotta hover:bg-terracotta-dark text-white shadow-md shadow-terracotta/25 scale-[1.01]"
              : "bg-stone-900 hover:bg-stone-800 text-white"
          }`}
        >
          {hasPendingChanges ? (
            <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Check className="w-3.5 h-3.5 text-sage-light" aria-hidden="true" />
          )}
          <span>{t("filters.setFilters")}</span>
          {totalSelectedCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono">
              {formatNum(totalSelectedCount)}
            </span>
          )}
        </button>

        {hasPendingChanges ? (
          <p className="text-center font-mono text-[10px] text-terracotta font-medium animate-pulse">
            {t("filters.unappliedChanges")}
          </p>
        ) : hasActiveAppliedFilters ? (
          <p className="text-center font-mono text-[10px] text-stone-400">
            {t("filters.filtersApplied")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
