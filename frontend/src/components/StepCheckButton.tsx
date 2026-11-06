import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "../lib/gsap.js";
import { useTranslation } from "../features/i18n/I18nContext.js";

interface StepCheckButtonProps {
  isDone: boolean;
  onToggle: () => void;
  stepNumber: number;
  className?: string;
}

export function StepCheckButton({
  isDone,
  onToggle,
  stepNumber,
  className = "",
}: StepCheckButtonProps) {
  const { t } = useTranslation();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const circleRef = useRef<HTMLSpanElement>(null);
  const checkPathRef = useRef<SVGPathElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const particleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isFirstRender = useRef(true);

  // Handle initial setup and subsequent GSAP micro-animations on completion change
  useEffect(() => {
    const button = buttonRef.current;
    const circle = circleRef.current;
    const path = checkPathRef.current;
    const ripple = rippleRef.current;
    const text = textRef.current;

    if (!button || !circle || !path) return;

    const pathLength = path.getTotalLength ? path.getTotalLength() : 20;
    const length = pathLength > 0 ? pathLength : 20;

    // Initial mount: set exact stroke values without animating
    if (isFirstRender.current) {
      isFirstRender.current = false;
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: isDone ? 0 : length,
        opacity: isDone ? 1 : 0,
      });
      return;
    }

    // Kill any in-flight timeline to avoid overlapping conflicts
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const reducedMotion = prefersReducedMotion();

    if (reducedMotion) {
      // Instant / accessible transition for users preferring reduced motion
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: isDone ? 0 : length,
        opacity: isDone ? 1 : 0,
      });
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
    });
    timelineRef.current = tl;

    if (isDone) {
      // 1. Tactile button bounce & spring
      tl.to(button, {
        scale: 0.93,
        duration: 0.1,
        ease: "power2.inOut",
      })
        .to(button, {
          scale: 1.08,
          duration: 0.18,
          ease: "back.out(2.5)",
        })
        .to(
          button,
          {
            scale: 1,
            duration: 0.22,
            ease: "power2.out",
          },
          "-=0.06",
        );

      // 2. Check circle pop with slight energetic rotation
      tl.fromTo(
        circle,
        { scale: 0.55, rotate: -25 },
        { scale: 1, rotate: 0, duration: 0.32, ease: "back.out(2.2)" },
        "<0.04",
      );

      // 3. SVG checkmark path drawing (stroke-dashoffset signature animation)
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
        opacity: 1,
      });

      tl.to(
        path,
        {
          strokeDashoffset: 0,
          duration: 0.24,
          ease: "power2.out",
        },
        "<0.08",
      );

      // 4. Expanding ripple wave
      if (ripple) {
        tl.fromTo(
          ripple,
          { scale: 1, opacity: 0.8 },
          { scale: 1.85, opacity: 0, duration: 0.45, ease: "power2.out" },
          "<",
        );
      }

      // 5. Sparkle celebration particles bursting outward
      const validParticles = particleRefs.current.filter(
        (p): p is HTMLSpanElement => Boolean(p),
      );
      if (validParticles.length > 0) {
        validParticles.forEach((particle, idx) => {
          const angle = (idx / validParticles.length) * Math.PI * 2;
          const distance = 14 + (idx % 2 === 0 ? 5 : 2);
          const dx = Math.cos(angle) * distance;
          const dy = Math.sin(angle) * distance;

          tl.fromTo(
            particle,
            { x: 0, y: 0, scale: 0.8, opacity: 1 },
            {
              x: dx,
              y: dy,
              scale: 0,
              opacity: 0,
              duration: 0.4,
              ease: "power2.out",
            },
            "<",
          );
        });
      }

      // 6. Smooth text fade / slide
      if (text) {
        tl.fromTo(
          text,
          { y: 3, opacity: 0.2 },
          { y: 0, opacity: 1, duration: 0.22, ease: "power2.out" },
          "<0.05",
        );
      }
    } else {
      // Uncheck transition
      tl.to(path, {
        strokeDashoffset: length,
        opacity: 0,
        duration: 0.16,
        ease: "power2.in",
      })
        .to(
          circle,
          {
            scale: 0.85,
            duration: 0.1,
            ease: "power1.in",
          },
          "<",
        )
        .to(circle, {
          scale: 1,
          duration: 0.2,
          ease: "back.out(1.5)",
        })
        .to(
          button,
          {
            scale: 1,
            duration: 0.2,
          },
          "<",
        );

      if (text) {
        tl.fromTo(
          text,
          { y: -3, opacity: 0.2 },
          { y: 0, opacity: 1, duration: 0.2, ease: "power2.out" },
          "<",
        );
      }
    }

    return () => {
      tl.kill();
    };
  }, [isDone]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      role="checkbox"
      aria-checked={isDone}
      aria-label={`Mark step ${stepNumber} as ${isDone ? "incomplete" : "complete"}`}
      onClick={handleClick}
      className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all duration-200 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 hover:scale-[1.02] active:scale-95 ${
        isDone
          ? "bg-sage text-white border border-sage shadow-[0_2px_8px_rgba(45,71,57,0.22)] hover:bg-sage-dark hover:border-sage-dark"
          : "bg-sand/30 hover:bg-sand/60 text-stone-600 hover:text-stone-900 border border-stone-200/90 hover:border-sage/40"
      } ${className}`}
    >
      {/* Checkbox Icon Container with Ripple and Burst */}
      <span className="relative flex items-center justify-center shrink-0">
        {/* Expanding ripple ring */}
        <span
          ref={rippleRef}
          className="absolute inset-0 rounded-full border-2 border-sage pointer-events-none opacity-0"
          aria-hidden="true"
        />

        {/* Micro sparkle burst dots */}
        <span
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              ref={(el) => {
                particleRefs.current[i] = el;
              }}
              className={`absolute w-1 h-1 rounded-full opacity-0 pointer-events-none ${
                i % 2 === 0 ? "bg-terracotta" : "bg-sage"
              }`}
            />
          ))}
        </span>

        {/* Circular Check Indicator */}
        <span
          ref={circleRef}
          className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${
            isDone
              ? "bg-white text-sage shadow-xs"
              : "border-1.5 border-stone-400/90 bg-white group-hover:border-sage"
          }`}
        >
          <svg
            className="w-2.5 h-2.5"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              ref={checkPathRef}
              d="M2.5 6.2L4.8 8.5L9.5 3.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>

      {/* Button Text Label */}
      <span
        ref={textRef}
        className="font-mono text-xs font-semibold tracking-wide"
      >
        {isDone ? t("recipeDetail.stepDone") : t("recipeDetail.markStepDone")}
      </span>
    </button>
  );
}
