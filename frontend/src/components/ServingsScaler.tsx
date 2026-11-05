interface ServingsScalerProps {
  currentServings: number;
  baseServings: number;
  onChange: (servings: number) => void;
}

export function ServingsScaler({
  currentServings,
  baseServings,
  onChange,
}: ServingsScalerProps) {
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
    <div className="flex items-center gap-3 bg-stone-100 p-1.5 rounded-2xl border border-stone-200/80">
      <div className="flex items-center">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={currentServings <= 1}
          aria-label="Decrease servings"
          className="w-8 h-8 rounded-xl bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs flex items-center justify-center font-bold text-base transition-colors"
        >
          −
        </button>
        <span className="w-12 text-center font-bold text-stone-900 text-sm">
          {currentServings}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={currentServings >= 40}
          aria-label="Increase servings"
          className="w-8 h-8 rounded-xl bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs flex items-center justify-center font-bold text-base transition-colors"
        >
          +
        </button>
      </div>

      <span className="text-xs text-stone-500 font-medium pr-1">servings</span>

      {currentServings !== baseServings && (
        <button
          type="button"
          onClick={handleReset}
          className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold underline underline-offset-2 pr-1"
        >
          Reset ({baseServings})
        </button>
      )}
    </div>
  );
}
