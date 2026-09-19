# thom-website

React app (Vite + TypeScript) for the coffee journal, backed by
[thom-server](https://github.com/thomhuang/thom-server).

## Project structure

The React app lives in `ThomWeb/`; run app commands from that directory. Source
code is under `ThomWeb/src/`. Routes are defined in `src/App.tsx`, entry wiring
in `src/index.tsx`, shared hooks in `src/hooks.tsx`, pages in `src/Pages/`,
reusable UI in `src/Components/`, auth context in `src/Auth/`, API clients in
`src/api/`, and shared copy/constants in `src/Assets/`. Global theme tokens,
font-face declarations, and base styles live in `src/index.css`; font files live
in `src/Fonts/`; component-local styles use CSS Modules such as
`App.module.css`. Static public assets such as documents belong in
`ThomWeb/public/`.

Build and test config live in `ThomWeb/`: `vite.config.ts` (build + Vitest),
`eslint.config.mjs` (flat config), `tsconfig.json`, `index.html` (entry point),
and tests colocated with the code they cover.

Deployment lives at the repo root: `wrangler.jsonc`, `worker/index.js`, and
`package.json` serve `ThomWeb/dist` as static assets and proxy `/api/*` to the
matching `thom-server`/`thom-server-test` Worker. See `CLOUDFLARE.md`.

## Local development

Run app commands from `ThomWeb/`:

```sh
npm install
npm start        # http://localhost:3000, Vite dev server
npm run typecheck
npm run lint     # ESLint, flat config in eslint.config.mjs
npm test         # Vitest watch mode; npx vitest run for CI
```

`ThomWeb/.env.local` is not needed. The API base URL is defined in
`ThomWeb/src/api/config.ts`: `VITE_API_URL` overrides it, otherwise
development uses `http://localhost:4000` and production uses `/api` (same-origin,
proxied by the Worker). `ThomWeb/.env.example` documents the override.

## Testing

Tests use Vitest with React Testing Library in a jsdom environment
(`npm test`, setup in `src/setupTests.ts`). Place tests near the code they
cover and name them like `Component.test.tsx` or `client.test.ts`. Prioritize
route smoke tests, API-client behavior, loading states, empty states, errors,
and responsive desktop/mobile rendering for user-facing changes.

## Build and deploy

From the repo root:

```sh
npm run build    # builds ThomWeb/ into ThomWeb/dist
npx wrangler deploy                          # production
npx wrangler deploy -c wrangler.test.jsonc   # test
```

## Security & config

Keep fetch and service-access logic in `src/api/`; hidden UI is not security.
The only public build-time variable is `VITE_API_URL`; it defaults to `/api` in
production, which the Worker proxies to `thom-server` on the same origin so auth
cookies stay first-party. Update `ThomWeb/.env.example`, `src/api/config.ts`,
and `src/vite-env.d.ts` when adding `VITE_*` variables. `VITE_*` values are
embedded in the bundle and must never contain secrets.

Local `.env*` and `.dev.vars*` files (except the committed `.example` files)
are gitignored. Read the `.example` files for the shape of the config instead.

## Implementation notes (shop)

- **Garment measurements are open-ended.** `GET /shop/items/{id}` returns
  `category` (free-form string) and `measurements: [{ label, valueInches }]`
  (inches, `0 < v ≤ 100`). Any label is allowed; absence is a missing row, not
  a `0`. On PATCH an omitted `measurements` preserves the stored set and an
  empty array clears it. `GET /shop/items` summaries include neither. See the
  `thom-server` docs for the full spec.

  UI: the admin form (`ShopItemForm.tsx`) has a repeatable label/value editor
  with per-category quick-add chips from `measurements.ts`; the listing detail
  page (`ShopItem.tsx`) renders the rows in a table with an in/cm toggle.
  Conversion lives in `formatMeasurement` (`format.ts`): `inches * 2.54`, one
  decimal. The chosen unit persists in `localStorage` under
  `shop-measurement-unit`; default inches.
- **CSP must allow the image and upload hosts.** Listing images are served from
  `https://img.thomhuang.com` (the R2 custom domain for `listing-images`), so it
  must stay in `img-src` in `ThomWeb/public/_headers`; `img-src` also keeps
  `https://*.r2.dev`. Uploads PUT to the R2 S3 host, so that origin must stay in
  `connect-src`. If the R2 account or public domain changes, update both or
  images/uploads break in the browser.
- **Orders API.** `GET /shop/orders` is paginated:
  `GetShopOrdersAsync({ cursor?, limit?, signal? })` returns
  `{ orders, nextCursor }` (`""` nextCursor means the last page); the admin page
  appends pages via a "Load more" button. `ShopOrder` carries a structured
  shipping address (`shipName`/`shipLine1`/`shipLine2`/`shipCity`/`shipState`/
  `shipPostalCode`/`shipCountry`) plus the legacy `shippingAddress`;
  `ShippingAddress.tsx` renders the structured form and falls back. The public
  confirmation lookup (`GET /shop/orders/{sessionId}` → `PublicShopOrder`)
  returns **no personal data**, so `OrderConfirmation.tsx` shows only
  status/total/lines. Order statuses include `refunded` and `refund_pending`
  (oversold orders).
- **Buyer order-view page.** The confirmation email links to `PAGES.OrderView`
  (`/shop/order/view?token=...`), served by `Pages/Shop/OrderView.tsx`. It calls
  `GetShopOrderByTokenAsync(token)`, which hits `GET /shop/orders/view/{token}`
  and returns the **full** `ShopOrder` (customer + shipping) because the emailed
  token is the credential — unlike the session-keyed `PublicShopOrder`
  confirmation lookup. Treat the token as a secret: do not log or forward the URL.

See `CLOUDFLARE.md` for deploy specifics and `checklist.md` for open work.
