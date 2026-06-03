# Deploy Kåkå CSV till Excel

## GitHub Pages (repo: Excel-KAKA)

1. Settings → Pages → Source: **GitHub Actions**
2. Push to `main` — workflow deploys automatically
3. URL: `https://mrojbro.github.io/Excel-KAKA/`

## Internal server (IIS)

```bash
npm run build
```

Copy the `dist` folder to your web server. Use `https://` — do not open `index.html` directly from disk.

If hosted in a subfolder, set `base` in `vite.config.ts` before building.
