# Deploy GLC Bokingsportal

## GitHub Pages

1. Create a repo named `glc-bokingsportal` (matches the default base path).
2. Settings → Pages → Source: **GitHub Actions**
3. Push to `main` — workflow builds all apps into `dist/`.
4. URL: `https://<user>.github.io/glc-bokingsportal/`

Sub-apps:

- `/kaka/`
- `/ewerman/`
- …

## Local full hub

```bash
npm install
npm run preview
```

Open http://localhost:4173/
