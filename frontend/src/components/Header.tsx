import { Link, NavLink, useNavigate } from "react-router";
import { useAuth } from "../features/auth/useAuth.js";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white text-xl shadow-xs group-hover:scale-105 transition-transform">
            🍳
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-black text-xl tracking-tight text-stone-900 group-hover:text-amber-600 transition-colors">
              TasteCraft
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 -mt-1">
              Recipes & Bites
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `transition-colors hover:text-amber-600 ${isActive ? "text-amber-600 font-semibold" : "text-stone-600"}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/recipes"
            className={({ isActive }) =>
              `transition-colors hover:text-amber-600 ${isActive ? "text-amber-600 font-semibold" : "text-stone-600"}`
            }
          >
            All Recipes
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `transition-colors hover:text-amber-600 flex items-center gap-1.5 ${
                isActive ? "text-amber-600 font-semibold" : "text-stone-600"
              }`
            }
          >
            <span>Favorites</span>
            <span className="text-red-500 text-xs">❤️</span>
          </NavLink>
        </nav>

        {/* User / Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-stone-700 hidden sm:inline-block">
                Hi,{" "}
                <strong className="text-stone-900">{user.displayName}</strong>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-amber-600 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
