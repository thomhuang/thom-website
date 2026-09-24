# Checklist

Remaining work. Tick items off as they land; add new ones as they come up.

## Deploy

- [x] Deploy production: `npx wrangler deploy`
- [x] Deploy test: `npx wrangler deploy -c wrangler.test.jsonc`
- [x] Verify hard refreshes on deep routes (`/coffee`, `/shop`, `/shop/item/:id`, `/policies`) — SPA fallback
- [ ] Verify listing images load from `img.thomhuang.com` and admin uploads work under the deployed CSP
- [ ] Deploy page-specific titles, `robots.txt`/`llms.txt`, and the public `/coffee/:id` page; verify titles update on navigation and a brew card links to its page
- [ ] Deploy the blog feature (`/blog`, `/blog/post/:id`, `/blog/entry`) and verify creating/editing/viewing against test, then prod

## Code cleanup (from the audit)

- [x] Remove unused exports `categoryLabel` and `CATEGORY_LABELS` in `src/Pages/Shop/measurements.ts`

## Code cleanup (useEffect audit)

- [x] Stage 1: remove the derived-state effects in `Shop.tsx` — reset the page in
      the filter/sort change handlers and clamp it during render (2026-09-23)
- [x] Stage 2: extract a shared `useAsync` hook and migrate the read-only fetch
      effects (Blog, BlogPost, Shop, ShopItem, ShopOrders, OrderView,
      OrderConfirmation, Coffee, CoffeeEntryDetail) (2026-09-23)
- [x] Stage 3: migrate the plain suggestion loads in `BlogPostForm` (categories)
      and `ShopItemForm` (brands) to `useAsync` (2026-09-23)
- [ ] Stage 3 (deferred): `useCoffeeLookup` merges fetched options into local
      state and the form item/post loads seed editable drafts, so `useAsync` does
      not model them — left as effects (a keyed remount is the alternative)
- [ ] Stage 4 (optional): React Router 7 loaders pilot on one read-only route

## Shop admin (server parity)

- [x] Handle the new `expired` order status from stock reservation:
      `ShopOrderStatus` type, admin orders list badge, and buyer confirmation
      copy (2026-09-19)

## Local env

- [ ] If `.env.local` sets `REACT_APP_API_URL`, rename it to `VITE_API_URL` (Vite ignores the old prefix)

## Process

- [ ] Create the shared `BOARD.md` that AGENTS.md references next to the repos, or remove that section
