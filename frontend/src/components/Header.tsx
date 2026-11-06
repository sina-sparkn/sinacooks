import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { Heart, Menu, X } from "lucide-react";
import { useAuth } from "../features/auth/useAuth.js";
import { useTranslation } from "../features/i18n/I18nContext.js";
import { LanguageSwitcher } from "../features/i18n/LanguageSwitcher.js";
import { gsap } from "../lib/gsap.js";
import { useLenis } from "./useLenis.js";

const currentYear = new Date().getFullYear();

export function Header() {
  const { user, logout } = useAuth();
  const { t, formatNum } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const menuLinksRef = useRef<HTMLDivElement>(null);
  const { stopScroll, startScroll } = useLenis();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Animate full-screen menu with GSAP staggered links
  useEffect(() => {
    const overlay = menuOverlayRef.current;
    const linksContainer = menuLinksRef.current;
    if (!overlay) return;

    if (menuOpen) {
      stopScroll();
      document.body.style.overflow = "hidden";

      gsap.to(overlay, {
        opacity: 1,
        visibility: "visible",
        duration: 0.4,
        ease: "power3.out",
      });

      if (linksContainer) {
        const linkItems = linksContainer.querySelectorAll(".menu-stagger-item");
        gsap.fromTo(
          linkItems,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            duration: 0.5,
            ease: "power3.out",
            delay: 0.15,
          },
        );
      }
    } else {
      startScroll();
      document.body.style.overflow = "";

      gsap.to(overlay, {
        opacity: 0,
        duration: 0.3,
        ease: "power3.in",
        onComplete: () => {
          gsap.set(overlay, { visibility: "hidden" });
        },
      });
    }

    return () => {
      startScroll();
      document.body.style.overflow = "";
    };
  }, [menuOpen, startScroll, stopScroll]);

  return (
    <>
      <header className="sticky top-4 z-40 px-4 sm:px-6 w-full max-w-5xl mx-auto transition-all">
        {/* Floating Editorial Header Capsule */}
        <div className="bg-[#171513]/90 text-[#FBF8F3] rounded-full px-5 sm:px-8 py-3.5 shadow-[0_12px_40px_rgba(23,21,19,0.18)] border border-white/10 flex items-center justify-between backdrop-blur-md">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group shrink-0"
            data-magnetic="true"
          >
            <span className="font-serif text-xl sm:text-2xl font-normal tracking-wide text-white group-hover:text-terracotta transition-colors">
              sinacooks
            </span>
            <span className="hidden sm:inline-block font-mono text-[9px] uppercase tracking-widest text-white/40 ps-1.5 border-s border-white/15">
              {t("header.archive")}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-medium tracking-wider uppercase text-white/75 font-mono">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `transition-colors hover:text-white relative py-1 ${
                  isActive ? "text-terracotta font-semibold" : ""
                }`
              }
              data-magnetic="true"
            >
              {t("header.home")}
            </NavLink>
            <NavLink
              to="/recipes"
              className={({ isActive }) =>
                `transition-colors hover:text-white relative py-1 ${
                  isActive ? "text-terracotta font-semibold" : ""
                }`
              }
              data-magnetic="true"
            >
              {t("header.recipes")}
            </NavLink>
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                `transition-colors hover:text-white flex items-center gap-1.5 py-1 ${
                  isActive ? "text-terracotta font-semibold" : ""
                }`
              }
              data-magnetic="true"
            >
              <span>{t("header.saved")}</span>
              <Heart
                className="w-2.5 h-2.5 text-terracotta fill-terracotta"
                aria-hidden="true"
              />
            </NavLink>
          </nav>

          {/* Right CTA / Auth Controls & Language Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Switcher Button */}
            <LanguageSwitcher variant="pill" />

            {/* Desktop Auth Controls */}
            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-white/80 px-3 py-1 bg-white/10 rounded-full border border-white/10">
                    {user.displayName}
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] tracking-wider uppercase px-4 py-1.5 rounded-full transition-colors cursor-pointer"
                    data-magnetic="true"
                  >
                    {t("header.signOut")}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="font-mono text-[11px] uppercase tracking-wider text-white/80 hover:text-white px-3 py-1.5 transition-colors"
                    data-magnetic="true"
                  >
                    {t("header.signIn")}
                  </Link>
                  <Link
                    to="/register"
                    className="bg-terracotta hover:bg-terracotta-dark text-white font-sans text-xs font-semibold px-4 py-2 rounded-full shadow-sm transition-all hover:scale-105 active:scale-95"
                    data-magnetic="true"
                  >
                    {t("header.joinArchive")}
                  </Link>
                </div>
              )}
            </div>

            {/* Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-1.5 text-white/80 hover:text-white cursor-pointer"
              aria-label={menuOpen ? t("header.close") : t("header.menu")}
              data-magnetic="true"
            >
              {menuOpen ? (
                <X className="w-6 h-6" strokeWidth={1.5} />
              ) : (
                <Menu className="w-6 h-6" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen Menu Overlay */}
      <div
        ref={menuOverlayRef}
        className="fixed inset-0 z-50 bg-[#171513]/98 text-[#FBF8F3] opacity-0 invisible flex flex-col justify-between p-8 sm:p-14 backdrop-blur-2xl"
      >
        {/* Top bar inside overlay */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="font-serif text-3xl font-normal text-white"
          >
            sinacooks
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="pill" />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              aria-label={t("header.close")}
            >
              <X className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Center Staggered Links */}
        <div ref={menuLinksRef} className="my-auto space-y-6 max-w-xl">
          <div className="menu-stagger-item">
            <span className="font-mono text-xs uppercase tracking-widest text-terracotta">
              {formatNum("01")}
            </span>
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="block font-serif text-4xl sm:text-6xl text-white hover:text-terracotta transition-colors mt-1"
            >
              {t("header.home")}
            </Link>
          </div>
          <div className="menu-stagger-item">
            <span className="font-mono text-xs uppercase tracking-widest text-terracotta">
              {formatNum("02")}
            </span>
            <Link
              to="/recipes"
              onClick={() => setMenuOpen(false)}
              className="block font-serif text-4xl sm:text-6xl text-white hover:text-terracotta transition-colors mt-1"
            >
              {t("header.recipes")}
            </Link>
          </div>
          <div className="menu-stagger-item">
            <span className="font-mono text-xs uppercase tracking-widest text-terracotta">
              {formatNum("03")}
            </span>
            <Link
              to="/recipes?featured=true"
              onClick={() => setMenuOpen(false)}
              className="block font-serif text-4xl sm:text-6xl text-white hover:text-terracotta transition-colors mt-1"
            >
              {t("home.featuredHeading")}
            </Link>
          </div>
          <div className="menu-stagger-item">
            <span className="font-mono text-xs uppercase tracking-widest text-terracotta">
              {formatNum("04")}
            </span>
            <Link
              to="/favorites"
              onClick={() => setMenuOpen(false)}
              className="block font-serif text-4xl sm:text-6xl text-white hover:text-terracotta transition-colors mt-1"
            >
              {t("header.saved")}
            </Link>
          </div>
        </div>

        {/* Bottom Auth & Language Selector & Meta */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-white/60">
          <div className="flex flex-wrap items-center gap-4">
            <LanguageSwitcher variant="full" />
            {user ? (
              <>
                <span className="text-white">{user.displayName}</span>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="text-terracotta font-semibold uppercase hover:underline cursor-pointer"
                >
                  {t("header.signOut")}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-white uppercase tracking-wider"
                >
                  {t("header.signIn")}
                </Link>
                <span>•</span>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="text-terracotta uppercase tracking-wider font-semibold hover:underline"
                >
                  {t("header.joinArchive")}
                </Link>
              </div>
            )}
          </div>
          <div className="text-white/40 font-mono text-[11px]">
            sinacooks © {formatNum(currentYear)} •{" "}
            {t("footer.allRightsReserved")}
          </div>
        </div>
      </div>
    </>
  );
}
