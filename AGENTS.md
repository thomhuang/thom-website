# Repository Guidelines

## Session board

Concurrent agent sessions working under `D:\Repos` log status to
`D:\Repos\BOARD.md`. **Read it before starting work**, and when you stop, append
an entry above the END sentinel using `edit` (never `write`, which replaces the
whole file). It is a shared live log, not a lock, and the repos remain the
source of truth.

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

The React app lives in `ThomWeb/`; run app commands from that directory. Source code is under `ThomWeb/src/`. Routes are defined in `src/App.tsx`, entry wiring in `src/index.tsx`, shared hooks in `src/hooks.tsx`, pages in `src/Pages/`, reusable UI in `src/Components/`, auth context in `src/Auth/`, API clients in `src/api/`, and shared copy/constants in `src/Assets/`. Global theme tokens, font-face declarations, and base styles live in `src/index.css`; font files live in `src/Fonts/`; component-local styles use CSS Modules such as `App.module.css`. Static public assets such as documents belong in `ThomWeb/public/`. Deployment lives at the repo root: `wrangler.jsonc`, `worker/index.js`, and `package.json` serve `ThomWeb/build` as static assets and proxy `/api/*` to the matching `thom-server`/`thom-server-test` Worker. See `CLOUDFLARE.md`.

## Build, Test, and Development Commands

Run app commands from `ThomWeb/`:

- `npm start` runs the local CRA dev server; the API base defaults to `http://localhost:4000`.
- `npm run build` creates a production build; the API base defaults to `/api`.
- `npm run lint` runs ESLint over `src/**/*.{ts,tsx}`.
- `npm run typecheck` runs `tsc --noEmit`.
- `npm test` starts the CRA/Jest test runner.

The API base URL lives in `ThomWeb/src/api/config.ts`. `REACT_APP_API_URL`
overrides it; otherwise development uses `http://localhost:4000` and everything
else uses `/api`. No `.env` file is required or committed.

Run deploy commands from the repo root:

- `npm run build` builds `ThomWeb/` into `ThomWeb/build`.
- `npx wrangler deploy` deploys the Worker and its static assets. See `CLOUDFLARE.md`.
- `npx wrangler deploy -c wrangler.test.jsonc` deploys the test Worker (`thom-website-test`).

## Coding Style & Naming Conventions

Use TypeScript and functional React components. Avoid `any`; type component props, API responses, and environment boundaries explicitly. Keep page-specific loading, form, and error state local; use `src/Auth/` for shared authentication state and `src/hooks.tsx` for shared hooks. Match existing directory casing (`api`, `Assets`, `Auth`, `Components`, `Fonts`, `Pages`) and prefer `.ts` for non-JSX files and `.tsx` for JSX. Use CSS Modules for local component styling and tokens from `src/index.css` for colors, spacing, typography, transitions, and theme-aware values.

## Testing Guidelines

Tests use CRA’s Jest setup through `react-scripts test`. Place tests near the code they cover and name them like `Component.test.tsx` or `client.test.ts`. Prioritize route smoke tests, API-client behavior, loading states, empty states, errors, and responsive desktop/mobile rendering for user-facing changes.

## Commit & Pull Request Guidelines

Recent commits are short and descriptive, for example `homepage/header cleanup + env` or `refactors and cleanups, start of something new`. Keep commits focused and avoid mixing broad refactors with feature work. Pull requests should include a concise summary, verification commands, linked issues when relevant, and screenshots or recordings for visual changes.

## Security & Configuration Tips

Keep fetch and service-access logic in `src/api/`; hidden UI is not security. The only public build-time variable is `REACT_APP_API_URL`; it defaults to `/api` in production, which the Worker proxies to `thom-server` on the same origin so auth cookies stay first-party. Update `ThomWeb/.env.example`, `src/api/config.ts`, and `src/react-app-env.d.ts` when adding `REACT_APP_*` variables. `REACT_APP_*` values are embedded in the bundle and must never contain secrets.

Local `.env*` and `.dev.vars*` files (except the committed `.example` files) are gitignored and denied to the `read` tool via global OpenCode permissions. Do not work around that with `grep` or shell commands — a pattern match prints the value into the transcript. Read the `.example` files for the shape of the config instead.

## Outstanding work — deployment & shop (2026-09-18)

The storefront, admin listing form, brand/grinder filters, listing sort, and admin
orders page are committed (`main` == `origin/main` == `b880460`) and verified
(`npm run typecheck`, `npm run lint`, `npm run build`). Live deploy state lives in
`D:\Repos\BOARD.md`; this section only records durable gotchas.

- **Garment measurements.** `GET /shop/items/{id}` returns `pitToPitInches`,
  `backLengthInches`, and `shoulderInches` (numbers, in **inches**, `0` meaning
  "not provided"). They are accepted on create and update. `GET /shop/items`
  summaries do **not** include them. See the `thom-server` `AGENTS.md` for the
  full field spec.

  UI: the admin form (`ShopItemForm.tsx`) has optional inch inputs (0–100,
  blank = not provided); the listing detail page (`ShopItem.tsx`) renders a
  measurements table with an in/cm toggle. Conversion lives in
  `formatMeasurement` (`format.ts`): `inches * 2.54`, one decimal. Rows with a
  `0`/absent value are hidden. The chosen unit persists in `localStorage` under
  `shop-measurement-unit`; default is inches.
- **Two environments, one repo.** Production is `wrangler.jsonc` →
  `thom-website` (bound to `thom-server`); test is `wrangler.test.jsonc` →
  `thom-website-test` (bound to `thom-server-test`). See `CLOUDFLARE.md`.
- **CSP must allow the image and upload hosts.** Listing images are served from
  `https://img.thomhuang.com` (the R2 custom domain for `listing-images`), so it
  must stay in `img-src` in `ThomWeb/public/_headers`; `img-src` also keeps
  `https://*.r2.dev`. Uploads PUT to the R2 S3 host, so that origin must stay in
  `connect-src`. If the R2 account or public domain changes, update both or
  images/uploads break in the browser.
- **Orders API (2026-09-18).** `GET /shop/orders` is paginated:
  `GetShopOrdersAsync({ cursor?, limit?, signal? })` returns
  `{ orders, nextCursor }` (`""` nextCursor means the last page); the admin page
  appends pages via a "Load more" button. `ShopOrder` carries a structured
  shipping address (`shipName`/`shipLine1`/`shipLine2`/`shipCity`/`shipState`/
  `shipPostalCode`/`shipCountry`) plus the legacy `shippingAddress`;
  `Pages/Shop/ShippingAddress.tsx` renders the structured form and falls back.
  Order statuses include `refunded` and `refund_pending` (oversold orders).
- See the `thom-server` `AGENTS.md` for server-side deploy state, secrets, and
  the Windows Smart App Control test workaround.
