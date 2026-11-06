import React, { useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { Heart } from "lucide-react";
import { useAuth } from "../features/auth/useAuth.js";
import { useFavoriteIds, useToggleFavorite } from "../api/favorites.js";
import { gsap } from "../lib/gsap.js";
import { useTranslation } from "../features/i18n/I18nContext.js";

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
  const iconRef = useRef<SVGSVGElement>(null);
  const { isRTL } = useTranslation();

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

    // GSAP elastic scale burst animation
    if (iconRef.current) {
      gsap
        .timeline()
        .to(iconRef.current, {
          scale: 1.45,
          duration: 0.15,
          ease: "power2.out",
        })
        .to(iconRef.current, {
          scale: 1,
          duration: 0.45,
          ease: "elastic.out(1.3, 0.4)",
        });
    }

    toggleFavorite.mutate({ recipeId, isFavorited });
  };

  const cursorLabel = isFavorited
    ? isRTL
      ? "حذف نشان"
      : "Remove Favorite"
    : isRTL
      ? "نشان کردن"
      : "Add to Favorite";

  const ariaLabel = isFavorited
    ? isRTL
      ? "حذف از نشان‌شده‌ها"
      : "Remove from saved recipes"
    : isRTL
      ? "نشان کردن این دستور"
      : "Save this recipe";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      data-cursor="favorite"
      data-cursor-text={cursorLabel}
      data-magnetic="true"
      className={`p-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-terracotta bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(23,21,19,0.08)] border border-stone-200/60 hover:shadow-md cursor-pointer ${
        isFavorited ? "text-terracotta" : "text-stone-400 hover:text-terracotta"
      } ${className}`}
    >
      <Heart
        ref={iconRef}
        className={`w-4 h-4 transition-colors ${
          isFavorited
            ? "fill-terracotta stroke-terracotta"
            : "fill-none stroke-current"
        }`}
        strokeWidth={2}
      />
    </button>
  );
}
