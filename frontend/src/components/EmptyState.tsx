import { Link } from "react-router";

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyState({
  title = "No recipes found",
  message = "Try adjusting your search or filters to discover other delicious dishes.",
  actionText = "Browse all recipes",
  actionHref = "/recipes",
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4 max-w-md mx-auto">
      <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
        🍲
      </div>
      <h3 className="text-2xl font-bold text-stone-800 mb-2 font-serif">
        {title}
      </h3>
      <p className="text-stone-600 mb-6 text-sm leading-relaxed">{message}</p>
      {actionHref && (
        <Link
          to={actionHref}
          className="inline-block px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
