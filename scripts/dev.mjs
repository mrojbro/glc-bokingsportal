import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const workspaces = [
  '@glc-bokingsportal/portal',
  '@glc-bokingsportal/kaka',
  '@glc-bokingsportal/ewerman',
  '@glc-bokingsportal/lars-goran',
  '@glc-bokingsportal/coop-matkassar',
  '@glc-bokingsportal/coop-frukt',
  '@glc-bokingsportal/coop-tomgods',
]

console.log('Starting GLC Bokingsportal (portal + ready tools)…\n')
console.log('Hub:            http://localhost:5173/')
console.log('Kåkå:           http://localhost:5174/kaka/')
console.log('Ewerman:        http://localhost:5175/ewerman/')
console.log('Lars-Göran:     http://localhost:5176/lars-goran/')
console.log('Coop Matkassar: http://localhost:5177/coop-matkassar/')
console.log('Coop Frukt:      http://localhost:5178/coop-frukt/')
console.log('Coop Tomgods:    http://localhost:5179/coop-tomgods/')
console.log('(Hub card links use these ports in dev:vite mode.)\n')

const hubDevEnv = { VITE_HUB_DEV: '1' }

const children = workspaces.map((ws) => {
  const env = { ...process.env }
  if (ws !== '@glc-bokingsportal/portal') {
    Object.assign(env, hubDevEnv)
  }

  const child = spawn(npmCmd, ['run', 'dev', '-w', ws], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env,
  })
  child.on('exit', (code) => {
    if (code && code !== 0) process.exit(code)
  })
  return child
})

function shutdown() {
  for (const child of children) child.kill('SIGTERM')
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
