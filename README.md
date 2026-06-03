# GLC Bokingsportal

Monorepo for GLC booking tools. The landing page links to each customer-specific app.

## Structure

```text
apps/
  portal/              Hub — booking cards (start here)
  kaka/                Kåkå CSV → Excel transform
  ewerman/             Ewerman Excel transform
  broderna-hanssons/   Kommer snart
  coop-matkassar/      Kommer snart
  coop-distribution/   Kommer snart
  coop-frukt/          Kommer snart
  comforta/            Kommer snart
  lars-goran/          Kommer snart
```

## Run locally

```bash
npm install
npm run dev              # build + serve hub on :5173 (recommended — all links work)
npm run dev -- --skip-build   # reuse dist/ after first build
npm run dev:vite         # live reload on :5173/:5174/:5175 (Öppna opens those ports)
npm run dev:portal
npm run dev:kaka
npm run dev:ewerman
```

Build everything into one `dist/` folder (GitHub Pages or IIS):

```bash
npm run build
```

Full hub locally:

```bash
npm run preview
```

Open **http://localhost:4173/**

If `npm run dev` says port 5173 is in use and picks another port, stop old servers (Ctrl+C in other terminals) or run:

```bash
npm run ports:free
npm run dev
```

Then use **http://localhost:5173/** only.

> `npm run preview` rebuilds with base path `/` for localhost.  
> `npm run build` uses `/glc-bokingsportal/` for GitHub Pages (rename repo to match).

## Deploy

See [DEPLOY.md](./DEPLOY.md).
