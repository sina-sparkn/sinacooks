import React, { useRef, useLayoutEffect } from "react";
import { gsap, Flip, prefersReducedMotion } from "../lib/gsap.js";

interface RecipeGridProps {
  children: React.ReactNode;
  id?: string;
}

export function RecipeGrid({ children, id }: RecipeGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<any>(null);

  // Capture Flip layout state before DOM changes
  useLayoutEffect(() => {
    if (prefersReducedMotion() || !gridRef.current) return;
    const cards = gridRef.current.querySelectorAll(".recipe-card-reveal");
    if (cards.length > 0) {
      flipStateRef.current = Flip.getState(cards);
    }
  });

  // Animate Flip layout transition after children change
  useLayoutEffect(() => {
    if (prefersReducedMotion() || !gridRef.current || !flipStateRef.current)
      return;

    const cards = gridRef.current.querySelectorAll(".recipe-card-reveal");
    if (cards.length > 0) {
      Flip.from(flipStateRef.current, {
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.03,
        absolute: false,
        onEnter: (elements) =>
          gsap.fromTo(
            elements,
            { opacity: 0, y: 20, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" },
          ),
      });
    }
  }, [children]);

  return (
    <div
      ref={gridRef}
      id={id}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-7"
    >
      {children}
    </div>
  );
}
