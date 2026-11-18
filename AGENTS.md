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

## Project Structure & Commands

Single Vite + React + TypeScript app backed by `thom-server`. Entry wiring is in `src/index.tsx` and routes in `src/App.tsx` (route constants in `src/Assets/constants.tsx`); pages live in `src/Pages/<Domain>/`, reusable UI in `src/Components/`, auth state in `src/Auth/AuthContext.tsx`, typed axios clients and DTOs in `src/api/<Domain>/` (`src/api/config.ts` defaults to `http://localhost:4000` in dev and `/api` in prod), shared hooks in `src/hooks.tsx` and `src/useAsync.ts`, and design tokens/base styles in `src/index.css` with component-local `*.module.css`. Static assets and Cloudflare headers (`public/_headers`) live in `public/`, fronted by `worker/index.js`.

- `npm start`: Vite dev server on `http://localhost:3000`.
- `npm run typecheck && npm run lint && npx vitest run`: non-interactive verification check (`npm test` runs Vitest watch mode).
- `npm run build`: production bundle into `dist/`.
- `npx wrangler deploy` (production `thom-website`) / `npx wrangler deploy -c wrangler.test.jsonc` (test `thom-website-test`).

## Coding Style & Data-Fetching Conventions

Use TypeScript with functional React components. Avoid `any`; type component props, API responses, and environment boundaries explicitly. Keep page-specific loading, form, and error state local; shared state belongs in dedicated context modules (`AuthContext`, `CartContext`). Style with CSS Modules and existing tokens from `src/index.css`. Match surrounding casing, quotes, and structure, and keep comments to clarifying non-obvious behavior.

- **Read-only data loads:** use `useAsync` (`src/useAsync.ts`) rather than ad-hoc `useEffect` fetch chains. Exceptions are effects that seed editable local form drafts (`BlogPostForm`, `ShopItemForm`, `useCoffeeEntryLoader`) or merge fetched lookups into local state (`useCoffeeLookup`).
- **Derived & pagination state:** do not sync derived state in `useEffect` — reset pages inside filter/sort change handlers and clamp page bounds during render.

## Edge Proxy, Caching & Security

- **Same-origin `/api/*` proxy (`worker/index.js`):** forwards `/api/*` to `thom-server` over a Cloudflare service binding so `__Host-` auth cookies stay first-party. Anonymous `GET`s on allowlisted public paths use the Worker Cache API, while any request carrying a `Cookie` header bypasses the cache so admin edits appear immediately.
- **CSP (`public/_headers`):** `img-src` (`https://img.thomhuang.com`, `https://*.r2.dev`) and `connect-src` (`https://*.r2.cloudflarestorage.com`) must match R2 buckets/domains or browser image loads and presigned PUT uploads break.
- **Secrets & env:** never commit secrets or put them in `VITE_*` variables (embedded in the client bundle). Keep network calls inside `src/api/`; hidden UI (`useAuth().isAdmin`) is not security. Treat real `.env*` and `.dev.vars*` files as off-limits for reading or printing; read `.env.example` for shape.

## Testing, Committing & Cross-Repo Contract

Write colocated `*.test.tsx` / `*.test.ts` tests (Vitest + React Testing Library). Prioritize route smoke tests, API-client behavior, loading/empty/error states, and responsive breakpoints. Run `npm run typecheck && npm run lint && npx vitest run` before declaring work done. Keep commits short, lowercase, and focused (e.g., `fix(coffee): center brew pager chevrons with inline SVG`).

- **Paired backend (`thom-server`):** DTOs in `src/api/<Domain>/` mirror `thom-server/internal/server/<domain>` manually (no codegen). Deploy additive server schema/routes before website callers. Production deploys via Workers Builds from `release` (`git push origin main:release`); check unpromoted commits in both repos with `git log --oneline origin/release..origin/main`.

## Domain Reference Skills

Detailed UI and domain conventions for Blog, Shop, and Coffee live in `.agents/skills/website-domains/SKILL.md` (loaded on demand when working in `src/Pages/` or `src/api/`).
