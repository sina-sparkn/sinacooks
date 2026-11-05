import { Link } from "react-router";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-20 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍳</span>
              <span className="font-serif font-black text-xl text-white">
                TasteCraft
              </span>
            </div>
            <p className="text-stone-400 text-sm max-w-sm leading-relaxed">
              Curated, tested, and scalable recipes crafted for home cooks and
              food lovers. Powered by Strapi CMS and NestJS.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-4">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link
                  to="/recipes"
                  className="hover:text-white transition-colors"
                >
                  All Recipes
                </Link>
              </li>
              <li>
                <Link
                  to="/recipes?featured=true"
                  className="hover:text-white transition-colors"
                >
                  Featured Dishes
                </Link>
              </li>
              <li>
                <Link
                  to="/favorites"
                  className="hover:text-white transition-colors"
                >
                  My Saved Recipes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-4">
              Community
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link
                  to="/login"
                  className="hover:text-white transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-white transition-colors"
                >
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 text-xs text-stone-500 text-center">
          &copy; {currentYear} TasteCraft Recipe Site. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
