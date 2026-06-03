# Deploy GLC Bokingsportal

## GitHub Pages

1. Create a repo named `glc-bokingsportal` (matches the default base path).
2. **Settings → Pages → Build and deployment → Source:** choose **GitHub Actions** only.
   - If it says the site is published from branch `main` / folder `/ (root)`, that is wrong — it will show the README, not the app.
   - Turn off “Deploy from a branch” and use **GitHub Actions** instead.
3. Push to `main` — workflow builds all apps into `dist/` and deploys that folder.
4. **Actions** → **Deploy to GitHub Pages** → wait for green ✓
5. Open: `https://<user>.github.io/glc-bokingsportal/` (dark hub with clickable cards — not the README text)

### Site shows README?

Pages is serving the repository root, not the built `dist/` artifact. Fix **Source: GitHub Actions**, re-run the deploy workflow, then hard-refresh the browser (Ctrl+F5).

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
