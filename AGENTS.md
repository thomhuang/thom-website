# Repository Guidelines

## Project Structure & Module Organization

The React app lives in `ThomWeb/`; run project commands from that directory. Source code is under `ThomWeb/src/`. Routes are defined in `src/App.tsx`, entry wiring in `src/index.tsx` and `src/store.tsx`, pages in `src/Pages/`, reusable UI in `src/Components/`, API clients in `src/api/`, Redux state in `src/Reducers/`, and shared copy/constants in `src/Assets/`. Global theme tokens and base styles live in `src/index.css`; component-local styles use CSS Modules such as `App.module.css`. Static public assets belong in `ThomWeb/public/`.

## Build, Test, and Development Commands

Run commands from `ThomWeb/`:

- `npm start` runs the local CRA dev server with `.env.local`.
- `npm run start:production` runs locally with `.env.prd`.
- `npm run build` creates a production build using the default environment.
- `npm run build:local` and `npm run build:production` build with the matching env file.
- `npm run lint` runs ESLint over `src/**/*.{ts,tsx}`.
- `npm run typecheck` runs `tsc --noEmit`.
- `npm test` starts the CRA/Jest test runner.

## Coding Style & Naming Conventions

Use TypeScript and functional React components. Avoid `any`; type component props, API responses, and environment boundaries explicitly. Keep page-specific loading, form, and error state local; use Redux only for shared UI state. Match existing directory casing (`Components`, `Pages`, `Reducers`, `Assets`) and prefer `.ts` for non-JSX files and `.tsx` for JSX. Use CSS Modules for local component styling and tokens from `src/index.css` for colors, spacing, transitions, and theme-aware values.

## Testing Guidelines

Tests use CRA’s Jest setup through `react-scripts test`. Place tests near the code they cover and name them like `Component.test.tsx` or `client.test.ts`. Prioritize route smoke tests, API-client behavior, loading states, empty states, errors, and responsive desktop/mobile rendering for user-facing changes.

## Commit & Pull Request Guidelines

Recent commits are short and descriptive, for example `homepage/header cleanup + env` or `refactors and cleanups, start of something new`. Keep commits focused and avoid mixing broad refactors with feature work. Pull requests should include a concise summary, verification commands, linked issues when relevant, and screenshots or recordings for visual changes.

## Security & Configuration Tips

Keep fetch and service-access logic in `src/api/`; hidden UI is not security. Update `ThomWeb/.env.example` and `src/react-app-env.d.ts` when adding `REACT_APP_*` variables. Do not commit secrets or production-only credentials.
