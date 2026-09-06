# Frontend - AGENTS.md

## Dev environment tips
- This project uses React, TypeScript, and Vite.
- Package manager is `npm`.
- Run `npm install` to install new dependencies.
- Run `npm run dev` to start the development server.

## Styling & Coding Conventions
- Use **Vanilla CSS** for styling (defined in `src/index.css`). Do NOT use TailwindCSS or external UI frameworks unless explicitly requested.
- Prioritize modern aesthetics: soft gradients, glassmorphism, hover effects, and micro-animations.
- **TypeScript Imports**: Use `import type { ... }` when importing TypeScript interfaces/types to prevent Vite (esbuild) compilation errors.
- All backend communication is centralized in `src/api/todoApi.ts` using `axios`.

## Testing & Linting
- After moving files or changing imports, run `npm run build` (or `tsc`) to verify that TypeScript compilation and Vite build succeed without type errors.
- Ensure no TypeScript errors exist in the files you modify before concluding the task.
