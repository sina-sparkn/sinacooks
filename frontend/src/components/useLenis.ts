import { useContext } from "react";
import { LenisContext } from "./lenis-context-def.js";

export const useLenis = () => useContext(LenisContext);
