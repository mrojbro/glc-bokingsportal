import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const distRoot = path.join(root, 'dist')

const repoBase = normalizeBase(process.env.VITE_BASE_PATH || '/glc-bokingsportal/')

const apps = [
  { name: 'portal', segment: '' },
  { name: 'kaka', segment: 'kaka' },
  { name: 'ewerman', segment: 'ewerman' },
  { name: 'broderna-hanssons', segment: 'broderna-hanssons' },
  { name: 'coop-matkassar', segment: 'coop-matkassar' },
  { name: 'coop-frukt', segment: 'coop-frukt' },
  { name: 'coop-tomgods', segment: 'coop-tomgods' },
  { name: 'comforta', segment: 'comforta' },
  { name: 'lars-goran', segment: 'lars-goran' },
]

fs.rmSync(distRoot, { recursive: true, force: true })
fs.mkdirSync(distRoot, { recursive: true })

for (const app of apps) {
  const appBase = app.segment ? `${repoBase}${app.segment}/` : repoBase
  const outDir = app.segment ? path.join(distRoot, app.segment) : distRoot

  console.log(`\nBuilding ${app.name} → ${outDir} (base: ${appBase})`)

  execSync('npm run build', {
    cwd: path.join(root, 'apps', app.name),
    env: {
      ...process.env,
      VITE_BASE_PATH: appBase,
      OUT_DIR: outDir,
    },
    stdio: 'inherit',
  })
}

// Prevent GitHub Pages from running Jekyll on the deployed artifact
fs.writeFileSync(path.join(distRoot, '.nojekyll'), '')

const indexHtml = fs.readFileSync(path.join(distRoot, 'index.html'), 'utf8')
if (!indexHtml.includes('id="root"')) {
  console.error('dist/index.html does not look like the portal app. Check the portal build.')
  process.exit(1)
}

console.log('\nAll apps built into dist/')

function normalizeBase(value) {
  return value.endsWith('/') ? value : `${value}/`
}
