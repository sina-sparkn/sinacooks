import { createContext } from "react";
import type Lenis from "lenis";

export interface LenisContextValue {
  getLenis: () => Lenis | null;
  stopScroll: () => void;
  startScroll: () => void;
  scrollTo: (
    target: string | number | HTMLElement,
    options?: Record<string, any>,
  ) => void;
}

export const LenisContext = createContext<LenisContextValue>({
  getLenis: () => null,
  stopScroll: () => {},
  startScroll: () => {},
  scrollTo: () => {},
});
