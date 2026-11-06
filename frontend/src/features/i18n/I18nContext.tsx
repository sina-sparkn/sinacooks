/* oxlint-disable react/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { translations, type Language } from "./translations.js";

const STORAGE_KEY = "sinacooks_language";

export function toPersianDigits(val: string | number): string {
  const str = String(val);
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
}

export interface I18nContextValue {
  language: Language;
  isRTL: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tCategory: (slug?: string | null, fallback?: string) => string;
  tDifficulty: (diff?: string | null) => string;
  tTag: (slug?: string | null, fallback?: string) => string;
  tUnit: (unit?: string | null) => string;
  formatNum: (val: number | string) => string;
  formatDuration: (minutes: number | null | undefined) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "fa" || stored === "en") return stored;
      if (
        typeof navigator !== "undefined" &&
        navigator.language &&
        navigator.language.toLowerCase().startsWith("fa")
      ) {
        return "fa";
      }
    } catch {
      // Ignore localStorage errors
    }
    return "en";
  });

  const isRTL = language === "fa";

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next: Language = prev === "en" ? "fa" : "en";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  // Sync document attributes (dir and lang) on html element
  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
    if (isRTL) {
      document.body.classList.add("rtl");
    } else {
      document.body.classList.remove("rtl");
    }
  }, [language, isRTL]);

  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const dict = translations[language] as any;
      const parts = path.split(".");
      let cur: any = dict;

      for (const p of parts) {
        if (cur && typeof cur === "object" && p in cur) {
          cur = cur[p];
        } else {
          // Fallback to English dictionary
          let fallback: any = translations.en as any;
          for (const fbPart of parts) {
            if (
              fallback &&
              typeof fallback === "object" &&
              fbPart in fallback
            ) {
              fallback = fallback[fbPart];
            } else {
              fallback = undefined;
              break;
            }
          }
          cur = fallback ?? path;
          break;
        }
      }

      let res = typeof cur === "string" ? cur : path;

      if (params) {
        for (const [k, v] of Object.entries(params)) {
          const formattedVal =
            isRTL && typeof v === "number" ? toPersianDigits(v) : String(v);
          res = res.replace(new RegExp(`\\{${k}\\}`, "g"), formattedVal);
        }
      }

      return res;
    },
    [language, isRTL],
  );

  const tCategory = useCallback(
    (slug?: string | null, fallback?: string): string => {
      if (!slug) return fallback || "";
      const lower = slug.toLowerCase();
      const catDict = (translations[language].categories as any) || {};
      if (catDict[lower]) return catDict[lower];
      return fallback || slug;
    },
    [language],
  );

  const tDifficulty = useCallback(
    (diff?: string | null): string => {
      if (!diff) return t("common.any");
      const lower = diff.toLowerCase();
      const diffDict = (translations[language].difficulties as any) || {};
      if (diffDict[lower]) return diffDict[lower];
      return diff;
    },
    [language, t],
  );

  const tTag = useCallback(
    (slug?: string | null, fallback?: string): string => {
      if (!slug) return fallback || "";
      const lower = slug.toLowerCase();
      const tagDict = (translations[language].tags as any) || {};
      if (tagDict[lower]) return tagDict[lower];
      return fallback || slug;
    },
    [language],
  );

  const tUnit = useCallback(
    (unit?: string | null): string => {
      if (!unit) return "";
      const lower = unit.toLowerCase();
      const unitDict = (translations[language].units as any) || {};
      if (unitDict[lower]) return unitDict[lower];
      return unit;
    },
    [language],
  );

  const formatNum = useCallback(
    (val: number | string): string => {
      return isRTL ? toPersianDigits(val) : String(val);
    },
    [isRTL],
  );

  const formatDuration = useCallback(
    (minutes: number | null | undefined): string => {
      if (!minutes || minutes <= 0) return "--";
      if (isRTL) {
        if (minutes < 60) {
          return `${toPersianDigits(minutes)} دقیقه`;
        }
        const hours = Math.floor(minutes / 60);
        const rem = minutes % 60;
        return rem > 0
          ? `${toPersianDigits(hours)} ساعت و ${toPersianDigits(rem)} دقیقه`
          : `${toPersianDigits(hours)} ساعت`;
      }
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      const rem = minutes % 60;
      return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
    },
    [isRTL],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      isRTL,
      setLanguage,
      toggleLanguage,
      t,
      tCategory,
      tDifficulty,
      tTag,
      tUnit,
      formatNum,
      formatDuration,
    }),
    [
      language,
      isRTL,
      setLanguage,
      toggleLanguage,
      t,
      tCategory,
      tDifficulty,
      tTag,
      tUnit,
      formatNum,
      formatDuration,
    ],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function translateEn(
  path: string,
  params?: Record<string, string | number>,
): string {
  const parts = path.split(".");
  let cur: any = translations.en;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) {
      cur = cur[p];
    } else {
      return path;
    }
  }
  let res = typeof cur === "string" ? cur : path;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      res = res.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return res;
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback with full English translations if rendered outside LanguageProvider (e.g. in standalone tests)
    return {
      language: "en",
      isRTL: false,
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: translateEn,
      tCategory: (s, f) => {
        if (!s) return f || "";
        const lower = s.toLowerCase();
        return (translations.en.categories as any)[lower] || f || s;
      },
      tDifficulty: (d) => {
        if (!d) return "Any";
        const lower = d.toLowerCase();
        return (translations.en.difficulties as any)[lower] || d;
      },
      tTag: (s, f) => {
        if (!s) return f || "";
        const lower = s.toLowerCase();
        return (translations.en.tags as any)[lower] || f || s;
      },
      tUnit: (u) => {
        if (!u) return "";
        const lower = u.toLowerCase();
        return (translations.en.units as any)[lower] || u;
      },
      formatNum: (v) => String(v),
      formatDuration: (m) => (m ? `${m}m` : "--"),
    };
  }
  return ctx;
}
