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
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 mt-10"
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors"
      >
        Previous
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
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                p === currentPage
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
              }`}
            >
              {p}
            </button>
          );
        } else if (p === currentPage - 2 || p === currentPage + 2) {
          return (
            <span key={p} className="px-1 text-stone-400">
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
        className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors"
      >
        Next
      </button>
    </nav>
  );
}
