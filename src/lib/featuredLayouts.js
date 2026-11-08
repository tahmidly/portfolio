// Home page "Selected work" grid layouts (3 slots on a 12-column grid).
// Shared by the site and the studio. `spans[i]` is the width of slot i.

export const FEATURED_LAYOUTS = [
  { key: "feature-left", label: "Big left", spans: [7, 5, 12] },
  { key: "feature-right", label: "Big right", spans: [5, 7, 12] },
  { key: "wide-top", label: "Wide top", spans: [12, 7, 5] },
  { key: "even", label: "Three columns", spans: [4, 4, 4] },
];

export const DEFAULT_LAYOUT = FEATURED_LAYOUTS[0].key;

export function layoutFor(key) {
  return FEATURED_LAYOUTS.find((layout) => layout.key === key) || FEATURED_LAYOUTS[0];
}

/** CSS class for a slot width (see .bento-col-* in SelectedWorks.css). */
export const spanClass = (span) => `bento-col-${span}`;
