import { AlertTriangle } from "lucide-react";
import { useTranslation } from "../features/i18n/I18nContext";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();
  const displayTitle = title ?? t("common.errorTitle");
  const displayMessage = message ?? t("common.errorMessage");

  return (
    <div className="text-center py-16 px-6 max-w-md mx-auto space-y-5 bg-white/70 rounded-[32px] border border-stone-200/80 p-8 shadow-xs">
      <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
        <AlertTriangle
          className="w-7 h-7"
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </div>
      <div className="space-y-2">
        <h3 className="font-serif text-2xl font-normal text-stone-900">
          {displayTitle}
        </h3>
        <p className="font-sans text-stone-600 text-xs sm:text-sm leading-relaxed">
          {displayMessage}
        </p>
      </div>
      {onRetry && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="px-6 py-3 bg-[#171513] hover:bg-black text-[#FBF8F3] font-sans font-semibold text-xs uppercase tracking-wider rounded-full transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            data-magnetic="true"
          >
            {t("common.errorRetry")}
          </button>
        </div>
      )}
    </div>
  );
}
