# Repository Guidelines

## Project Structure & Module Organization

The React app lives in `ThomWeb/`; run project commands from that directory. Source files are under `ThomWeb/src/`. Routes are defined in `src/App.tsx`, pages in `src/Pages/`, reusable UI in `src/Components/`, API clients in `src/api/`, Redux slices in `src/Reducers/`, hooks in `src/Hooks/`, and shared copy/constants in `src/Assets/`. Theme tokens are in `src/index.css`; static assets are in `ThomWeb/public/`.

## Build, Test, and Development Commands

From `ThomWeb/`, use:

- `npm start` to run the local dev server with `.env.local`.
- `npm run start:production` to run locally with `.env.prd`.
- `npm run build` to create a production build.
- `npm run build:local` or `npm run build:production` to build with the matching env file.
- `npm run lint` to run ESLint over `src/**/*.ts` and `src/**/*.tsx`.
- `npm run typecheck` to run `tsc --noEmit`.
- `npm test` to start the CRA/Jest test runner.
- `npm run test:ci` to run tests once in CI mode.

## Coding Style & Naming Conventions

Use TypeScript in strict mode. Avoid `any`; type props, API payloads, and environment boundaries explicitly. Use functional React components only. Keep page-local loading, form, and error state local; reserve Redux for shared UI state.

Match existing casing: `Components`, `Pages`, `Hooks`, and `Reducers`. Prefer `.ts` for non-JSX files and `.tsx` for JSX. Use CSS Modules for local styles and tokens from `src/index.css` for colors, spacing, transitions, and theme-aware values.

## Testing Guidelines

Tests use CRA’s Jest setup through `react-scripts test`. Place tests near covered code and use names like `Component.test.tsx` or `photoClient.test.ts`. Prioritize route smoke tests, posts API behavior, photo listing normalization, and photo admin authorization. For route or data work, verify loading, empty, error, desktop, and mobile behavior.

## Commit & Pull Request Guidelines

Recent commits use short descriptive messages such as `homepage/header cleanup + env`. Keep commits focused and avoid mixing feature work with broad refactors.

Pull requests should include a concise summary, verification commands, linked issues when relevant, and screenshots or recordings for visual changes. Call out config changes, especially new `REACT_APP_*` variables, Firebase behavior, or Firestore rules.

## Security & Configuration

Keep fetch and Firebase access logic in `src/api/`; hidden UI is not security. Update `ThomWeb/.env.example` and `src/react-app-env.d.ts` when adding environment variables. If photo admin or auth behavior changes, update `firestore.rules` to match the intended access model.
