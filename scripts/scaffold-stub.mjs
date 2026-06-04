import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

const stubs = [
  { slug: 'broderna-hanssons', title: 'Bröderna Hanssons' },
  { slug: 'coop-matkassar', title: 'Coop Matkassar' },
  { slug: 'coop-frukt', title: 'Coop Frukt' },
  { slug: 'comforta', title: 'Comforta' },
  { slug: 'lars-goran', title: 'Lars-Göran' },
]

const tsconfig = {
  files: [],
  references: [{ path: './tsconfig.app.json' }, { path: './tsconfig.node.json' }],
}

const tsconfigApp = {
  compilerOptions: {
    tsBuildInfoFile: './node_modules/.tmp/tsconfig.app.tsbuildinfo',
    target: 'ES2022',
    useDefineForClassFields: true,
    lib: ['ES2022', 'DOM', 'DOM.Iterable'],
    module: 'ESNext',
    skipLibCheck: true,
    moduleResolution: 'bundler',
    allowImportingTsExtensions: true,
    verbatimModuleSyntax: true,
    moduleDetection: 'force',
    noEmit: true,
    jsx: 'react-jsx',
    strict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noFallthroughCasesInSwitch: true,
    noUncheckedSideEffectImports: true,
  },
  include: ['src'],
}

const tsconfigNode = {
  compilerOptions: {
    tsBuildInfoFile: './node_modules/.tmp/tsconfig.node.tsbuildinfo',
    target: 'ES2023',
    lib: ['ES2023'],
    module: 'ESNext',
    skipLibCheck: true,
    moduleResolution: 'bundler',
    allowImportingTsExtensions: true,
    verbatimModuleSyntax: true,
    moduleDetection: 'force',
    noEmit: true,
    strict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noFallthroughCasesInSwitch: true,
    noUncheckedSideEffectImports: true,
  },
  include: ['vite.config.ts'],
}

const viteConfig = `import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const appDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: process.env.OUT_DIR || path.join(appDir, 'dist'),
    emptyOutDir: true,
  },
})
`

const indexCss = `@import 'tailwindcss';

@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --color-surface: #0f1419;
  --color-surface-elevated: #161b22;
  --color-border: #30363d;
  --color-text: #e6edf3;
  --color-text-muted: #8b949e;
  --color-accent: #58a6ff;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: var(--font-sans);
  background: var(--color-surface);
  color: var(--color-text);
}

a {
  color: var(--color-accent);
}
`

for (const { slug, title } of stubs) {
  const appDir = path.join(root, 'apps', slug)
  fs.mkdirSync(path.join(appDir, 'src'), { recursive: true })

  const pkgName = `@glc-bokingsportal/${slug}`

  fs.writeFileSync(
    path.join(appDir, 'package.json'),
    JSON.stringify(
      {
        name: pkgName,
        private: true,
        version: '0.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'tsc -b && vite build',
          preview: 'vite preview',
        },
        dependencies: {
          react: '^19.1.0',
          'react-dom': '^19.1.0',
        },
        devDependencies: {
          '@tailwindcss/vite': '^4.1.7',
          '@types/react': '^19.1.2',
          '@types/react-dom': '^19.1.2',
          '@vitejs/plugin-react': '^4.4.1',
          tailwindcss: '^4.1.7',
          typescript: '~5.8.3',
          vite: '^6.3.5',
        },
      },
      null,
      2,
    ) + '\n',
  )

  fs.writeFileSync(path.join(appDir, 'vite.config.ts'), viteConfig)
  fs.writeFileSync(path.join(appDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2) + '\n')
  fs.writeFileSync(path.join(appDir, 'tsconfig.app.json'), JSON.stringify(tsconfigApp, null, 2) + '\n')
  fs.writeFileSync(path.join(appDir, 'tsconfig.node.json'), JSON.stringify(tsconfigNode, null, 2) + '\n')

  fs.writeFileSync(
    path.join(appDir, 'index.html'),
    `<!doctype html>
<html lang="sv">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} — GLC Bokingsportal</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
  )

  fs.writeFileSync(path.join(appDir, 'src', 'index.css'), indexCss)
  fs.writeFileSync(path.join(appDir, 'src', 'vite-env.d.ts'), '/// <reference types="vite/client" />\n')
  fs.writeFileSync(
    path.join(appDir, 'src', 'main.tsx'),
    `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`,
  )

  fs.writeFileSync(
    path.join(appDir, 'src', 'App.tsx'),
    `const hubHref = import.meta.env.BASE_URL.replace(/\\/[^/]+\\/$/, '/')

export default function App() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          GLC Bokingsportal
        </p>
        <h1 className="mt-2 text-2xl font-bold">${title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
          Detta verktyg är under utveckling och kommer snart.
        </p>
        <a className="mt-6 inline-block text-sm font-medium hover:underline" href={hubHref}>
          ← Tillbaka till portalen
        </a>
      </div>
    </div>
  )
}
`,
  )

  console.log(`Stub: ${slug}`)
}

console.log('Done.')
