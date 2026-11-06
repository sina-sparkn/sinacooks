import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "../features/i18n/I18nContext.js";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const { t, formatNum, isRTL } = useTranslation();
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const PrevChevron = isRTL ? ChevronRight : ChevronLeft;
  const NextChevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <nav
      aria-label="Pagination Navigation"
      className="flex items-center justify-center gap-2 mt-12 font-mono text-xs"
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
        data-magnetic="true"
      >
        <PrevChevron className="w-4 h-4" />
        <span>{t("common.previous")}</span>
      </button>

      {pages.map((p) => {
        // Show first, last, and current +- 1
        if (
          p === 1 ||
          p === totalPages ||
          (p >= currentPage - 1 && p <= currentPage + 1)
        ) {
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-full font-bold transition-all cursor-pointer ${
                p === currentPage
                  ? "bg-terracotta text-white shadow-xs"
                  : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-100"
              }`}
            >
              {formatNum(p)}
            </button>
          );
        } else if (p === currentPage - 2 || p === currentPage + 2) {
          return (
            <span key={p} className="px-1 text-stone-400 select-none">
              ...
            </span>
          );
        }
        return null;
      })}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
        data-magnetic="true"
      >
        <span>{t("common.next")}</span>
        <NextChevron className="w-4 h-4" />
      </button>
    </nav>
  );
}
