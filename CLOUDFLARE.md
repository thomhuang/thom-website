# Deploying thom-website to Cloudflare

The React app itself is unchanged. Deployment is now Cloudflare Workers static
assets with a small `/api` proxy:

- `wrangler.jsonc` serves the CRA build from `ThomWeb/build` with SPA fallback
  (`not_found_handling: single-page-application`), so React Router routes like
  `/coffee/entry/:id` work on refresh.
- `worker/index.js` handles `/api/*`, strips the prefix, and forwards to the
  `thom-server` Worker over a **service binding**. Because the browser only ever
  talks to the website origin, the auth cookie is first-party (avoids
  third-party-cookie blocking on `*.workers.dev`).
- `ThomWeb/.env.production` sets `REACT_APP_API_URL=/api` for production builds.

Local development is unchanged: `cd ThomWeb && npm start` uses `ThomWeb/.env.local`
and talks to `http://localhost:4000` directly.

## Environments

| Environment | Config | Worker | API binding | URL |
|---|---|---|---|---|
| production | `wrangler.jsonc` | `thom-website` | `thom-server` | `https://www.thomhuang.com` (route `www.thomhuang.com`) |
| test | `wrangler.test.jsonc` | `thom-website-test` | `thom-server-test` | `https://thom-website-test.thomhuang.workers.dev` |

The test Worker has no `routes`, so it stays on its `workers.dev` hostname, and
binds `thom-server-test`. Deploy the matching server Worker first.

## Domains and listing images

The site is served from `www.thomhuang.com`. The apex `thomhuang.com` has a
proxied placeholder record and a zone Redirect Rule that 301s it to
`https://www.thomhuang.com` (path and query preserved).

Listing images are served from `https://img.thomhuang.com`, the R2 custom domain
for the `listing-images` bucket. The server composes image URLs from its
`R2_PUBLIC_BASE_URL` var at read time, so changing that host updates every
listing without a data migration. The website CSP (`ThomWeb/public/_headers`)
must keep that host in `img-src`.

## Prerequisites

- Node.js 22+ (`wrangler` requires it).
- `npx wrangler login` once.
- Deploy the matching **thom-server** Worker first (`wrangler.jsonc` for
  production, `wrangler.test.jsonc` for test) so the service binding target
  exists.

## Deploy

Locally:

```sh
npm install
npm run build     # builds ThomWeb
npx wrangler deploy                          # production
npx wrangler deploy -c wrangler.test.jsonc   # test (thom-website-test)
```

Or connect the repository under **Workers & Pages → thom-website → Settings →
Builds** and use:

- Build command: `npm install && npm run build`
- Deploy command: `npx wrangler deploy`

Workers Builds deploys production only. The test Worker is deployed manually with
`-c wrangler.test.jsonc`.

## Wire the two together

1. Deploy and note the website URL, e.g.
   `https://thom-website-test.thomhuang.workers.dev` (test) or
   `https://www.thomhuang.com` (production).
2. In the matching `thom-server` config file, set `CLIENT_ORIGIN_URLS` to that
   URL and redeploy `thom-server`. This origin allow-list is what the Go server
   checks for mutating requests. (Production uses `https://www.thomhuang.com`;
   test uses `https://thom-website-test.thomhuang.workers.dev`.)
3. Visit the site and sign in; requests go to `/api/...` on the website origin and
   are proxied to the container.

## Local development

```sh
cd ThomWeb
npm start                 # http://localhost:3000, API at REACT_APP_API_URL
npm run typecheck
npm run lint
```
