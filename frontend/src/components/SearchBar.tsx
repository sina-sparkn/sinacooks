import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslation } from "../features/i18n/I18nContext.js";

interface SearchBarProps {
  initialValue?: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  initialValue = "",
  onSearch,
  placeholder,
  className = "",
}: SearchBarProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue);
  const [prevInitial, setPrevInitial] = useState(initialValue);

  const effectivePlaceholder = placeholder ?? t("recipes.searchPlaceholder");

  if (initialValue !== prevInitial) {
    setPrevInitial(initialValue);
    setValue(initialValue);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (value !== initialValue) {
        onSearch(value.trim());
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [value, initialValue, onSearch]);

  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 start-0 ps-4 sm:ps-5 flex items-center pointer-events-none text-stone-400">
        <Search
          className="w-4 h-4 sm:w-5 sm:h-5 text-terracotta/70"
          strokeWidth={2}
          aria-hidden="true"
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={effectivePlaceholder}
        className="w-full ps-11 sm:ps-12 pe-10 py-3.5 sm:py-4 bg-white/95 border border-stone-200/90 rounded-full text-stone-900 placeholder-stone-400/80 focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-terracotta shadow-[0_2px_12px_rgba(23,21,19,0.04)] text-sm transition-all font-sans"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            onSearch("");
          }}
          className="absolute inset-y-0 end-0 pe-4 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
          aria-label={t("filters.clearAll")}
        >
          <X className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
