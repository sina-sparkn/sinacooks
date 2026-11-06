import { Link } from "react-router";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "../features/i18n/I18nContext.js";

const currentYear = new Date().getFullYear();

export function Footer() {
  const { t, formatNum } = useTranslation();

  return (
    <footer className="bg-[#171513] text-[#E8E2D8] mt-24 border-t border-white/10 relative overflow-hidden">
      {/* Top Graphic Monogram / Large Editorial Watermark */}
      <div className="absolute end-6 -bottom-10 pointer-events-none select-none font-serif text-[120px] sm:text-[180px] font-normal text-white/[0.03] leading-none">
        SINACOOKS
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 sm:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand & Manifesto */}
          <div className="space-y-4 md:col-span-5">
            <Link to="/" className="inline-block">
              <span className="font-serif text-3xl font-normal tracking-wide text-white">
                sinacooks
              </span>
            </Link>
            <p className="font-sans text-sm text-[#E8E2D8]/70 max-w-sm leading-relaxed">
              {t("footer.brandDesc")}
            </p>
            <div className="font-mono text-xs text-terracotta uppercase tracking-widest pt-2">
              {t("footer.monographVol")}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-widest text-white/50">
              {t("footer.explore")}
            </h4>
            <ul className="space-y-2.5 font-sans text-sm text-[#E8E2D8]/80">
              <li>
                <Link
                  to="/recipes"
                  className="hover:text-terracotta transition-colors"
                >
                  {t("header.recipes")}
                </Link>
              </li>
              <li>
                <Link
                  to="/recipes?featured=true"
                  className="hover:text-terracotta transition-colors"
                >
                  {t("home.featuredHeading")}
                </Link>
              </li>
              <li>
                <Link
                  to="/favorites"
                  className="hover:text-terracotta transition-colors"
                >
                  {t("header.saved")}
                </Link>
              </li>
              <li>
                <Link
                  to="/recipes?maxTime=30"
                  className="hover:text-terracotta transition-colors"
                >
                  {t("filters.lessThanMins", { mins: 30 })}
                </Link>
              </li>
            </ul>
          </div>

          {/* Editorial & Tools */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-widest text-white/50">
              {t("footer.membership")}
            </h4>
            <ul className="space-y-2.5 font-sans text-sm text-[#E8E2D8]/80">
              <li>
                <a
                  href="http://localhost:1337/admin"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-terracotta transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Strapi Editorial Panel</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/40" />
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:3000/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-terracotta transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Backend OpenAPI Docs</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/40" />
                </a>
              </li>
              <li className="pt-2">
                <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-[11px] font-mono text-white/60 border border-white/10">
                  PostgreSQL 18 • NestJS 12 • Strapi 5
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Sub-footer Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-white/50 gap-4">
          <p>
            © {formatNum(currentYear)} SINACOOKS ARCHIVE.{" "}
            {t("footer.allRightsReserved")}
          </p>
          <div className="flex items-center gap-6">
            <Link to="/recipes" className="hover:text-white transition-colors">
              {t("footer.terms")}
            </Link>
            <Link to="/recipes" className="hover:text-white transition-colors">
              {t("footer.privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
