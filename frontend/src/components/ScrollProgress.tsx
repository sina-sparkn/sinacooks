import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../lib/gsap.js";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const trigger = ScrollTrigger.create({
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        gsap.to(bar, {
          scaleX: self.progress,
          duration: 0.1,
          ease: "none",
          overwrite: "auto",
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <div
      id="scroll-progress"
      className="fixed top-0 left-0 right-0 h-[2.5px] z-50 pointer-events-none bg-black/5"
      aria-hidden="true"
    >
      <div
        ref={barRef}
        className="h-full w-full bg-gradient-to-r rtl:bg-gradient-to-l from-terracotta via-amber-600 to-terracotta origin-left rtl:origin-right scale-x-0"
      />
    </div>
  );
}
