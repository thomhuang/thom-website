# Repository Guidelines

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## Project Structure & Module Organization

The React app lives in `ThomWeb/`; run project commands from that directory. Source code is under `ThomWeb/src/`. Routes are defined in `src/App.tsx`, entry wiring in `src/index.tsx` and `src/store.tsx`, pages in `src/Pages/`, reusable UI in `src/Components/`, auth context in `src/Auth/`, API clients in `src/api/`, Redux state in `src/Reducers/`, and shared copy/constants in `src/Assets/`. Global theme tokens, font-face declarations, and base styles live in `src/index.css`; font files live in `src/Fonts/`; component-local styles use CSS Modules such as `App.module.css`. Static public assets, including post images and documents, belong in `ThomWeb/public/`.

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

Use TypeScript and functional React components. Avoid `any`; type component props, API responses, and environment boundaries explicitly. Keep page-specific loading, form, and error state local; use Redux only for shared UI state. Use `src/Auth/` for shared authentication state. Match existing directory casing (`Auth`, `Components`, `Pages`, `Reducers`, `Assets`) and prefer `.ts` for non-JSX files and `.tsx` for JSX. Use CSS Modules for local component styling and tokens from `src/index.css` for colors, spacing, typography, transitions, and theme-aware values.

## Testing Guidelines

Tests use CRA’s Jest setup through `react-scripts test`. Place tests near the code they cover and name them like `Component.test.tsx` or `client.test.ts`. Prioritize route smoke tests, API-client behavior, loading states, empty states, errors, and responsive desktop/mobile rendering for user-facing changes.

## Commit & Pull Request Guidelines

Recent commits are short and descriptive, for example `homepage/header cleanup + env` or `refactors and cleanups, start of something new`. Keep commits focused and avoid mixing broad refactors with feature work. Pull requests should include a concise summary, verification commands, linked issues when relevant, and screenshots or recordings for visual changes.

## Security & Configuration Tips

Keep fetch and service-access logic in `src/api/`; hidden UI is not security. Current public env variables are `REACT_APP_API_URL` and `REACT_APP_MODE`. Update `ThomWeb/.env.example` and `src/react-app-env.d.ts` when adding `REACT_APP_*` variables. Do not commit secrets or production-only credentials.
