import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Scroll triggers measure element positions when they are created. After a
// client-side page swap (<ClientRouter />) the islands mount while the new
// page is still settling, so those measurements can be wrong and reveals
// never fire (sections stay blank). Re-measure once things have settled.
let refreshTimer = 0;

/** Debounced ScrollTrigger.refresh(); safe to call from every component. */
export function refreshScrollTriggers(delay = 120) {
  if (typeof window === "undefined") return;
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), delay);
}

if (typeof window !== "undefined") {
  // After every navigation (first load and each client-side swap)…
  document.addEventListener("astro:page-load", () => refreshScrollTriggers());
  // …after images/fonts finish loading (they change section heights)…
  window.addEventListener("load", () => refreshScrollTriggers());
  if (document.fonts?.ready) document.fonts.ready.then(() => refreshScrollTriggers());
}

export { gsap, ScrollTrigger };
