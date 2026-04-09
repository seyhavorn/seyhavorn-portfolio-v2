# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # Type-check with vue-tsc, then build
npm run preview   # Preview production build locally
```

No linter or test runner is configured. TypeScript strict mode (`vue-tsc`) serves as the primary code quality gate.

## Architecture

**Stack:** Vue 3 (Composition API, `<script setup>`) + TypeScript + Vite + Tailwind CSS 4 + Vue Router 4. Deployed on Vercel.

### Data Layer

All CV content lives in a single file: `src/data/cv.ts`. This is the source of truth for personal info, experience, projects, skills, and certifications. Components are purely presentational — they import from `cvData` and never hardcode content. Two utility functions live there: `calcDuration()` and `formatPeriod()` for date formatting.

**When updating portfolio content, only edit `src/data/cv.ts`.**

### Component Structure

- `src/pages/PortfolioV2.vue` — active production page (route `/`), assembles `v2/Landing*` components
- `src/pages/PortfolioV1.vue` — legacy compact CV card (route `/v1`)
- `src/components/v2/` — nine section components: `LandingNavbar`, `LandingHero`, `LandingAbout`, `LandingServices`, `LandingSkills`, `LandingExperience`, `LandingProjects`, `LandingContact`, `LandingFooter`
- `src/components/Cv*.vue` — old V1 components

### Routing

Defined in `src/router/index.ts`. Custom scroll behavior: smooth within-app navigation, instant on page refresh, with hash anchor support.

### Styling

- Dark-first design using CSS custom properties defined in `src/style.css` (background, text, borders, accent colors)
- Animated gradient blobs are in `App.vue` (root layout)
- Glassmorphism cards use backdrop blur + semi-transparent backgrounds
- Tailwind is integrated via `@tailwindcss/vite` plugin (no `tailwind.config.js` needed)
- Fixed radial gradient background avoids `background-attachment: fixed` to prevent iOS Safari lag

### Vite Config Note

`vite.config.ts` includes an ngrok allowlist for external dev tunneling (`allowedHosts`).
