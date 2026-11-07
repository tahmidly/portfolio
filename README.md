# Alex Sinyo — Portfolio (React)

The original single-file `index.html` has been converted into a Vite + React
project, split into one component per page section.

The untouched original is kept at [`legacy/index.html`](legacy/index.html) for
reference.

## Commands

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Structure

```
index.html                     Vite entry (fonts only)
src/
  main.jsx                     React root
  App.jsx                      Page composition
  styles/base.css              Reset, variables, keyframes, shared utilities
  data/portfolio.js            Content for every section
  lib/gsap.js                  GSAP + ScrollTrigger registration
  hooks/useHlsVideo.js         Shared HLS background-video setup
  components/
    Navbar.jsx/.css            Fixed pill navigation, scroll + active state
    Hero.jsx/.css              Background video, role cycling, entrance animation
    SectionHeader.jsx/.css     Reusable eyebrow/heading/subtitle block
    Reveal.jsx                 Reusable scroll-reveal wrapper
    SelectedWorks.jsx/.css     Bento project grid
    Journal.jsx/.css           Article list
    Explorations.jsx/.css      Sticky section with parallax gallery
    Stats.jsx/.css             Animated statistics row
    Contact.jsx/.css           Footer video, marquee, contact CTA
```

## UI tooling

- Tailwind CSS v4 (`@tailwindcss/vite`) with shadcn configured in `components.json`.
- Path alias `@/*` → `src/*` (Vite + `jsconfig.json`), `cn()` helper in `src/lib/utils.js`.
- Magic UI components installed: `ShimmerButton` and `ShineBorder` under `src/components/ui/`.
- Theme accent is electric cyan `#1BCCFE`, exposed as `--accent` and mapped to
  shadcn's `--primary` / `--accent` / `--ring` tokens.

## Notes

- GSAP, ScrollTrigger and hls.js are now installed from npm instead of CDN.
- The loading screen was removed; the hero entrance animation now runs on mount.
- Hero entrance, scroll reveals, parallax, marquee and stat animations were
  ported from the original inline script into scoped React effects.
- All section markup, class names, copy and imagery match the original.
