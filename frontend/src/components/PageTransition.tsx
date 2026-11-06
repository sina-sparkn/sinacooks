import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { gsap, prefersReducedMotion, ScrollTrigger } from "../lib/gsap.js";
import { useLenis } from "./useLenis.js";
import { PageTransitionContext } from "./page-transition-context.js";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { scrollTo } = useLenis();

  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const prevPathRef = useRef(location.pathname);
  const isTransitioningRef = useRef(false);

  // Transition-aware programmatic navigation
  const navigateWithTransition = useCallback(
    (to: string) => {
      if (prefersReducedMotion() || isTransitioningRef.current) {
        navigate(to);
        return;
      }

      const [targetPath] = to.split("?");
      // If navigating to the same path (e.g. query changes on /recipes), update immediately without page fade
      if (targetPath === location.pathname) {
        navigate(to);
        return;
      }

      isTransitioningRef.current = true;
      const container = containerRef.current;
      if (!container) {
        navigate(to);
        isTransitioningRef.current = false;
        return;
      }

      // Smooth editorial dissolve exit
      gsap.to(container, {
        opacity: 0,
        y: -6,
        duration: 0.18,
        ease: "power2.inOut",
        onComplete: () => {
          // Immediately reset scroll while invisible
          scrollTo(0, { immediate: true });
          window.scrollTo({ top: 0, left: 0, behavior: "instant" as any });
          navigate(to);
        },
      });
    },
    [location.pathname, navigate, scrollTo],
  );

  // Intercept all internal anchor clicks for seamless transition
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (e.defaultPrevented || isTransitioningRef.current) return;

      // Don't intercept clicks inside buttons or form controls
      const target = e.target as HTMLElement | null;
      if (!target || target.closest("button, input, select, textarea")) return;

      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore external links, mailto/tel, in-page hash links, target="_blank", or modifier clicks
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        anchor.target === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      let destUrl: URL;
      try {
        destUrl = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      // Origin check
      if (destUrl.origin !== window.location.origin) return;

      // Same-page hash navigation
      if (destUrl.pathname === window.location.pathname && destUrl.hash) return;

      // Same-path query changes (e.g. filter updates on /recipes)
      if (destUrl.pathname === window.location.pathname) {
        return;
      }

      // If reduced motion is requested, let React Router navigate immediately
      if (prefersReducedMotion()) {
        return;
      }

      // Prevent sudden page jump and run smooth exit transition
      e.preventDefault();
      navigateWithTransition(destUrl.pathname + destUrl.search);
    };

    window.addEventListener("click", handleGlobalClick, { capture: true });
    return () => {
      window.removeEventListener("click", handleGlobalClick, { capture: true });
    };
  }, [navigateWithTransition]);

  // Entrance animation whenever pathname changes
  useLayoutEffect(() => {
    // Skip on first visit so Preloader handles initial entrance
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (prevPathRef.current === location.pathname) {
      return;
    }
    prevPathRef.current = location.pathname;

    // Reset scroll to top synchronously
    scrollTo(0, { immediate: true });
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as any });

    if (prefersReducedMotion()) {
      isTransitioningRef.current = false;
      ScrollTrigger.refresh();
      return;
    }

    const container = containerRef.current;
    if (!container) {
      isTransitioningRef.current = false;
      return;
    }

    // Smooth editorial dissolve & gentle upward glide
    const tween = gsap.fromTo(
      container,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.28,
        ease: "power2.out",
        clearProps: "all",
        onComplete: () => {
          isTransitioningRef.current = false;
          ScrollTrigger.refresh();
        },
      },
    );

    return () => {
      tween.kill();
    };
  }, [location.pathname, scrollTo]);

  return (
    <PageTransitionContext.Provider value={{ navigateWithTransition }}>
      {/* Main Page Content Container */}
      <div ref={containerRef} className="w-full max-w-full">
        {children}
      </div>
    </PageTransitionContext.Provider>
  );
}
