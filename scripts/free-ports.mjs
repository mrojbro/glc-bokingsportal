import { execSync } from 'node:child_process'

const ports = (process.argv[2] ?? '5173,5174,5175,5176,5177,5178,5179')
  .split(',')
  .map((p) => Number.parseInt(p.trim(), 10))
  .filter((p) => Number.isFinite(p))

function portInUse(port) {
  if (process.platform === 'win32') {
    const script = `(Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Measure-Object).Count -gt 0`
    const out = execSync(`powershell -NoProfile -Command "${script}"`, { encoding: 'utf8' }).trim()
    return out === 'True'
  }
  try {
    execSync(`lsof -i :${port} -sTCP:LISTEN`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function freePort(port) {
  if (!portInUse(port)) return false

  if (process.platform === 'win32') {
    const script =
      `$procIds = Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique; foreach ($procId in $procIds) { if ($procId) { Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue } }`
    execSync(`powershell -NoProfile -Command "${script}"`, { stdio: 'ignore' })
  } else {
    execSync(`lsof -ti :${port} | xargs kill -9 2>/dev/null || true`, { stdio: 'ignore', shell: true })
  }

  return true
}

let freed = 0
for (const port of ports) {
  if (freePort(port)) {
    console.log(`Freed port ${port} (stopped old dev server).`)
    freed++
  }
}

const blocked = ports.filter((p) => portInUse(p))
if (blocked.length) {
  console.error(`\nStill in use: ${blocked.join(', ')}`)
  console.error('Close other terminals (Ctrl+C) or run: npm run ports:free')
  process.exit(1)
}

if (!freed) {
  console.log(`Ports ${ports.join(', ')} are free.`)
}
