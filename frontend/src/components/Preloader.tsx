import { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap.js";
import { useLenis } from "./useLenis.js";
import {
  useTranslation,
  toPersianDigits,
} from "../features/i18n/I18nContext.js";

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const { isRTL } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const { stopScroll, startScroll } = useLenis();

  const [isDone, setIsDone] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return Boolean(sessionStorage.getItem("sinacooks_intro_seen"));
  });

  useEffect(() => {
    if (isDone) {
      onComplete();
      return;
    }

    stopScroll();
    document.body.style.overflow = "hidden";

    const counterEl = counterRef.current;
    const titleEl = titleRef.current;
    const subtitleEl = subtitleRef.current;
    const containerEl = containerRef.current;
    const ringEl = ringRef.current;

    const progressObj = { value: 0 };

    // Entrance timeline
    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem("sinacooks_intro_seen", "true");
        startScroll();
        document.body.style.overflow = "";
        setIsDone(true);
        onComplete();
      },
    });

    // Reveal brand text
    tl.to(titleEl, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
    });

    tl.to(
      subtitleEl,
      {
        opacity: 0.8,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
      },
      "-=0.4",
    );

    // Animate counter from 0 to 100 with minimum 2.0s duration
    tl.to(
      progressObj,
      {
        value: 100,
        duration: 2.2,
        ease: "power2.inOut",
        onUpdate: () => {
          const val = Math.round(progressObj.value);
          if (counterEl) {
            const raw = val < 10 ? `0${val}` : `${val}`;
            counterEl.textContent = isRTL ? toPersianDigits(raw) : raw;
          }
          if (ringEl) {
            const circumference = 2 * Math.PI * 40; // r=40
            const offset = circumference - (val / 100) * circumference;
            ringEl.style.strokeDashoffset = `${offset}`;
          }
        },
      },
      "-=0.5",
    );

    // Plate iris clip-path reveal exit
    tl.to(
      containerEl,
      {
        clipPath: "circle(0% at 50% 50%)",
        duration: 1.1,
        ease: "power4.inOut",
      },
      "+=0.2",
    );

    return () => {
      tl.kill();
      document.body.style.overflow = "";
      startScroll();
    };
  }, [isDone, onComplete, startScroll, stopScroll, isRTL]);

  if (isDone) return null;

  return (
    <div
      ref={containerRef}
      id="preloader"
      className="fixed inset-0 z-[9999] bg-[#171513] text-[#FBF8F3] flex flex-col items-center justify-center p-6 select-none"
      style={{ clipPath: "circle(150% at 50% 50%)" }}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative flex flex-col items-center max-w-md text-center space-y-6">
        {/* Circular Plate Gauge */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg
            className="w-full h-full -rotate-90 transform"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              className="stroke-white/10"
              strokeWidth="2.5"
              fill="transparent"
            />
            <circle
              ref={ringRef}
              cx="50"
              cy="50"
              r="40"
              className="stroke-terracotta"
              strokeWidth="2.5"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-mono text-2xl font-semibold tracking-wider text-white">
            <span ref={counterRef}>{isRTL ? "۰۰" : "00"}</span>
            <span className="text-xs text-white/50 ms-0.5">%</span>
          </div>
        </div>

        {/* Brand Headline Reveal */}
        <div className="space-y-2 overflow-hidden">
          <h1
            ref={titleRef}
            className="font-serif text-4xl sm:text-5xl font-normal tracking-wide text-white opacity-0 translate-y-6"
          >
            sinacooks
          </h1>
          <p
            ref={subtitleRef}
            className="font-mono text-xs tracking-widest text-[#E8E2D8]/70 uppercase opacity-0 translate-y-4"
          >
            {isRTL
              ? "آرشیو آشپزی و مجله مونوگراف"
              : "Culinary Archive & Gastronomy Journal"}
          </p>
        </div>
      </div>

      {/* Editorial Bottom Badge */}
      <div className="absolute bottom-8 left-0 right-0 text-center font-mono text-[11px] tracking-widest text-white/40 uppercase">
        {isRTL
          ? "نسخه ۲۰۲۶ • دستورهای برگزیده دست‌چین"
          : "Edition 2026 • Handcrafted Recipes"}
      </div>
    </div>
  );
}
