import { useState, useEffect } from "react";
import { Outlet, useLocation, ScrollRestoration } from "react-router";
import { Header } from "./Header.js";
import { Footer } from "./Footer.js";
import { SmoothScroll } from "./SmoothScroll.js";
import { CustomCursor } from "./CustomCursor.js";
import { ScrollProgress } from "./ScrollProgress.js";
import { GrainOverlay } from "./GrainOverlay.js";
import { Preloader } from "./Preloader.js";
import { PageTransition } from "./PageTransition.js";
import { useLenis } from "./useLenis.js";
import { ScrollTrigger } from "../lib/gsap.js";

function ScrollToTop() {
  const { pathname } = useLocation();
  const { scrollTo } = useLenis();

  useEffect(() => {
    // Scroll to top immediately on route change
    scrollTo(0, { immediate: true });
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as any });

    // Refresh ScrollTrigger calculations after DOM paint
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname, scrollTo]);

  return null;
}

export function Layout() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  return (
    <SmoothScroll>
      <ScrollToTop />
      <ScrollRestoration />
      <Preloader onComplete={() => setPreloaderDone(true)} />
      <CustomCursor />
      <ScrollProgress />
      <GrainOverlay />
      <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-clip bg-[#FBF8F3] text-[#171513] relative selection:bg-terracotta selection:text-white transition-colors">
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-12 overflow-x-clip">
          <PageTransition>
            <Outlet context={{ preloaderDone }} />
          </PageTransition>
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
