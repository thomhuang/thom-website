# thom-website

React app (Create React App) for the coffee journal, backed by
[thom-server](https://github.com/thomhuang/thom-server).

## Deployment

The site is deployed to Cloudflare as static Worker assets. A small Worker serves
`ThomWeb/build` with SPA fallback and proxies `/api/*` to the `thom-server` Worker
over a service binding, so auth cookies stay first-party. See
[CLOUDFLARE.md](CLOUDFLARE.md).

## Local development

Run app commands from `ThomWeb/`:

```sh
npm install
npm start        # http://localhost:3000
npm run typecheck
npm run lint
npm test
```

`ThomWeb/.env.local` sets `REACT_APP_API_URL` to the local API
(`http://localhost:4000`). Production builds use `ThomWeb/.env.production`, which
sets it to `/api`.

## Build and deploy

From the repo root:

```sh
npm run build    # builds ThomWeb/ into ThomWeb/build
npx wrangler deploy
```
