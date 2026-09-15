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

## Prerequisites

- Node.js 22+ (`wrangler` requires it).
- `npx wrangler login` once.
- Deploy **thom-server first** so the `thom-server` Worker exists as a service
  binding target.

## Deploy

Locally:

```sh
npm install
npm run build     # builds ThomWeb
npx wrangler deploy
```

Or connect the repository under **Workers & Pages → thom-website → Settings →
Builds** and use:

- Build command: `npm install && npm run build`
- Deploy command: `npx wrangler deploy`

## Wire the two together

1. Deploy and note the website URL, e.g.
   `https://thom-website.your-subdomain.workers.dev`.
2. In `thom-server/wrangler.jsonc`, set `CLIENT_ORIGIN_URLS` to that URL and
   redeploy `thom-server`. This origin allow-list is what the Go server checks for
   mutating requests.
3. Visit the site and sign in; requests go to `/api/...` on the website origin and
   are proxied to the container.

## Local development

```sh
cd ThomWeb
npm start                 # http://localhost:3000, API at REACT_APP_API_URL
npm run typecheck
npm run lint
```
