# Opencode Agent Instructions

## Project Overview
- **Project**: Professional Portfolio
- **Stack**: Vue 3, TypeScript, Vite, Tailwind CSS 4, Vue Router 4
- **Content Store**: `src/data/cv.ts` (The single source of truth for all CV data)

## Development Guidelines
- **Data Updates**: ALL content changes (experience, skills, projects) must be made in `src/data/cv.ts`. Do not hardcode text in `.vue` components.
- **Component Patterns**: Components in `src/components/v2/` are presentational; they simply render data passed from `PortfolioV2.vue`.
- **Styling**: Use Tailwind CSS 4. Prefer CSS variables defined in `src/style.css` for consistent branding.

## Quality Gates
- **Linting**: Run `npm run lint` (if available) before completing any task.
- **Testing**: Verify UI changes by running the development server and checking `PortfolioV2.vue`.

## Common Commands
- Run dev server: `npm run dev`
- Build project: `npm run build`
