import type { Category, Tag } from "../api/types.js";

interface FilterPanelProps {
  categories: Category[];
  tags: Tag[];
  selectedCategory?: string;
  selectedTags?: string[];
  selectedDifficulty?: string;
  maxTime?: number;
  onCategoryChange: (catSlug: string | undefined) => void;
  onTagToggle: (tagSlug: string) => void;
  onDifficultyChange: (diff: "easy" | "medium" | "hard" | undefined) => void;
  onMaxTimeChange: (time: number | undefined) => void;
  onReset: () => void;
}

export function FilterPanel({
  categories,
  tags,
  selectedCategory,
  selectedTags = [],
  selectedDifficulty,
  maxTime,
  onCategoryChange,
  onTagToggle,
  onDifficultyChange,
  onMaxTimeChange,
  onReset,
}: FilterPanelProps) {
  const hasActiveFilters = Boolean(
    selectedCategory ||
    selectedTags.length > 0 ||
    selectedDifficulty ||
    maxTime,
  );

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <h3 className="font-semibold text-stone-900 text-base flex items-center gap-2">
          <span>Filters</span>
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-amber-600 hover:text-amber-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2.5">
          Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onCategoryChange(undefined)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              !selectedCategory
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                onCategoryChange(
                  cat.slug === selectedCategory ? undefined : cat.slug,
                )
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                selectedCategory === cat.slug
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2.5">
          Difficulty
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {(["easy", "medium", "hard"] as const).map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() =>
                onDifficultyChange(
                  selectedDifficulty === diff ? undefined : diff,
                )
              }
              className={`py-1.5 px-2 rounded-xl text-xs font-medium capitalize text-center transition-colors ${
                selectedDifficulty === diff
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {diff}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onDifficultyChange(undefined)}
            className={`py-1.5 px-2 rounded-xl text-xs font-medium text-center transition-colors ${
              !selectedDifficulty
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            Any
          </button>
        </div>
      </div>

      {/* Cooking Time */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Max Time
          </label>
          <span className="text-xs font-medium text-stone-700">
            {maxTime ? `≤ ${maxTime} mins` : "Any time"}
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="120"
          step="5"
          value={maxTime || 120}
          onChange={(e) => {
            const val = Number(e.target.value);
            onMaxTimeChange(val === 120 ? undefined : val);
          }}
          className="w-full accent-amber-600"
        />
        <div className="flex justify-between text-[10px] text-stone-400 mt-1">
          <span>10m</span>
          <span>30m</span>
          <span>60m</span>
          <span>2h+</span>
        </div>
      </div>

      {/* Dietary Tags */}
      {tags.length > 0 && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2.5">
            Dietary & Style
          </label>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => {
              const active = selectedTags.includes(t.slug);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onTagToggle(t.slug)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    active
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  #{t.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
