import { useEffect } from "react";
import { Link } from "react-router";

export function NotFoundPage() {
  useEffect(() => {
    document.title = "Page Not Found | TasteCraft";
  }, []);

  return (
    <div className="text-center py-24 px-4 max-w-md mx-auto space-y-4">
      <div className="text-6xl font-black text-amber-600 font-serif">404</div>
      <h1 className="text-2xl font-bold text-stone-900 font-serif">
        Page Not Found
      </h1>
      <p className="text-stone-600 text-sm leading-relaxed">
        We could not find the recipe or page you were looking for. Perhaps it
        was moved or does not exist.
      </p>
      <div className="pt-4">
        <Link
          to="/"
          className="inline-block px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition-colors shadow-sm text-sm"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
