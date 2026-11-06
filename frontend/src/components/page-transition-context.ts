import { createContext, useContext } from "react";

export interface PageTransitionContextValue {
  navigateWithTransition: (to: string) => void;
}

export const PageTransitionContext = createContext<PageTransitionContextValue>({
  navigateWithTransition: () => {},
});

export function usePageTransition() {
  return useContext(PageTransitionContext);
}
