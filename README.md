# GLC Bokingsportal

Monorepo for GLC booking tools. One hub links to each customer app (Kåkå, Ewerman, Lars-Göran, and more).

## Live site (after GitHub Pages is enabled)

**https://mrojbro.github.io/glc-bokingsportal/**

| URL | App |
|-----|-----|
| `/` | Portal (start here) |
| `/kaka/` | Kåkå |
| `/ewerman/` | Ewerman |
| `/lars-goran/` | Lars-Göran |
| `/coop-matkassar/` | Coop Matkassar |
| `/coop-frukt/` | Coop Frukt |

The GitHub repo page (`github.com/mrojbro/glc-bokingsportal`) only shows this README — not the booking tools.

Enable Pages: **Settings → Pages → Source: GitHub Actions**, then re-run the deploy workflow. See [DEPLOY.md](./DEPLOY.md).

## Structure

```text
apps/
  portal/              Hub — booking cards (start here)
  kaka/                Kåkå CSV → Excel transform
  ewerman/             Ewerman Excel transform
  lars-goran/          Lars-Göran (PrimeLog export)
  coop-matkassar/      Coop Matkassar (ruttexport)
  coop-frukt/          Coop Frukt (bokning + ekipage)
  broderna-hanssons/   Kommer snart
  comforta/            Kommer snart
```

## Run locally

```bash
npm install
npm run dev              # build + serve hub on :5173 (recommended)
npm run dev:fast         # reuse dist/ after first build
npm run dev:vite         # live reload (separate ports per app)
npm run dev:portal
npm run dev:kaka
npm run dev:ewerman
npm run dev:lars-goran
npm run dev:coop-matkassar
npm run dev:coop-frukt
```

Build for GitHub Pages / IIS:

```bash
npm run build
```

Full hub locally:

```bash
npm run preview
```

Open **http://localhost:4173/**

If port 5173 is busy:

```bash
npm run ports:free
npm run dev
```

## Deploy

See [DEPLOY.md](./DEPLOY.md).
