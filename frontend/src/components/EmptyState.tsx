import { Link } from "react-router";
import { UtensilsCrossed } from "lucide-react";
import { useTranslation } from "../features/i18n/I18nContext.js";

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyState({
  title,
  message,
  actionText,
  actionHref = "/recipes",
}: EmptyStateProps) {
  const { t } = useTranslation();

  const finalTitle = title || t("recipes.noRecipes");
  const finalMessage = message || t("recipes.noRecipesDesc");
  const finalActionText = actionText || t("recipes.resetAllFilters");

  return (
    <div className="text-center py-20 px-6 max-w-md mx-auto space-y-5 bg-white/60 rounded-[32px] border border-stone-200/80 p-8 shadow-xs">
      <div className="w-16 h-16 rounded-full bg-sand/60 border border-stone-200 text-terracotta flex items-center justify-center mx-auto">
        <UtensilsCrossed
          className="w-7 h-7"
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </div>
      <div className="space-y-2">
        <h3 className="font-serif text-2xl font-normal text-stone-900">
          {finalTitle}
        </h3>
        <p className="font-sans text-stone-600 text-xs sm:text-sm leading-relaxed">
          {finalMessage}
        </p>
      </div>
      {actionHref && (
        <div className="pt-2">
          <Link
            to={actionHref}
            className="inline-block px-6 py-3 bg-[#171513] hover:bg-black text-[#FBF8F3] font-sans font-semibold text-xs uppercase tracking-wider rounded-full transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            data-magnetic="true"
          >
            {finalActionText}
          </Link>
        </div>
      )}
    </div>
  );
}
