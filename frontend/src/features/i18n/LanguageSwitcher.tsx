import { Globe } from "lucide-react";
import { useTranslation } from "./I18nContext.js";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "pill" | "toggle" | "full";
}

export function LanguageSwitcher({
  className = "",
  variant = "pill",
}: LanguageSwitcherProps) {
  const { language, setLanguage, toggleLanguage } = useTranslation();

  if (variant === "full") {
    return (
      <div
        className={`flex items-center gap-1.5 p-1 rounded-full bg-white/10 ${className}`}
      >
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`px-3 py-1 rounded-full font-mono text-xs transition-colors cursor-pointer ${
            language === "en"
              ? "bg-terracotta text-white font-semibold shadow-xs"
              : "text-white/70 hover:text-white"
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLanguage("fa")}
          className={`px-3 py-1 rounded-full font-mono text-xs transition-colors cursor-pointer ${
            language === "fa"
              ? "bg-terracotta text-white font-semibold shadow-xs"
              : "text-white/70 hover:text-white"
          }`}
        >
          فارسی
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`group font-mono text-[11px] tracking-wider uppercase text-white/85 hover:text-white px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-105 active:scale-95 ${className}`}
      title={language === "en" ? "تغییر زبان به فارسی" : "Switch to English"}
      aria-label={
        language === "en"
          ? "Switch language to Persian"
          : "Switch language to English"
      }
    >
      <Globe className="w-3.5 h-3.5 text-terracotta transition-transform group-hover:rotate-45" />
      <span className="font-semibold text-white">
        {language === "en" ? "فا" : "EN"}
      </span>
    </button>
  );
}
