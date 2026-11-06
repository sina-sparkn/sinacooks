import { useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "../features/i18n/I18nContext";

export function NotFoundPage() {
  const { t, isRTL } = useTranslation();

  useEffect(() => {
    document.title = isRTL
      ? "۴۰۴ صفحه پیدا نشد | آرشیو sinacooks"
      : "404 Page Not Found | sinacooks Archive";
  }, [isRTL]);

  return (
    <div className="text-center py-24 px-4 max-w-md mx-auto space-y-6">
      <span className="font-mono text-xs uppercase tracking-widest text-terracotta font-semibold">
        {t("notFound.tag")}
      </span>
      <div className="text-7xl sm:text-8xl font-serif text-stone-900 font-normal">
        {t("notFound.code")}
      </div>
      <h1 className="font-serif text-3xl font-normal text-stone-900">
        {t("notFound.title")}
      </h1>
      <p className="font-sans text-stone-600 text-sm leading-relaxed">
        {t("notFound.desc")}
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#171513] hover:bg-black text-[#FBF8F3] font-sans font-semibold text-xs uppercase tracking-wider rounded-full transition-all shadow-md hover:scale-105 active:scale-95"
          data-magnetic="true"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{t("notFound.returnHome")}</span>
        </Link>
      </div>
    </div>
  );
}
