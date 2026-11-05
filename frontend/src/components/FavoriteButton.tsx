import React from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../features/auth/useAuth.js";
import { useFavoriteIds, useToggleFavorite } from "../api/favorites.js";

interface FavoriteButtonProps {
  recipeId: string;
  className?: string;
}

export function FavoriteButton({
  recipeId,
  className = "",
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: favoriteIds = [] } = useFavoriteIds(Boolean(user));
  const toggleFavorite = useToggleFavorite();

  const isFavorited = favoriteIds.includes(recipeId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      const returnTo = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?returnTo=${returnTo}`);
      return;
    }

    toggleFavorite.mutate({ recipeId, isFavorited });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      className={`p-2.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
        isFavorited
          ? "bg-red-50 text-red-500 hover:bg-red-100 shadow-sm"
          : "bg-white/80 hover:bg-white text-stone-500 hover:text-red-500 shadow-sm backdrop-blur-sm"
      } ${className}`}
    >
      <svg
        className={`w-5 h-5 transition-transform active:scale-125 ${isFavorited ? "fill-current" : "fill-none stroke-current"}`}
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
