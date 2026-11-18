---
name: website-domains
description: >-
  Frontend domain conventions and non-obvious UI behaviors in thom-website for
  Blog, Shop, and Coffee pages (markdown figure rows, R2 image compression and
  paste upload, garment measurement unit persistence, public vs magic-link
  order privacy, and responsive coffee pagination). Load this skill when
  modifying src/Pages/Blog, src/Pages/Shop, src/Pages/Coffee, or src/api/.
---

# Website Domain Conventions (`thom-website`)

## Blog (`src/Pages/Blog/`, `src/api/Blog/`)

- **Markdown rendering.** Post bodies render through `MarkdownBody.tsx` using
  `react-markdown` (raw HTML is **not** rendered); element styles live in
  `Blog.module.css` under `.body`.
- **Image rows & captions.** A paragraph containing *only* images renders as a
  wrapping flex `<figure>` row: consecutive images in one paragraph sit side by
  side, each image's alt text becomes its `<figcaption>` (empty alt = no
  caption), and a lone image becomes a full-width figure. Images mixed with
  prose stay inline.
- **UTC timestamps.** Server dates arrive as UTC `YYYY-MM-DD HH:MM:SS`;
  `formatBlogDate` (`Pages/Blog/format.ts`) normalizes them before parsing so
  browsers interpret them as UTC.
- **Pasted images & draft autosave.** Pasting an image in `BlogPostForm.tsx`
  prepares bytes via `Pages/Shop/imageUpload.ts`, presigns via
  `POST /blog/images/presign`, PUTs directly to R2, and inserts `![](url)` at
  the cursor. The new-post form (`!postId`) restores from `GET /blog/draft` on
  mount, debounces `PUT /blog/draft` while typing, and calls
  `DELETE /blog/draft` after a successful create.

## Shop (`src/Pages/Shop/`, `src/api/Shop/`)

- **Client-side image preparation (`imageUpload.ts`).** Downscales to 2000px and
  re-encodes to WebP when smaller than the source; GIFs pass through untouched
  to preserve animation. Limits: 50 MB source ceiling (guards decode hangs),
  10 MB prepared-bytes limit. Because re-encoding changes MIME type, always
  presign using the **prepared** `Content-Type`.
- **Open-ended garment measurements.** `GET /shop/items` summaries include
  `category` (for client-side filtering) but omit `measurements`;
  `GET /shop/items/{id}` includes `measurements: [{ label, valueInches }]`.
  `ShopItemForm.tsx` provides repeatable label/value inputs with per-category
  quick-add chips (`measurements.ts`). On `PATCH`, omitted `measurements`
  preserves stored rows and `[]` clears them. `ShopItem.tsx` toggles `in`/`cm`
  via `formatMeasurement` (`inches * 2.54`, 1 decimal), persisted in
  `localStorage` under `shop-measurement-unit` (default `in`).
- **Orders & PII split.**
  - Admin list (`ShopOrders.tsx` → `GET /shop/orders`): keyset-paginated
    `{ orders, nextCursor }` (`""` = end) with a "Load more" button;
    `ShippingAddress.tsx` renders structured `ship*` fields and falls back to
    legacy `shippingAddress`.
  - Public confirmation (`OrderConfirmation.tsx` → `GET /shop/orders/{sessionId}`):
    returns `PublicShopOrder` (**no PII** — status, totals, lines only). Polls
    every 3s while `status === 'pending'` (capped ~2 min) until the webhook
    settles.
  - Buyer magic link (`OrderView.tsx`, `/shop/order/view?token=...` →
    `GET /shop/orders/view/{token}`): returns full `ShopOrder` (with customer &
    shipping PII) because the emailed token is the credential. Treat the token
    as a secret — never log or forward it.

## Coffee (`src/Pages/Coffee/`, `src/api/Coffee/`)

- **Three-level responsive pagination (`coffeePagination.ts`).** Paginates
  independently at roasters (`Coffee.tsx`), coffees-within-roaster
  (`CoffeeRoasterSection.tsx`, `CoffeePager.tsx`), and brews-within-coffee
  (`CoffeeGroupSection.tsx`, compact arrow nav `CoffeeBrewPager.tsx`):
  - Roasters & coffees: `5` desktop (`>1024px`), `4` tablet (`641–1024px`),
    `3` mobile (`≤640px`).
  - Brew cards: `3` desktop, `2` tablet, `2` mobile.
  - Filter changes reset page state in the change handler and clamp during
    render.
- **Lookups & profiles.** Roasters, grinders, and brew profiles
  (`/coffee/profiles`, `CoffeeProfileManager.tsx`) back entry creation/editing
  (`CoffeeEntry.tsx`); `useCoffeeLookup.ts` intentionally uses an effect because
  it merges fetched options with locally created entries.
