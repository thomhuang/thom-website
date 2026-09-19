# Checklist

Remaining work. Tick items off as they land; add new ones as they come up.

## Deploy (the Vite build is not live yet)

- [ ] Deploy production: `npx wrangler deploy`
- [ ] Deploy test: `npx wrangler deploy -c wrangler.test.jsonc`
- [ ] Verify hard refreshes on deep routes (`/coffee`, `/shop`, `/shop/item/:id`, `/policies`) — SPA fallback
- [ ] Verify listing images load from `img.thomhuang.com` and admin uploads work under the deployed CSP

## Code cleanup (from the audit)

- [x] Remove unused exports `categoryLabel` and `CATEGORY_LABELS` in `ThomWeb/src/Pages/Shop/measurements.ts`

## Shop admin (server parity)

- [x] Handle the new `expired` order status from stock reservation:
      `ShopOrderStatus` type, admin orders list badge, and buyer confirmation
      copy (2026-09-19)

## Local env

- [ ] If `ThomWeb/.env.local` sets `REACT_APP_API_URL`, rename it to `VITE_API_URL` (Vite ignores the old prefix)

## Process

- [ ] Create the shared `BOARD.md` that AGENTS.md references next to the repos, or remove that section
