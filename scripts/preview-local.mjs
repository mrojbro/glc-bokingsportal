import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

console.log('Building for local preview (base path /)…\n')

execSync('node scripts/build-all.mjs', {
  cwd: root,
  env: { ...process.env, VITE_BASE_PATH: '/' },
  stdio: 'inherit',
})

console.log('\nServing dist/ at http://localhost:4173/\n')

execSync('npx serve dist -l 4173', { cwd: root, stdio: 'inherit' })
