# thom-website

React app (Vite + TypeScript) for the coffee journal, backed by
[thom-server](https://github.com/thomhuang/thom-server).

## Deployment

The site is deployed to Cloudflare as static Worker assets. A small Worker serves
`ThomWeb/dist` with SPA fallback and proxies `/api/*` to the `thom-server` Worker
over a service binding, so auth cookies stay first-party. Two environments deploy
from this repository: production (`wrangler.jsonc` → `thom-website`, bound to
`thom-server`) and test (`wrangler.test.jsonc` → `thom-website-test`, bound to
`thom-server-test`). See [CLOUDFLARE.md](CLOUDFLARE.md).

## Local development

Run app commands from `ThomWeb/`:

```sh
npm install
npm start        # http://localhost:3000
npm run typecheck
npm run lint
npm test
```

`ThomWeb/.env.local` is not needed. The API base URL is defined in
`ThomWeb/src/api/config.ts`: `VITE_API_URL` overrides it, otherwise
development uses `http://localhost:4000` and production uses `/api` (same-origin,
proxied by the Worker). `ThomWeb/.env.example` documents the override.

## Build and deploy

From the repo root:

```sh
npm run build    # builds ThomWeb/ into ThomWeb/dist
npx wrangler deploy                          # production
npx wrangler deploy -c wrangler.test.jsonc   # test
```
