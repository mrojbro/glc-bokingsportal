import { execSync, spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const skipBuild = process.argv.includes('--skip-build')
const port = process.env.PORT || '5173'

console.log(`Checking port ${port}…`)
execSync(`node "${path.join(root, 'scripts', 'free-ports.mjs')}" ${port}`, {
  cwd: root,
  stdio: 'inherit',
})

if (!skipBuild) {
  console.log('Building all apps for local hub (base /)…\n')
  execSync('node scripts/build-all.mjs', {
    cwd: root,
    env: { ...process.env, VITE_BASE_PATH: '/' },
    stdio: 'inherit',
  })
} else {
  console.log('Skipping build (--skip-build). Using existing dist/\n')
}

console.log(`Serving hub at http://localhost:${port}/\n`)
console.log('Sub-apps: /kaka/  /ewerman/  /lars-goran/  /coop-matkassar/  /coop-frukt/  /coop-tomgods/  (and kommer-snart stubs)\n')

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const child = spawn(npx, ['serve', 'dist', '-l', port], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

function shutdown() {
  child.kill('SIGTERM')
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
