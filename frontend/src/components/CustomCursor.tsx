import { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap.js";
import { useTranslation } from "../features/i18n/I18nContext.js";

export function CustomCursor() {
  const { isRTL } = useTranslation();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const currentCursorStateRef = useRef<
    "default" | "link" | "recipe" | "scroll" | "drag" | "favorite"
  >("default");

  const [enabled] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  });

  useEffect(() => {
    if (!enabled) return;

    document.body.classList.add("custom-cursor-active");

    const dot = dotRef.current;
    const ring = ringRef.current;
    const text = textRef.current;
    if (!dot || !ring || !text) return;

    // Center elements on coordinates
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    const xDotTo = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3" });
    const yDotTo = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3" });

    const xRingTo = gsap.quickTo(ring, "x", {
      duration: 0.35,
      ease: "power3.out",
    });
    const yRingTo = gsap.quickTo(ring, "y", {
      duration: 0.35,
      ease: "power3.out",
    });

    const onMouseMove = (e: MouseEvent) => {
      xDotTo(e.clientX);
      yDotTo(e.clientY);
      xRingTo(e.clientX);
      yRingTo(e.clientY);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const favoriteTarget = target.closest<HTMLElement>(
        '[data-cursor="favorite"]',
      );
      const recipeTarget = target.closest('[data-cursor="recipe"]');
      const scrollTarget =
        target.closest('[data-cursor="scroll"]') ||
        target.closest('[data-cursor="drag"]');
      const interactiveTarget = target.closest(
        'a, button, [role="button"], input, select, textarea',
      );

      if (favoriteTarget) {
        const fallbackFavorite = isRTL ? "نشان کردن" : "Add to Favorite";
        const favoriteText =
          favoriteTarget.getAttribute("data-cursor-text") || fallbackFavorite;
        if (
          currentCursorStateRef.current !== "favorite" ||
          text.textContent !== favoriteText
        ) {
          currentCursorStateRef.current = "favorite";
          gsap.to(dot, { opacity: 0, scale: 0, duration: 0.2 });
          gsap.to(ring, {
            width: isRTL ? 120 : 144,
            height: 38,
            borderRadius: 9999,
            backgroundColor: "#c8522c",
            borderColor: "#c8522c",
            mixBlendMode: "normal",
            duration: 0.25,
            ease: "power2.out",
          });
          text.textContent = favoriteText;
          gsap.to(text, { opacity: 1, scale: 1, duration: 0.2, delay: 0.05 });
        }
      } else if (recipeTarget) {
        const viewText = isRTL ? "مشاهده دستور" : "View Recipe";
        if (currentCursorStateRef.current !== "recipe") {
          currentCursorStateRef.current = "recipe";
          gsap.to(dot, { opacity: 0, scale: 0, duration: 0.2 });
          gsap.to(ring, {
            width: isRTL ? 116 : 104,
            height: 38,
            borderRadius: 9999,
            backgroundColor: "#c8522c",
            borderColor: "#c8522c",
            mixBlendMode: "normal",
            duration: 0.25,
            ease: "power2.out",
          });
          text.textContent = viewText;
          gsap.to(text, { opacity: 1, scale: 1, duration: 0.2, delay: 0.05 });
        }
      } else if (scrollTarget) {
        const scrollText = isRTL ? "پیمایش" : "Scroll";
        if (currentCursorStateRef.current !== "scroll") {
          currentCursorStateRef.current = "scroll";
          gsap.to(dot, { opacity: 0, scale: 0, duration: 0.2 });
          gsap.to(ring, {
            width: isRTL ? 88 : 84,
            height: 36,
            borderRadius: 9999,
            backgroundColor: "#c8522c",
            borderColor: "#c8522c",
            mixBlendMode: "normal",
            duration: 0.25,
            ease: "power2.out",
          });
          text.textContent = scrollText;
          gsap.to(text, { opacity: 1, scale: 1, duration: 0.2, delay: 0.05 });
        }
      } else if (interactiveTarget) {
        if (currentCursorStateRef.current !== "link") {
          currentCursorStateRef.current = "link";
          text.textContent = "";
          gsap.to(text, { opacity: 0, scale: 0.5, duration: 0.15 });
          gsap.to(dot, { opacity: 1, scale: 1.5, duration: 0.2 });
          gsap.to(ring, {
            width: 52,
            height: 52,
            borderRadius: "50%",
            backgroundColor: "rgba(200, 82, 44, 0.12)",
            borderColor: "#c8522c",
            mixBlendMode: "normal",
            duration: 0.25,
            ease: "power2.out",
          });
        }
      } else {
        if (currentCursorStateRef.current !== "default") {
          currentCursorStateRef.current = "default";
          text.textContent = "";
          gsap.to(text, { opacity: 0, scale: 0.5, duration: 0.15 });
          gsap.to(dot, { opacity: 1, scale: 1, duration: 0.2 });
          gsap.to(ring, {
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "transparent",
            borderColor: "#171513",
            mixBlendMode: "difference",
            duration: 0.25,
            ease: "power2.out",
          });
        }
      }
    };

    // Magnetic effect on elements with [data-magnetic]
    const handleMagneticMove = (e: MouseEvent) => {
      const magneticEl = (e.target as HTMLElement)?.closest(
        "[data-magnetic]",
      ) as HTMLElement | null;
      if (!magneticEl) return;

      const rect = magneticEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * 0.35;
      const deltaY = (e.clientY - centerY) * 0.35;

      gsap.to(magneticEl, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const handleMagneticLeave = (e: MouseEvent) => {
      const magneticEl = (e.target as HTMLElement)?.closest(
        "[data-magnetic]",
      ) as HTMLElement | null;
      if (!magneticEl) return;

      gsap.to(magneticEl, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.4)",
        overwrite: "auto",
      });
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousemove", handleMagneticMove, { passive: true });
    window.addEventListener("mouseout", handleMagneticLeave, { passive: true });

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousemove", handleMagneticMove);
      window.removeEventListener("mouseout", handleMagneticLeave);
    };
  }, [enabled, isRTL]);

  if (!enabled) return null;

  return (
    <div
      id="custom-cursor"
      className="pointer-events-none fixed inset-0 z-[99999]"
      aria-hidden="true"
    >
      {/* Center dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-terracotta -translate-x-1/2 -translate-y-1/2"
      />
      {/* Trailing physics ring & badge */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-ink/40 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-white font-sans text-[11px] font-semibold tracking-wider uppercase px-2 shadow-sm transition-opacity"
      >
        <span
          ref={textRef}
          className="opacity-0 scale-50 transition-none select-none whitespace-nowrap"
        />
      </div>
    </div>
  );
}
